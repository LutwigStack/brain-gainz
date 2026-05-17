import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const manifestPath = resolve(repoRoot, 'assets/game/asset-manifest.json');
const ignoredReviewPathPrefix = 'output/generated-assets/';
const allowedStatuses = new Set(['planned', 'generated', 'selected', 'accepted', 'rejected']);
const allowedFamilies = new Set([
  'campaign',
  'specialization',
  'race',
  'city',
  'opponent',
  'task',
  'mastery',
  'recovery',
  'map',
  'race_portrait',
  'race_emblem',
  'city_district_tile',
  'specialization_icon',
  'mastery_icon',
  'node_type_icon',
  'opponent_portrait',
  'campaign_card',
  'panel_texture',
]);

const readManifest = () => JSON.parse(readFileSync(manifestPath, 'utf8'));
const assertPortableRelativePath = (assetPath, assetId, fieldName) => {
  assert.equal(typeof assetPath, 'string', `${assetId} ${fieldName} must contain strings`);
  assert.equal(assetPath.length > 0, true, `${assetId} ${fieldName} must not contain empty paths`);
  assert.equal(assetPath.includes('\\'), false, `${assetId} ${fieldName} must use forward slashes: ${assetPath}`);
  assert.equal(assetPath.startsWith('/') || /^[A-Za-z]:/.test(assetPath), false, `${assetId} ${fieldName} must be repo-relative: ${assetPath}`);
};
const assertReviewMetadataPaths = (paths, assetId, fieldName) => {
  for (const assetPath of paths) {
    assertPortableRelativePath(assetPath, assetId, fieldName);
    assert.equal(
      assetPath.startsWith(ignoredReviewPathPrefix),
      true,
      `${assetId} ${fieldName} must point at ignored generated review artifacts: ${assetPath}`,
    );
    assert.match(
      assetPath,
      /\.(md|png|webp)$/i,
      `${assetId} ${fieldName} must reference review metadata or raster candidates: ${assetPath}`,
    );
  }
};
const assertExistingPaths = (paths, assetId, fieldName) => {
  for (const assetPath of paths) {
    assertPortableRelativePath(assetPath, assetId, fieldName);
    assert.equal(
      existsSync(resolve(repoRoot, assetPath)),
      true,
      `${assetId} ${fieldName} file is missing: ${assetPath}`,
    );
  }
};

test('game asset manifest entries are prompt-first and reviewable', () => {
  const manifest = readManifest();
  assert.equal(manifest.version, 1);
  assert.ok(existsSync(resolve(repoRoot, manifest.art_direction_reference)));
  assert.ok(existsSync(resolve(repoRoot, 'assets/game/visual-style-guide.md')));
  assert.ok(Array.isArray(manifest.assets));
  assert.ok(manifest.assets.length >= 4);

  const ids = new Set();
  for (const asset of manifest.assets) {
    assert.equal(typeof asset.asset_id, 'string');
    assert.equal(ids.has(asset.asset_id), false, `duplicate asset id: ${asset.asset_id}`);
    ids.add(asset.asset_id);

    assert.ok(allowedFamilies.has(asset.family), `unknown family: ${asset.family}`);
    assert.equal(typeof asset.usage_surface, 'string');
    assert.equal(typeof asset.ui_slot, 'string');
    assert.equal(typeof asset.alt, 'string', `${asset.asset_id} missing alt text`);
    assert.equal(typeof asset.fallback, 'string', `${asset.asset_id} missing fallback metadata`);
    assert.ok(Array.isArray(asset.target_slots), `${asset.asset_id} missing target slot list`);
    assert.ok(Number(asset.target_width) > 0);
    assert.ok(Number(asset.target_height) > 0);
    assert.ok(['png', 'svg', 'webp'].includes(asset.format));
    assert.equal(typeof asset.transparent_background, 'boolean');
    assert.ok(allowedStatuses.has(asset.status), `unknown status: ${asset.status}`);

    assertExistingPaths([asset.source_prompt_path], asset.asset_id, 'source_prompt_path');
    assert.match(asset.source_prompt_path, /\.md$/i, `${asset.asset_id} source_prompt_path must be tracked markdown provenance`);
    assert.ok(Array.isArray(asset.raw_variant_paths));
    assert.ok(asset.ui_check, `${asset.asset_id} missing UI check metadata`);
    assert.equal(typeof asset.ui_check.component, 'string');
    assert.ok(Number(asset.ui_check.display_width) > 0);
    assert.ok(Number(asset.ui_check.display_height) > 0);

    if (asset.status !== 'planned') {
      assert.ok(
        asset.raw_variant_paths.length >= 2 && asset.raw_variant_paths.length <= 4,
        `${asset.asset_id} must keep 2-4 reviewable raw variants once generated`,
      );
      assertReviewMetadataPaths(asset.raw_variant_paths, asset.asset_id, 'raw_variant_paths');
    }

    if (asset.status === 'generated') {
      assert.equal(asset.selected_variant_path, null, `${asset.asset_id} generated before selection should not select an asset`);
    }

    if (asset.status === 'selected' || asset.status === 'accepted') {
      assert.ok(asset.selected_variant_path, `${asset.asset_id} ${asset.status} without selected asset`);
      assertExistingPaths([asset.selected_variant_path], asset.asset_id, 'selected_variant_path');
    }
  }
});

test('planned image assets do not pretend to have generated variants', () => {
  const manifest = readManifest();
  for (const asset of manifest.assets.filter((entry) => entry.status === 'planned')) {
    assert.deepEqual(asset.raw_variant_paths, []);
    assert.equal(asset.selected_variant_path, null);
  }
});
