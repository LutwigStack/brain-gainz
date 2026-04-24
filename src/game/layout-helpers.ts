import type { GameBounds, GamePoint } from './types';

export const GRID_SIZE = 48;
export const GRID_MAJOR_STEP = GRID_SIZE * 4;

export const snapPointToGrid = (
  point: GamePoint,
  enabled = true,
  gridSize = GRID_SIZE,
): GamePoint => {
  if (!enabled) {
    return point;
  }

  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

export const expandBoundsForGrid = (
  bounds: GameBounds,
  padding = GRID_MAJOR_STEP,
): GameBounds => ({
  minX: bounds.minX - padding,
  minY: bounds.minY - padding,
  maxX: bounds.maxX + padding,
  maxY: bounds.maxY + padding,
  width: bounds.width + padding * 2,
  height: bounds.height + padding * 2,
  center: bounds.center,
});
