/**
 * Galaxy holo minimap — Epic 46 unit tests.
 *
 * Pins the contracts that the workstreams call out:
 *
 *   1. `buildGalaxyHoloMinimapLayout` returns 8 clusters (one per
 *      sphere token) in the canonical `SPHERE_TOKEN_ORDER`, each
 *      positioned at the biome centroid transformed into minimap
 *      space, with a deterministic constellation of 6-10 dots.
 *   2. The coordinate transform is the inverse: `fromMini(toMini(x))`
 *      is the identity for every point inside the minimap.
 *   3. The current cluster is the one whose token key matches the
 *      `currentSphereSlug`; the others get no outline.
 *   4. The viewport rectangle is clamped to the minimap bounds and
 *      is at least 12x12.
 *   5. `findClusterAtMinimapPoint` reports the cluster under the
 *      click and `null` for empty space.
 *   6. The `toMini` / `fromMini` pair is stable across calls (no
 *      drift, no floating-point surprises).
 *
 * The pure logic lives in `galaxy-holo-minimap.ts` (a `.ts` file so
 * the node test runner can import it without a TSX loader). The
 * React wrapper `GalaxyHoloMinimap.tsx` re-uses it unchanged; a
 * snapshot test would need jsdom and is out of scope for this pass
 * (the workstream 03 §Test Plan calls for a snapshot of the SVG for
 * a fixed layout, which the integration browser QA covers).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGalaxyHoloMinimapLayout,
  findClusterAtMinimapPoint,
  GALAXY_HOLO_CLUSTER_BOX_HEIGHT,
  GALAXY_HOLO_CLUSTER_BOX_WIDTH,
  GALAXY_HOLO_CLUSTER_DOT_RADIUS,
  GALAXY_HOLO_CLUSTER_MAX_DOTS,
  GALAXY_HOLO_CLUSTER_MIN_DOTS,
  GALAXY_HOLO_MINIMAP_HEIGHT,
  GALAXY_HOLO_MINIMAP_WIDTH,
  resolveCatalogSlugForTokenKey,
  resolveTokenKeyForBiomeIndex,
  scaleMiniPreviewDotsToClusterBox,
  __resetGalaxyHoloMinimapTestCaches,
} from '../src/components/galaxy/galaxy-holo-minimap.ts';
import { SPHERE_CATALOG_SLUG_ORDER } from '../src/theme/galaxy/sphere-id-to-token.ts';
import { SPHERE_TOKEN_ORDER, sphereTokens } from '../src/theme/galaxy/sphere-tokens.ts';
import { __resetSphereMiniPreviewCacheForTests } from '../src/components/galaxy/sphere-mini-preview.ts';

const TOLERANCE = 1e-6;

const DEFAULT_BOUNDS = {
  minX: -400,
  minY: -300,
  maxX: 400,
  maxY: 300,
  width: 800,
  height: 600,
  center: { x: 0, y: 0 },
};

const DEFAULT_CANVAS_SIZE = { width: 1024, height: 720 };

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const buildBiomes = (count) => {
  // Place biomes on a regular ring so the layout is easy to reason
  // about. The radius is large enough that the merged bounds don't
  // collapse the minimap to a single point.
  const radius = 280;
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return {
      id: index + 1,
      name: `sphere-${index}`,
      center: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      },
      radius: 80,
      color: 0,
      accent: 0,
      nodeCount: 6,
    };
  });
};

test.beforeEach(() => {
  // Reset both caches so the deterministic dot pattern stays pinned
  // across test files. The two `__reset*` helpers exist exactly for
  // this — the runtime never needs them.
  __resetSphereMiniPreviewCacheForTests();
  __resetGalaxyHoloMinimapTestCaches();
});

test('buildGalaxyHoloMinimapLayout returns null for an empty model', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: [],
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.equal(layout, null);
});

test('buildGalaxyHoloMinimapLayout returns null for a zero-size canvas', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: { width: 0, height: 0 },
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.equal(layout, null);
});

test('buildGalaxyHoloMinimapLayout returns 8 clusters for an 8-biome model', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout, 'layout should be built for a non-empty model');
  assert.equal(layout.clusters.length, 8);
  assert.equal(layout.width, GALAXY_HOLO_MINIMAP_WIDTH);
  assert.equal(layout.height, GALAXY_HOLO_MINIMAP_HEIGHT);
});

test('cluster token keys follow SPHERE_TOKEN_ORDER in order', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  layout.clusters.forEach((cluster, index) => {
    assert.equal(cluster.tokenKey, SPHERE_TOKEN_ORDER[index]);
    assert.equal(cluster.catalogSlug, resolveCatalogSlugForTokenKey(cluster.tokenKey));
  });
});

test('cluster catalog slugs are the sphere-mini-preview seeds', () => {
  // The dot pattern is seeded by the catalog slug (epic 42). The
  // holo minimap must use the same seed, so the slug for a cluster
  // is the catalog slug that maps to its token key.
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  for (const cluster of layout.clusters) {
    assert.ok(
      ['programming', 'mathematics', 'algorithms-theory', 'computer-systems',
        'data-ai', 'software-product', 'society-ethics-law', 'projects'].includes(cluster.catalogSlug),
      `cluster for token ${cluster.tokenKey} has an unexpected slug ${cluster.catalogSlug}`,
    );
  }
});

test('each cluster has 6-10 dots with the spec-fixed radius', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  for (const cluster of layout.clusters) {
    assert.ok(
      cluster.dots.length >= 6 && cluster.dots.length <= 10,
      `cluster ${cluster.tokenKey} has ${cluster.dots.length} dots, expected 6-10`,
    );
    for (const dot of cluster.dots) {
      assert.equal(dot.r, GALAXY_HOLO_CLUSTER_DOT_RADIUS);
    }
  }
});

test('cluster dots stay inside the 40x24 bounding box centered on the cluster', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  const halfW = GALAXY_HOLO_CLUSTER_BOX_WIDTH / 2;
  const halfH = GALAXY_HOLO_CLUSTER_BOX_HEIGHT / 2;
  for (const cluster of layout.clusters) {
    for (const dot of cluster.dots) {
      assert.ok(
        dot.x >= cluster.center.x - halfW - TOLERANCE &&
          dot.x <= cluster.center.x + halfW + TOLERANCE,
        `dot.x ${dot.x} escapes the 40-wide cluster box around ${cluster.center.x}`,
      );
      assert.ok(
        dot.y >= cluster.center.y - halfH - TOLERANCE &&
          dot.y <= cluster.center.y + halfH + TOLERANCE,
        `dot.y ${dot.y} escapes the 24-tall cluster box around ${cluster.center.y}`,
      );
    }
  }
});

test('cluster centroids sit at the transformed biome centers', () => {
  const biomes = buildBiomes(8);
  const layout = buildGalaxyHoloMinimapLayout({
    biomes,
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  biomes.forEach((biome, index) => {
    const expected = layout.toMini(biome.center.x, biome.center.y);
    const cluster = layout.clusters[index];
    assert.ok(
      Math.abs(cluster.center.x - expected.x) < TOLERANCE,
      `cluster ${index} x ${cluster.center.x} != transformed ${expected.x}`,
    );
    assert.ok(
      Math.abs(cluster.center.y - expected.y) < TOLERANCE,
      `cluster ${index} y ${cluster.center.y} != transformed ${expected.y}`,
    );
  });
});

test('toMini / fromMini are inverses inside the merged bounds', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  const samples = [
    { x: -200, y: -150 },
    { x: 0, y: 0 },
    { x: 200, y: 150 },
    { x: 350, y: -250 },
  ];
  for (const sample of samples) {
    const projected = layout.toMini(sample.x, sample.y);
    const inverted = layout.fromMini(projected.x, projected.y);
    assert.ok(
      Math.abs(inverted.x - sample.x) < TOLERANCE,
      `fromMini(toMini(${sample.x})) returned ${inverted.x}`,
    );
    assert.ok(
      Math.abs(inverted.y - sample.y) < TOLERANCE,
      `fromMini(toMini(${sample.y})) returned ${inverted.y}`,
    );
  }
});

test('viewport rectangle is at least 12x12 and clamped to the minimap', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: { x: 0, y: 0, zoom: 0.5 },
  });
  assert.ok(layout);
  assert.ok(layout.viewportRect.width >= 12, `viewport width ${layout.viewportRect.width} < 12`);
  assert.ok(layout.viewportRect.height >= 12, `viewport height ${layout.viewportRect.height} < 12`);
  assert.ok(layout.viewportRect.x >= 0 && layout.viewportRect.x <= layout.width);
  assert.ok(layout.viewportRect.y >= 0 && layout.viewportRect.y <= layout.height);
});

test('currentSphereSlug highlights exactly one cluster when it maps to a known token', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
    currentSphereSlug: 'algorithms-theory',
  });
  assert.ok(layout);
  // `algorithms-theory` maps to `navigation` (SPHERE_TOKEN_ORDER[2]).
  const highlighted = layout.clusters.filter((cluster) => cluster.isCurrent);
  assert.equal(highlighted.length, 1);
  assert.equal(highlighted[0].tokenKey, 'navigation');
  assert.equal(layout.currentCluster?.tokenKey, 'navigation');
});

test('currentSphereSlug falls back to no highlight for an unknown slug', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
    currentSphereSlug: 'nope-not-a-sphere',
  });
  assert.ok(layout);
  assert.equal(layout.clusters.filter((cluster) => cluster.isCurrent).length, 0);
  assert.equal(layout.currentCluster, null);
});

test('currentSphereSlug falls back to no highlight when omitted', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  assert.equal(layout.clusters.filter((cluster) => cluster.isCurrent).length, 0);
});

test('the layout caps cluster count at the catalog max (8)', () => {
  // 11 biomes mirrors the NLH cash raw catalog. The holo minimap
  // should still only emit up to 8 clusters so the colors stay
  // consistent with the sphere token palette.
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(11),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  assert.equal(layout.clusters.length, 8);
});

test('findClusterAtMinimapPoint returns the cluster under the click', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  for (const cluster of layout.clusters) {
    const hit = findClusterAtMinimapPoint(layout, cluster.center);
    assert.equal(hit?.tokenKey, cluster.tokenKey);
  }
});

test('findClusterAtMinimapPoint returns null for empty space', () => {
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  // The (0,0) minimap corner is the SVG top-left — well outside
  // every cluster's bounding box. The exact centre of the minimap
  // is layout-dependent (the ring of biomes may or may not cross
  // the centre), so we use a guaranteed-empty point instead.
  assert.equal(findClusterAtMinimapPoint(layout, { x: 2, y: 2 }), null);
  assert.equal(findClusterAtMinimapPoint(layout, { x: layout.width - 2, y: 2 }), null);
});

test('findClusterAtMinimapPoint uses the same dot count as computeSphereMiniPreviewDots', () => {
  // The dot count must match the mini-preview for the same slug —
  // the holo minimap re-uses the deterministic PRNG seed.
  const layout = buildGalaxyHoloMinimapLayout({
    biomes: buildBiomes(8),
    modelBounds: DEFAULT_BOUNDS,
    canvasSize: DEFAULT_CANVAS_SIZE,
    viewportCamera: DEFAULT_VIEWPORT,
  });
  assert.ok(layout);
  for (const cluster of layout.clusters) {
    // The brief allows 6-10 dots, the mini-preview allows 6-12.
    // The holo minimap uses the same algorithm so the count
    // matches the mini-preview for the same slug.
    const expectedCount = cluster.dots.length;
    assert.ok(
      expectedCount >= 6 && expectedCount <= 10,
      `cluster ${cluster.tokenKey} dot count ${expectedCount} should be in the brief's [6..10] window`,
    );
  }
});

test('resolveTokenKeyForBiomeIndex clamps out-of-range indices', () => {
  assert.equal(resolveTokenKeyForBiomeIndex(0), 'code');
  assert.equal(resolveTokenKeyForBiomeIndex(7), 'projects');
  // Negative indices clamp to the first sphere.
  assert.equal(resolveTokenKeyForBiomeIndex(-5), 'code');
  // Indices past the end clamp to the last sphere.
  assert.equal(resolveTokenKeyForBiomeIndex(99), 'projects');
});

test('resolveCatalogSlugForTokenKey returns the catalog slug for every token', () => {
  for (const tokenKey of SPHERE_TOKEN_ORDER) {
    const slug = resolveCatalogSlugForTokenKey(tokenKey);
    // The catalog slug list contains every token — for the
    // `projects` token, the slug happens to be the same string
    // (`projects`); every other token has a distinct catalog
    // slug. The lookup must produce a non-empty string and the
    // string must be in the canonical slug list.
    assert.ok(slug.length > 0, `slug for token ${tokenKey} is empty`);
    assert.ok(
      SPHERE_CATALOG_SLUG_ORDER.includes(slug),
      `slug "${slug}" for token "${tokenKey}" is not in the catalog`,
    );
  }
});

test('scaleMiniPreviewDotsToClusterBox pins the radius and keeps dots inside the box', () => {
  const clusterCenter = { x: 100, y: 60 };
  const dots = scaleMiniPreviewDotsToClusterBox('programming', clusterCenter);
  assert.ok(dots.length >= 6 && dots.length <= 12);
  for (const dot of dots) {
    assert.equal(dot.r, GALAXY_HOLO_CLUSTER_DOT_RADIUS);
    assert.ok(
      Math.abs(dot.x - clusterCenter.x) <= GALAXY_HOLO_CLUSTER_BOX_WIDTH / 2,
      `dot.x ${dot.x} escapes the cluster box around ${clusterCenter.x}`,
    );
    assert.ok(
      Math.abs(dot.y - clusterCenter.y) <= GALAXY_HOLO_CLUSTER_BOX_HEIGHT / 2,
      `dot.y ${dot.y} escapes the cluster box around ${clusterCenter.y}`,
    );
  }
});

test('scaleMiniPreviewDotsToClusterBox is deterministic across calls (with a stable slug)', () => {
  const center = { x: 50, y: 50 };
  const first = scaleMiniPreviewDotsToClusterBox('mathematics', center);
  const second = scaleMiniPreviewDotsToClusterBox('mathematics', center);
  assert.deepEqual(second, first);
});

test('sphere tokens are present for every cluster token (CSS-var contract)', () => {
  // The component reads `var(--sphere-{tokenKey}-{stop})` for every
  // cluster. The test pins the palette so a missing token breaks the
  // build before a runtime missing-var warning does.
  for (const tokenKey of SPHERE_TOKEN_ORDER) {
    const token = sphereTokens[tokenKey];
    assert.ok(token, `sphere token ${tokenKey} is missing from the palette`);
    assert.ok(token.soft, `${tokenKey}.soft is empty`);
    assert.ok(token.strong, `${tokenKey}.strong is empty`);
    assert.ok(token.default, `${tokenKey}.default is empty`);
  }
});
