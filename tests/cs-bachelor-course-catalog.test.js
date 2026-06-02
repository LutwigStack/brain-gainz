import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CS_BACHELOR_COURSE_KEYS,
  CS_BACHELOR_COURSES,
  CS_BACHELOR_REGIONS,
  validateCsBachelorCatalog,
} from '../src/application/cs-bachelor-course-catalog.ts';
import { buildInfrastructureObjects, buildProgramHierarchy } from '../src/application/program-hierarchy.ts';
import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { seedCsBachelorTemplate } from '../src/database/cs-bachelor-template-seed.js';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const setupDatabase = async () => {
  const database = createSqliteTestDatabase();
  await bootstrapDatabase(database);
  return database;
};

test('CS bachelor catalog has stable course-level shape', () => {
  const validation = validateCsBachelorCatalog();

  assert.equal(validation.valid, true);
  assert.equal(validation.regionCount, 8);
  assert.equal(validation.courseCount, 54);
  assert.deepEqual(validation.duplicateCourseKeys, []);
  assert.deepEqual(validation.invalidRegionCourseKeys, []);
  assert.deepEqual(validation.missingReferenceKeys, []);
  assert.deepEqual(validation.prerequisiteOrderViolations, []);
  assert.deepEqual(validation.cycles, []);
  assert.equal(new Set(CS_BACHELOR_COURSE_KEYS).size, 54);
  assert.equal(CS_BACHELOR_COURSES.every((course) => course.title.trim().length > 0), true);
  assert.equal(CS_BACHELOR_COURSES.every((course) => course.description.trim().length > 0), true);
  assert.equal(CS_BACHELOR_COURSES.every((course) => course.infrastructureObjectCandidate), true);
});

test('CS bachelor catalog keeps defensible semester and region coverage', () => {
  const coursesByRegion = new Map(CS_BACHELOR_REGIONS.map((region) => [region.key, 0]));
  for (const course of CS_BACHELOR_COURSES) {
    coursesByRegion.set(course.regionKey, (coursesByRegion.get(course.regionKey) ?? 0) + 1);
    assert.equal(course.yearHint, Math.ceil(course.semesterHint / 2));
  }

  assert.deepEqual(
    Object.fromEntries(coursesByRegion),
    {
      programming: 8,
      mathematics: 8,
      'algorithms-theory': 8,
      'computer-systems': 9,
      'data-ai': 7,
      'software-product': 6,
      'society-ethics-law': 3,
      projects: 5,
    },
  );
  assert.equal(CS_BACHELOR_COURSES.filter((course) => course.level === 'project').length, 5);
  assert.equal(CS_BACHELOR_COURSES.filter((course) => course.size === 'capstone').length >= 4, true);
  const routeOrder = new Map(
    CS_BACHELOR_COURSES.slice()
      .sort((left, right) => {
        const regionOrder = Object.keys(Object.fromEntries(coursesByRegion)).reduce(
          (map, key, index) => map.set(key, index),
          new Map(),
        );
        return (
          left.semesterHint - right.semesterHint ||
          (regionOrder.get(left.regionKey) ?? 0) - (regionOrder.get(right.regionKey) ?? 0) ||
          left.title.localeCompare(right.title, 'ru-RU')
        );
      })
      .map((course, index) => [course.key, index]),
  );
  for (const course of CS_BACHELOR_COURSES) {
    for (const prerequisiteKey of course.prerequisiteKeys) {
      assert.equal((routeOrder.get(prerequisiteKey) ?? Infinity) < (routeOrder.get(course.key) ?? -1), true);
    }
  }
});

test('CS bachelor seed exposes only catalog-level course nodes on the template surface', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  await bootstrapDatabase(database);

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  assert.equal(campaign.type, 'template');

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
  assert.equal(Number(activeNodeCount.count), 54);

  const [activeSphereCount] = await database.select('SELECT COUNT(*) AS count FROM spheres WHERE campaign_id = ? AND is_archived = 0', [
    campaign.id,
  ]);
  assert.equal(Number(activeSphereCount.count), 8);

  const staleStarterNodes = await database.select(
    `
      SELECT nodes.slug
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND nodes.is_archived = 0
        AND nodes.slug IN (
          'pf-01-programming-environment',
          'ds-12-data-structure-tradeoffs',
          'db-28-small-database-project'
        )
    `,
    [campaign.id],
  );
  assert.deepEqual(staleStarterNodes, []);

  const courseMetadataRows = await database.select(
    `
      SELECT nodes.slug, nodes.links
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
  assert.equal(courseMetadataRows.length, 54);
  assert.equal(courseMetadataRows.every((row) => JSON.parse(row.links).kind === 'cs_bachelor_course'), true);
  assert.deepEqual(
    courseMetadataRows.map((row) => row.slug).sort(),
    [...CS_BACHELOR_COURSE_KEYS].sort(),
  );
});

test('CS bachelor reseed archives stats outside the current catalog', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  await database.execute(
    `
      INSERT INTO campaign_stats (campaign_id, key, title, color, icon, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'legacy-old-stat', 'Legacy old stat', '#999999', 'legacy', 999, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
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
    CS_BACHELOR_REGIONS.map((region) => region.key),
  );

  const [legacyStat] = await database.select(
    "SELECT is_archived FROM campaign_stats WHERE campaign_id = ? AND key = 'legacy-old-stat' LIMIT 1",
    [campaign.id],
  );
  assert.equal(legacyStat.is_archived, 1);
});

