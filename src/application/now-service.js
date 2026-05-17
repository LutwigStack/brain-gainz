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
const ASSESSMENT_MASTERY_GRANT_REASON = 'assessment_mastery';
const MASTERY_LEVELS = ['seen', 'understood', 'remembered', 'applied', 'confirmed', 'retained'];
const MASTERY_LEVEL_LABELS = {
  seen: 'ознакомиться',
  understood: 'понять',
  remembered: 'запомнить',
  applied: 'применить',
  confirmed: 'подтвердить',
  retained: 'удержать',
};

const masteryLevelRank = (level) => Math.max(MASTERY_LEVELS.indexOf(level), 0);
const masteryLevelFromRank = (rank) => {
  const index = Number(rank ?? 0) - 1;
  return index >= 0 && index < MASTERY_LEVELS.length ? MASTERY_LEVELS[index] : null;
};
const masteryLevelLabel = (level) => MASTERY_LEVEL_LABELS[level] ?? level;

const assertMasteryLevel = (level) => {
  if (!MASTERY_LEVELS.includes(level)) {
    throw new Error('Unsupported mastery level.');
  }
};

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
        AND type != 'template'
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

const loadNodeMasteryBoundary = async (database, nodeId) => {
  const rows = await database.select(
    `
      SELECT
        nodes.id,
        nodes.type,
        nodes.importance,
        nodes.skill_id AS branch_id,
        nodes.knowledge_node_id,
        nodes.check_metadata,
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

  return rows[0] ?? null;
};

const parseJsonObject = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string') {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const assessmentTaskFromMetadata = (metadata, taskId) => {
  const normalized = parseJsonObject(metadata);
  if (!normalized) {
    return null;
  }

  const tasks = normalized.tasks ?? normalized.assessments ?? null;
  if (Array.isArray(tasks)) {
    const task = tasks.find((candidate) => {
      const candidateId = candidate?.id ?? candidate?.task_id ?? candidate?.taskId ?? candidate?.key;
      return candidateId != null && String(candidateId) === String(taskId);
    });
    return task ? assessmentTaskFromMetadata(task, taskId) : null;
  }
  if (tasks && typeof tasks === 'object') {
    const task = tasks[taskId] ?? tasks[String(taskId)];
    return task ? assessmentTaskFromMetadata(task, taskId) : null;
  }

  const checkMethod = normalized.check_method ?? normalized.checkMethod ?? null;
  if (checkMethod === 'llm_assisted') {
    return { ...normalized, checkMethod };
  }

  const rawStrictType = normalized.strict_check_type ?? normalized.strictCheckType ?? null;
  const directStrictType = rawStrictType === 'llm_assisted' ? null : rawStrictType;
  const inferredStrictType =
    normalized.check_method === 'strict' || normalized.checkMethod === 'strict'
      ? normalized.check_type ?? normalized.checkType ?? 'strict'
      : null;
  const strictCheckType = directStrictType ?? inferredStrictType ?? null;
  if (strictCheckType) {
    return { ...normalized, checkMethod: checkMethod ?? 'strict', strictCheckType };
  }
  return null;
};

const autoStrictCheckTypes = new Set(['exact', 'number', 'contains', 'checklist']);

const normalizeStrictText = (value, { caseSensitive = false } = {}) => {
  const normalized = String(value ?? '').trim().replace(/\s+/g, ' ');
  return caseSensitive ? normalized : normalized.toLocaleLowerCase();
};

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const checklistSelectionFromInput = (input) => {
  const raw =
    input.checklist_results ??
    input.checklistResults ??
    input.selected_items ??
    input.selectedItems ??
    parseMaybeJson(input.submitted_answer ?? input.submittedAnswer ?? null);
  if (Array.isArray(raw)) {
    return new Set(raw.map((item) => String(item)));
  }
  if (raw && typeof raw === 'object') {
    return new Set(
      Object.entries(raw)
        .filter(([, selected]) => Boolean(selected))
        .map(([key]) => String(key)),
    );
  }
  return new Set();
};

const normalizedChecklistItemId = (item, index) => String(item?.id ?? item?.key ?? index);

const summarizeExpectedAnswer = (value) => {
  if (Array.isArray(value)) {
    return `${value.length} accepted answers`;
  }
  if (value == null || String(value).trim() === '') {
    return null;
  }
  const text = String(value).trim();
  return text.length > 48 ? `${text.slice(0, 45)}...` : text;
};

const buildStrictAssessmentResult = ({ strictCheckType, passed, score, feedbackSummary, evidenceExtra = {}, timestamp }) => ({
  passed,
  score,
  feedbackSummary,
  evidencePayload: {
    method: 'strict',
    strict_check_type: strictCheckType,
    result: passed ? 'pass' : 'fail',
    verdict: passed ? 'pass' : 'fail',
    score,
    checked_at: timestamp,
    ...evidenceExtra,
  },
});

const evaluateStrictAssessmentCheck = ({ strictCheckType, config, input, timestamp }) => {
  if (!autoStrictCheckTypes.has(strictCheckType)) {
    return null;
  }

  const answer = input.submitted_answer ?? input.submittedAnswer ?? '';
  if (strictCheckType === 'exact') {
    const expectedValues = []
      .concat(config.expected_answers ?? config.expectedAnswers ?? config.expected_answer ?? config.expectedAnswer ?? [])
      .filter((value) => value != null && String(value).trim() !== '');
    if (expectedValues.length === 0) {
      return null;
    }
    const caseSensitive = Boolean(config.case_sensitive ?? config.caseSensitive);
    const normalizedAnswer = normalizeStrictText(answer, { caseSensitive });
    const passed = expectedValues.some(
      (expected) => normalizeStrictText(expected, { caseSensitive }) === normalizedAnswer,
    );
    return buildStrictAssessmentResult({
      strictCheckType,
      passed,
      score: passed ? 1 : 0,
      feedbackSummary: passed ? 'Exact answer matched.' : 'Exact answer did not match.',
      evidenceExtra: {
        expected_summary: summarizeExpectedAnswer(expectedValues),
        case_sensitive: caseSensitive,
      },
      timestamp,
    });
  }

  if (strictCheckType === 'number') {
    const expected = Number(config.expected_number ?? config.expectedNumber ?? config.expected_answer ?? config.expectedAnswer);
    const actual = Number(String(answer).trim().replace(',', '.'));
    if (!Number.isFinite(expected)) {
      return null;
    }
    const tolerance = Math.max(0, Number(config.tolerance ?? 0));
    const delta = Number.isFinite(actual) ? Math.abs(actual - expected) : Number.POSITIVE_INFINITY;
    const passed = delta <= tolerance;
    return buildStrictAssessmentResult({
      strictCheckType,
      passed,
      score: passed ? 1 : 0,
      feedbackSummary: passed ? 'Number is within tolerance.' : 'Number is outside tolerance.',
      evidenceExtra: {
        expected_summary: String(expected),
        tolerance,
        delta: Number.isFinite(delta) ? delta : null,
      },
      timestamp,
    });
  }

  if (strictCheckType === 'contains') {
    const requiredTerms = []
      .concat(config.required_terms ?? config.requiredTerms ?? config.terms ?? [])
      .filter((value) => value != null && String(value).trim() !== '');
    if (requiredTerms.length === 0) {
      return null;
    }
    const caseSensitive = Boolean(config.case_sensitive ?? config.caseSensitive);
    const normalizedAnswer = normalizeStrictText(answer, { caseSensitive });
    const missingTerms = requiredTerms.filter(
      (term) => !normalizedAnswer.includes(normalizeStrictText(term, { caseSensitive })),
    );
    const passed = missingTerms.length === 0;
    return buildStrictAssessmentResult({
      strictCheckType,
      passed,
      score: requiredTerms.length === 0 ? 0 : (requiredTerms.length - missingTerms.length) / requiredTerms.length,
      feedbackSummary: passed
        ? 'All required terms are present.'
        : `Missing required terms: ${missingTerms.map(String).join(', ')}.`,
      evidenceExtra: {
        expected_summary: `${requiredTerms.length} required terms`,
        missing_terms: missingTerms,
        case_sensitive: caseSensitive,
      },
      timestamp,
    });
  }

  if (strictCheckType === 'checklist') {
    const items = Array.isArray(config.items) ? config.items : [];
    const requiredItems = items.filter((item) => item?.required === true || (item && !('required' in item)));
    if (requiredItems.length === 0) {
      return null;
    }
    const selected = checklistSelectionFromInput(input);
    const missingItems = requiredItems.filter((item) => !selected.has(normalizedChecklistItemId(item, items.indexOf(item))));
    const passed = missingItems.length === 0;
    return buildStrictAssessmentResult({
      strictCheckType,
      passed,
      score: requiredItems.length === 0 ? 0 : (requiredItems.length - missingItems.length) / requiredItems.length,
      feedbackSummary: passed
        ? 'All required checklist items are selected.'
        : `Missing checklist items: ${missingItems.map((item) => item.label ?? item.id ?? item.key).join(', ')}.`,
      evidenceExtra: {
        expected_summary: `${requiredItems.length} required checklist items`,
        selected_items: Array.from(selected),
        missing_items: missingItems.map((item) => normalizedChecklistItemId(item, items.indexOf(item))),
      },
      timestamp,
    });
  }

  return null;
};

const verifierEvidenceKeys = new Set([
  'checker_run_id',
  'checkerRunId',
  'llm_result_id',
  'llmResultId',
  'strict_result_id',
  'strictResultId',
  'result',
  'output',
  'verdict',
  'summary',
  'feedback',
  'reason',
  'assessment_result',
  'assessmentResult',
  'evidence',
  'artifact',
  'artifact_url',
  'artifactUrl',
]);

const isMeaningfulEvidenceValue = (value) => {
  if (value == null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(isMeaningfulEvidenceValue);
  }
  if (typeof value === 'object') {
    return Object.values(value).some(isMeaningfulEvidenceValue);
  }
  return false;
};

const hasVerifierEvidencePayload = (payload) => {
  if (payload == null) {
    return false;
  }
  if (typeof payload === 'string') {
    return payload.trim().length > 0;
  }
  if (Array.isArray(payload)) {
    return payload.some(hasVerifierEvidencePayload);
  }
  if (typeof payload === 'object') {
    return Object.entries(payload).some(
      ([key, value]) => verifierEvidenceKeys.has(key) && isMeaningfulEvidenceValue(value),
    );
  }
  return false;
};

const normalizeEvidencePayload = (input = {}) => {
  const directPayload = input.evidence_payload ?? input.evidencePayload ?? input.evidence ?? null;
  const checkerRunId = input.checker_run_id ?? input.checkerRunId ?? null;
  const llmResultId = input.llm_result_id ?? input.llmResultId ?? null;
  const strictResultId = input.strict_result_id ?? input.strictResultId ?? null;

  if (directPayload != null) {
    if (!hasVerifierEvidencePayload(directPayload)) {
      return null;
    }
    return typeof directPayload === 'string' ? directPayload.trim() : JSON.stringify(directPayload);
  }

  const evidence = {};
  if (isMeaningfulEvidenceValue(checkerRunId)) {
    evidence.checker_run_id = typeof checkerRunId === 'string' ? checkerRunId.trim() : checkerRunId;
  }
  if (isMeaningfulEvidenceValue(llmResultId)) {
    evidence.llm_result_id = typeof llmResultId === 'string' ? llmResultId.trim() : llmResultId;
  }
  if (isMeaningfulEvidenceValue(strictResultId)) {
    evidence.strict_result_id = typeof strictResultId === 'string' ? strictResultId.trim() : strictResultId;
  }

  return Object.keys(evidence).length > 0 ? JSON.stringify(evidence) : null;
};

const createOrReactivateMasteryEvent = async (
  database,
  node,
  {
    masteryLevel,
    specializationId = null,
    sourceType,
    sourceId = null,
    idempotencyKey,
    timestamp = currentTimestamp(),
  },
) => {
  assertMasteryLevel(masteryLevel);

  if (masteryLevelRank(masteryLevel) > masteryLevelRank('seen') && !['legacy_node_completion', 'assessment'].includes(sourceType)) {
    throw new Error('Verified mastery requires assessment evidence or legacy completion.');
  }

  const existing = await database.select(
    `
      SELECT id
      FROM mastery_events
      WHERE campaign_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [node.campaign_id, idempotencyKey],
  );

  if (existing[0]?.id != null) {
    await database.execute(
      `
        UPDATE mastery_events
        SET active = 1,
            reversed_at = NULL
        WHERE id = ?
      `,
      [existing[0].id],
    );
    return { status: 'reactivated', masteryEventId: existing[0].id };
  }

  const result = await database.execute(
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NULL)
    `,
    [
      node.campaign_id,
      node.id,
      specializationId,
      node.knowledge_node_id ?? null,
      masteryLevel,
      sourceType,
      sourceId,
      idempotencyKey,
      timestamp,
    ],
  );

  return { status: 'created', masteryEventId: result.lastInsertId ?? null };
};

const syncNodeCompletionMasteryEvent = async (database, node, nextStatus, timestamp = currentTimestamp()) => {
  const idempotencyKey = `legacy-node-completion:${node.campaign_id}:${node.id}`;

  if (nextStatus !== 'done') {
    await database.execute(
      `
        UPDATE mastery_events
        SET active = 0,
            reversed_at = COALESCE(reversed_at, ?)
        WHERE campaign_id = ?
          AND node_id = ?
          AND source_type = 'legacy_node_completion'
          AND active = 1
      `,
      [timestamp, node.campaign_id, node.id],
    );
    return { status: 'deactivated', masteryEventId: null };
  }

  return createOrReactivateMasteryEvent(database, node, {
    masteryLevel: 'confirmed',
    sourceType: 'legacy_node_completion',
    sourceId: node.id,
    idempotencyKey,
    timestamp,
  });
};

const upsertXpGrantForNode = async (
  database,
  node,
  {
    grantReason,
    timestamp = currentTimestamp(),
    masteryEventId = null,
    assessmentAttemptId = null,
  },
) => {
  if (!node?.campaign_id) {
    return { status: 'missing-campaign' };
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
    [node.campaign_id, node.id, grantReason],
  );

  if (existing[0]?.id != null) {
    await database.execute(
      `
        UPDATE stat_xp_grants
        SET branch_id = ?,
            stat_id = ?,
            xp_amount = ?,
            mastery_event_id = COALESCE(?, mastery_event_id),
            assessment_attempt_id = COALESCE(?, assessment_attempt_id),
            active = 1,
            reversed_at = NULL
        WHERE id = ?
      `,
      [
        node.branch_id,
        node.primary_stat_id,
        nodeCompletionXp(node),
        masteryEventId,
        assessmentAttemptId,
        existing[0].id,
      ],
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
        mastery_event_id,
        assessment_attempt_id,
        active,
        created_at,
        reversed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NULL)
    `,
    [
      node.campaign_id,
      node.id,
      node.branch_id,
      node.primary_stat_id,
      grantReason,
      nodeCompletionXp(node),
      masteryEventId,
      assessmentAttemptId,
      timestamp,
    ],
  );

  return { status: 'created' };
};

