import { getDefaultUserStats } from '../database/campaign-migrations.js';
import { createUtcTimestamp, insertAndFetch, updateAndFetchById } from './store-helpers.js';

const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'campaign';

const campaignSummarySelect = `
  SELECT
    campaigns.*,
    COALESCE(structures.structure_count, 0) AS structure_count,
    COALESCE(nodes_summary.node_count, 0) AS node_count,
    COALESCE(xp_summary.total_xp, 0) AS total_xp
  FROM campaigns
  LEFT JOIN (
    SELECT campaign_id, COUNT(*) AS structure_count
    FROM spheres
    WHERE is_archived = 0
    GROUP BY campaign_id
  ) structures ON structures.campaign_id = campaigns.id
  LEFT JOIN (
    SELECT spheres.campaign_id, COUNT(DISTINCT nodes.id) AS node_count
    FROM spheres
    JOIN directions ON directions.sphere_id = spheres.id AND directions.is_archived = 0
    JOIN skills ON skills.direction_id = directions.id AND skills.is_archived = 0
    JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
    WHERE spheres.is_archived = 0
    GROUP BY spheres.campaign_id
  ) nodes_summary ON nodes_summary.campaign_id = campaigns.id
  LEFT JOIN (
    SELECT campaign_id, SUM(xp_amount) AS total_xp
    FROM stat_xp_grants
    WHERE active = 1
    GROUP BY campaign_id
  ) xp_summary ON xp_summary.campaign_id = campaigns.id
`;

const listCampaigns = (database, archived) =>
  database.select(
    `
      ${campaignSummarySelect}
      WHERE campaigns.is_archived = ?
      GROUP BY campaigns.id
      ORDER BY
        CASE
          WHEN campaigns.type = 'developer_main' THEN 0
          WHEN campaigns.type = 'template' THEN 1
          ELSE 2
        END ASC,
        campaigns.last_opened_at DESC,
        campaigns.updated_at DESC,
        campaigns.id ASC
    `,
    [archived ? 1 : 0],
  );

const insertCampaignStats = async (database, campaignId) => {
  const timestamp = createUtcTimestamp();
  for (const stat of getDefaultUserStats()) {
    await database.execute(
      `
        INSERT OR IGNORE INTO campaign_stats (
          campaign_id,
          key,
          title,
          color,
          icon,
          sort_order,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      `,
      [
        campaignId,
        stat.key,
        stat.title,
        stat.color,
        stat.icon,
        stat.sort_order,
        timestamp,
        timestamp,
      ],
    );
  }
};

const createInitialUserStructure = async (database, hierarchyStore, campaign, firstStatId) => {
  const timestamp = createUtcTimestamp();
  const baseSlug = campaign.slug;
  const sphere = await hierarchyStore.createSphere({
    campaign_id: campaign.id,
    name: campaign.name,
    slug: `${baseSlug}-structure`,
    description: 'Стартовая структура кампании.',
    created_at: timestamp,
    updated_at: timestamp,
  });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Карта обучения',
    slug: `${baseSlug}-map`,
    description: 'Основная карта кампании.',
    created_at: timestamp,
    updated_at: timestamp,
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    primary_stat_id: firstStatId,
    name: 'Основная ветка',
    slug: `${baseSlug}-main-branch`,
    description: 'Первый маршрут обучения.',
    created_at: timestamp,
    updated_at: timestamp,
  });
  await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'project',
    status: 'active',
    title: campaign.name,
    slug: `${baseSlug}-root`,
    summary: 'Корень кампании.',
    x: -220,
    y: 0,
    importance: 'medium',
    created_at: timestamp,
    updated_at: timestamp,
  });
};

