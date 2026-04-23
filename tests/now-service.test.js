import test from 'node:test';
import assert from 'node:assert/strict';

import { createNowService } from '../src/application/now-service.js';
import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { createDailySessionStore } from '../src/stores/daily-session-store.js';
import { createHierarchyStore } from '../src/stores/hierarchy-store.js';
import { createNodeNoteStore } from '../src/stores/node-note-store.js';
import { createReviewStateStore } from '../src/stores/review-state-store.js';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const starterPrimaryActionPattern = /Review the first recommended action and start a session|Проверить первый шаг и запустить сессию/;
const starterPrimaryNodePattern = /Ship the first Now surface|Собрать первый экран «Сейчас»/;
const blockedNodePattern = /Capture clear why-now language|Сделать короткие причины выбора/;
const followUpTitlePattern = /Resolve barrier|Follow up|Разобрать барьер|Следующий шаг/;
const degradedPattern = /Review confidence|Project context|Follow-on nodes|Momentum|вспомнить|вернуться|вход обратно|следующее|ясность/;

const setupNowService = async () => {
  const database = createSqliteTestDatabase();
  await bootstrapDatabase(database);

  return {
    database,
    nowService: createNowService({
      database,
      hierarchyStore: createHierarchyStore(database),
      nodeNoteStore: createNodeNoteStore(database),
      reviewStateStore: createReviewStateStore(database),
      dailySessionStore: createDailySessionStore(database),
    }),
  };
};

test('now dashboard starts empty before any workspace exists', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.getDashboard();

  assert.equal(snapshot.metrics.spheres, 0);
  assert.equal(snapshot.metrics.nodes, 0);
  assert.equal(snapshot.primaryRecommendation, null);
  assert.deepEqual(snapshot.queue, []);
  assert.equal(snapshot.todaySession, null);
});

test('starter workspace creates the first visible recommendation loop', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();

  assert.equal(snapshot.metrics.spheres, 1);
  assert.equal(snapshot.metrics.nodes, 3);
  assert.match(snapshot.primaryRecommendation.actionTitle, starterPrimaryActionPattern);
  assert.match(snapshot.primaryRecommendation.nodeTitle, starterPrimaryNodePattern);
  assert.match(snapshot.primaryRecommendation.whatDegrades, degradedPattern);
});

test('blocked actions are excluded from the queue until dependencies clear', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const visibleTitles = [snapshot.primaryRecommendation?.nodeTitle, ...snapshot.queue.map((item) => item.nodeTitle)];

  assert.equal(visibleTitles.some((title) => blockedNodePattern.test(title ?? '')), false);
});

test('starting a session stamps a daily session header and selected event', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  await nowService.createStarterWorkspace();
  const session = await nowService.startTodaySessionFromPrimaryRecommendation();
  const snapshot = await nowService.getDashboard();

  assert.equal(session.status, 'active');
  assert.equal(session.events.length, 1);
  assert.equal(session.events[0].event_type, 'selected');
  assert.equal(snapshot.todaySession.status, 'active');
});

test('node focus returns selected action, dependencies, and progress for the chosen recommendation', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const focus = await nowService.getNodeFocus(
    snapshot.primaryRecommendation.nodeId,
    snapshot.primaryRecommendation.actionId,
  );

  assert.match(focus.node.title, starterPrimaryNodePattern);
  assert.match(focus.selectedAction.title, starterPrimaryActionPattern);
  assert.equal(focus.actions.length, 1);
  assert.equal(focus.dependents.length, 1);
  assert.equal(focus.progress.totalActions, 1);
  assert.equal(focus.progress.completedActions, 0);
});

test('completing the selected action closes the session and the node when no open actions remain', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  await nowService.startTodaySessionFromRecommendation(snapshot.primaryRecommendation.actionId);
  const result = await nowService.completeActionInTodaySession(snapshot.primaryRecommendation.actionId);

  assert.equal(result.focus.selectedAction.status, 'done');
  assert.equal(result.focus.node.status, 'done');
  assert.equal(result.focus.session.status, 'completed');
  assert.deepEqual(
    result.focus.session.events.map((event) => event.event_type),
    ['selected', 'completed'],
  );
});

