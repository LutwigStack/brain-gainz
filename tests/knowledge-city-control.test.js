import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCityControlProjection,
  dailyOpponentXp,
  deriveNodeControlState,
} from '../src/application/knowledge-city-control.ts';

const NOW = new Date('2026-06-02T12:00:00.000Z');

const routeItem = (overrides = {}) => ({
  id: overrides.id ?? 1,
  title: overrides.title ?? 'Hash tables',
  path: overrides.path ?? 'Computer Science / Data structures',
  route_stage: overrides.route_stage ?? 'Data structures',
  is_required: overrides.is_required ?? 1,
  current_mastery_rank: overrides.current_mastery_rank ?? 0,
  self_marked_mastery_rank: overrides.self_marked_mastery_rank ?? 0,
  has_verified_mastery: overrides.has_verified_mastery ?? 0,
  latest_failed_assessment_at: overrides.latest_failed_assessment_at ?? null,
  latest_passed_assessment_at: overrides.latest_passed_assessment_at ?? null,
  latest_failed_run_at: overrides.latest_failed_run_at ?? null,
  latest_completed_run_at: overrides.latest_completed_run_at ?? null,
  review_current_risk: overrides.review_current_risk ?? null,
  review_next_due_at: overrides.review_next_due_at ?? null,
  last_touched_at: overrides.last_touched_at ?? null,
});

test('node control state distinguishes unclaimed scouted controlled and fortified', () => {
  assert.equal(deriveNodeControlState(routeItem(), NOW).control_state, 'unclaimed');
  assert.equal(
    deriveNodeControlState(routeItem({ self_marked_mastery_rank: 2 }), NOW).control_state,
    'scouted',
  );
  assert.equal(
    deriveNodeControlState(routeItem({ current_mastery_rank: 5, has_verified_mastery: 1, last_touched_at: '2026-05-20T00:00:00.000Z' }), NOW).control_state,
    'weakened',
  );
  assert.equal(
    deriveNodeControlState(routeItem({ current_mastery_rank: 5, has_verified_mastery: 1, last_touched_at: '2026-06-01T00:00:00.000Z' }), NOW).control_state,
    'fortified',
  );
});

test('failed attempts and high risk make route nodes contested', () => {
  const contested = deriveNodeControlState(
    routeItem({
      current_mastery_rank: 5,
      has_verified_mastery: 1,
      latest_failed_assessment_at: '2026-06-01T10:00:00.000Z',
      latest_passed_assessment_at: '2026-05-30T10:00:00.000Z',
      last_touched_at: '2026-05-30T10:00:00.000Z',
    }),
    NOW,
  );

  assert.equal(contested.control_state, 'contested');
  assert.equal(contested.control_reason, 'Провалена проверка');
});

test('city control projection picks pressured object and opponent labels', () => {
  const projection = buildCityControlProjection({
    now: NOW,
    opponent: {
      name: 'Corvus AI',
      persona_key: 'corvus-ai',
      xp: 42,
      momentum: 2,
    },
    routeItems: [
      routeItem({ id: 1, title: 'Variables', route_stage: 'Programming', current_mastery_rank: 5, has_verified_mastery: 1, last_touched_at: '2026-06-01T00:00:00.000Z' }),
      routeItem({ id: 2, title: 'Hash tables', route_stage: 'Data structures', current_mastery_rank: 5, has_verified_mastery: 1, latest_failed_assessment_at: '2026-06-01T00:00:00.000Z', last_touched_at: '2026-05-10T00:00:00.000Z' }),
      routeItem({ id: 3, title: 'Trees', route_stage: 'Data structures', self_marked_mastery_rank: 1 }),
    ],
  });

  assert.equal(projection.opponent.name, 'Corvus AI');
  assert.equal(projection.opponent.xp, 42);
  assert.equal(projection.opponent.targetObjectTitle, 'Data structures');
  assert.equal(projection.summary.state, 'lost_ground');
  assert.equal(projection.summary.contestedNodeCount, 1);
  assert.equal(projection.objects[0].nextActionLabel, 'Вернуть контроль');
});

test('daily opponent xp is capped and explainable', () => {
  assert.equal(dailyOpponentXp({ weakNodeCount: 0, contestedNodeCount: 0 }), 3);
  assert.equal(dailyOpponentXp({ weakNodeCount: 10, contestedNodeCount: 5, targetObjectUnresolved: true }), 25);
});
