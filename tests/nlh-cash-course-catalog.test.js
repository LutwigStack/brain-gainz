import test from 'node:test';
import assert from 'node:assert/strict';

import {
  NLH_CASH_COURSE_KEYS,
  NLH_CASH_COURSES,
  NLH_CASH_REGIONS,
  validateNlhCashCatalog,
} from '../src/application/nlh-cash-course-catalog.ts';
import { buildInfrastructureObjects, buildProgramHierarchy } from '../src/application/program-hierarchy.ts';
import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { seedNlhCashTemplate } from '../src/database/nlh-cash-template-seed.js';
import { createNowService } from '../src/application/now-service.js';
import { createCampaignStore } from '../src/stores/campaign-store.js';
import { createDailySessionStore } from '../src/stores/daily-session-store.js';
import { createHierarchyStore } from '../src/stores/hierarchy-store.js';
import { createNodeNoteStore } from '../src/stores/node-note-store.js';
import { createReviewStateStore } from '../src/stores/review-state-store.js';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const setupDatabase = async () => {
  const database = createSqliteTestDatabase();
  await bootstrapDatabase(database);
  return database;
};

test('NLH cash catalog has stable responsible course-level shape', () => {
  const validation = validateNlhCashCatalog();

  assert.equal(validation.valid, true);
  assert.equal(validation.regionCount, 10);
  assert.equal(validation.courseCount, 72);
  assert.deepEqual(validation.duplicateCourseKeys, []);
  assert.deepEqual(validation.invalidRegionCourseKeys, []);
  assert.deepEqual(validation.missingReferenceKeys, []);
  assert.deepEqual(validation.staleFollowUpKeys, []);
  assert.deepEqual(validation.missingRiskNotes, []);
  assert.deepEqual(validation.prerequisiteOrderViolations, []);
  assert.deepEqual(validation.copyViolations, []);
  assert.deepEqual(validation.cycles, []);
  assert.equal(new Set(NLH_CASH_COURSE_KEYS).size, 72);
  assert.equal(NLH_CASH_COURSES.every((course) => course.title.trim().length > 0), true);
  assert.equal(NLH_CASH_COURSES.every((course) => course.description.includes('контрол')), true);
  assert.equal(NLH_CASH_COURSES.every((course) => course.infrastructureObjectCandidate), true);
});

test('NLH cash catalog keeps risk math and strategy coverage separated', () => {
  const coursesByRegion = new Map(NLH_CASH_REGIONS.map((region) => [region.key, 0]));
  for (const course of NLH_CASH_COURSES) {
    coursesByRegion.set(course.regionKey, (coursesByRegion.get(course.regionKey) ?? 0) + 1);
  }

  assert.deepEqual(
    Object.fromEntries(coursesByRegion),
    {
      safety: 7,
      math: 7,
      preflop: 9,
      'flop-srp': 8,
      turn: 6,
      river: 7,
      'three-four-bet': 6,
      'exploit-field': 8,
      'gto-solver': 6,
      'professional-routine': 8,
    },
  );
  assert.equal(NLH_CASH_COURSES.filter((course) => course.atlasHubType === 'risk_hub').length >= 7, true);
  assert.equal(NLH_CASH_COURSES.filter((course) => course.level === 'routine').length, 8);
  assert.equal(NLH_CASH_COURSES.filter((course) => course.size === 'capstone').length, 1);

  const order = new Map(NLH_CASH_COURSES.map((course) => [course.key, course.orderHint]));
  for (const course of NLH_CASH_COURSES) {
    for (const prerequisiteKey of course.prerequisiteKeys) {
      assert.equal((order.get(prerequisiteKey) ?? Infinity) < course.orderHint, true);
    }
  }
});

