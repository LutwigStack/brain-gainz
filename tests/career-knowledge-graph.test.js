import test from 'node:test';
import assert from 'node:assert/strict';

import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { createNowService } from '../src/application/now-service.js';
import { createCampaignStore } from '../src/stores/campaign-store.js';
import { createDailySessionStore } from '../src/stores/daily-session-store.js';
import { createHierarchyStore } from '../src/stores/hierarchy-store.js';
import { createNodeNoteStore } from '../src/stores/node-note-store.js';
import { createReviewStateStore } from '../src/stores/review-state-store.js';
import { emptyCheckMetadataDraft, serializeCheckMetadataDraft } from '../src/components/navigation-editor-draft.ts';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const setupCareerService = async () => {
  const database = createSqliteTestDatabase();
  await bootstrapDatabase(database);
  const hierarchyStore = createHierarchyStore(database);
  const nodeNoteStore = createNodeNoteStore(database);
  const reviewStateStore = createReviewStateStore(database);
  const dailySessionStore = createDailySessionStore(database);
  const nowService = createNowService({
    database,
    hierarchyStore,
    nodeNoteStore,
    reviewStateStore,
    dailySessionStore,
  });
  const campaignStore = createCampaignStore(database, hierarchyStore);

  return {
    database,
    hierarchyStore,
    nowService,
    campaignStore,
  };
};

const firstNode = async (nowService, campaignId) => {
  const navigation = await nowService.getNavigationSnapshot(campaignId);
  return navigation.spheres[0].directions[0].skills[0].nodes[0];
};

const createSiblingNode = async (nowService, campaignId, sourceNode, title = 'Route sibling') => {
  await nowService.createNodeEditor(campaignId, {
    skill_id: sourceNode.skill_id,
    type: 'task',
    status: 'active',
    title,
    slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
    x: (sourceNode.x ?? 0) + 120,
    y: sourceNode.y ?? 0,
  });
  const navigation = await nowService.getNavigationSnapshot(campaignId);
  return navigation.spheres
    .flatMap((sphere) => sphere.directions)
    .flatMap((direction) => direction.skills)
    .flatMap((skill) => skill.nodes)
    .find((node) => node.title === title);
};

const padDatePart = (value) => String(value).padStart(2, '0');

const localDateKeyDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  return [date.getFullYear(), padDatePart(date.getMonth() + 1), padDatePart(date.getDate())].join('-');
};

const insertDailySession = async (database, campaignId, sessionDate, status = 'completed') => {
  const timestamp = `${sessionDate}T09:00:00.000Z`;
  await database.execute(
    `
      INSERT INTO daily_sessions (
        campaign_id,
        session_date,
        status,
        primary_node_id,
        primary_action_id,
        started_at,
        ended_at,
        summary_note,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, NULL, NULL, ?, ?, NULL, ?, ?)
    `,
    [campaignId, sessionDate, status, timestamp, status === 'completed' ? timestamp : null, timestamp, timestamp],
  );
};

test('legacy completed nodes are backfilled into confirmed mastery on migration rerun', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Legacy Mastery' });
  const node = await firstNode(nowService, campaign.id);
  await database.execute("UPDATE nodes SET status = 'done' WHERE id = ?", [node.id]);
  await bootstrapDatabase(database);

  const events = await database.select(
    `
      SELECT *
      FROM mastery_events
      WHERE campaign_id = ?
        AND node_id = ?
        AND mastery_level = 'confirmed'
        AND source_type = 'legacy_node_completion'
        AND active = 1
    `,
    [campaign.id, node.id],
  );
  assert.equal(events.length, 1);
});

test('bootstrap repairs legacy assessment mastery tables for verified attempts', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  await database.execute(`
    CREATE TABLE mastery_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      mastery_level TEXT NOT NULL,
      source_type TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);
  await database.execute(`
    CREATE TABLE assessment_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      task_id TEXT NOT NULL,
      answer_type TEXT NOT NULL,
      submitted_answer TEXT,
      check_method TEXT NOT NULL,
      passed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  await bootstrapDatabase(database);

  const masteryIndexes = await database.select('PRAGMA index_list(mastery_events)');
  const assessmentIndexes = await database.select('PRAGMA index_list(assessment_attempts)');
  assert.ok(masteryIndexes.some((index) => index.name === 'idx_mastery_events_campaign_idempotency'));
  assert.ok(assessmentIndexes.some((index) => index.name === 'idx_assessment_attempts_campaign_idempotency'));

  const hierarchyStore = createHierarchyStore(database);
  const nodeNoteStore = createNodeNoteStore(database);
  const reviewStateStore = createReviewStateStore(database);
  const dailySessionStore = createDailySessionStore(database);
  const nowService = createNowService({
    database,
    hierarchyStore,
    nodeNoteStore,
    reviewStateStore,
    dailySessionStore,
  });
  const campaignStore = createCampaignStore(database, hierarchyStore);

  const campaign = await campaignStore.createUserCampaign({ name: 'Legacy Verified Assessment' });
  const node = await firstNode(nowService, campaign.id);
  const result = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'legacy-schema-pass',
    check_method: 'llm_assisted',
    target_mastery_level: 'understood',
    passed: true,
    evidence_payload: { llm_result_id: 'legacy-schema-pass-result' },
    idempotency_key: 'legacy-schema-pass-1',
  });

  assert.equal(result.attempt.passed, 1);
  assert.ok(result.masteryEvent);

  await database.execute("UPDATE nodes SET status = 'done' WHERE id = ?", [node.id]);
  await bootstrapDatabase(database);
  await bootstrapDatabase(database);

  const legacyMasteryEvents = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM mastery_events
      WHERE campaign_id = ?
        AND node_id = ?
        AND source_type = 'legacy_node_completion'
    `,
    [campaign.id, node.id],
  );
  assert.equal(Number(legacyMasteryEvents[0].count), 1);
});

test('bootstrap dedupes legacy idempotency keys before creating unique boundaries', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  await database.execute(`
    CREATE TABLE mastery_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      mastery_level TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id INTEGER,
      idempotency_key TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);
  await database.execute(`
    CREATE TABLE assessment_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      task_id TEXT NOT NULL,
      answer_type TEXT NOT NULL,
      submitted_answer TEXT,
      check_method TEXT NOT NULL,
      passed INTEGER NOT NULL DEFAULT 0,
      idempotency_key TEXT,
      created_at TEXT NOT NULL
    )
  `);
  await database.execute(
    `
      INSERT INTO mastery_events (
        campaign_id,
        node_id,
        mastery_level,
        source_type,
        source_id,
        idempotency_key,
        active,
        created_at
      )
      VALUES
        (99, 1, 'confirmed', 'legacy_node_completion', 1, 'legacy-node-completion:99:1', 1, '2026-01-01T00:00:00.000Z'),
        (99, 1, 'confirmed', 'legacy_node_completion', 1, 'legacy-node-completion:99:1', 1, '2026-01-01T00:00:01.000Z')
    `,
  );
  await database.execute(
    `
      INSERT INTO assessment_attempts (
        campaign_id,
        node_id,
        task_id,
        answer_type,
        submitted_answer,
        check_method,
        passed,
        idempotency_key,
        created_at
      )
      VALUES
        (99, 1, 'legacy-task', 'text', 'answer', 'strict', 0, 'legacy-attempt-key', '2026-01-01T00:00:00.000Z'),
        (99, 1, 'legacy-task', 'text', 'answer', 'strict', 0, 'legacy-attempt-key', '2026-01-01T00:00:01.000Z')
    `,
  );

  await bootstrapDatabase(database);

  const masteryRows = await database.select(
    'SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = 99 AND idempotency_key = ?',
    ['legacy-node-completion:99:1'],
  );
  const assessmentRows = await database.select(
    'SELECT COUNT(*) AS count FROM assessment_attempts WHERE campaign_id = 99 AND idempotency_key = ?',
    ['legacy-attempt-key'],
  );
  assert.equal(Number(masteryRows[0].count), 1);
  assert.equal(Number(assessmentRows[0].count), 1);

  await assert.rejects(
    () =>
      database.execute(
        `
          INSERT INTO mastery_events (
            campaign_id,
            node_id,
            mastery_level,
            source_type,
            source_id,
            idempotency_key,
            active,
            created_at
          )
          VALUES (99, 1, 'confirmed', 'legacy_node_completion', 1, 'legacy-node-completion:99:1', 1, ?)
        `,
        [new Date().toISOString()],
      ),
    /UNIQUE/i,
  );
  await assert.rejects(
    () =>
      database.execute(
        `
          INSERT INTO assessment_attempts (
            campaign_id,
            node_id,
            task_id,
            answer_type,
            submitted_answer,
            check_method,
            passed,
            idempotency_key,
            created_at
          )
          VALUES (99, 1, 'legacy-task', 'text', 'answer', 'strict', 0, 'legacy-attempt-key', ?)
        `,
        [new Date().toISOString()],
      ),
    /UNIQUE/i,
  );
});

