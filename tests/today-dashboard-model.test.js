import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDailyTaskCards, buildMiniMapPreview } from '../src/components/today-dashboard-model.ts';

const routeItem = (overrides = {}) => ({
  id: overrides.id ?? 1,
  node_id: overrides.node_id ?? overrides.id ?? 1,
  knowledge_node_id: null,
  title: overrides.title ?? `Node ${overrides.id ?? 1}`,
  path: overrides.path ?? 'Campaign / Skill',
  required_mastery_level: overrides.required_mastery_level ?? 'confirmed',
  route_order: overrides.route_order ?? overrides.id ?? 1,
  route_stage: overrides.route_stage ?? 'Stage A',
  current_mastery_level: null,
  current_mastery_rank: overrides.current_mastery_rank ?? 0,
  is_required: overrides.is_required ?? 1,
  is_complete: overrides.is_complete ?? false,
  is_actionable: overrides.is_actionable ?? true,
});

test('daily task cards expose current, next, locked, and future route states', () => {
  const focus = routeItem({ id: 1, title: 'Front', current_mastery_rank: 1 });
  const next = routeItem({ id: 2, title: 'Next', current_mastery_rank: 0 });
  const locked = routeItem({ id: 3, title: 'Archived completed local node', is_actionable: false, is_complete: true });
  const future = routeItem({ id: 4, title: 'Later route node' });

  const cards = buildDailyTaskCards({
    focusItem: focus,
    nextItems: [next],
    routeItems: [focus, next, locked, future],
    primaryRecommendation: null,
    queue: [],
  });

  assert.deepEqual(
    cards.slice(0, 4).map((card) => card.state),
    ['current', 'next', 'locked', 'future'],
  );
  assert.equal(cards[0].title, 'Front');
  assert.equal(cards[0].progressPercent, 20);
  assert.equal(cards[2].disabled, true);
  assert.equal(cards[3].actionLabel, 'Открыть карту');
});

test('daily recommendation cards keep null action candidates distinct by node id', () => {
  const recommendations = [
    {
      nodeId: 10,
      actionId: null,
      actionTitle: 'Read source',
      sphereName: 'Work',
      directionName: 'Graph',
      skillName: 'Route',
      nodeTitle: 'Node A',
      whyNow: [],
      whatDegrades: '',
    },
    {
      nodeId: 11,
      actionId: null,
      actionTitle: 'Sketch relation',
      sphereName: 'Work',
      directionName: 'Graph',
      skillName: 'Route',
      nodeTitle: 'Node B',
      whyNow: [],
      whatDegrades: '',
    },
  ];

  const cards = buildDailyTaskCards({
    focusItem: null,
    nextItems: [],
    routeItems: [],
    primaryRecommendation: recommendations[0],
    queue: recommendations,
  });

  assert.deepEqual(cards.slice(0, 2).map((card) => card.nodeId), [10, 11]);
  assert.deepEqual(cards.slice(0, 2).map((card) => card.key), ['recommendation-node-10', 'recommendation-node-11']);
});

test('mini map preview keeps a large route compact while preserving front and weak relation', () => {
  const items = Array.from({ length: 24 }, (_, index) =>
    routeItem({
      id: index + 1,
      title: `Route ${index + 1}`,
      route_order: index + 1,
      current_mastery_rank: index < 8 ? 5 : 0,
      is_complete: index < 8,
    }),
  );
  const focus = items[12];
  const weak = items[22];

  const preview = buildMiniMapPreview({
    focusItem: focus,
    nextItems: [focus, items[13]],
    weakSpots: [weak],
    routeItems: items,
    currentStage: 'Large graph stage',
  });

  assert.ok(preview.nodes.length <= 7);
  assert.equal(preview.nodes.some((node) => node.kind === 'front' && node.title === focus.title), true);
  assert.equal(preview.nodes.some((node) => node.kind === 'weak' && node.title === weak.title), true);
  assert.equal(preview.edges.some((edge) => edge.kind === 'weak'), true);
  assert.equal(preview.hasOverflow, true);
});

test('mini map preview uses the full normal route without editor actions', () => {
  const items = [routeItem({ id: 1, is_complete: true }), routeItem({ id: 2 }), routeItem({ id: 3 })];

  const preview = buildMiniMapPreview({
    focusItem: items[1],
    nextItems: [items[1], items[2]],
    weakSpots: [],
    routeItems: items,
    currentStage: 'Core route',
  });

  assert.equal(preview.nodes.length, 3);
  assert.equal(preview.routeTitle, 'Core route');
  assert.deepEqual(Object.keys(preview).sort(), ['edges', 'frontTitle', 'hasOverflow', 'nodes', 'routeTitle', 'weakTitle']);
});
