/**
 * Epic 41 — sphere color tokens test.
 *
 * Pins the contract for the sphere palette system:
 *   - the 8 sphere tokens (code, math, navigation, systems, data,
 *     engineering, society, projects) exist with four stops each
 *   - the four stops are exactly `default`, `strong`, `soft`,
 *     `textOnStrong`
 *   - `textOnStrong` is one of `#FFFFFF` (cool stops) or `#10131A`
 *     (warm stops), per the spec comment in sphere-tokens.ts
 *   - the catalog slugs from `cs-bachelor-course-catalog.ts` are all
 *     mapped to a token key
 *   - every catalog slug maps to a unique token key
 *   - every hex value is a valid 6-digit RGB
 *   - the pixel theme emitter surfaces the new `--sphere-{key}-{stop}`
 *     variables on the root element
 *
 * The test imports the .ts sources directly; Node 22+'s built-in
 * type stripping handles the conversion, so no extra loader is
 * needed. The path mirrors the running app's import path.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  sphereTokens,
  SPHERE_TOKEN_ORDER,
  SPHERE_TOKEN_COUNT,
  sphereDisplayNames,
} from '../src/theme/galaxy/sphere-tokens.ts';
import {
  sphereIdToToken,
  getSphereTokenKey,
  tryGetSphereTokenKey,
} from '../src/theme/galaxy/sphere-id-to-token.ts';
import { pixelCssVariables } from '../src/theme/pixel/tokens.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sphereTokensSource = readFileSync(resolve(repoRoot, 'src/theme/galaxy/sphere-tokens.ts'), 'utf8');
const sphereIdToTokenSource = readFileSync(resolve(repoRoot, 'src/theme/galaxy/sphere-id-to-token.ts'), 'utf8');
const pixelTokensSource = readFileSync(resolve(repoRoot, 'src/theme/pixel/tokens.ts'), 'utf8');
const csBachelorSource = readFileSync(resolve(repoRoot, 'src/application/cs-bachelor-course-catalog.ts'), 'utf8');
const nlhCashSource = readFileSync(resolve(repoRoot, 'src/application/nlh-cash-course-catalog.ts'), 'utf8');

const HEX_RE = /^#[0-9A-Fa-f]{6}$/u;
const ALLOWED_TEXT_ON_STRONG = new Set(['#ffffff', '#10131a']);
const EXPECTED_STOPS = ['default', 'strong', 'soft', 'textOnStrong'];

/** The 8 sphere token keys in canonical order. */
const EXPECTED_TOKEN_KEYS = [
  'code',
  'math',
  'navigation',
  'systems',
  'data',
  'engineering',
  'society',
  'projects',
];

test('sphereTokens exports exactly 8 keys in SPHERE_TOKEN_ORDER', () => {
  assert.equal(SPHERE_TOKEN_COUNT, 8, 'SPHERE_TOKEN_COUNT must be 8');
  assert.deepEqual(
    [...SPHERE_TOKEN_ORDER],
    EXPECTED_TOKEN_KEYS,
    'SPHERE_TOKEN_ORDER must be the 8 sphere token keys in clockwise order',
  );
  assert.equal(Object.keys(sphereTokens).length, 8, 'sphereTokens must export 8 entries');
  for (const key of EXPECTED_TOKEN_KEYS) {
    assert.ok(key in sphereTokens, `sphereTokens must include "${key}"`);
  }
});

test('every sphere token has the 4 expected stops', () => {
  for (const key of EXPECTED_TOKEN_KEYS) {
    const token = sphereTokens[key];
    assert.ok(token, `sphereTokens.${key} must be defined`);
    for (const stop of EXPECTED_STOPS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(token, stop),
        `sphereTokens.${key} must have stop "${stop}"`,
      );
      assert.equal(
        typeof token[stop],
        'string',
        `sphereTokens.${key}.${stop} must be a string`,
      );
    }
  }
});

