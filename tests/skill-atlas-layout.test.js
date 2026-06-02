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

const distance = (left, right) => Math.hypot(left.x - right.x, left.y - right.y);

const stableNode = (layout, stableId) => {
  const node = layout.nodes.find((candidate) => candidate.stableId === stableId);
  assert.ok(node, `Expected ${stableId} to exist`);
  return node;
};

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

test('skill atlas layout is deterministic with local atomic clusters', () => {
  const first = createSkillAtlasLayout(snapshot, { node: { id: 2 } });
  const second = createSkillAtlasLayout(snapshot, { node: { id: 2 } });

  assert.deepEqual(
    first.nodes.map((node) => [node.stableId, node.x, node.y, node.ring, node.visualType]),
    second.nodes.map((node) => [node.stableId, node.x, node.y, node.ring, node.visualType]),
  );
  assert.deepEqual(
    first.edges.map((edge) => [edge.id, edge.fromStableId, edge.toStableId, edge.edgeType, edge.edgeRole, edge.isOverlay]),
    second.edges.map((edge) => [edge.id, edge.fromStableId, edge.toStableId, edge.edgeType, edge.edgeRole, edge.isOverlay]),
  );
  assert.equal(first.sectors.length, 2);

  const programmingHub = stableNode(first, 'skill:100');
  const mathHub = stableNode(first, 'skill:200');
  [1, 2, 3, 4, 5, 6].forEach((nodeId) => {
    assert.ok(distance(stableNode(first, `node:${nodeId}`), programmingHub) < 170);
  });
  [7, 8, 9].forEach((nodeId) => {
    assert.ok(distance(stableNode(first, `node:${nodeId}`), mathHub) < 170);
  });

  const visualTypes = new Set(first.nodes.map((node) => node.visualType));
  assert.ok(visualTypes.has('root'));
  assert.ok(visualTypes.has('domain_hub'));
  assert.ok(visualTypes.has('course_hub'));
  assert.ok(visualTypes.has('topic_node'));
  assert.ok(visualTypes.has('atomic_node'));
  assert.ok(visualTypes.has('boss_node'));

  const edgeRoles = new Set(first.edges.map((edge) => edge.edgeRole));
  assert.ok(edgeRoles.has('structure_root'));
  assert.ok(edgeRoles.has('structure_branch'));
  assert.ok(edgeRoles.has('local_cluster'));
  assert.ok(edgeRoles.has('graph'));
});

test('route overlay changes state metadata without filtering or moving the full atlas', () => {
  const base = createSkillAtlasLayout(snapshot, { node: { id: 2 } });
  const withRoute = createSkillAtlasLayout(snapshot, { node: { id: 2 } }, {
    routeOverlay: [
      { nodeId: 1, routeOrder: 1, isComplete: true },
      { nodeId: 2, routeOrder: 2, isCurrent: true },
      { nodeId: 3, routeOrder: 3, isWeak: true },
    ],
  });

  const basePositions = new Map(base.nodes.map((node) => [node.stableId, `${node.x}:${node.y}`]));
  assert.deepEqual(
    withRoute.nodes.map((node) => node.stableId).sort(),
    base.nodes.map((node) => node.stableId).sort(),
  );
  withRoute.nodes.forEach((node) => {
    assert.equal(`${node.x}:${node.y}`, basePositions.get(node.stableId));
  });
  assert.equal(withRoute.nodes.find((node) => node.stableId === 'node:2')?.state, 'current');
  assert.equal(withRoute.nodes.find((node) => node.stableId === 'node:3')?.state, 'weak');
  assert.equal(withRoute.routeEdges.length, 2);
  assert.ok(withRoute.routeEdges.every((edge) => edge.edgeRole === 'route_overlay' && edge.isOverlay));
});

test('skill atlas root uses the program title instead of a technical atlas label', () => {
  const layout = createSkillAtlasLayout(snapshot, { node: { id: 2 } }, {
    programTitle: 'Бакалавриат по информатике',
  });
  const root = stableNode(layout, 'program:root');
  const programmingSphere = stableNode(layout, 'sphere:1');

  assert.equal(root.title, 'Бакалавриат по информатике');
  assert.equal(root.path, 'Бакалавриат по информатике');
  assert.equal(programmingSphere.path, 'Бакалавриат по информатике');
  assert.notEqual(root.title, 'Program Atlas');
});