const syncNodeCompletionXpGrant = async (database, nodeId, nextStatus, timestamp = currentTimestamp()) => {
  const node = await loadNodeMasteryBoundary(database, nodeId);

  if (!node?.campaign_id) {
    return { status: 'missing-campaign' };
  }

  const masteryEventResult = await syncNodeCompletionMasteryEvent(database, node, nextStatus, timestamp);

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
    return { status: 'deactivated', masteryEventStatus: masteryEventResult.status };
  }

  const xpGrantResult = await upsertXpGrantForNode(database, node, {
    grantReason: NODE_COMPLETION_GRANT_REASON,
    masteryEventId: masteryEventResult.masteryEventId,
    timestamp,
  });

  return {
    ...xpGrantResult,
    masteryEventStatus: masteryEventResult.status,
    masteryEventId: masteryEventResult.masteryEventId,
  };
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

const addDaysTimestamp = (timestamp, days) => {
  const parsed = Date.parse(timestamp);
  const base = Number.isFinite(parsed) ? parsed : Date.now();
  return new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
};

const isAfterTimestamp = (left, right) => {
  if (!left) {
    return false;
  }
  if (!right) {
    return true;
  }
  const leftTimestamp = Date.parse(left);
  const rightTimestamp = Date.parse(right);
  return Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp) && leftTimestamp > rightTimestamp;
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