test('every sphere stop is a valid 6-digit hex', () => {
  for (const key of EXPECTED_TOKEN_KEYS) {
    for (const stop of EXPECTED_STOPS) {
      const value = sphereTokens[key][stop];
      assert.match(
        value,
        HEX_RE,
        `sphereTokens.${key}.${stop} (${value}) must be a 6-digit hex`,
      );
    }
  }
});

test('textOnStrong is one of the allowed two values (cool #FFFFFF or warm #10131A)', () => {
  const coolKeys = new Set(['code', 'math', 'data', 'navigation']);
  const warmKeys = new Set(['systems', 'engineering', 'society', 'projects']);
  for (const key of EXPECTED_TOKEN_KEYS) {
    const textOnStrong = sphereTokens[key].textOnStrong.toLowerCase();
    assert.ok(
      ALLOWED_TEXT_ON_STRONG.has(textOnStrong),
      `sphereTokens.${key}.textOnStrong (${textOnStrong}) must be #ffffff or #10131a`,
    );
    if (coolKeys.has(key)) {
      assert.equal(
        textOnStrong,
        '#ffffff',
        `cool sphere "${key}" must use #ffffff textOnStrong`,
      );
    }
    if (warmKeys.has(key)) {
      assert.equal(
        textOnStrong,
        '#10131a',
        `warm sphere "${key}" must use #10131a textOnStrong`,
      );
    }
  }
});

test('SPHERE_TOKEN_ORDER is the 8 sphere keys and is exported as a readonly tuple', () => {
  assert.equal(SPHERE_TOKEN_ORDER.length, 8);
  for (const key of EXPECTED_TOKEN_KEYS) {
    assert.ok(SPHERE_TOKEN_ORDER.includes(key), `${key} must be in SPHERE_TOKEN_ORDER`);
  }
});

test('sphereDisplayNames has a label for every sphere key', () => {
  for (const key of EXPECTED_TOKEN_KEYS) {
    const label = sphereDisplayNames[key];
    assert.ok(typeof label === 'string' && label.length > 0, `sphereDisplayNames.${key} must be a non-empty string`);
  }
});

test('sphereIdToToken maps every CS Bachelor catalog slug to a unique sphere token', () => {
  // Pull the slugs straight from the catalog source so this test
  // breaks if a future PR adds or removes a region.
  const regionKeyMatches = [...csBachelorSource.matchAll(/^\s*key:\s*'([^']+)'/gmu)];
  const regionKeys = regionKeyMatches.map((m) => m[1]);
  assert.ok(regionKeys.length >= 8, `CS Bachelor catalog should expose at least 8 regions, got ${regionKeys.length}`);

  // The 8 sphere-mapped slugs (8 region keys that drive the 8 sphere
  // tokens — the first 8 in the catalog, which is the canonical order
  // the README documents as the clockwise WindRose layout).
  const expectedMappedSlugs = [
    'programming',
    'mathematics',
    'algorithms-theory',
    'computer-systems',
    'data-ai',
    'software-product',
    'society-ethics-law',
    'projects',
  ];

  const mappedTokenKeys = new Set();
  for (const slug of expectedMappedSlugs) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(sphereIdToToken, slug),
      `sphereIdToToken must include catalog slug "${slug}"`,
    );
    const tokenKey = sphereIdToToken[slug];
    assert.ok(
      EXPECTED_TOKEN_KEYS.includes(tokenKey),
      `sphereIdToToken.${slug} (${tokenKey}) must map to a known sphere token key`,
    );
    assert.ok(
      !mappedTokenKeys.has(tokenKey),
      `sphereIdToToken must map slug "${slug}" to a unique token key; "${tokenKey}" already used`,
    );
    mappedTokenKeys.add(tokenKey);
  }

  assert.equal(mappedTokenKeys.size, 8, 'all 8 sphere tokens must be covered by the catalog mapping');
});

