const STARTER_SLUGS = {
  sphere: 'career',
  direction: 'brain-gainz-evolution',
  skill: 'product-loop',
  primaryNode: 'ship-first-now-surface',
  primaryAction: 'review-first-now-recommendation',
  blockedNode: 'capture-recommendation-language',
  blockedAction: 'write-clear-why-now-copy',
  maintenanceNode: 'protect-legacy-card-flow',
  maintenanceAction: 'run-legacy-library-smoke-check',
};

const LINEAR_ALGEBRA_GRAPH_SLUGS = {
  sphere: 'linear-algebra-course',
  direction: 'algebra-1-course-map',
  skill: 'linear-algebra-mind-map',
  rootNode: 'linear-algebra-root',
};

const LINEAR_ALGEBRA_GRAPH_TREE = {
  key: 'root',
  title: 'Основные темы курса Алгебры I',
  type: 'project',
  children: [
    {
      key: 'systems-and-matrices',
      title: 'I. Системы линейных уравнений (СЛУ) и матрицы',
      children: [
        {
          key: 'slu-basics',
          title: 'Общие понятия СЛУ',
          children: [
            { key: 'slu-definitions', title: 'Определения: СЛУ, коэффициенты, свободные члены, решение' },
            { key: 'system-classification', title: 'Совместная / несовместная, определенная / неопределенная' },
            { key: 'slu-matrices', title: 'Матрица коэффициентов и расширенная матрица' },
          ],
        },
        {
          key: 'gauss-method',
          title: 'Метод Гаусса',
          children: [
            { key: 'elementary-transformations', title: 'Элементарные преобразования I, II, III типов' },
            { key: 'row-echelon-forms', title: 'Ступенчатый и улучшенный ступенчатый вид' },
            { key: 'pivot-free-unknowns', title: 'Главные и свободные неизвестные' },
            { key: 'back-substitution', title: 'Обратный ход и общее решение' },
            { key: 'homogeneous-slu', title: 'Однородные СЛУ: тривиальное и нетривиальное решения' },
          ],
        },
      ],
    },
    {
      key: 'matrix-algebra',
      title: 'II. Матричная алгебра',
      children: [
        {
          key: 'matrix-operations',
          title: 'Операции над матрицами',
          children: [
            { key: 'matrix-add-scalar', title: 'Сложение и умножение на число' },
            { key: 'matrix-multiply', title: 'Умножение матриц: строка на столбец' },
            { key: 'matrix-operation-properties', title: 'Ассоциативность и дистрибутивность' },
            { key: 'transpose', title: 'Транспонирование' },
          ],
        },
        {
          key: 'invertibility-special-matrices',
          title: 'Обратимость и специальные матрицы',
          children: [
            { key: 'identity-kronecker', title: 'Единичная матрица и символ Кронекера' },
            { key: 'inverse-matrix', title: 'Обратная матрица: определение и критерий существования' },
            { key: 'elementary-matrices', title: 'Элементарные матрицы и преобразования' },
            { key: 'matrix-zero-divisors', title: 'Делители нуля в кольце матриц' },
          ],
        },
      ],
    },
    {
      key: 'determinants',
      title: 'III. Теория определителей',
      children: [
        {
          key: 'combinatorics-basics',
          title: 'Основы комбинаторики',
          children: [
            { key: 'permutations-sign', title: 'Перестановки: инверсии, четность и знак' },
            { key: 'substitutions-sn', title: 'Подстановки: Sn, циклы, транспозиции' },
          ],
        },
        {
          key: 'determinant-definition',
          title: 'Определитель матрицы',
          children: [
            { key: 'det-expanded-formula', title: 'Развернутая формула через подстановки' },
            { key: 'det-properties', title: 'Полилинейность и кососимметричность' },
            { key: 'det-transpose-triangular', title: 'Определитель транспонированной и треугольной матриц' },
          ],
        },
        {
          key: 'det-computation-apps',
          title: 'Методы вычисления и применения',
          children: [
            { key: 'minors-cofactors', title: 'Миноры и алгебраические дополнения' },
            { key: 'laplace-expansion', title: 'Разложение по строке / столбцу' },
            { key: 'zero-corner-matrix', title: 'Матрица с углом нулей' },
            { key: 'vandermonde', title: 'Определитель Вандермонда' },
            { key: 'cramer-rule', title: 'Правило Крамера' },
          ],
        },
      ],
    },
    {
      key: 'vector-spaces',
      title: 'IV. Векторные пространства',
      children: [
        {
          key: 'vector-basics',
          title: 'Базовые понятия',
          children: [
            { key: 'vector-space-axioms', title: 'Аксиомы и примеры: Rn, функции, матрицы' },
            { key: 'linear-combination', title: 'Линейная комбинация' },
            { key: 'linear-dependence', title: 'Линейная зависимость и независимость' },
            { key: 'dependence-lemma', title: 'Основная лемма о линейной зависимости' },
          ],
        },
        {
          key: 'basis-dimension',
          title: 'Базис и размерность',
          children: [
            { key: 'basis-coordinates', title: 'Базис и координаты вектора' },
            { key: 'rank-vector-system', title: 'Ранг системы векторов и размерность' },
            { key: 'standard-basis-rn', title: 'Стандартный базис в Rn' },
            { key: 'finite-isomorphism', title: 'Изоморфизм конечномерных пространств' },
          ],
        },
        {
          key: 'subspaces-and-slu',
          title: 'Линейные подпространства и СЛУ',
          children: [
            { key: 'linear-hull', title: 'Линейная оболочка' },
            { key: 'fundamental-solutions', title: 'Фундаментальная система решений' },
            { key: 'homogeneous-nonhomogeneous-link', title: 'Однородные и неоднородные СЛУ: линейные многообразия' },
            { key: 'matrix-rank', title: 'Ранг матрицы: строчный, столбцовый, минорный' },
            { key: 'kronecker-capelli', title: 'Теорема Кронекера-Капелли' },
          ],
        },
      ],
    },
    {
      key: 'algebraic-structures-numbers',
      title: 'V. Общие алгебраические структуры и числа',
      children: [
        {
          key: 'groups-rings-fields',
          title: 'Группы, кольца, поля',
          children: [
            { key: 'groups', title: 'Группы: аксиомы, абелевы группы, подгруппы' },
            { key: 'rings', title: 'Кольца: область целостности, обратимые элементы, делители нуля' },
            { key: 'fields', title: 'Поля: характеристика, малая теорема Ферма, Fp' },
          ],
        },
        {
          key: 'complex-numbers',
          title: 'Комплексные числа C',
          children: [
            { key: 'complex-axioms-pairs', title: 'Аксиоматическое определение и модель пар' },
            { key: 'complex-algebraic-form', title: 'Алгебраическая форма, сопряжение, модуль' },
            { key: 'complex-trig-exp', title: 'Тригонометрическая и экспоненциальная формы' },
            { key: 'de-moivre-roots', title: 'Формула Муавра и корни n-й степени' },
            { key: 'primitive-roots-unity', title: 'Первообразные корни из единицы' },
          ],
        },
      ],
    },
    {
      key: 'polynomials',
      title: 'VI. Многочлены',
      children: [
        {
          key: 'one-variable-polynomials',
          title: 'Кольцо многочленов одной переменной',
          children: [
            { key: 'polynomial-degree-operations', title: 'Степень и операции над многочленами' },
            { key: 'lagrange-interpolation', title: 'Интерполяция и формула Лагранжа' },
            { key: 'bezout-horner', title: 'Теорема Безу и схема Горнера' },
          ],
        },
        {
          key: 'polynomial-divisibility',
          title: 'Теория делимости',
          children: [
            { key: 'euclidean-gcd', title: 'Алгоритм Евклида и НОД' },
            { key: 'irreducible-factorial', title: 'Неприводимые многочлены и факториальность' },
            { key: 'root-multiplicity-derivative', title: 'Кратность корней и формальная производная' },
            { key: 'taylor-formula', title: 'Формула Тейлора' },
          ],
        },
        {
          key: 'algebraic-closed-roots',
          title: 'Алгебраическая замкнутость и корни',
          children: [
            { key: 'fundamental-theorem-algebra', title: 'Основная теорема алгебры' },
            { key: 'factorization-c-r', title: 'Разложение многочленов над C и R' },
            { key: 'descartes-rule', title: 'Теорема Декарта' },
          ],
        },
        {
          key: 'multi-variable-polynomials',
          title: 'Многочлены нескольких переменных',
          children: [
            { key: 'lexicographic-order', title: 'Лексикографический порядок и старший член' },
            { key: 'symmetric-polynomials', title: 'Симметрические многочлены и основная теорема' },
            { key: 'vieta-formulas', title: 'Формулы Виета' },
            { key: 'discriminant-resultant', title: 'Дискриминант и результант' },
          ],
        },
      ],
    },
    {
      key: 'rational-functions',
      title: 'VII. Рациональные дроби',
      children: [
        {
          key: 'field-of-fractions',
          title: 'Поле частных',
          children: [
            { key: 'fraction-field-construction', title: 'Построение поля дробей из области целостности' },
            { key: 'proper-irreducible-fractions', title: 'Правильные и несократимые дроби' },
          ],
        },
        {
          key: 'fraction-decomposition',
          title: 'Разложение дробей',
          children: [
            { key: 'simple-fractions-c-r', title: 'Простейшие дроби над C и R' },
            { key: 'proper-fraction-decomposition', title: 'Разложение правильной дроби в сумму простейших' },
          ],
        },
      ],
    },
  ],
};

const flattenLinearAlgebraGraph = () => {
  const nodes = [];
  let cursorY = 0;

  const walk = (item, depth, parent = null) => {
    const children = item.children ?? [];
    const childCenters = children.map((child) => walk(child, depth + 1, item.key));
    const y =
      childCenters.length > 0
        ? childCenters.reduce((sum, value) => sum + value, 0) / childCenters.length
        : cursorY;

    if (childCenters.length === 0) {
      cursorY += 62;
    } else {
      cursorY += depth === 1 ? 34 : 10;
    }

    nodes.push({
      key: item.key,
      slug: item.key === 'root' ? LINEAR_ALGEBRA_GRAPH_SLUGS.rootNode : `linear-algebra-${item.key}`,
      title: item.title,
      type: item.type ?? (children.length > 0 ? 'theory' : 'task'),
      parent,
      x: -900 + depth * 360,
      y,
    });

    return y;
  };

  const rootY = walk(LINEAR_ALGEBRA_GRAPH_TREE, 0, null);

  return nodes.map((node) => ({
    ...node,
    y: Math.round(node.y - rootY),
  }));
};