const prioritizeRouteFocusCandidate = (rankedCandidates, routeCompletion) => {
  const focusNodeId = routeCompletion?.nextItem?.node_id ?? null;
  if (focusNodeId == null) {
    return rankedCandidates;
  }

  const focusIndex = rankedCandidates.findIndex((candidate) => candidate.nodeId === focusNodeId);
  if (focusIndex <= 0) {
    return rankedCandidates;
  }

  const routeFocus = rankedCandidates[focusIndex];
  return [routeFocus, ...rankedCandidates.slice(0, focusIndex), ...rankedCandidates.slice(focusIndex + 1)];
};

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
          AND nodes.is_archived = 0
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
          AND nodes.is_archived = 0
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
  const tasks = await buildDailyRunTasksForSession(database, session, events);

  return {
    ...session,
    state: dailyRunStateForSession(session),
    events,
    tasks,
    summary: buildDailyRunSummaryPayload(session, tasks),
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

const DAILY_RUN_OUTCOME_EVENTS = new Set(['completed', 'failed', 'skipped', 'deferred', 'blocked', 'shrunk']);

const dailyRunSourceLabels = {
  route_front: 'Текущий фронт',
  route_next: 'Маршрут',
  weak_spot: 'Повторение',
  recovery_retry: 'Повтор',
  due_check: 'Проверка',
  ready_check: 'Проверка готова',
  recommendation: 'Рекомендация',
};

const dailyRunStateForSession = (session) => {
  if (!session) {
    return 'not_started';
  }

  if (session.status === 'planned') {
    return 'not_started';
  }

  return ['active', 'completed', 'abandoned'].includes(session.status) ? session.status : 'not_started';
};

const parseDailyRunTaskNote = (note) => {
  try {
    const parsed = JSON.parse(note ?? '');
    return parsed?.kind === 'daily-run-task' ? parsed : {};
  } catch {
    return {};
  }
};

const stringifyDailyRunTaskNote = (task) =>
  JSON.stringify({
    kind: 'daily-run-task',
    source: task.source,
    title: task.title,
    subtitle: task.subtitle,
    order: task.order,
  });

const normalizeDailyRunOutcome = (eventType) => {
  if (eventType === 'completed') {
    return 'completed';
  }
  if (eventType === 'failed' || eventType === 'blocked' || eventType === 'shrunk') {
    return 'failed';
  }
  if (eventType === 'skipped') {
    return 'skipped';
  }
  if (eventType === 'deferred') {
    return 'deferred';
  }
  return 'pending';
};

const sameDatabaseId = (left, right) =>
  left != null && right != null && String(left) === String(right);

const latestOutcomeForSelection = (events, selectedEvent) => {
  const selectedEventId = Number(selectedEvent.id ?? 0);
  const isSameSelectionTarget = (event) => {
    if (selectedEvent.action_id != null) {
      return sameDatabaseId(event.action_id, selectedEvent.action_id);
    }
    return event.action_id == null && sameDatabaseId(event.node_id, selectedEvent.node_id);
  };
  const nextSelectedAttempt = events
    .filter((event) => Number(event.id ?? 0) > selectedEventId && event.event_type === 'selected')
    .filter(isSameSelectionTarget)
    .sort((left, right) => Number(left.id ?? 0) - Number(right.id ?? 0))[0] ?? null;
  const nextSelectedAttemptId = Number(nextSelectedAttempt?.id ?? Number.POSITIVE_INFINITY);
  const matching = events
    .filter((event) => {
      const eventId = Number(event.id ?? 0);
      return eventId > selectedEventId && eventId < nextSelectedAttemptId && DAILY_RUN_OUTCOME_EVENTS.has(event.event_type);
    })
    .filter(isSameSelectionTarget)
    .sort((left, right) => Number(right.id ?? 0) - Number(left.id ?? 0));

  return matching[0] ?? null;
};

const buildDailyRunSummaryPayload = (session, tasks) => {
  const completed = tasks.filter((task) => task.outcome === 'completed');
  const failed = tasks.filter((task) => task.outcome === 'failed');
  const skipped = tasks.filter((task) => task.outcome === 'skipped');
  const deferred = tasks.filter((task) => task.outcome === 'deferred');
  const noteLines = String(session.summary_note ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    lines: noteLines,
    completedCount: completed.length,
    failedCount: failed.length,
    skippedCount: skipped.length,
    deferredCount: deferred.length,
  };
};

const buildDailyRunTasksForSession = async (database, session, events) => {
  const selectedEvents = events.filter((event) => event.event_type === 'selected');

  if (selectedEvents.length === 0 && (session.primary_node_id != null || session.primary_action_id != null)) {
    selectedEvents.push({
      id: 0,
      event_type: 'selected',
      node_id: session.primary_node_id,
      action_id: session.primary_action_id,
      note: null,
    });
  }

  if (selectedEvents.length === 0) {
    return [];
  }

  const rows = await database.select(
    `
      SELECT
        selected.id AS selected_event_id,
        selected.node_id,
        selected.action_id,
        selected.note,
        actions.title AS action_title,
        nodes.title AS node_title,
        skills.name AS skill_name,
        directions.name AS direction_name,
        spheres.name AS sphere_name
      FROM daily_session_events selected
      LEFT JOIN node_actions actions ON actions.id = selected.action_id
      LEFT JOIN nodes ON nodes.id = COALESCE(selected.node_id, actions.node_id)
      LEFT JOIN skills ON skills.id = nodes.skill_id
      LEFT JOIN directions ON directions.id = skills.direction_id
      LEFT JOIN spheres ON spheres.id = directions.sphere_id
      WHERE selected.session_id = ?
        AND selected.event_type = 'selected'
      ORDER BY selected.id ASC
    `,
    [session.id],
  );
  const rowByEventId = new Map(rows.map((row) => [row.selected_event_id, row]));

  return selectedEvents.map((event, index) => {
    const row = rowByEventId.get(event.id) ?? {};
    const metadata = parseDailyRunTaskNote(row.note ?? event.note);
    const latestOutcome = latestOutcomeForSelection(events, event);
    const source = metadata.source ?? (index === 0 ? 'route_front' : 'recommendation');

    return {
      id: event.id,
      order: Number(metadata.order ?? index + 1),
      source,
      sourceLabel: dailyRunSourceLabels[source] ?? dailyRunSourceLabels.recommendation,
      title: metadata.title ?? row.action_title ?? row.node_title ?? 'Задача дня',
      subtitle:
        metadata.subtitle ??
        [row.sphere_name, row.direction_name, row.skill_name, row.node_title].filter(Boolean).join(' / '),
      nodeId: row.node_id ?? event.node_id,
      actionId: row.action_id ?? event.action_id ?? null,
      outcome: normalizeDailyRunOutcome(latestOutcome?.event_type),
      outcomeNote: latestOutcome?.note ?? null,
    };
  });
};

const loadFirstOpenActionForNode = async (database, nodeId, campaignId) => {
  const rows = await database.select(
    `
      SELECT
        actions.*,
        nodes.title AS node_title,
        skills.name AS skill_name,
        directions.name AS direction_name,
        spheres.name AS sphere_name
      FROM node_actions actions
      JOIN nodes ON nodes.id = actions.node_id
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE actions.node_id = ?
        AND spheres.campaign_id = ?
        AND nodes.is_archived = 0
        AND actions.status IN ('todo', 'ready', 'doing')
      ORDER BY
        CASE actions.status WHEN 'doing' THEN 0 WHEN 'ready' THEN 1 ELSE 2 END ASC,
        actions.sort_order ASC,
        actions.id ASC
      LIMIT 1
    `,
    [nodeId, campaignId],
  );

  return rows[0] ?? null;
};

const loadFirstActionForNode = async (database, nodeId, campaignId) => {
  const rows = await database.select(
    `
      SELECT
        actions.*,
        nodes.title AS node_title,
        skills.name AS skill_name,
        directions.name AS direction_name,
        spheres.name AS sphere_name
      FROM node_actions actions
      JOIN nodes ON nodes.id = actions.node_id
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE actions.node_id = ?
        AND spheres.campaign_id = ?
        AND nodes.is_archived = 0
      ORDER BY
        CASE actions.status WHEN 'doing' THEN 0 WHEN 'ready' THEN 1 WHEN 'todo' THEN 2 ELSE 3 END ASC,
        actions.sort_order ASC,
        actions.id ASC
      LIMIT 1
    `,
    [nodeId, campaignId],
  );

  return rows[0] ?? null;
};

const pushUniqueDailyRunTask = (tasks, task) => {
  if (!task?.nodeId || task.actionId == null) {
    return;
  }

  const key = `action:${task.actionId}`;
  if (tasks.some((item) => `action:${item.actionId}` === key)) {
    return;
  }

  tasks.push({
    ...task,
    order: tasks.length + 1,
  });
};

const routeItemToDailyRunTask = async (database, campaignId, item, source) => {
  if (!item?.node_id) {
    return null;
  }

  const action =
    (await loadFirstOpenActionForNode(database, item.node_id, campaignId)) ??
    (source === 'weak_spot' || source === 'recovery_retry'
      ? await loadFirstActionForNode(database, item.node_id, campaignId)
      : null);

  if (!action) {
    return null;
  }

  return {
    source,
    title: action.title ?? item.title,
    subtitle: [item.route_stage, item.path, item.title].filter(Boolean).join(' / '),
    nodeId: item.node_id,
    actionId: action.id,
  };
};

const recommendationToDailyRunTask = (candidate, source = 'recommendation') => {
  if (!candidate?.nodeId || candidate.actionId == null) {
    return null;
  }

  return {
    source,
    title: candidate.actionTitle,
    subtitle: [candidate.sphereName, candidate.directionName, candidate.skillName, candidate.nodeTitle].filter(Boolean).join(' / '),
    nodeId: candidate.nodeId,
    actionId: candidate.actionId,
  };
};

const chooseDailyRunTasks = async (database, campaignId, dashboard, preferredActionId = null) => {
  const tasks = [];
  const today = dashboard.today ?? null;
  const planner = today?.planner ?? null;
  const route = today?.route ?? null;
  const recommendations = [dashboard.primaryRecommendation, ...(dashboard.queue ?? [])].filter(Boolean);
  const preferredRecommendation = recommendations.find((candidate) => candidate.actionId === preferredActionId) ?? null;

  pushUniqueDailyRunTask(tasks, recommendationToDailyRunTask(preferredRecommendation, 'recommendation'));
  pushUniqueDailyRunTask(tasks, await routeItemToDailyRunTask(database, campaignId, planner?.focusItem ?? route?.nextItem, 'route_front'));

  for (const item of planner?.weakSpots ?? []) {
    pushUniqueDailyRunTask(tasks, await routeItemToDailyRunTask(database, campaignId, item, 'weak_spot'));
  }

  for (const item of planner?.nextItems ?? []) {
    pushUniqueDailyRunTask(tasks, await routeItemToDailyRunTask(database, campaignId, item, 'route_next'));
  }

  for (const item of planner?.readyToVerify ?? []) {
    pushUniqueDailyRunTask(tasks, await routeItemToDailyRunTask(database, campaignId, item, 'ready_check'));
  }

  for (const candidate of recommendations) {
    const source = candidate.currentRisk === 'high' || isPastDue(candidate.nextDueAt) || isPastDue(candidate.dueAt)
      ? 'due_check'
      : 'recommendation';
    pushUniqueDailyRunTask(tasks, recommendationToDailyRunTask(candidate, source));
  }

  return tasks.slice(0, 5);
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

const loadNodeMasteryFocus = async (database, node, selectedAction = null) => {
  if (!node?.campaign_id) {
    return null;
  }

  const events = await database.select(
    `
      SELECT id, mastery_level, source_type, created_at, active
      FROM mastery_events
      WHERE campaign_id = ?
        AND node_id = ?
        AND active = 1
      ORDER BY created_at DESC, id DESC
    `,
    [node.campaign_id, node.id],
  );

  const latestAttemptRows = await database.select(
    `
      SELECT id, task_id, check_method, passed, score, target_mastery_level, feedback_summary, evidence_payload, created_at
      FROM assessment_attempts
      WHERE campaign_id = ?
        AND node_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    [node.campaign_id, node.id],
  );

  const routeRequirementRows = await database.select(
    `
      SELECT
        route_nodes.required_mastery_level,
        route_nodes.is_required,
        specializations.id AS specialization_id,
        specializations.name AS specialization_name
      FROM campaigns
      JOIN career_specializations specializations
        ON specializations.id = campaigns.current_specialization_id
       AND specializations.campaign_id = campaigns.id
      JOIN specialization_route_nodes route_nodes
        ON route_nodes.specialization_id = specializations.id
      WHERE campaigns.id = ?
        AND (
          route_nodes.node_id = ?
          OR (
            route_nodes.node_id IS NULL
            AND route_nodes.knowledge_node_id IS NOT NULL
            AND route_nodes.knowledge_node_id = ?
          )
        )
      ORDER BY route_nodes.is_required DESC, route_nodes.id ASC
      LIMIT 1
    `,
    [node.campaign_id, node.id, node.knowledge_node_id ?? null],
  );

  const currentEvent =
    events.reduce((best, event) => {
      if (!best) {
        return event;
      }
      return masteryLevelRank(event.mastery_level) > masteryLevelRank(best.mastery_level) ? event : best;
    }, null) ?? null;
  const currentLevel = currentEvent?.mastery_level ?? null;
  const taskId = selectedAction?.id != null ? `action:${selectedAction.id}` : `node:${node.id}:assessment`;
  const assessmentTask = assessmentTaskFromMetadata(node.check_metadata, taskId);
  const strictCheckType = assessmentTask?.strictCheckType ?? null;
  const hasVerifiedEvent = events.some((event) => ['legacy_node_completion', 'assessment'].includes(event.source_type));
  const checklistItems = Array.isArray(assessmentTask?.items)
    ? assessmentTask.items.map((item, index) => ({
        id: normalizedChecklistItemId(item, index),
        label: String(item.label ?? item.title ?? item.id ?? item.key ?? `Item ${index + 1}`),
        required: item.required !== false,
      }))
    : [];

  return {
    currentLevel,
    currentRank: currentLevel ? masteryLevelRank(currentLevel) + 1 : 0,
    isVerified: hasVerifiedEvent,
    isSelfMarkedOnly: events.length > 0 && !hasVerifiedEvent,
    eventCount: events.length,
    latestEvent: currentEvent,
    latestAttempt: latestAttemptRows[0] ?? null,
    routeRequirement: routeRequirementRows[0] ?? null,
    check: {
      taskId,
      strictCheckType,
      isStrictCheckable: strictCheckType != null,
      isAutoStrictCheck: strictCheckType != null && autoStrictCheckTypes.has(strictCheckType),
      prompt: assessmentTask?.prompt ?? assessmentTask?.question ?? assessmentTask?.title ?? null,
      expectedSummary:
        summarizeExpectedAnswer(
          assessmentTask?.expected_summary ??
            assessmentTask?.expectedSummary ??
            assessmentTask?.rubric ??
            assessmentTask?.expected_answer ??
            assessmentTask?.expectedAnswer ??
            assessmentTask?.expected_number ??
            assessmentTask?.expectedNumber,
        ) ?? null,
      requiredTerms: []
        .concat(assessmentTask?.required_terms ?? assessmentTask?.requiredTerms ?? assessmentTask?.terms ?? [])
        .filter((value) => value != null && String(value).trim() !== '')
        .map((value) => String(value)),
      checklistItems,
    },
  };
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

  const mastery = await loadNodeMasteryFocus(database, node, selectedAction);
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
    mastery,
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

const loadArchivedNavigationNodes = (database, campaignId) =>
  database.select(
    `
      SELECT
        nodes.id,
        nodes.skill_id,
        nodes.title,
        nodes.type,
        nodes.status,
        nodes.x,
        nodes.y,
        nodes.updated_at,
        skills.name AS skill_name,
        directions.id AS direction_id,
        directions.name AS direction_name,
        spheres.id AS sphere_id,
        spheres.name AS sphere_name,
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
      WHERE nodes.is_archived = 1
        AND spheres.campaign_id = ?
      ORDER BY nodes.updated_at DESC, nodes.id ASC
    `,
    [campaignId],
  );

const buildNavigationSnapshot = async (database, campaignId) => {
  const [tree, dashboard, edges, archivedNodes] = await Promise.all([
    loadHierarchyTree(database, campaignId),
    createNowServiceContext(database, campaignId).getDashboard(),
    loadActiveGraphEdges(database, campaignId),
    loadArchivedNavigationNodes(database, campaignId),
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
    archivedNodes,
    defaultSelection: firstNode,
  };
};

const createNowServiceContext = (database, campaignId) => ({
  getDashboard: async () => {
    const [metrics, rawCandidates, todaySession, career] = await Promise.all([
      loadMetrics(database, campaignId),
      loadCandidateRows(database, campaignId),
      loadTodaySession(database, { getEventsForSession: (sessionId) => database.select('SELECT * FROM daily_session_events WHERE session_id = ? ORDER BY id ASC', [sessionId]) }, campaignId),
      buildCareerSnapshot(database, campaignId),
    ]);
    const currentSpecialization = career.currentSpecialization ?? null;
    const routeCompletion = currentSpecialization
      ? await computeRouteCompletion(database, campaignId, currentSpecialization.id)
      : null;
    const activeRouteCompletion = currentSpecialization?.status === 'active' ? routeCompletion : null;

    const rankedCandidates = prioritizeRouteFocusCandidate(rankCandidates(rawCandidates), activeRouteCompletion);

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

const shouldFinalizeSessionAutomatically = (session) => Boolean(session?.auto_finalize);

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

const dailyRunTaskOutcomeNotes = {
  completed: 'Завершено из задач дня.',
  failed: 'Нужен еще один проход в задачах дня.',
  skipped: 'Пропущено в задачах дня.',
  deferred: 'Отложено в задачах дня.',
};

const normalizeDailyRunTaskOutcome = (outcome) => {
  if (outcome === 'completed' || outcome === 'failed' || outcome === 'skipped' || outcome === 'deferred') {
    return outcome;
  }

  return null;
};

const buildDailyRunFinishSummaryNote = async (database, campaignId, session) => {
  const events = await database.select('SELECT * FROM daily_session_events WHERE session_id = ? ORDER BY id ASC', [
    session.id,
  ]);
  const tasks = await buildDailyRunTasksForSession(database, session, events);
  const completed = tasks.filter((task) => task.outcome === 'completed');
  const failed = tasks.filter((task) => task.outcome === 'failed');
  const skipped = tasks.filter((task) => task.outcome === 'skipped');
  const deferred = tasks.filter((task) => task.outcome === 'deferred');
  const recoveryKeyForTask = (task) => (task.actionId != null ? `action:${task.actionId}` : `node:${task.nodeId}`);
  const completedKeys = new Set(completed.map(recoveryKeyForTask));
  const recoveryKeys = new Set([...failed, ...skipped, ...deferred].map(recoveryKeyForTask));
  const recoveredKeys = new Set([...recoveryKeys].filter((key) => completedKeys.has(key)));
  const openRecovery = [...recoveryKeys].filter((key) => !completedKeys.has(key)).length;
  const completedNodeIds = [...new Set(completed.map((task) => task.nodeId).filter((id) => id != null))];
  let xp = 0;
  let masteryEvents = 0;

  if (completedNodeIds.length > 0) {
    const placeholders = completedNodeIds.map(() => '?').join(', ');
    const xpRows = await database.select(
      `
        SELECT COALESCE(SUM(xp_amount), 0) AS xp
        FROM stat_xp_grants
        WHERE campaign_id = ?
          AND active = 1
          AND node_id IN (${placeholders})
          AND grant_reason = ?
      `,
      [campaignId, ...completedNodeIds, NODE_COMPLETION_GRANT_REASON],
    );
    const masteryRows = await database.select(
      `
        SELECT COUNT(*) AS count
        FROM mastery_events
        WHERE campaign_id = ?
          AND active = 1
          AND node_id IN (${placeholders})
          AND source_type = 'legacy_node_completion'
      `,
      [campaignId, ...completedNodeIds],
    );
    xp = Number(xpRows[0]?.xp ?? 0);
    masteryEvents = Number(masteryRows[0]?.count ?? 0);
  }

  const changedTitles = completed.slice(0, 3).map((task) => task.title).join(', ') || 'Пока нет завершенных задач';

  return [
    `Изменения: ${completed.length}/${tasks.length} задач завершено. ${changedTitles}.`,
    `XP/освоение: ${xp} XP активно за этот набор; событий освоения: ${masteryEvents}.`,
    recoveredKeys.size > 0 || openRecovery > 0
      ? `Повторение: ${recoveredKeys.size} закреплено в наборе; ${openRecovery} еще в очереди.`
      : 'Повторение: дополнительных задач нет.',
  ].join('\n');
};

const normalizeActionOutcomeArgs = (args, campaignId, actionId, note = '') => {
  if (args.length === 1) {
    return {
      campaignId: null,
      actionId: campaignId,
      note: '',
    };
  }

  if (args.length === 2 && !Number.isInteger(actionId)) {
    return {
      campaignId: null,
      actionId: campaignId,
      note: actionId ?? '',
    };
  }

  return {
    campaignId,
    actionId,
    note,
  };
};

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
          COALESCE(
            (
              SELECT nodes_inner.id
              FROM node_actions actions
              JOIN nodes nodes_inner ON nodes_inner.id = actions.node_id
              WHERE nodes_inner.skill_id = skills.id
                AND nodes_inner.is_archived = 0
                AND actions.status IN ('todo', 'ready', 'doing')
              ORDER BY actions.sort_order ASC, actions.id ASC
              LIMIT 1
            ),
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
            )
          ) AS focus_node_id,
          COALESCE(
            (
              SELECT nodes_inner.title
              FROM node_actions actions
              JOIN nodes nodes_inner ON nodes_inner.id = actions.node_id
              WHERE nodes_inner.skill_id = skills.id
                AND nodes_inner.is_archived = 0
                AND actions.status IN ('todo', 'ready', 'doing')
              ORDER BY actions.sort_order ASC, actions.id ASC
              LIMIT 1
            ),
            (
            SELECT nodes_inner.title
            FROM nodes nodes_inner
            WHERE nodes_inner.skill_id = skills.id
              AND nodes_inner.is_archived = 0
            ORDER BY
              CASE WHEN nodes_inner.status IN ('active', 'paused') THEN 0 ELSE 1 END ASC,
              nodes_inner.updated_at DESC,
              nodes_inner.id ASC
            LIMIT 1
            )
          ) AS focus_node_title,
          (
            SELECT actions.id
            FROM node_actions actions
            JOIN nodes nodes_inner ON nodes_inner.id = actions.node_id
            WHERE nodes_inner.skill_id = skills.id
              AND nodes_inner.is_archived = 0
              AND actions.status IN ('todo', 'ready', 'doing')
            ORDER BY actions.sort_order ASC, actions.id ASC
            LIMIT 1
          ) AS next_action_id,
          (
            SELECT actions.title
            FROM node_actions actions
            JOIN nodes nodes_inner ON nodes_inner.id = actions.node_id
            WHERE nodes_inner.skill_id = skills.id
              AND nodes_inner.is_archived = 0
              AND actions.status IN ('todo', 'ready', 'doing')
            ORDER BY actions.sort_order ASC, actions.id ASC
            LIMIT 1
          ) AS next_action_title
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

const runTransaction = async (database, callback) => {
  await database.execute('BEGIN');
  try {
    const result = await callback();
    await database.execute('COMMIT');
    return result;
  } catch (error) {
    try {
      await database.execute('ROLLBACK');
    } catch (rollbackError) {
      if (
        error != null &&
        (typeof error === 'object' || typeof error === 'function') &&
        !/no transaction|cannot rollback/i.test(String(rollbackError?.message ?? rollbackError))
      ) {
        error.rollbackError = rollbackError;
      }
    }
    throw error;
  }
};

const loadCampaign = async (database, campaignId) => {
  const rows = await database.select('SELECT * FROM campaigns WHERE id = ? AND is_archived = 0 LIMIT 1', [campaignId]);
  return rows[0] ?? null;
};

const assertCampaign = async (database, campaignId) => {
  const campaign = await loadCampaign(database, campaignId);
  if (!campaign) {
    throw new Error('Campaign not found.');
  }
  return campaign;
};

const assertPersonalProgressCampaign = async (database, campaignId) => {
  const campaign = await assertCampaign(database, campaignId);
  if (campaign.type === 'template') {
    throw new Error('Template campaigns are read-only. Create a personal campaign from the template to track progress.');
  }
  return campaign;
};

const loadSpecialization = async (database, campaignId, specializationId) => {
  const rows = await database.select(
    'SELECT * FROM career_specializations WHERE id = ? AND campaign_id = ? LIMIT 1',
    [specializationId, campaignId],
  );
  return rows[0] ?? null;
};

const assertSpecialization = async (database, campaignId, specializationId) => {
  const specialization = await loadSpecialization(database, campaignId, specializationId);
  if (!specialization) {
    throw new Error('Specialization does not belong to the selected campaign.');
  }
  return specialization;
};

const activeSpecializationForCampaign = async (database, campaignId) => {
  const rows = await database.select(
    "SELECT * FROM career_specializations WHERE campaign_id = ? AND status = 'active' LIMIT 1",
    [campaignId],
  );
  return rows[0] ?? null;
};

const slugKey = (value, fallback = 'specialization') => {
  const base = slugify(value).replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '');
  return base || fallback;
};

const buildCareerSnapshot = async (database, campaignId) => {
  const campaign = await assertCampaign(database, campaignId);
  const [currentRows, specializations, routeStats, masteryRows] = await Promise.all([
    campaign.current_specialization_id
      ? database.select('SELECT * FROM career_specializations WHERE id = ? AND campaign_id = ? LIMIT 1', [
          campaign.current_specialization_id,
          campaignId,
        ])
      : Promise.resolve([]),
    database.select(
      `
        SELECT *
        FROM career_specializations
        WHERE campaign_id = ?
        ORDER BY
          CASE status
            WHEN 'active' THEN 0
            WHEN 'completed' THEN 1
            WHEN 'paused' THEN 2
            WHEN 'archived' THEN 3
            ELSE 4
          END,
          COALESCE(completed_at, started_at, created_at) DESC,
          id DESC
      `,
      [campaignId],
    ),
    database.select(
      `
        SELECT
          career_specializations.id AS specialization_id,
          COUNT(route_nodes.id) AS route_node_count,
          SUM(CASE WHEN route_nodes.is_required = 1 THEN 1 ELSE 0 END) AS required_node_count
        FROM career_specializations
        LEFT JOIN specialization_route_nodes route_nodes ON route_nodes.specialization_id = career_specializations.id
        WHERE career_specializations.campaign_id = ?
        GROUP BY career_specializations.id
      `,
      [campaignId],
    ),
    database.select(
      `
        SELECT
          mastery_events.node_id,
          MAX(
            CASE mastery_events.mastery_level
              WHEN 'seen' THEN 1
              WHEN 'understood' THEN 2
              WHEN 'remembered' THEN 3
              WHEN 'applied' THEN 4
              WHEN 'confirmed' THEN 5
              WHEN 'retained' THEN 6
              ELSE 0
            END
          ) AS mastery_rank,
          MAX(
            CASE
              WHEN mastery_events.source_type IN ('legacy_node_completion', 'assessment') THEN 1
              ELSE 0
            END
          ) AS has_verified_event
        FROM mastery_events
        WHERE mastery_events.campaign_id = ?
          AND mastery_events.active = 1
        GROUP BY mastery_events.node_id
      `,
      [campaignId],
    ),
  ]);

  const routeStatBySpecialization = new Map(routeStats.map((row) => [row.specialization_id, row]));
  const verifiedNodeCount = masteryRows.filter((row) => Number(row.has_verified_event ?? 0) === 1).length;
  const selfMarkedOnlyNodeCount = masteryRows.filter((row) => Number(row.has_verified_event ?? 0) !== 1).length;
  const masteredNodeCount = masteryRows.filter(
    (row) =>
      Number(row.has_verified_event ?? 0) === 1 &&
      Number(row.mastery_rank ?? 0) >= masteryLevelRank('confirmed') + 1,
  ).length;

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      icon: campaign.icon ?? null,
      color: campaign.color ?? null,
      mode: campaign.mode ?? 'free',
      career_status: campaign.career_status ?? 'active',
      current_specialization_id: campaign.current_specialization_id ?? null,
    },
    currentSpecialization: currentRows[0] ?? null,
    specializations: specializations.map((specialization) => {
      const stats = routeStatBySpecialization.get(specialization.id) ?? {};
      return {
        ...specialization,
        route_node_count: Number(stats.route_node_count ?? 0),
        required_node_count: Number(stats.required_node_count ?? 0),
      };
    }),
    mastery: {
      activeNodeCount: masteryRows.length,
      confirmedOrBetterNodeCount: masteredNodeCount,
      verifiedNodeCount,
      selfMarkedOnlyNodeCount,
    },
  };
};

const loadCurrentSpecialization = async (database, campaignId) => {
  const campaign = await assertCampaign(database, campaignId);
  if (!campaign.current_specialization_id) {
    return null;
  }
  return loadSpecialization(database, campaignId, campaign.current_specialization_id);
};

const buildRaceProjection = (campaign, currentSpecialization = null) => {
  const careerMode = campaign.mode === 'career' || currentSpecialization != null;
  const iconEmblems = {
    spark: '✦',
    brain: '◆',
    compass: '⌖',
    map: '▧',
    book: '▤',
  };
  return {
    key: careerMode ? 'crow_commander' : 'free_builder',
    title: careerMode ? 'Ворон-стратег' : 'Архитектор',
    emblem: iconEmblems[campaign.icon] ?? (careerMode ? '♜' : '◆'),
    color: campaign.color ?? (careerMode ? '#f6c445' : '#58f0d0'),
  };
};

const buildCityProjection = async (database, campaignId) => {
  const rows = await database.select(
    `
      SELECT
        campaign_stats.id,
        campaign_stats.title,
        campaign_stats.icon,
        campaign_stats.color,
        COALESCE(SUM(CASE WHEN grants.active = 1 THEN grants.xp_amount ELSE 0 END), 0) AS xp
      FROM campaign_stats
      LEFT JOIN stat_xp_grants grants ON grants.stat_id = campaign_stats.id
        AND grants.campaign_id = campaign_stats.campaign_id
      WHERE campaign_stats.campaign_id = ?
        AND campaign_stats.is_archived = 0
      GROUP BY campaign_stats.id
      ORDER BY campaign_stats.sort_order ASC, campaign_stats.id ASC
      LIMIT 6
    `,
    [campaignId],
  );

  const districts = rows.map((row) => {
    const xp = Number(row.xp ?? 0);
    const level = levelFromXp(xp);
    const nextXp = nextLevelXp(level);
    return {
      id: row.id,
      title: row.title,
      emblem: row.icon ?? '◆',
      color: row.color ?? '#58f0d0',
      xp,
      level,
      stability: nextXp <= 0 ? 100 : Math.min(100, Math.round((xp / nextXp) * 100)),
    };
  });

  return {
    level: Math.max(1, districts.reduce((sum, district) => sum + district.level, 0)),
    totalXp: districts.reduce((sum, district) => sum + district.xp, 0),
    districts,
  };
};

const dateKeyFromUtc = (date) => [
  date.getUTCFullYear(),
  padDatePart(date.getUTCMonth() + 1),
  padDatePart(date.getUTCDate()),
].join('-');

const subtractUtcDays = (dateKey, dayCount) => {
  const timestamp = Date.parse(`${dateKey}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    return dateKey;
  }

  return dateKeyFromUtc(new Date(timestamp - dayCount * 24 * 60 * 60 * 1000));
};

const buildActivityProjection = async (database, campaignId) => {
  const rows = await database.select(
    `
      SELECT session_date
      FROM daily_sessions
      WHERE campaign_id = ?
        AND status IN ('active', 'completed')
      GROUP BY session_date
      ORDER BY session_date DESC
    `,
    [campaignId],
  );
  const sessionDates = rows.map((row) => row.session_date).filter(Boolean);
  const sessionDateSet = new Set(sessionDates);
  const today = todayDate();
  let cursor = sessionDateSet.has(today) ? today : subtractUtcDays(today, 1);
  let streakDays = 0;

  while (sessionDateSet.has(cursor)) {
    streakDays += 1;
    cursor = subtractUtcDays(cursor, 1);
  }

  return {
    streakDays,
    lastSessionDate: sessionDates[0] ?? null,
    activeSessionDayCount: sessionDates.length,
  };
};

const computeRouteCompletion = async (database, campaignId, specializationId) => {
  await assertSpecialization(database, campaignId, specializationId);
  const rows = await database.select(
    `
      SELECT
        route_nodes.id,
        route_nodes.node_id,
        route_nodes.knowledge_node_id,
        route_nodes.required_mastery_level,
        route_nodes.route_label,
        route_nodes.route_order,
        route_nodes.route_stage,
        route_nodes.is_required,
        nodes.is_archived AS node_is_archived,
        nodes.title AS node_title,
        skills.name AS skill_name,
        directions.name AS direction_name,
        spheres.name AS sphere_name,
        knowledge_nodes.title AS knowledge_title,
        MAX(
          CASE mastery_events.mastery_level
            WHEN 'seen' THEN 1
            WHEN 'understood' THEN 2
            WHEN 'remembered' THEN 3
            WHEN 'applied' THEN 4
            WHEN 'confirmed' THEN 5
            WHEN 'retained' THEN 6
            ELSE 0
          END
        ) AS active_mastery_rank,
        nodes.last_touched_at,
        review_states.current_risk AS review_current_risk,
        review_states.next_due_at AS review_next_due_at,
        (
          SELECT MAX(
            CASE self_events.mastery_level
              WHEN 'seen' THEN 1
              WHEN 'understood' THEN 2
              WHEN 'remembered' THEN 3
              WHEN 'applied' THEN 4
              WHEN 'confirmed' THEN 5
              WHEN 'retained' THEN 6
              ELSE 0
            END
          )
          FROM mastery_events self_events
          WHERE self_events.campaign_id = ?
            AND self_events.active = 1
            AND self_events.source_type = 'self_marked'
            AND (
              (route_nodes.node_id IS NOT NULL AND self_events.node_id = route_nodes.node_id)
              OR (
                route_nodes.node_id IS NULL
                AND route_nodes.knowledge_node_id IS NOT NULL
                AND self_events.knowledge_node_id = route_nodes.knowledge_node_id
              )
            )
        ) AS self_marked_mastery_rank,
        (
          SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
          FROM mastery_events verified_events
          WHERE verified_events.campaign_id = ?
            AND verified_events.active = 1
            AND verified_events.source_type IN ('legacy_node_completion', 'assessment')
            AND (
              (route_nodes.node_id IS NOT NULL AND verified_events.node_id = route_nodes.node_id)
              OR (
                route_nodes.node_id IS NULL
                AND route_nodes.knowledge_node_id IS NOT NULL
                AND verified_events.knowledge_node_id = route_nodes.knowledge_node_id
              )
            )
        ) AS has_verified_mastery,
        (
          SELECT MAX(failed_attempts.created_at)
          FROM assessment_attempts failed_attempts
          WHERE failed_attempts.campaign_id = ?
            AND failed_attempts.passed = 0
            AND route_nodes.node_id IS NOT NULL
            AND failed_attempts.node_id = route_nodes.node_id
        ) AS latest_failed_assessment_at,
        (
          SELECT MAX(passed_attempts.created_at)
          FROM assessment_attempts passed_attempts
          WHERE passed_attempts.campaign_id = ?
            AND passed_attempts.passed = 1
            AND route_nodes.node_id IS NOT NULL
            AND passed_attempts.node_id = route_nodes.node_id
        ) AS latest_passed_assessment_at,
        (
          SELECT MAX(failed_events.occurred_at)
          FROM daily_session_events failed_events
          JOIN daily_sessions failed_sessions ON failed_sessions.id = failed_events.session_id
          WHERE failed_sessions.campaign_id = ?
            AND failed_events.event_type = 'failed'
            AND route_nodes.node_id IS NOT NULL
            AND failed_events.node_id = route_nodes.node_id
        ) AS latest_failed_run_at,
        (
          SELECT MAX(completed_events.occurred_at)
          FROM daily_session_events completed_events
          JOIN daily_sessions completed_sessions ON completed_sessions.id = completed_events.session_id
          WHERE completed_sessions.campaign_id = ?
            AND completed_events.event_type = 'completed'
            AND route_nodes.node_id IS NOT NULL
            AND completed_events.node_id = route_nodes.node_id
        ) AS latest_completed_run_at
      FROM specialization_route_nodes route_nodes
      LEFT JOIN nodes ON nodes.id = route_nodes.node_id
      LEFT JOIN skills ON skills.id = nodes.skill_id
      LEFT JOIN directions ON directions.id = skills.direction_id
      LEFT JOIN spheres ON spheres.id = directions.sphere_id
      LEFT JOIN knowledge_nodes ON knowledge_nodes.id = route_nodes.knowledge_node_id
      LEFT JOIN review_states ON review_states.node_id = nodes.id
      LEFT JOIN mastery_events ON mastery_events.campaign_id = ?
        AND mastery_events.active = 1
        AND mastery_events.source_type IN ('legacy_node_completion', 'assessment')
        AND (
          (route_nodes.node_id IS NOT NULL AND mastery_events.node_id = route_nodes.node_id)
          OR (
            route_nodes.node_id IS NULL
            AND route_nodes.knowledge_node_id IS NOT NULL
            AND mastery_events.knowledge_node_id = route_nodes.knowledge_node_id
          )
        )
      WHERE route_nodes.specialization_id = ?
      GROUP BY route_nodes.id
      ORDER BY COALESCE(route_nodes.route_order, route_nodes.id) ASC, route_nodes.id ASC
    `,
    [campaignId, campaignId, campaignId, campaignId, campaignId, campaignId, campaignId, specializationId],
  );

  const items = rows.map((row) => {
    const activeMasteryRank = Number(row.active_mastery_rank ?? 0);
    const requiredRank = masteryLevelRank(row.required_mastery_level) + 1;
    const isArchivedLocalNode = row.node_id != null && Number(row.node_is_archived ?? 0) === 1;
    return {
      id: row.id,
      node_id: row.node_id ?? null,
      knowledge_node_id: row.knowledge_node_id ?? null,
      title: row.node_title ?? row.knowledge_title ?? row.route_label ?? 'Route node',
      path: [row.sphere_name, row.direction_name, row.skill_name].filter(Boolean).join(' / '),
      required_mastery_level: row.required_mastery_level,
      route_order: Number(row.route_order ?? row.id ?? 0),
      route_stage: row.route_stage ?? null,
      current_mastery_level: masteryLevelFromRank(activeMasteryRank),
      current_mastery_rank: activeMasteryRank,
      self_marked_mastery_rank: Number(row.self_marked_mastery_rank ?? 0),
      has_verified_mastery: Number(row.has_verified_mastery ?? 0),
      latest_failed_assessment_at: row.latest_failed_assessment_at ?? null,
      latest_passed_assessment_at: row.latest_passed_assessment_at ?? null,
      latest_failed_run_at: row.latest_failed_run_at ?? null,
      latest_completed_run_at: row.latest_completed_run_at ?? null,
      review_current_risk: row.review_current_risk ?? null,
      review_next_due_at: row.review_next_due_at ?? null,
      last_touched_at: row.last_touched_at ?? null,
      is_required: Number(row.is_required ?? 1),
      is_complete: activeMasteryRank >= requiredRank,
      is_actionable: !isArchivedLocalNode,
    };
  });
  const required = items.filter((item) => item.is_required === 1);
  const incomplete = required.filter((item) => !item.is_complete);

  return {
    routeNodeCount: rows.length,
    requiredNodeCount: required.length,
    completedRequiredNodeCount: required.length - incomplete.length,
    isComplete: required.length > 0 && incomplete.length === 0,
    items,
    nextItem: items.find((item) => item.is_required === 1 && !item.is_complete && item.is_actionable) ?? null,
    incomplete,
  };
};

const buildOpponentProjection = (specialization, routeCompletion) => {
  if (!specialization) {
    return null;
  }
  const startedAt = Date.parse(specialization.started_at ?? specialization.created_at ?? currentTimestamp());
  const daysElapsed = Number.isFinite(startedAt)
    ? Math.max(0, Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24)))
    : 0;
  const requiredNodeCount = Number(routeCompletion?.requiredNodeCount ?? 0);
  const projectedRequired = requiredNodeCount > 0
    ? Math.min(requiredNodeCount, Math.max(1, Math.ceil((daysElapsed + 1) * 0.6)))
    : 0;
  const pressure = requiredNodeCount > 0 ? Math.round((projectedRequired / requiredNodeCount) * 100) : 0;

  return {
    specialization_id: specialization.id,
    daysElapsed,
    projectedRequired,
    pressure: Math.min(100, pressure),
    score: projectedRequired * 10,
  };
};

