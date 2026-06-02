import test from 'node:test';
import assert from 'node:assert/strict';

import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { buildInfrastructureObjects, buildProgramHierarchy, findObjectForNode } from '../src/application/program-hierarchy.ts';
import { CS_BACHELOR_COURSE_KEYS, CS_BACHELOR_COURSES } from '../src/application/cs-bachelor-course-catalog.ts';
import { createNowService } from '../src/application/now-service.js';
import { createCampaignStore } from '../src/stores/campaign-store.js';
import { createDailySessionStore } from '../src/stores/daily-session-store.js';
import { createHierarchyStore } from '../src/stores/hierarchy-store.js';
import { createNodeNoteStore } from '../src/stores/node-note-store.js';
import { createReviewStateStore } from '../src/stores/review-state-store.js';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const setupCampaignService = async () => {
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

test('campaign migration is idempotent and seeds one developer main campaign', async (t) => {
  const { database } = await setupCampaignService();
  t.after(() => database.close());

  await bootstrapDatabase(database);

  const rows = await database.select("SELECT * FROM campaigns WHERE type = 'developer_main'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].is_archived, 0);

  const stats = await database.select('SELECT * FROM campaign_stats WHERE campaign_id = ?', [rows[0].id]);
  assert.equal(stats.length > 0, true);

  const opponents = await database.select('SELECT * FROM campaign_opponents');
  assert.equal(opponents.length, 0);
});

test('CS bachelor template seed is idempotent and visible as a template campaign', async (t) => {
  const { database, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  await bootstrapDatabase(database);

  const rows = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].type, 'template');
  assert.equal(rows[0].name, 'Бакалавриат по информатике');

  const nodes = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
    `,
    [rows[0].id],
  );
  assert.equal(Number(nodes[0].count), 54);

  const regionCounts = await database.select(
    `
      SELECT spheres.slug, COUNT(nodes.id) AS count
      FROM spheres
      JOIN directions ON directions.sphere_id = spheres.id AND directions.is_archived = 0
      JOIN skills ON skills.direction_id = directions.id AND skills.is_archived = 0
      LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
      WHERE spheres.campaign_id = ?
        AND spheres.is_archived = 0
      GROUP BY spheres.slug
      ORDER BY spheres.sort_order ASC
    `,
    [rows[0].id],
  );
  assert.deepEqual(
    Object.fromEntries(regionCounts.map((row) => [row.slug, Number(row.count)])),
    {
      'region-programming': 8,
      'region-mathematics': 8,
      'region-algorithms-theory': 8,
      'region-computer-systems': 9,
      'region-data-ai': 7,
      'region-software-product': 6,
      'region-society-ethics-law': 3,
      'region-projects': 5,
    },
  );

  const activeNodes = await database.select(
    `
      SELECT nodes.slug, nodes.type, nodes.links, nodes.check_metadata
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND nodes.is_archived = 0
    `,
    [rows[0].id],
  );
  assert.equal(activeNodes.length, 54);
  assert.deepEqual(
    activeNodes.map((row) => row.slug).sort(),
    [...CS_BACHELOR_COURSE_KEYS].sort(),
  );
  assert.equal(activeNodes.every((row) => row.type === 'theory' || row.type === 'project'), true);
  assert.equal(activeNodes.every((row) => row.check_metadata == null), true);
  assert.equal(activeNodes.every((row) => JSON.parse(row.links).kind === 'cs_bachelor_course'), true);

  const campaigns = await campaignStore.listCampaigns();
  const templateSummary = campaigns.active.find((campaign) => campaign.slug === 'template-cs-bachelor');
  assert.equal(templateSummary?.type, 'template');
  assert.equal(templateSummary?.node_count, 54);
  assert.equal(campaigns.lastOpened?.slug, undefined);
});

test('campaign template catalog seeds the first showcase batch as forkable campaigns', async (t) => {
  const { database, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  await bootstrapDatabase(database);

  const rows = await database.select(
    `
      SELECT campaigns.slug, campaigns.name, COUNT(nodes.id) AS node_count
      FROM campaigns
      LEFT JOIN spheres ON spheres.campaign_id = campaigns.id AND spheres.is_archived = 0
      LEFT JOIN directions ON directions.sphere_id = spheres.id AND directions.is_archived = 0
      LEFT JOIN skills ON skills.direction_id = directions.id AND skills.is_archived = 0
      LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
      WHERE campaigns.type = 'template'
      GROUP BY campaigns.id
      ORDER BY campaigns.slug ASC
    `,
  );
  const templatesBySlug = new Map(rows.map((row) => [row.slug, row]));

  for (const slug of [
    'template-applied-math',
    'template-biology',
    'template-cs-bachelor',
    'template-materials-science',
    'template-ml-ai',
    'template-nlh-cash',
  ]) {
    assert.equal(templatesBySlug.has(slug), true);
    assert.equal(Number(templatesBySlug.get(slug).node_count) >= 3, true);
  }

  assert.equal(templatesBySlug.get('template-nlh-cash').name, 'NLH cash');

  const [nlhTemplate] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-nlh-cash' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(nlhTemplate.id);
  assert.equal(personal.type, 'user');
  assert.equal(personal.name, 'NLH cash');
  assert.equal(personal.source_template_id, nlhTemplate.id);
});

test('campaign migration links legacy same-name user campaigns after seeding new templates', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());
  const timestamp = '2026-01-01T00:00:00.000Z';

  await database.execute(`
    CREATE TABLE campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('developer_main', 'user', 'template')),
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      mode TEXT NOT NULL DEFAULT 'free',
      career_status TEXT NOT NULL DEFAULT 'active' CHECK (career_status IN ('active', 'victory')),
      current_specialization_id INTEGER,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_opened_at TEXT
    )
  `);
  await database.execute(
    `
      INSERT INTO campaigns (
        type,
        slug,
        name,
        icon,
        color,
        mode,
        career_status,
        current_specialization_id,
        is_archived,
        created_at,
        updated_at,
        last_opened_at
      )
      VALUES ('user', 'legacy-applied-math', 'Бакалавриат по прикладной математике', NULL, NULL, 'career', 'active', NULL, 0, ?, ?, ?)
    `,
    [timestamp, timestamp, timestamp],
  );

  await bootstrapDatabase(database);

  const [legacyCampaign] = await database.select(
    "SELECT source_template_id FROM campaigns WHERE slug = 'legacy-applied-math' LIMIT 1",
  );
  const [templateCampaign] = await database.select(
    "SELECT id FROM campaigns WHERE slug = 'template-applied-math' LIMIT 1",
  );

  assert.equal(legacyCampaign.source_template_id, templateCampaign.id);
});

test('CS bachelor template can fork into a personal campaign without copying progress', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id);

  assert.equal(personal.type, 'user');
  assert.equal(personal.name, 'Бакалавриат по информатике');
  assert.equal(personal.source_template_id, template.id);
  assert.notEqual(personal.id, template.id);

  const countNodes = async (campaignId) =>
    Number(
      (
        await database.select(
          `
            SELECT COUNT(*) AS count
            FROM nodes
            JOIN skills ON skills.id = nodes.skill_id
            JOIN directions ON directions.id = skills.direction_id
            JOIN spheres ON spheres.id = directions.sphere_id
            WHERE spheres.campaign_id = ?
          `,
          [campaignId],
        )
      )[0].count,
    );

  assert.equal(await countNodes(template.id), 54);
  assert.equal(await countNodes(personal.id), 54);

  const [personalNode] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      ORDER BY nodes.id ASC
      LIMIT 1
    `,
    [personal.id],
  );
  await nowService.markSelfMastery(personal.id, personalNode.id, 'seen');

  const templateMastery = await database.select('SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ?', [
    template.id,
  ]);
  const personalMastery = await database.select('SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ?', [
    personal.id,
  ]);
  assert.equal(Number(templateMastery[0].count), 0);
  assert.equal(Number(personalMastery[0].count), 1);
});

