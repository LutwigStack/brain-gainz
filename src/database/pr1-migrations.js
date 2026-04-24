export const REQUIRED_PR1_TABLES = [
  'spheres',
  'directions',
  'skills',
  'nodes',
  'node_actions',
  'node_dependencies',
  'review_states',
  'daily_sessions',
  'daily_session_events',
  'node_barrier_notes',
  'node_error_notes',
  'legacy_subject_mappings',
  'legacy_card_mappings',
];

const NODE_EDITOR_OWNED_COLUMNS = [
  ['completion_criteria', 'TEXT'],
  ['links', 'TEXT'],
  ['reward', 'TEXT'],
];

const NODE_GRAPH_COLUMNS = [
  ['x', 'REAL'],
  ['y', 'REAL'],
];

const HUB_POSITION = { x: 0, y: 0 };
const BIOME_RING_RADIUS = 360;
const BIOME_RADIUS = 164;
const DIRECTION_RING_STEP = 48;
const NODE_STEP = 72;

const REQUIRED_PR1_COLUMNS = {
  spheres: [
    'id',
    'name',
    'slug',
    'description',
    'sort_order',
    'is_archived',
    'created_at',
    'updated_at',
  ],
  directions: [
    'id',
    'sphere_id',
    'name',
    'slug',
    'description',
    'sort_order',
    'is_archived',
    'created_at',
    'updated_at',
  ],
  skills: [
    'id',
    'direction_id',
    'name',
    'slug',
    'description',
    'sort_order',
    'is_archived',
    'created_at',
    'updated_at',
  ],
  nodes: [
    'id',
    'skill_id',
    'type',
    'status',
    'title',
    'slug',
    'summary',
    'completion_criteria',
    'links',
    'reward',
    'x',
    'y',
    'importance',
    'target_date',
    'last_touched_at',
    'is_archived',
    'created_at',
    'updated_at',
  ],
  node_actions: [
    'id',
    'node_id',
    'title',
    'details',
    'status',
    'size_hint',
    'sort_order',
    'is_minimum_step',
    'is_repeatable',
    'due_at',
    'completed_at',
    'created_at',
    'updated_at',
  ],
  node_dependencies: [
    'id',
    'blocked_node_id',
    'blocking_node_id',
    'dependency_type',
    'created_at',
  ],
  review_states: [
    'id',
    'node_id',
    'review_profile',
    'next_due_at',
    'last_reviewed_at',
    'current_risk',
    'updated_at',
  ],
  daily_sessions: [
    'id',
    'session_date',
    'status',
    'primary_node_id',
    'primary_action_id',
    'started_at',
    'ended_at',
    'summary_note',
    'created_at',
    'updated_at',
  ],
  daily_session_events: [
    'id',
    'session_id',
    'event_type',
    'node_id',
    'action_id',
    'note',
    'occurred_at',
  ],
  node_barrier_notes: [
    'id',
    'node_id',
    'action_id',
    'barrier_type',
    'note',
    'source_event_id',
    'is_open',
    'created_at',
    'updated_at',
  ],
  node_error_notes: [
    'id',
    'node_id',
    'action_id',
    'note_kind',
    'note',
    'source_event_id',
    'is_open',
    'created_at',
    'updated_at',
  ],
  legacy_subject_mappings: [
    'id',
    'legacy_subject_id',
    'sphere_id',
    'direction_id',
    'skill_id',
    'mapping_status',
    'mapping_decider',
    'created_at',
    'updated_at',
  ],
  legacy_card_mappings: [
    'id',
    'legacy_card_id',
    'node_id',
    'mapping_status',
    'mapping_decider',
    'link_role',
    'created_at',
    'updated_at',
  ],
};