const LINEAR_ALGEBRA_GRAPH_NODES = flattenLinearAlgebraGraph();

const BARRIER_TYPES = ['too complex', 'unclear next step', 'low energy', 'aversive / scary to start', 'wrong time / wrong context'];

const MAX_QUEUE_ITEMS = 4;

const countFromRows = (rows) => Number(rows[0]?.count ?? 0);

const padDatePart = (value) => String(value).padStart(2, '0');

const todayDate = (date = new Date()) => [
  date.getFullYear(),
  padDatePart(date.getMonth() + 1),
  padDatePart(date.getDate()),
].join('-');

const currentTimestamp = () => new Date().toISOString();

const activeActionStatuses = ['todo', 'ready', 'doing'];
const NODE_COMPLETION_GRANT_REASON = 'node_completion';

const resolveCampaignId = async (database, campaignId = null) => {
  if (campaignId != null) {
    const rows = await database.select('SELECT id FROM campaigns WHERE id = ? AND is_archived = 0 LIMIT 1', [
      campaignId,
    ]);

    if (rows[0]?.id != null) {
      return rows[0].id;
    }
  }

  const lastOpened = await database.select(
    `
      SELECT id
      FROM campaigns
      WHERE is_archived = 0
      ORDER BY last_opened_at DESC, CASE WHEN type = 'developer_main' THEN 0 ELSE 1 END ASC, id ASC
      LIMIT 1
    `,
  );

  return lastOpened[0]?.id ?? null;
};

const nodeCompletionXp = (node) => {
  if (node?.type === 'milestone' || node?.type === 'check') {
    return 50;
  }

  if (node?.importance === 'high') {
    return 25;
  }

  return 10;
};

const findNodeCampaignId = async (database, nodeId) => {
  const rows = await database.select(
    `
      SELECT spheres.campaign_id
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE nodes.id = ?
      LIMIT 1
    `,
    [nodeId],
  );

  return rows[0]?.campaign_id ?? null;
};

const findSkillCampaignId = async (database, skillId) => {
  const rows = await database.select(
    `
      SELECT spheres.campaign_id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE skills.id = ?
      LIMIT 1
    `,
    [skillId],
  );

  return rows[0]?.campaign_id ?? null;
};

const assertSkillInCampaign = async (database, skillId, campaignId) => {
  const skillCampaignId = await findSkillCampaignId(database, skillId);

  if (skillCampaignId !== campaignId) {
    throw new Error('Навык не принадлежит выбранной кампании.');
  }
};

const loadEdgeBoundary = async (database, edgeId) => {
  const rows = await database.select(
    `
      SELECT
        node_dependencies.*,
        source_spheres.campaign_id AS source_campaign_id,
        target_spheres.campaign_id AS target_campaign_id
      FROM node_dependencies
      JOIN nodes source_nodes ON source_nodes.id = node_dependencies.blocked_node_id
      JOIN skills source_skills ON source_skills.id = source_nodes.skill_id
      JOIN directions source_directions ON source_directions.id = source_skills.direction_id
      JOIN spheres source_spheres ON source_spheres.id = source_directions.sphere_id
      JOIN nodes target_nodes ON target_nodes.id = node_dependencies.blocking_node_id
      JOIN skills target_skills ON target_skills.id = target_nodes.skill_id
      JOIN directions target_directions ON target_directions.id = target_skills.direction_id
      JOIN spheres target_spheres ON target_spheres.id = target_directions.sphere_id
      WHERE node_dependencies.id = ?
      LIMIT 1
    `,
    [edgeId],
  );

  return rows[0] ?? null;
};

const assertEdgeInCampaign = (edge, campaignId) => {
  if (!edge) {
    return;
  }

  if (edge.source_campaign_id !== campaignId || edge.target_campaign_id !== campaignId) {
    throw new Error('Связь не принадлежит выбранной кампании.');
  }
};

const assertEdgeEndpointsInCampaign = async (database, input, campaignId) => {
  const [sourceCampaignId, targetCampaignId] = await Promise.all([
    findNodeCampaignId(database, input.blocked_node_id),
    findNodeCampaignId(database, input.blocking_node_id),
  ]);

  if (sourceCampaignId !== campaignId || targetCampaignId !== campaignId) {
    throw new Error('Связь можно изменять только внутри выбранной кампании.');
  }
};