const routeMasteryGap = (item) =>
  Math.max(0, masteryLevelRank(item.required_mastery_level) + 1 - Number(item.current_mastery_rank ?? 0));

const RECOVERY_STALE_DAYS = 14;

const weakSpotSignalsForRouteItem = (item) => {
  const signals = [];

  if (
    isAfterTimestamp(item.latest_failed_assessment_at, item.latest_passed_assessment_at) &&
    isAfterTimestamp(item.latest_failed_assessment_at, item.latest_completed_run_at)
  ) {
    signals.push({
      source: 'failed_assessment',
      label: 'Проверку нужно повторить',
      priority: 60,
    });
  }

  if (isAfterTimestamp(item.latest_failed_run_at, item.latest_completed_run_at)) {
    signals.push({
      source: 'failed_attempt',
      label: 'Повтор задач дня готов',
      priority: 55,
    });
  }

  if (
    item.review_current_risk === 'high' ||
    item.review_current_risk === 'medium' ||
    isPastDue(item.review_next_due_at) ||
    (item.last_touched_at != null && isOlderThanDays(item.last_touched_at, RECOVERY_STALE_DAYS))
  ) {
    signals.push({
      source: 'stale',
      label: 'Освежить, чтобы удержать',
      priority: 45,
    });
  }

  if (Number(item.self_marked_mastery_rank ?? 0) > 0 && Number(item.has_verified_mastery ?? 0) !== 1) {
    signals.push({
      source: 'self_marked_unverified',
      label: 'Подтвердить ручную отметку',
      priority: 50,
    });
  }

  if (routeMasteryGap(item) > 0) {
    signals.push({
      source: 'low_mastery',
      label: 'Укрепить основу маршрута',
      priority: 20,
    });
  }

  return signals.sort((left, right) => right.priority - left.priority);
};

