import { createUtcTimestamp } from '../stores/store-helpers.js';

const TEMPLATE_CAMPAIGNS = [
  {
    slug: 'template-materials-science',
    name: 'Бакалавриат по материаловедению',
    icon: 'crystal',
    color: '#38bdf8',
    domain: 'Материаловедение',
    summary: 'Учебная витрина по структуре, свойствам и выбору материалов.',
    stats: [
      { key: 'structure', title: 'Структура', color: '#58d6ff', icon: 'grid', sort_order: 0 },
      { key: 'properties', title: 'Свойства', color: '#ffd166', icon: 'spark', sort_order: 1 },
      { key: 'lab', title: 'Лаборатория', color: '#5ee6b5', icon: 'flask', sort_order: 2 },
    ],
    nodes: [
      ['materials-map', 'Карта классов материалов', 'Разобраться, чем отличаются металлы, керамики, полимеры и композиты.'],
      ['crystal-structure', 'Кристаллическая структура', 'Понять решетку, дефекты и связь структуры со свойствами.'],
      ['phase-diagrams', 'Фазовые диаграммы', 'Научиться читать базовую диаграмму фаз и областей устойчивости.'],
      ['mechanical-properties', 'Механические свойства', 'Связать прочность, пластичность, твердость и режим испытаний.'],
      ['material-selection', 'Выбор материала под задачу', 'Собрать критерии выбора материала для простой инженерной задачи.'],
    ],
  },
  {
    slug: 'template-nlh-cash',
    name: 'NLH cash',
    icon: 'cards',
    color: '#f59e0b',
    domain: 'Стратегия NLH cash',
    summary: 'Учебная стратегия кэш-игры NLH без рекламного тона.',
    stats: [
      { key: 'ranges', title: 'Диапазоны', color: '#58d6ff', icon: 'grid', sort_order: 0 },
      { key: 'position', title: 'Позиция', color: '#5ee6b5', icon: 'compass', sort_order: 1 },
      { key: 'review', title: 'Разбор', color: '#ffd166', icon: 'search', sort_order: 2 },
    ],
    nodes: [
      ['table-position', 'Позиции за столом', 'Понять, как позиция меняет ценность руки и план розыгрыша.'],
      ['preflop-ranges', 'Стартовые диапазоны', 'Собрать базовую логику открытия и защиты до флопа.'],
      ['pot-odds', 'Шансы банка', 'Научиться считать простую цену колла и сравнивать ее с шансами.'],
      ['board-texture', 'Структура доски', 'Разобрать сухие, связанные и опасные доски на примерах.'],
      ['session-review', 'Разбор сессии', 'Выстроить спокойный разбор решений после игры.'],
    ],
  },
  {
    slug: 'template-biology',
    name: 'Бакалавриат по биологии',
    icon: 'leaf',
    color: '#22c55e',
    domain: 'Биология',
    summary: 'Обзорный учебный маршрут по живым системам и лабораторной логике.',
    stats: [
      { key: 'cell', title: 'Клетка', color: '#5ee6b5', icon: 'circle', sort_order: 0 },
      { key: 'genetics', title: 'Генетика', color: '#c084fc', icon: 'branch', sort_order: 1 },
      { key: 'systems', title: 'Системы', color: '#ffd166', icon: 'network', sort_order: 2 },
    ],
    nodes: [
      ['cell-theory', 'Клеточная теория', 'Понять клетку как базовую единицу живого.'],
      ['biomolecules', 'Биомолекулы', 'Связать белки, липиды, углеводы и нуклеиновые кислоты с функциями.'],
      ['dna-to-protein', 'От ДНК к белку', 'Проследить путь информации от гена до продукта.'],
      ['evolution-basics', 'Основы эволюции', 'Разобрать изменчивость, отбор и наследование признаков.'],
      ['ecosystem-flow', 'Потоки в экосистемах', 'Понять энергию, вещества и связи между организмами.'],
    ],
  },
  {
    slug: 'template-applied-math',
    name: 'Бакалавриат по прикладной математике',
    icon: 'sigma',
    color: '#60a5fa',
    domain: 'Прикладная математика',
    summary: 'Маршрут по моделям, анализу, вероятности и оптимизации.',
    stats: [
      { key: 'analysis', title: 'Анализ', color: '#58d6ff', icon: 'chart', sort_order: 0 },
      { key: 'models', title: 'Модели', color: '#ffd166', icon: 'cube', sort_order: 1 },
      { key: 'probability', title: 'Вероятность', color: '#c084fc', icon: 'dice', sort_order: 2 },
    ],
    nodes: [
      ['functions-and-limits', 'Функции и пределы', 'Освежить язык функций, пределов и непрерывности.'],
      ['linear-algebra-models', 'Линейные модели', 'Связать векторы, матрицы и системы уравнений с задачами.'],
      ['probability-intro', 'Вероятностное мышление', 'Разобрать события, распределения и ожидание.'],
      ['optimization-basics', 'Основы оптимизации', 'Понять целевую функцию, ограничения и поиск решения.'],
      ['numerical-methods', 'Численные методы', 'Увидеть, как приближенные вычисления работают на практике.'],
    ],
  },
  {
    slug: 'template-ml-ai',
    name: 'Бакалавриат по машинному обучению и ИИ',
    icon: 'brain',
    color: '#a78bfa',
    domain: 'Машинное обучение и ИИ',
    summary: 'Упрощенный вход в данные, модели, обучение и проверку качества.',
    stats: [
      { key: 'data', title: 'Данные', color: '#58d6ff', icon: 'database', sort_order: 0 },
      { key: 'models', title: 'Модели', color: '#a78bfa', icon: 'brain', sort_order: 1 },
      { key: 'evaluation', title: 'Оценка', color: '#5ee6b5', icon: 'check', sort_order: 2 },
    ],
    nodes: [
      ['data-pipeline', 'Пайплайн данных', 'Понять сбор, очистку, признаки и разделение выборки.'],
      ['supervised-learning', 'Обучение с учителем', 'Разобрать задачу, признаки, ответы и функцию потерь.'],
      ['model-evaluation', 'Оценка модели', 'Сравнить метрики качества и ошибки обобщения.'],
      ['neural-network-intro', 'Нейросетевой минимум', 'Понять слой, веса, активацию и обучение на примере.'],
      ['ai-product-loop', 'ИИ в продукте', 'Собрать цикл: задача, данные, модель, проверка, обновление.'],
    ],
  },
];