test('NLH cash seed exposes only catalog-level course nodes on the template surface', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  await bootstrapDatabase(database);

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-nlh-cash' LIMIT 1");
  assert.equal(campaign.type, 'template');
  assert.equal(campaign.name, 'NLH cash');

  const [activeNodeCount] = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND nodes.is_archived = 0
    `,
    [campaign.id],
  );
  assert.equal(Number(activeNodeCount.count), 72);

  const [activeSphereCount] = await database.select('SELECT COUNT(*) AS count FROM spheres WHERE campaign_id = ? AND is_archived = 0', [
    campaign.id,
  ]);
  assert.equal(Number(activeSphereCount.count), 10);

  const staleDemoNodes = await database.select(
    `
      SELECT nodes.slug
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND nodes.is_archived = 0
        AND nodes.slug IN ('table-position', 'preflop-ranges', 'pot-odds', 'board-texture', 'session-review')
    `,
    [campaign.id],
  );
  assert.deepEqual(staleDemoNodes, []);

  const courseMetadataRows = await database.select(
    `
      SELECT nodes.slug, nodes.links, nodes.check_metadata
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND nodes.is_archived = 0
      ORDER BY nodes.slug ASC
    `,
    [campaign.id],
  );
  assert.equal(courseMetadataRows.length, 72);
  assert.equal(courseMetadataRows.every((row) => JSON.parse(row.links).kind === 'nlh_cash_course'), true);
  assert.equal(courseMetadataRows.every((row) => row.check_metadata == null), true);
  assert.deepEqual(
    courseMetadataRows.map((row) => row.slug).sort(),
    [...NLH_CASH_COURSE_KEYS].sort(),
  );
});

test('NLH cash reseed archives stats outside the current catalog', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-nlh-cash' LIMIT 1");
  await database.execute(
    `
      INSERT INTO campaign_stats (campaign_id, key, title, color, icon, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'legacy-old-nlh-stat', 'Legacy old NLH stat', '#999999', 'legacy', 999, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    `,
    [campaign.id],
  );

  await bootstrapDatabase(database);

  const activeStats = await database.select(
    `
      SELECT key
      FROM campaign_stats
      WHERE campaign_id = ?
        AND is_archived = 0
      ORDER BY sort_order ASC, key ASC
    `,
    [campaign.id],
  );
  assert.deepEqual(
    activeStats.map((row) => row.key),
    NLH_CASH_REGIONS.map((region) => region.key),
  );

  const [legacyStat] = await database.select(
    "SELECT is_archived FROM campaign_stats WHERE campaign_id = ? AND key = 'legacy-old-nlh-stat' LIMIT 1",
    [campaign.id],
  );
  assert.equal(legacyStat.is_archived, 1);
});

test('NLH cash reseed archives legacy active template route before activating current route', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-nlh-cash' LIMIT 1");
  await database.execute(
    `
      UPDATE career_specializations
      SET status = 'archived',
          completed_at = '2026-01-01T00:00:00.000Z',
          updated_at = '2026-01-01T00:00:00.000Z'
      WHERE campaign_id = ?
        AND status = 'active'
    `,
    [campaign.id],
  );
  await database.execute(
    `
      INSERT INTO career_specializations (campaign_id, name, key, domain, length, status, started_at, completed_at, created_at, updated_at)
      VALUES (?, 'Legacy NLH route', 'route-nlh-cash', 'Legacy NLH', 'short', 'active', '2026-01-01T00:00:00.000Z', NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    `,
    [campaign.id],
  );

  await seedNlhCashTemplate(database);

  const activeRoutes = await database.select(
    "SELECT key FROM career_specializations WHERE campaign_id = ? AND status = 'active' ORDER BY key ASC",
    [campaign.id],
  );
  assert.deepEqual(
    activeRoutes.map((row) => row.key),
    ['route-nlh-cash-study'],
  );

  const [legacyRoute] = await database.select(
    "SELECT status FROM career_specializations WHERE campaign_id = ? AND key = 'route-nlh-cash' LIMIT 1",
    [campaign.id],
  );
  assert.equal(legacyRoute.status, 'archived');
});

test('NLH cash route fork and program hierarchy are course-hub first', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  const hierarchyStore = createHierarchyStore(database);
  const nowService = createNowService({
    database,
    hierarchyStore,
    nodeNoteStore: createNodeNoteStore(database),
    reviewStateStore: createReviewStateStore(database),
    dailySessionStore: createDailySessionStore(database),
  });
  const campaignStore = createCampaignStore(database, hierarchyStore);
  const [template] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-nlh-cash' LIMIT 1");
  const personal = await campaignStore.forkTemplateCampaign(template.id);

  assert.equal(personal.type, 'user');
  assert.equal(personal.name, 'NLH cash');
  assert.equal(personal.source_template_id, template.id);

  const routeNodes = await database.select(
    `
      SELECT route_nodes.route_order, nodes.slug, nodes.title, nodes.links
      FROM specialization_route_nodes route_nodes
      JOIN career_specializations specs ON specs.id = route_nodes.specialization_id
      JOIN nodes ON nodes.id = route_nodes.node_id
      WHERE specs.campaign_id = ?
        AND specs.key = 'route-nlh-cash-study'
      ORDER BY route_nodes.route_order ASC
    `,
    [personal.id],
  );
  assert.equal(routeNodes.length, 72);
  assert.equal(routeNodes[0].slug, 'nlh-cash-intro');
  assert.equal(routeNodes.at(-1).slug, 'bankroll-and-study-plan');
  assert.equal(routeNodes.every((row) => JSON.parse(row.links).kind === 'nlh_cash_course'), true);

  const snapshot = await nowService.getNavigationSnapshot(personal.id);
  const entries = buildProgramHierarchy({ snapshot, campaign: personal });
  const objects = buildInfrastructureObjects({ entries, routeItems: [] });

  assert.equal(entries.filter((entry) => entry.role === 'course_hub').length, 72);
  assert.equal(entries.filter((entry) => entry.role === 'atomic_node').length, 0);
  assert.equal(objects.length, 10);
  assert.equal(objects.reduce((sum, object) => sum + object.nodeIds.length, 0), 72);
});