const buildRoutePlannerProjection = (routeCompletion) => {
  if (!routeCompletion) {
    return null;
  }

  const incompleteRequired = routeCompletion.items.filter(
    (item) => item.is_required === 1 && !item.is_complete && item.is_actionable,
  );
  const focusItem = routeCompletion.nextItem ?? incompleteRequired[0] ?? null;
  const focusIndex = focusItem
    ? Math.max(0, incompleteRequired.findIndex((item) => item.id === focusItem.id))
    : 0;
  const nextItems = incompleteRequired.slice(focusIndex, focusIndex + 3);
  const currentStage = focusItem?.route_stage ?? null;
  const currentStageItems = currentStage
    ? routeCompletion.items
        .filter((item) => item.route_stage === currentStage)
    : focusItem
      ? routeCompletion.items.filter((item) => item.route_stage == null && item.id === focusItem.id)
      : [];
  const recoveryCandidates = routeCompletion.items.filter(
    (item) => item.is_required === 1 && item.is_actionable && item.id !== focusItem?.id,
  );
  const weakSpots = recoveryCandidates
    .filter((item) => item.id !== focusItem?.id)
    .map((item) => {
      const signals = weakSpotSignalsForRouteItem(item);
      return {
        ...item,
        weak_spot_sources: signals.map((signal) => signal.source),
        weak_spot_reason: signals[0]?.source ?? 'low_mastery',
        weak_spot_reason_label: signals[0]?.label ?? 'Укрепить основу маршрута',
        weak_spot_priority: signals[0]?.priority ?? 0,
      };
    })
    .filter((item) => item.weak_spot_sources.length > 0)
    .sort((left, right) => {
      const priorityDelta = Number(right.weak_spot_priority ?? 0) - Number(left.weak_spot_priority ?? 0);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      const gapDelta = routeMasteryGap(right) - routeMasteryGap(left);
      if (gapDelta !== 0) {
        return gapDelta;
      }
      return Number(left.current_mastery_rank ?? 0) - Number(right.current_mastery_rank ?? 0) || left.id - right.id;
    })
    .slice(0, 3);
  const readyToVerify = incompleteRequired
    .filter((item) => {
      const requiredRank = masteryLevelRank(item.required_mastery_level) + 1;
      return Number(item.current_mastery_rank ?? 0) >= Math.max(1, requiredRank - 1);
    })
    .slice(0, 3);

  return {
    focusItem,
    currentStage,
    currentStageItems,
    nextItems,
    weakSpots,
    readyToVerify,
    hasRouteItems: routeCompletion.routeNodeCount > 0,
  };
};

const createTodayState = (key, label, title, reason, primaryCta, content) => ({
  key,
  label,
  title,
  reason,
  primaryCta,
  content,
});

