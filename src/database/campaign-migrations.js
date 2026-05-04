import { createUtcTimestamp } from '../stores/store-helpers.js';

export const DEVELOPER_MAIN_CAMPAIGN_SLUG = 'developer-main';

const DEFAULT_USER_STATS = [
  { key: 'focus', title: 'Фокус', color: '#58d6ff', icon: 'compass', sort_order: 0 },
  { key: 'practice', title: 'Практика', color: '#5ee6b5', icon: 'target', sort_order: 1 },
  { key: 'memory', title: 'Память', color: '#ffd166', icon: 'spark', sort_order: 2 },
  { key: 'depth', title: 'Глубина', color: '#c084fc', icon: 'layers', sort_order: 3 },
];

const DEVELOPER_MAIN_STATS = [
  { key: 'product', title: 'Продукт', color: '#58d6ff', icon: 'map', sort_order: 0 },
  { key: 'systems', title: 'Системы', color: '#5ee6b5', icon: 'grid', sort_order: 1 },
  { key: 'learning', title: 'Обучение', color: '#ffd166', icon: 'book', sort_order: 2 },
  { key: 'craft', title: 'Качество', color: '#fb7185', icon: 'tool', sort_order: 3 },
  { key: 'research', title: 'Поиск', color: '#c084fc', icon: 'compass', sort_order: 4 },
];

const tableExists = async (database, tableName) => {
  const rows = await database.select(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    [tableName],
  );
  return rows.length > 0;
};