test('skill atlas adapter preserves real learning nodes and adds non-editing atlas hubs', () => {
  const graphModel = createGameViewModel(snapshot, { node: { id: 2 }, progress: { completionPercent: 20, openActions: 1 } });
  const atlasModel = applySkillAtlasLayoutToModel(snapshot, graphModel, { programTitle: 'Бакалавриат по информатике' });

  assert.ok(atlasModel.nodes.length > graphModel.nodes.length);
  assert.ok(atlasModel.nodes.some((node) => node.atlasNodeType === 'root' && node.title === 'Бакалавриат по информатике'));
  assert.ok(!atlasModel.nodes.some((node) => node.atlasNodeType === 'root' && node.title === 'Program Atlas'));
  assert.ok(atlasModel.nodes.some((node) => node.id < 0 && node.atlasNodeType === 'domain_hub'));
  assert.equal(atlasModel.nodes.find((node) => node.id === 2)?.atlasNodeType, 'atomic_node');
  assert.notEqual(atlasModel.nodes.find((node) => node.id === 2)?.position.x, graphModel.nodes.find((node) => node.id === 2)?.position.x);
  assert.equal(atlasModel.isLargeGraph, false);
  assert.ok(atlasModel.edges.some((edge) => edge.fromNodeId < 0 || edge.toNodeId < 0));
});

test('skill atlas renders catalog courses as course hubs without duplicate skill containers for any course kind', () => {
  const courseLinks = JSON.stringify({
    kind: 'future_program_course',
    courseKey: 'programming-intro',
    atlasHubType: 'course_hub',
  });
  const courseSnapshot = {
    spheres: [
      {
        id: 1,
        name: 'Программирование',
        node_count: 1,
        open_action_count: 1,
        directions: [
          {
            id: 10,
            name: 'Курсы',
            node_count: 1,
            open_action_count: 1,
            skills: [
              {
                id: 100,
                name: 'Введение в программирование',
                node_count: 1,
                open_action_count: 1,
                nodes: [
                  {
                    ...makeNode(1, 'Введение в программирование', 'active', 1),
                    links: courseLinks,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [],
    archivedNodes: [],
    defaultSelection: { nodeId: 1, actionId: null },
  };

  const layout = createSkillAtlasLayout(courseSnapshot);

  assert.equal(layout.nodes.some((node) => node.stableId === 'skill:100'), false);
  assert.equal(stableNode(layout, 'node:1').visualType, 'course_hub');
  assert.equal(stableNode(layout, 'node:1').ring, 3);
  assert.ok(layout.edges.some((edge) => edge.fromStableId === 'direction:10' && edge.toStableId === 'node:1'));
});

test('skill atlas renders NLH cash course catalog nodes through the same course abstraction', () => {
  const nlhLinks = JSON.stringify({
    kind: 'nlh_cash_course',
    courseKey: 'nlh-cash-intro',
    atlasHubType: 'risk_hub',
  });
  const nlhSnapshot = {
    spheres: [
      {
        id: 1,
        name: 'Вход и безопасность',
        node_count: 1,
        open_action_count: 1,
        directions: [
          {
            id: 10,
            name: 'Курсы',
            node_count: 1,
            open_action_count: 1,
            skills: [
              {
                id: 100,
                name: 'Что такое NLH cash',
                node_count: 1,
                open_action_count: 1,
                nodes: [
                  {
                    ...makeNode(1, 'Что такое NLH cash', 'active', 1),
                    links: nlhLinks,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [],
    archivedNodes: [],
    defaultSelection: { nodeId: 1, actionId: null },
  };

  const layout = createSkillAtlasLayout(nlhSnapshot, { node: { id: 1 } }, { programTitle: 'NLH cash' });

  assert.equal(layout.nodes.some((node) => node.stableId === 'skill:100'), false);
  assert.equal(stableNode(layout, 'program:root').title, 'NLH cash');
  assert.equal(stableNode(layout, 'node:1').visualType, 'course_hub');
  assert.equal(stableNode(layout, 'node:1').state, 'current');
  assert.ok(layout.edges.some((edge) => edge.fromStableId === 'direction:10' && edge.toStableId === 'node:1'));
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
  assert.equal(routeModel.nodes.length, atlasModel.nodes.length);
  assert.equal(routeModel.nodes.find((node) => node.id === 2)?.isCurrentRouteTarget, true);
  assert.equal(routeModel.nodes.find((node) => node.id === 3)?.isWeakRouteNode, true);
});
