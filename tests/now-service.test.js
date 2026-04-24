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
  const hierarchyStore = createHierarchyStore(database);
  const nodeNoteStore = createNodeNoteStore(database);
  const reviewStateStore = createReviewStateStore(database);
  const dailySessionStore = createDailySessionStore(database);

  return {
    database,
    hierarchyStore,
    nowService: createNowService({
      database,
      hierarchyStore,
      nodeNoteStore,
      reviewStateStore,
      dailySessionStore,
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
  assert.match(result.focus.session.events[1].note, /smaller step|меньший шаг/i);
  assert.equal(result.focus.errorNotes.some((note) => note.note_kind === 'shrink'), true);
});

test('navigation snapshot exposes spheres, skill tree, and default focus selection', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  await nowService.createStarterWorkspace();
  const snapshot = await nowService.getNavigationSnapshot();
  const persistedNodes = await database.select(
    'SELECT x, y FROM nodes WHERE is_archived = 0 ORDER BY id ASC',
  );

  assert.equal(snapshot.spheres.length, 1);
  assert.equal(snapshot.spheres[0].directions.length, 1);
  assert.equal(snapshot.spheres[0].directions[0].skills.length, 1);
  assert.equal(snapshot.spheres[0].directions[0].skills[0].nodes.length, 3);
  assert.equal(snapshot.defaultSelection.nodeId > 0, true);
  assert.equal(snapshot.spheres[0].directions[0].skills[0].nodes.every((node) => node.x != null && node.y != null), true);
  assert.equal(persistedNodes.every((node) => typeof node.x === 'number' && typeof node.y === 'number'), true);
});

test('node focus keeps only requires edges in dependency and dependent lists', async (t) => {
  const { database, nowService, hierarchyStore } = await setupNowService();
  t.after(() => database.close());

  const sphere = await hierarchyStore.createSphere({ name: 'Граф', slug: 'graph-focus' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Контекст',
    slug: 'graph-context',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'Рёбра',
    slug: 'graph-edges',
  });
  const blocked = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Заблокированный узел',
    slug: 'blocked-node',
  });
  const blocker = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Блокер',
    slug: 'blocking-node',
  });
  const supporter = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Поддержка',
    slug: 'support-node',
  });
  const related = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Связанный',
    slug: 'related-node',
  });

  await hierarchyStore.addNodeDependency({
    blocked_node_id: blocked.id,
    blocking_node_id: blocker.id,
    dependency_type: 'requires',
  });
  await hierarchyStore.addNodeDependency({
    blocked_node_id: blocked.id,
    blocking_node_id: supporter.id,
    dependency_type: 'supports',
  });
  await hierarchyStore.addNodeDependency({
    blocked_node_id: blocked.id,
    blocking_node_id: related.id,
    dependency_type: 'relates_to',
  });

  const blockedFocus = await nowService.getNodeFocus(blocked.id);
  const blockerFocus = await nowService.getNodeFocus(blocker.id);

  assert.deepEqual(
    blockedFocus.dependencies.map((item) => item.title),
    ['Блокер'],
  );
  assert.deepEqual(
    blockerFocus.dependents.map((item) => item.title),
    ['Заблокированный узел'],
  );
});

test('createGraphEdge keeps selection on the requested source node when relates_to is canonicalized', async (t) => {
  const { database, nowService, hierarchyStore } = await setupNowService();
  t.after(() => database.close());

  const sphere = await hierarchyStore.createSphere({ name: 'Assoc', slug: 'assoc-selection' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Graph',
    slug: 'graph-selection',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'Relations',
    slug: 'relations-selection',
  });
  const lowerNode = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Lower node',
    slug: 'lower-node-selection',
  });
  const higherNode = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Higher node',
    slug: 'higher-node-selection',
  });

  const created = await nowService.createGraphEdge({
    blocked_node_id: higherNode.id,
    blocking_node_id: lowerNode.id,
    dependency_type: 'relates_to',
  });

  assert.equal(created.selection.nodeId, higherNode.id);
  assert.equal(created.focus.node.id, higherNode.id);
  assert.equal(created.edge.blocked_node_id, lowerNode.id);
  assert.equal(created.edge.blocking_node_id, higherNode.id);
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