test('forked CS bachelor slice feeds Today Map and Wind Rose with real route data', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Playable Slice' });

  const templateDashboard = await nowService.getDashboard(template.id);
  assert.equal(templateDashboard.today.cityControl, null);

  const dashboard = await nowService.getDashboard(personal.id);
  assert.equal(dashboard.primaryRecommendation.nodeTitle, 'Введение в программирование');
  assert.equal(dashboard.primaryRecommendation.actionTitle, 'Открыть курс');
  assert.equal(dashboard.today.route.routeNodeCount, 54);
  assert.equal(dashboard.today.cityControl.opponent.name, 'Corvus AI');
  assert.equal(dashboard.today.cityControl.opponent.xp, 0);
  assert.equal(dashboard.today.cityControl.objects.length > 0, true);
  assert.equal(dashboard.today.route.items.every((item) => item.control_state != null), true);
  assert.equal(dashboard.today.planner.currentStage, '1 семестр');
  assert.deepEqual(
    dashboard.today.planner.nextItems.slice(0, 3).map((item) => item.title),
    ['Введение в программирование', 'Инструменты разработчика', 'Линейная алгебра'],
  );

  const navigation = await nowService.getNavigationSnapshot(personal.id);
  assert.equal(navigation.spheres.length, 8);
  assert.equal(
    navigation.spheres.flatMap((sphere) => sphere.directions).flatMap((direction) => direction.skills).reduce((sum, skill) => sum + skill.nodes.length, 0),
    54,
  );
  assert.equal(navigation.edges.filter((edge) => edge.edge_type === 'requires').length > 40, true);
  assert.equal(navigation.edges.some((edge) => edge.edge_type === 'supports'), true);

  const programHierarchy = buildProgramHierarchy({
    snapshot: navigation,
    routeItems: dashboard.today.route.items,
  });
  const routeFocusNodeId = dashboard.today.route.nextItem?.node_id ?? null;
  const infrastructureObjects = buildInfrastructureObjects({
    entries: programHierarchy,
    routeItems: dashboard.today.route.items,
    routeFocusNodeId,
  });
  assert.equal(infrastructureObjects.length, 54);
  assert.equal(programHierarchy.filter((entry) => entry.role === 'course_hub').length, 54);
  assert.equal(programHierarchy.filter((entry) => entry.role === 'atomic_node').length, 0);
  assert.equal(infrastructureObjects.some((object) => object.title === 'Введение в программирование'), true);
  assert.equal(infrastructureObjects.some((object) => object.title === 'Выпускной проект / диплом'), true);
  assert.equal(findObjectForNode(programHierarchy, routeFocusNodeId)?.objectKey, infrastructureObjects[0].key);

  const routeEdges = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM specialization_route_edges route_edges
      JOIN career_specializations specializations ON specializations.id = route_edges.specialization_id
      WHERE specializations.campaign_id = ?
    `,
    [personal.id],
  );
  assert.equal(
    Number(routeEdges[0].count),
    CS_BACHELOR_COURSES.reduce((sum, course) => sum + course.prerequisiteKeys.length, 0),
  );

  const windRose = await nowService.getWindRoseSnapshot(personal.id);
  assert.equal(windRose.stats.length, 8);
  assert.equal(windRose.stats.reduce((sum, stat) => sum + stat.branches.length, 0), 54);
  assert.equal(windRose.unassignedBranches.length, 0);
  assert.equal(
    windRose.stats.some((stat) => stat.title === 'Код'),
    true,
  );
  assert.equal(
    windRose.stats.some((stat) => stat.title === 'Проекты'),
    true,
  );

  const [introCourseNode] = await database.select(
    `
      SELECT nodes.id, nodes.links
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND nodes.slug = 'programming-intro'
      LIMIT 1
    `,
    [personal.id],
  );
  assert.equal(JSON.parse(introCourseNode.links).kind, 'cs_bachelor_course');
  const introFocus = await nowService.getNodeFocus(personal.id, introCourseNode.id, null);
  assert.equal(introFocus.mastery.check.isStrictCheckable, false);
  assert.equal(introFocus.mastery.check.prompt, null);
  assert.ok(['theory', 'project'].includes(introFocus.node.type));

  const courseSupportEdges = await database.select(
    `
      SELECT source_nodes.slug AS source_slug, target_nodes.slug AS target_slug, dependencies.dependency_type
      FROM node_dependencies dependencies
      JOIN nodes source_nodes ON source_nodes.id = dependencies.blocked_node_id
      JOIN nodes target_nodes ON target_nodes.id = dependencies.blocking_node_id
      JOIN skills ON skills.id = source_nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND dependencies.dependency_type = 'supports'
      ORDER BY source_nodes.slug ASC, target_nodes.slug ASC
    `,
    [personal.id],
  );
  assert.equal(
    courseSupportEdges.some(
      (edge) =>
        edge.source_slug === 'programming-practice' &&
        edge.target_slug === 'programming-intro',
    ),
    true,
  );
  assert.equal(
    courseSupportEdges.some(
      (edge) =>
        edge.source_slug === 'programming-intro' &&
        edge.target_slug === 'programming-practice',
    ),
    false,
  );
});

test('CS bachelor second slice becomes the Today focus after foundations are confirmed', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Database Slice Fixture' });
  const [specialization] = await database.select(
    'SELECT * FROM career_specializations WHERE campaign_id = ? AND key = ? LIMIT 1',
    [personal.id, 'route-core-cs-foundations'],
  );
  const foundationRouteNodes = await database.select(
    `
      SELECT route_nodes.node_id, route_nodes.knowledge_node_id
      FROM specialization_route_nodes route_nodes
      JOIN specialization_route_nodes target_route_node ON target_route_node.specialization_id = route_nodes.specialization_id
      JOIN nodes target_nodes ON target_nodes.id = target_route_node.node_id
      WHERE route_nodes.specialization_id = ?
        AND target_nodes.slug = 'databases'
        AND route_nodes.route_order < target_route_node.route_order
      ORDER BY route_nodes.route_order ASC
    `,
    [specialization.id],
  );
  assert.equal(foundationRouteNodes.length > 0 && foundationRouteNodes.length < 54, true);
  const timestamp = '2026-01-15T00:00:00.000Z';
  for (const [index, routeNode] of foundationRouteNodes.entries()) {
    await database.execute(
      `
        INSERT INTO mastery_events (
          campaign_id,
          node_id,
          specialization_id,
          knowledge_node_id,
          mastery_level,
          source_type,
          source_id,
          idempotency_key,
          active,
          created_at,
          reversed_at
        )
        VALUES (?, ?, ?, ?, 'confirmed', 'assessment', ?, ?, 1, ?, NULL)
      `,
      [
        personal.id,
        routeNode.node_id,
        specialization.id,
        routeNode.knowledge_node_id,
        routeNode.node_id,
        `test-db-slice-foundation:${personal.id}:${index}`,
        timestamp,
      ],
    );
    await database.execute('UPDATE node_actions SET status = ?, updated_at = ? WHERE node_id = ?', [
      'done',
      timestamp,
      routeNode.node_id,
    ]);
    await database.execute('UPDATE nodes SET status = ?, last_touched_at = ?, updated_at = ? WHERE id = ?', [
      'done',
      timestamp,
      timestamp,
      routeNode.node_id,
    ]);
  }

  const dashboard = await nowService.getDashboard(personal.id);
  assert.equal(dashboard.primaryRecommendation.nodeTitle, 'Базы данных');
  assert.equal(dashboard.today.planner.currentStage, '4 семестр');
  assert.deepEqual(
    dashboard.today.planner.nextItems.slice(0, 3).map((item) => item.title),
    ['Базы данных', 'Операционные системы', 'Анализ данных'],
  );
});

test('forked CS bachelor Daily Run selects route weak due tasks and records outcomes through finish', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Daily Run Fixture' });

  const session = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  assert.equal(session.status, 'active');
  assert.equal(session.state, 'active');
  assert.equal(session.tasks.length >= 3 && session.tasks.length <= 5, true);
  assert.equal(session.tasks.some((task) => task.source === 'route_front'), true);

  await nowService.completeActionInTodaySession(personal.id, session.tasks[0].actionId);
  await nowService.failActionInTodaySession(personal.id, session.tasks[1].actionId, 'Could not solve this check yet.');
  await nowService.skipActionInTodaySession(personal.id, session.tasks[2].actionId, 'Not useful in this run.');

  for (const task of session.tasks.slice(3)) {
    await nowService.deferActionInTodaySession(personal.id, task.actionId, 'Carry forward.');
  }

  const active = await nowService.getDashboard(personal.id);
  assert.deepEqual(
    active.todaySession.tasks.slice(0, 3).map((task) => task.outcome),
    ['completed', 'failed', 'skipped'],
  );
  assert.equal(active.todaySession.tasks.every((task) => task.outcome !== 'pending'), true);

  const finished = await nowService.finishDailyRun(personal.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.state, 'completed');
  assert.match(finished.summary_note, new RegExp(`Итог дня: 1/${session.tasks.length} закрыто; ${session.tasks.length - 1} на повторении`));
  assert.match(finished.summary_note, /Прогресс: \+25 XP/);
  assert.match(finished.summary_note, /Закрыто: Открыть курс/);

  const refreshed = await nowService.getDashboard(personal.id);
  assert.equal(refreshed.todaySession.status, 'completed');
  assert.deepEqual(
    refreshed.todaySession.tasks.slice(0, 3).map((task) => task.outcome),
    ['completed', 'failed', 'skipped'],
  );
});

test('forked CS bachelor weak spots combine low mastery stale failed and self-marked recovery inputs', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Weak Spot Fixture' });

  const initialDashboard = await nowService.getDashboard(personal.id);
  assert.equal(initialDashboard.today.planner.weakSpots.some((item) => item.weak_spot_sources.includes('low_mastery')), true);

  const routeItems = initialDashboard.today.route.items.filter((item) => item.node_id != null);
  const failedItem = routeItems[2];
  const staleItem = routeItems[3];
  const selfMarkedItem = routeItems[4];

  await nowService.submitAssessmentAttempt(personal.id, {
    node_id: failedItem.node_id,
    task_id: `node:${failedItem.node_id}:assessment`,
    check_method: 'strict',
    target_mastery_level: 'seen',
    passed: false,
    feedback_summary: 'Try the proof outline again.',
    idempotency_key: `weak-failed:${personal.id}:${failedItem.node_id}`,
  });
  await nowService.submitAssessmentAttempt(personal.id, {
    node_id: failedItem.node_id,
    task_id: `node:${failedItem.node_id}:assessment`,
    check_method: 'strict',
    target_mastery_level: 'seen',
    passed: false,
    feedback_summary: 'Try the proof outline again.',
    idempotency_key: `weak-failed:${personal.id}:${failedItem.node_id}`,
  });
  await database.execute(
    `
      INSERT INTO review_states (node_id, review_profile, next_due_at, last_reviewed_at, current_risk, updated_at)
      VALUES (?, 'learning', '2026-01-01T00:00:00.000Z', '2025-12-20T00:00:00.000Z', 'high', '2026-01-01T00:00:00.000Z')
    `,
    [staleItem.node_id],
  );
  await nowService.markSelfMastery(personal.id, selfMarkedItem.node_id, 'seen');

  const dashboard = await nowService.getDashboard(personal.id);
  const weakSources = new Set(dashboard.today.planner.weakSpots.flatMap((item) => item.weak_spot_sources));
  assert.equal(weakSources.has('failed_assessment'), true);
  assert.equal(weakSources.has('stale'), true);
  assert.equal(weakSources.has('self_marked_unverified'), true);
  assert.equal(dashboard.today.planner.weakSpots.every((item) => /error/i.test(item.weak_spot_reason_label) === false), true);
  assert.equal(dashboard.today.cityControl.summary.contestedNodeCount > 0, true);
  assert.equal(['contested', 'lost_ground'].includes(dashboard.today.cityControl.summary.state), true);

  const [opponent] = await database.select('SELECT * FROM campaign_opponents WHERE campaign_id = ?', [personal.id]);
  assert.equal(Number(opponent.xp), 8);
  assert.equal(opponent.pressure_level, 'attack');

  const run = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  assert.equal(run.tasks.some((task) => task.source === 'weak_spot'), true);

  const failedRecoveryTask = run.tasks.find((task) => task.source === 'weak_spot' && task.nodeId === failedItem.node_id);
  assert.ok(failedRecoveryTask);
  await nowService.completeActionInTodaySession(personal.id, failedRecoveryTask.actionId);
  const afterRecovery = await nowService.getDashboard(personal.id);
  const recoveredFailedAssessment = afterRecovery.today.planner.weakSpots.find((item) => item.node_id === failedItem.node_id);
  assert.notEqual(recoveredFailedAssessment?.weak_spot_sources.includes('failed_assessment'), true);
});

test('Daily Run retry adds a visible recovery attempt and completion removes the route weak spot', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Retry Recovery Fixture' });

  const run = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  const recoveryTask = run.tasks.find((task) => task.source === 'weak_spot') ?? run.tasks[1];

  await nowService.failActionInTodaySession(personal.id, recoveryTask.actionId, 'Needs another pass.');
  const firstRetry = await nowService.retryActionInTodaySession(personal.id, recoveryTask.actionId, 'Repeat immediately.');
  assert.equal(
    firstRetry.dashboard.todaySession.tasks.filter((task) => task.actionId === recoveryTask.actionId).length >= 2,
    true,
  );
  assert.equal(
    firstRetry.dashboard.todaySession.tasks.some((task) => task.source === 'recovery_retry' && task.outcome === 'pending'),
    true,
  );

  await nowService.failActionInTodaySession(personal.id, recoveryTask.actionId, 'Still needs reinforcement.');
  const secondRetry = await nowService.retryActionInTodaySession(personal.id, recoveryTask.actionId, 'One more pass.');
  assert.equal(
    secondRetry.dashboard.todaySession.tasks.filter((task) => task.actionId === recoveryTask.actionId).length >= 3,
    true,
  );
  assert.equal(
    secondRetry.dashboard.todaySession.tasks.some((task) => task.source === 'recovery_retry' && task.outcome === 'pending'),
    true,
  );

  await nowService.completeActionInTodaySession(personal.id, recoveryTask.actionId);
  const afterCompletion = await nowService.getDashboard(personal.id);
  const attemptsForAction = afterCompletion.todaySession.tasks.filter((task) => task.actionId === recoveryTask.actionId);
  assert.deepEqual(
    attemptsForAction.map((task) => task.outcome),
    ['failed', 'failed', 'completed'],
  );

  const finished = await nowService.finishDailyRun(personal.id);
  assert.match(finished.summary_note, new RegExp(`Итог дня: 1/${afterCompletion.todaySession.tasks.length} закрыто; 0 на повторении`));
  assert.doesNotMatch(finished.summary_note, new RegExp(`Итог дня: 2/${afterCompletion.todaySession.tasks.length} закрыто`));

  const refreshed = await nowService.getDashboard(personal.id);
  const sameWeakSpot = refreshed.today.planner.weakSpots.find((item) => item.node_id === recoveryTask.nodeId);
  assert.equal(sameWeakSpot, undefined);
});

test('completed CS bachelor course action completes the matching active Daily Run task', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Focused Assessment Run Fixture' });

  const run = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  const firstTask = run.tasks[0];

  await nowService.completeActionInTodaySession(personal.id, firstTask.actionId);

  const refreshed = await nowService.getDashboard(personal.id);
  assert.deepEqual(
    refreshed.todaySession.tasks.slice(0, 2).map((task) => task.outcome),
    ['completed', 'pending'],
  );
  assert.equal(refreshed.todaySession.tasks[0].actionId, firstTask.actionId);
  assert.notEqual(refreshed.todaySession.tasks.find((task) => task.outcome === 'pending')?.actionId, firstTask.actionId);
});

test('completed CS bachelor route nodes can return as stale recovery tasks', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Stale Complete Recovery Fixture' });

  const firstRun = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  const completedTask = firstRun.tasks[0];
  await nowService.completeActionInTodaySession(personal.id, completedTask.actionId);
  await database.execute(
    `
      INSERT INTO review_states (node_id, review_profile, next_due_at, last_reviewed_at, current_risk, updated_at)
      VALUES (?, 'learning', '2026-01-01T00:00:00.000Z', '2025-12-20T00:00:00.000Z', 'high', '2026-01-01T00:00:00.000Z')
      ON CONFLICT(node_id) DO UPDATE SET
        next_due_at = excluded.next_due_at,
        last_reviewed_at = excluded.last_reviewed_at,
        current_risk = excluded.current_risk,
        updated_at = excluded.updated_at
    `,
    [completedTask.nodeId],
  );
  await nowService.abandonDailyRun(personal.id);

  const dashboard = await nowService.getDashboard(personal.id);
  const staleCompleted = dashboard.today.planner.weakSpots.find((item) => item.node_id === completedTask.nodeId);
  assert.equal(staleCompleted?.is_complete, true);
  assert.equal(staleCompleted?.weak_spot_sources.includes('stale'), true);
  await database.execute("UPDATE campaign_opponents SET pressure_level = 'attack' WHERE campaign_id = ?", [personal.id]);

  const recoveryRun = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  const staleRecoveryTask = recoveryRun.tasks.find((task) => task.source === 'weak_spot' && task.nodeId === completedTask.nodeId);
  assert.ok(staleRecoveryTask);

  await nowService.completeActionInTodaySession(personal.id, staleRecoveryTask.actionId);
  const [pressureAfterRecovery] = await database.select('SELECT * FROM campaign_opponents WHERE campaign_id = ?', [personal.id]);
  assert.equal(pressureAfterRecovery.pressure_level, 'watch');
  const afterRecovery = await nowService.getDashboard(personal.id);
  const staleAfterCompletion = afterRecovery.today.planner.weakSpots.find((item) => item.node_id === completedTask.nodeId);
  assert.equal(staleAfterCompletion, undefined);

  const [reviewState] = await database.select('SELECT * FROM review_states WHERE node_id = ? LIMIT 1', [
    completedTask.nodeId,
  ]);
  assert.equal(reviewState.current_risk, 'low');
  assert.equal(Date.parse(reviewState.next_due_at) > Date.parse(reviewState.last_reviewed_at), true);
});

test('forked CS bachelor Daily Run finish summary counts reactivated XP and mastery effects', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id, { name: 'CS Reactivated XP Fixture' });

  const firstRun = await nowService.startTodaySessionFromPrimaryRecommendation(personal.id);
  const task = firstRun.tasks[0];
  await nowService.completeActionInTodaySession(personal.id, task.actionId);
  await nowService.finishDailyRun(personal.id);

  const [initialGrant] = await database.select(
    'SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ? AND grant_reason = ?',
    [personal.id, task.nodeId, 'node_completion'],
  );
  assert.equal(initialGrant.active, 1);

  await nowService.skipActionInTodaySession(personal.id, task.actionId, 'Reopen for a later Daily Run.');
  await nowService.abandonDailyRun(personal.id);

  const [deactivatedGrant] = await database.select(
    'SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ? AND grant_reason = ?',
    [personal.id, task.nodeId, 'node_completion'],
  );
  assert.equal(deactivatedGrant.active, 0);
  assert.equal(deactivatedGrant.created_at, initialGrant.created_at);

  const rerun = await nowService.startTodaySessionFromRecommendation(personal.id, task.actionId);
  assert.equal(rerun.tasks.some((candidate) => candidate.actionId === task.actionId), true);
  await nowService.completeActionInTodaySession(personal.id, task.actionId);

  const finished = await nowService.finishDailyRun(personal.id);
  const [reactivatedGrant] = await database.select(
    'SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ? AND grant_reason = ?',
    [personal.id, task.nodeId, 'node_completion'],
  );
  const [mastery] = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM mastery_events
      WHERE campaign_id = ?
        AND node_id = ?
        AND source_type = 'legacy_node_completion'
        AND active = 1
    `,
    [personal.id, task.nodeId],
  );

  assert.equal(reactivatedGrant.active, 1);
  assert.equal(reactivatedGrant.created_at, initialGrant.created_at);
  assert.equal(Number(mastery.count), 1);
  assert.match(finished.summary_note, new RegExp(`Прогресс: \\+${reactivatedGrant.xp_amount} XP`));
  assert.doesNotMatch(finished.summary_note, /событий освоения/);
});