test('CS bachelor reseed archives legacy active template route before activating current route', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
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
      VALUES (?, 'Legacy CS route', 'route-cs-bachelor', 'Legacy CS', 'short', 'active', '2026-01-01T00:00:00.000Z', NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    `,
    [campaign.id],
  );

  await seedCsBachelorTemplate(database);

  const activeRoutes = await database.select(
    "SELECT key FROM career_specializations WHERE campaign_id = ? AND status = 'active' ORDER BY key ASC",
    [campaign.id],
  );
  assert.deepEqual(
    activeRoutes.map((row) => row.key),
    ['route-core-cs-foundations'],
  );

  const [legacyRoute] = await database.select(
    "SELECT status FROM career_specializations WHERE campaign_id = ? AND key = 'route-cs-bachelor' LIMIT 1",
    [campaign.id],
  );
  assert.equal(legacyRoute.status, 'archived');
});

test('CS bachelor route and program hierarchy are course-hub first', async (t) => {
  const database = await setupDatabase();
  t.after(() => database.close());

  const [campaign] = await database.select("SELECT * FROM campaigns WHERE slug = 'template-cs-bachelor' LIMIT 1");
  const routeNodes = await database.select(
    `
      SELECT route_nodes.route_stage, route_nodes.route_order, nodes.slug, nodes.title, nodes.links
      FROM specialization_route_nodes route_nodes
      JOIN career_specializations specs ON specs.id = route_nodes.specialization_id
      JOIN nodes ON nodes.id = route_nodes.node_id
      WHERE specs.campaign_id = ?
        AND specs.key = 'route-core-cs-foundations'
      ORDER BY route_nodes.route_order ASC
    `,
    [campaign.id],
  );

  assert.equal(routeNodes.length, 54);
  assert.equal(routeNodes[0].slug, 'programming-intro');
  assert.equal(routeNodes.some((row) => row.route_stage === '8 семестр' && row.slug === 'capstone-thesis'), true);
  assert.equal(routeNodes.every((row) => JSON.parse(row.links).kind === 'cs_bachelor_course'), true);

  const snapshotRows = await database.select(
    `
      SELECT
        spheres.id AS sphere_id,
        spheres.name AS sphere_name,
        directions.id AS direction_id,
        directions.name AS direction_name,
        skills.id AS skill_id,
        skills.name AS skill_name,
        nodes.id AS node_id,
        nodes.title AS node_title,
        nodes.type,
        nodes.status,
        nodes.links
      FROM spheres
      JOIN directions ON directions.sphere_id = spheres.id AND directions.is_archived = 0
      JOIN skills ON skills.direction_id = directions.id AND skills.is_archived = 0
      JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
      WHERE spheres.campaign_id = ?
        AND spheres.is_archived = 0
      ORDER BY spheres.sort_order ASC, skills.sort_order ASC
    `,
    [campaign.id],
  );
  const sphereMap = new Map();
  for (const row of snapshotRows) {
    if (!sphereMap.has(row.sphere_id)) {
      sphereMap.set(row.sphere_id, {
        id: row.sphere_id,
        name: row.sphere_name,
        node_count: 0,
        open_action_count: 0,
        directions: [],
      });
    }
    const sphere = sphereMap.get(row.sphere_id);
    let direction = sphere.directions.find((candidate) => candidate.id === row.direction_id);
    if (!direction) {
      direction = {
        id: row.direction_id,
        sphere_id: row.sphere_id,
        name: row.direction_name,
        node_count: 0,
        open_action_count: 0,
        skills: [],
      };
      sphere.directions.push(direction);
    }
    direction.skills.push({
      id: row.skill_id,
      direction_id: row.direction_id,
      name: row.skill_name,
      primary_stat_id: null,
      node_count: 1,
      open_action_count: 1,
      nodes: [
        {
          id: row.node_id,
          skill_id: row.skill_id,
          title: row.node_title,
          type: row.type,
          status: row.status,
          links: row.links,
          open_action_count: 1,
        },
      ],
    });
  }
  const snapshot = {
    spheres: [...sphereMap.values()],
    edges: [],
    archivedNodes: [],
    defaultSelection: null,
  };
  const entries = buildProgramHierarchy({ snapshot, campaign });
  const objects = buildInfrastructureObjects({ entries, routeItems: [] });

  assert.equal(entries.filter((entry) => entry.role === 'course_hub').length, 54);
  assert.equal(entries.filter((entry) => entry.role === 'atomic_node').length, 0);
  assert.equal(objects.length, 8);
  assert.equal(objects.reduce((sum, object) => sum + object.nodeIds.length, 0), 54);
});
