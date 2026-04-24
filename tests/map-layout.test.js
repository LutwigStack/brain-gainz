import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBulkLayoutPreview, resolveBulkLayoutTargetIds } from '../src/application/map-layout.ts';

const snapshot = {
  spheres: [
    {
      id: 1,
      name: 'Работа',
      node_count: 3,
      open_action_count: 2,
      directions: [
        {
          id: 10,
          sphere_id: 1,
          name: 'Продукт',
          node_count: 3,
          open_action_count: 2,
          skills: [
            {
              id: 100,
              direction_id: 10,
              name: 'Цикл',
              node_count: 3,
              open_action_count: 2,
              nodes: [
                { id: 1, skill_id: 100, title: 'A', type: 'task', status: 'active', open_action_count: 1 },
                { id: 2, skill_id: 100, title: 'B', type: 'task', status: 'ready', open_action_count: 1 },
                { id: 3, skill_id: 100, title: 'C', type: 'task', status: 'paused', open_action_count: 0 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Учёба',
      node_count: 1,
      open_action_count: 1,
      directions: [
        {
          id: 20,
          sphere_id: 2,
          name: 'Математика',
          node_count: 1,
          open_action_count: 1,
          skills: [
            {
              id: 200,
              direction_id: 20,
              name: 'Алгебра',
              node_count: 1,
              open_action_count: 1,
              nodes: [{ id: 4, skill_id: 200, title: 'D', type: 'theory', status: 'ready', open_action_count: 1 }],
            },
          ],
        },
      ],
    },
  ],
  edges: [
    { id: 11, source_node_id: 1, target_node_id: 2, edge_type: 'requires' },
    { id: 12, source_node_id: 3, target_node_id: 1, edge_type: 'supports' },
    { id: 13, source_node_id: 4, target_node_id: 3, edge_type: 'relates_to' },
  ],
  defaultSelection: { nodeId: 1, actionId: null },
};

const focus = {
  node: {
    id: 1,
    title: 'A',
    type: 'task',
    status: 'active',
    sphere_id: 1,
    sphere_name: 'Работа',
    direction_id: 10,
    direction_name: 'Продукт',
    skill_id: 100,
    skill_name: 'Цикл',
  },
};

const positionIndex = new Map([
  [1, { x: 0, y: 0 }],
  [2, { x: 120, y: 40 }],
  [3, { x: -80, y: 110 }],
  [4, { x: 520, y: 320 }],
]);

test('resolveBulkLayoutTargetIds returns current region nodes for region scope', () => {
  assert.deepEqual(resolveBulkLayoutTargetIds(snapshot, focus, 'region', 1), [1, 2, 3]);
});

test('resolveBulkLayoutTargetIds returns one-hop neighborhood around focus node', () => {
  assert.deepEqual(resolveBulkLayoutTargetIds(snapshot, focus, 'focus-neighborhood', 1), [1, 2, 3]);
});

test('buildBulkLayoutPreview creates a tidy preview for the current region', () => {
  const preview = buildBulkLayoutPreview({
    snapshot,
    focus,
    scope: 'region',
    strategy: 'tidy',
    selectedSphereId: 1,
    positionIndex,
  });

  assert.equal(preview?.nodeIds.length, 3);
  assert.ok(preview?.positions[1]);
  assert.ok(preview?.positions[2]);
  assert.ok(preview?.positions[3]);
});

test('buildBulkLayoutPreview keeps the focus node in radial preview when focus-neighborhood is selected', () => {
  const preview = buildBulkLayoutPreview({
    snapshot,
    focus,
    scope: 'focus-neighborhood',
    strategy: 'radial',
    selectedSphereId: 1,
    positionIndex,
  });

  assert.deepEqual(preview?.positions[1], { x: 0, y: 0 });
  assert.equal(preview?.nodeIds.includes(4), false);
});