export const createCampaignStore = (database, hierarchyStore) => ({
  async listCampaigns() {
    const [active, archived] = await Promise.all([
      listCampaigns(database, false),
      listCampaigns(database, true),
    ]);

    return {
      active,
      archived: archived.filter((campaign) => campaign.type !== 'developer_main'),
      lastOpened:
        active
          .filter((campaign) => campaign.type === 'user')
          .filter((campaign) => campaign.last_opened_at != null)
          .sort((left, right) => String(right.last_opened_at).localeCompare(String(left.last_opened_at)))[0] ?? null,
    };
  },

  async getCampaignById(id) {
    const rows = await database.select('SELECT * FROM campaigns WHERE id = ? LIMIT 1', [id]);
    return rows[0] ?? null;
  },

  async openCampaign(id) {
    const campaign = await this.getCampaignById(id);
    if (!campaign || campaign.is_archived) {
      return null;
    }

    return updateAndFetchById(
      database,
      'UPDATE campaigns SET last_opened_at = ?, updated_at = ? WHERE id = ?',
      [createUtcTimestamp(), createUtcTimestamp(), id],
      'campaigns',
      id,
    );
  },

  async createUserCampaign({ name }) {
    const title = String(name ?? '').trim();
    if (!title) {
      throw new Error('Название кампании обязательно.');
    }

    const timestamp = createUtcTimestamp();
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const campaign = await insertAndFetch(
      database,
      `
        INSERT INTO campaigns (type, slug, name, icon, color, is_archived, created_at, updated_at, last_opened_at)
        VALUES ('user', ?, ?, 'spark', '#5ee6b5', 0, ?, ?, ?)
      `,
      [slug, title, timestamp, timestamp, timestamp],
      'campaigns',
    );

    await insertCampaignStats(database, campaign.id);
    const [firstStat] = await database.select(
      'SELECT id FROM campaign_stats WHERE campaign_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1',
      [campaign.id],
    );
    await createInitialUserStructure(database, hierarchyStore, campaign, firstStat?.id ?? null);

    return this.openCampaign(campaign.id);
  },

  async forkTemplateCampaign(templateId, input = {}) {
    const template = await this.getCampaignById(templateId);
    if (!template || template.is_archived) {
      return null;
    }
    if (template.type !== 'template') {
      throw new Error('Only template campaigns can be forked.');
    }

    const timestamp = createUtcTimestamp();
    const title = String(input.name ?? '').trim() || template.name;
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const idMaps = {
      stats: new Map(),
      spheres: new Map(),
      directions: new Map(),
      skills: new Map(),
      nodes: new Map(),
      specializations: new Map(),
      routeNodes: new Map(),
    };

    await database.execute('BEGIN');
    try {
      const campaign = await insertAndFetch(
        database,
        `
          INSERT INTO campaigns (type, slug, name, icon, color, mode, career_status, current_specialization_id, is_archived, created_at, updated_at, last_opened_at)
          VALUES ('user', ?, ?, ?, ?, ?, 'active', NULL, 0, ?, ?, ?)
        `,
        [slug, title, template.icon ?? 'spark', template.color ?? '#5ee6b5', template.mode ?? 'free', timestamp, timestamp, timestamp],
        'campaigns',
      );

      const stats = await database.select(
        'SELECT * FROM campaign_stats WHERE campaign_id = ? ORDER BY sort_order ASC, id ASC',
        [template.id],
      );
      for (const stat of stats) {
        const created = await insertAndFetch(
          database,
          `
            INSERT INTO campaign_stats (campaign_id, key, title, color, icon, sort_order, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [campaign.id, stat.key, stat.title, stat.color, stat.icon, stat.sort_order, stat.is_archived, timestamp, timestamp],
          'campaign_stats',
        );
        idMaps.stats.set(stat.id, created.id);
      }

      const spheres = await database.select(
        'SELECT * FROM spheres WHERE campaign_id = ? ORDER BY sort_order ASC, id ASC',
        [template.id],
      );
      for (const sphere of spheres) {
        const created = await insertAndFetch(
          database,
          `
            INSERT INTO spheres (campaign_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [campaign.id, sphere.name, sphere.slug, sphere.description, sphere.sort_order, sphere.is_archived, timestamp, timestamp],
          'spheres',
        );
        idMaps.spheres.set(sphere.id, created.id);
      }

      const directions = await database.select(
        `
          SELECT directions.*
          FROM directions
          JOIN spheres ON spheres.id = directions.sphere_id
          WHERE spheres.campaign_id = ?
          ORDER BY directions.sort_order ASC, directions.id ASC
        `,
        [template.id],
      );
      for (const direction of directions) {
        const created = await insertAndFetch(
          database,
          `
            INSERT INTO directions (sphere_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            idMaps.spheres.get(direction.sphere_id),
            direction.name,
            direction.slug,
            direction.description,
            direction.sort_order,
            direction.is_archived,
            timestamp,
            timestamp,
          ],
          'directions',
        );
        idMaps.directions.set(direction.id, created.id);
      }

      const skills = await database.select(
        `
          SELECT skills.*
          FROM skills
          JOIN directions ON directions.id = skills.direction_id
          JOIN spheres ON spheres.id = directions.sphere_id
          WHERE spheres.campaign_id = ?
          ORDER BY skills.sort_order ASC, skills.id ASC
        `,
        [template.id],
      );
      for (const skill of skills) {
        const created = await insertAndFetch(
          database,
          `
            INSERT INTO skills (direction_id, primary_stat_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            idMaps.directions.get(skill.direction_id),
            skill.primary_stat_id == null ? null : idMaps.stats.get(skill.primary_stat_id) ?? null,
            skill.name,
            skill.slug,
            skill.description,
            skill.sort_order,
            skill.is_archived,
            timestamp,
            timestamp,
          ],
          'skills',
        );
        idMaps.skills.set(skill.id, created.id);
      }

      const nodes = await database.select(
        `
          SELECT nodes.*
          FROM nodes
          JOIN skills ON skills.id = nodes.skill_id
          JOIN directions ON directions.id = skills.direction_id
          JOIN spheres ON spheres.id = directions.sphere_id
          WHERE spheres.campaign_id = ?
          ORDER BY nodes.id ASC
        `,
        [template.id],
      );
      for (const node of nodes) {
        const created = await insertAndFetch(
          database,
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
            VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL, ?, ?, ?)
          `,
          [
            idMaps.skills.get(node.skill_id),
            node.type,
            node.title,
            node.slug,
            node.summary,
            node.completion_criteria,
            node.links,
            node.reward,
            node.x,
            node.y,
            node.knowledge_node_id,
            node.check_metadata,
            node.importance,
            node.target_date,
            node.is_archived,
            timestamp,
            timestamp,
          ],
          'nodes',
        );
        idMaps.nodes.set(node.id, created.id);
      }

      const actions = await database.select(
        `
          SELECT node_actions.*
          FROM node_actions
          JOIN nodes ON nodes.id = node_actions.node_id
          JOIN skills ON skills.id = nodes.skill_id
          JOIN directions ON directions.id = skills.direction_id
          JOIN spheres ON spheres.id = directions.sphere_id
          WHERE spheres.campaign_id = ?
          ORDER BY node_actions.id ASC
        `,
        [template.id],
      );
      for (const action of actions) {
        await insertAndFetch(
          database,
          `
            INSERT INTO node_actions (
              node_id,
              title,
              details,
              status,
              size_hint,
              sort_order,
              is_minimum_step,
              is_repeatable,
              due_at,
              completed_at,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, 'todo', ?, ?, ?, ?, ?, NULL, ?, ?)
          `,
          [
            idMaps.nodes.get(action.node_id),
            action.title,
            action.details,
            action.size_hint,
            action.sort_order,
            action.is_minimum_step,
            action.is_repeatable,
            action.due_at,
            timestamp,
            timestamp,
          ],
          'node_actions',
        );
      }

      const dependencies = await database.select(
        `
          SELECT node_dependencies.*
          FROM node_dependencies
          JOIN nodes ON nodes.id = node_dependencies.blocked_node_id
          JOIN skills ON skills.id = nodes.skill_id
          JOIN directions ON directions.id = skills.direction_id
          JOIN spheres ON spheres.id = directions.sphere_id
          WHERE spheres.campaign_id = ?
          ORDER BY node_dependencies.id ASC
        `,
        [template.id],
      );
      for (const dependency of dependencies) {
        const blockedNodeId = idMaps.nodes.get(dependency.blocked_node_id);
        const blockingNodeId = idMaps.nodes.get(dependency.blocking_node_id);
        if (blockedNodeId == null || blockingNodeId == null) {
          continue;
        }
        await database.execute(
          `
            INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
            VALUES (?, ?, ?, ?)
          `,
          [blockedNodeId, blockingNodeId, dependency.dependency_type, timestamp],
        );
      }

      const specializations = await database.select(
        'SELECT * FROM career_specializations WHERE campaign_id = ? ORDER BY id ASC',
        [template.id],
      );
      for (const specialization of specializations) {
        const created = await insertAndFetch(
          database,
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
            VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
          `,
          [
            campaign.id,
            specialization.name,
            specialization.key,
            specialization.domain,
            specialization.length,
            specialization.status === 'active' ? 'active' : 'paused',
            specialization.status === 'active' ? timestamp : null,
            timestamp,
            timestamp,
          ],
          'career_specializations',
        );
        idMaps.specializations.set(specialization.id, created.id);
      }

      const routeNodes = await database.select(
        `
          SELECT route_nodes.*
          FROM specialization_route_nodes route_nodes
          JOIN career_specializations specializations ON specializations.id = route_nodes.specialization_id
          WHERE specializations.campaign_id = ?
          ORDER BY route_nodes.id ASC
        `,
        [template.id],
      );
      for (const routeNode of routeNodes) {
        const created = await insertAndFetch(
          database,
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            idMaps.specializations.get(routeNode.specialization_id),
            routeNode.node_id == null ? null : idMaps.nodes.get(routeNode.node_id) ?? null,
            routeNode.knowledge_node_id,
            routeNode.required_mastery_level,
            routeNode.route_label,
            routeNode.route_order,
            routeNode.route_stage,
            routeNode.is_required,
            timestamp,
            timestamp,
          ],
          'specialization_route_nodes',
        );
        idMaps.routeNodes.set(routeNode.id, created.id);
      }

      const routeEdges = await database.select(
        `
          SELECT route_edges.*
          FROM specialization_route_edges route_edges
          JOIN career_specializations specializations ON specializations.id = route_edges.specialization_id
          WHERE specializations.campaign_id = ?
          ORDER BY route_edges.id ASC
        `,
        [template.id],
      );
      for (const routeEdge of routeEdges) {
        const sourceRouteNodeId = idMaps.routeNodes.get(routeEdge.source_route_node_id);
        const targetRouteNodeId = idMaps.routeNodes.get(routeEdge.target_route_node_id);
        if (sourceRouteNodeId == null || targetRouteNodeId == null) {
          continue;
        }
        await database.execute(
          `
            INSERT OR IGNORE INTO specialization_route_edges (
              specialization_id,
              source_route_node_id,
              target_route_node_id,
              edge_type,
              created_at
            )
            VALUES (?, ?, ?, ?, ?)
          `,
          [
            idMaps.specializations.get(routeEdge.specialization_id),
            sourceRouteNodeId,
            targetRouteNodeId,
            routeEdge.edge_type,
            timestamp,
          ],
        );
      }

      const currentSpecializationId =
        template.current_specialization_id == null
          ? null
          : idMaps.specializations.get(template.current_specialization_id) ?? null;
      await database.execute(
        'UPDATE campaigns SET current_specialization_id = ?, updated_at = ? WHERE id = ?',
        [currentSpecializationId, timestamp, campaign.id],
      );

      await database.execute('COMMIT');
      return this.openCampaign(campaign.id);
    } catch (error) {
      await database.execute('ROLLBACK');
      throw error;
    }
  },

  async archiveCampaign(id) {
    const campaign = await this.getCampaignById(id);
    if (!campaign) {
      return null;
    }

    if (campaign.type === 'developer_main' || campaign.type === 'template') {
      throw new Error('developer_main нельзя архивировать.');
    }

    return updateAndFetchById(
      database,
      'UPDATE campaigns SET is_archived = 1, updated_at = ? WHERE id = ?',
      [createUtcTimestamp(), id],
      'campaigns',
      id,
    );
  },

  async restoreCampaign(id) {
    const campaign = await this.getCampaignById(id);
    if (!campaign || campaign.type === 'developer_main' || campaign.type === 'template') {
      return campaign;
    }

    return updateAndFetchById(
      database,
      'UPDATE campaigns SET is_archived = 0, updated_at = ? WHERE id = ?',
      [createUtcTimestamp(), id],
      'campaigns',
      id,
    );
  },
});
