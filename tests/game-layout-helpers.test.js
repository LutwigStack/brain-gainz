import test from 'node:test';
import assert from 'node:assert/strict';

import { GRID_MAJOR_STEP, GRID_SIZE, expandBoundsForGrid, snapPointToGrid } from '../src/game/layout-helpers.ts';

test('snapPointToGrid rounds coordinates to the nearest grid cell', () => {
  assert.deepEqual(snapPointToGrid({ x: 71, y: -95 }), {
    x: GRID_SIZE,
    y: -GRID_SIZE * 2,
  });
});

test('snapPointToGrid preserves freeform coordinates when disabled', () => {
  const point = { x: 71, y: -95 };
  assert.deepEqual(snapPointToGrid(point, false), point);
});

test('expandBoundsForGrid adds symmetric padding for the visible grid', () => {
  const bounds = {
    minX: -120,
    minY: -80,
    maxX: 260,
    maxY: 200,
    width: 380,
    height: 280,
    center: { x: 70, y: 60 },
  };

  assert.deepEqual(expandBoundsForGrid(bounds), {
    minX: -120 - GRID_MAJOR_STEP,
    minY: -80 - GRID_MAJOR_STEP,
    maxX: 260 + GRID_MAJOR_STEP,
    maxY: 200 + GRID_MAJOR_STEP,
    width: 380 + GRID_MAJOR_STEP * 2,
    height: 280 + GRID_MAJOR_STEP * 2,
    center: bounds.center,
  });
});
