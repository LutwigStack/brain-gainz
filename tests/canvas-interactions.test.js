import test from 'node:test';
import assert from 'node:assert/strict';

import { createQuadraticRoute, getPointToPolylineDistance } from '../src/game/edge-geometry.ts';
import { resolveInteractionCapabilities } from '../src/game/interaction-capabilities.ts';

test('canvas interaction modes expose the intended editing capabilities', () => {
  assert.deepEqual(resolveInteractionCapabilities('free-edit'), {
    canDragNodes: true,
    canDragGates: true,
    canCreateEdges: true,
    canCreateChildFromOutput: true,
  });
  assert.deepEqual(resolveInteractionCapabilities('layer-edit'), {
    canDragNodes: false,
    canDragGates: true,
    canCreateEdges: true,
    canCreateChildFromOutput: true,
  });
  assert.deepEqual(resolveInteractionCapabilities('readonly'), {
    canDragNodes: false,
    canDragGates: false,
    canCreateEdges: false,
    canCreateChildFromOutput: false,
  });
});

test('curved edge hit-test follows the quadratic route instead of the center line', () => {
  const route = createQuadraticRoute({ x: 0, y: 0 }, { x: 200, y: 0 }, 1, 0.4);
  const curvedPoint = route[Math.floor(route.length / 2)];
  const straightMidpoint = { x: 100, y: 0 };

  assert.equal(getPointToPolylineDistance(curvedPoint, route), 0);
  assert.ok(getPointToPolylineDistance(straightMidpoint, route) > 10);
});
