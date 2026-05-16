import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDailyTaskCards, buildMiniMapPreview, buildTodayRightRail } from '../src/components/today-dashboard-model.ts';

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

test('today right rail turns race city and opponent data into visual card state', () => {
  const today = {
    currentSpecialization: {
      id: 7,
      campaign_id: 1,
      name: 'Computer Science',
      key: 'computer-science',
      length: 'medium',
      status: 'active',
      started_at: '2026-05-10T00:00:00.000Z',
      created_at: '2026-05-10T00:00:00.000Z',
      updated_at: '2026-05-10T00:00:00.000Z',
    },
    careerStatus: 'active',
    mastery: {
      activeNodeCount: 12,
      confirmedOrBetterNodeCount: 8,
      verifiedNodeCount: 13,
      selfMarkedOnlyNodeCount: 2,
    },
    state: {
      key: 'active_route',
      label: 'Next',
      title: 'Linear algebra',
      reason: '',
      primaryCta: { action: 'open_route_node', label: 'Open' },
      content: {
        hasContent: true,
        nodeCount: 10,
        openActionCount: 3,
        totalXp: 920,
        verifiedNodeCount: 13,
        selfMarkedOnlyNodeCount: 2,
        routeNodeCount: 6,
      },
    },
    race: {
      key: 'crow_commander',
      title: 'Crow strategist',
      emblem: 'C',
      color: '#f6c445',
    },
    route: {
      routeNodeCount: 6,
      requiredNodeCount: 5,
      completedRequiredNodeCount: 3,
      completionPercent: 60,
      isComplete: false,
      items: [],
      nextItem: null,
    },
    planner: {
      focusItem: null,
      currentStage: 'Foundations',
      currentStageItems: [routeItem({ id: 1, is_complete: true }), routeItem({ id: 2 })],
      nextItems: [],
      weakSpots: [],
      readyToVerify: [routeItem({ id: 3 })],
      hasRouteItems: true,
    },
    city: {
      level: 4,
      totalXp: 920,
      districts: [
        { id: 1, title: 'Core', emblem: 'A', color: '#7dd3fc', xp: 300, level: 3, stability: 70 },
        { id: 2, title: 'Systems', emblem: 'B', color: '#6ee7b7', xp: 620, level: 4, stability: 85 },
      ],
    },
    activity: {
      streakDays: 5,
      lastSessionDate: '2026-05-16',
      activeSessionDayCount: 7,
    },
    opponent: {
      specialization_id: 7,
      daysElapsed: 6,
      projectedRequired: 4,
      pressure: 80,
      score: 40,
    },
  };

  const rail = buildTodayRightRail({ today, todaySession: { status: 'active', events: [] } });

  assert.equal(rail.race.title, 'Crow strategist');
  assert.equal(rail.race.rankLabel, 'Архитектор');
  assert.equal(rail.race.streakLabel, '5 дн.');
  assert.equal(rail.city.featuredDistrict.title, 'Systems');
  assert.equal(rail.city.progressPercent, 78);
  assert.equal(rail.opponent.stateLabel, 'ИИ впереди');
  assert.equal(rail.opponent.campaignProgressLabel, 'вы 60% / ИИ 80%');
  assert.equal(rail.route.stageLabel, '1/2 этап');
  assert.equal(rail.route.sessionLabel, 'сессия идет');
});

test('today right rail presents missing data as intentional empty state', () => {
  const rail = buildTodayRightRail({ today: null });

  assert.equal(rail.race.hasIdentity, false);
  assert.equal(rail.race.title, 'Профиль не выбран');
  assert.equal(rail.city.hasDistricts, false);
  assert.equal(rail.city.title, 'Город ждет данных');
  assert.equal(rail.city.progressPercent, 0);
  assert.equal(rail.opponent.hasOpponent, false);
  assert.equal(rail.opponent.title, 'Соперник не назначен');
  assert.equal(rail.opponent.campaignProgressLabel, 'гонка не активна');
});