test('template campaigns reject learner progress writes', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const [node] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      ORDER BY nodes.id ASC
      LIMIT 1
    `,
    [template.id],
  );

  await assert.rejects(() => nowService.markSelfMastery(template.id, node.id, 'seen'), /Template campaigns are read-only/);
  await assert.rejects(
    () =>
      nowService.submitAssessmentAttempt(template.id, {
        node_id: node.id,
        task_id: 'template-scope',
        check_method: 'strict',
        target_mastery_level: 'seen',
        passed: false,
        idempotency_key: 'template-scope',
      }),
    /Template campaigns are read-only/,
  );

  const mastery = await database.select('SELECT COUNT(*) AS count FROM mastery_events WHERE campaign_id = ?', [
    template.id,
  ]);
  const attempts = await database.select('SELECT COUNT(*) AS count FROM assessment_attempts WHERE campaign_id = ?', [
    template.id,
  ]);
  assert.equal(Number(mastery[0].count), 0);
  assert.equal(Number(attempts[0].count), 0);
});

test('CS bachelor template cleanup removes session notes before session events on reseed', async (t) => {
  const { database } = await setupCampaignService();
  t.after(() => database.close());

  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const [node] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      ORDER BY nodes.id ASC
      LIMIT 1
    `,
    [template.id],
  );
  const [action] = await database.select('SELECT * FROM node_actions WHERE node_id = ? ORDER BY id ASC LIMIT 1', [
    node.id,
  ]);

  const sessionResult = await database.execute(
    `
      INSERT INTO daily_sessions (
        campaign_id,
        session_date,
        status,
        primary_node_id,
        primary_action_id,
        started_at,
        summary_note,
        created_at,
        updated_at
      )
      VALUES (?, '2026-05-16', 'active', ?, ?, '2026-05-16T10:00:00.000Z', 'Template residue', '2026-05-16T10:00:00.000Z', '2026-05-16T10:00:00.000Z')
    `,
    [template.id, node.id, action.id],
  );
  const eventResult = await database.execute(
    `
      INSERT INTO daily_session_events (session_id, event_type, node_id, action_id, note, occurred_at)
      VALUES (?, 'blocked', ?, ?, 'Template residue event', '2026-05-16T10:01:00.000Z')
    `,
    [sessionResult.lastInsertId, node.id, action.id],
  );
  await database.execute(
    `
      INSERT INTO node_barrier_notes (
        node_id,
        action_id,
        barrier_type,
        note,
        source_event_id,
        is_open,
        created_at,
        updated_at
      )
      VALUES (?, ?, 'unclear next step', 'Template residue note', ?, 1, '2026-05-16T10:02:00.000Z', '2026-05-16T10:02:00.000Z')
    `,
    [node.id, action.id, eventResult.lastInsertId],
  );

  await bootstrapDatabase(database);

  const sessions = await database.select('SELECT COUNT(*) AS count FROM daily_sessions WHERE campaign_id = ?', [
    template.id,
  ]);
  const events = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM daily_session_events
      WHERE session_id = ?
    `,
    [sessionResult.lastInsertId],
  );
  const notes = await database.select('SELECT COUNT(*) AS count FROM node_barrier_notes WHERE node_id = ?', [
    node.id,
  ]);
  assert.equal(Number(sessions[0].count), 0);
  assert.equal(Number(events[0].count), 0);
  assert.equal(Number(notes[0].count), 0);
});

test('user campaigns can be created, archived, and restored while developer main is protected', async (t) => {
  const { database, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  const created = await campaignStore.createUserCampaign({ name: 'English Foundations' });
  assert.equal(created.type, 'user');

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  await assert.rejects(() => campaignStore.archiveCampaign(developer.id), /developer_main/);

  await campaignStore.archiveCampaign(created.id);
  let campaigns = await campaignStore.listCampaigns();
  assert.equal(campaigns.active.some((campaign) => campaign.id === created.id), false);
  assert.equal(campaigns.archived.some((campaign) => campaign.id === created.id), true);

  await campaignStore.restoreCampaign(created.id);
  campaigns = await campaignStore.listCampaigns();
  assert.equal(campaigns.active.some((campaign) => campaign.id === created.id), true);
});

test('last opened campaign summary ignores developer main campaign', async (t) => {
  const { database, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  const personal = await campaignStore.createUserCampaign({ name: 'Personal Work' });
  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];

  await database.execute('UPDATE campaigns SET last_opened_at = ? WHERE id = ?', ['2026-05-15T10:00:00.000Z', personal.id]);
  await database.execute('UPDATE campaigns SET last_opened_at = ? WHERE id = ?', ['2026-05-15T11:00:00.000Z', developer.id]);

  const campaigns = await campaignStore.listCampaigns();
  assert.equal(campaigns.lastOpened?.id, personal.id);
  assert.equal(campaigns.lastOpened?.type, 'user');
});

test('navigation snapshots are scoped to the selected campaign', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign A' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign B' });

  const firstNavigation = await nowService.getNavigationSnapshot(first.id);
  const secondNavigation = await nowService.getNavigationSnapshot(second.id);

  assert.equal(firstNavigation.spheres.length, 1);
  assert.equal(secondNavigation.spheres.length, 1);
  assert.notEqual(firstNavigation.spheres[0].id, secondNavigation.spheres[0].id);
  assert.equal(firstNavigation.spheres[0].name, 'Campaign A');
  assert.equal(secondNavigation.spheres[0].name, 'Campaign B');
});

test('node restore keeps archive operations scoped to the selected campaign', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Archive Scope A' });
  const second = await campaignStore.createUserCampaign({ name: 'Archive Scope B' });
  const firstDashboard = await nowService.createStarterWorkspace(first.id);
  const secondDashboard = await nowService.createStarterWorkspace(second.id);

  const firstNodeId = firstDashboard.primaryRecommendation.nodeId;
  const secondNodeId = secondDashboard.primaryRecommendation.nodeId;
  await nowService.archiveNodeEditor(first.id, firstNodeId);

  const wrongCampaignRestore = await nowService.restoreNodeEditor(second.id, firstNodeId);
  assert.equal(wrongCampaignRestore, null);

  const secondNavigation = await nowService.getNavigationSnapshot(second.id);
  assert.equal(secondNavigation.archivedNodes.some((node) => node.id === firstNodeId), false);
  assert.equal(
    secondNavigation.spheres
      .flatMap((sphere) => sphere.directions)
      .flatMap((direction) => direction.skills)
      .flatMap((skill) => skill.nodes)
      .some((node) => node.id === secondNodeId),
    true,
  );

  const restored = await nowService.restoreNodeEditor(first.id, firstNodeId);
  assert.equal(restored.node.id, firstNodeId);
  assert.equal(restored.node.is_archived, 0);
});

test('starter and linear algebra workspaces can be created in multiple campaigns', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const user = await campaignStore.createUserCampaign({ name: 'User Campaign' });

  await nowService.createStarterWorkspace(developer.id);
  await nowService.createStarterWorkspace(user.id);
  await nowService.createLinearAlgebraGraphWorkspace(developer.id);
  await nowService.createLinearAlgebraGraphWorkspace(user.id);

  const duplicateSlugRows = await database.select(
    `
      SELECT slug, COUNT(*) AS count
      FROM spheres
      WHERE slug IN ('career', 'linear-algebra-course')
      GROUP BY slug
      ORDER BY slug ASC
    `,
  );

  assert.deepEqual(
    duplicateSlugRows.map((row) => [row.slug, Number(row.count)]),
    [
      ['career', 2],
      ['linear-algebra-course', 2],
    ],
  );
});

test('startTodaySessionFromPrimaryRecommendation uses the explicit campaign id', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const user = await campaignStore.createUserCampaign({ name: 'Recent User Campaign' });
  await nowService.createStarterWorkspace(developer.id);
  await nowService.createStarterWorkspace(user.id);

  await nowService.startTodaySessionFromPrimaryRecommendation(developer.id);

  const sessions = await database.select('SELECT * FROM daily_sessions WHERE status = ? ORDER BY id ASC', ['active']);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].campaign_id, developer.id);
});

test('wind rose branches expose map target labels for branch navigation', async (t) => {
  const { database, hierarchyStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  await nowService.createStarterWorkspace(developer.id);

  const [nextAction] = await database.select(
    `
      SELECT actions.*, nodes.skill_id, nodes.id AS action_node_id, nodes.title AS action_node_title
      FROM node_actions actions
      JOIN nodes ON nodes.id = actions.node_id
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND actions.status IN ('todo', 'ready', 'doing')
      ORDER BY actions.sort_order ASC, actions.id ASC
      LIMIT 1
    `,
    [developer.id],
  );
  const decoyNode = await hierarchyStore.createNode({
    skill_id: nextAction.skill_id,
    type: 'task',
    status: 'active',
    title: 'Fresh branch node without next action',
    slug: 'fresh-branch-node-without-next-action',
  });

  const windRose = await nowService.getWindRoseSnapshot(developer.id);
  const branch = windRose.stats.flatMap((stat) => stat.branches).find((item) => item.next_action_id != null);

  assert.ok(branch);
  assert.equal(branch.id, nextAction.skill_id);
  assert.equal(branch.focus_node_id, nextAction.action_node_id);
  assert.notEqual(branch.focus_node_id, decoyNode.id);
  assert.equal(branch.next_action_id, nextAction.id);
  assert.equal(typeof branch.focus_node_title, 'string');
  assert.equal(typeof branch.next_action_title, 'string');
  assert.equal(branch.focus_node_title, nextAction.action_node_title);
  assert.equal(branch.next_action_title.length > 0, true);
});

test('node completion grants XP once and done-to-active deactivates the grant', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const dashboard = await nowService.createStarterWorkspace(developer.id);
  const actionId = dashboard.primaryRecommendation.actionId;
  const nodeId = dashboard.primaryRecommendation.nodeId;

  await nowService.completeActionInTodaySession(developer.id, actionId);
  await nowService.completeActionInTodaySession(developer.id, actionId);

  let grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].active, 1);

  await nowService.updateNodeEditor(developer.id, nodeId, { status: 'active' });
  grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].active, 0);
});

test('unarchiving a completed node preserves the existing XP grant without duplication', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const dashboard = await nowService.createStarterWorkspace(developer.id);
  const actionId = dashboard.primaryRecommendation.actionId;
  const nodeId = dashboard.primaryRecommendation.nodeId;

  await nowService.completeActionInTodaySession(developer.id, actionId);
  await nowService.archiveNodeEditor(developer.id, nodeId);
  await nowService.updateNodeEditor(developer.id, nodeId, { is_archived: 0 });

  const grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].active, 1);
});

test('graph edge mutations reject edge ids from another campaign', async (t) => {
  const { database, hierarchyStore, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign A' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign B' });
  const [secondSkill] = await database.select(
    `
      SELECT skills.id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [second.id],
  );
  const [secondRoot] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [second.id],
  );
  const secondChild = await hierarchyStore.createNode({
    skill_id: secondSkill.id,
    type: 'task',
    status: 'active',
    title: 'Foreign child',
    slug: 'foreign-child',
  });
  const foreignEdge = await hierarchyStore.addNodeDependency({
    blocked_node_id: secondRoot.id,
    blocking_node_id: secondChild.id,
    dependency_type: 'supports',
  });

  await assert.rejects(
    () => nowService.deleteGraphEdge(first.id, foreignEdge.id),
    /кампани|campaign/i,
  );
  assert.equal(await hierarchyStore.getNodeDependencyById(foreignEdge.id) != null, true);

  await assert.rejects(
    () => nowService.updateGraphEdge(first.id, foreignEdge.id, { dependency_type: 'requires' }),
    /кампани|campaign/i,
  );
  const edgeAfterUpdateAttempt = await hierarchyStore.getNodeDependencyById(foreignEdge.id);
  assert.equal(edgeAfterUpdateAttempt.dependency_type, 'supports');
});

