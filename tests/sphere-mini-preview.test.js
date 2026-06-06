/**
 * Epic 42 — Sphere mini-preview and progress arc tests.
 *
 * Pins the two contracts that workstreams 01 and 02 call out:
 *   1. The dot pattern for a given slug is deterministic — the same
 *      slug always returns the same positions across calls (and
 *      across resets of the memoisation cache).
 *   2. `computeProgressArcLength` reports the correct stroke-dash
 *      length for the spec checkpoints (0/12, 6/12, 12/12), with the
 *      defensive clamps for `total === 0` and `completed > total`.
 *   3. `formatProgressPercentLabel` returns `—` when total is zero
 *      and the rounded percent otherwise.
 *
 * The mini-preview's determinism is the load-bearing contract: if
 * the same sphere rendered two different constellations, the card
 * would lose its identity across reloads. The arc length test is the
 * load-bearing contract for the progress visualisation: the visual
 * must match the data.
 *
 * The pure logic lives in `.ts` modules (`sphere-mini-preview.ts`,
 * `progress-arc.ts`); the React wrappers in `.tsx` re-export from
 * these. The test imports the `.ts` sources directly so the node
 * test runner can strip types without a TSX loader.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeSphereMiniPreviewDots,
  __resetSphereMiniPreviewCacheForTests,
  SPHERE_MINI_PREVIEW_MIN_DOTS,
  SPHERE_MINI_PREVIEW_MAX_DOTS,
  SPHERE_MINI_PREVIEW_SIZE,
  SPHERE_MINI_PREVIEW_INNER_RADIUS_RATIO,
} from '../src/components/galaxy/sphere-mini-preview.ts';
import {
  computeProgressArcLength,
  formatProgressPercentLabel,
  PROGRESS_ARC_CIRCUMFERENCE,
  PROGRESS_ARC_RADIUS,
  PROGRESS_ARC_STROKE_WIDTH,
} from '../src/components/galaxy/progress-arc.ts';

const SPHERE_SLUGS = [
  'programming',
  'mathematics',
  'algorithms-theory',
  'computer-systems',
  'data-ai',
  'software-product',
  'society-ethics-law',
  'projects',
];

const TOLERANCE = 1e-6;

test('SphereMiniPreview exports size and inner-radius constants the test relies on', () => {
  // The viewBox is 96x96 and the inner radius is ~78% of the outer
  // radius (workstream 01 §Shape). Pinning these constants means a
  // future visual tuning is a deliberate change, not a regression.
  assert.equal(SPHERE_MINI_PREVIEW_SIZE, 96);
  assert.ok(
    SPHERE_MINI_PREVIEW_INNER_RADIUS_RATIO > 0.7 && SPHERE_MINI_PREVIEW_INNER_RADIUS_RATIO < 0.85,
    `inner radius ratio should sit in the [0.7..0.85] band, got ${SPHERE_MINI_PREVIEW_INNER_RADIUS_RATIO}`,
  );
  assert.equal(SPHERE_MINI_PREVIEW_MIN_DOTS, 6);
  assert.equal(SPHERE_MINI_PREVIEW_MAX_DOTS, 12);
});

test('computeSphereMiniPreviewDots is deterministic across calls for the same slug', () => {
  __resetSphereMiniPreviewCacheForTests();
  const first = computeSphereMiniPreviewDots('programming');
  const second = computeSphereMiniPreviewDots('programming');
  // The cached result and a re-derive must be deeply equal.
  assert.deepEqual(second.dots, first.dots);
  assert.equal(second.currentIndex, first.currentIndex);
  assert.equal(second.dots.length, first.dots.length);
});

test('computeSphereMiniPreviewDots is deterministic after the cache is reset', () => {
  __resetSphereMiniPreviewCacheForTests();
  const first = computeSphereMiniPreviewDots('algorithms-theory');
  __resetSphereMiniPreviewCacheForTests();
  const second = computeSphereMiniPreviewDots('algorithms-theory');
  assert.deepEqual(second.dots, first.dots, 'a cache reset must not change the pattern');
  assert.equal(second.currentIndex, first.currentIndex, 'current dot index must survive a cache reset');
});

test('computeSphereMiniPreviewDots is distinct across the 8 sphere slugs', () => {
  __resetSphereMiniPreviewCacheForTests();
  const patterns = SPHERE_SLUGS.map((slug) => computeSphereMiniPreviewDots(slug));
  // Each sphere's pattern must be a different constellation. The
  // probability of a hash collision in 8 slugs is effectively zero,
  // so the test asserts strict inequality (or, at least, that the
  // union of the 8 patterns is exactly 8 unique patterns).
  const signature = (pattern) =>
    pattern.dots.map((dot) => `${dot.x.toFixed(3)}|${dot.y.toFixed(3)}|${dot.r.toFixed(3)}`).join(';');
  const seen = new Set(patterns.map(signature));
  assert.equal(
    seen.size,
    SPHERE_SLUGS.length,
    `expected ${SPHERE_SLUGS.length} unique mini-preview signatures, got ${seen.size}`,
  );
});

test('computeSphereMiniPreviewDots respects dot-count bounds and the viewBox', () => {
  __resetSphereMiniPreviewCacheForTests();
  for (const slug of SPHERE_SLUGS) {
    const pattern = computeSphereMiniPreviewDots(slug);
    assert.ok(
      pattern.dots.length >= SPHERE_MINI_PREVIEW_MIN_DOTS &&
        pattern.dots.length <= SPHERE_MINI_PREVIEW_MAX_DOTS,
      `slug "${slug}" dot count ${pattern.dots.length} out of [${SPHERE_MINI_PREVIEW_MIN_DOTS}..${SPHERE_MINI_PREVIEW_MAX_DOTS}]`,
    );
    assert.ok(
      pattern.currentIndex >= 0 && pattern.currentIndex < pattern.dots.length,
      `slug "${slug}" currentIndex ${pattern.currentIndex} out of bounds`,
    );
    for (const dot of pattern.dots) {
      assert.ok(
        dot.x >= 0 && dot.x <= SPHERE_MINI_PREVIEW_SIZE,
        `slug "${slug}" dot x ${dot.x} outside viewBox`,
      );
      assert.ok(
        dot.y >= 0 && dot.y <= SPHERE_MINI_PREVIEW_SIZE,
        `slug "${slug}" dot y ${dot.y} outside viewBox`,
      );
      assert.ok(dot.r > 0 && dot.r < 10, `slug "${slug}" dot r ${dot.r} out of sane range`);
    }
  }
});

test('computeSphereMiniPreviewDots flags the current dot as larger than regular dots', () => {
  __resetSphereMiniPreviewCacheForTests();
  const pattern = computeSphereMiniPreviewDots('programming');
  const current = pattern.dots[pattern.currentIndex];
  const regularRadii = pattern.dots.filter((_, i) => i !== pattern.currentIndex).map((dot) => dot.r);
  const maxRegular = Math.max(...regularRadii);
  // The brief asks for "1.5x" — the current dot is allowed to be
  // a touch smaller after the per-dot size jitter, but it must
  // remain visually heavier than any regular dot. The size jitter
  // range is [0.85..1.15], so the current dot stays ahead.
  assert.ok(
    current.r > maxRegular,
    `current dot r ${current.r.toFixed(3)} should exceed max regular r ${maxRegular.toFixed(3)}`,
  );
});

test('ProgressArc exports the expected radius, stroke width, and circumference', () => {
  // The arc uses a 3px stroke around the 96px mini-preview, so the
  // radius is (96 - 3) / 2 = 46.5 and the circumference is
  // 2π × 46.5 ≈ 292.169...
  assert.equal(PROGRESS_ARC_STROKE_WIDTH, 3);
  assert.equal(PROGRESS_ARC_RADIUS, (96 - 3) / 2);
  assert.ok(
    Math.abs(PROGRESS_ARC_CIRCUMFERENCE - 2 * Math.PI * PROGRESS_ARC_RADIUS) < TOLERANCE,
    'PROGRESS_ARC_CIRCUMFERENCE must equal 2π × radius',
  );
});

test('computeProgressArcLength: 0/12 produces an empty filled arc', () => {
  const { arcLength, gapLength, progress, circumference } = computeProgressArcLength(0, 12);
  assert.ok(Math.abs(arcLength) < TOLERANCE, `arc length should be 0, got ${arcLength}`);
  assert.ok(
    Math.abs(gapLength - circumference) < TOLERANCE,
    `gap should equal the full circumference, got ${gapLength} vs ${circumference}`,
  );
  assert.equal(progress, 0);
});

test('computeProgressArcLength: 6/12 fills exactly half of the ring', () => {
  const { arcLength, gapLength, progress, circumference } = computeProgressArcLength(6, 12);
  const half = circumference / 2;
  assert.ok(
    Math.abs(arcLength - half) < TOLERANCE,
    `arc length for 6/12 should be half the circumference (${half}), got ${arcLength}`,
  );
  assert.ok(
    Math.abs(gapLength - half) < TOLERANCE,
    `gap length for 6/12 should be half the circumference (${half}), got ${gapLength}`,
  );
  assert.ok(
    Math.abs(progress - 0.5) < TOLERANCE,
    `progress for 6/12 should be 0.5, got ${progress}`,
  );
});

test('computeProgressArcLength: 12/12 fills the full ring', () => {
  const { arcLength, gapLength, progress, circumference } = computeProgressArcLength(12, 12);
  assert.ok(
    Math.abs(arcLength - circumference) < TOLERANCE,
    `arc length for 12/12 should be the full circumference (${circumference}), got ${arcLength}`,
  );
  assert.ok(Math.abs(gapLength) < TOLERANCE, `gap length for 12/12 should be 0, got ${gapLength}`);
  assert.equal(progress, 1);
});

test('computeProgressArcLength: total === 0 collapses to an empty arc (the ring is hidden by the component)', () => {
  const { arcLength, gapLength, progress } = computeProgressArcLength(0, 0);
  assert.equal(arcLength, 0);
  assert.equal(progress, 0);
  assert.ok(
    Math.abs(gapLength - PROGRESS_ARC_CIRCUMFERENCE) < TOLERANCE,
    'gap must equal the full circumference when there is no progress',
  );
});

test('computeProgressArcLength: completed > total is clamped to 100% (defensive)', () => {
  const { arcLength, gapLength, progress, circumference } = computeProgressArcLength(20, 12);
  assert.equal(progress, 1, 'over-completion must clamp to 1');
  assert.ok(
    Math.abs(arcLength - circumference) < TOLERANCE,
    'over-completion must produce a full ring',
  );
  assert.equal(gapLength, 0);
});

test('computeProgressArcLength: arc + gap always equals the circumference', () => {
  // A defensive invariant — the dasharray we feed to the SVG must
  // sum to the full circumference, no matter the inputs.
  const pairs = [
    [0, 0],
    [0, 12],
    [1, 12],
    [6, 12],
    [11, 12],
    [12, 12],
    [99, 12],
  ];
  for (const [completed, total] of pairs) {
    const { arcLength, gapLength, circumference } = computeProgressArcLength(completed, total);
    const sum = arcLength + gapLength;
    assert.ok(
      Math.abs(sum - circumference) < TOLERANCE,
      `arc + gap (${sum}) must equal the circumference (${circumference}) for ${completed}/${total}`,
    );
  }
});

test('formatProgressPercentLabel: total === 0 returns an em dash (not 0%)', () => {
  assert.equal(formatProgressPercentLabel(0, 0), '—');
  assert.equal(formatProgressPercentLabel(5, 0), '—', 'over-complete on a zero-total sphere should still show —');
});

test('formatProgressPercentLabel: rounds to the nearest integer percent', () => {
  assert.equal(formatProgressPercentLabel(0, 12), '0%');
  assert.equal(formatProgressPercentLabel(6, 12), '50%');
  assert.equal(formatProgressPercentLabel(12, 12), '100%');
  // 1/3 ≈ 33.33… should round to 33%; 2/3 ≈ 66.66… should round to 67%.
  assert.equal(formatProgressPercentLabel(1, 3), '33%');
  assert.equal(formatProgressPercentLabel(2, 3), '67%');
  // Defensive: over-complete clamps to 100% per the spec.
  assert.equal(formatProgressPercentLabel(15, 12), '100%');
});