const buildTodayStateProjection = ({ career, metrics, city, route, planner, primaryRecommendation }) => {
  const currentSpecialization = career.currentSpecialization ?? null;
  const content = {
    hasContent: false,
    nodeCount: Number(metrics?.nodes ?? 0),
    openActionCount: Number(metrics?.actions ?? 0),
    totalXp: Number(city?.totalXp ?? 0),
    verifiedNodeCount: Number(career.mastery?.verifiedNodeCount ?? 0),
    selfMarkedOnlyNodeCount: Number(career.mastery?.selfMarkedOnlyNodeCount ?? 0),
    routeNodeCount: Number(route?.routeNodeCount ?? 0),
  };
  content.hasContent =
    content.nodeCount > 0 ||
    content.openActionCount > 0 ||
    content.totalXp > 0 ||
    content.verifiedNodeCount > 0 ||
    content.selfMarkedOnlyNodeCount > 0 ||
    content.routeNodeCount > 0;

  if (career.campaign.career_status === 'victory' || currentSpecialization?.status === 'completed') {
    return createTodayState(
      'completed_route',
      'Маршрут закрыт',
      'Начните следующий маршрут',
      'Текущий маршрут уже завершен, поэтому «Сегодня» не выбирает новый узел внутри него.',
      { action: 'continue_route', label: 'Новый маршрут' },
      content,
    );
  }

  if (route?.isComplete) {
    return createTodayState(
      'completed_route',
      'Готово к закрытию',
      'Завершите текущий маршрут',
      'Все обязательные узлы проверены. Завершение закроет только этот активный маршрут.',
      { action: 'complete_route', label: 'Завершить маршрут' },
      content,
    );
  }

  if (currentSpecialization?.status === 'active') {
    const focusItem = planner?.focusItem ?? route?.nextItem ?? null;
    if (focusItem?.node_id != null) {
      return createTodayState(
        'active_route',
        'Следующий узел',
        focusItem.title,
        `${focusItem.route_stage ? `${focusItem.route_stage} · ` : ''}${
          focusItem.path || 'Концепт маршрута'
        } · сейчас ${focusItem.current_mastery_rank}/6 · нужно ${masteryLevelLabel(focusItem.required_mastery_level)}`,
        { action: 'open_route_node', label: 'Открыть узел' },
        content,
      );
    }

    if (route?.routeNodeCount > 0) {
      return createTodayState(
        'route_incomplete',
        'Маршрут требует настройки',
        'Проверьте узлы маршрута',
        'В маршруте есть узлы, но «Сегодня» не нашел безопасный обязательный следующий узел.',
        { action: 'open_route_map', label: 'Открыть маршрут' },
        content,
      );
    }

    return createTodayState(
      'no_route',
      'Маршрут не собран',
      'Добавьте обязательные узлы',
      'Специализация активна, но ее дневной маршрут пока пустой.',
      { action: 'open_route_map', label: 'Добавить узлы' },
      content,
    );
  }

  if (primaryRecommendation) {
    return createTodayState(
      'free_mode',
      'Свободный режим',
      primaryRecommendation.actionTitle,
      `${primaryRecommendation.whatDegrades || primaryRecommendation.nodeTitle} · ${[
        primaryRecommendation.sphereName,
        primaryRecommendation.directionName,
        primaryRecommendation.skillName,
      ]
        .filter(Boolean)
        .join(' / ')}`,
      { action: 'open_recommendation_map', label: 'Открыть рекомендацию' },
      content,
    );
  }

  if (content.hasContent) {
    return createTodayState(
      'content_without_day_plan',
      'План дня не собран',
      'Выберите маршрут или узел на карте',
      `В кампании есть ${content.nodeCount} узл. и ${content.totalXp} XP, но нет активного маршрута или готовой рекомендации на сегодня.`,
      { action: 'open_route_map', label: 'Открыть карту' },
      content,
    );
  }

  return createTodayState(
    'truly_empty',
    'Пока нет карты',
    'Создайте стартовый набор',
    'В этой кампании еще нет узлов, маршрута и проверенного прогресса.',
    { action: 'create_starter', label: 'Создать набор' },
    content,
  );
};

const buildTodayGameSnapshot = async (database, campaignId, career, metrics, primaryRecommendation, routeCompletionOverride = undefined) => {
  const currentSpecialization = career.currentSpecialization ?? null;
  const hasActiveSpecialization = currentSpecialization?.status === 'active';
  const [routeCompletion, city, activity] = await Promise.all([
    routeCompletionOverride !== undefined
      ? Promise.resolve(routeCompletionOverride)
      : currentSpecialization
      ? computeRouteCompletion(database, campaignId, currentSpecialization.id)
      : Promise.resolve(null),
    buildCityProjection(database, campaignId),
    buildActivityProjection(database, campaignId),
  ]);
  const route = routeCompletion
    ? {
        routeNodeCount: routeCompletion.routeNodeCount,
        requiredNodeCount: routeCompletion.requiredNodeCount,
        completedRequiredNodeCount: routeCompletion.completedRequiredNodeCount,
        completionPercent:
          routeCompletion.requiredNodeCount > 0
            ? Math.round((routeCompletion.completedRequiredNodeCount / routeCompletion.requiredNodeCount) * 100)
            : 0,
        isComplete: routeCompletion.isComplete,
        items: routeCompletion.items,
        nextItem: routeCompletion.nextItem,
      }
    : null;
  const planner = hasActiveSpecialization ? buildRoutePlannerProjection(routeCompletion) : null;

  return {
    currentSpecialization,
    careerStatus: career.campaign.career_status,
    mastery: career.mastery,
    race: buildRaceProjection(career.campaign, currentSpecialization),
    route,
    planner,
    state: buildTodayStateProjection({ career, metrics, city, route, planner, primaryRecommendation }),
    city,
    activity,
    opponent: buildOpponentProjection(currentSpecialization, routeCompletion),
  };
};

const createSpecializationRecord = async (database, campaignId, input = {}) => {
  await assertCampaign(database, campaignId);
  const existingActive = await activeSpecializationForCampaign(database, campaignId);
  if (existingActive) {
    throw new Error('Campaign already has an active specialization.');
  }

  const timestamp = currentTimestamp();
  const name = String(input.name ?? '').trim() || 'New specialization';
  const key = slugKey(input.key ?? name);
  const status = input.status ?? 'active';

  if (!['active', 'paused'].includes(status)) {
    throw new Error('New specialization must start active or paused.');
  }

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
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `,
    [
      campaignId,
      name,
      key,
      input.domain ?? null,
      input.length ?? 'medium',
      status,
      status === 'active' ? timestamp : null,
      timestamp,
      timestamp,
    ],
  );

  const [specialization] = await database.select(
    'SELECT * FROM career_specializations WHERE campaign_id = ? AND key = ? LIMIT 1',
    [campaignId, key],
  );

  if (status === 'active') {
    await database.execute(
      `
        UPDATE campaigns
        SET current_specialization_id = ?,
            career_status = 'active',
            mode = 'career',
            updated_at = ?
        WHERE id = ?
      `,
      [specialization.id, timestamp, campaignId],
    );
  }

  return specialization;
};

const validateNodeInCampaign = async (database, nodeId, campaignId) => {
  const node = await loadNodeMasteryBoundary(database, nodeId);
  if (!node || node.campaign_id !== campaignId) {
    throw new Error('Node does not belong to the selected campaign.');
  }
  return node;
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object ?? {}, key);

const normalizeNullableId = (value) => {
  if (value == null || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
};

const assertRouteKnowledgeIdentityCanChange = async (database, campaignId, nodeId, nextKnowledgeNodeId) => {
  const rows = await database.select(
    `
      SELECT route_nodes.id, route_nodes.knowledge_node_id
      FROM specialization_route_nodes route_nodes
      JOIN career_specializations specializations ON specializations.id = route_nodes.specialization_id
      WHERE route_nodes.node_id = ?
        AND route_nodes.knowledge_node_id IS NOT NULL
        AND route_nodes.knowledge_node_id IS NOT ?
        AND specializations.campaign_id = ?
        AND specializations.status != 'archived'
      LIMIT 1
    `,
    [nodeId, nextKnowledgeNodeId, campaignId],
  );

  if (rows[0]) {
    throw new Error('Node knowledge identity is locked by an existing route item.');
  }
};

const upsertKnowledgeNode = async (database, input = {}) => {
  const timestamp = currentTimestamp();
  const key = slugKey(input.key ?? input.title ?? 'knowledge-node', 'knowledge-node');
  const title = String(input.title ?? key).trim() || key;
  const existing = await database.select('SELECT * FROM knowledge_nodes WHERE key = ? LIMIT 1', [key]);

  if (existing[0]) {
    await database.execute(
      `
        UPDATE knowledge_nodes
        SET title = ?,
            domain = ?,
            summary = ?,
            updated_at = ?
        WHERE id = ?
      `,
      [title, input.domain ?? existing[0].domain ?? null, input.summary ?? existing[0].summary ?? null, timestamp, existing[0].id],
    );
    return (await database.select('SELECT * FROM knowledge_nodes WHERE id = ? LIMIT 1', [existing[0].id]))[0];
  }

  await database.execute(
    `
      INSERT INTO knowledge_nodes (key, title, domain, summary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [key, title, input.domain ?? null, input.summary ?? null, timestamp, timestamp],
  );

  return (await database.select('SELECT * FROM knowledge_nodes WHERE key = ? LIMIT 1', [key]))[0];
};

const hasRouteNodeMetadataPatch = (input = {}) =>
  input.required_mastery_level !== undefined ||
  input.requiredMasteryLevel !== undefined ||
  input.route_order !== undefined ||
  input.routeOrder !== undefined ||
  input.route_stage !== undefined ||
  input.routeStage !== undefined ||
  input.route_label !== undefined ||
  input.routeLabel !== undefined ||
  input.is_required !== undefined ||
  input.isRequired !== undefined;

const addRouteNode = async (database, campaignId, specializationId, input = {}) => {
  const specialization = await assertSpecialization(database, campaignId, specializationId);
  if (specialization.status !== 'active') {
    throw new Error('Route nodes can only be added to an active specialization.');
  }
  const timestamp = currentTimestamp();
  const knowledgeNodeId = input.knowledge_node_id ?? input.knowledgeNodeId ?? null;
  let nodeId = input.node_id ?? input.nodeId ?? null;
  let routeNode = null;

  if (nodeId != null) {
    routeNode = await validateNodeInCampaign(database, nodeId, campaignId);
    if (knowledgeNodeId != null && routeNode.knowledge_node_id !== knowledgeNodeId) {
      throw new Error('Route node knowledge identity does not match the selected node.');
    }
  }

  if (knowledgeNodeId != null && nodeId == null) {
    const existingNode = await database.select(
      `
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
          AND nodes.knowledge_node_id = ?
          AND nodes.is_archived = 0
        ORDER BY nodes.id ASC
        LIMIT 1
      `,
      [campaignId, knowledgeNodeId],
    );
    nodeId = existingNode[0]?.id ?? null;
  }

  const existing = await database.select(
    `
      SELECT *
      FROM specialization_route_nodes
      WHERE specialization_id = ?
        AND (
          (? IS NOT NULL AND knowledge_node_id = ?)
          OR (? IS NULL AND ? IS NOT NULL AND knowledge_node_id IS NULL AND node_id = ?)
        )
      LIMIT 1
    `,
    [specializationId, knowledgeNodeId, knowledgeNodeId, knowledgeNodeId, nodeId, nodeId],
  );

  if (existing[0]) {
    if (hasRouteNodeMetadataPatch(input)) {
      return updateRouteNode(database, campaignId, existing[0].id, input);
    }
    return existing[0];
  }

  const requestedRouteOrder = input.route_order ?? input.routeOrder ?? null;
  let routeOrder = requestedRouteOrder == null ? null : Number(requestedRouteOrder);
  if (routeOrder != null && !Number.isFinite(routeOrder)) {
    throw new Error('Route order must be a finite number.');
  }
  if (routeOrder == null) {
    const orderRows = await database.select(
      'SELECT COALESCE(MAX(route_order), MAX(id), 0) AS max_order FROM specialization_route_nodes WHERE specialization_id = ?',
      [specializationId],
    );
    routeOrder = Number(orderRows[0]?.max_order ?? 0) + 10;
  }
  const routeStage = input.route_stage ?? input.routeStage ?? null;
  const isRequired = input.is_required ?? input.isRequired;

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      specializationId,
      nodeId,
      knowledgeNodeId,
      input.required_mastery_level ?? input.requiredMasteryLevel ?? 'confirmed',
      input.route_label ?? input.routeLabel ?? null,
      Math.trunc(routeOrder),
      routeStage == null ? null : String(routeStage).trim() || null,
      isRequired === false || isRequired === 0 ? 0 : 1,
      timestamp,
      timestamp,
    ],
  );

  const rows = await database.select(
    'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? ORDER BY id DESC LIMIT 1',
    [specializationId],
  );
  return rows[0] ?? null;
};

const loadActiveRouteNode = async (database, campaignId, routeNodeId) => {
  const rows = await database.select(
    `
      SELECT route_nodes.*, specializations.status AS specialization_status
      FROM specialization_route_nodes route_nodes
      JOIN career_specializations specializations ON specializations.id = route_nodes.specialization_id
      WHERE route_nodes.id = ?
        AND specializations.campaign_id = ?
      LIMIT 1
    `,
    [routeNodeId, campaignId],
  );
  const routeNode = rows[0] ?? null;
  if (!routeNode) {
    throw new Error('Route node does not belong to this campaign.');
  }
  if (routeNode.specialization_status !== 'active') {
    throw new Error('Route nodes can only be changed in an active specialization.');
  }
  return routeNode;
};