test('NLH cash catalog has more regions than sphere tokens (sanity, not a failure)', () => {
  // Documenting the explicit out-of-scope: NLH cash has 11 regions
  // and is not in sphereIdToToken. The WindRose falls back to the
  // infra color for those stats. The test only checks the count
  // (so a future PR that adds NLH cash to the map would change this
  // count and surface a clear reminder in CI).
  const regionKeyMatches = [...nlhCashSource.matchAll(/^\s*key:\s*'([^']+)'/gmu)];
  assert.ok(
    regionKeyMatches.length > 8,
    `NLH cash catalog has ${regionKeyMatches.length} regions; only the CS bachelor 8 are sphere-mapped in epic 41`,
  );
});

test('getSphereTokenKey throws a clear error for an unknown slug', () => {
  assert.throws(
    () => getSphereTokenKey('not-a-sphere'),
    /no sphere token mapped for slug "not-a-sphere"/u,
    'getSphereTokenKey must fail loudly for unknown slugs',
  );
});

test('tryGetSphereTokenKey returns null for an unknown slug and the key for a known one', () => {
  assert.equal(tryGetSphereTokenKey('not-a-sphere'), null);
  assert.equal(tryGetSphereTokenKey('programming'), 'code');
  assert.equal(tryGetSphereTokenKey('projects'), 'projects');
});

test('sphere-tokens.ts source declares the expected hex values from the README', () => {
  // Pin the spec: the README "Token map (initial proposal)" table
  // must stay in sync with the source. A future visual tuning is
  // a follow-up epic and must update both at once.
  const expectedDefaults = {
    code: '#5AC8FA',
    math: '#C792EA',
    navigation: '#82E0AA',
    systems: '#F5B041',
    data: '#4DD0E1',
    engineering: '#E57373',
    society: '#F06292',
    projects: '#FFD54F',
  };
  for (const [key, hex] of Object.entries(expectedDefaults)) {
    assert.ok(
      sphereTokensSource.includes(`'${hex}'`),
      `sphere-tokens.ts must declare the README default hex for ${key}: ${hex}`,
    );
  }
});

test('sphere-id-to-token.ts source has the catalog-slug → token map', () => {
  assert.match(
    sphereIdToTokenSource,
    /programming:\s*'code'/u,
    'programming must map to code',
  );
  assert.match(
    sphereIdToTokenSource,
    /'algorithms-theory':\s*'navigation'/u,
    'algorithms-theory must map to navigation',
  );
  assert.match(
    sphereIdToTokenSource,
    /projects:\s*'projects'/u,
    'projects must map to projects',
  );
});

test('pixel theme emitter includes every --sphere-{key}-{stop} variable', () => {
  for (const key of EXPECTED_TOKEN_KEYS) {
    for (const stop of EXPECTED_STOPS) {
      const name = `--sphere-${key}-${stop}`;
      assert.ok(
        Object.prototype.hasOwnProperty.call(pixelCssVariables, name),
        `pixelCssVariables must include ${name}`,
      );
      assert.equal(
        pixelCssVariables[name],
        sphereTokens[key][stop],
        `${name} must match sphereTokens.${key}.${stop}`,
      );
    }
  }
});

test('pixel theme emitter order: --sphere-code-default appears before --sphere-projects-textOnStrong', () => {
  const keys = Object.keys(pixelCssVariables);
  const first = keys.indexOf('--sphere-code-default');
  const last = keys.indexOf('--sphere-projects-textOnStrong');
  assert.ok(first >= 0, '--sphere-code-default must exist');
  assert.ok(last >= 0, '--sphere-projects-textOnStrong must exist');
  assert.ok(first < last, 'emission order must follow SPHERE_TOKEN_ORDER');
});

test('pixel theme emitter code: buildSphereCssVariables is wired and sphere tokens are imported', () => {
  assert.match(
    pixelTokensSource,
    /import[\s\S]+from\s+'\.\.\/galaxy\/sphere-tokens(?:\.ts)?'/u,
    'pixel/tokens.ts must import from ../galaxy/sphere-tokens',
  );
  assert.match(
    pixelTokensSource,
    /\.\.\.buildSphereCssVariables\(\)/u,
    'pixelCssVariables must spread buildSphereCssVariables()',
  );
});