const normalizeSql = (sql) => String(sql ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

const ensureColumn = async (database, tableName, columnName, definition) => {
  const columns = await database.select(`PRAGMA table_info(${tableName})`);
  if (!columns.some((column) => column.name === columnName)) {
    await database.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensureCampaignScopedSphereSlugs = async (database, fallbackCampaignId) => {
  const rows = await database.select(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'spheres' LIMIT 1",
  );
  const tableSql = normalizeSql(rows[0]?.sql);

  if (tableSql.includes('unique (campaign_id, slug)')) {
    return;
  }

  await database.execute('PRAGMA foreign_keys = OFF');
  await database.execute('PRAGMA legacy_alter_table = ON');
  await database.execute('BEGIN');

  try {
    await database.execute('DROP INDEX IF EXISTS idx_spheres_campaign_id');
    await database.execute('ALTER TABLE spheres RENAME TO spheres_old_campaign_scope');
    await database.execute(`
      CREATE TABLE spheres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
        UNIQUE (campaign_id, slug)
      )
    `);
    await database.execute(
      `
        INSERT INTO spheres (
          id,
          campaign_id,
          name,
          slug,
          description,
          sort_order,
          is_archived,
          created_at,
          updated_at
        )
        SELECT
          id,
          COALESCE(campaign_id, ?),
          name,
          slug,
          description,
          sort_order,
          is_archived,
          created_at,
          updated_at
        FROM spheres_old_campaign_scope
      `,
      [fallbackCampaignId],
    );
    await database.execute('DROP TABLE spheres_old_campaign_scope');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_spheres_campaign_id ON spheres (campaign_id)');
    await database.execute('COMMIT');
  } catch (error) {
    await database.execute('ROLLBACK');
    throw error;
  } finally {
    await database.execute('PRAGMA legacy_alter_table = OFF');
    await database.execute('PRAGMA foreign_keys = ON');
  }
};

const getDeveloperCampaign = async (database) => {
  const rows = await database.select('SELECT * FROM campaigns WHERE slug = ? LIMIT 1', [
    DEVELOPER_MAIN_CAMPAIGN_SLUG,
  ]);
  return rows[0] ?? null;
};

const ensureDeveloperMainCampaign = async (database) => {
  const timestamp = createUtcTimestamp();
  const existing = await getDeveloperCampaign(database);

  if (existing) {
    await database.execute(
      `
        UPDATE campaigns
        SET type = 'developer_main',
            name = COALESCE(NULLIF(name, ''), 'BrainGainz'),
            is_archived = 0,
            updated_at = ?
        WHERE id = ?
      `,
      [timestamp, existing.id],
    );
    return getDeveloperCampaign(database);
  }

  await database.execute(
    `
      INSERT INTO campaigns (type, slug, name, icon, color, is_archived, created_at, updated_at, last_opened_at)
      VALUES ('developer_main', ?, 'BrainGainz', 'brain', '#58d6ff', 0, ?, ?, NULL)
    `,
    [DEVELOPER_MAIN_CAMPAIGN_SLUG, timestamp, timestamp],
  );

  return getDeveloperCampaign(database);
};

const seedStatsForCampaign = async (database, campaign, stats) => {
  const timestamp = createUtcTimestamp();

  for (const stat of stats) {
    const existing = await database.select(
      'SELECT id FROM campaign_stats WHERE campaign_id = ? AND key = ? LIMIT 1',
      [campaign.id, stat.key],
    );

    if (existing.length > 0) {
      await database.execute(
        `
          UPDATE campaign_stats
          SET title = ?, color = ?, icon = ?, sort_order = ?, is_archived = 0, updated_at = ?
          WHERE id = ?
        `,
        [stat.title, stat.color, stat.icon, stat.sort_order, timestamp, existing[0].id],
      );
      continue;
    }

    await database.execute(
      `
        INSERT INTO campaign_stats (
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
        campaign.id,
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

const seedMissingCampaignStats = async (database) => {
  const campaigns = await database.select('SELECT * FROM campaigns WHERE is_archived = 0 ORDER BY id ASC');

  for (const campaign of campaigns) {
    const statCount = await database.select(
      'SELECT COUNT(*) AS count FROM campaign_stats WHERE campaign_id = ? AND is_archived = 0',
      [campaign.id],
    );

    if (Number(statCount[0]?.count ?? 0) === 0) {
      await seedStatsForCampaign(
        database,
        campaign,
        campaign.type === 'developer_main' ? DEVELOPER_MAIN_STATS : DEFAULT_USER_STATS,
      );
    }
  }
};

const backfillCampaignIds = async (database, developerCampaignId) => {
  await database.execute(
    'UPDATE spheres SET campaign_id = ? WHERE campaign_id IS NULL',
    [developerCampaignId],
  );

  await database.execute(
    `
      UPDATE daily_sessions
      SET campaign_id = (
        SELECT spheres.campaign_id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE nodes.id = daily_sessions.primary_node_id
        LIMIT 1
      )
      WHERE campaign_id IS NULL
        AND primary_node_id IS NOT NULL
    `,
  );

  await database.execute(
    'UPDATE daily_sessions SET campaign_id = ? WHERE campaign_id IS NULL',
    [developerCampaignId],
  );
};

const assignMissingPrimaryStats = async (database) => {
  const skills = await database.select(
    `
      SELECT skills.id, spheres.campaign_id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE skills.primary_stat_id IS NULL
    `,
  );

  for (const skill of skills) {
    const stat = await database.select(
      `
        SELECT id
        FROM campaign_stats
        WHERE campaign_id = ?
          AND is_archived = 0
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
      `,
      [skill.campaign_id],
    );

    if (stat[0]?.id != null) {
      await database.execute('UPDATE skills SET primary_stat_id = ? WHERE id = ?', [stat[0].id, skill.id]);
    }
  }
};

export const runCampaignMigrations = async (database) => {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('developer_main', 'user')),
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_opened_at TEXT
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS campaign_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      title TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
      UNIQUE (campaign_id, key)
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS stat_xp_grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL,
      stat_id INTEGER NOT NULL,
      grant_reason TEXT NOT NULL,
      xp_amount INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      created_at TEXT NOT NULL,
      reversed_at TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
      FOREIGN KEY (node_id) REFERENCES nodes (id),
      FOREIGN KEY (branch_id) REFERENCES skills (id),
      FOREIGN KEY (stat_id) REFERENCES campaign_stats (id),
      UNIQUE (campaign_id, node_id, grant_reason)
    )
  `);

  await ensureColumn(database, 'spheres', 'campaign_id', 'INTEGER');
  await ensureColumn(database, 'daily_sessions', 'campaign_id', 'INTEGER');
  await ensureColumn(database, 'skills', 'primary_stat_id', 'INTEGER');

  await database.execute('CREATE INDEX IF NOT EXISTS idx_campaigns_archived ON campaigns (is_archived, last_opened_at)');
  await database.execute('CREATE INDEX IF NOT EXISTS idx_spheres_campaign_id ON spheres (campaign_id)');
  await database.execute('CREATE INDEX IF NOT EXISTS idx_daily_sessions_campaign_id ON daily_sessions (campaign_id)');
  await database.execute('CREATE INDEX IF NOT EXISTS idx_skills_primary_stat_id ON skills (primary_stat_id)');
  await database.execute('CREATE INDEX IF NOT EXISTS idx_campaign_stats_campaign_id ON campaign_stats (campaign_id)');
  await database.execute('CREATE INDEX IF NOT EXISTS idx_stat_xp_grants_campaign_stat ON stat_xp_grants (campaign_id, stat_id, active)');
  await database.execute('CREATE INDEX IF NOT EXISTS idx_stat_xp_grants_node ON stat_xp_grants (node_id)');

  const developerCampaign = await ensureDeveloperMainCampaign(database);
  await seedStatsForCampaign(database, developerCampaign, DEVELOPER_MAIN_STATS);
  await backfillCampaignIds(database, developerCampaign.id);
  await ensureCampaignScopedSphereSlugs(database, developerCampaign.id);
  await seedMissingCampaignStats(database);
  await assignMissingPrimaryStats(database);

  if (!(await tableExists(database, 'campaigns'))) {
    throw new Error('Campaign migration verification failed: missing campaigns table.');
  }
};

export const getDefaultUserStats = () => DEFAULT_USER_STATS.map((stat) => ({ ...stat }));
