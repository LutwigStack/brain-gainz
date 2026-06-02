import {
  CS_BACHELOR_COURSES,
  CS_BACHELOR_REGIONS,
  getCsBachelorCoursesInRouteOrder,
  validateCsBachelorCatalog,
} from '../application/cs-bachelor-course-catalog.ts';
import { createUtcTimestamp } from '../stores/store-helpers.js';

export const CS_BACHELOR_TEMPLATE_SLUG = 'template-cs-bachelor';

const CS_BACHELOR_ROUTE_KEY = 'route-core-cs-foundations';
const CS_DOMAIN = 'Информатика';
const CS_PROGRAM_TITLE = 'Бакалавриат по информатике';

const selectOne = async (database, sql, params = []) => (await database.select(sql, params))[0] ?? null;

const slugForRegion = (regionKey) => `region-${regionKey}`;
const slugForCourseSkill = (courseKey) => `course-${courseKey}`;

const semesterStage = (semester) => `${semester} семестр`;

const courseCoordinates = (regionIndex, courseIndex, regionCourseCount) => {
  const angle = -Math.PI / 2 + (regionIndex / Math.max(CS_BACHELOR_REGIONS.length, 1)) * Math.PI * 2;
  const spread = Math.min(0.7, 0.16 * Math.max(regionCourseCount - 1, 1));
  const localAngle =
    regionCourseCount <= 1 ? angle : angle - spread / 2 + (spread * courseIndex) / Math.max(regionCourseCount - 1, 1);
  const radius = 260 + (courseIndex % 4) * 82 + Math.floor(courseIndex / 4) * 36;

  return {
    x: Math.round(Math.cos(localAngle) * radius),
    y: Math.round(Math.sin(localAngle) * radius),
  };
};

