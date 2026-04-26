import type { GamePoint } from './types';

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