const selectOne = async (database, sql, params = []) => {
  const rows = await database.select(sql, params);
  return rows[0] ?? null;
};

const upsertTemplateCampaign = async (database, template, timestamp) => {
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
        source_template_id,
        is_archived,
        created_at,
        updated_at,
        last_opened_at
      )
      VALUES ('template', ?, ?, ?, ?, 'career', 'active', NULL, NULL, 0, ?, ?, NULL)
      ON CONFLICT(slug) DO UPDATE SET
        type = 'template',
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        mode = 'career',
        career_status = 'active',
        source_template_id = NULL,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [template.slug, template.name, template.icon, template.color, timestamp, timestamp],
  );

  return selectOne(database, 'SELECT * FROM campaigns WHERE slug = ? LIMIT 1', [template.slug]);
};

const upsertStats = async (database, campaignId, template, timestamp) => {
  const statsByKey = new Map();
  for (const stat of template.stats) {
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
        ON CONFLICT(campaign_id, key) DO UPDATE SET
          title = excluded.title,
          color = excluded.color,
          icon = excluded.icon,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [campaignId, stat.key, stat.title, stat.color, stat.icon, stat.sort_order, timestamp, timestamp],
    );
    const row = await selectOne(database, 'SELECT * FROM campaign_stats WHERE campaign_id = ? AND key = ? LIMIT 1', [
      campaignId,
      stat.key,
    ]);
    statsByKey.set(stat.key, row);
  }
  return statsByKey;
};