const updateRouteNode = async (database, campaignId, routeNodeId, input = {}) => {
  await loadActiveRouteNode(database, campaignId, routeNodeId);
  const timestamp = currentTimestamp();
  const patch = {};

  if (input.required_mastery_level !== undefined || input.requiredMasteryLevel !== undefined) {
    const requiredMasteryLevel = input.required_mastery_level ?? input.requiredMasteryLevel;
    assertMasteryLevel(requiredMasteryLevel);
    patch.required_mastery_level = requiredMasteryLevel;
  }

  if (input.route_label !== undefined || input.routeLabel !== undefined) {
    const routeLabel = input.route_label ?? input.routeLabel;
    patch.route_label = routeLabel == null ? null : String(routeLabel).trim() || null;
  }

  if (input.route_order !== undefined || input.routeOrder !== undefined) {
    const routeOrder = Number(input.route_order ?? input.routeOrder);
    if (!Number.isFinite(routeOrder)) {
      throw new Error('Route order must be a finite number.');
    }
    patch.route_order = Math.trunc(routeOrder);
  }

  if (input.route_stage !== undefined || input.routeStage !== undefined) {
    const routeStage = input.route_stage ?? input.routeStage;
    patch.route_stage = routeStage == null ? null : String(routeStage).trim() || null;
  }

  if (input.is_required !== undefined || input.isRequired !== undefined) {
    const isRequired = input.is_required ?? input.isRequired;
    patch.is_required = isRequired === false || isRequired === 0 ? 0 : 1;
  }

  if (Object.keys(patch).length === 0) {
    return loadActiveRouteNode(database, campaignId, routeNodeId);
  }

  await database.execute(
    `
      UPDATE specialization_route_nodes
      SET required_mastery_level = COALESCE(?, required_mastery_level),
          route_label = CASE WHEN ? THEN ? ELSE route_label END,
          route_order = COALESCE(?, route_order),
          route_stage = CASE WHEN ? THEN ? ELSE route_stage END,
          is_required = COALESCE(?, is_required),
          updated_at = ?
      WHERE id = ?
    `,
    [
      patch.required_mastery_level ?? null,
      Object.prototype.hasOwnProperty.call(patch, 'route_label') ? 1 : 0,
      patch.route_label ?? null,
      patch.route_order ?? null,
      Object.prototype.hasOwnProperty.call(patch, 'route_stage') ? 1 : 0,
      patch.route_stage ?? null,
      patch.is_required ?? null,
      timestamp,
      routeNodeId,
    ],
  );

  return loadActiveRouteNode(database, campaignId, routeNodeId);
};

const removeRouteNode = async (database, campaignId, routeNodeId) => {
  const routeNode = await loadActiveRouteNode(database, campaignId, routeNodeId);
  await database.execute(
    `
      DELETE FROM specialization_route_edges
      WHERE source_route_node_id = ?
         OR target_route_node_id = ?
    `,
    [routeNodeId, routeNodeId],
  );
  await database.execute('DELETE FROM specialization_route_nodes WHERE id = ?', [routeNodeId]);
  return routeNode;
};

const reorderRouteNodes = async (database, campaignId, firstRouteNodeId, secondRouteNodeId) => {
  if (firstRouteNodeId === secondRouteNodeId) {
    return [];
  }
  const first = await loadActiveRouteNode(database, campaignId, firstRouteNodeId);
  const second = await loadActiveRouteNode(database, campaignId, secondRouteNodeId);
  if (first.specialization_id !== second.specialization_id) {
    throw new Error('Route nodes must belong to the same specialization.');
  }

  const firstOrder = Number(first.route_order ?? first.id);
  const secondOrder = Number(second.route_order ?? second.id);
  const timestamp = currentTimestamp();

  await database.execute(
    `
      UPDATE specialization_route_nodes
      SET route_order = CASE
            WHEN id = ? THEN ?
            WHEN id = ? THEN ?
            ELSE route_order
          END,
          updated_at = ?
      WHERE id IN (?, ?)
    `,
    [first.id, secondOrder, second.id, firstOrder, timestamp, first.id, second.id],
  );

  return database.select(
    `
      SELECT *
      FROM specialization_route_nodes
      WHERE id IN (?, ?)
      ORDER BY COALESCE(route_order, id) ASC, id ASC
    `,
    [first.id, second.id],
  );
};