test('node create and duplicate reject foreign target skills before writing rows', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign A' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign B' });
  const [firstRoot] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [first.id],
  );
  const [secondSkill] = await database.select(
    `
      SELECT skills.id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [second.id],
  );
  const countSecondSkillNodes = async () =>
    Number((await database.select('SELECT COUNT(*) AS count FROM nodes WHERE skill_id = ?', [secondSkill.id]))[0].count);

  const beforeCreate = await countSecondSkillNodes();
  await assert.rejects(
    () =>
      nowService.createNodeEditor(first.id, {
        skill_id: secondSkill.id,
        type: 'task',
        status: 'active',
        title: 'Wrong campaign node',
        slug: 'wrong-campaign-node',
      }),
    /кампани|campaign|Навык/i,
  );
  assert.equal(await countSecondSkillNodes(), beforeCreate);

  await assert.rejects(
    () =>
      nowService.duplicateNodeEditor(first.id, firstRoot.id, {
        skill_id: secondSkill.id,
        slug: 'wrong-campaign-duplicate',
      }),
    /кампани|campaign|Навык/i,
  );
  assert.equal(await countSecondSkillNodes(), beforeCreate);
});

test('campaign summary XP is not multiplied by joined nodes or skills', async (t) => {
  const { database, hierarchyStore, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Campaign XP' });
  const [skill] = await database.select(
    `
      SELECT skills.id, skills.primary_stat_id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [campaign.id],
  );
  const [root] = await database.select('SELECT * FROM nodes WHERE skill_id = ? LIMIT 1', [skill.id]);
  await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    status: 'active',
    title: 'Extra node',
    slug: 'extra-node',
  });
  await database.execute(
    `
      INSERT INTO stat_xp_grants (
        campaign_id,
        node_id,
        branch_id,
        stat_id,
        grant_reason,
        xp_amount,
        active,
        created_at
      )
      VALUES (?, ?, ?, ?, 'node_completion', 10, 1, '2026-01-01T00:00:00.000Z')
    `,
    [campaign.id, root.id, skill.id, skill.primary_stat_id],
  );

  const campaigns = await campaignStore.listCampaigns();
  const summary = campaigns.active.find((item) => item.id === campaign.id);
  assert.equal(summary.total_xp, 10);
});

test('completed node without primary stat does not create XP grant', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const dashboard = await nowService.createStarterWorkspace(developer.id);
  const actionId = dashboard.primaryRecommendation.actionId;
  const nodeId = dashboard.primaryRecommendation.nodeId;
  const [node] = await database.select('SELECT * FROM nodes WHERE id = ?', [nodeId]);

  await database.execute('UPDATE skills SET primary_stat_id = NULL WHERE id = ?', [node.skill_id]);
  const result = await nowService.completeActionInTodaySession(developer.id, actionId);

  const grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 0);
  assert.equal(result.xpWarning?.code, 'missing-primary-stat');
});