const upsertCampaign = async (database, timestamp) => {
  await database.execute(
    `
      INSERT INTO campaigns (type, slug, name, icon, color, mode, career_status, is_archived, created_at, updated_at, last_opened_at)
      VALUES ('template', ?, ?, 'brain', '#58d6ff', 'career', 'active', 0, ?, ?, NULL)
      ON CONFLICT(slug) DO UPDATE SET
        type = 'template',
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        mode = excluded.mode,
        career_status = excluded.career_status,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [CS_BACHELOR_TEMPLATE_SLUG, CS_PROGRAM_TITLE, timestamp, timestamp],
  );

  return selectOne(database, 'SELECT * FROM campaigns WHERE slug = ? LIMIT 1', [CS_BACHELOR_TEMPLATE_SLUG]);
};

const archiveExistingTemplateStructure = async (database, campaignId, timestamp) => {
  await database.execute(
    `
      UPDATE nodes
      SET is_archived = 1,
          updated_at = ?
      WHERE id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
  await database.execute(
    `
      UPDATE skills
      SET is_archived = 1,
          updated_at = ?
      WHERE id IN (
        SELECT skills.id
        FROM skills
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
  await database.execute(
    `
      UPDATE directions
      SET is_archived = 1,
          updated_at = ?
      WHERE id IN (
        SELECT directions.id
        FROM directions
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
  await database.execute('UPDATE spheres SET is_archived = 1, updated_at = ? WHERE campaign_id = ?', [timestamp, campaignId]);
};

const archiveObsoleteStats = async (database, campaignId, timestamp) => {
  const activeRegionKeys = CS_BACHELOR_REGIONS.map((region) => region.key);
  const placeholders = activeRegionKeys.map(() => '?').join(', ');
  await database.execute(
    `
      UPDATE campaign_stats
      SET is_archived = 1,
          updated_at = ?
      WHERE campaign_id = ?
        AND key NOT IN (${placeholders})
    `,
    [timestamp, campaignId, ...activeRegionKeys],
  );
};

const upsertStats = async (database, campaignId, timestamp) => {
  const statsByKey = new Map();
  for (const [index, region] of CS_BACHELOR_REGIONS.entries()) {
    await database.execute(
      `
        INSERT INTO campaign_stats (campaign_id, key, title, color, icon, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(campaign_id, key) DO UPDATE SET
          title = excluded.title,
          color = excluded.color,
          icon = excluded.icon,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [campaignId, region.key, region.shortTitle, region.color, region.icon, index, timestamp, timestamp],
    );
    const row = await selectOne(database, 'SELECT * FROM campaign_stats WHERE campaign_id = ? AND key = ? LIMIT 1', [
      campaignId,
      region.key,
    ]);
    statsByKey.set(region.key, row);
  }
  return statsByKey;
};

const upsertRegions = async (database, campaignId, timestamp) => {
  const regionsByKey = new Map();
  for (const [index, region] of CS_BACHELOR_REGIONS.entries()) {
    await database.execute(
      `
        INSERT INTO spheres (campaign_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(campaign_id, slug) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [campaignId, region.title, slugForRegion(region.key), region.description, index, timestamp, timestamp],
    );
    const sphere = await selectOne(database, 'SELECT * FROM spheres WHERE campaign_id = ? AND slug = ? LIMIT 1', [
      campaignId,
      slugForRegion(region.key),
    ]);

    await database.execute(
      `
        INSERT INTO directions (sphere_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, 'Курсы', 'courses', ?, 0, 0, ?, ?)
        ON CONFLICT(sphere_id, slug) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [sphere.id, region.description, timestamp, timestamp],
    );
    const direction = await selectOne(database, 'SELECT * FROM directions WHERE sphere_id = ? AND slug = ? LIMIT 1', [
      sphere.id,
      'courses',
    ]);

    regionsByKey.set(region.key, { region, sphere, direction });
  }
  return regionsByKey;
};

const upsertCourseNode = async (database, course, regionContext, stat, indexInRegion, regionCourseCount, timestamp) => {
  await database.execute(
    `
      INSERT INTO skills (
        direction_id,
        primary_stat_id,
        name,
        slug,
        description,
        sort_order,
        is_archived,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(direction_id, slug) DO UPDATE SET
        primary_stat_id = excluded.primary_stat_id,
        name = excluded.name,
        description = excluded.description,
        sort_order = excluded.sort_order,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [
      regionContext.direction.id,
      stat?.id ?? null,
      course.title,
      slugForCourseSkill(course.key),
      course.description,
      course.semesterHint * 100 + indexInRegion,
      timestamp,
      timestamp,
    ],
  );
  const skill = await selectOne(database, 'SELECT * FROM skills WHERE direction_id = ? AND slug = ? LIMIT 1', [
    regionContext.direction.id,
    slugForCourseSkill(course.key),
  ]);

  const knowledgeKey = `cs-bachelor:course:${course.key}`;
  await database.execute(
    `
      INSERT INTO knowledge_nodes (key, title, domain, summary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        title = excluded.title,
        domain = excluded.domain,
        summary = excluded.summary,
        updated_at = excluded.updated_at
    `,
    [knowledgeKey, course.title, CS_DOMAIN, course.description, timestamp, timestamp],
  );
  const knowledgeNode = await selectOne(database, 'SELECT * FROM knowledge_nodes WHERE key = ? LIMIT 1', [knowledgeKey]);
  const coordinates = courseCoordinates(
    CS_BACHELOR_REGIONS.findIndex((region) => region.key === course.regionKey),
    indexInRegion,
    regionCourseCount,
  );
  const courseMetadata = {
    kind: 'cs_bachelor_course',
    courseKey: course.key,
    regionKey: course.regionKey,
    level: course.level,
    yearHint: course.yearHint,
    semesterHint: course.semesterHint,
    prerequisiteKeys: course.prerequisiteKeys,
    followUpKeys: course.followUpKeys,
    infrastructureObjectCandidate: course.infrastructureObjectCandidate,
    infrastructureObjectName: course.infrastructureObjectName,
    atlasHubType: course.atlasHubType,
    size: course.size,
  };

  await database.execute(
    `
      INSERT INTO nodes (
        skill_id,
        type,
        status,
        title,
        slug,
        summary,
        completion_criteria,
        links,
        reward,
        x,
        y,
        knowledge_node_id,
        self_marked_mastery_level,
        check_metadata,
        importance,
        target_date,
        last_touched_at,
        is_archived,
        created_at,
        updated_at
      )
      VALUES (?, ?, 'active', ?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, ?, NULL, NULL, 0, ?, ?)
      ON CONFLICT(skill_id, slug) DO UPDATE SET
        type = excluded.type,
        title = excluded.title,
        summary = excluded.summary,
        completion_criteria = excluded.completion_criteria,
        links = excluded.links,
        x = excluded.x,
        y = excluded.y,
        knowledge_node_id = excluded.knowledge_node_id,
        check_metadata = NULL,
        importance = excluded.importance,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
      [
        skill.id,
        course.level === 'project' ? 'project' : 'theory',
        course.title,
        course.key,
        course.description,
        `Понять роль курса в программе и пройти будущие темы внутри этого направления.`,
        JSON.stringify(courseMetadata),
        coordinates.x,
        coordinates.y,
        knowledgeNode.id,
        course.size === 'capstone' || course.level === 'project' ? 'high' : course.level === 'pre-core' || course.level === 'core' ? 'high' : 'medium',
        timestamp,
        timestamp,
    ],
  );
  const node = await selectOne(database, 'SELECT * FROM nodes WHERE skill_id = ? AND slug = ? LIMIT 1', [skill.id, course.key]);
  const actionTitle = course.level === 'project' ? 'Открыть проектный курс' : 'Открыть курс';
  const existingPrimaryAction = await selectOne(
    database,
    'SELECT * FROM node_actions WHERE node_id = ? AND sort_order = 0 ORDER BY id ASC LIMIT 1',
    [node.id],
  );
  if (existingPrimaryAction) {
    await database.execute(
      `
        UPDATE node_actions
        SET title = ?,
            details = ?,
            size_hint = 'standard',
            is_minimum_step = 0,
            is_repeatable = 0,
            updated_at = ?
        WHERE id = ?
      `,
      [actionTitle, course.description, timestamp, existingPrimaryAction.id],
    );
  } else {
    await database.execute(
      `
        INSERT INTO node_actions (node_id, title, details, status, size_hint, sort_order, is_minimum_step, is_repeatable, due_at, completed_at, created_at, updated_at)
        VALUES (?, ?, ?, 'todo', 'standard', 0, 0, 0, NULL, NULL, ?, ?)
      `,
      [node.id, actionTitle, course.description, timestamp, timestamp],
    );
  }

  return node;
};

const upsertCourseStructure = async (database, regionsByKey, statsByKey, timestamp) => {
  const nodesByCourseKey = new Map();
  const coursesByRegion = new Map(CS_BACHELOR_REGIONS.map((region) => [region.key, []]));
  for (const course of CS_BACHELOR_COURSES) {
    coursesByRegion.get(course.regionKey)?.push(course);
  }

  for (const [regionKey, courses] of coursesByRegion) {
    const regionContext = regionsByKey.get(regionKey);
    const stat = statsByKey.get(regionKey);
    for (const [index, course] of courses.entries()) {
      const node = await upsertCourseNode(database, course, regionContext, stat, index, courses.length, timestamp);
      nodesByCourseKey.set(course.key, node);
    }
  }

  const courseNodeIds = [...nodesByCourseKey.values()].map((node) => node.id).filter((id) => id != null);
  if (courseNodeIds.length > 0) {
    const placeholders = courseNodeIds.map(() => '?').join(', ');
    await database.execute(
      `
        DELETE FROM node_dependencies
        WHERE dependency_type IN ('requires', 'supports')
          AND (blocked_node_id IN (${placeholders}) OR blocking_node_id IN (${placeholders}))
      `,
      [...courseNodeIds, ...courseNodeIds],
    );
  }

  for (const course of CS_BACHELOR_COURSES) {
    const blocked = nodesByCourseKey.get(course.key);
    if (!blocked) {
      continue;
    }
    for (const prerequisiteKey of course.prerequisiteKeys) {
      const blocking = nodesByCourseKey.get(prerequisiteKey);
      if (!blocking) {
        continue;
      }
      await database.execute(
        `
          INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
          VALUES (?, ?, 'requires', ?)
        `,
        [blocked.id, blocking.id, timestamp],
      );
    }
    for (const followUpKey of course.followUpKeys) {
      const followUp = nodesByCourseKey.get(followUpKey);
      if (!followUp) {
        continue;
      }
      await database.execute(
        `
          INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
          VALUES (?, ?, 'supports', ?)
        `,
        [followUp.id, blocked.id, timestamp],
      );
    }
  }

  return nodesByCourseKey;
};

const upsertRoute = async (database, campaign, nodesByCourseKey, timestamp) => {
  await database.execute(
    `
      UPDATE career_specializations
      SET status = 'archived',
          completed_at = COALESCE(completed_at, ?),
          updated_at = ?
      WHERE campaign_id = ?
        AND key != ?
        AND status = 'active'
    `,
    [timestamp, timestamp, campaign.id, CS_BACHELOR_ROUTE_KEY],
  );

  await database.execute(
    `
      INSERT INTO career_specializations (
        campaign_id,
        name,
        key,
        domain,
        length,
        status,
        started_at,
        completed_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'long', 'active', ?, NULL, ?, ?)
      ON CONFLICT(campaign_id, key) DO UPDATE SET
        name = excluded.name,
        domain = excluded.domain,
        length = excluded.length,
        status = 'active',
        started_at = COALESCE(career_specializations.started_at, excluded.started_at),
        completed_at = NULL,
        updated_at = excluded.updated_at
    `,
    [campaign.id, CS_PROGRAM_TITLE, CS_BACHELOR_ROUTE_KEY, CS_DOMAIN, timestamp, timestamp, timestamp],
  );
  const specialization = await selectOne(
    database,
    'SELECT * FROM career_specializations WHERE campaign_id = ? AND key = ? LIMIT 1',
    [campaign.id, CS_BACHELOR_ROUTE_KEY],
  );

  await database.execute('DELETE FROM specialization_route_edges WHERE specialization_id = ?', [specialization.id]);
  await database.execute('DELETE FROM specialization_route_nodes WHERE specialization_id = ?', [specialization.id]);

  const routeRowsByCourseKey = new Map();
  const routeCourses = getCsBachelorCoursesInRouteOrder();

  for (const [index, course] of routeCourses.entries()) {
    const node = nodesByCourseKey.get(course.key);
    if (!node) {
      continue;
    }
    await database.execute(
      `
        INSERT INTO specialization_route_nodes (
          specialization_id,
          node_id,
          knowledge_node_id,
          required_mastery_level,
          route_label,
          route_order,
          route_stage,
          is_required,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, 'confirmed', ?, ?, ?, 1, ?, ?)
      `,
      [
        specialization.id,
        node.id,
        node.knowledge_node_id,
        course.title,
        index,
        semesterStage(course.semesterHint),
        timestamp,
        timestamp,
      ],
    );
    const routeRow = await selectOne(
      database,
      'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND node_id = ? LIMIT 1',
      [specialization.id, node.id],
    );
    routeRowsByCourseKey.set(course.key, routeRow);
  }

  for (const course of CS_BACHELOR_COURSES) {
    const source = routeRowsByCourseKey.get(course.key);
    if (!source) {
      continue;
    }
    for (const prerequisiteKey of course.prerequisiteKeys) {
      const target = routeRowsByCourseKey.get(prerequisiteKey);
      if (!target) {
        continue;
      }
      await database.execute(
        `
          INSERT OR IGNORE INTO specialization_route_edges (specialization_id, source_route_node_id, target_route_node_id, edge_type, created_at)
          VALUES (?, ?, ?, 'requires', ?)
        `,
        [specialization.id, source.id, target.id, timestamp],
      );
    }
  }

  await database.execute(
    `
      UPDATE campaigns
      SET current_specialization_id = ?,
          mode = 'career',
          career_status = 'active',
          updated_at = ?
      WHERE id = ?
    `,
    [specialization.id, timestamp, campaign.id],
  );
};

const clearTemplateProgress = async (database, campaignId, timestamp) => {
  await database.execute(
    `
      DELETE FROM node_barrier_notes
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute(
    `
      DELETE FROM node_error_notes
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute(
    'DELETE FROM daily_session_events WHERE session_id IN (SELECT id FROM daily_sessions WHERE campaign_id = ?)',
    [campaignId],
  );
  await database.execute('DELETE FROM daily_sessions WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM assessment_attempts WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM mastery_events WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM stat_xp_grants WHERE campaign_id = ?', [campaignId]);
  await database.execute(
    `
      UPDATE node_actions
      SET status = 'todo',
          completed_at = NULL,
          updated_at = ?
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
          AND nodes.is_archived = 0
      )
    `,
    [timestamp, campaignId],
  );
  await database.execute(
    `
      UPDATE nodes
      SET status = 'active',
          self_marked_mastery_level = NULL,
          last_touched_at = NULL,
          updated_at = ?
      WHERE id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
          AND nodes.is_archived = 0
      )
    `,
    [timestamp, campaignId],
  );
};

export const seedCsBachelorTemplate = async (database) => {
  const validation = validateCsBachelorCatalog();
  if (!validation.valid) {
    throw new Error(`Invalid CS bachelor course catalog: ${JSON.stringify(validation)}`);
  }

  const timestamp = createUtcTimestamp();
  const campaign = await upsertCampaign(database, timestamp);
  await archiveExistingTemplateStructure(database, campaign.id, timestamp);
  await archiveObsoleteStats(database, campaign.id, timestamp);
  const statsByKey = await upsertStats(database, campaign.id, timestamp);
  const regionsByKey = await upsertRegions(database, campaign.id, timestamp);
  const nodesByCourseKey = await upsertCourseStructure(database, regionsByKey, statsByKey, timestamp);
  await upsertRoute(database, campaign, nodesByCourseKey, timestamp);
  await clearTemplateProgress(database, campaign.id, timestamp);
  return selectOne(database, 'SELECT * FROM campaigns WHERE id = ? LIMIT 1', [campaign.id]);
};