const createAssessmentXpGrant = async (database, node, masteryEventResult, attempt, timestamp) => {
  if (!masteryEventResult?.masteryEventId || attempt.check_method === 'self_marked') {
    return { status: 'skipped' };
  }

  return upsertXpGrantForNode(database, node, {
    grantReason: ASSESSMENT_MASTERY_GRANT_REASON,
    masteryEventId: masteryEventResult.masteryEventId,
    assessmentAttemptId: attempt.id,
    timestamp,
  });
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

    const [metrics, rawCandidates, todaySession, career] = await Promise.all([
      loadMetrics(database, resolvedCampaignId),
      loadCandidateRows(database, resolvedCampaignId),
      loadTodaySession(database, dailySessionStore, resolvedCampaignId),
      buildCareerSnapshot(database, resolvedCampaignId),
    ]);

    const currentSpecialization = career.currentSpecialization ?? null;
    const routeCompletion = currentSpecialization
      ? await computeRouteCompletion(database, resolvedCampaignId, currentSpecialization.id)
      : null;
    const activeRouteCompletion = currentSpecialization?.status === 'active' ? routeCompletion : null;
    const rankedCandidates = prioritizeRouteFocusCandidate(rankCandidates(rawCandidates), activeRouteCompletion);

    return {
      metrics,
      primaryRecommendation: rankedCandidates[0] ?? null,
      queue: rankedCandidates.slice(1, 1 + MAX_QUEUE_ITEMS),
      todaySession,
      today: await buildTodayGameSnapshot(database, resolvedCampaignId, career, metrics, rankedCandidates[0] ?? null, routeCompletion),
    };
  },

  async getCareerSnapshot(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    return buildCareerSnapshot(database, resolvedCampaignId);
  },

  async createSpecialization(campaignId, input = {}) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    return runTransaction(database, async () => createSpecializationRecord(database, resolvedCampaignId, input));
  },

  async continueWithSpecialization(campaignId, input = {}) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    return runTransaction(database, async () => createSpecializationRecord(database, resolvedCampaignId, input));
  },

  async completeSpecialization(campaignId, specializationId = null, options = {}) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const specialization =
      specializationId == null
        ? await loadCurrentSpecialization(database, resolvedCampaignId)
        : await assertSpecialization(database, resolvedCampaignId, specializationId);

    if (!specialization) {
      throw new Error('No current specialization to complete.');
    }

    if (specialization.status !== 'active') {
      throw new Error('Only an active specialization can be completed.');
    }

    const routeCompletion = await computeRouteCompletion(database, resolvedCampaignId, specialization.id);
    if (!routeCompletion.isComplete && !options.force) {
      throw new Error('Specialization route is not complete.');
    }

    const timestamp = currentTimestamp();
    return runTransaction(database, async () => {
      await database.execute(
        `
          UPDATE career_specializations
          SET status = 'completed',
              completed_at = ?,
              updated_at = ?
          WHERE id = ?
            AND campaign_id = ?
        `,
        [timestamp, timestamp, specialization.id, resolvedCampaignId],
      );
      await database.execute(
        `
          UPDATE campaigns
          SET current_specialization_id = ?,
              career_status = 'victory',
              updated_at = ?
          WHERE id = ?
        `,
        [specialization.id, timestamp, resolvedCampaignId],
      );
      return {
        specialization: (await loadSpecialization(database, resolvedCampaignId, specialization.id)),
        routeCompletion,
        career: await buildCareerSnapshot(database, resolvedCampaignId),
      };
    });
  },

  async archiveSpecialization(campaignId, specializationId) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const specialization = await assertSpecialization(database, resolvedCampaignId, specializationId);
    const campaign = await assertCampaign(database, resolvedCampaignId);

    if (campaign.current_specialization_id === specialization.id && ['active', 'paused'].includes(specialization.status)) {
      throw new Error('Current active or paused specialization cannot be archived without choosing another route.');
    }

    const timestamp = currentTimestamp();
    return runTransaction(database, async () => {
      await database.execute(
        `
          UPDATE career_specializations
          SET status = 'archived',
              updated_at = ?
          WHERE id = ?
            AND campaign_id = ?
        `,
        [timestamp, specialization.id, resolvedCampaignId],
      );

      if (campaign.current_specialization_id === specialization.id && specialization.status === 'completed') {
        await database.execute(
          `
            UPDATE campaigns
            SET current_specialization_id = NULL,
                career_status = 'victory',
                updated_at = ?
            WHERE id = ?
          `,
          [timestamp, resolvedCampaignId],
        );
      }

      return buildCareerSnapshot(database, resolvedCampaignId);
    });
  },

  async getRouteCompletion(campaignId, specializationId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    const specialization =
      specializationId == null
        ? await loadCurrentSpecialization(database, resolvedCampaignId)
        : await assertSpecialization(database, resolvedCampaignId, specializationId);
    if (!specialization) {
      return null;
    }
    return computeRouteCompletion(database, resolvedCampaignId, specialization.id);
  },

  async upsertKnowledgeNode(input = {}) {
    return upsertKnowledgeNode(database, input);
  },

  async addSpecializationRouteNode(campaignId, specializationId, input = {}) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    return addRouteNode(database, resolvedCampaignId, specializationId, input);
  },

  async updateSpecializationRouteNode(campaignId, routeNodeId, input = {}) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    return runTransaction(database, async () => updateRouteNode(database, resolvedCampaignId, routeNodeId, input));
  },

  async reorderSpecializationRouteNodes(campaignId, firstRouteNodeId, secondRouteNodeId) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    return runTransaction(database, async () =>
      reorderRouteNodes(database, resolvedCampaignId, firstRouteNodeId, secondRouteNodeId),
    );
  },

  async removeSpecializationRouteNode(campaignId, routeNodeId) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    return runTransaction(database, async () => removeRouteNode(database, resolvedCampaignId, routeNodeId));
  },

  async submitAssessmentAttempt(campaignId, input = {}) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const node = await validateNodeInCampaign(database, input.node_id ?? input.nodeId, resolvedCampaignId);
    const specializationId = input.specialization_id ?? input.specializationId ?? (await loadCurrentSpecialization(database, resolvedCampaignId))?.id ?? null;
    if (specializationId != null) {
      await assertSpecialization(database, resolvedCampaignId, specializationId);
    }

    const checkMethod = input.check_method ?? input.checkMethod ?? 'strict';
    if (!['strict', 'llm_assisted'].includes(checkMethod)) {
      throw new Error('Unsupported assessment check method.');
    }

    const targetMasteryLevel = input.target_mastery_level ?? input.targetMasteryLevel ?? 'understood';
    assertMasteryLevel(targetMasteryLevel);
    const timestamp = currentTimestamp();
    const taskId = String(input.task_id ?? input.taskId ?? `node:${node.id}:assessment`);
    const assessmentTask = assessmentTaskFromMetadata(node.check_metadata, taskId);
    const strictCheckType =
      input.strict_check_type ??
      input.strictCheckType ??
      assessmentTask?.strictCheckType ??
      null;
    if (strictCheckType && checkMethod !== 'strict') {
      throw new Error('Strict-checkable tasks cannot be passed through LLM-only checking.');
    }
    const strictCheckResult =
      checkMethod === 'strict' && input.passed !== false
        ? evaluateStrictAssessmentCheck({ strictCheckType, config: assessmentTask ?? {}, input, timestamp })
        : null;
    const evidencePayload = strictCheckResult ? JSON.stringify(strictCheckResult.evidencePayload) : normalizeEvidencePayload(input);
    const explicitIdempotencyKey = input.idempotency_key ?? input.idempotencyKey ?? null;
    if (!explicitIdempotencyKey) {
      throw new Error('Assessment submit requires an idempotency key.');
    }
    const passed = strictCheckResult ? strictCheckResult.passed : Boolean(input.passed);
    const score = strictCheckResult ? strictCheckResult.score : input.score ?? null;
    const feedbackSummary =
      strictCheckResult?.feedbackSummary ?? input.feedback_summary ?? input.feedbackSummary ?? null;
    if (passed && !evidencePayload) {
      throw new Error('Passed assessment requires evidence payload.');
    }
    const idempotencyKey = explicitIdempotencyKey;

    return runTransaction(database, async () => {
      const existing = await database.select(
        'SELECT * FROM assessment_attempts WHERE campaign_id = ? AND idempotency_key = ? LIMIT 1',
        [resolvedCampaignId, idempotencyKey],
      );

      const attempt =
        existing[0] ??
        (await (async () => {
          await database.execute(
            `
              INSERT INTO assessment_attempts (
                campaign_id,
                specialization_id,
                node_id,
                task_id,
                answer_type,
                submitted_answer,
                check_method,
                strict_check_type,
                target_mastery_level,
                passed,
                score,
                feedback_summary,
                evidence_payload,
                idempotency_key,
                created_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              resolvedCampaignId,
              specializationId,
              node.id,
              taskId,
              input.answer_type ?? input.answerType ?? 'text',
              input.submitted_answer ?? input.submittedAnswer ?? null,
              checkMethod,
              strictCheckType,
              targetMasteryLevel,
              passed ? 1 : 0,
              score,
              feedbackSummary,
              evidencePayload,
              idempotencyKey,
              timestamp,
            ],
          );
          return (
            await database.select(
              'SELECT * FROM assessment_attempts WHERE campaign_id = ? AND idempotency_key = ? LIMIT 1',
              [resolvedCampaignId, idempotencyKey],
            )
          )[0];
        })());

      let masteryEvent = null;
      let xpGrantResult = null;
      if (Number(attempt.passed ?? 0) === 1) {
        if (!attempt.evidence_payload) {
          throw new Error('Passed assessment requires evidence payload.');
        }
        masteryEvent = await createOrReactivateMasteryEvent(database, node, {
          masteryLevel: attempt.target_mastery_level,
          specializationId: attempt.specialization_id ?? null,
          sourceType: 'assessment',
          sourceId: attempt.id,
          idempotencyKey: `assessment-mastery:${resolvedCampaignId}:${node.id}:${attempt.id}:${attempt.target_mastery_level}`,
          timestamp,
        });
        xpGrantResult = await createAssessmentXpGrant(database, node, masteryEvent, attempt, timestamp);
      }

      return {
        attempt,
        masteryEvent,
        xpGrantResult,
        xpWarning: buildXpWarning(xpGrantResult),
      };
    });
  },

  async markSelfMastery(campaignId, nodeId, masteryLevel = 'seen') {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const node = await validateNodeInCampaign(database, nodeId, resolvedCampaignId);
    assertMasteryLevel(masteryLevel);

    const timestamp = currentTimestamp();
    return createOrReactivateMasteryEvent(database, node, {
      masteryLevel,
      sourceType: 'self_marked',
      sourceId: node.id,
      idempotencyKey: `self-marked:${resolvedCampaignId}:${node.id}:${masteryLevel}`,
      timestamp,
    });
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const before = await loadNodeMetadata(database, nodeId, resolvedCampaignId);
    if (!before) {
      return null;
    }
    const hasKnowledgeNodePatch = hasOwn(payload, 'knowledge_node_id') || hasOwn(payload, 'knowledgeNodeId');
    if (hasKnowledgeNodePatch) {
      const nextKnowledgeNodeId = normalizeNullableId(payload.knowledge_node_id ?? payload.knowledgeNodeId ?? null);
      if (normalizeNullableId(before.knowledge_node_id) !== nextKnowledgeNodeId) {
        await assertRouteKnowledgeIdentityCanChange(database, resolvedCampaignId, nodeId, nextKnowledgeNodeId);
      }
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
    if (arguments.length === 1) {
      payload = {};
      nodeId = campaignId;
      campaignId = null;
    } else if (arguments.length === 2 && nodeId != null && typeof nodeId === 'object') {
      payload = nodeId;
      nodeId = campaignId;
      campaignId = null;
    } else if (arguments.length === 2) {
      payload = {};
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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

  async restoreNodeEditor(campaignId, nodeId) {
    if (arguments.length === 1) {
      nodeId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const before = await loadNodeMetadata(database, nodeId, resolvedCampaignId);
    if (!before) {
      return null;
    }
    const node = await hierarchyStore.updateNode(nodeId, { is_archived: 0 });

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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const dashboard = await this.getDashboard(resolvedCampaignId);

    if (dashboard.todaySession?.status === 'active') {
      return dashboard.todaySession;
    }

    const tasks = await chooseDailyRunTasks(database, resolvedCampaignId, dashboard, actionId);
    const firstTask = tasks[0] ?? null;

    if (!firstTask) {
      return null;
    }

    const timestamp = currentTimestamp();

    if (firstTask.actionId != null) {
      await hierarchyStore.updateNodeAction(firstTask.actionId, {
        status: 'doing',
        completed_at: null,
        updated_at: timestamp,
      });
    }

    await hierarchyStore.updateNode(firstTask.nodeId, {
      last_touched_at: timestamp,
      updated_at: timestamp,
    });

    const session = await dailySessionStore.createSession({
      campaign_id: resolvedCampaignId,
      session_date: todayDate(),
      status: 'active',
      primary_node_id: firstTask.nodeId,
      primary_action_id: firstTask.actionId,
      started_at: timestamp,
      summary_note: 'Запущено с первой рекомендации экрана «Сейчас».',
    });

    await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'selected',
      node_id: firstTask.nodeId,
      action_id: firstTask.actionId,
      note: 'Выбрано из первой рекомендации экрана «Сейчас».',
    });

    for (const task of tasks.slice(1)) {
      await dailySessionStore.addSessionEvent({
        session_id: session.id,
        event_type: 'selected',
        node_id: task.nodeId,
        action_id: task.actionId,
        note: stringifyDailyRunTaskNote(task),
        occurred_at: timestamp,
      });
    }

    return loadTodaySession(database, dailySessionStore, resolvedCampaignId);
  },

  async recordDailyRunTaskOutcome(campaignId, taskId, outcome, note = '') {
    const normalizedOutcome = normalizeDailyRunTaskOutcome(outcome);

    if (!normalizedOutcome) {
      return null;
    }

    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);

    const session = await loadTodaySession(database, dailySessionStore, resolvedCampaignId);

    if (!session || session.status !== 'active') {
      return null;
    }

    const selectedEvent =
      session.events.find((event) => event.event_type === 'selected' && sameDatabaseId(event.id, taskId)) ??
      (sameDatabaseId(taskId, 0) && (session.primary_node_id != null || session.primary_action_id != null)
        ? {
            id: 0,
            event_type: 'selected',
            node_id: session.primary_node_id,
            action_id: session.primary_action_id,
            note: null,
          }
        : null);

    if (!selectedEvent) {
      return null;
    }

    const eventNote = note?.trim() || dailyRunTaskOutcomeNotes[normalizedOutcome];

    if (selectedEvent.action_id != null) {
      if (normalizedOutcome === 'completed') {
        return this.completeActionInTodaySession(resolvedCampaignId, selectedEvent.action_id);
      }

      if (normalizedOutcome === 'failed') {
        return this.failActionInTodaySession(resolvedCampaignId, selectedEvent.action_id, eventNote);
      }

      if (normalizedOutcome === 'skipped') {
        return this.skipActionInTodaySession(resolvedCampaignId, selectedEvent.action_id, eventNote);
      }

      return this.deferActionInTodaySession(resolvedCampaignId, selectedEvent.action_id, eventNote);
    }

    if (selectedEvent.node_id == null) {
      return null;
    }

    const timestamp = currentTimestamp();

    await hierarchyStore.updateNode(selectedEvent.node_id, {
      last_touched_at: timestamp,
      updated_at: timestamp,
    });

    if (normalizedOutcome === 'completed') {
      await reviewStateStore.save({
        node_id: selectedEvent.node_id,
        last_reviewed_at: timestamp,
        next_due_at: addDaysTimestamp(timestamp, 7),
        current_risk: 'low',
        updated_at: timestamp,
      });
    }

    await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: normalizedOutcome,
      node_id: selectedEvent.node_id,
      action_id: null,
      note: eventNote,
      occurred_at: timestamp,
    });

    return refreshOutcomeResult(this, resolvedCampaignId, selectedEvent.node_id, null);
  },

  async completeActionInTodaySession(campaignId, actionId) {
    if (arguments.length === 1) {
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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
    await reviewStateStore.save({
      node_id: action.node_id,
      last_reviewed_at: timestamp,
      next_due_at: addDaysTimestamp(timestamp, 7),
      current_risk: 'low',
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

    if (shouldFinalizeSessionAutomatically(session)) {
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
    ({ campaignId, actionId, note } = normalizeActionOutcomeArgs(arguments, campaignId, actionId, note));
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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

    if (shouldFinalizeSessionAutomatically(session)) {
      await finalizeSessionOutcome(this, session.id, timestamp, 'Текущий шаг отложен до следующего прохода.');
    }

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id);
  },

  async skipActionInTodaySession(campaignId, actionId, note = '') {
    ({ campaignId, actionId, note } = normalizeActionOutcomeArgs(arguments, campaignId, actionId, note));
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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

    await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'skipped',
      node_id: action.node_id,
      action_id: action.id,
      note: note?.trim() || 'Пропущено в задачах дня.',
      occurred_at: timestamp,
    });

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id);
  },

  async failActionInTodaySession(campaignId, actionId, note = '') {
    ({ campaignId, actionId, note } = normalizeActionOutcomeArgs(arguments, campaignId, actionId, note));
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const action = await loadActionRecord(database, actionId, resolvedCampaignId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, resolvedCampaignId, actionId);
    const timestamp = currentTimestamp();
    const event = await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'failed',
      node_id: action.node_id,
      action_id: action.id,
      note: note?.trim() || 'Отмечено для повторного прохода в задачах дня.',
      occurred_at: timestamp,
    });

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
    await nodeNoteStore.createErrorNote({
      node_id: action.node_id,
      action_id: action.id,
      note_kind: 'follow_up',
      note: event.note,
      source_event_id: event.id,
    });

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id);
  },

  async retryActionInTodaySession(campaignId, actionId, note = '') {
    ({ campaignId, actionId, note } = normalizeActionOutcomeArgs(arguments, campaignId, actionId, note));
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const action = await loadActionRecord(database, actionId, resolvedCampaignId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, resolvedCampaignId, actionId);
    const timestamp = currentTimestamp();

    await hierarchyStore.updateNodeAction(actionId, {
      status: 'doing',
      completed_at: null,
      updated_at: timestamp,
    });
    await hierarchyStore.updateNode(action.node_id, {
      status: 'active',
      last_touched_at: timestamp,
      updated_at: timestamp,
    });
    await syncNodeCompletionXpGrant(database, action.node_id, 'active', timestamp);

    await dailySessionStore.addSessionEvent({
      session_id: session.id,
      event_type: 'selected',
      node_id: action.node_id,
      action_id: action.id,
      note: stringifyDailyRunTaskNote({
        source: 'recovery_retry',
        title: action.title,
        subtitle: note?.trim() || 'Еще один проход в этом наборе.',
        nodeId: action.node_id,
        actionId: action.id,
        order: (session.tasks?.length ?? session.events?.length ?? 0) + 1,
      }),
      occurred_at: timestamp,
    });

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, action.id);
  },

  async finishDailyRun(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const session = await loadTodaySession(database, dailySessionStore, resolvedCampaignId);

    if (!session || session.status !== 'active') {
      return session;
    }

    const timestamp = currentTimestamp();
    const summaryNote = await buildDailyRunFinishSummaryNote(database, resolvedCampaignId, session);
    await dailySessionStore.updateSession(session.id, {
      status: 'completed',
      ended_at: timestamp,
      summary_note: summaryNote,
      updated_at: timestamp,
    });

    return loadTodaySession(database, dailySessionStore, resolvedCampaignId);
  },

  async abandonDailyRun(campaignId = null) {
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
    const session = await loadTodaySession(database, dailySessionStore, resolvedCampaignId);

    if (!session || session.status !== 'active') {
      return session;
    }

    const timestamp = currentTimestamp();
    await dailySessionStore.updateSession(session.id, {
      status: 'abandoned',
      ended_at: timestamp,
      summary_note: 'Задачи дня сброшены. Открытые задачи останутся доступны позже.',
      updated_at: timestamp,
    });

    return loadTodaySession(database, dailySessionStore, resolvedCampaignId);
  },

  async blockActionInTodaySession(campaignId, actionId, { barrierType = null, note = '' } = {}) {
    if (arguments.length <= 2) {
      ({ barrierType = null, note = '' } = actionId ?? {});
      actionId = campaignId;
      campaignId = null;
    }
    const resolvedCampaignId = await resolveCampaignId(database, campaignId);
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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

    if (shouldFinalizeSessionAutomatically(session)) {
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
    await assertPersonalProgressCampaign(database, resolvedCampaignId);
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

    if (shouldFinalizeSessionAutomatically(session)) {
      await finalizeSessionOutcome(this, session.id, timestamp, `Текущий шаг упрощен до меньшего: ${smallerStepTitle}.`);
    }

    return refreshOutcomeResult(this, resolvedCampaignId, action.node_id, smallerStep.id);
  },
  };
};