const syncNodeCompletionXpGrant = async (database, nodeId, nextStatus, timestamp = currentTimestamp()) => {
  const rows = await database.select(
    `
      SELECT
        nodes.id,
        nodes.type,
        nodes.importance,
        nodes.skill_id AS branch_id,
        skills.primary_stat_id,
        spheres.campaign_id
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE nodes.id = ?
      LIMIT 1
    `,
    [nodeId],
  );
  const node = rows[0] ?? null;

  if (!node?.campaign_id) {
    return { status: 'missing-campaign' };
  }

  if (nextStatus !== 'done') {
    await database.execute(
      `
        UPDATE stat_xp_grants
        SET active = 0,
            reversed_at = COALESCE(reversed_at, ?)
        WHERE campaign_id = ?
          AND node_id = ?
          AND grant_reason = ?
          AND active = 1
      `,
      [timestamp, node.campaign_id, nodeId, NODE_COMPLETION_GRANT_REASON],
    );
    return { status: 'deactivated' };
  }

  if (!node.primary_stat_id) {
    return { status: 'missing-stat' };
  }

  const existing = await database.select(
    `
      SELECT id
      FROM stat_xp_grants
      WHERE campaign_id = ?
        AND node_id = ?
        AND grant_reason = ?
      LIMIT 1
    `,
    [node.campaign_id, nodeId, NODE_COMPLETION_GRANT_REASON],
  );

  if (existing[0]?.id != null) {
    await database.execute(
      `
        UPDATE stat_xp_grants
        SET branch_id = ?,
            stat_id = ?,
            xp_amount = ?,
            active = 1,
            reversed_at = NULL
        WHERE id = ?
      `,
      [node.branch_id, node.primary_stat_id, nodeCompletionXp(node), existing[0].id],
    );
    return { status: 'reactivated' };
  }

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
        created_at,
        reversed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, NULL)
    `,
    [
      node.campaign_id,
      nodeId,
      node.branch_id,
      node.primary_stat_id,
      NODE_COMPLETION_GRANT_REASON,
      nodeCompletionXp(node),
      timestamp,
    ],
  );

  return { status: 'created' };
};

const buildXpWarning = (xpGrantResult) => {
  if (xpGrantResult?.status !== 'missing-stat') {
    return null;
  }

  return {
    code: 'missing-primary-stat',
    message: 'XP не начислен: у ветки не выбран стат.',
  };
};

const isOlderThanDays = (value, days) => {
  if (!value) {
    return true;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp >= days * 24 * 60 * 60 * 1000;
};

const isPastDue = (value) => {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return timestamp <= Date.now();
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const slugify = (value) => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'structure';
};

const STARTER_LOCALIZATION = {
  sphere: {
    name: 'Работа',
    description: 'Стартовый контур новой системы.',
  },
  direction: {
    name: 'Развитие BrainGainz',
    description: 'Ближайший продуктовый цикл.',
  },
  skill: {
    name: 'Продуктовый цикл',
    description: 'Новый рабочий контур поверх старого приложения.',
  },
  nodes: {
    [STARTER_SLUGS.primaryNode]: {
      title: 'Собрать первый экран «Сейчас»',
      summary: 'Показать один понятный следующий шаг без поломки старого режима.',
      actionTitle: 'Проверить первый шаг и запустить сессию',
      actionDetails: 'Использовать экран «Сейчас» как основную точку входа.',
    },
    [STARTER_SLUGS.blockedNode]: {
      title: 'Сделать короткие причины выбора',
      summary: 'Сократить и прояснить объяснение выбора.',
      actionTitle: 'Сделать короткий текст для причин выбора',
      actionDetails: 'Оставить только ясные и короткие причины.',
    },
    [STARTER_SLUGS.maintenanceNode]: {
      title: 'Не сломать старый режим карточек',
      summary: 'Словарь и повторение должны остаться рабочими.',
      actionTitle: 'Быстро проверить старый словарь',
      actionDetails: 'Проверить импорт, редактирование и повторение после изменений UI.',
    },
  },
};

const updateSessionEventNote = (database, campaignId, nextNote, previousNote) =>
  database.execute(
    `
      UPDATE daily_session_events
      SET note = ?
      WHERE note = ?
        AND session_id IN (SELECT id FROM daily_sessions WHERE campaign_id = ?)
    `,
    [nextNote, previousNote, campaignId],
  );

const updateSessionSummaryNote = (database, campaignId, nextNote, previousNote) =>
  database.execute(
    'UPDATE daily_sessions SET summary_note = ? WHERE summary_note = ? AND campaign_id = ?',
    [nextNote, previousNote, campaignId],
  );

const localizeStarterWorkspace = async (database, campaignId) => {
  const updatedAt = currentTimestamp();

  await database.execute(
    'UPDATE spheres SET name = ?, description = ?, updated_at = ? WHERE slug = ? AND campaign_id = ?',
    [STARTER_LOCALIZATION.sphere.name, STARTER_LOCALIZATION.sphere.description, updatedAt, STARTER_SLUGS.sphere, campaignId],
  );

  await database.execute(
    `
      UPDATE directions
      SET name = ?, description = ?, updated_at = ?
      WHERE slug = ?
        AND sphere_id IN (SELECT id FROM spheres WHERE campaign_id = ?)
    `,
    [STARTER_LOCALIZATION.direction.name, STARTER_LOCALIZATION.direction.description, updatedAt, STARTER_SLUGS.direction, campaignId],
  );

  await database.execute(
    `
      UPDATE skills
      SET name = ?, description = ?, updated_at = ?
      WHERE slug = ?
        AND direction_id IN (
          SELECT directions.id
          FROM directions
          JOIN spheres ON spheres.id = directions.sphere_id
          WHERE spheres.campaign_id = ?
        )
    `,
    [STARTER_LOCALIZATION.skill.name, STARTER_LOCALIZATION.skill.description, updatedAt, STARTER_SLUGS.skill, campaignId],
  );

  for (const [slug, copy] of Object.entries(STARTER_LOCALIZATION.nodes)) {
    await database.execute(
      `
        UPDATE nodes
        SET title = ?, summary = ?, updated_at = ?
        WHERE slug = ?
          AND skill_id IN (
            SELECT skills.id
            FROM skills
            JOIN directions ON directions.id = skills.direction_id
            JOIN spheres ON spheres.id = directions.sphere_id
            WHERE spheres.campaign_id = ?
          )
      `,
      [copy.title, copy.summary, updatedAt, slug, campaignId],
    );

    await database.execute(
      `
        UPDATE node_actions
        SET title = ?, details = ?, updated_at = ?
        WHERE node_id IN (
            SELECT nodes.id
            FROM nodes
            JOIN skills ON skills.id = nodes.skill_id
            JOIN directions ON directions.id = skills.direction_id
            JOIN spheres ON spheres.id = directions.sphere_id
            WHERE nodes.slug = ?
              AND spheres.campaign_id = ?
          )
          AND is_minimum_step = 1
      `,
      [copy.actionTitle, copy.actionDetails, updatedAt, slug, campaignId],
    );
  }

  await updateSessionSummaryNote(database, campaignId,
    'Запущено с первой рекомендации экрана «Сейчас».',
    'Started from the first Now recommendation.',
  );
  await updateSessionEventNote(database, campaignId,
    'Выбрано из первой рекомендации экрана «Сейчас».',
    'Selected from the first Now surface.',
  );
  await updateSessionEventNote(database, campaignId,
    'Завершено из потока экрана «Сейчас».',
    'Completed from the Now session flow.',
  );
  await updateSessionEventNote(database, campaignId,
    'Все видимые шаги текущего узла завершены.',
    'All visible actions on the current node are complete.',
  );
  await updateSessionEventNote(database, campaignId,
    'Главный шаг завершен из потока «Сейчас».',
    'Primary action completed from the Now flow.',
  );
  await updateSessionEventNote(database, campaignId,
    'Шаг отложен до следующего прохода.',
    'Deferred from the Now session flow.',
  );
  await updateSessionEventNote(database, campaignId,
    'Шаг заблокирован из потока «Сейчас».',
    'Blocked from the Now session flow.',
  );
  await updateSessionSummaryNote(database, campaignId,
    'Текущий шаг отложен до следующего прохода.',
    'Current action deferred for a later pass.',
  );
  await updateSessionSummaryNote(database, campaignId,
    'Текущий шаг уперся в барьер.',
    'Current action blocked by a barrier.',
  );
};


const buildWhyNow = (candidate) => {
  const reasons = [];

  if (candidate.dependentCount > 0) {
    reasons.push('Открывает следующее');
  }

  if (candidate.currentRisk === 'high' || isPastDue(candidate.nextDueAt) || isOlderThanDays(candidate.lastTouchedAt, 7)) {
    reasons.push('Давно не трогали');
  }

  if (candidate.importance === 'high' && candidate.dependentCount > 0) {
    reasons.push('Важно для остального');
  }

  if (candidate.isMinimumStep || ['tiny', 'small'].includes(candidate.sizeHint ?? '')) {
    reasons.push('Быстрый шаг');
  }

  if (candidate.actionStatus === 'ready') {
    reasons.push('По силам сейчас');
  }

  return unique(reasons).slice(0, 3);
};

const buildWhatDegrades = (candidate) => {
  if (candidate.currentRisk === 'high' || isPastDue(candidate.nextDueAt)) {
    return 'Если пропустить, станет сложнее вспомнить и вернуться.';
  }

  if (candidate.nodeType === 'project') {
    return 'Если отложить, вход обратно в задачу станет дороже.';
  }

  if (candidate.nodeType === 'habit') {
    return 'Если пропустить, вернуть ритм будет сложнее.';
  }

  if (candidate.dependentCount > 0) {
    return 'Пока этот шаг стоит, следующее не откроется.';
  }

  return 'Без этого шага пропадает ясность, что делать дальше.';
};

const buildScore = (candidate) => {
  let score = 0;

  if (candidate.actionStatus === 'ready') {
    score += 40;
  }

  if (candidate.importance === 'high') {
    score += 30;
  } else if (candidate.importance === 'medium') {
    score += 15;
  }

  if (candidate.currentRisk === 'high') {
    score += 35;
  } else if (candidate.currentRisk === 'medium') {
    score += 20;
  }

  if (isPastDue(candidate.nextDueAt)) {
    score += 20;
  }

  if (isPastDue(candidate.dueAt)) {
    score += 20;
  }

  if (candidate.dependentCount > 0) {
    score += candidate.dependentCount * 12;
  }

  if (candidate.isMinimumStep) {
    score += 15;
  }

  if (['tiny', 'small'].includes(candidate.sizeHint ?? '')) {
    score += 10;
  }

  if (isOlderThanDays(candidate.lastTouchedAt, 7)) {
    score += 10;
  }

  return score;
};

const mapCandidate = (row) => {
  const candidate = {
    actionId: row.action_id,
    actionTitle: row.action_title,
    actionDetails: row.action_details,
    actionStatus: row.action_status,
    sizeHint: row.size_hint,
    isMinimumStep: row.is_minimum_step === 1,
    dueAt: row.due_at,
    nodeId: row.node_id,
    nodeTitle: row.node_title,
    nodeType: row.node_type,
    nodeSummary: row.node_summary,
    nodeStatus: row.node_status,
    importance: row.importance,
    lastTouchedAt: row.last_touched_at,
    sphereName: row.sphere_name,
    directionName: row.direction_name,
    skillName: row.skill_name,
    currentRisk: row.current_risk,
    nextDueAt: row.next_due_at,
    unresolvedDependencies: Number(row.unresolved_dependencies ?? 0),
    dependentCount: Number(row.dependent_count ?? 0),
  };

  return {
    ...candidate,
    score: buildScore(candidate),
    whyNow: buildWhyNow(candidate),
    whatDegrades: buildWhatDegrades(candidate),
  };
};

const rankCandidates = (rows) =>
  rows
    .map(mapCandidate)
    .filter((candidate) => candidate.unresolvedDependencies === 0)
    .sort((left, right) => right.score - left.score || left.actionId - right.actionId);

const loadMetrics = async (database, campaignId) => {
  const metricQueries = [
    ['spheres', 'SELECT COUNT(*) AS count FROM spheres WHERE campaign_id = ?', [campaignId]],
    [
      'directions',
      `
        SELECT COUNT(*) AS count
        FROM directions
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      `,
      [campaignId],
    ],
    [
      'skills',
      `
        SELECT COUNT(*) AS count
        FROM skills
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      `,
      [campaignId],
    ],
    [
      'nodes',
      `
        SELECT COUNT(*) AS count
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
          AND nodes.is_archived = 0
      `,
      [campaignId],
    ],
    [
      'actions',
      `
        SELECT COUNT(*) AS count
        FROM node_actions
        JOIN nodes ON nodes.id = node_actions.node_id
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
          AND node_actions.status IN ('todo', 'ready', 'doing')
      `,
      [campaignId],
    ],
    [
      'dueReviews',
      `
        SELECT COUNT(*) AS count
        FROM review_states
        JOIN nodes ON nodes.id = review_states.node_id
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
          AND (review_states.current_risk = 'high' OR (review_states.next_due_at IS NOT NULL AND review_states.next_due_at <= ?))
      `,
      [campaignId, currentTimestamp()],
    ],
  ];

  const results = await Promise.all(
    metricQueries.map(async ([key, query, params = []]) => [key, countFromRows(await database.select(query, params))]),
  );

  return Object.fromEntries(results);
};

const loadTodaySession = async (database, dailySessionStore, campaignId) => {
  const rows = await database.select(
    `
      SELECT *
      FROM daily_sessions
      WHERE session_date = ?
        AND campaign_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [todayDate(), campaignId],
  );

  const session = rows[0] ?? null;

  if (!session) {
    return null;
  }

  const events = await dailySessionStore.getEventsForSession(session.id);

  return {
    ...session,
    events,
  };
};

const loadActionRecord = async (database, actionId, campaignId = null) => {
  const rows = await database.select(
    `
      SELECT node_actions.*
      FROM node_actions
      JOIN nodes ON nodes.id = node_actions.node_id
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE node_actions.id = ?
        AND (? IS NULL OR spheres.campaign_id = ?)
      LIMIT 1
    `,
    [actionId, campaignId, campaignId],
  );
  return rows[0] ?? null;
};

const loadNodeMetadata = async (database, nodeId, campaignId = null) => {
  const rows = await database.select(
    `
      SELECT
        nodes.*,
        skills.name AS skill_name,
        skills.id AS skill_id,
        skills.primary_stat_id,
        directions.name AS direction_name,
        directions.id AS direction_id,
        spheres.name AS sphere_name
        ,spheres.id AS sphere_id
        ,spheres.campaign_id AS campaign_id
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE nodes.id = ?
        AND (? IS NULL OR spheres.campaign_id = ?)
      LIMIT 1
    `,
    [nodeId, campaignId, campaignId],
  );

  return rows[0] ?? null;
};

