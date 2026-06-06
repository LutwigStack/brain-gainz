import type { GamePoint } from './types';

export const createStraightRoute = (from: GamePoint, to: GamePoint): GamePoint[] => [from, to];

export const createQuadraticRoute = (
  from: GamePoint,
  to: GamePoint,
  bendDirection: number,
  bendStrength: number,
) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const midpoint = { x: from.x + dx / 2, y: from.y + dy / 2 };
  const perpendicular = { x: -dy / distance, y: dx / distance };
  const clampedBend = Math.min(42, Math.max(12, distance * bendStrength)) * bendDirection;
  const control = {
    x: midpoint.x + perpendicular.x * clampedBend,
    y: midpoint.y + perpendicular.y * clampedBend,
  };

  return Array.from({ length: 15 }, (_, index) => {
    const t = index / 14;
    const inverse = 1 - t;
    return {
      x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
      y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
    };
  });
};

/**
 * Epic 47 workstream 03 — "jump route" curve.
 *
 * The cosmic canvas replaces the existing quadratic route with a
 * Bezier whose control point is offset perpendicular to the
 * midpoint by a deterministic 20-40px in the source sphere's
 * `default` token direction. The bend magnitude is clamped to a
 * narrower band (20-40px) than the legacy `createQuadraticRoute`
 * so the curve reads as a deliberate "flight path" instead of a
 * wobbly connection line.
 *
 * Note: for a quadratic Bezier B(t) = (1-t)²·P0 + 2t(1-t)·C +
 * t²·P1, the midpoint at t=0.5 lands at 0.5·P0 + 0.5·C + 0.25·P1
 * = 0.5·midpoint + 0.5·C, so the curve only reaches half of the
 * control point's perpendicular offset. To make the visible
 * midpoint land in the 20-40px band we offset the control point
 * by 2× that band, then clamp to [40, 80]px.
 *
 * Returns 16 sampled points (t = 0..1, step 1/15) so a stardust
 * trail can be sampled at the same resolution as the curve.
 */
export const createJumpRoute = (from: GamePoint, to: GamePoint, bendDirection: number) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const midpoint = { x: from.x + dx / 2, y: from.y + dy / 2 };
  const perpendicular = { x: -dy / distance, y: dx / distance };
  // 40-80px control offset → 20-40px visible midpoint band.
  // `bendDirection` is the +/-1 sign from the caller (the edge
  // id is used as a deterministic signal so the same edge
  // always bends the same way).
  const bendMagnitude = Math.min(80, Math.max(40, distance * 0.24));
  const clampedBend = bendMagnitude * bendDirection;
  const control = {
    x: midpoint.x + perpendicular.x * clampedBend,
    y: midpoint.y + perpendicular.y * clampedBend,
  };

  return Array.from({ length: 16 }, (_, index) => {
    const t = index / 15;
    const inverse = 1 - t;
    return {
      x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
      y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
    };
  });
};

/**
 * Sample a single point on a pre-computed jump route at the given
 * t value. Used by the stardust trail to draw animated dots that
 * follow the exact same curve as the static line.
 */
export const sampleJumpRoute = (route: GamePoint[], t: number): GamePoint => {
  if (route.length === 0) {
    return { x: 0, y: 0 };
  }
  if (route.length === 1) {
    return route[0];
  }
  const clampedT = Math.max(0, Math.min(1, t));
  const segments = route.length - 1;
  const scaled = clampedT * segments;
  const lower = Math.floor(scaled);
  const upper = Math.min(segments, lower + 1);
  const fraction = scaled - lower;
  const fromPoint = route[lower];
  const toPoint = route[upper];
  return {
    x: fromPoint.x + (toPoint.x - fromPoint.x) * fraction,
    y: fromPoint.y + (toPoint.y - fromPoint.y) * fraction,
  };
};

/**
 * Compute the duration of a stardust trail in milliseconds. The
 * brief: "trail duration derived from edge length (cap 6s)" — the
 * base duration is 4s for short edges and scales up to 6s for long
 * edges (>= 600px). Below 80px the curve is so short that the
 * dots would overlap; we clamp the floor at 4s anyway so the
 * animation stays calm on tight clusters.
 */
export const computeStardustDurationMs = (routeLength: number): number => {
  if (routeLength < 80) {
    return 4_000;
  }
  if (routeLength >= 600) {
    return 6_000;
  }
  const ratio = (routeLength - 80) / (600 - 80);
  return 4_000 + ratio * 2_000;
};

/**
 * Pick a deterministic bend sign (+1 / -1) from the edge id. The
 * brief calls for a curve that is "asymmetric" — using the id as
 * a hash input means two edges between the same nodes will always
 * bend the same way across renders, and the per-edge direction is
 * stable.
 */
export const resolveBendSignForEdge = (edgeId: number): number => (edgeId % 2 === 0 ? 1 : -1);

export const getPointToSegmentDistance = (point: GamePoint, start: GamePoint, end: GamePoint) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
};

export const getPointToPolylineDistance = (point: GamePoint, route: GamePoint[]) => {
  if (route.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (route.length === 1) {
    return Math.hypot(point.x - route[0].x, point.y - route[0].y);
  }

  return Math.min(
    ...route.slice(1).map((next, index) => getPointToSegmentDistance(point, route[index], next)),
  );
};