test('deferring an action records a deferred event and keeps the action available', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const result = await nowService.deferActionInTodaySession(snapshot.primaryRecommendation.actionId, 'Need a cleaner time window.');

  assert.equal(result.focus.selectedAction.status, 'ready');
  assert.equal(result.focus.session.status, 'completed');
  assert.deepEqual(
    result.focus.session.events.map((event) => event.event_type),
    ['selected', 'deferred'],
  );
  assert.match(result.focus.session.events[1].note, /cleaner time window/i);
});

test('blocking an action records a blocked event with barrier context and pauses the node', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const result = await nowService.blockActionInTodaySession(snapshot.primaryRecommendation.actionId, {
    barrierType: 'too complex',
    note: 'Need to break the idea down first.',
  });

  assert.equal(result.focus.node.status, 'paused');
  assert.deepEqual(
    result.focus.session.events.map((event) => event.event_type),
    ['selected', 'blocked'],
  );
  assert.match(result.focus.session.events[1].note, /too complex/i);
  assert.equal(result.focus.barrierNotes.length, 1);
  assert.equal(result.focus.barrierNotes[0].barrier_type, 'too complex');
});

test('shrinking an action creates a new smaller step and records a shrunk event', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const result = await nowService.shrinkActionInTodaySession(snapshot.primaryRecommendation.actionId, {
    title: 'Write the smallest Now CTA copy pass',
    note: 'Keep it tiny and testable.',
  });

  assert.equal(result.focus.selectedAction.title, 'Write the smallest Now CTA copy pass');
  assert.equal(result.focus.actions.some((action) => action.status === 'cancelled'), true);
  assert.deepEqual(
    result.focus.session.events.map((event) => event.event_type),
    ['selected', 'shrunk'],
  );
  assert.match(result.focus.session.events[1].note, /smaller step/i);
  assert.equal(result.focus.errorNotes.some((note) => note.note_kind === 'shrink'), true);
});

test('navigation snapshot exposes spheres, skill tree, and default focus selection', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  await nowService.createStarterWorkspace();
  const snapshot = await nowService.getNavigationSnapshot();

  assert.equal(snapshot.spheres.length, 1);
  assert.equal(snapshot.spheres[0].directions.length, 1);
  assert.equal(snapshot.spheres[0].directions[0].skills.length, 1);
  assert.equal(snapshot.spheres[0].directions[0].skills[0].nodes.length, 3);
  assert.equal(snapshot.defaultSelection.nodeId > 0, true);
});

test('journal snapshot aggregates barrier counts, adjustments, and hotspots from session outcomes', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  await nowService.blockActionInTodaySession(snapshot.primaryRecommendation.actionId, {
    barrierType: 'too complex',
    note: 'Need to split the task first.',
  });

  const refreshed = await nowService.getDashboard();
  await nowService.shrinkActionInTodaySession(refreshed.primaryRecommendation.actionId, {
    title: 'Write the smallest loop check',
    note: 'Use a narrower target.',
  });

  const journal = await nowService.getJournalSnapshot();

  assert.equal(journal.barrierSummary[0].barrierType, 'too complex');
  assert.equal(journal.barrierSummary[0].count >= 1, true);
  assert.equal(journal.barrierEntries.length >= 1, true);
  assert.equal(journal.adjustmentEntries.some((entry) => entry.eventType === 'shrunk'), true);
  assert.equal(journal.hotspots[0].incidentCount >= 2, true);
});

test('journal follow-up step creates a ready remediation action and node-scoped follow-up note', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  await nowService.blockActionInTodaySession(snapshot.primaryRecommendation.actionId, {
    barrierType: 'too complex',
    note: 'Need a narrower next step.',
  });

  const result = await nowService.createJournalFollowUpStep({
    nodeId: snapshot.primaryRecommendation.nodeId,
    barrierType: 'too complex',
    note: 'Break the node into a safer step.',
  });

  assert.equal(result.createdAction.status, 'ready');
  assert.match(result.createdAction.title, followUpTitlePattern);
  assert.equal(result.focus.selectedAction.id, result.createdAction.id);
  assert.equal(result.focus.errorNotes.some((note) => note.note_kind === 'follow_up'), true);
});
