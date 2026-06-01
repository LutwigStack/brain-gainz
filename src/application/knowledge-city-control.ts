export type NodeControlState = 'unclaimed' | 'scouted' | 'controlled' | 'fortified' | 'weakened' | 'contested' | 'lost';
export type ObjectControlState = 'secure' | 'developing' | 'weakening' | 'contested' | 'lost_ground';
export type PressureLevel = 'calm' | 'watch' | 'attack' | 'breach';

export interface ControlRouteItem {
  id: number;
  node_id?: number | null;
  title: string;
  path?: string | null;
  route_stage?: string | null;
  is_required?: number;
  current_mastery_rank?: number;
  self_marked_mastery_rank?: number;
  has_verified_mastery?: number;
  latest_failed_assessment_at?: string | null;
  latest_passed_assessment_at?: string | null;
  latest_failed_run_at?: string | null;
  latest_completed_run_at?: string | null;
  review_current_risk?: string | null;
  review_next_due_at?: string | null;
  last_touched_at?: string | null;
}

export interface NodeControlProjection extends ControlRouteItem {
  control_state: NodeControlState;
  control_label: string;
  control_reason: string;
  control_priority: number;
  object_key: string;
  object_title: string;
}

export interface ObjectControlProjection {
  key: string;
  title: string;
  state: ObjectControlState;
  label: string;
  controlScore: number;
  pressure: number;
  totalNodeCount: number;
  requiredNodeCount: number;
  nextActionLabel: string;
  reason: string;
  nodes: NodeControlProjection[];
  counts: Record<NodeControlState, number>;
}

export interface OpponentProjectionInput {
  name?: string | null;
  persona_key?: string | null;
  xp?: number | null;
  momentum?: number | null;
  pressure_level?: PressureLevel | null;
  target_object_id?: string | null;
  last_turn_resolved_at?: string | null;
}