const REQUIRED_FOREIGN_KEY_ACTIONS = [
  {
    tableName: 'directions',
    fromColumn: 'sphere_id',
    toTable: 'spheres',
  },
  {
    tableName: 'skills',
    fromColumn: 'direction_id',
    toTable: 'directions',
  },
  {
    tableName: 'nodes',
    fromColumn: 'skill_id',
    toTable: 'skills',
  },
  {
    tableName: 'node_actions',
    fromColumn: 'node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'node_dependencies',
    fromColumn: 'blocked_node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'node_dependencies',
    fromColumn: 'blocking_node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'review_states',
    fromColumn: 'node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'daily_sessions',
    fromColumn: 'primary_node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'daily_sessions',
    fromColumn: 'primary_action_id',
    toTable: 'node_actions',
  },
  {
    tableName: 'daily_session_events',
    fromColumn: 'session_id',
    toTable: 'daily_sessions',
  },
  {
    tableName: 'daily_session_events',
    fromColumn: 'node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'daily_session_events',
    fromColumn: 'action_id',
    toTable: 'node_actions',
  },
  {
    tableName: 'node_barrier_notes',
    fromColumn: 'node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'node_barrier_notes',
    fromColumn: 'action_id',
    toTable: 'node_actions',
  },
  {
    tableName: 'node_barrier_notes',
    fromColumn: 'source_event_id',
    toTable: 'daily_session_events',
  },
  {
    tableName: 'node_error_notes',
    fromColumn: 'node_id',
    toTable: 'nodes',
  },
  {
    tableName: 'node_error_notes',
    fromColumn: 'action_id',
    toTable: 'node_actions',
  },
  {
    tableName: 'node_error_notes',
    fromColumn: 'source_event_id',
    toTable: 'daily_session_events',
  },
  {
    tableName: 'legacy_subject_mappings',
    fromColumn: 'legacy_subject_id',
    toTable: 'subjects',
    onDelete: 'CASCADE',
  },
  {
    tableName: 'legacy_card_mappings',
    fromColumn: 'legacy_card_id',
    toTable: 'cards',
    onDelete: 'CASCADE',
  },
  {
    tableName: 'legacy_subject_mappings',
    fromColumn: 'sphere_id',
    toTable: 'spheres',
  },
  {
    tableName: 'legacy_subject_mappings',
    fromColumn: 'direction_id',
    toTable: 'directions',
  },
  {
    tableName: 'legacy_subject_mappings',
    fromColumn: 'skill_id',
    toTable: 'skills',
  },
  {
    tableName: 'legacy_card_mappings',
    fromColumn: 'node_id',
    toTable: 'nodes',
  },
];

const REQUIRED_INDEXES = [
  'idx_directions_sphere_id',
  'idx_skills_direction_id',
  'idx_nodes_skill_id',
  'idx_node_actions_node_id',
  'idx_node_dependencies_blocked',
  'idx_node_dependencies_blocking',
  'idx_node_dependencies_type',
  'idx_daily_sessions_primary_node',
  'idx_daily_sessions_primary_action',
  'idx_daily_session_events_session_id',
  'idx_daily_session_events_node_id',
  'idx_daily_session_events_action_id',
  'idx_node_barrier_notes_node_id',
  'idx_node_barrier_notes_action_id',
  'idx_node_error_notes_node_id',
  'idx_node_error_notes_action_id',
  'idx_legacy_subject_mappings_sphere_id',
  'idx_legacy_subject_mappings_direction_id',
  'idx_legacy_subject_mappings_skill_id',
  'idx_legacy_card_mappings_node_id',
];

const REQUIRED_TABLE_SQL_FRAGMENTS = {
  directions: ['unique (sphere_id, slug)'],
  skills: ['unique (direction_id, slug)'],
  nodes: [
    "check (type in ('theory', 'task', 'project', 'habit', 'maintenance', 'org_tail', 'research'))",
    "check (status in ('active', 'paused', 'done', 'archived'))",
    "check (importance in ('low', 'medium', 'high'))",
    'unique (skill_id, slug)',
  ],
  node_actions: [
    "check (status in ('todo', 'ready', 'doing', 'done', 'cancelled'))",
    'check (is_minimum_step in (0, 1))',
    'check (is_repeatable in (0, 1))',
  ],
  node_dependencies: [
    "check (dependency_type in ('requires', 'supports', 'relates_to'))",
    'check (blocked_node_id != blocking_node_id)',
    'unique (blocked_node_id, blocking_node_id, dependency_type)',
  ],
  review_states: [
    "check (current_risk is null or current_risk in ('low', 'medium', 'high'))",
    'node_id integer not null unique',
  ],
  daily_sessions: [
    "check (status in ('planned', 'active', 'completed', 'abandoned'))",
  ],
  daily_session_events: [
    "check (event_type in ('selected', 'completed', 'deferred', 'blocked', 'shrunk'))",
    'check (node_id is not null or action_id is not null)',
  ],
  node_barrier_notes: [
    "check (barrier_type in ('too complex', 'unclear next step', 'low energy', 'aversive / scary to start', 'wrong time / wrong context'))",
    'check (is_open in (0, 1))',
  ],
  node_error_notes: [
    "check (note_kind in ('shrink', 'defer', 'error', 'follow_up'))",
    'check (is_open in (0, 1))',
  ],
  legacy_subject_mappings: [
    "check (mapping_status in ('pending', 'suggested', 'accepted', 'archived'))",
    "check (mapping_decider in ('manual', 'automatic', 'assisted'))",
    'legacy_subject_id integer not null unique',
  ],
  legacy_card_mappings: [
    "check (mapping_status in ('pending', 'suggested', 'accepted', 'archived'))",
    "check (mapping_decider in ('manual', 'automatic', 'assisted'))",
    "check (link_role is null or link_role in ('reference', 'review_material', 'practice_seed'))",
    'legacy_card_id integer not null unique',
  ],
};