test('node editor mutations return synced dashboard, navigation, and focus payloads', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const updated = await nowService.updateNodeEditor(snapshot.primaryRecommendation.nodeId, {
    title: 'Ship persisted node editor',
    summary: 'Persist node edits through the application boundary.',
    completion_criteria: 'The node is done when the boundary returns expanded authored fields.',
    links: 'Depends on: schema migration\nUnlocks: node editor boundary contract',
    reward: 'Editor-owned content survives a refresh.',
    status: 'paused',
  });
  const persistedNode = await nowService.getNodeEditorRecord(updated.node.id);

  assert.equal(updated.node.title, 'Ship persisted node editor');
  assert.equal(updated.node.completion_criteria, 'The node is done when the boundary returns expanded authored fields.');
  assert.equal(updated.node.links, 'Depends on: schema migration\nUnlocks: node editor boundary contract');
  assert.equal(updated.node.reward, 'Editor-owned content survives a refresh.');
  assert.equal(updated.focus.node.title, 'Ship persisted node editor');
  assert.equal(updated.focus.node.status, 'paused');
  assert.equal(updated.focus.node.completion_criteria, updated.node.completion_criteria);
  assert.equal(updated.focus.node.links, updated.node.links);
  assert.equal(updated.focus.node.reward, updated.node.reward);
  assert.equal(persistedNode.completion_criteria, updated.node.completion_criteria);
  assert.equal(persistedNode.links, updated.node.links);
  assert.equal(persistedNode.reward, updated.node.reward);

  const navigationNode = updated.navigation.spheres
    .flatMap((sphere) => sphere.directions)
    .flatMap((direction) => direction.skills)
    .flatMap((skill) => skill.nodes)
    .find((node) => node.id === updated.node.id);

  assert.equal(navigationNode.title, 'Ship persisted node editor');
  assert.equal(navigationNode.status, 'paused');
  assert.equal(updated.selection.nodeId, updated.node.id);
  assert.equal(updated.dashboard.metrics.nodes >= 1, true);
});

test('node editor duplicate and archive mutations return persisted refresh payloads', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  await nowService.updateNodeEditor(snapshot.primaryRecommendation.nodeId, {
    completion_criteria: 'Original node stays done when the editor contract is complete.',
    links: 'Depends on: expanded schema\nUnlocks: boundary refresh tests',
    reward: 'The duplicate inherits authored context.',
  });
  const duplicate = await nowService.duplicateNodeEditor(snapshot.primaryRecommendation.nodeId, {
    title: 'Ship persisted node editor copy',
    reward: 'Duplicate keeps a custom reward.',
  });
  const archived = await nowService.archiveNodeEditor(snapshot.primaryRecommendation.nodeId);

  assert.equal(duplicate.node.title, 'Ship persisted node editor copy');
  assert.equal(duplicate.node.completion_criteria, 'Original node stays done when the editor contract is complete.');
  assert.equal(duplicate.node.links, 'Depends on: expanded schema\nUnlocks: boundary refresh tests');
  assert.equal(duplicate.node.reward, 'Duplicate keeps a custom reward.');
  assert.equal(duplicate.focus.node.id, duplicate.node.id);
  assert.equal(duplicate.focus.node.completion_criteria, duplicate.node.completion_criteria);
  assert.equal(duplicate.focus.node.links, duplicate.node.links);
  assert.equal(duplicate.focus.node.reward, duplicate.node.reward);
  assert.equal(duplicate.selection.nodeId, duplicate.node.id);

  const duplicateInNavigation = duplicate.navigation.spheres
    .flatMap((sphere) => sphere.directions)
    .flatMap((direction) => direction.skills)
    .flatMap((skill) => skill.nodes)
    .find((node) => node.id === duplicate.node.id);
  assert.equal(duplicateInNavigation.title, 'Ship persisted node editor copy');

  assert.equal(archived.node.status, 'archived');
  assert.equal(archived.node.is_archived, 1);
  const archivedInNavigation = archived.navigation.spheres
    .flatMap((sphere) => sphere.directions)
    .flatMap((direction) => direction.skills)
    .flatMap((skill) => skill.nodes)
    .find((node) => node.id === snapshot.primaryRecommendation.nodeId);
  assert.equal(archivedInNavigation, undefined);
  assert.notEqual(archived.selection, null);
  assert.notEqual(archived.selection.nodeId, snapshot.primaryRecommendation.nodeId);
  assert.equal(archived.selection.nodeId, archived.navigation.defaultSelection.nodeId);
  assert.equal(archived.focus.node.id, archived.selection.nodeId);
});

test('archive node editor applies persisted patch and archive status in one mutation result', async (t) => {
  const { database, nowService } = await setupNowService();
  t.after(() => database.close());

  const snapshot = await nowService.createStarterWorkspace();
  const archived = await nowService.archiveNodeEditor(snapshot.primaryRecommendation.nodeId, {
    title: 'Archive-ready node',
    summary: 'Archive this exact edited version.',
    completion_criteria: 'Archive only after the final authored note is saved.',
    links: 'Depends on: archive action',
    reward: 'Leaves behind a clean archived snapshot.',
    type: 'theory',
  });
  const persistedArchivedNode = await nowService.getNodeEditorRecord(snapshot.primaryRecommendation.nodeId);

  assert.equal(archived.node.title, 'Archive-ready node');
  assert.equal(archived.node.summary, 'Archive this exact edited version.');
  assert.equal(archived.node.completion_criteria, 'Archive only after the final authored note is saved.');
  assert.equal(archived.node.links, 'Depends on: archive action');
  assert.equal(archived.node.reward, 'Leaves behind a clean archived snapshot.');
  assert.equal(archived.node.type, 'theory');
  assert.equal(archived.node.status, 'archived');
  assert.equal(archived.node.is_archived, 1);
  assert.equal(persistedArchivedNode.completion_criteria, archived.node.completion_criteria);
  assert.equal(persistedArchivedNode.links, archived.node.links);
  assert.equal(persistedArchivedNode.reward, archived.node.reward);
  assert.notEqual(archived.focus.node.id, archived.node.id);
});
