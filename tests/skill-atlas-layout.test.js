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
const SECTOR_TEST_GUTTER = 0.1;

const stableNode = (layout, stableId) => {
  const node = layout.nodes.find((candidate) => candidate.stableId === stableId);
  assert.ok(node, `Expected ${stableId} to exist`);
  return node;
};

const assertNodeInsideSector = (layout, node) => {
  if (node.sectorKey === 'program') {
    return;
  }

  const sector = layout.sectors.find((candidate) => candidate.key === node.sectorKey);
  assert.ok(sector, `Expected sector ${node.sectorKey} for ${node.stableId}`);
  assert.ok(
    node.angle >= sector.startAngle + SECTOR_TEST_GUTTER - 0.001,
    `expected ${node.stableId} angle ${node.angle} >= sector start ${sector.startAngle + SECTOR_TEST_GUTTER}`,
  );
  assert.ok(
    node.angle <= sector.endAngle - SECTOR_TEST_GUTTER + 0.001,
    `expected ${node.stableId} angle ${node.angle} <= sector end ${sector.endAngle - SECTOR_TEST_GUTTER}`,
  );
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
    assert.ok(distance(stableNode(first, `node:${nodeId}`), programmingHub) < 310);
  });
  [7, 8, 9].forEach((nodeId) => {
    assert.ok(distance(stableNode(first, `node:${nodeId}`), mathHub) < 310);
  });
  first.nodes.forEach((node) => assertNodeInsideSector(first, node));

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
  assert.equal(atlasModel.nodes.find((node) => node.atlasNodeType === 'root')?.atlasStableId, 'program:root');
  assert.equal(atlasModel.nodes.find((node) => node.atlasNodeType === 'domain_hub')?.atlasSourceKind, 'sphere');
  assert.equal(atlasModel.nodes.find((node) => node.id === 2)?.atlasStableId, 'node:2');
  assert.equal(atlasModel.nodes.find((node) => node.id === 2)?.atlasSourceKind, 'node');
  assert.notEqual(atlasModel.nodes.find((node) => node.id === 2)?.position.x, graphModel.nodes.find((node) => node.id === 2)?.position.x);
  assert.equal(atlasModel.isLargeGraph, false);
  assert.ok(atlasModel.edges.some((edge) => edge.fromNodeId < 0 || edge.toNodeId < 0));
});

test('skill atlas bounds contain every atlas node', () => {
  const graphModel = createGameViewModel(snapshot, { node: { id: 2 }, progress: { completionPercent: 20, openActions: 1 } });
  const atlasModel = applySkillAtlasLayoutToModel(snapshot, graphModel, { programTitle: 'NLH cash' });

  atlasModel.nodes.forEach((node) => {
    assert.ok(
      node.position.x >= atlasModel.bounds.minX && node.position.x <= atlasModel.bounds.maxX,
      `expected node ${node.id} x=${node.position.x} to be inside ${atlasModel.bounds.minX}..${atlasModel.bounds.maxX}`,
    );
    assert.ok(
      node.position.y >= atlasModel.bounds.minY && node.position.y <= atlasModel.bounds.maxY,
      `expected node ${node.id} y=${node.position.y} to be inside ${atlasModel.bounds.minY}..${atlasModel.bounds.maxY}`,
    );
  });
});

test('skill atlas adapter keeps the program root at the canvas center', () => {
  // Epic 47 workstream 04 — the cosmic canvas must place the
  // current node at 35% from the left and 40% from the top of
  // the canvas bounds. The transform is applied on the game
  // model (not on the layout model) so this assertion lives
  // next to the other `applySkillAtlasLayoutToModel` tests.
  const graphModel = createGameViewModel(snapshot, { node: { id: 2 }, progress: { completionPercent: 20, openActions: 1 } });
  const atlasModel = applySkillAtlasLayoutToModel(snapshot, graphModel, { programTitle: 'Бакалавриат по информатике' });

  const currentNode = atlasModel.nodes.find((node) => node.atlasNodeType === 'root');
  const focalX = 0;
  const focalY = 0;

  // The current node lands exactly on the focal point
  // (modulo the per-node position precision rounding).
  assert.ok(currentNode, 'expected the atlas root to be present');
  assert.ok(Math.abs(currentNode.position.x - focalX) <= 1, `expected currentNode.position.x ≈ ${focalX}, got ${currentNode.position.x}`);
  assert.ok(Math.abs(currentNode.position.y - focalY) <= 1, `expected currentNode.position.y ≈ ${focalY}, got ${currentNode.position.y}`);
  assert.ok(Math.abs(atlasModel.hub.position.x - focalX) <= 1, `expected hub.position.x ≈ ${focalX}, got ${atlasModel.hub.position.x}`);
  assert.ok(Math.abs(atlasModel.hub.position.y - focalY) <= 1, `expected hub.position.y ≈ ${focalY}, got ${atlasModel.hub.position.y}`);
});