const loadNodeActions = (database, nodeId) =>
  database.select(
    `
      SELECT *
      FROM node_actions
      WHERE node_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [nodeId],
  );

const loadDependencies = (database, nodeId) =>
  database.select(
    `
      SELECT
        blocking_nodes.id,
        blocking_nodes.title,
        blocking_nodes.status,
        dependencies.dependency_type
      FROM node_dependencies dependencies
      JOIN nodes blocking_nodes ON blocking_nodes.id = dependencies.blocking_node_id
      WHERE dependencies.blocked_node_id = ?
        AND dependencies.dependency_type = 'requires'
        AND blocking_nodes.is_archived = 0
      ORDER BY blocking_nodes.id ASC
    `,
    [nodeId],
  );

const loadDependents = (database, nodeId) =>
  database.select(
    `
      SELECT
        blocked_nodes.id,
        blocked_nodes.title,
        blocked_nodes.status,
        dependencies.dependency_type
      FROM node_dependencies dependencies
      JOIN nodes blocked_nodes ON blocked_nodes.id = dependencies.blocked_node_id
      WHERE dependencies.blocking_node_id = ?
        AND dependencies.dependency_type = 'requires'
        AND blocked_nodes.is_archived = 0
      ORDER BY blocked_nodes.id ASC
    `,
    [nodeId],
  );

const loadReviewState = async (database, nodeId) => {
  const rows = await database.select('SELECT * FROM review_states WHERE node_id = ? LIMIT 1', [nodeId]);
  return rows[0] ?? null;
};

const loadNodeFocus = async (database, dailySessionStore, nodeId, actionId = null, campaignId = null) => {
  const [node, actions, dependencies, dependents, reviewState, todaySession] = await Promise.all([
    loadNodeMetadata(database, nodeId, campaignId),
    loadNodeActions(database, nodeId),
    loadDependencies(database, nodeId),
    loadDependents(database, nodeId),
    loadReviewState(database, nodeId),
    loadTodaySession(database, dailySessionStore, campaignId),
  ]);

  if (!node) {
    return null;
  }

  const selectedAction =
    actions.find((action) => action.id === actionId) ??
    actions.find((action) => activeActionStatuses.includes(action.status)) ??
    actions[0] ??
    null;

  const completedActions = actions.filter((action) => action.status === 'done').length;
  const totalActions = actions.length;
  const openActions = actions.filter((action) => activeActionStatuses.includes(action.status)).length;

  return {
    node,
    selectedAction,
    actions,
    dependencies,
    dependents,
    reviewState,
    session: todaySession,
    progress: {
      totalActions,
      completedActions,
      openActions,
      completionPercent: totalActions === 0 ? 0 : Math.round((completedActions / totalActions) * 100),
      isCurrentSessionNode: todaySession?.primary_node_id === node.id,
    },
  };
};

const loadHierarchyTree = async (database, campaignId) => {
  const [spheres, directions, skills, nodes] = await Promise.all([
    database.select(
      `
        SELECT
          spheres.*,
          COUNT(DISTINCT nodes.id) AS node_count,
          COUNT(DISTINCT CASE WHEN actions.status IN ('todo', 'ready', 'doing') THEN actions.id END) AS open_action_count
        FROM spheres
        LEFT JOIN directions ON directions.sphere_id = spheres.id
        LEFT JOIN skills ON skills.direction_id = directions.id
        LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
        LEFT JOIN node_actions actions ON actions.node_id = nodes.id
        WHERE spheres.is_archived = 0
          AND spheres.campaign_id = ?
        GROUP BY spheres.id
        ORDER BY spheres.sort_order ASC, spheres.id ASC
      `,
      [campaignId],
    ),
    database.select(
      `
        SELECT
          directions.*,
          COUNT(DISTINCT nodes.id) AS node_count,
          COUNT(DISTINCT CASE WHEN actions.status IN ('todo', 'ready', 'doing') THEN actions.id END) AS open_action_count
        FROM directions
        LEFT JOIN skills ON skills.direction_id = directions.id
        LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
        LEFT JOIN node_actions actions ON actions.node_id = nodes.id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE directions.is_archived = 0
          AND spheres.campaign_id = ?
        GROUP BY directions.id
        ORDER BY directions.sort_order ASC, directions.id ASC
      `,
      [campaignId],
    ),
    database.select(
      `
        SELECT
          skills.*,
          COUNT(DISTINCT nodes.id) AS node_count,
          COUNT(DISTINCT CASE WHEN actions.status IN ('todo', 'ready', 'doing') THEN actions.id END) AS open_action_count
        FROM skills
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
        LEFT JOIN node_actions actions ON actions.node_id = nodes.id
        WHERE skills.is_archived = 0
          AND spheres.campaign_id = ?
        GROUP BY skills.id
        ORDER BY skills.sort_order ASC, skills.id ASC
      `,
      [campaignId],
    ),
    database.select(
      `
        SELECT
          nodes.*,
          skills.name AS skill_name,
          directions.name AS direction_name,
          spheres.name AS sphere_name,
          review_states.current_risk,
          review_states.next_due_at,
          skills.primary_stat_id,
          (
            SELECT COUNT(*)
            FROM node_actions actions
            WHERE actions.node_id = nodes.id
              AND actions.status IN ('todo', 'ready', 'doing')
          ) AS open_action_count,
          (
            SELECT actions.id
            FROM node_actions actions
            WHERE actions.node_id = nodes.id
              AND actions.status IN ('todo', 'ready', 'doing')
            ORDER BY actions.sort_order ASC, actions.id ASC
            LIMIT 1
          ) AS next_action_id,
          (
            SELECT actions.title
            FROM node_actions actions
            WHERE actions.node_id = nodes.id
              AND actions.status IN ('todo', 'ready', 'doing')
            ORDER BY actions.sort_order ASC, actions.id ASC
            LIMIT 1
          ) AS next_action_title
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        LEFT JOIN review_states ON review_states.node_id = nodes.id
        WHERE nodes.is_archived = 0
          AND spheres.campaign_id = ?
        ORDER BY nodes.updated_at DESC, nodes.id ASC
      `,
      [campaignId],
    ),
  ]);

  return spheres.map((sphere) => ({
    ...sphere,
    directions: directions
      .filter((direction) => direction.sphere_id === sphere.id)
      .map((direction) => ({
        ...direction,
        skills: skills
          .filter((skill) => skill.direction_id === direction.id)
          .map((skill) => ({
            ...skill,
            nodes: nodes.filter((node) => node.skill_id === skill.id),
          })),
      })),
  }));
};

const loadActiveGraphEdges = (database, campaignId) =>
  database.select(
    `
      SELECT
        dependencies.id,
        dependencies.blocked_node_id AS source_node_id,
        dependencies.blocking_node_id AS target_node_id,
        dependencies.dependency_type AS edge_type
      FROM node_dependencies dependencies
      JOIN nodes source_nodes ON source_nodes.id = dependencies.blocked_node_id
      JOIN nodes target_nodes ON target_nodes.id = dependencies.blocking_node_id
      JOIN skills source_skills ON source_skills.id = source_nodes.skill_id
      JOIN directions source_directions ON source_directions.id = source_skills.direction_id
      JOIN spheres source_spheres ON source_spheres.id = source_directions.sphere_id
      JOIN skills target_skills ON target_skills.id = target_nodes.skill_id
      JOIN directions target_directions ON target_directions.id = target_skills.direction_id
      JOIN spheres target_spheres ON target_spheres.id = target_directions.sphere_id
      WHERE source_nodes.is_archived = 0
        AND target_nodes.is_archived = 0
        AND source_spheres.campaign_id = ?
        AND target_spheres.campaign_id = ?
      ORDER BY dependencies.id ASC
    `,
    [campaignId, campaignId],
  );

const buildNavigationSnapshot = async (database, campaignId) => {
  const [tree, dashboard, edges] = await Promise.all([
    loadHierarchyTree(database, campaignId),
    createNowServiceContext(database, campaignId).getDashboard(),
    loadActiveGraphEdges(database, campaignId),
  ]);
  const firstNode =
    dashboard.primaryRecommendation != null
      ? { nodeId: dashboard.primaryRecommendation.nodeId, actionId: dashboard.primaryRecommendation.actionId }
      : tree[0]?.directions[0]?.skills[0]?.nodes[0]
        ? {
            nodeId: tree[0].directions[0].skills[0].nodes[0].id,
            actionId: tree[0].directions[0].skills[0].nodes[0].next_action_id ?? null,
          }
        : null;

  return {
    spheres: tree,
    edges,
    defaultSelection: firstNode,
  };
};

const createNowServiceContext = (database, campaignId) => ({
  getDashboard: async () => {
    const [metrics, rawCandidates, todaySession] = await Promise.all([
      loadMetrics(database, campaignId),
      loadCandidateRows(database, campaignId),
      loadTodaySession(database, { getEventsForSession: (sessionId) => database.select('SELECT * FROM daily_session_events WHERE session_id = ? ORDER BY id ASC', [sessionId]) }, campaignId),
    ]);

    const rankedCandidates = rankCandidates(rawCandidates);

    return {
      metrics,
      primaryRecommendation: rankedCandidates[0] ?? null,
      queue: rankedCandidates.slice(1, 1 + MAX_QUEUE_ITEMS),
      todaySession,
    };
  },
});

const ensureActiveSession = async (service, campaignId, actionId) => {
  let session = await loadTodaySession(service.database, service.dailySessionStore, campaignId);

  if (!session || session.status !== 'active') {
    session = await service.startTodaySessionFromRecommendation(campaignId, actionId);
  }

  return session;
};

const finalizeSessionOutcome = async (service, sessionId, timestamp, summaryNote) =>
  service.dailySessionStore.updateSession(sessionId, {
    status: 'completed',
    ended_at: timestamp,
    summary_note: summaryNote,
    updated_at: timestamp,
  });

const refreshOutcomeResult = async (service, campaignId, nodeId, actionId = null, xpGrantResult = null) => ({
  dashboard: await service.getDashboard(campaignId),
  focus: await service.getNodeFocus(campaignId, nodeId, actionId),
  xpWarning: buildXpWarning(xpGrantResult),
});

const navigationContainsNode = (navigation, nodeId) =>
  navigation.spheres.some((sphere) =>
    sphere.directions.some((direction) => direction.skills.some((skill) => skill.nodes.some((node) => node.id === nodeId))),
  );

const findFirstNavigationSelectionInSphere = (navigation, sphereId) => {
  const sphere = navigation.spheres.find((candidate) => candidate.id === sphereId);

  if (!sphere) {
    return null;
  }

  for (const direction of sphere.directions) {
    for (const skill of direction.skills) {
      const node = skill.nodes[0];

      if (node) {
        return { nodeId: node.id, actionId: node.next_action_id ?? null };
      }
    }
  }

  return null;
};

const findNavigationSphereIdForNode = (navigation, node) => {
  if (node?.sphere_id != null) {
    return node.sphere_id;
  }

  if (node?.skill_id == null) {
    return null;
  }

  for (const sphere of navigation.spheres) {
    for (const direction of sphere.directions) {
      if (direction.skills.some((skill) => skill.id === node.skill_id)) {
        return sphere.id;
      }
    }
  }

  return null;
};

const resolveNavigationSelectionAfterNodeMutation = (navigation, node, actionId = null) => {
  if (!node) {
    return navigation.defaultSelection;
  }

  if (!node.is_archived && navigationContainsNode(navigation, node.id)) {
    return { nodeId: node.id, actionId };
  }

  const sphereId = findNavigationSphereIdForNode(navigation, node);

  return findFirstNavigationSelectionInSphere(navigation, sphereId) ?? navigation.defaultSelection;
};

const refreshEditorMutationResult = async (service, campaignId, nodeId, actionId = null) => {
  const [node, dashboard, navigation] = await Promise.all([
    service.getNodeEditorRecord(campaignId, nodeId),
    service.getDashboard(campaignId),
    service.getNavigationSnapshot(campaignId),
  ]);

  if (!node) {
    return null;
  }

  const selection = resolveNavigationSelectionAfterNodeMutation(navigation, node, actionId);
  const focus =
    selection != null ? await service.getNodeFocus(campaignId, selection.nodeId, selection.actionId ?? null) : null;

  return {
    node,
    focus,
    dashboard,
    navigation,
    selection: selection != null ? { nodeId: selection.nodeId, actionId: focus?.selectedAction?.id ?? selection.actionId ?? null } : null,
  };
};

const refreshGraphMutationResult = async (service, campaignId, edge, preferredNodeId = null) => {
  const navigation = await service.getNavigationSnapshot(campaignId);
  const selection =
    preferredNodeId != null && navigationContainsNode(navigation, preferredNodeId)
      ? { nodeId: preferredNodeId, actionId: null }
      : navigation.defaultSelection;
  const focus =
    selection != null ? await service.getNodeFocus(campaignId, selection.nodeId, selection.actionId ?? null) : null;

  return {
    edge,
    navigation,
    focus,
    selection,
  };
};

const loadCandidateRows = (database, campaignId) =>
  database.select(
    `
      SELECT
        actions.id AS action_id,
        actions.title AS action_title,
        actions.details AS action_details,
        actions.status AS action_status,
        actions.size_hint,
        actions.is_minimum_step,
        actions.due_at,
        nodes.id AS node_id,
        nodes.title AS node_title,
        nodes.type AS node_type,
        nodes.status AS node_status,
        nodes.summary AS node_summary,
        nodes.importance,
        nodes.last_touched_at,
        skills.name AS skill_name,
        skills.primary_stat_id,
        directions.name AS direction_name,
        spheres.name AS sphere_name,
        review_states.current_risk,
        review_states.next_due_at,
        (
          SELECT COUNT(*)
          FROM node_dependencies dependencies
          JOIN nodes blocking_nodes ON blocking_nodes.id = dependencies.blocking_node_id
          WHERE dependencies.blocked_node_id = nodes.id
            AND dependencies.dependency_type = 'requires'
            AND blocking_nodes.status != 'done'
        ) AS unresolved_dependencies,
        (
          SELECT COUNT(*)
          FROM node_dependencies dependencies
          JOIN nodes blocked_nodes ON blocked_nodes.id = dependencies.blocked_node_id
          WHERE dependencies.blocking_node_id = nodes.id
            AND dependencies.dependency_type = 'requires'
            AND blocked_nodes.status != 'done'
        ) AS dependent_count
      FROM node_actions actions
      JOIN nodes ON nodes.id = actions.node_id
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      LEFT JOIN review_states ON review_states.node_id = nodes.id
      WHERE nodes.is_archived = 0
        AND spheres.campaign_id = ?
        AND nodes.status IN ('active', 'paused')
        AND actions.status IN ('todo', 'ready', 'doing')
      ORDER BY actions.id ASC
    `,
    [campaignId],
  );

const loadPersistentBarrierNotes = async (nodeNoteStore, nodeId) => nodeNoteStore.listBarrierNotesForNode(nodeId, { openOnly: true });

const loadPersistentErrorNotes = async (nodeNoteStore, nodeId) => nodeNoteStore.listErrorNotesForNode(nodeId, { openOnly: true });

const mapNoteKindToJournalEventType = (noteKind) => {
  if (noteKind === 'shrink') {
    return 'shrunk';
  }

  if (noteKind === 'defer') {
    return 'deferred';
  }

  return noteKind;
};

const buildJournalSnapshotFromNotes = async (database, nodeNoteStore, campaignId) => {
  const [barrierNotes, errorNotes] = await Promise.all([
    nodeNoteStore.listRecentBarrierNotes(40),
    nodeNoteStore.listRecentErrorNotes(40),
  ]);

  const enrichRows = async (rows, type) => {
    const enriched = await Promise.all(
      rows.map(async (row) => {
        const [node] = await database.select('SELECT id, title, status FROM nodes WHERE id = ?', [row.node_id]);
        const [action] = row.action_id != null ? await database.select('SELECT id, title FROM node_actions WHERE id = ?', [row.action_id]) : [null];

        return {
          id: row.id,
          sourceType: type,
          eventType: type === 'barrier' ? 'blocked' : mapNoteKindToJournalEventType(row.note_kind),
          note: row.note,
          occurredAt: row.updated_at,
          nodeId: row.node_id,
          nodeTitle: node?.title ?? 'Unknown node',
          nodeStatus: node?.status ?? 'unknown',
          actionId: action?.id ?? null,
          actionTitle: action?.title ?? null,
          barrierType: type === 'barrier' ? row.barrier_type : null,
        };
      }),
    );

    return enriched;
  };

  const belongsToCampaign = async (row) => {
    const [node] = await database.select(
      `
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE nodes.id = ?
          AND spheres.campaign_id = ?
        LIMIT 1
      `,
      [row.node_id, campaignId],
    );
    return node != null;
  };

  const scopedBarrierNotes = [];
  for (const row of barrierNotes) {
    if (await belongsToCampaign(row)) scopedBarrierNotes.push(row);
  }

  const scopedErrorNotes = [];
  for (const row of errorNotes) {
    if (await belongsToCampaign(row)) scopedErrorNotes.push(row);
  }

  const [barrierEntries, errorEntries] = await Promise.all([
    enrichRows(scopedBarrierNotes, 'barrier'),
    enrichRows(scopedErrorNotes, 'error'),
  ]);

  const adjustmentEntries = errorEntries.filter((entry) => ['shrunk', 'deferred', 'error', 'follow_up'].includes(entry.eventType));

  const barrierSummary = BARRIER_TYPES.map((barrierType) => ({
    barrierType,
    count: barrierEntries.filter((entry) => entry.barrierType === barrierType).length,
  })).filter((item) => item.count > 0);

  const hotspots = Object.values(
    [...barrierEntries, ...adjustmentEntries].reduce((accumulator, incident) => {
      const key = String(incident.nodeId);

      if (!accumulator[key]) {
        accumulator[key] = {
          nodeId: incident.nodeId,
          nodeTitle: incident.nodeTitle,
          incidentCount: 0,
          blockedCount: 0,
          shrunkCount: 0,
          deferredCount: 0,
          latestOccurredAt: incident.occurredAt,
        };
      }

      accumulator[key].incidentCount += 1;
      accumulator[key].latestOccurredAt = accumulator[key].latestOccurredAt > incident.occurredAt ? accumulator[key].latestOccurredAt : incident.occurredAt;

      if (incident.eventType === 'blocked') accumulator[key].blockedCount += 1;
      if (incident.eventType === 'shrunk') accumulator[key].shrunkCount += 1;
      if (incident.eventType === 'deferred') accumulator[key].deferredCount += 1;

      return accumulator;
    }, {}),
  )
    .sort((left, right) => right.incidentCount - left.incidentCount || right.latestOccurredAt.localeCompare(left.latestOccurredAt))
    .slice(0, 6);

  return {
    barrierSummary,
    barrierEntries,
    adjustmentEntries,
    hotspots,
  };
};

const getNextActionSortOrder = async (database, nodeId) => {
  const rows = await database.select('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order FROM node_actions WHERE node_id = ?', [nodeId]);
  return Number(rows[0]?.next_sort_order ?? 0);
};

const findFirstCampaignStatId = async (database, campaignId) => {
  const rows = await database.select(
    `
      SELECT id
      FROM campaign_stats
      WHERE campaign_id = ?
        AND is_archived = 0
      ORDER BY sort_order ASC, id ASC
      LIMIT 1
    `,
    [campaignId],
  );
  return rows[0]?.id ?? null;
};

const levelFromXp = (xp) => {
  if (xp >= 700) return 5 + Math.floor((xp - 700) / 300);
  if (xp >= 450) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
};

const nextLevelXp = (level) => {
  if (level <= 1) return 100;
  if (level === 2) return 250;
  if (level === 3) return 450;
  if (level === 4) return 700;
  return 700 + (level - 4) * 300;
};

const buildWindRoseSnapshot = async (database, campaignId) => {
  const [stats, branches] = await Promise.all([
    database.select(
      `
        SELECT
          campaign_stats.*,
          COALESCE(SUM(CASE WHEN grants.active = 1 THEN grants.xp_amount ELSE 0 END), 0) AS xp
        FROM campaign_stats
        LEFT JOIN stat_xp_grants grants ON grants.stat_id = campaign_stats.id
        WHERE campaign_stats.campaign_id = ?
          AND campaign_stats.is_archived = 0
        GROUP BY campaign_stats.id
        ORDER BY campaign_stats.sort_order ASC, campaign_stats.id ASC
      `,
      [campaignId],
    ),
    database.select(
      `
        SELECT
          skills.id,
          skills.name,
          skills.primary_stat_id,
          COUNT(DISTINCT nodes.id) AS node_count,
          COUNT(DISTINCT CASE WHEN nodes.status = 'done' THEN nodes.id END) AS done_node_count,
          (
            SELECT nodes_inner.id
            FROM nodes nodes_inner
            WHERE nodes_inner.skill_id = skills.id
              AND nodes_inner.is_archived = 0
            ORDER BY
              CASE WHEN nodes_inner.status IN ('active', 'paused') THEN 0 ELSE 1 END ASC,
              nodes_inner.updated_at DESC,
              nodes_inner.id ASC
            LIMIT 1
          ) AS focus_node_id,
          (
            SELECT actions.id
            FROM node_actions actions
            JOIN nodes nodes_inner ON nodes_inner.id = actions.node_id
            WHERE nodes_inner.skill_id = skills.id
              AND nodes_inner.is_archived = 0
              AND actions.status IN ('todo', 'ready', 'doing')
            ORDER BY actions.sort_order ASC, actions.id ASC
            LIMIT 1
          ) AS next_action_id
        FROM skills
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
        WHERE spheres.campaign_id = ?
          AND skills.is_archived = 0
        GROUP BY skills.id
        ORDER BY skills.sort_order ASC, skills.id ASC
      `,
      [campaignId],
    ),
  ]);

  return {
    campaignId,
    stats: stats.map((stat) => {
      const xp = Number(stat.xp ?? 0);
      const level = levelFromXp(xp);
      const nextXp = nextLevelXp(level);
      return {
        ...stat,
        xp,
        level,
        nextLevelXp: nextXp,
        progressToNext: nextXp <= 0 ? 0 : Math.min(100, Math.round((xp / nextXp) * 100)),
        branches: branches.filter((branch) => branch.primary_stat_id === stat.id),
      };
    }),
    unassignedBranches: branches.filter((branch) => branch.primary_stat_id == null),
  };
};

export const createNowService = ({ database, hierarchyStore, reviewStateStore, dailySessionStore, nodeNoteStore }) => {
  const starterLocalizationPromises = new Map();

  const ensureStarterLocalization = async (campaignId) => {
    if (!campaignId) {
      return;
    }

    if (!starterLocalizationPromises.has(campaignId)) {
      const promise = localizeStarterWorkspace(database, campaignId).catch((error) => {
        starterLocalizationPromises.delete(campaignId);
        throw error;
      });
      starterLocalizationPromises.set(campaignId, promise);
    }

    return starterLocalizationPromises.get(campaignId);
  };

  return {
    database,
    hierarchyStore,
    reviewStateStore,
    dailySessionStore,
    nodeNoteStore,

  async getDashboard(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await ensureStarterLocalization(resolvedCampaignId);

    const [metrics, rawCandidates, todaySession] = await Promise.all([
      loadMetrics(database, resolvedCampaignId),
      loadCandidateRows(database, resolvedCampaignId),
      loadTodaySession(database, dailySessionStore, resolvedCampaignId),
    ]);

    const rankedCandidates = rankCandidates(rawCandidates);

    return {
      metrics,
      primaryRecommendation: rankedCandidates[0] ?? null,
      queue: rankedCandidates.slice(1, 1 + MAX_QUEUE_ITEMS),
      todaySession,
    };
  },

  async getNodeFocus(campaignId, nodeId, actionId = null) {
    if (arguments.length <= 2) {
      actionId = nodeId ?? null;
      nodeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await ensureStarterLocalization(resolvedCampaignId);

    const focus = await loadNodeFocus(database, dailySessionStore, nodeId, actionId, resolvedCampaignId);

    if (!focus) {
      return null;
    }

    const [barrierNotes, errorNotes] = await Promise.all([
      loadPersistentBarrierNotes(nodeNoteStore, nodeId),
      loadPersistentErrorNotes(nodeNoteStore, nodeId),
    ]);

    return {
      ...focus,
      barrierNotes,
      errorNotes,
    };
  },

  async getNavigationSnapshot(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await ensureStarterLocalization(resolvedCampaignId);

    return buildNavigationSnapshot(database, resolvedCampaignId);
  },

  async getNodeEditorRecord(campaignId, nodeId) {
    if (arguments.length === 1) {
      nodeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    return loadNodeMetadata(database, nodeId, resolvedCampaignId);
  },

  async createNodeEditor(campaignId, payload) {
    if (arguments.length === 1) {
      payload = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertSkillInCampaign(database, payload.skill_id, resolvedCampaignId);
    const node = await hierarchyStore.createNode(payload);

    if (!node) {
      return null;
    }

    const nodeCampaignId = await findNodeCampaignId(database, node.id);
    if (nodeCampaignId !== resolvedCampaignId) {
      throw new Error('Новый узел создан вне выбранной кампании.');
    }

    return refreshEditorMutationResult(this, resolvedCampaignId, node.id);
  },

  async updateNodeEditor(campaignId, nodeId, payload) {
    if (arguments.length === 2) {
      payload = nodeId;
      nodeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const before = await loadNodeMetadata(database, nodeId, resolvedCampaignId);
    if (!before) {
      return null;
    }
    const node = await hierarchyStore.updateNode(nodeId, payload);

    if (!node) {
      return null;
    }

    if (before.status !== node.status && (before.status === 'done' || node.status === 'done')) {
      await syncNodeCompletionXpGrant(database, node.id, node.status);
    }

    return refreshEditorMutationResult(this, resolvedCampaignId, node.id);
  },

  async archiveNodeEditor(campaignId, nodeId, payload = {}) {
    if (arguments.length <= 2) {
      payload = nodeId ?? {};
      nodeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const before = await loadNodeMetadata(database, nodeId, resolvedCampaignId);
    if (!before) {
      return null;
    }
    const node = await hierarchyStore.archiveNode(nodeId, payload);

    if (!node) {
      return null;
    }

    return refreshEditorMutationResult(this, resolvedCampaignId, node.id);
  },

  async duplicateNodeEditor(campaignId, nodeId, payload = {}) {
    if (arguments.length <= 2) {
      payload = nodeId ?? {};
      nodeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const before = await loadNodeMetadata(database, nodeId, resolvedCampaignId);
    if (!before) {
      return null;
    }
    await assertSkillInCampaign(database, payload.skill_id ?? before.skill_id, resolvedCampaignId);
    const node = await hierarchyStore.duplicateNode(nodeId, payload);

    if (!node) {
      return null;
    }

    return refreshEditorMutationResult(this, resolvedCampaignId, node.id);
  },

  async createGraphEdge(campaignId, payload) {
    if (arguments.length === 1) {
      payload = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const [sourceCampaignId, targetCampaignId] = await Promise.all([
      findNodeCampaignId(database, payload.blocked_node_id),
      findNodeCampaignId(database, payload.blocking_node_id),
    ]);

    if (sourceCampaignId !== resolvedCampaignId || targetCampaignId !== resolvedCampaignId) {
      throw new Error('Связь можно создать только внутри выбранной кампании.');
    }

    const edge = await hierarchyStore.addNodeDependency(payload);

    if (!edge) {
      return null;
    }

    return refreshGraphMutationResult(this, resolvedCampaignId, edge, payload?.blocked_node_id ?? edge.blocked_node_id);
  },

  async updateGraphEdge(campaignId, edgeId, payload) {
    if (arguments.length === 2) {
      payload = edgeId;
      edgeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const current = await loadEdgeBoundary(database, edgeId);
    if (!current) {
      return null;
    }
    assertEdgeInCampaign(current, resolvedCampaignId);
    await assertEdgeEndpointsInCampaign(
      database,
      {
        blocked_node_id: payload.blocked_node_id ?? current.blocked_node_id,
        blocking_node_id: payload.blocking_node_id ?? current.blocking_node_id,
      },
      resolvedCampaignId,
    );
    const edge = await hierarchyStore.updateNodeDependency(edgeId, payload);

    if (!edge) {
      return null;
    }

    return refreshGraphMutationResult(this, resolvedCampaignId, edge, edge.blocked_node_id);
  },

  async deleteGraphEdge(campaignId, edgeId) {
    if (arguments.length === 1) {
      edgeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const current = await loadEdgeBoundary(database, edgeId);
    if (!current) {
      return null;
    }
    assertEdgeInCampaign(current, resolvedCampaignId);
    const edge = await hierarchyStore.deleteNodeDependency(edgeId);

    if (!edge) {
      return null;
    }

    return refreshGraphMutationResult(this, resolvedCampaignId, edge, edge.blocked_node_id);
  },

  async getJournalSnapshot(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    return buildJournalSnapshotFromNotes(database, nodeNoteStore, resolvedCampaignId);
  },

  async getWindRoseSnapshot(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    return buildWindRoseSnapshot(database, resolvedCampaignId);
  },

  async createJournalFollowUpStep(campaignId, { nodeId, title = '', note = '', barrierType = null } = {}) {
    if (arguments.length === 1) {
      ({ nodeId, title = '', note = '', barrierType = null } = campaignId ?? {});
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const node = await loadNodeMetadata(database, nodeId, resolvedCampaignId);

    if (!node) {
      return null;
    }

    const sortOrder = await getNextActionSortOrder(database, nodeId);
    const resolvedTitle = title.trim() || (barrierType ? `Разобрать барьер: ${barrierType}` : `Следующий шаг: ${node.title}`);
    const details = [
      barrierType ? `Барьер: ${barrierType}.` : null,
      note?.trim() || null,
      'Создано из журнала.',
    ]
      .filter(Boolean)
      .join(' ');

    const action = await hierarchyStore.createNodeAction({
      node_id: nodeId,
      title: resolvedTitle,
      details,
      status: 'ready',
      size_hint: 'tiny',
      sort_order: sortOrder,
      is_minimum_step: 1,
    });

    await nodeNoteStore.createErrorNote({
      node_id: nodeId,
      action_id: action.id,
      note_kind: 'follow_up',
      note: details,
    });

    return {
      dashboard: await this.getDashboard(resolvedCampaignId),
      focus: await this.getNodeFocus(resolvedCampaignId, nodeId, action.id),
      createdAction: action,
    };
  },

  async createStarterWorkspace(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const existingStarterNodes = await database.select(
      `
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE nodes.slug = ?
          AND spheres.campaign_id = ?
        LIMIT 1
      `,
      [STARTER_SLUGS.primaryNode, resolvedCampaignId],
    );

    if (existingStarterNodes.length > 0) {
      return this.getDashboard(resolvedCampaignId);
    }

    const sphere = await hierarchyStore.createSphere({
      campaign_id: resolvedCampaignId,
      name: 'Работа',
      slug: STARTER_SLUGS.sphere,
      description: 'Стартовый контур новой системы.',
    });
    const direction = await hierarchyStore.createDirection({
      sphere_id: sphere.id,
      name: 'Развитие BrainGainz',
      slug: STARTER_SLUGS.direction,
      description: 'Ближайший продуктовый цикл.',
    });
    const primaryStatId = await findFirstCampaignStatId(database, resolvedCampaignId);
    const skill = await hierarchyStore.createSkill({
      direction_id: direction.id,
      primary_stat_id: primaryStatId,
      name: 'Продуктовый цикл',
      slug: STARTER_SLUGS.skill,
      description: 'Новый рабочий контур поверх старого приложения.',
    });

    const primaryNode = await hierarchyStore.createNode({
      skill_id: skill.id,
      type: 'project',
      title: 'Собрать первый экран «Сейчас»',
      slug: STARTER_SLUGS.primaryNode,
      summary: 'Показать один понятный следующий шаг без поломки старого режима.',
      x: 0,
      y: -220,
      importance: 'high',
    });
    await hierarchyStore.createNodeAction({
      node_id: primaryNode.id,
      title: 'Проверить первый шаг и запустить сессию',
      details: 'Использовать экран «Сейчас» как основную точку входа.',
      status: 'ready',
      size_hint: 'tiny',
      is_minimum_step: 1,
    });
    await reviewStateStore.save({
      node_id: primaryNode.id,
      review_profile: 'project',
      current_risk: 'high',
      next_due_at: currentTimestamp(),
    });

    const blockedNode = await hierarchyStore.createNode({
      skill_id: skill.id,
      type: 'theory',
      title: 'Сделать короткие причины выбора',
      slug: STARTER_SLUGS.blockedNode,
      summary: 'Сократить и прояснить объяснение выбора.',
      x: 220,
      y: 80,
      importance: 'medium',
    });
    await hierarchyStore.createNodeAction({
      node_id: blockedNode.id,
      title: 'Сделать короткий текст для причин выбора',
      details: 'Оставить только ясные и короткие причины.',
      status: 'ready',
      size_hint: 'small',
      is_minimum_step: 1,
    });
    await hierarchyStore.addNodeDependency({
      blocked_node_id: blockedNode.id,
      blocking_node_id: primaryNode.id,
    });

    const maintenanceNode = await hierarchyStore.createNode({
      skill_id: skill.id,
      type: 'maintenance',
      title: 'Не сломать старый режим карточек',
      slug: STARTER_SLUGS.maintenanceNode,
      summary: 'Словарь и повторение должны остаться рабочими.',
      x: -220,
      y: 80,
      importance: 'high',
    });
    await hierarchyStore.createNodeAction({
      node_id: maintenanceNode.id,
      title: 'Быстро проверить старый словарь',
      details: 'Проверить импорт, редактирование и повторение после изменений UI.',
      status: 'todo',
      size_hint: 'small',
      is_minimum_step: 1,
    });

    return this.getDashboard(resolvedCampaignId);
  },

  async createStructureWorkspace(campaignId = null, { name } = {}) {
    if (arguments.length === 1 && typeof campaignId === 'object') {
      ({ name } = campaignId ?? {});
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const title = String(name ?? '').trim();
    if (!title) {
      throw new Error('Название структуры обязательно.');
    }

    const timestamp = currentTimestamp();
    const baseSlug = slugify(title);
    const suffix = Date.now().toString(36);
    const sphereSlug = `${baseSlug}-${suffix}`;
    const directionSlug = `${sphereSlug}-map`;
    const skillSlug = `${sphereSlug}-graph`;
    const rootSlug = `${sphereSlug}-root`;

    const sphere = await hierarchyStore.createSphere({
      campaign_id: resolvedCampaignId,
      name: title,
      slug: sphereSlug,
      description: 'Пользовательская учебная структура.',
      created_at: timestamp,
      updated_at: timestamp,
    });
    const direction = await hierarchyStore.createDirection({
      sphere_id: sphere.id,
      name: 'Карта обучения',
      slug: directionSlug,
      description: 'Ручная сборка учебного графа.',
      created_at: timestamp,
      updated_at: timestamp,
    });
    const primaryStatId = await findFirstCampaignStatId(database, resolvedCampaignId);
    const skill = await hierarchyStore.createSkill({
      direction_id: direction.id,
      primary_stat_id: primaryStatId,
      name: 'Граф курса',
      slug: skillSlug,
      description: 'Узлы и связи, созданные через карту.',
      created_at: timestamp,
      updated_at: timestamp,
    });
    const rootNode = await hierarchyStore.createNode({
      skill_id: skill.id,
      type: 'project',
      status: 'active',
      title,
      slug: rootSlug,
      summary: 'Корень учебной структуры.',
      completion_criteria: null,
      x: -260,
      y: 0,
      importance: 'high',
      created_at: timestamp,
      updated_at: timestamp,
    });

    await hierarchyStore.createNodeAction({
      node_id: rootNode.id,
      title: `Уточнить структуру: ${title}`,
      details: 'Добавить разделы, темы и атомарные учебные шаги через карту.',
      status: 'ready',
      size_hint: 'small',
      sort_order: 0,
      is_minimum_step: 1,
    });

    return this.getDashboard(resolvedCampaignId);
  },

  async createLinearAlgebraGraphWorkspace(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const timestamp = currentTimestamp();

    const existingSphere = await database.select('SELECT * FROM spheres WHERE slug = ? AND campaign_id = ? LIMIT 1', [
      LINEAR_ALGEBRA_GRAPH_SLUGS.sphere,
      resolvedCampaignId,
    ]);
    const sphere =
      existingSphere[0] ??
      (await hierarchyStore.createSphere({
        campaign_id: resolvedCampaignId,
        name: 'Алгебра I',
        slug: LINEAR_ALGEBRA_GRAPH_SLUGS.sphere,
        description: 'Иерархический граф курса линейной алгебры.',
      }));

    await database.execute(
      `
        UPDATE spheres
        SET campaign_id = ?, name = ?, description = ?, is_archived = 0, updated_at = ?
        WHERE id = ?
      `,
      [resolvedCampaignId, sphere.name, 'Иерархический граф курса линейной алгебры.', timestamp, sphere.id],
    );

    const existingDirection = await database.select('SELECT * FROM directions WHERE slug = ? AND sphere_id = ? LIMIT 1', [
      LINEAR_ALGEBRA_GRAPH_SLUGS.direction,
      sphere.id,
    ]);
    const direction =
      existingDirection[0] ??
      (await hierarchyStore.createDirection({
        sphere_id: sphere.id,
        name: 'Линейная алгебра',
        slug: LINEAR_ALGEBRA_GRAPH_SLUGS.direction,
        description: 'СЛУ, матрицы, определители, пространства, структуры, многочлены и дроби.',
      }));

    await database.execute(
      `
        UPDATE directions
        SET sphere_id = ?, name = ?, description = ?, is_archived = 0, updated_at = ?
        WHERE id = ?
      `,
      [
        sphere.id,
        'Линейная алгебра',
        'СЛУ, матрицы, определители, пространства, структуры, многочлены и дроби.',
        timestamp,
        direction.id,
      ],
    );

    const existingSkill = await database.select('SELECT * FROM skills WHERE slug = ? AND direction_id = ? LIMIT 1', [
      LINEAR_ALGEBRA_GRAPH_SLUGS.skill,
      direction.id,
    ]);
    const primaryStatId = await findFirstCampaignStatId(database, resolvedCampaignId);
    const skill =
      existingSkill[0] ??
      (await hierarchyStore.createSkill({
        direction_id: direction.id,
        primary_stat_id: primaryStatId,
        name: 'Карта курса',
        slug: LINEAR_ALGEBRA_GRAPH_SLUGS.skill,
        description: 'Скелет учебного графа без внутренних материалов.',
      }));

    await database.execute(
      `
        UPDATE skills
        SET direction_id = ?, primary_stat_id = COALESCE(primary_stat_id, ?), name = ?, description = ?, is_archived = 0, updated_at = ?
        WHERE id = ?
      `,
      [direction.id, primaryStatId, 'Карта курса', 'Скелет учебного графа без внутренних материалов.', timestamp, skill.id],
    );

    const nodesByKey = new Map();

    for (const [index, item] of LINEAR_ALGEBRA_GRAPH_NODES.entries()) {
      const existingNode = await database.select('SELECT * FROM nodes WHERE slug = ? AND skill_id = ? LIMIT 1', [item.slug, skill.id]);
      const existing = existingNode[0] ?? null;
      let node = existing;

      if (existing) {
        await database.execute(
          `
            UPDATE nodes
            SET skill_id = ?, title = ?, type = ?, status = ?, x = ?, y = ?, importance = ?, is_archived = 0, updated_at = ?
            WHERE id = ?
          `,
          [
            skill.id,
            item.title,
            item.type,
            'active',
            item.x,
            item.y,
            item.key === 'root' ? 'high' : 'medium',
            timestamp,
            existing.id,
          ],
        );
        node = { ...existing, skill_id: skill.id, id: existing.id };
      } else {
        node = await hierarchyStore.createNode({
          skill_id: skill.id,
          type: item.type,
          status: 'active',
          title: item.title,
          slug: item.slug,
          summary: null,
          x: item.x,
          y: item.y,
          importance: item.key === 'root' ? 'high' : 'medium',
          created_at: new Date(Date.now() + index).toISOString(),
          updated_at: new Date(Date.now() + index).toISOString(),
        });
      }

      nodesByKey.set(item.key, node);
    }

    const rootNode = nodesByKey.get('root');
    if (rootNode) {
      const existingRootAction = await database.select(
        'SELECT id FROM node_actions WHERE node_id = ? AND title = ? LIMIT 1',
        [rootNode.id, 'Проверить и уточнить каркас курса'],
      );

      if (existingRootAction.length === 0) {
        await hierarchyStore.createNodeAction({
          node_id: rootNode.id,
          title: 'Проверить и уточнить каркас курса',
          details: 'Пройтись по крупным веткам и отметить, где нужны подузлы или перестановка.',
          status: 'ready',
          size_hint: 'small',
          sort_order: 0,
          is_minimum_step: 1,
        });
      }
    }

    for (const item of LINEAR_ALGEBRA_GRAPH_NODES) {
      if (!item.parent) {
        continue;
      }

      const parent = nodesByKey.get(item.parent);
      const child = nodesByKey.get(item.key);

      if (!parent || !child) {
        continue;
      }

      const existingEdge = await database.select(
        `
          SELECT id
          FROM node_dependencies
          WHERE blocked_node_id = ?
            AND blocking_node_id = ?
            AND dependency_type = 'supports'
          LIMIT 1
        `,
        [parent.id, child.id],
      );

      if (existingEdge.length > 0) {
        continue;
      }

      await hierarchyStore.addNodeDependency({
        blocked_node_id: parent.id,
        blocking_node_id: child.id,
        dependency_type: 'supports',
      });
    }

    return this.getDashboard(resolvedCampaignId);
  },

  async startTodaySessionFromPrimaryRecommendation(campaignId = null) {
    return this.startTodaySessionFromRecommendation(campaignId, null);
  },

  async startTodaySessionFromRecommendation(campaignId = null, actionId = null) {
    if (arguments.length === 1) {
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const dashboard = await this.getDashboard(resolvedCampaignId);
    const candidates = [dashboard.primaryRecommendation, ...dashboard.queue].filter(Boolean);
    const targetRecommendation = candidates.find((candidate) => candidate.actionId === actionId) ?? dashboard.primaryRecommendation;

    if (!targetRecommendation) {
      return null;
    }

    if (dashboard.todaySession?.status === 'active') {
      return dashboard.todaySession;
    }

    const timestamp = currentTimestamp();

    if (targetRecommendation.actionStatus !== 'done') {
      await hierarchyStore.updateNodeAction(targetRecommendation.actionId, {
        status: 'doing',
        completed_at: null,
        updated_at: timestamp,
      });
    }

    await hierarchyStore.updateNode(targetRecommendation.nodeId, {
      last_touched_at: timestamp,
      updated_at: timestamp,
    });

    const session = await dailySessionStore.createSession({
      campaign_id: resolvedCampaignId,
      session_date: todayDate(),
      status: 'active',
      primary_node_id: targetRecommendation.nodeId,
      primary_action_id: targetRecommendation.actionId,
      started_at: timestamp,
      summary_note: 'Запущено с первой рекомендации экрана «Сейчас».',
    });

    await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'selected',
      node_id: targetRecommendation.nodeId,
      action_id: targetRecommendation.actionId,
      note: 'Выбрано из первой рекомендации экрана «Сейчас».',
    });

    return loadTodaySession(database, dailySessionStore, resolvedCampaignId);
  },

  async completeActionInTodaySession(campaignId, actionId) {
    if (arguments.length === 1) {
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const action = await loadActionRecord(database, actionId, resolvedCampaignId);

    if (!action) {
      return null;
    }

    let session = await ensureActiveSession(this, resolvedCampaignId, actionId);

    const timestamp = currentTimestamp();
    let xpGrantResult = null;

    if (action.status !== 'done') {
      await hierarchyStore.updateNodeAction(actionId, {
        status: 'done',
        completed_at: timestamp,
        updated_at: timestamp,
      });
    }

    await hierarchyStore.updateNode(action.node_id, {
      last_touched_at: timestamp,
      updated_at: timestamp,
    });

    await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'completed',
      node_id: action.node_id,
      action_id: action.id,
      note: 'Завершено из потока экрана «Сейчас».',
      occurred_at: timestamp,
    });

    const remainingRows = await database.select(
      `
        SELECT COUNT(*) AS count
        FROM node_actions
        WHERE node_id = ?
          AND status IN ('todo', 'ready', 'doing')
      `,
      [action.node_id],
    );

    const remainingOpenActions = countFromRows(remainingRows);

    if (remainingOpenActions === 0) {
      await hierarchyStore.updateNode(action.node_id, {
        status: 'done',
        last_touched_at: timestamp,
        updated_at: timestamp,
      });
      xpGrantResult = await syncNodeCompletionXpGrant(database, action.node_id, 'done', timestamp);
    }

    if (session.status === 'active') {
      await finalizeSessionOutcome(
        this,
        session.id,
        timestamp,
        remainingOpenActions === 0
          ? 'Все видимые шаги текущего узла завершены.'
          : 'Главный шаг завершен из потока «Сейчас».',
      );
    }

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id, xpGrantResult);
  },

  async deferActionInTodaySession(campaignId, actionId, note = '') {
    if (arguments.length <= 2) {
      note = actionId ?? '';
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const action = await loadActionRecord(database, actionId, resolvedCampaignId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, resolvedCampaignId, actionId);
    const timestamp = currentTimestamp();

    await hierarchyStore.updateNodeAction(actionId, {
      status: 'ready',
      completed_at: null,
      updated_at: timestamp,
    });

    await hierarchyStore.updateNode(action.node_id, {
      status: 'active',
      last_touched_at: timestamp,
      updated_at: timestamp,
    });
    await syncNodeCompletionXpGrant(database, action.node_id, 'active', timestamp);

    const event = await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'deferred',
      node_id: action.node_id,
      action_id: action.id,
      note: note?.trim() || 'Шаг отложен до следующего прохода.',
      occurred_at: timestamp,
    });

    await nodeNoteStore.createErrorNote({
      node_id: action.node_id,
      action_id: action.id,
      note_kind: 'defer',
      note: event.note,
      source_event_id: event.id,
    });

    if (session.status === 'active') {
      await finalizeSessionOutcome(this, session.id, timestamp, 'Текущий шаг отложен до следующего прохода.');
    }

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id);
  },

  async blockActionInTodaySession(campaignId, actionId, { barrierType = null, note = '' } = {}) {
    if (arguments.length <= 2) {
      ({ barrierType = null, note = '' } = actionId ?? {});
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const action = await loadActionRecord(database, actionId, resolvedCampaignId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, resolvedCampaignId, actionId);
    const timestamp = currentTimestamp();
    const normalizedBarrier = BARRIER_TYPES.includes(barrierType) ? barrierType : null;
    const eventNote = [normalizedBarrier ? `Барьер: ${normalizedBarrier}.` : null, note?.trim() || null]
      .filter(Boolean)
      .join(' ');

    await hierarchyStore.updateNodeAction(actionId, {
      status: 'todo',
      completed_at: null,
      updated_at: timestamp,
    });

    await hierarchyStore.updateNode(action.node_id, {
      status: 'paused',
      last_touched_at: timestamp,
      updated_at: timestamp,
    });
    await syncNodeCompletionXpGrant(database, action.node_id, 'paused', timestamp);

    const event = await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'blocked',
      node_id: action.node_id,
      action_id: action.id,
      note: eventNote || 'Шаг заблокирован из потока «Сейчас».',
      occurred_at: timestamp,
    });

    await nodeNoteStore.createBarrierNote({
      node_id: action.node_id,
      action_id: action.id,
      barrier_type: normalizedBarrier ?? 'unclear next step',
      note: event.note,
      source_event_id: event.id,
    });

    if (session.status === 'active') {
      await finalizeSessionOutcome(this, session.id, timestamp, eventNote || 'Текущий шаг уперся в барьер.');
    }

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id);
  },

  async shrinkActionInTodaySession(campaignId, actionId, { title = '', note = '' } = {}) {
    if (arguments.length <= 2) {
      ({ title = '', note = '' } = actionId ?? {});
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const action = await loadActionRecord(database, actionId, resolvedCampaignId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, resolvedCampaignId, actionId);
    const timestamp = currentTimestamp();
    const smallerStepTitle = title?.trim() || `Smaller step: ${action.title}`;
    const smallerStep = await hierarchyStore.createNodeAction({
      node_id: action.node_id,
      title: smallerStepTitle,
      details: [
        `Shrunk from: ${action.title}.`,
        note?.trim() || null,
      ]
        .filter(Boolean)
        .join(' '),
      status: 'ready',
      size_hint: 'tiny',
      sort_order: (action.sort_order ?? 0) + 1,
      is_minimum_step: 1,
    });

    await hierarchyStore.updateNodeAction(actionId, {
      status: 'cancelled',
      completed_at: null,
      updated_at: timestamp,
    });

    await hierarchyStore.updateNode(action.node_id, {
      status: 'active',
      last_touched_at: timestamp,
      updated_at: timestamp,
    });
    await syncNodeCompletionXpGrant(database, action.node_id, 'active', timestamp);

    const event = await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'shrunk',
      node_id: action.node_id,
      action_id: smallerStep.id,
      note: [
        `Создан меньший шаг: ${smallerStepTitle}.`,
        note?.trim() || null,
      ]
        .filter(Boolean)
        .join(' '),
      occurred_at: timestamp,
    });

    await nodeNoteStore.createErrorNote({
      node_id: action.node_id,
      action_id: smallerStep.id,
      note_kind: 'shrink',
      note: event.note,
      source_event_id: event.id,
    });

    if (session.status === 'active') {
      await finalizeSessionOutcome(this, session.id, timestamp, `Текущий шаг упрощен до меньшего: ${smallerStepTitle}.`);
    }

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, smallerStep.id);
  },
  };
};
