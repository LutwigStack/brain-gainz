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
        CASE WHEN campaigns.type = 'developer_main' THEN 0 ELSE 1 END ASC,
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

  async archiveCampaign(id) {
    const campaign = await this.getCampaignById(id);
    if (!campaign) {
      return null;
    }

    if (campaign.type === 'developer_main') {
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
    if (!campaign || campaign.type === 'developer_main') {
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
