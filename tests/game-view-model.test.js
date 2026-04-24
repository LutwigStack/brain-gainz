import test from 'node:test';
import assert from 'node:assert/strict';

import { createGameViewModel } from '../src/game/create-game-view-model.ts';

test('game view model maps navigation snapshot into renderable nodes, persisted edges, biomes, and hero focus', () => {
  const snapshot = {
    spheres: [
      {
        id: 1,
        name: 'Работа',
        directions: [
          {
            id: 10,
            name: 'Продукт',
            node_count: 2,
            open_action_count: 2,
            skills: [
              {
                id: 100,
                name: 'Pixi',
                node_count: 2,
                open_action_count: 2,
                nodes: [
                  {
                    id: 1000,
                    title: 'Карта',
                    type: 'project',
                    status: 'active',
                    open_action_count: 2,
                    next_action_title: 'Нарисовать сцену',
                    x: 120,
                    y: -60,
                  },
                  {
                    id: 1001,
                    title: 'Герой',
                    type: 'habit',
                    status: 'done',
                    open_action_count: 0,
                    next_action_title: null,
                    x: 240,
                    y: 30,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [
      {
        id: 77,
        source_node_id: 1000,
        target_node_id: 1001,
        edge_type: 'supports',
      },
    ],
    defaultSelection: { nodeId: 1000, actionId: 5000 },
  };

  const focus = {
    node: { id: 1000 },
    progress: { completionPercent: 50, openActions: 1 },
  };

  const model = createGameViewModel(snapshot, focus);

  assert.equal(model.nodes.length, 2);
  assert.equal(model.edges.length, 1);
  assert.equal(model.edges[0].id, 77);
  assert.equal(model.edges[0].type, 'supports');
  assert.equal(model.biomes.length, 1);
  assert.equal(model.legend.length, 5);
  assert.equal(model.highlightedNodeId, 1000);
  assert.equal(model.hero.nodeId, 1000);
  assert.equal(model.hub.label, 'Core');
  assert.equal(model.nodes[0].state, 'active');
  assert.equal(model.nodes[1].state, 'completed');
  assert.equal(model.nodes[0].position.x, 120);
  assert.equal(model.nodes[0].position.y, -60);
  assert.equal(model.nodes[1].biomeId, model.biomes[0].id);
});

test('game view model keeps the hero at the minimum visible energy when progress is 0 percent', () => {
  const snapshot = {
    spheres: [
      {
        id: 1,
        name: 'Работа',
        directions: [
          {
            id: 10,
            name: 'Продукт',
            node_count: 1,
            open_action_count: 0,
            skills: [
              {
                id: 100,
                name: 'Pixi',
                node_count: 1,
                open_action_count: 0,
                nodes: [
                  {
                    id: 1000,
                    title: 'Карта',
                    type: 'project',
                    status: 'active',
                    open_action_count: 0,
                    next_action_title: null,
                    x: null,
                    y: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [],
    defaultSelection: { nodeId: 1000, actionId: 5000 },
  };

  const model = createGameViewModel(snapshot, {
    node: { id: 1000 },
    progress: { completionPercent: 0, openActions: 0 },
  });

  assert.equal(model.hero.energy, 0.2);
});

test('game view model exposes paused and locked node states from the navigation snapshot', () => {
  const snapshot = {
    spheres: [
      {
        id: 1,
        name: 'Работа',
        directions: [
          {
            id: 10,
            name: 'Продукт',
            node_count: 2,
            open_action_count: 1,
            skills: [
              {
                id: 100,
                name: 'Pixi',
                node_count: 2,
                open_action_count: 1,
                nodes: [
                  {
                    id: 1000,
                    title: 'Пауза',
                    type: 'project',
                    status: 'paused',
                    open_action_count: 1,
                    next_action_title: null,
                    x: null,
                    y: null,
                  },
                  {
                    id: 1001,
                    title: 'Закрыто',
                    type: 'habit',
                    status: 'active',
                    open_action_count: 0,
                    next_action_title: null,
                    x: null,
                    y: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [],
    defaultSelection: { nodeId: 1000, actionId: 5000 },
  };

  const model = createGameViewModel(snapshot, null);

  assert.equal(model.nodes[0].state, 'paused');
  assert.equal(model.nodes[1].state, 'locked');
});

test('game view model falls back to derived positions only for nodes without persisted coordinates', () => {
  const snapshot = {
    spheres: [
      {
        id: 1,
        name: 'Работа',
        directions: [
          {
            id: 10,
            name: 'Система',
            node_count: 2,
            open_action_count: 1,
            skills: [
              {
                id: 100,
                name: 'Граф',
                node_count: 2,
                open_action_count: 1,
                nodes: [
                  {
                    id: 1000,
                    title: 'Сохранённая точка',
                    type: 'task',
                    status: 'active',
                    open_action_count: 1,
                    next_action_title: null,
                    x: 500,
                    y: 260,
                  },
                  {
                    id: 1001,
                    title: 'Без координат',
                    type: 'task',
                    status: 'active',
                    open_action_count: 0,
                    next_action_title: null,
                    x: null,
                    y: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [],
    defaultSelection: { nodeId: 1000, actionId: 5000 },
  };

  const model = createGameViewModel(snapshot, null);
  const persisted = model.nodes.find((node) => node.id === 1000);
  const fallback = model.nodes.find((node) => node.id === 1001);

  assert.equal(persisted?.position.x, 500);
  assert.equal(persisted?.position.y, 260);
  assert.notEqual(fallback?.position.x, null);
  assert.notEqual(fallback?.position.y, null);
  assert.notEqual(fallback?.position.x, 500);
});

test('game view model can render only the selected sphere', () => {
  const snapshot = {
    spheres: [
      {
        id: 1,
        name: 'Работа',
        directions: [
          {
            id: 10,
            name: 'Продукт',
            node_count: 1,
            open_action_count: 0,
            skills: [
              {
                id: 100,
                name: 'Граф',
                node_count: 1,
                open_action_count: 0,
                nodes: [{ id: 1000, title: 'Старый узел', type: 'task', status: 'active', open_action_count: 0 }],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'BrainGainz',
        directions: [
          {
            id: 20,
            name: 'Система',
            node_count: 2,
            open_action_count: 1,
            skills: [
              {
                id: 200,
                name: 'Концепт',
                node_count: 2,
                open_action_count: 1,
                nodes: [
                  { id: 2000, title: 'Корень', type: 'project', status: 'active', open_action_count: 1 },
                  { id: 2001, title: 'Ветка', type: 'theory', status: 'active', open_action_count: 0 },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [
      { id: 1, source_node_id: 1000, target_node_id: 2000, edge_type: 'supports' },
      { id: 2, source_node_id: 2000, target_node_id: 2001, edge_type: 'supports' },
    ],
    defaultSelection: { nodeId: 2000, actionId: null },
  };

  const model = createGameViewModel(snapshot, null, { visibleSphereId: 2 });

  assert.deepEqual(model.nodes.map((node) => node.id), [2000, 2001]);
  assert.deepEqual(model.edges.map((edge) => edge.id), [2]);
  assert.equal(model.biomes.length, 1);
  assert.equal(model.biomes[0].name, 'BrainGainz');
});

test('game view model keeps all detail nodes while marking overview metadata', () => {
  const nodes = Array.from({ length: 41 }, (_, index) => ({
    id: index + 1,
    title: index === 0 ? 'Root' : index <= 7 ? `Section ${index}` : `Leaf ${index}`,
    type: index === 0 ? 'project' : 'theory',
    status: 'active',
    open_action_count: 0,
    x: index === 0 ? 0 : index <= 7 ? 280 : 560,
    y: index === 0 ? 0 : index <= 7 ? index * 90 : (index - 8) * 40,
  }));
  const edges = [
    ...nodes.slice(1, 8).map((node, index) => ({
      id: index + 1,
      source_node_id: 1,
      target_node_id: node.id,
      edge_type: 'supports',
    })),
    ...nodes.slice(8).map((node, index) => ({
      id: index + 20,
      source_node_id: 2,
      target_node_id: node.id,
      edge_type: 'supports',
    })),
  ];
  const snapshot = {
    spheres: [
      {
        id: 1,
        name: 'Алгебра I',
        directions: [
          {
            id: 10,
            name: 'Курс',
            node_count: nodes.length,
            open_action_count: 0,
            skills: [
              {
                id: 100,
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
  };

  const model = createGameViewModel(snapshot, null, { visibleSphereId: 1 });

  assert.equal(model.nodes.length, 41);
  assert.equal(model.isLargeGraph, true);
  assert.equal(model.nodes.find((node) => node.id === 1)?.isOverviewVisible, true);
  assert.equal(model.nodes.find((node) => node.id === 2)?.descendantCount, 33);
  assert.equal(model.nodes.find((node) => node.id === 8)?.isOverviewVisible, true);
  assert.equal(model.nodes.find((node) => node.id === 9)?.isOverviewVisible, false);
  assert.ok(model.overviewBounds);
});