test('specialization completion sets campaign victory and continuation starts a new active specialization', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Career Run' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Computer Science',
    key: 'computer-science',
  });

  await assert.rejects(
    () => nowService.createSpecialization(campaign.id, { name: 'Second active', key: 'second-active' }),
    /active specialization/,
  );

  const node = await firstNode(nowService, campaign.id);
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'seen',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    specialization_id: specialization.id,
    task_id: 'final-check',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'confirmed',
    passed: true,
    evidence_payload: { strict_result_id: 'final-check-result' },
    idempotency_key: 'final-check-pass',
  });

  const completed = await nowService.completeSpecialization(campaign.id, specialization.id);
  assert.equal(completed.specialization.status, 'completed');
  assert.equal(completed.career.campaign.career_status, 'victory');
  assert.equal(completed.career.campaign.current_specialization_id, specialization.id);

  const next = await nowService.continueWithSpecialization(campaign.id, {
    name: 'Machine Learning',
    key: 'machine-learning',
  });
  const rows = await database.select('SELECT * FROM campaigns WHERE id = ? LIMIT 1', [campaign.id]);
  assert.equal(rows[0].career_status, 'active');
  assert.equal(rows[0].current_specialization_id, next.id);

  const activeRows = await database.select(
    "SELECT COUNT(*) AS count FROM career_specializations WHERE campaign_id = ? AND status = 'active'",
    [campaign.id],
  );
  assert.equal(Number(activeRows[0].count), 1);
});

test('empty specialization route cannot be completed into victory', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Empty Route' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Empty Career',
    key: 'empty-career',
  });

  const completion = await nowService.getRouteCompletion(campaign.id, specialization.id);
  assert.equal(completion.routeNodeCount, 0);
  assert.equal(completion.isComplete, false);
  await assert.rejects(
    () => nowService.completeSpecialization(campaign.id, specialization.id),
    /route is not complete/,
  );
});

test('optional-only route does not become completable in Today planner', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Optional Route' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Optional Career',
    key: 'optional-career',
  });
  const node = await firstNode(nowService, campaign.id);
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
    is_required: false,
  });

  const dashboard = await nowService.getDashboard(campaign.id);
  assert.equal(dashboard.today.route.routeNodeCount, 1);
  assert.equal(dashboard.today.route.requiredNodeCount, 0);
  assert.equal(dashboard.today.route.isComplete, false);
  assert.equal(dashboard.today.planner.hasRouteItems, true);
  assert.equal(dashboard.today.planner.focusItem, null);
  await assert.rejects(
    () => nowService.completeSpecialization(campaign.id, specialization.id),
    /route is not complete/,
  );
});

