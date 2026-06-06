/**
 * Epic 47 workstream 03 — jump route geometry.
 *
 * Pins the Bezier curve shape and the per-edge timing logic
 * that drives the cosmic-canvas stardust trail. The render loop
 * is covered by the map-layer integration tests; this file
 * focuses on the pure functions in `src/game/edge-geometry.ts`
 * so the trail duration cap and the bend-sign determinism are
 * both guarded.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeStardustDurationMs,
  createJumpRoute,
  createStraightRoute,
  resolveBendSignForEdge,
  sampleJumpRoute,
} from '../src/game/edge-geometry.ts';

test('createJumpRoute returns 16 sampled points and starts/ends on the anchors', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 200, y: 80 };
  const route = createJumpRoute(from, to, 1);

  assert.equal(route.length, 16);
  assert.equal(route[0].x, from.x);
  assert.equal(route[0].y, from.y);
  const last = route[route.length - 1];
  assert.equal(last.x, to.x);
  assert.equal(last.y, to.y);
});

test('createStraightRoute keeps atlas structure edges unbent', () => {
  const from = { x: -40, y: 12 };
  const to = { x: 90, y: -18 };
  const route = createStraightRoute(from, to);

  assert.deepEqual(route, [from, to]);
});

test('createJumpRoute bends perpendicular to the midpoint with a 20-40px offset', () => {
  // For a straight horizontal line the perpendicular direction
  // is the y-axis, so the bend lifts or drops the midpoint
  // exactly 20-40px (clamped by the 0.12 * distance factor
  // which, for d=100, gives 12px — below the 20px floor, so the
  // floor wins).
  const from = { x: 0, y: 0 };
  const to = { x: 100, y: 0 };
  const positiveBend = createJumpRoute(from, to, 1);
  const negativeBend = createJumpRoute(from, to, -1);

  const positiveMidY = positiveBend[Math.floor(positiveBend.length / 2)].y;
  const negativeMidY = negativeBend[Math.floor(negativeBend.length / 2)].y;
  assert.ok(positiveMidY >= 18, `expected positive bend >= 18px, got ${positiveMidY}`);
  assert.ok(positiveMidY <= 42, `expected positive bend <= 42px, got ${positiveMidY}`);
  assert.ok(negativeMidY <= -18, `expected negative bend <= -18px, got ${negativeMidY}`);
  assert.ok(negativeMidY >= -42, `expected negative bend >= -42px, got ${negativeMidY}`);
});

test('computeStardustDurationMs clamps short edges to 4s and long edges to 6s', () => {
  assert.equal(computeStardustDurationMs(0), 4_000);
  assert.equal(computeStardustDurationMs(80), 4_000);
  assert.equal(computeStardustDurationMs(600), 6_000);
  assert.equal(computeStardustDurationMs(9_999), 6_000);
  // Mid-range edge length lands between the floor and the cap.
  const mid = computeStardustDurationMs(340);
  assert.ok(mid > 4_000 && mid < 6_000, `expected mid-range duration in (4s, 6s), got ${mid}`);
});

test('resolveBendSignForEdge is deterministic and only ever +1 or -1', () => {
  const signs = new Set();
  for (let index = 0; index < 32; index += 1) {
    signs.add(resolveBendSignForEdge(index));
    assert.ok(resolveBendSignForEdge(index) === 1 || resolveBendSignForEdge(index) === -1);
  }
  assert.equal(signs.size, 2);
  // The function is a stable hash of the id; the same id must
  // always map to the same sign.
  assert.equal(resolveBendSignForEdge(1), resolveBendSignForEdge(1));
  assert.equal(resolveBendSignForEdge(7), resolveBendSignForEdge(7));
});

test('sampleJumpRoute interpolates between the cached samples', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 200, y: 0 };
  const route = createJumpRoute(from, to, 1);

  // t=0 is the first sample, t=1 is the last sample, t=0.5
  // is somewhere in the middle (clamped to a route segment).
  const start = sampleJumpRoute(route, 0);
  const end = sampleJumpRoute(route, 1);
  const mid = sampleJumpRoute(route, 0.5);

  assert.equal(start.x, route[0].x);
  assert.equal(start.y, route[0].y);
  assert.equal(end.x, route[route.length - 1].x);
  assert.equal(end.y, route[route.length - 1].y);
  assert.ok(mid.x > 0 && mid.x < 200, `expected mid.x in (0, 200), got ${mid.x}`);
});
