import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveCanvasCreatePosition,
  resolveCanvasCreateRoute,
} from '../src/application/map-create-routing.ts';

test('canvas create routing keeps free canvas nodes unparented', () => {
  assert.deepEqual(
    resolveCanvasCreateRoute({
      surface: 'free',
      layerParentNodeId: 10,
    }),
    {
      createMode: 'free-node',
      parentNodeId: null,
      preserveLayerMode: false,
    },
  );
});

test('canvas create routing binds layer creation to the current layer parent', () => {
  assert.deepEqual(
    resolveCanvasCreateRoute({
      surface: 'layers',
      layerParentNodeId: 10,
    }),
    {
      createMode: 'layer-child',
      parentNodeId: 10,
      preserveLayerMode: true,
    },
  );
});

test('canvas create routing creates top-level layer sections when no parent is open', () => {
  assert.deepEqual(
    resolveCanvasCreateRoute({
      surface: 'layers',
      layerParentNodeId: null,
    }),
    {
      createMode: 'layer-child',
      parentNodeId: null,
      preserveLayerMode: true,
    },
  );
});

test('layer child creation uses persisted parent coordinates instead of preview pointer coordinates', () => {
  const route = resolveCanvasCreateRoute({
    surface: 'layers',
    layerParentNodeId: 10,
  });

  assert.deepEqual(
    resolveCanvasCreatePosition({
      route,
      pointerPosition: { x: 260, y: -118 },
      parentPosition: { x: 1000, y: 500 },
      siblingCount: 2,
    }),
    { x: 1320, y: 740 },
  );
});

test('top-level layer creation appends after persisted root positions', () => {
  const route = resolveCanvasCreateRoute({
    surface: 'layers',
    layerParentNodeId: null,
  });

  assert.deepEqual(
    resolveCanvasCreatePosition({
      route,
      pointerPosition: { x: 0, y: 0 },
      topLevelPositions: [
        { x: -200, y: -100 },
        { x: 180, y: 100 },
      ],
    }),
    { x: 540, y: 0 },
  );
});
