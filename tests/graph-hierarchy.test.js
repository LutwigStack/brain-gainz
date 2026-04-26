import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGraphHierarchyIndex, isOverviewNodeVisible } from '../src/application/graph-hierarchy.ts';

const makeNode = (id, title = `Node ${id}`) => ({
  id,
  skill_id: 100,
  title,
  type: id === 1 ? 'project' : 'theory',
  status: 'active',
  open_action_count: 0,
});

const makeSnapshot = (nodes, edges) => ({
  spheres: [
    {
      id: 1,
      name: 'Алгебра I',
      node_count: nodes.length,
      open_action_count: 0,
      directions: [
        {
          id: 10,
          sphere_id: 1,
          name: 'Курс',
          node_count: nodes.length,
          open_action_count: 0,
          skills: [
            {
              id: 100,
              direction_id: 10,
              name: 'Карта',
              node_count: nodes.length,
              open_action_count: 0,
              nodes,
            },
          ],
        },
      ],
    },
  ],
  edges,
  defaultSelection: { nodeId: 1, actionId: null },
});

test('graph hierarchy builds depth from supports edges', () => {
  const snapshot = makeSnapshot(
    [makeNode(1), makeNode(2), makeNode(3)],
    [
      { id: 1, source_node_id: 1, target_node_id: 2, edge_type: 'supports' },
      { id: 2, source_node_id: 2, target_node_id: 3, edge_type: 'supports' },
    ],
  );

  const hierarchy = buildGraphHierarchyIndex(snapshot, 1, 3);

  assert.equal(hierarchy.entries.get(1)?.depth, 0);
  assert.equal(hierarchy.entries.get(2)?.depth, 1);
  assert.equal(hierarchy.entries.get(3)?.depth, 2);
  assert.deepEqual([...hierarchy.selectedPathIds], [3, 2, 1]);
});

test('graph hierarchy reverses requires edges and ignores relates_to', () => {
  const snapshot = makeSnapshot(
    [makeNode(1), makeNode(2), makeNode(3)],
    [
      { id: 1, source_node_id: 2, target_node_id: 1, edge_type: 'requires' },
      { id: 2, source_node_id: 3, target_node_id: 2, edge_type: 'relates_to' },
    ],
  );

  const hierarchy = buildGraphHierarchyIndex(snapshot, 1, 2);

  assert.equal(hierarchy.entries.get(2)?.parentId, 1);
  assert.equal(hierarchy.entries.get(2)?.depth, 1);
  assert.equal(hierarchy.entries.get(3)?.parentId, null);
  assert.equal(hierarchy.entries.get(3)?.depth, 0);
});

test('overview visibility keeps root, sections, and selected path', () => {
  const snapshot = makeSnapshot(
    [makeNode(1, 'Root'), makeNode(2, 'I'), makeNode(3, 'II'), makeNode(4, 'Topic'), makeNode(5, 'Leaf'), makeNode(6, 'Hidden leaf')],
    [
      { id: 1, source_node_id: 1, target_node_id: 2, edge_type: 'supports' },
      { id: 2, source_node_id: 1, target_node_id: 3, edge_type: 'supports' },
      { id: 3, source_node_id: 2, target_node_id: 4, edge_type: 'supports' },
      { id: 4, source_node_id: 4, target_node_id: 5, edge_type: 'supports' },
      { id: 5, source_node_id: 3, target_node_id: 6, edge_type: 'supports' },
    ],
  );

  const hierarchy = buildGraphHierarchyIndex(snapshot, 1, 5);

  assert.equal(isOverviewNodeVisible(hierarchy.entries.get(1)), true);
  assert.equal(isOverviewNodeVisible(hierarchy.entries.get(2)), true);
  assert.equal(isOverviewNodeVisible(hierarchy.entries.get(3)), true);
  assert.equal(isOverviewNodeVisible(hierarchy.entries.get(4)), true);
  assert.equal(isOverviewNodeVisible(hierarchy.entries.get(5)), true);
  assert.equal(isOverviewNodeVisible(hierarchy.entries.get(6)), false);
  assert.equal(hierarchy.entries.get(2)?.descendantCount, 2);
});

test('algebra-style root can expose seven first-level sections', () => {
  const sectionIds = [2, 3, 4, 5, 6, 7, 8];
  const snapshot = makeSnapshot(
    [makeNode(1, 'Root'), ...sectionIds.map((id, index) => makeNode(id, `${index + 1}`))],
    sectionIds.map((id, index) => ({
      id: index + 1,
      source_node_id: 1,
      target_node_id: id,
      edge_type: 'supports',
    })),
  );

  const hierarchy = buildGraphHierarchyIndex(snapshot, 1, 1);

  assert.deepEqual(hierarchy.roots, [1]);
  assert.equal(hierarchy.entries.get(1)?.childIds.length, 7);
});

test('graph hierarchy orders roots and children lexicographically by title', () => {
  const snapshot = makeSnapshot(
    [
      makeNode(1, 'Root'),
      makeNode(2, 'VII. Рациональные дроби'),
      makeNode(3, 'I. Системы линейных уравнений'),
      makeNode(4, 'III. Теория определителей'),
      makeNode(5, 'II. Матричная алгебра'),
      makeNode(6, 'Beta'),
      makeNode(7, 'Alpha'),
    ],
    [
      { id: 1, source_node_id: 1, target_node_id: 2, edge_type: 'supports' },
      { id: 2, source_node_id: 1, target_node_id: 3, edge_type: 'supports' },
      { id: 3, source_node_id: 1, target_node_id: 4, edge_type: 'supports' },
      { id: 4, source_node_id: 1, target_node_id: 5, edge_type: 'supports' },
    ],
  );

  const hierarchy = buildGraphHierarchyIndex(snapshot, 1, 1);

  assert.deepEqual(hierarchy.roots, [7, 6, 1]);
  assert.deepEqual(hierarchy.entries.get(1)?.childIds, [3, 5, 4, 2]);
});