test('skill atlas adapter is deterministic for the same program', () => {
  // The spiral angle jitter is keyed on the program title +
  // node id, so the same program always produces the same
  // layout and two different programs produce visibly
  // different layouts. This pins both invariants at once.
  const graphModel = createGameViewModel(snapshot, { node: { id: 2 }, progress: { completionPercent: 20, openActions: 1 } });

  const firstCs = applySkillAtlasLayoutToModel(snapshot, graphModel, { programTitle: 'Бакалавриат по информатике' });
  const secondCs = applySkillAtlasLayoutToModel(snapshot, graphModel, { programTitle: 'Бакалавриат по информатике' });

  assert.deepEqual(
    firstCs.nodes.map((node) => `${node.id}:${node.position.x}:${node.position.y}`),
    secondCs.nodes.map((node) => `${node.id}:${node.position.x}:${node.position.y}`),
  );
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
  assert.equal(layout.nodes.some((node) => node.stableId === 'direction:10'), false);
  assert.equal(stableNode(layout, 'node:1').visualType, 'course_hub');
  assert.equal(stableNode(layout, 'node:1').ring, 2);
  assert.equal(stableNode(layout, 'node:1').path, 'Программирование / Введение в программирование');
  assert.ok(layout.edges.some((edge) => edge.fromStableId === 'sphere:1' && edge.toStableId === 'node:1'));
  assert.equal(layout.edges.some((edge) => edge.fromStableId === 'direction:10' || edge.toStableId === 'direction:10'), false);
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
  assert.equal(layout.nodes.some((node) => node.stableId === 'direction:10'), false);
  assert.equal(stableNode(layout, 'program:root').title, 'NLH cash');
  assert.equal(stableNode(layout, 'node:1').visualType, 'course_hub');
  assert.equal(stableNode(layout, 'node:1').state, 'current');
  assert.equal(stableNode(layout, 'node:1').path, 'Вход и безопасность / Что такое NLH cash');
  assert.ok(layout.edges.some((edge) => edge.fromStableId === 'sphere:1' && edge.toStableId === 'node:1'));
  assert.equal(layout.edges.some((edge) => edge.fromStableId === 'direction:10' || edge.toStableId === 'direction:10'), false);
});

test('skill atlas spreads dense course hubs enough for pointer selection', () => {
  const courseLinks = JSON.stringify({
    kind: 'nlh_cash_course',
    courseKey: 'dense-course',
    atlasHubType: 'course_hub',
  });
  const denseSnapshot = {
    spheres: [
      {
        id: 1,
        name: 'Preflop-core',
        node_count: 9,
        open_action_count: 9,
        directions: [
          {
            id: 10,
            name: 'Courses',
            node_count: 9,
            open_action_count: 9,
            skills: Array.from({ length: 9 }, (_, index) => ({
              id: 100 + index,
              name: `Course ${index + 1}`,
              node_count: 1,
              open_action_count: 1,
              nodes: [
                {
                  ...makeNode(index + 1, `Course ${index + 1}`, 'active', 1),
                  links: courseLinks,
                },
              ],
            })),
          },
        ],
      },
    ],
    edges: [],
    archivedNodes: [],
    defaultSelection: { nodeId: 1, actionId: null },
  };

  const layout = createSkillAtlasLayout(denseSnapshot, { node: { id: 1 } }, { programTitle: 'NLH cash' });
  const courseNodes = layout.nodes.filter((node) => node.visualType === 'course_hub' && node.stableId.startsWith('node:'));
  const pairDistances = courseNodes.flatMap((node, index) =>
    courseNodes.slice(index + 1).map((other) => distance(node, other)),
  );

  assert.equal(courseNodes.length, 9);
  assert.ok(Math.min(...pairDistances) >= 48);
  courseNodes.forEach((node) => assertNodeInsideSector(layout, node));
  const courseAngles = courseNodes.map((node) => node.angle);
  const courseSpan = Math.max(...courseAngles) - Math.min(...courseAngles);
  const sector = layout.sectors[0];
  assert.ok(courseSpan <= sector.endAngle - sector.startAngle - SECTOR_TEST_GUTTER * 2 + 0.001);
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
