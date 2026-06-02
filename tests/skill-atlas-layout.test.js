import test from 'node:test';
import assert from 'node:assert/strict';

import { createGameViewModel } from '../src/game/create-game-view-model.ts';
import { applyRouteOverlayToModel } from '../src/game/route-overlay-model.ts';
import { applySkillAtlasLayoutToModel, createSkillAtlasLayout } from '../src/game/skill-atlas-layout.ts';

const makeNode = (id, title, status = 'active', openActionCount = 0) => ({
  id,
  title,
  type: 'theory',
  status,
  open_action_count: openActionCount,
  next_action_title: openActionCount > 0 ? 'Open lesson' : null,
  x: id * 100,
  y: id * -80,
});

const snapshot = {
  spheres: [
    {
      id: 1,
      name: 'Programming',
      node_count: 6,
      open_action_count: 1,
      directions: [
        {
          id: 10,
          name: 'Programming basics',
          node_count: 6,
          open_action_count: 1,
          skills: [
            {
              id: 100,
              name: 'Code workshop',
              node_count: 6,
              open_action_count: 1,
              nodes: [
                makeNode(1, 'Editor setup', 'done'),
                makeNode(2, 'Values and variables', 'active', 1),
                makeNode(3, 'Expressions'),
                makeNode(4, 'Branching'),
                makeNode(5, 'Loops'),
                makeNode(6, 'Small project checkpoint'),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Math',
      node_count: 3,
      open_action_count: 0,
      directions: [
        {
          id: 20,
          name: 'Discrete math',
          node_count: 3,
          open_action_count: 0,
          skills: [
            {
              id: 200,
              name: 'Logic tower',
              node_count: 3,
              open_action_count: 0,
              nodes: [
                makeNode(7, 'Sets'),
                makeNode(8, 'Logic'),
                makeNode(9, 'Proof checkpoint'),
              ],
            },
          ],
        },
      ],
    },
  ],
  edges: [
    { id: 1, source_node_id: 1, target_node_id: 2, edge_type: 'requires' },
    { id: 2, source_node_id: 2, target_node_id: 3, edge_type: 'supports' },
    { id: 3, source_node_id: 7, target_node_id: 8, edge_type: 'supports' },
  ],
  archivedNodes: [],
  defaultSelection: { nodeId: 2, actionId: null },
};

test('skill atlas layout is deterministic and radial across sectors', () => {
  const first = createSkillAtlasLayout(snapshot, { node: { id: 2 } });
  const second = createSkillAtlasLayout(snapshot, { node: { id: 2 } });

  assert.deepEqual(
    first.nodes.map((node) => [node.stableId, node.x, node.y, node.ring, node.visualType]),
    second.nodes.map((node) => [node.stableId, node.x, node.y, node.ring, node.visualType]),
  );
  assert.equal(first.sectors.length, 2);
  assert.ok(first.bounds.width > 1_400);
  assert.ok(first.bounds.height > 800);
  assert.ok(first.nodes.filter((node) => node.ring >= 4).length >= 9);
  assert.ok(first.nodes.some((node) => node.visualType === 'domain_hub'));
  assert.ok(first.nodes.some((node) => node.visualType === 'course_hub'));
  assert.ok(first.nodes.some((node) => node.visualType === 'boss_node'));
});

test('route overlay changes state metadata without changing atlas positions', () => {
  const base = createSkillAtlasLayout(snapshot, { node: { id: 2 } });
  const withRoute = createSkillAtlasLayout(snapshot, { node: { id: 2 } }, {
    routeOverlay: [
      { nodeId: 1, routeOrder: 1, isComplete: true },
      { nodeId: 2, routeOrder: 2, isCurrent: true },
      { nodeId: 3, routeOrder: 3, isWeak: true },
    ],
  });

  const basePositions = new Map(base.nodes.map((node) => [node.stableId, `${node.x}:${node.y}`]));
  withRoute.nodes.forEach((node) => {
    assert.equal(`${node.x}:${node.y}`, basePositions.get(node.stableId));
  });
  assert.equal(withRoute.nodes.find((node) => node.stableId === 'node:2')?.state, 'current');
  assert.equal(withRoute.nodes.find((node) => node.stableId === 'node:3')?.state, 'weak');
  assert.equal(withRoute.routeEdges.length, 2);
});

test('skill atlas adapter preserves real learning nodes and adds non-editing atlas hubs', () => {
  const graphModel = createGameViewModel(snapshot, { node: { id: 2 }, progress: { completionPercent: 20, openActions: 1 } });
  const atlasModel = applySkillAtlasLayoutToModel(snapshot, graphModel);

  assert.ok(atlasModel.nodes.length > graphModel.nodes.length);
  assert.ok(atlasModel.nodes.some((node) => node.id < 0 && node.atlasNodeType === 'domain_hub'));
  assert.equal(atlasModel.nodes.find((node) => node.id === 2)?.atlasNodeType, 'atomic_node');
  assert.notEqual(atlasModel.nodes.find((node) => node.id === 2)?.position.x, graphModel.nodes.find((node) => node.id === 2)?.position.x);
  assert.equal(atlasModel.isLargeGraph, false);
  assert.ok(atlasModel.edges.some((edge) => edge.fromNodeId < 0 || edge.toNodeId < 0));
});

test('route overlay can annotate atlas model without moving nodes', () => {
  const graphModel = createGameViewModel(snapshot, { node: { id: 2 }, progress: { completionPercent: 20, openActions: 1 } });
  const atlasModel = applySkillAtlasLayoutToModel(snapshot, graphModel);
  const positions = new Map(atlasModel.nodes.map((node) => [node.id, `${node.position.x}:${node.position.y}`]));
  const routeModel = applyRouteOverlayToModel(atlasModel, [
    { nodeId: 1, routeOrder: 1, isComplete: true },
    { nodeId: 2, routeOrder: 2, isCurrentTarget: true, currentMasteryRank: 1 },
    { nodeId: 3, routeOrder: 3, isWeakSpot: true },
  ]);

  routeModel.nodes.forEach((node) => {
    assert.equal(`${node.position.x}:${node.position.y}`, positions.get(node.id));
  });
  assert.equal(routeModel.nodes.find((node) => node.id === 2)?.isCurrentRouteTarget, true);
  assert.equal(routeModel.nodes.find((node) => node.id === 3)?.isWeakRouteNode, true);
});