test('today projection distinguishes empty, content without plan, free mode, and no-route states', async (t) => {
  const { database, campaignStore, hierarchyStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const emptyCampaign = await campaignStore.createUserCampaign({ name: 'Empty Today State' });
  await database.execute(
    `
      UPDATE nodes
      SET is_archived = 1
      WHERE id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [emptyCampaign.id],
  );
  const emptyDashboard = await nowService.getDashboard(emptyCampaign.id);
  assert.equal(emptyDashboard.metrics.nodes, 0);
  assert.equal(emptyDashboard.today.state.key, 'truly_empty');
  assert.equal(emptyDashboard.today.state.label, 'Карта пустая');
  assert.equal(emptyDashboard.today.state.title, 'Создайте первый набор');
  assert.equal(emptyDashboard.today.state.primaryCta.action, 'create_starter');
  assert.equal(emptyDashboard.today.state.primaryCta.label, 'Создать набор');

  const contentCampaign = await campaignStore.createUserCampaign({ name: 'Content Without Day Plan' });
  const contentDashboard = await nowService.getDashboard(contentCampaign.id);
  assert.equal(contentDashboard.metrics.nodes, 1);
  assert.equal(contentDashboard.today.state.key, 'content_without_day_plan');
  assert.equal(contentDashboard.today.state.content.nodeCount, contentDashboard.metrics.nodes);
  assert.equal(contentDashboard.today.state.primaryCta.action, 'open_route_map');
  assert.equal(contentDashboard.today.state.label, 'Нет шага');
  assert.match(contentDashboard.today.state.reason, /1 узл\./);

  const freeModeCampaign = await campaignStore.createUserCampaign({ name: 'Free Mode Today State' });
  const freeNode = await firstNode(nowService, freeModeCampaign.id);
  await hierarchyStore.createNodeAction({
    node_id: freeNode.id,
    title: 'Free mode recommendation',
    status: 'ready',
    size_hint: 'small',
    sort_order: 0,
    is_minimum_step: 1,
  });
  const freeModeDashboard = await nowService.getDashboard(freeModeCampaign.id);
  assert.equal(freeModeDashboard.today.state.key, 'free_mode');
  assert.equal(freeModeDashboard.today.state.primaryCta.action, 'open_recommendation_map');
  assert.equal(freeModeDashboard.today.state.primaryCta.label, 'Открыть шаг');

  const noRouteCampaign = await campaignStore.createUserCampaign({ name: 'No Route Today State' });
  await nowService.createSpecialization(noRouteCampaign.id, {
    name: 'Empty Active Route',
    key: 'empty-active-route',
  });
  const noRouteDashboard = await nowService.getDashboard(noRouteCampaign.id);
  assert.equal(noRouteDashboard.today.state.key, 'no_route');
  assert.equal(noRouteDashboard.today.route.routeNodeCount, 0);
  assert.equal(noRouteDashboard.today.state.primaryCta.action, 'open_route_map');
  assert.equal(noRouteDashboard.today.state.label, 'Маршрут пуст');
  assert.equal(noRouteDashboard.today.state.primaryCta.label, 'Настроить маршрут');
});

test('today projection keeps route incomplete CTA safe when no required next node exists', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Incomplete Today State' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Optional Only',
    key: 'optional-only-state',
  });
  const node = await firstNode(nowService, campaign.id);
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
    is_required: false,
  });

  const dashboard = await nowService.getDashboard(campaign.id);
  assert.equal(dashboard.today.state.key, 'route_incomplete');
  assert.equal(dashboard.today.state.label, 'Нет доступного шага');
  assert.equal(dashboard.today.route.isComplete, false);
  assert.equal(dashboard.today.planner.focusItem, null);
  assert.equal(dashboard.today.state.primaryCta.action, 'open_route_map');
});

test('today projection does not open archived route nodes as the next step', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Archived Route Focus' });
  const node = await firstNode(nowService, campaign.id);
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Route With Archived Node',
    key: 'route-with-archived-node',
  });
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });

  await nowService.archiveNodeEditor(campaign.id, node.id, {});

  const dashboard = await nowService.getDashboard(campaign.id);
  assert.equal(dashboard.today.route.routeNodeCount, 1);
  assert.equal(dashboard.today.route.requiredNodeCount, 1);
  assert.equal(dashboard.today.route.isComplete, false);
  assert.equal(dashboard.today.route.items[0].is_actionable, false);
  assert.equal(dashboard.today.route.nextItem, null);
  assert.equal(dashboard.today.planner.focusItem, null);
  assert.equal(dashboard.today.state.key, 'route_incomplete');
  assert.equal(dashboard.today.state.label, 'Нет доступного шага');
  assert.equal(dashboard.today.state.primaryCta.action, 'open_route_map');
});

test('today projection ignores archived-only actions as active daily content', async (t) => {
  const { database, campaignStore, hierarchyStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Archived Actions Only' });
  const node = await firstNode(nowService, campaign.id);
  await hierarchyStore.createNodeAction({
    node_id: node.id,
    title: 'Archived node action',
    status: 'ready',
    size_hint: 'small',
    sort_order: 0,
    is_minimum_step: 1,
  });

  await nowService.archiveNodeEditor(campaign.id, node.id, {});

  const dashboard = await nowService.getDashboard(campaign.id);
  assert.equal(dashboard.metrics.nodes, 0);
  assert.equal(dashboard.metrics.actions, 0);
  assert.equal(dashboard.today.state.key, 'truly_empty');
  assert.equal(dashboard.today.state.content.hasContent, false);
});

test('today projection exposes route, race, city, and specialization-scoped opponent', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Today Game' });
  const node = await firstNode(nowService, campaign.id);
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Frontend Route',
    key: 'frontend-route',
  });
  await database.execute("UPDATE career_specializations SET started_at = ? WHERE id = ?", [
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    specialization.id,
  ]);
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });

  const openDashboard = await nowService.getDashboard(campaign.id);
  assert.equal(openDashboard.today.route.items.length, 1);
  assert.equal(openDashboard.today.route.items[0].node_id, node.id);
  assert.equal(openDashboard.today.route.items[0].is_complete, false);
  assert.equal(openDashboard.today.route.nextItem.node_id, node.id);
  assert.equal(openDashboard.today.planner.focusItem.node_id, node.id);
  assert.equal(openDashboard.today.planner.hasRouteItems, true);
  assert.equal(openDashboard.today.planner.readyToVerify.length, 0);
  assert.equal(openDashboard.today.state.key, 'active_route');
  assert.equal(openDashboard.today.state.primaryCta.action, 'open_route_node');

  await nowService.updateNodeEditor(campaign.id, node.id, { status: 'done' });

  const dashboard = await nowService.getDashboard(campaign.id);
  assert.equal(dashboard.today.currentSpecialization.id, specialization.id);
  assert.equal(dashboard.today.race.key, 'crow_commander');
  assert.notEqual(dashboard.today.race.emblem, 'spark');
  assert.equal(dashboard.today.route.requiredNodeCount, 1);
  assert.equal(dashboard.today.route.completedRequiredNodeCount, 1);
  assert.equal(dashboard.today.route.completionPercent, 100);
  assert.equal(dashboard.today.route.items[0].is_complete, true);
  assert.equal(dashboard.today.route.items[0].current_mastery_level, 'confirmed');
  assert.equal(dashboard.today.route.nextItem, null);
  assert.equal(dashboard.today.planner.focusItem, null);
  assert.equal(dashboard.today.state.key, 'completed_route');
  assert.equal(dashboard.today.state.label, 'Маршрут готов');
  assert.equal(dashboard.today.state.primaryCta.action, 'complete_route');
  assert.equal(dashboard.today.state.primaryCta.label, 'Закрыть маршрут');
  assert.ok(dashboard.today.race.key);
  assert.ok(dashboard.today.city.level >= 1);
  assert.ok(dashboard.today.city.totalXp > 0);
  assert.equal(dashboard.today.opponent.specialization_id, specialization.id);
  assert.ok(dashboard.today.opponent.daysElapsed >= 3);

  await nowService.completeSpecialization(campaign.id, specialization.id);
  const victoryDashboard = await nowService.getDashboard(campaign.id);
  assert.equal(victoryDashboard.today.currentSpecialization.status, 'completed');
  assert.equal(victoryDashboard.today.route.isComplete, true);
  assert.equal(victoryDashboard.today.planner, null);
  assert.equal(victoryDashboard.today.state.key, 'completed_route');
  assert.equal(victoryDashboard.today.state.label, 'Маршрут завершен');
  assert.equal(victoryDashboard.today.state.primaryCta.action, 'continue_route');
  assert.equal(victoryDashboard.today.state.primaryCta.label, 'Выбрать маршрут');

  const next = await nowService.continueWithSpecialization(campaign.id, {
    name: 'Backend Route',
    key: 'backend-route',
  });
  const continuedDashboard = await nowService.getDashboard(campaign.id);
  assert.equal(continuedDashboard.today.opponent.specialization_id, next.id);
  assert.equal(continuedDashboard.today.opponent.daysElapsed, 0);
});

test('today activity streak uses campaign sessions without a sixty-day cap', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const todayActive = await campaignStore.createUserCampaign({ name: 'Today Active Streak' });
  await insertDailySession(database, todayActive.id, localDateKeyDaysAgo(0), 'active');
  assert.equal((await nowService.getDashboard(todayActive.id)).today.activity.streakDays, 1);

  const yesterdayActive = await campaignStore.createUserCampaign({ name: 'Yesterday Active Streak' });
  await insertDailySession(database, yesterdayActive.id, localDateKeyDaysAgo(1), 'completed');
  await insertDailySession(database, yesterdayActive.id, localDateKeyDaysAgo(2), 'completed');
  assert.equal((await nowService.getDashboard(yesterdayActive.id)).today.activity.streakDays, 2);

  const gapCampaign = await campaignStore.createUserCampaign({ name: 'Gap Streak' });
  await insertDailySession(database, gapCampaign.id, localDateKeyDaysAgo(0), 'completed');
  await insertDailySession(database, gapCampaign.id, localDateKeyDaysAgo(2), 'completed');
  assert.equal((await nowService.getDashboard(gapCampaign.id)).today.activity.streakDays, 1);

  const longCampaign = await campaignStore.createUserCampaign({ name: 'Long Streak' });
  for (let day = 0; day < 61; day += 1) {
    await insertDailySession(database, longCampaign.id, localDateKeyDaysAgo(day), 'completed');
  }
  const longDashboard = await nowService.getDashboard(longCampaign.id);
  assert.equal(longDashboard.today.activity.streakDays, 61);
  assert.equal(longDashboard.today.activity.activeSessionDayCount, 61);
});

test('today planner follows route order and exposes current stage plus next route items', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Planner Order' });
  const first = await firstNode(nowService, campaign.id);
  const second = await createSiblingNode(nowService, campaign.id, first, 'Planner second');
  const third = await createSiblingNode(nowService, campaign.id, first, 'Planner third');
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Planner Route',
    key: 'planner-route',
  });

  const firstRoute = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: first.id,
    required_mastery_level: 'confirmed',
    route_order: 20,
    route_stage: 'Base',
  });
  const secondRoute = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: second.id,
    required_mastery_level: 'understood',
    route_order: 10,
    route_stage: 'Base',
  });
  const thirdRoute = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: third.id,
    required_mastery_level: 'applied',
    route_order: 30,
    route_stage: 'Practice',
  });

  const dashboard = await nowService.getDashboard(campaign.id);

  assert.deepEqual(
    dashboard.today.route.items.map((item) => item.id),
    [secondRoute.id, firstRoute.id, thirdRoute.id],
  );
  assert.equal(dashboard.today.planner.focusItem.id, secondRoute.id);
  assert.equal(dashboard.today.planner.currentStage, 'Base');
  assert.deepEqual(
    dashboard.today.planner.currentStageItems.map((item) => item.id),
    [secondRoute.id, firstRoute.id],
  );
  assert.deepEqual(
    dashboard.today.planner.nextItems.map((item) => item.id),
    [secondRoute.id, firstRoute.id, thirdRoute.id],
  );
});

test('today planner stage progress uses the focus stage without truncating stage items', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Planner Stage' });
  const first = await firstNode(nowService, campaign.id);
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Stage Route',
    key: 'stage-route',
  });

  const routeNodes = [];
  for (let index = 0; index < 6; index += 1) {
    const node = index === 0 ? first : await createSiblingNode(nowService, campaign.id, first, `Stage node ${index}`);
    routeNodes.push(
      await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
        node_id: node.id,
        required_mastery_level: 'confirmed',
        route_order: (index + 1) * 10,
        route_stage: 'Long stage',
      }),
    );
  }

  const dashboard = await nowService.getDashboard(campaign.id);
  assert.equal(dashboard.today.planner.currentStage, 'Long stage');
  assert.equal(dashboard.today.planner.currentStageItems.length, 6);
  assert.deepEqual(
    dashboard.today.planner.currentStageItems.map((item) => item.id),
    routeNodes.map((item) => item.id),
  );

  await nowService.updateSpecializationRouteNode(campaign.id, routeNodes[0].id, { routeStage: null });
  const unstagedDashboard = await nowService.getDashboard(campaign.id);
  assert.equal(unstagedDashboard.today.planner.focusItem.id, routeNodes[0].id);
  assert.equal(unstagedDashboard.today.planner.currentStage, null);
  assert.deepEqual(
    unstagedDashboard.today.planner.currentStageItems.map((item) => item.id),
    [routeNodes[0].id],
  );
});

test('bootstrap repairs free-mode campaigns that already have a current specialization', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Mode Repair' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Existing Route',
    key: 'existing-route',
  });
  await database.execute("UPDATE campaigns SET mode = 'free' WHERE id = ?", [campaign.id]);

  const beforeBootstrap = await nowService.getDashboard(campaign.id);
  assert.equal(beforeBootstrap.today.currentSpecialization.id, specialization.id);
  assert.equal(beforeBootstrap.today.race.key, 'crow_commander');

  await bootstrapDatabase(database);
  const rows = await database.select('SELECT mode FROM campaigns WHERE id = ? LIMIT 1', [campaign.id]);
  assert.equal(rows[0].mode, 'career');
});

test('archiving the current completed specialization clears the current pointer but keeps victory', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Victory Archive' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Mathematics',
    key: 'mathematics',
  });
  const node = await firstNode(nowService, campaign.id);
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    specialization_id: specialization.id,
    task_id: 'archive-check',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'confirmed',
    passed: true,
    evidence_payload: { strict_result_id: 'archive-check-result' },
    idempotency_key: 'archive-check-pass',
  });
  await nowService.completeSpecialization(campaign.id, specialization.id);

  const career = await nowService.archiveSpecialization(campaign.id, specialization.id);
  assert.equal(career.campaign.career_status, 'victory');
  assert.equal(career.campaign.current_specialization_id, null);

  const archived = await database.select('SELECT * FROM career_specializations WHERE id = ? LIMIT 1', [
    specialization.id,
  ]);
  assert.equal(archived[0].status, 'archived');
});

test('route membership cannot be changed after specialization completion or archive', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Closed Route Guard' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Closed Route',
    key: 'closed-route',
  });
  const node = await firstNode(nowService, campaign.id);
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    specialization_id: specialization.id,
    task_id: 'closed-route-check',
    check_method: 'strict',
    target_mastery_level: 'confirmed',
    passed: true,
    evidence_payload: { strict_result_id: 'closed-route-check-result' },
    idempotency_key: 'closed-route-check-pass',
  });
  await nowService.completeSpecialization(campaign.id, specialization.id);

  await assert.rejects(
    () =>
      nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
        node_id: node.id,
        required_mastery_level: 'retained',
      }),
    /active specialization/,
  );

  await nowService.archiveSpecialization(campaign.id, specialization.id);
  await assert.rejects(
    () =>
      nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
        node_id: node.id,
        required_mastery_level: 'retained',
      }),
    /active specialization/,
  );
});

test('route overlay uniqueness rejects duplicate conceptual membership without duplicating mastery or XP', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Overlap Route' });
  const node = await firstNode(nowService, campaign.id);
  const knowledge = await nowService.upsertKnowledgeNode({
    key: 'linear-algebra/vector-space',
    title: 'Vector Space',
  });
  await nowService.updateNodeEditor(campaign.id, node.id, { knowledge_node_id: knowledge.id });

  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Linear Algebra',
    key: 'linear-algebra',
  });
  const firstRouteNode = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    knowledge_node_id: knowledge.id,
    required_mastery_level: 'confirmed',
  });
  const duplicateRouteNode = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    knowledge_node_id: knowledge.id,
    required_mastery_level: 'confirmed',
  });
  assert.equal(duplicateRouteNode.id, firstRouteNode.id);

  await nowService.updateNodeEditor(campaign.id, node.id, { status: 'done' });
  await nowService.updateNodeEditor(campaign.id, node.id, { status: 'done' });

  const grants = await database.select(
    "SELECT COUNT(*) AS count FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ? AND grant_reason = 'node_completion'",
    [campaign.id, node.id],
  );
  const mastery = await database.select(
    "SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ? AND node_id = ? AND source_type = 'legacy_node_completion'",
    [campaign.id, node.id],
  );
  assert.equal(Number(grants[0].count), 1);
  assert.equal(Number(mastery[0].count), 1);

  const completion = await nowService.getRouteCompletion(campaign.id, specialization.id);
  assert.equal(completion.isComplete, true);
});

test('knowledge identity does not share mastery across campaigns', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign One' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign Two' });
  const firstNodeRecord = await firstNode(nowService, first.id);
  const knowledge = await nowService.upsertKnowledgeNode({
    key: 'shared/calculus-limit',
    title: 'Limit',
  });
  await nowService.updateNodeEditor(first.id, firstNodeRecord.id, { knowledge_node_id: knowledge.id, status: 'done' });

  const secondSpecialization = await nowService.createSpecialization(second.id, {
    name: 'Calculus',
    key: 'calculus',
  });
  await nowService.addSpecializationRouteNode(second.id, secondSpecialization.id, {
    knowledge_node_id: knowledge.id,
    required_mastery_level: 'confirmed',
  });

  const completion = await nowService.getRouteCompletion(second.id, secondSpecialization.id);
  assert.equal(completion.isComplete, false);
});

test('route membership rejects mismatched local node and knowledge identity', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Identity Guard' });
  const node = await firstNode(nowService, campaign.id);
  const actualKnowledge = await nowService.upsertKnowledgeNode({
    key: 'identity/actual',
    title: 'Actual identity',
  });
  const otherKnowledge = await nowService.upsertKnowledgeNode({
    key: 'identity/other',
    title: 'Other identity',
  });
  await nowService.updateNodeEditor(campaign.id, node.id, { knowledge_node_id: actualKnowledge.id });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Identity Route',
    key: 'identity-route',
  });

  await assert.rejects(
    () =>
      nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
        node_id: node.id,
        knowledge_node_id: otherKnowledge.id,
      }),
    /knowledge identity/,
  );
});

test('route-bound knowledge identity cannot drift after node edit', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Identity Drift' });
  const node = await firstNode(nowService, campaign.id);
  const originalKnowledge = await nowService.upsertKnowledgeNode({
    key: 'identity/original',
    title: 'Original identity',
  });
  const nextKnowledge = await nowService.upsertKnowledgeNode({
    key: 'identity/next',
    title: 'Next identity',
  });
  await nowService.updateNodeEditor(campaign.id, node.id, { knowledge_node_id: originalKnowledge.id });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Drift Route',
    key: 'drift-route',
  });
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    knowledge_node_id: originalKnowledge.id,
    required_mastery_level: 'confirmed',
  });

  await assert.rejects(
    () => nowService.updateNodeEditor(campaign.id, node.id, { knowledge_node_id: nextKnowledge.id }),
    /knowledge identity is locked/,
  );
  const rows = await database.select('SELECT knowledge_node_id FROM nodes WHERE id = ? LIMIT 1', [node.id]);
  assert.equal(rows[0].knowledge_node_id, originalKnowledge.id);
});

test('done-to-active reverses only legacy confirmed mastery and keeps assessment-backed mastery', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Mastery Reversal' });
  const node = await firstNode(nowService, campaign.id);
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'mini-test',
    check_method: 'strict',
    strict_check_type: 'multiple_choice',
    target_mastery_level: 'confirmed',
    passed: true,
    evidence_payload: { strict_result_id: 'mini-test-result' },
    idempotency_key: 'mini-test-pass',
  });
  await nowService.updateNodeEditor(campaign.id, node.id, { status: 'done' });
  await nowService.updateNodeEditor(campaign.id, node.id, { status: 'active' });

  const events = await database.select(
    `
      SELECT source_type, active
      FROM mastery_events
      WHERE campaign_id = ?
        AND node_id = ?
      ORDER BY source_type ASC
    `,
    [campaign.id, node.id],
  );
  assert.equal(events.find((event) => event.source_type === 'assessment').active, 1);
  assert.equal(events.find((event) => event.source_type === 'legacy_node_completion').active, 0);

  const grants = await database.select(
    `
      SELECT grant_reason, active
      FROM stat_xp_grants
      WHERE campaign_id = ?
        AND node_id = ?
      ORDER BY grant_reason ASC
    `,
    [campaign.id, node.id],
  );
  assert.equal(grants.find((grant) => grant.grant_reason === 'assessment_mastery').active, 1);
  assert.equal(grants.find((grant) => grant.grant_reason === 'node_completion').active, 0);
});

test('assessment attempts are idempotent and strict-checkable tasks cannot use llm-only pass', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Assessment' });
  const node = await firstNode(nowService, campaign.id);
  await database.execute('UPDATE nodes SET check_metadata = ? WHERE id = ?', [
    JSON.stringify({ tasks: { 'persisted-strict': { strict_check_type: 'exact' } } }),
    node.id,
  ]);

  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'strict-task',
        check_method: 'llm_assisted',
        strict_check_type: 'exact',
        passed: true,
        idempotency_key: 'bad-llm',
      }),
    /Strict-checkable/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'persisted-strict',
        check_method: 'llm_assisted',
        passed: true,
        idempotency_key: 'bad-persisted-llm',
      }),
    /Strict-checkable/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'strict-task',
        check_method: 'strict',
        strict_check_type: 'exact',
        target_mastery_level: 'applied',
        passed: true,
        idempotency_key: 'strict-pass-without-evidence',
      }),
    /evidence payload/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'llm-task',
        check_method: 'llm_assisted',
        target_mastery_level: 'understood',
        passed: true,
        idempotency_key: 'llm-pass-without-evidence',
      }),
    /evidence payload/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'seen-task',
        check_method: 'strict',
        target_mastery_level: 'seen',
        passed: true,
        idempotency_key: 'seen-pass-without-evidence',
      }),
    /evidence payload/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'blank-evidence-task',
        check_method: 'strict',
        strict_check_type: 'exact',
        target_mastery_level: 'applied',
        passed: true,
        evidence_payload: '   ',
        idempotency_key: 'blank-evidence-pass',
      }),
    /evidence payload/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'empty-object-evidence-task',
        check_method: 'strict',
        strict_check_type: 'exact',
        target_mastery_level: 'applied',
        passed: true,
        evidence_payload: {},
        idempotency_key: 'empty-object-evidence-pass',
      }),
    /evidence payload/,
  );
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'answer-only-evidence-task',
        check_method: 'strict',
        strict_check_type: 'exact',
        target_mastery_level: 'applied',
        passed: true,
        evidence_payload: { answer: 'user answer only' },
        idempotency_key: 'answer-only-evidence-pass',
      }),
    /evidence payload/,
  );

  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'strict-task',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'applied',
    passed: true,
    evidence_payload: { strict_result_id: 'strict-pass-result' },
    idempotency_key: 'strict-pass',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'strict-task',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'applied',
    passed: true,
    evidence_payload: { strict_result_id: 'strict-pass-result' },
    idempotency_key: 'strict-pass',
  });

  const attempts = await database.select('SELECT COUNT(*) AS count FROM assessment_attempts WHERE campaign_id = ?', [
    campaign.id,
  ]);
  const mastery = await database.select(
    "SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ? AND source_type = 'assessment'",
    [campaign.id],
  );
  const grants = await database.select(
    "SELECT COUNT(*) AS count FROM stat_xp_grants WHERE campaign_id = ? AND grant_reason = 'assessment_mastery'",
    [campaign.id],
  );
  assert.equal(Number(attempts[0].count), 1);
  assert.equal(Number(mastery[0].count), 1);
  assert.equal(Number(grants[0].count), 1);
});

test('strict assessment metadata runs local checks and creates verifier evidence', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Strict Checks' });
  const node = await firstNode(nowService, campaign.id);
  await database.execute('UPDATE nodes SET check_metadata = ? WHERE id = ?', [
    JSON.stringify({
      tasks: {
        exact: {
          strict_check_type: 'exact',
          prompt: 'Type the key term',
          expected_answer: 'linear map',
        },
        number: {
          strict_check_type: 'number',
          expected_number: 10,
          tolerance: 0.5,
        },
        contains: {
          strict_check_type: 'contains',
          required_terms: ['basis', 'dimension'],
        },
        checklist: {
          strict_check_type: 'checklist',
          items: [
            { label: 'Definition written', required: true },
            { id: 'example', label: 'Example given', required: true },
          ],
        },
      },
    }),
    node.id,
  ]);

  const focus = await nowService.getNodeFocus(campaign.id, node.id, null);
  assert.equal(focus.mastery.check.isAutoStrictCheck, false);

  const failedExact = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'exact',
    check_method: 'strict',
    target_mastery_level: 'understood',
    submitted_answer: 'linear function',
    passed: true,
    idempotency_key: 'auto-exact-fail',
  });
  assert.equal(failedExact.attempt.passed, 0);
  assert.equal(failedExact.attempt.feedback_summary, 'Ответ не совпал с ожидаемым.');
  assert.equal(failedExact.masteryEvent, null);

  const passedExact = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'exact',
    check_method: 'strict',
    target_mastery_level: 'understood',
    submitted_answer: '  Linear   Map ',
    passed: true,
    idempotency_key: 'auto-exact-pass',
  });
  assert.equal(passedExact.attempt.passed, 1);
  assert.equal(passedExact.attempt.feedback_summary, 'Ответ совпал с ожидаемым.');
  assert.match(passedExact.attempt.evidence_payload, /"strict_check_type":"exact"/);
  assert.ok(passedExact.masteryEvent);

  const explicitFailedExact = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'exact',
    check_method: 'strict',
    target_mastery_level: 'understood',
    submitted_answer: 'linear map',
    passed: false,
    idempotency_key: 'auto-exact-explicit-fail',
  });
  assert.equal(explicitFailedExact.attempt.passed, 0);
  assert.equal(explicitFailedExact.masteryEvent, null);

  const passedNumber = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'number',
    check_method: 'strict',
    target_mastery_level: 'applied',
    submitted_answer: '10.4',
    passed: true,
    idempotency_key: 'auto-number-pass',
  });
  assert.equal(passedNumber.attempt.passed, 1);
  assert.equal(passedNumber.attempt.feedback_summary, 'Число попало в допустимый диапазон.');

  const failedContains = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'contains',
    check_method: 'strict',
    target_mastery_level: 'remembered',
    submitted_answer: 'basis only',
    passed: true,
    idempotency_key: 'auto-contains-fail',
  });
  assert.equal(failedContains.attempt.passed, 0);
  assert.equal(failedContains.attempt.feedback_summary, 'Не хватает обязательных элементов: dimension.');

  const passedChecklist = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'checklist',
    check_method: 'strict',
    target_mastery_level: 'confirmed',
    submitted_answer: JSON.stringify(['0', 'example']),
    checklist_results: { 0: true, example: true },
    passed: true,
    idempotency_key: 'auto-checklist-pass',
  });
  assert.equal(passedChecklist.attempt.passed, 1);
  assert.equal(passedChecklist.attempt.feedback_summary, 'Все обязательные пункты чек-листа отмечены.');
  assert.match(passedChecklist.attempt.evidence_payload, /"strict_check_type":"checklist"/);
});

test('check metadata builder output feeds strict assessment checks', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Check Builder' });
  const node = await firstNode(nowService, campaign.id);
  const blankNumberMetadata = serializeCheckMetadataDraft({
    ...emptyCheckMetadataDraft('builder-number-empty'),
    kind: 'number',
    prompt: 'Enter the result',
    expectedNumber: '',
    tolerance: '',
  });
  assert.equal(blankNumberMetadata, null);

  await database.execute('UPDATE nodes SET check_metadata = ? WHERE id = ?', [blankNumberMetadata, node.id]);
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'builder-number-empty',
        check_method: 'strict',
        target_mastery_level: 'understood',
        submitted_answer: '0',
        passed: true,
        idempotency_key: 'builder-number-empty-rejected',
      }),
    /evidence payload/,
  );

  await database.execute('UPDATE nodes SET check_metadata = ? WHERE id = ?', [
    serializeCheckMetadataDraft({
      ...emptyCheckMetadataDraft('builder-exact'),
      kind: 'exact',
      prompt: 'Type the key term',
      expectedAnswer: 'linear map',
    }),
    node.id,
  ]);

  const passedExact = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'builder-exact',
    check_method: 'strict',
    target_mastery_level: 'understood',
    submitted_answer: 'Linear Map',
    passed: true,
    idempotency_key: 'builder-exact-pass',
  });
  assert.equal(passedExact.attempt.passed, 1);
  assert.ok(passedExact.masteryEvent);

  await database.execute('UPDATE nodes SET check_metadata = ? WHERE id = ?', [
    serializeCheckMetadataDraft({
      ...emptyCheckMetadataDraft('builder-checklist'),
      kind: 'checklist',
      prompt: 'Check proof',
      checklistItems: [{ id: '', label: 'Definition written', required: true }],
    }),
    node.id,
  ]);

  const passedChecklist = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'builder-checklist',
    check_method: 'strict',
    target_mastery_level: 'confirmed',
    submitted_answer: JSON.stringify(['definition-written']),
    checklist_results: { 'definition-written': true },
    passed: true,
    idempotency_key: 'builder-checklist-pass',
  });
  assert.equal(passedChecklist.attempt.passed, 1);
  assert.match(passedChecklist.attempt.evidence_payload, /"strict_check_type":"checklist"/);
});

test('assessment submit requires caller idempotency key and retry uses a new explicit key', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Assessment Retry' });
  const node = await firstNode(nowService, campaign.id);
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(campaign.id, {
        node_id: node.id,
        task_id: 'retry-task',
        check_method: 'strict',
        strict_check_type: 'exact',
        target_mastery_level: 'applied',
        passed: false,
      }),
    /idempotency key/,
  );
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'retry-task',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'applied',
    passed: false,
    idempotency_key: 'retry-task-failed-1',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'retry-task',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'applied',
    passed: true,
    evidence_payload: { strict_result_id: 'retry-task-result-2' },
    idempotency_key: 'retry-task-passed-2',
  });

  const attempts = await database.select(
    'SELECT COUNT(*) AS count FROM assessment_attempts WHERE campaign_id = ? AND node_id = ?',
    [campaign.id, node.id],
  );
  const mastery = await database.select(
    "SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ? AND node_id = ? AND source_type = 'assessment'",
    [campaign.id, node.id],
  );
  const grants = await database.select(
    "SELECT COUNT(*) AS count FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ? AND grant_reason = 'assessment_mastery'",
    [campaign.id, node.id],
  );

  assert.equal(Number(attempts[0].count), 2);
  assert.equal(Number(mastery[0].count), 1);
  assert.equal(Number(grants[0].count), 1);
});

test('failed assessment attempt persists without evidence or verified mastery side effects', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Assessment Fail Boundary' });
  const node = await firstNode(nowService, campaign.id);

  const result = await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'inspector-fail-check',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'applied',
    passed: false,
    feedback_summary: 'Not passed yet.',
    idempotency_key: 'inspector-fail-check-1',
  });

  assert.equal(result.attempt.passed, 0);
  assert.equal(result.masteryEvent, null);
  assert.equal(result.xpGrantResult, null);

  const attempts = await database.select(
    'SELECT COUNT(*) AS count FROM assessment_attempts WHERE campaign_id = ? AND node_id = ?',
    [campaign.id, node.id],
  );
  const mastery = await database.select(
    "SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ? AND node_id = ? AND source_type = 'assessment'",
    [campaign.id, node.id],
  );
  const grants = await database.select(
    "SELECT COUNT(*) AS count FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ? AND grant_reason = 'assessment_mastery'",
    [campaign.id, node.id],
  );

  assert.equal(Number(attempts[0].count), 1);
  assert.equal(Number(mastery[0].count), 0);
  assert.equal(Number(grants[0].count), 0);
});

test('node focus exposes route mastery and assessment evidence for the inspector', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Inspector Mastery' });
  const node = await firstNode(nowService, campaign.id);
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Inspector Route',
    key: 'inspector-route',
  });
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'applied',
  });

  const emptyFocus = await nowService.getNodeFocus(campaign.id, node.id, null);
  assert.equal(emptyFocus.mastery.currentLevel, null);
  assert.equal(emptyFocus.mastery.routeRequirement.required_mastery_level, 'applied');
  assert.equal(emptyFocus.mastery.isVerified, false);

  await nowService.markSelfMastery(campaign.id, node.id, 'seen');
  const selfFocus = await nowService.getNodeFocus(campaign.id, node.id, null);
  assert.equal(selfFocus.mastery.currentLevel, 'seen');
  assert.equal(selfFocus.mastery.isSelfMarkedOnly, true);

  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    task_id: 'inspector-check',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'applied',
    passed: true,
    evidence_payload: { strict_result_id: 'inspector-check-result' },
    idempotency_key: 'inspector-check-pass',
  });

  const verifiedFocus = await nowService.getNodeFocus(campaign.id, node.id, null);
  assert.equal(verifiedFocus.mastery.currentLevel, 'applied');
  assert.equal(verifiedFocus.mastery.isVerified, true);
  assert.equal(verifiedFocus.mastery.latestAttempt.task_id, 'inspector-check');
  assert.equal(verifiedFocus.mastery.latestAttempt.passed, 1);
});

test('node focus ignores current specialization rows from another campaign', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const firstCampaign = await campaignStore.createUserCampaign({ name: 'Focus Campaign A' });
  const secondCampaign = await campaignStore.createUserCampaign({ name: 'Focus Campaign B' });
  const focusNode = await firstNode(nowService, firstCampaign.id);
  const knowledge = await nowService.upsertKnowledgeNode({
    key: 'shared/focus-route-leak',
    title: 'Focus Route Leak',
  });
  await nowService.updateNodeEditor(firstCampaign.id, focusNode.id, { knowledge_node_id: knowledge.id });
  const foreignSpecialization = await nowService.createSpecialization(secondCampaign.id, {
    name: 'Foreign Route',
    key: 'foreign-route',
  });
  await nowService.addSpecializationRouteNode(secondCampaign.id, foreignSpecialization.id, {
    knowledge_node_id: knowledge.id,
    required_mastery_level: 'confirmed',
  });

  await database.execute('UPDATE campaigns SET current_specialization_id = ? WHERE id = ?', [
    foreignSpecialization.id,
    firstCampaign.id,
  ]);

  const focus = await nowService.getNodeFocus(firstCampaign.id, focusNode.id, null);
  assert.equal(focus.mastery.routeRequirement, null);
});

test('route edge endpoints must belong to the edge specialization', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Route Edge Guard' });
  const node = await firstNode(nowService, campaign.id);
  const firstSpecialization = await nowService.createSpecialization(campaign.id, {
    name: 'First Route',
    key: 'first-route',
  });
  const firstRouteNode = await nowService.addSpecializationRouteNode(campaign.id, firstSpecialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    specialization_id: firstSpecialization.id,
    task_id: 'route-edge-check',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'confirmed',
    passed: true,
    evidence_payload: { strict_result_id: 'route-edge-check-result' },
    idempotency_key: 'route-edge-check-pass',
  });
  await nowService.completeSpecialization(campaign.id, firstSpecialization.id);

  const secondSpecialization = await nowService.continueWithSpecialization(campaign.id, {
    name: 'Second Route',
    key: 'second-route',
  });
  const secondRouteNode = await nowService.addSpecializationRouteNode(campaign.id, secondSpecialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });

  await assert.rejects(
    () =>
      database.execute(
        `
          INSERT INTO specialization_route_edges (
            specialization_id,
            source_route_node_id,
            target_route_node_id,
            edge_type,
            created_at
          )
          VALUES (?, ?, ?, 'requires', ?)
        `,
        [secondSpecialization.id, firstRouteNode.id, secondRouteNode.id, new Date().toISOString()],
      ),
    /same specialization/,
  );
});

test('self-marked free-mode progress does not grant XP or verified route completion', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Free Mode' });
  const node = await firstNode(nowService, campaign.id);
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Personal Route',
    key: 'personal-route',
  });
  await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });

  await nowService.markSelfMastery(campaign.id, node.id, 'seen');
  const completion = await nowService.getRouteCompletion(campaign.id, specialization.id);
  const dashboard = await nowService.getDashboard(campaign.id);
  const grants = await database.select('SELECT COUNT(*) AS count FROM stat_xp_grants WHERE campaign_id = ?', [
    campaign.id,
  ]);

  assert.equal(completion.isComplete, false);
  assert.equal(dashboard.today.mastery.selfMarkedOnlyNodeCount, 1);
  assert.equal(dashboard.today.mastery.verifiedNodeCount, 0);
  assert.equal(dashboard.today.mastery.confirmedOrBetterNodeCount, 0);
  assert.equal(Number(grants[0].count), 0);
});

test('active route membership can update requirements and remove route nodes', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Route Authoring' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Frontend Route',
    key: 'frontend-route',
  });
  const node = await firstNode(nowService, campaign.id);
  const routeNode = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'understood',
    route_order: 20,
    route_stage: 'Base',
    isRequired: false,
  });
  assert.equal(routeNode.is_required, 0);

  const updated = await nowService.updateSpecializationRouteNode(campaign.id, routeNode.id, {
    required_mastery_level: 'retained',
    route_order: 5,
    route_stage: 'Final',
    is_required: false,
  });
  assert.equal(updated.required_mastery_level, 'retained');
  assert.equal(updated.route_order, 5);
  assert.equal(updated.route_stage, 'Final');
  assert.equal(updated.is_required, 0);

  const completion = await nowService.getRouteCompletion(campaign.id, specialization.id);
  assert.equal(completion.items[0].id, routeNode.id);
  assert.equal(completion.items[0].required_mastery_level, 'retained');
  assert.equal(completion.items[0].route_order, 5);
  assert.equal(completion.items[0].route_stage, 'Final');
  assert.equal(completion.items[0].is_required, 0);

  const removed = await nowService.removeSpecializationRouteNode(campaign.id, routeNode.id);
  assert.equal(removed.id, routeNode.id);

  const afterRemoval = await nowService.getRouteCompletion(campaign.id, specialization.id);
  assert.equal(afterRemoval.routeNodeCount, 0);
});

test('route add updates existing metadata and route reorder swaps in one operation', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Route Ordering' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Ordered Route',
    key: 'ordered-route',
  });
  const first = await firstNode(nowService, campaign.id);
  const second = await createSiblingNode(nowService, campaign.id, first, 'Route sibling');

  const firstRouteNode = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: first.id,
    required_mastery_level: 'understood',
    route_order: 10,
    route_stage: 'Base',
  });
  const secondRouteNode = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: second.id,
    required_mastery_level: 'confirmed',
    route_order: 20,
  });

  const upserted = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: first.id,
    required_mastery_level: 'retained',
    route_order: 30,
    route_stage: 'Final',
    is_required: false,
  });
  assert.equal(upserted.id, firstRouteNode.id);
  assert.equal(upserted.required_mastery_level, 'retained');
  assert.equal(upserted.route_order, 30);
  assert.equal(upserted.route_stage, 'Final');
  assert.equal(upserted.is_required, 0);

  await nowService.reorderSpecializationRouteNodes(campaign.id, firstRouteNode.id, secondRouteNode.id);
  const completion = await nowService.getRouteCompletion(campaign.id, specialization.id);

  assert.deepEqual(
    completion.items.map((item) => item.id),
    [firstRouteNode.id, secondRouteNode.id],
  );
  assert.deepEqual(
    completion.items.map((item) => item.route_order),
    [20, 30],
  );
});

test('completed and archived route memberships are immutable', async (t) => {
  const { database, campaignStore, nowService } = await setupCareerService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Immutable Route' });
  const specialization = await nowService.createSpecialization(campaign.id, {
    name: 'Backend Route',
    key: 'backend-route',
  });
  const node = await firstNode(nowService, campaign.id);
  const routeNode = await nowService.addSpecializationRouteNode(campaign.id, specialization.id, {
    node_id: node.id,
    required_mastery_level: 'confirmed',
  });
  await nowService.submitAssessmentAttempt(campaign.id, {
    node_id: node.id,
    specialization_id: specialization.id,
    task_id: 'immutable-route-check',
    check_method: 'strict',
    strict_check_type: 'exact',
    target_mastery_level: 'confirmed',
    passed: true,
    evidence_payload: { strict_result_id: 'immutable-route-result' },
    idempotency_key: 'immutable-route-pass',
  });
  await nowService.completeSpecialization(campaign.id, specialization.id);

  await assert.rejects(
    () =>
      nowService.updateSpecializationRouteNode(campaign.id, routeNode.id, {
        required_mastery_level: 'retained',
      }),
    /active specialization/,
  );
  await assert.rejects(
    () => nowService.removeSpecializationRouteNode(campaign.id, routeNode.id),
    /active specialization/,
  );

  await nowService.archiveSpecialization(campaign.id, specialization.id);
  await assert.rejects(
    () =>
      nowService.updateSpecializationRouteNode(campaign.id, routeNode.id, {
        required_mastery_level: 'retained',
      }),
    /active specialization/,
  );
  await assert.rejects(
    () => nowService.removeSpecializationRouteNode(campaign.id, routeNode.id),
    /active specialization/,
  );
});