const normalizeSql = (sql) => sql.toLowerCase().replace(/\s+/g, ' ').trim();
const PR1_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS spheres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS directions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sphere_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (sphere_id) REFERENCES spheres (id),
      UNIQUE (sphere_id, slug)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direction_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (direction_id) REFERENCES directions (id),
      UNIQUE (direction_id, slug)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('theory', 'task', 'project', 'habit', 'maintenance', 'org_tail', 'research')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'done', 'archived')),
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      summary TEXT,
      completion_criteria TEXT,
      links TEXT,
      reward TEXT,
      x REAL,
      y REAL,
      importance TEXT NOT NULL CHECK (importance IN ('low', 'medium', 'high')),
      target_date TEXT,
      last_touched_at TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (skill_id) REFERENCES skills (id),
      UNIQUE (skill_id, slug)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS node_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'ready', 'doing', 'done', 'cancelled')),
      size_hint TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_minimum_step INTEGER NOT NULL DEFAULT 0 CHECK (is_minimum_step IN (0, 1)),
      is_repeatable INTEGER NOT NULL DEFAULT 0 CHECK (is_repeatable IN (0, 1)),
      due_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (node_id) REFERENCES nodes (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS node_dependencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blocked_node_id INTEGER NOT NULL,
      blocking_node_id INTEGER NOT NULL,
      dependency_type TEXT NOT NULL DEFAULT 'requires' CHECK (dependency_type IN ('requires', 'supports', 'relates_to')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (blocked_node_id) REFERENCES nodes (id),
      FOREIGN KEY (blocking_node_id) REFERENCES nodes (id),
      UNIQUE (blocked_node_id, blocking_node_id, dependency_type),
      CHECK (blocked_node_id != blocking_node_id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS review_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL UNIQUE,
      review_profile TEXT NOT NULL DEFAULT 'learning',
      next_due_at TEXT,
      last_reviewed_at TEXT,
      current_risk TEXT CHECK (current_risk IS NULL OR current_risk IN ('low', 'medium', 'high')),
      updated_at TEXT NOT NULL,
      FOREIGN KEY (node_id) REFERENCES nodes (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS daily_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'abandoned')),
      primary_node_id INTEGER,
      primary_action_id INTEGER,
      started_at TEXT,
      ended_at TEXT,
      summary_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (primary_node_id) REFERENCES nodes (id),
      FOREIGN KEY (primary_action_id) REFERENCES node_actions (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS daily_session_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ('selected', 'completed', 'deferred', 'blocked', 'shrunk')),
      node_id INTEGER,
      action_id INTEGER,
      note TEXT,
      occurred_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES daily_sessions (id),
      FOREIGN KEY (node_id) REFERENCES nodes (id),
      FOREIGN KEY (action_id) REFERENCES node_actions (id),
      CHECK (node_id IS NOT NULL OR action_id IS NOT NULL)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS node_barrier_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      action_id INTEGER,
      barrier_type TEXT NOT NULL CHECK (barrier_type IN ('too complex', 'unclear next step', 'low energy', 'aversive / scary to start', 'wrong time / wrong context')),
      note TEXT NOT NULL,
      source_event_id INTEGER,
      is_open INTEGER NOT NULL DEFAULT 1 CHECK (is_open IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (node_id) REFERENCES nodes (id),
      FOREIGN KEY (action_id) REFERENCES node_actions (id),
      FOREIGN KEY (source_event_id) REFERENCES daily_session_events (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS node_error_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      action_id INTEGER,
      note_kind TEXT NOT NULL CHECK (note_kind IN ('shrink', 'defer', 'error', 'follow_up')),
      note TEXT NOT NULL,
      source_event_id INTEGER,
      is_open INTEGER NOT NULL DEFAULT 1 CHECK (is_open IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (node_id) REFERENCES nodes (id),
      FOREIGN KEY (action_id) REFERENCES node_actions (id),
      FOREIGN KEY (source_event_id) REFERENCES daily_session_events (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS legacy_subject_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      legacy_subject_id INTEGER NOT NULL UNIQUE,
      sphere_id INTEGER,
      direction_id INTEGER,
      skill_id INTEGER,
      mapping_status TEXT NOT NULL DEFAULT 'pending' CHECK (mapping_status IN ('pending', 'suggested', 'accepted', 'archived')),
      mapping_decider TEXT NOT NULL DEFAULT 'assisted' CHECK (mapping_decider IN ('manual', 'automatic', 'assisted')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (legacy_subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
      FOREIGN KEY (sphere_id) REFERENCES spheres (id),
      FOREIGN KEY (direction_id) REFERENCES directions (id),
      FOREIGN KEY (skill_id) REFERENCES skills (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS legacy_card_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      legacy_card_id INTEGER NOT NULL UNIQUE,
      node_id INTEGER,
      mapping_status TEXT NOT NULL DEFAULT 'pending' CHECK (mapping_status IN ('pending', 'suggested', 'accepted', 'archived')),
      mapping_decider TEXT NOT NULL DEFAULT 'assisted' CHECK (mapping_decider IN ('manual', 'automatic', 'assisted')),
      link_role TEXT CHECK (link_role IS NULL OR link_role IN ('reference', 'review_material', 'practice_seed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (legacy_card_id) REFERENCES cards (id) ON DELETE CASCADE,
      FOREIGN KEY (node_id) REFERENCES nodes (id)
    )
  `,
  'CREATE INDEX IF NOT EXISTS idx_directions_sphere_id ON directions (sphere_id)',
  'CREATE INDEX IF NOT EXISTS idx_skills_direction_id ON skills (direction_id)',
  'CREATE INDEX IF NOT EXISTS idx_nodes_skill_id ON nodes (skill_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_actions_node_id ON node_actions (node_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_dependencies_blocked ON node_dependencies (blocked_node_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_dependencies_blocking ON node_dependencies (blocking_node_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_dependencies_type ON node_dependencies (dependency_type)',
  'CREATE INDEX IF NOT EXISTS idx_daily_sessions_primary_node ON daily_sessions (primary_node_id)',
  'CREATE INDEX IF NOT EXISTS idx_daily_sessions_primary_action ON daily_sessions (primary_action_id)',
  'CREATE INDEX IF NOT EXISTS idx_daily_session_events_session_id ON daily_session_events (session_id)',
  'CREATE INDEX IF NOT EXISTS idx_daily_session_events_node_id ON daily_session_events (node_id)',
  'CREATE INDEX IF NOT EXISTS idx_daily_session_events_action_id ON daily_session_events (action_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_barrier_notes_node_id ON node_barrier_notes (node_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_barrier_notes_action_id ON node_barrier_notes (action_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_error_notes_node_id ON node_error_notes (node_id)',
  'CREATE INDEX IF NOT EXISTS idx_node_error_notes_action_id ON node_error_notes (action_id)',
  'CREATE INDEX IF NOT EXISTS idx_legacy_subject_mappings_sphere_id ON legacy_subject_mappings (sphere_id)',
  'CREATE INDEX IF NOT EXISTS idx_legacy_subject_mappings_direction_id ON legacy_subject_mappings (direction_id)',
  'CREATE INDEX IF NOT EXISTS idx_legacy_subject_mappings_skill_id ON legacy_subject_mappings (skill_id)',
  'CREATE INDEX IF NOT EXISTS idx_legacy_card_mappings_node_id ON legacy_card_mappings (node_id)',
];

const ensureTableColumns = async (database, tableName, requiredColumns) => {
  const columnRows = await database.select(`PRAGMA table_info(${tableName})`);
  const existingColumns = new Set(columnRows.map((row) => row.name));

  for (const [columnName, columnDefinition] of requiredColumns) {
    if (!existingColumns.has(columnName)) {
      await database.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
  }
};

const createBackfillBiome = (index, total, nodeCount) => {
  const angle = -Math.PI / 2 + (index / Math.max(total, 1)) * Math.PI * 2;

  return {
    center: {
      x: HUB_POSITION.x + Math.cos(angle) * BIOME_RING_RADIUS,
      y: HUB_POSITION.y + Math.sin(angle) * BIOME_RING_RADIUS,
    },
    radius: BIOME_RADIUS + nodeCount * 4,
  };
};

const createFallbackNodePosition = (biome, directionIndex, totalDirections, skillIndex, nodeIndex) => {
  const directionAngle = -Math.PI / 2 + (directionIndex / Math.max(totalDirections, 1)) * Math.PI * 2;
  const skillRadius = 56 + directionIndex * DIRECTION_RING_STEP + skillIndex * 28;
  const nodeRadius = skillRadius + 38 + nodeIndex * NODE_STEP;

  if (nodeIndex === 0) {
    return {
      x: biome.center.x + Math.cos(directionAngle) * skillRadius,
      y: biome.center.y + Math.sin(directionAngle) * skillRadius,
    };
  }

  return {
    x: biome.center.x + Math.cos(directionAngle) * nodeRadius,
    y: biome.center.y + Math.sin(directionAngle) * nodeRadius,
  };
};

const backfillNodeCoordinates = async (database) => {
  const nodesNeedingBackfill = await database.select(
    `
      SELECT COUNT(*) AS count
      FROM nodes
      WHERE is_archived = 0
        AND (x IS NULL OR y IS NULL)
    `,
  );

  if (Number(nodesNeedingBackfill[0]?.count ?? 0) === 0) {
    return;
  }

  const [spheres, directions, skills, nodes] = await Promise.all([
    database.select(
      `
        SELECT id, sort_order
        FROM spheres
        WHERE is_archived = 0
        ORDER BY sort_order ASC, id ASC
      `,
    ),
    database.select(
      `
        SELECT id, sphere_id, sort_order
        FROM directions
        WHERE is_archived = 0
        ORDER BY sort_order ASC, id ASC
      `,
    ),
    database.select(
      `
        SELECT id, direction_id, sort_order
        FROM skills
        WHERE is_archived = 0
        ORDER BY sort_order ASC, id ASC
      `,
    ),
    database.select(
      `
        SELECT id, skill_id, x, y, updated_at
        FROM nodes
        WHERE is_archived = 0
        ORDER BY updated_at DESC, id ASC
      `,
    ),
  ]);

  for (let sphereIndex = 0; sphereIndex < spheres.length; sphereIndex += 1) {
    const sphere = spheres[sphereIndex];
    const sphereDirections = directions.filter((direction) => direction.sphere_id === sphere.id);
    const sphereNodeCount = sphereDirections.reduce((sum, direction) => {
      const directionSkills = skills.filter((skill) => skill.direction_id === direction.id);
      return sum + directionSkills.reduce((skillSum, skill) => skillSum + nodes.filter((node) => node.skill_id === skill.id).length, 0);
    }, 0);
    const biome = createBackfillBiome(sphereIndex, spheres.length, sphereNodeCount);

    for (let directionIndex = 0; directionIndex < sphereDirections.length; directionIndex += 1) {
      const direction = sphereDirections[directionIndex];
      const directionSkills = skills.filter((skill) => skill.direction_id === direction.id);

      for (let skillIndex = 0; skillIndex < directionSkills.length; skillIndex += 1) {
        const skill = directionSkills[skillIndex];
        const skillNodes = nodes.filter((node) => node.skill_id === skill.id);

        for (let nodeIndex = 0; nodeIndex < skillNodes.length; nodeIndex += 1) {
          const node = skillNodes[nodeIndex];
          if (node.x != null && node.y != null) {
            continue;
          }

          const position = createFallbackNodePosition(
            biome,
            directionIndex,
            sphereDirections.length,
            skillIndex,
            nodeIndex,
          );

          await database.execute(
            'UPDATE nodes SET x = ?, y = ? WHERE id = ?',
            [position.x, position.y, node.id],
          );
        }
      }
    }
  }
};

const recreateNodeDependenciesTable = async (database) => {
  await database.execute('BEGIN');

  try {
    await database.execute('DROP INDEX IF EXISTS idx_node_dependencies_blocked');
    await database.execute('DROP INDEX IF EXISTS idx_node_dependencies_blocking');
    await database.execute('DROP INDEX IF EXISTS idx_node_dependencies_type');
    await database.execute('ALTER TABLE node_dependencies RENAME TO node_dependencies_old');
    await database.execute(`
      CREATE TABLE node_dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blocked_node_id INTEGER NOT NULL,
        blocking_node_id INTEGER NOT NULL,
        dependency_type TEXT NOT NULL DEFAULT 'requires' CHECK (dependency_type IN ('requires', 'supports', 'relates_to')),
        created_at TEXT NOT NULL,
        FOREIGN KEY (blocked_node_id) REFERENCES nodes (id),
        FOREIGN KEY (blocking_node_id) REFERENCES nodes (id),
        UNIQUE (blocked_node_id, blocking_node_id, dependency_type),
        CHECK (blocked_node_id != blocking_node_id)
      )
    `);
    await database.execute(`
      INSERT INTO node_dependencies (id, blocked_node_id, blocking_node_id, dependency_type, created_at)
      SELECT id, blocked_node_id, blocking_node_id, dependency_type, created_at
      FROM node_dependencies_old
    `);
    await database.execute('DROP TABLE node_dependencies_old');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_node_dependencies_blocked ON node_dependencies (blocked_node_id)');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_node_dependencies_blocking ON node_dependencies (blocking_node_id)');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_node_dependencies_type ON node_dependencies (dependency_type)');
    await database.execute('COMMIT');
  } catch (error) {
    await database.execute('ROLLBACK');
    throw error;
  }
};

const ensureNodeDependenciesSchema = async (database) => {
  const rows = await database.select(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'node_dependencies'",
  );

  if (rows.length === 0) {
    return;
  }

  const normalizedTableSql = normalizeSql(rows[0].sql ?? '');

  if (!normalizedTableSql.includes("check (dependency_type in ('requires', 'supports', 'relates_to'))")) {
    await recreateNodeDependenciesTable(database);
  }
};

export const runPr1Migrations = async (database) => {
  for (const statement of PR1_STATEMENTS) {
    await database.execute(statement);
  }

  await ensureTableColumns(database, 'nodes', NODE_EDITOR_OWNED_COLUMNS);
  await ensureTableColumns(database, 'nodes', NODE_GRAPH_COLUMNS);
  await ensureNodeDependenciesSchema(database);
  await backfillNodeCoordinates(database);
  await verifyPr1Schema(database);
};

export const verifyPr1Schema = async (database) => {
  for (const tableName of REQUIRED_PR1_TABLES) {
    const rows = await database.select(
      "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name = ?",
      [tableName],
    );

    if (rows.length === 0) {
      throw new Error(`PR1 migration verification failed: missing table "${tableName}"`);
    }

    const normalizedTableSql = normalizeSql(rows[0].sql ?? '');

    const columnRows = await database.select(`PRAGMA table_info(${tableName})`);
    const existingColumns = new Set(columnRows.map((row) => row.name));

    for (const columnName of REQUIRED_PR1_COLUMNS[tableName]) {
      if (!existingColumns.has(columnName)) {
        throw new Error(
          `PR1 migration verification failed: table "${tableName}" is missing column "${columnName}"`,
        );
      }
    }

    for (const requiredFragment of REQUIRED_TABLE_SQL_FRAGMENTS[tableName] ?? []) {
      if (!normalizedTableSql.includes(requiredFragment)) {
        throw new Error(
          `PR1 migration verification failed: table "${tableName}" is missing required constraint fragment "${requiredFragment}"`,
        );
      }
    }
  }

  for (const foreignKeyExpectation of REQUIRED_FOREIGN_KEY_ACTIONS) {
    const foreignKeys = await database.select(
      `PRAGMA foreign_key_list(${foreignKeyExpectation.tableName})`,
    );

    const matchingForeignKey = foreignKeys.find(
      (foreignKey) =>
        foreignKey.from === foreignKeyExpectation.fromColumn &&
        foreignKey.table === foreignKeyExpectation.toTable,
    );

    if (!matchingForeignKey) {
      throw new Error(
        `PR1 migration verification failed: table "${foreignKeyExpectation.tableName}" is missing a foreign key for "${foreignKeyExpectation.fromColumn}"`,
      );
    }

    if (
      foreignKeyExpectation.onDelete !== undefined &&
      matchingForeignKey.on_delete !== foreignKeyExpectation.onDelete
    ) {
      throw new Error(
        `PR1 migration verification failed: table "${foreignKeyExpectation.tableName}" has unexpected ON DELETE action for "${foreignKeyExpectation.fromColumn}"`,
      );
    }
  }

  const indexRows = await database.select(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_autoindex_%'",
  );
  const existingIndexes = new Set(indexRows.map((row) => row.name));

  for (const indexName of REQUIRED_INDEXES) {
    if (!existingIndexes.has(indexName)) {
      throw new Error(
        `PR1 migration verification failed: missing required index "${indexName}"`,
      );
    }
  }
};
