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

const localizeStarterWorkspace = async (database) => {
  const updatedAt = currentTimestamp();

  await database.execute(
    'UPDATE spheres SET name = ?, description = ?, updated_at = ? WHERE slug = ?',
    [STARTER_LOCALIZATION.sphere.name, STARTER_LOCALIZATION.sphere.description, updatedAt, STARTER_SLUGS.sphere],
  );

  await database.execute(
    'UPDATE directions SET name = ?, description = ?, updated_at = ? WHERE slug = ?',
    [STARTER_LOCALIZATION.direction.name, STARTER_LOCALIZATION.direction.description, updatedAt, STARTER_SLUGS.direction],
  );

  await database.execute(
    'UPDATE skills SET name = ?, description = ?, updated_at = ? WHERE slug = ?',
    [STARTER_LOCALIZATION.skill.name, STARTER_LOCALIZATION.skill.description, updatedAt, STARTER_SLUGS.skill],
  );

  for (const [slug, copy] of Object.entries(STARTER_LOCALIZATION.nodes)) {
    await database.execute('UPDATE nodes SET title = ?, summary = ?, updated_at = ? WHERE slug = ?', [
      copy.title,
      copy.summary,
      updatedAt,
      slug,
    ]);

    await database.execute(
      `
        UPDATE node_actions
        SET title = ?, details = ?, updated_at = ?
        WHERE node_id = (SELECT id FROM nodes WHERE slug = ? LIMIT 1)
          AND is_minimum_step = 1
      `,
      [copy.actionTitle, copy.actionDetails, updatedAt, slug],
    );
  }

  await database.execute('UPDATE daily_sessions SET summary_note = ? WHERE summary_note = ?', [
    'Запущено с первой рекомендации экрана «Сейчас».',
    'Started from the first Now recommendation.',
  ]);
  await database.execute('UPDATE daily_session_events SET note = ? WHERE note = ?', [
    'Выбрано из первой рекомендации экрана «Сейчас».',
    'Selected from the first Now surface.',
  ]);
  await database.execute('UPDATE daily_session_events SET note = ? WHERE note = ?', [
    'Завершено из потока экрана «Сейчас».',
    'Completed from the Now session flow.',
  ]);
  await database.execute('UPDATE daily_session_events SET note = ? WHERE note = ?', [
    'Все видимые шаги текущего узла завершены.',
    'All visible actions on the current node are complete.',
  ]);
  await database.execute('UPDATE daily_session_events SET note = ? WHERE note = ?', [
    'Главный шаг завершен из потока «Сейчас».',
    'Primary action completed from the Now flow.',
  ]);
  await database.execute('UPDATE daily_session_events SET note = ? WHERE note = ?', [
    'Шаг отложен до следующего прохода.',
    'Deferred from the Now session flow.',
  ]);
  await database.execute('UPDATE daily_session_events SET note = ? WHERE note = ?', [
    'Шаг заблокирован из потока «Сейчас».',
    'Blocked from the Now session flow.',
  ]);
  await database.execute('UPDATE daily_sessions SET summary_note = ? WHERE summary_note = ?', [
    'Текущий шаг отложен до следующего прохода.',
    'Current action deferred for a later pass.',
  ]);
  await database.execute('UPDATE daily_sessions SET summary_note = ? WHERE summary_note = ?', [
    'Текущий шаг уперся в барьер.',
    'Current action blocked by a barrier.',
  ]);
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

const loadMetrics = async (database) => {
  const metricQueries = [
    ['spheres', 'SELECT COUNT(*) AS count FROM spheres'],
    ['directions', 'SELECT COUNT(*) AS count FROM directions'],
    ['skills', 'SELECT COUNT(*) AS count FROM skills'],
    ['nodes', 'SELECT COUNT(*) AS count FROM nodes WHERE is_archived = 0'],
    ['actions', "SELECT COUNT(*) AS count FROM node_actions WHERE status IN ('todo', 'ready', 'doing')"],
    ['dueReviews', "SELECT COUNT(*) AS count FROM review_states WHERE current_risk = 'high' OR (next_due_at IS NOT NULL AND next_due_at <= ?)", [currentTimestamp()]],
  ];

  const results = await Promise.all(
    metricQueries.map(async ([key, query, params = []]) => [key, countFromRows(await database.select(query, params))]),
  );

  return Object.fromEntries(results);
};

const loadTodaySession = async (database, dailySessionStore) => {
  const rows = await database.select(
    `
      SELECT *
      FROM daily_sessions
      WHERE session_date = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [todayDate()],
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

const loadActionRecord = async (database, actionId) => {
  const rows = await database.select('SELECT * FROM node_actions WHERE id = ?', [actionId]);
  return rows[0] ?? null;
};

const loadNodeMetadata = async (database, nodeId) => {
  const rows = await database.select(
    `
      SELECT
        nodes.*,
        skills.name AS skill_name,
        skills.id AS skill_id,
        directions.name AS direction_name,
        directions.id AS direction_id,
        spheres.name AS sphere_name
        ,spheres.id AS sphere_id
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
      ORDER BY blocked_nodes.id ASC
    `,
    [nodeId],
  );

const loadReviewState = async (database, nodeId) => {
  const rows = await database.select('SELECT * FROM review_states WHERE node_id = ? LIMIT 1', [nodeId]);
  return rows[0] ?? null;
};

const loadNodeFocus = async (database, dailySessionStore, nodeId, actionId = null) => {
  const [node, actions, dependencies, dependents, reviewState, todaySession] = await Promise.all([
    loadNodeMetadata(database, nodeId),
    loadNodeActions(database, nodeId),
    loadDependencies(database, nodeId),
    loadDependents(database, nodeId),
    loadReviewState(database, nodeId),
    loadTodaySession(database, dailySessionStore),
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

const loadHierarchyTree = async (database) => {
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
        GROUP BY spheres.id
        ORDER BY spheres.sort_order ASC, spheres.id ASC
      `,
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
        WHERE directions.is_archived = 0
        GROUP BY directions.id
        ORDER BY directions.sort_order ASC, directions.id ASC
      `,
    ),
    database.select(
      `
        SELECT
          skills.*,
          COUNT(DISTINCT nodes.id) AS node_count,
          COUNT(DISTINCT CASE WHEN actions.status IN ('todo', 'ready', 'doing') THEN actions.id END) AS open_action_count
        FROM skills
        LEFT JOIN nodes ON nodes.skill_id = skills.id AND nodes.is_archived = 0
        LEFT JOIN node_actions actions ON actions.node_id = nodes.id
        WHERE skills.is_archived = 0
        GROUP BY skills.id
        ORDER BY skills.sort_order ASC, skills.id ASC
      `,
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
        ORDER BY nodes.updated_at DESC, nodes.id ASC
      `,
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

const buildNavigationSnapshot = async (database) => {
  const [tree, dashboard] = await Promise.all([loadHierarchyTree(database), createNowServiceContext(database).getDashboard()]);
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
    defaultSelection: firstNode,
  };
};

const createNowServiceContext = (database) => ({
  getDashboard: async () => {
    const [metrics, rawCandidates, todaySession] = await Promise.all([
      loadMetrics(database),
      loadCandidateRows(database),
      loadTodaySession(database, { getEventsForSession: (sessionId) => database.select('SELECT * FROM daily_session_events WHERE session_id = ? ORDER BY id ASC', [sessionId]) }),
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

const ensureActiveSession = async (service, actionId) => {
  let session = await loadTodaySession(service.database, service.dailySessionStore);

  if (!session || session.status !== 'active') {
    session = await service.startTodaySessionFromRecommendation(actionId);
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

const refreshOutcomeResult = async (service, nodeId, actionId = null) => ({
  dashboard: await service.getDashboard(),
  focus: await service.getNodeFocus(nodeId, actionId),
});

const navigationContainsNode = (navigation, nodeId) =>
  navigation.spheres.some((sphere) =>
    sphere.directions.some((direction) => direction.skills.some((skill) => skill.nodes.some((node) => node.id === nodeId))),
  );

const refreshEditorMutationResult = async (service, nodeId, actionId = null) => {
  const [node, dashboard, navigation] = await Promise.all([
    service.hierarchyStore.getNodeById(nodeId),
    service.getDashboard(),
    service.getNavigationSnapshot(),
  ]);

  if (!node) {
    return null;
  }

  const selection =
    !node.is_archived && navigationContainsNode(navigation, node.id)
      ? { nodeId: node.id, actionId }
      : navigation.defaultSelection;
  const focus =
    selection != null ? await service.getNodeFocus(selection.nodeId, selection.actionId ?? null) : null;

  return {
    node,
    focus,
    dashboard,
    navigation,
    selection: selection != null ? { nodeId: selection.nodeId, actionId: focus?.selectedAction?.id ?? selection.actionId ?? null } : null,
  };
};

const loadCandidateRows = (database) =>
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
        AND nodes.status IN ('active', 'paused')
        AND actions.status IN ('todo', 'ready', 'doing')
      ORDER BY actions.id ASC
    `,
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

const buildJournalSnapshotFromNotes = async (database, nodeNoteStore) => {
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

  const [barrierEntries, errorEntries] = await Promise.all([
    enrichRows(barrierNotes, 'barrier'),
    enrichRows(errorNotes, 'error'),
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

export const createNowService = ({ database, hierarchyStore, reviewStateStore, dailySessionStore, nodeNoteStore }) => {
  let starterLocalizationPromise = null;

  const ensureStarterLocalization = async () => {
    if (!starterLocalizationPromise) {
      starterLocalizationPromise = localizeStarterWorkspace(database).catch((error) => {
        starterLocalizationPromise = null;
        throw error;
      });
    }

    return starterLocalizationPromise;
  };

  return {
    database,
    hierarchyStore,
    reviewStateStore,
    dailySessionStore,
    nodeNoteStore,

  async getDashboard() {
    await ensureStarterLocalization();

    const [metrics, rawCandidates, todaySession] = await Promise.all([
      loadMetrics(database),
      loadCandidateRows(database),
      loadTodaySession(database, dailySessionStore),
    ]);

    const rankedCandidates = rankCandidates(rawCandidates);

    return {
      metrics,
      primaryRecommendation: rankedCandidates[0] ?? null,
      queue: rankedCandidates.slice(1, 1 + MAX_QUEUE_ITEMS),
      todaySession,
    };
  },

  async getNodeFocus(nodeId, actionId = null) {
    await ensureStarterLocalization();

    const focus = await loadNodeFocus(database, dailySessionStore, nodeId, actionId);

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

  async getNavigationSnapshot() {
    await ensureStarterLocalization();

    return buildNavigationSnapshot(database);
  },

  async getNodeEditorRecord(nodeId) {
    return hierarchyStore.getNodeById(nodeId);
  },

  async createNodeEditor(payload) {
    const node = await hierarchyStore.createNode(payload);

    if (!node) {
      return null;
    }

    return refreshEditorMutationResult(this, node.id);
  },

  async updateNodeEditor(nodeId, payload) {
    const node = await hierarchyStore.updateNode(nodeId, payload);

    if (!node) {
      return null;
    }

    return refreshEditorMutationResult(this, node.id);
  },

  async archiveNodeEditor(nodeId, payload = {}) {
    const node = await hierarchyStore.archiveNode(nodeId, payload);

    if (!node) {
      return null;
    }

    return refreshEditorMutationResult(this, node.id);
  },

  async duplicateNodeEditor(nodeId, payload = {}) {
    const node = await hierarchyStore.duplicateNode(nodeId, payload);

    if (!node) {
      return null;
    }

    return refreshEditorMutationResult(this, node.id);
  },

  async getJournalSnapshot() {
    return buildJournalSnapshotFromNotes(database, nodeNoteStore);
  },

  async createJournalFollowUpStep({ nodeId, title = '', note = '', barrierType = null } = {}) {
    const node = await loadNodeMetadata(database, nodeId);

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
      dashboard: await this.getDashboard(),
      focus: await this.getNodeFocus(nodeId, action.id),
      createdAction: action,
    };
  },

  async createStarterWorkspace() {
    const existingNodes = await database.select('SELECT COUNT(*) AS count FROM nodes');

    if (countFromRows(existingNodes) > 0) {
      return this.getDashboard();
    }

    const sphere = await hierarchyStore.createSphere({
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
    const skill = await hierarchyStore.createSkill({
      direction_id: direction.id,
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

    return this.getDashboard();
  },

  async startTodaySessionFromPrimaryRecommendation() {
    return this.startTodaySessionFromRecommendation();
  },

  async startTodaySessionFromRecommendation(actionId = null) {
    const dashboard = await this.getDashboard();
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

    return loadTodaySession(database, dailySessionStore);
  },

  async completeActionInTodaySession(actionId) {
    const action = await loadActionRecord(database, actionId);

    if (!action) {
      return null;
    }

    let session = await ensureActiveSession(this, actionId);

    const timestamp = currentTimestamp();

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

    return refreshOutcomeResult(this, action.node_id, action.id);
  },

  async deferActionInTodaySession(actionId, note = '') {
    const action = await loadActionRecord(database, actionId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, actionId);
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

    return refreshOutcomeResult(this, action.node_id, action.id);
  },

  async blockActionInTodaySession(actionId, { barrierType = null, note = '' } = {}) {
    const action = await loadActionRecord(database, actionId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, actionId);
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

    return refreshOutcomeResult(this, action.node_id, action.id);
  },

  async shrinkActionInTodaySession(actionId, { title = '', note = '' } = {}) {
    const action = await loadActionRecord(database, actionId);

    if (!action) {
      return null;
    }

    const session = await ensureActiveSession(this, actionId);
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

    return refreshOutcomeResult(this, action.node_id, smallerStep.id);
  },
  };
};