const upsertStructure = async (database, campaignId, template, statsByKey, timestamp) => {
  await database.execute(
    `
      INSERT INTO spheres (campaign_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
      VALUES (?, ?, 'main', ?, 0, 0, ?, ?)
      ON CONFLICT(campaign_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [campaignId, template.domain, template.summary, timestamp, timestamp],
  );
  const sphere = await selectOne(database, 'SELECT * FROM spheres WHERE campaign_id = ? AND slug = ? LIMIT 1', [
    campaignId,
    'main',
  ]);

  await database.execute(
    `
      INSERT INTO directions (sphere_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'Стартовый маршрут', 'starter-route', ?, 0, 0, ?, ?)
      ON CONFLICT(sphere_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [sphere.id, template.summary, timestamp, timestamp],
  );
  const direction = await selectOne(database, 'SELECT * FROM directions WHERE sphere_id = ? AND slug = ? LIMIT 1', [
    sphere.id,
    'starter-route',
  ]);
  const primaryStat = statsByKey.get(template.stats[0]?.key);

  await database.execute(
    `
      INSERT INTO skills (
        direction_id,
        name,
        slug,
        description,
        primary_stat_id,
        sort_order,
        is_archived,
        created_at,
        updated_at
      )
      VALUES (?, 'Основы', 'core', ?, ?, 0, 0, ?, ?)
      ON CONFLICT(direction_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        primary_stat_id = excluded.primary_stat_id,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [direction.id, template.summary, primaryStat?.id ?? null, timestamp, timestamp],
  );

  return selectOne(database, 'SELECT * FROM skills WHERE direction_id = ? AND slug = ? LIMIT 1', [direction.id, 'core']);
};

const upsertNodes = async (database, template, skill, timestamp) => {
  const nodesBySlug = new Map();

  for (const [index, node] of template.nodes.entries()) {
    const [slug, title, summary] = node;
    const x = 80 + index * 180;
    const y = index % 2 === 0 ? 120 : 260;
    const knowledgeKey = `${template.slug}:${slug}`;

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
      [knowledgeKey, title, template.domain, summary, timestamp, timestamp],
    );
    const knowledgeNode = await selectOne(database, 'SELECT * FROM knowledge_nodes WHERE key = ? LIMIT 1', [knowledgeKey]);

    await database.execute(
      `
        INSERT INTO nodes (
          skill_id,
          knowledge_node_id,
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
          importance,
          target_date,
          last_touched_at,
          self_marked_mastery_level,
          check_metadata,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, ?, 'task', 'active', ?, ?, ?, 'Коротко объяснить идею и выполнить учебный шаг.', '[]', NULL, ?, ?, ?, NULL, NULL, NULL, NULL, 0, ?, ?)
        ON CONFLICT(skill_id, slug) DO UPDATE SET
          knowledge_node_id = excluded.knowledge_node_id,
          type = 'task',
          status = 'active',
          title = excluded.title,
          summary = excluded.summary,
          completion_criteria = excluded.completion_criteria,
          x = excluded.x,
          y = excluded.y,
          importance = excluded.importance,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [
        skill.id,
        knowledgeNode.id,
        title,
        slug,
        summary,
        x,
        y,
        index === 0 ? 'high' : 'medium',
        timestamp,
        timestamp,
      ],
    );

    const nodeRow = await selectOne(database, 'SELECT * FROM nodes WHERE skill_id = ? AND slug = ? LIMIT 1', [
      skill.id,
      slug,
    ]);
    await database.execute('DELETE FROM node_actions WHERE node_id = ?', [nodeRow.id]);
    await database.execute(
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
        VALUES (?, ?, ?, 'todo', 's', 0, 1, 0, NULL, NULL, ?, ?)
      `,
      [nodeRow.id, `Разобрать: ${title}`, summary, timestamp, timestamp],
    );
    nodesBySlug.set(slug, nodeRow);
  }

  for (let index = 1; index < template.nodes.length; index += 1) {
    const blocked = nodesBySlug.get(template.nodes[index][0]);
    const blocking = nodesBySlug.get(template.nodes[index - 1][0]);
    if (blocked && blocking) {
      await database.execute(
        `
          INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
          VALUES (?, ?, 'requires', ?)
        `,
        [blocked.id, blocking.id, timestamp],
      );
    }
  }

  return nodesBySlug;
};

const upsertRoute = async (database, campaign, template, nodesBySlug, timestamp) => {
  const routeKey = `route-${template.slug.replace(/^template-/, '')}`;

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
    [timestamp, timestamp, campaign.id, routeKey],
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
      VALUES (?, ?, ?, ?, 'short', 'active', ?, NULL, ?, ?)
      ON CONFLICT(campaign_id, key) DO UPDATE SET
        name = excluded.name,
        domain = excluded.domain,
        length = excluded.length,
        status = 'active',
        started_at = COALESCE(career_specializations.started_at, excluded.started_at),
        completed_at = NULL,
        updated_at = excluded.updated_at
    `,
    [campaign.id, template.domain, routeKey, template.domain, timestamp, timestamp, timestamp],
  );
  const specialization = await selectOne(
    database,
    'SELECT * FROM career_specializations WHERE campaign_id = ? AND key = ? LIMIT 1',
    [campaign.id, routeKey],
  );
  const routeRowsBySlug = new Map();

  for (const [index, nodeSpec] of template.nodes.entries()) {
    const [slug, title] = nodeSpec;
    const node = nodesBySlug.get(slug);
    if (!node) {
      continue;
    }
    const existing = await selectOne(
      database,
      'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND knowledge_node_id = ? LIMIT 1',
      [specialization.id, node.knowledge_node_id],
    );
    if (existing) {
      await database.execute(
        `
          UPDATE specialization_route_nodes
          SET node_id = ?,
              required_mastery_level = 'confirmed',
              route_label = ?,
              route_order = ?,
              route_stage = 'Старт',
              is_required = 1,
              updated_at = ?
          WHERE id = ?
        `,
        [node.id, title, index, timestamp, existing.id],
      );
    } else {
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
          VALUES (?, ?, ?, 'confirmed', ?, ?, 'Старт', 1, ?, ?)
        `,
        [specialization.id, node.id, node.knowledge_node_id, title, index, timestamp, timestamp],
      );
    }
    const routeRow = await selectOne(
      database,
      'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND knowledge_node_id = ? LIMIT 1',
      [specialization.id, node.knowledge_node_id],
    );
    routeRowsBySlug.set(slug, routeRow);
  }

  for (let index = 1; index < template.nodes.length; index += 1) {
    const source = routeRowsBySlug.get(template.nodes[index][0]);
    const target = routeRowsBySlug.get(template.nodes[index - 1][0]);
    if (source && target) {
      await database.execute(
        `
          INSERT OR IGNORE INTO specialization_route_edges (
            specialization_id,
            source_route_node_id,
            target_route_node_id,
            edge_type,
            created_at
          )
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
  await database.execute('DELETE FROM daily_session_events WHERE session_id IN (SELECT id FROM daily_sessions WHERE campaign_id = ?)', [
    campaignId,
  ]);
  await database.execute('DELETE FROM daily_sessions WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM assessment_attempts WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM mastery_events WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM stat_xp_grants WHERE campaign_id = ?', [campaignId]);
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
      )
    `,
    [timestamp, campaignId],
  );
};

export const seedCampaignTemplateCatalog = async (database) => {
  const timestamp = createUtcTimestamp();

  for (const template of TEMPLATE_CAMPAIGNS) {
    if (template.slug === 'template-nlh-cash') {
      continue;
    }
    const campaign = await upsertTemplateCampaign(database, template, timestamp);
    const statsByKey = await upsertStats(database, campaign.id, template, timestamp);
    const skill = await upsertStructure(database, campaign.id, template, statsByKey, timestamp);
    const nodesBySlug = await upsertNodes(database, template, skill, timestamp);
    await upsertRoute(database, campaign, template, nodesBySlug, timestamp);
    await clearTemplateProgress(database, campaign.id, timestamp);
  }
};