export interface CityControlProjection {
  opponent: {
    name: string;
    personaKey: string;
    xp: number;
    momentum: number;
    pressureLevel: PressureLevel;
    pressureLabel: string;
    targetObjectKey: string | null;
    targetObjectTitle: string | null;
    lastTurnResolvedAt?: string | null;
  };
  summary: {
    state: ObjectControlState;
    label: string;
    reason: string;
    nextActionLabel: string;
    controlledNodeCount: number;
    weakenedNodeCount: number;
    contestedNodeCount: number;
    controlScore: number;
    pressure: number;
  };
  objects: ObjectControlProjection[];
  nodes: NodeControlProjection[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FORTIFIED_DAYS = 3;
const WEAKENED_DAYS = 7;
const CONTESTED_DAYS = 14;
const LOST_DAYS = 21;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const daysSince = (value?: string | null, now = new Date()) => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return Math.max(0, Math.floor((now.getTime() - timestamp) / MS_PER_DAY));
};

const isAfter = (left?: string | null, right?: string | null) => {
  if (!left) {
    return false;
  }

  if (!right) {
    return true;
  }

  return Date.parse(left) > Date.parse(right);
};

const pressureLabel = (level: PressureLevel) => {
  const labels: Record<PressureLevel, string> = {
    calm: 'Спокойно',
    watch: 'Есть слабые места',
    attack: 'Соперник давит',
    breach: 'Нужно восстановить',
  };
  return labels[level];
};

const nodeControlLabel = (state: NodeControlState) => {
  const labels: Record<NodeControlState, string> = {
    unclaimed: 'Не открыт',
    scouted: 'Разведан',
    controlled: 'Под контролем',
    fortified: 'Укреплен',
    weakened: 'Контроль ослабевает',
    contested: 'Оспаривается',
    lost: 'Нужно вернуть',
  };
  return labels[state];
};

const objectControlLabel = (state: ObjectControlState) => {
  const labels: Record<ObjectControlState, string> = {
    secure: 'Объект под контролем',
    developing: 'Развиваем объект',
    weakening: 'Контроль ослабевает',
    contested: 'Соперник давит',
    lost_ground: 'Нужно восстановить',
  };
  return labels[state];
};

const objectKeyForItem = (item: ControlRouteItem) => {
  const pathParts = String(item.path ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  return item.route_stage?.trim() || pathParts[pathParts.length - 1] || pathParts[0] || 'city-core';
};

const recentTouchForItem = (item: ControlRouteItem) =>
  [
    item.latest_passed_assessment_at,
    item.latest_completed_run_at,
    item.last_touched_at,
  ]
    .filter(Boolean)
    .sort((left, right) => Date.parse(String(right)) - Date.parse(String(left)))[0] ?? null;

export const deriveNodeControlState = (item: ControlRouteItem, now = new Date()): NodeControlProjection => {
  const hasVerified = Number(item.has_verified_mastery ?? 0) === 1 || Number(item.current_mastery_rank ?? 0) >= 5;
  const hasSelfMarked = Number(item.self_marked_mastery_rank ?? 0) > 0;
  const unresolvedFailedAssessment = isAfter(item.latest_failed_assessment_at, item.latest_passed_assessment_at);
  const unresolvedFailedRun = isAfter(item.latest_failed_run_at, item.latest_completed_run_at);
  const risk = item.review_current_risk ?? null;
  const lastTouch = recentTouchForItem(item);
  const ageDays = daysSince(lastTouch, now);
  const reviewDue = item.review_next_due_at != null && Date.parse(item.review_next_due_at) <= now.getTime();

  let state: NodeControlState = 'unclaimed';
  let reason = 'Узел еще не изучался';
  let priority = 0;

  if (hasVerified) {
    state = 'controlled';
    reason = 'Есть подтвержденное освоение';
    priority = 20;

    if (ageDays != null && ageDays <= FORTIFIED_DAYS) {
      state = 'fortified';
      reason = 'Недавно подтверждено или повторено';
      priority = 25;
    }

    if (reviewDue || risk === 'medium' || (ageDays != null && ageDays >= WEAKENED_DAYS)) {
      state = 'weakened';
      reason = reviewDue || risk === 'medium' ? 'Пора повторить' : 'Давно не повторялось';
      priority = 45;
    }

    if (unresolvedFailedAssessment || unresolvedFailedRun || risk === 'high' || (ageDays != null && ageDays >= CONTESTED_DAYS)) {
      state = 'contested';
      reason = unresolvedFailedAssessment
        ? 'Провалена проверка'
        : unresolvedFailedRun
          ? 'Неудачная задача дня'
          : risk === 'high'
            ? 'Высокий риск забывания'
            : 'Соперник давит на старый участок';
      priority = 70;
    }

    if ((unresolvedFailedAssessment || risk === 'high') && ageDays != null && ageDays >= LOST_DAYS) {
      state = 'lost';
      reason = 'Контроль нужно вернуть';
      priority = 90;
    }
  } else if (unresolvedFailedAssessment || unresolvedFailedRun) {
    state = 'contested';
    reason = unresolvedFailedAssessment ? 'Провалена проверка' : 'Неудачная задача дня';
    priority = 65;
  } else if (hasSelfMarked) {
    state = 'scouted';
    reason = 'Отмечено для себя, но еще не подтверждено';
    priority = 15;
  }

  const objectTitle = objectKeyForItem(item);
  return {
    ...item,
    control_state: state,
    control_label: nodeControlLabel(state),
    control_reason: reason,
    control_priority: priority,
    object_key: objectTitle,
    object_title: objectTitle,
  };
};

const emptyCounts = (): Record<NodeControlState, number> => ({
  unclaimed: 0,
  scouted: 0,
  controlled: 0,
  fortified: 0,
  weakened: 0,
  contested: 0,
  lost: 0,
});

const objectNextAction = (state: ObjectControlState) => {
  if (state === 'lost_ground') return 'Вернуть контроль';
  if (state === 'contested') return 'Защитить объект';
  if (state === 'weakening') return 'Повторить слабые места';
  if (state === 'developing') return 'Продолжить маршрут';
  return 'Удерживать темп';
};

export const aggregateObjectControl = (nodes: NodeControlProjection[]): ObjectControlProjection[] => {
  const groups = new Map<string, NodeControlProjection[]>();
  for (const node of nodes) {
    const group = groups.get(node.object_key) ?? [];
    group.push(node);
    groups.set(node.object_key, group);
  }

  return Array.from(groups.entries()).map(([key, objectNodes]) => {
    const counts = emptyCounts();
    for (const node of objectNodes) {
      counts[node.control_state] += 1;
    }

    const requiredNodeCount = Math.max(1, objectNodes.filter((node) => Number(node.is_required ?? 1) === 1).length);
    const rawScore =
      counts.fortified * 1.15 +
      counts.controlled * 1 +
      counts.scouted * 0.35 -
      counts.weakened * 0.35 -
      counts.contested * 0.75 -
      counts.lost;
    const controlScore = clamp(Math.round((rawScore / requiredNodeCount) * 100), 0, 100);
    const pressure = clamp(Math.round(((counts.weakened * 10 + counts.contested * 22 + counts.lost * 35) / requiredNodeCount)), 0, 100);

    let state: ObjectControlState = 'developing';
    if (counts.lost > 0 || pressure >= 55) {
      state = 'lost_ground';
    } else if (counts.contested > 0 || pressure >= 30) {
      state = 'contested';
    } else if (counts.weakened > 0 || pressure >= 12) {
      state = 'weakening';
    } else if (controlScore >= 70 && counts.unclaimed === 0) {
      state = 'secure';
    }

    const primaryReasonNode = [...objectNodes].sort((left, right) => right.control_priority - left.control_priority)[0];
    return {
      key,
      title: objectNodes[0]?.object_title ?? key,
      state,
      label: objectControlLabel(state),
      controlScore,
      pressure,
      totalNodeCount: objectNodes.length,
      requiredNodeCount,
      nextActionLabel: objectNextAction(state),
      reason: primaryReasonNode?.control_reason ?? objectControlLabel(state),
      nodes: objectNodes,
      counts,
    };
  });
};

export const pressureLevelFromValue = (value: number): PressureLevel => {
  if (value >= 45) return 'breach';
  if (value >= 25) return 'attack';
  if (value >= 10) return 'watch';
  return 'calm';
};

export const buildCityControlProjection = ({
  routeItems,
  opponent,
  now = new Date(),
}: {
  routeItems: ControlRouteItem[];
  opponent?: OpponentProjectionInput | null;
  now?: Date;
}): CityControlProjection | null => {
  if (!Array.isArray(routeItems) || routeItems.length === 0) {
    return null;
  }

  const nodes = routeItems.map((item) => deriveNodeControlState(item, now));
  const objects = aggregateObjectControl(nodes).sort(
    (left, right) => right.pressure - left.pressure || left.controlScore - right.controlScore || left.title.localeCompare(right.title),
  );
  const target = objects[0] ?? null;
  const pressure = target?.pressure ?? 0;
  const pressureLevel = opponent?.pressure_level ?? pressureLevelFromValue(pressure);
  const controlledNodeCount = nodes.filter((node) => node.control_state === 'controlled' || node.control_state === 'fortified').length;
  const weakenedNodeCount = nodes.filter((node) => node.control_state === 'weakened').length;
  const contestedNodeCount = nodes.filter((node) => node.control_state === 'contested' || node.control_state === 'lost').length;

  return {
    opponent: {
      name: opponent?.name?.trim() || 'Соперник',
      personaKey: opponent?.persona_key?.trim() || 'default-rival',
      xp: Math.max(0, Math.round(Number(opponent?.xp ?? 0))),
      momentum: Math.max(1, Math.round(Number(opponent?.momentum ?? 1))),
      pressureLevel,
      pressureLabel: pressureLabel(pressureLevel),
      targetObjectKey: target?.key ?? null,
      targetObjectTitle: target?.title ?? null,
      lastTurnResolvedAt: opponent?.last_turn_resolved_at ?? null,
    },
    summary: {
      state: target?.state ?? 'developing',
      label: target?.label ?? 'Развиваем город',
      reason: target?.reason ?? 'Продолжайте маршрут',
      nextActionLabel: target?.nextActionLabel ?? 'Продолжить маршрут',
      controlledNodeCount,
      weakenedNodeCount,
      contestedNodeCount,
      controlScore: target?.controlScore ?? 0,
      pressure,
    },
    objects,
    nodes,
  };
};

export const dailyOpponentXp = ({
  weakNodeCount,
  contestedNodeCount,
  targetObjectUnresolved = false,
}: {
  weakNodeCount: number;
  contestedNodeCount: number;
  targetObjectUnresolved?: boolean;
}) => {
  const basePressure = 3;
  const weakNodePressure = Math.min(12, Math.max(0, weakNodeCount) * 2);
  const contestedPressure = Math.min(10, Math.max(0, contestedNodeCount) * 3);
  const targetObjectBonus = targetObjectUnresolved ? 4 : 0;
  return Math.min(25, basePressure + weakNodePressure + contestedPressure + targetObjectBonus);
};
