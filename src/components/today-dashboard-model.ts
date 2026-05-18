import type { CareerSpecialization, DailySession, RecommendationCandidate, RouteProgressItem, TodaySnapshot } from '../types/app-shell';

export type DailyTaskState = 'current' | 'next' | 'recovery' | 'locked' | 'future' | 'complete';

export interface DailyTaskCardViewModel {
  key: string;
  order: number;
  title: string;
  subtitle: string;
  status: string;
  state: DailyTaskState;
  progressPercent: number;
  progressLabel?: string;
  actionLabel: string;
  nodeId: number | null;
  actionId?: number | null;
  disabled: boolean;
}

export interface DirectLessonActionViewModel {
  nodeId: number;
  actionId: number;
}

export type MiniMapNodeKind = 'front' | 'route' | 'weak' | 'complete' | 'future';
export type MiniMapEdgeKind = 'route' | 'weak';

export interface MiniMapNodeViewModel {
  id: string;
  routeItemId?: number;
  title: string;
  x: number;
  y: number;
  kind: MiniMapNodeKind;
}

export interface MiniMapEdgeViewModel {
  id: string;
  from: string;
  to: string;
  kind: MiniMapEdgeKind;
}

export interface MiniMapViewModel {
  nodes: MiniMapNodeViewModel[];
  edges: MiniMapEdgeViewModel[];
  frontTitle: string | null;
  weakTitle: string | null;
  routeTitle: string | null;
  hasOverflow: boolean;
}

export interface TodayRailDistrictViewModel {
  id: number;
  title: string;
  emblem: string;
  color: string;
  level: number;
  xp: number;
  stability: number;
}

export interface TodayRightRailViewModel {
  race: {
    title: string;
    emblem: string;
    color: string;
    stateLabel: string;
    rankLabel: string;
    streakLabel: string;
    xpLabel: string;
    hasIdentity: boolean;
  };
  city: {
    title: string;
    levelLabel: string;
    xpLabel: string;
    progressPercent: number;
    progressLabel: string;
    hasDistricts: boolean;
    featuredDistrict: TodayRailDistrictViewModel | null;
    districts: TodayRailDistrictViewModel[];
  };
  opponent: {
    title: string;
    subtitle: string;
    hasOpponent: boolean;
    userProgressPercent: number;
    opponentProgressPercent: number;
    campaignProgressLabel: string;
    scoreLabel: string;
    stateLabel: string;
  };
  route: {
    title: string;
    nodeLabel: string;
    stageLabel: string;
    verifyLabel: string;
    sessionLabel: string;
  };
}

const masteryRankByLevel = {
  seen: 1,
  understood: 2,
  remembered: 3,
  applied: 4,
  confirmed: 5,
  retained: 6,
} as const;

export const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export const masteryRank = (level?: string | null) =>
  masteryRankByLevel[level as keyof typeof masteryRankByLevel] ?? 0;

const formatCount = (value: number) => new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(value)));

const visualGlyphs: Record<string, string> = {
  spark: '✦',
  brain: '◆',
  compass: '⌖',
  map: '▧',
  book: '▤',
  grid: '▦',
  tool: '⚒',
};

const visualGlyph = (value?: string | null) => {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return '◆';
  }

  if (visualGlyphs[normalized]) {
    return visualGlyphs[normalized];
  }

  return normalized.length <= 2 ? normalized : '◆';
};

const rankLabelForProgress = (totalXp: number, verifiedNodeCount: number) => {
  if (verifiedNodeCount >= 24 || totalXp >= 2200) {
    return 'Магистр маршрутов';
  }

  if (verifiedNodeCount >= 12 || totalXp >= 900) {
    return 'Архитектор';
  }

  if (verifiedNodeCount >= 4 || totalXp >= 250) {
    return 'Навигатор';
  }

  return 'Новичок';
};

const raceStateLabel = (careerStatus: TodaySnapshot['careerStatus'] | null, currentSpecialization: CareerSpecialization | null) => {
  if (careerStatus === 'victory' || currentSpecialization?.status === 'completed') {
    return 'маршрут завершен';
  }

  if (currentSpecialization?.status === 'active') {
    return currentSpecialization.name;
  }

  return 'свободный режим';
};

const todaySessionLabel = (todaySession: DailySession | null) => {
  if (!todaySession) {
    return 'сессия не начата';
  }

  const labels: Record<string, string> = {
    planned: 'сессия запланирована',
    active: 'сессия идет',
    completed: 'сессия закрыта',
  };

  return labels[todaySession.status] ?? todaySession.status;
};

const pickFeaturedDistrict = (districts: TodayRailDistrictViewModel[]) =>
  [...districts].sort((left, right) => right.xp - left.xp || right.level - left.level || left.id - right.id)[0] ?? null;

export const buildTodayRightRail = ({
  today,
  todaySession = null,
}: {
  today: TodaySnapshot | null;
  todaySession?: DailySession | null;
}): TodayRightRailViewModel => {
  const race = today?.race ?? null;
  const city = today?.city ?? null;
  const route = today?.route ?? null;
  const planner = today?.planner ?? null;
  const opponent = today?.opponent ?? null;
  const currentSpecialization = today?.currentSpecialization ?? null;
  const routeCompletionPercent = clampPercent(route?.completionPercent ?? 0);
  const opponentPressurePercent = clampPercent(opponent?.pressure ?? 0);
  const districts = (city?.districts ?? []).map((district) => ({
    id: district.id,
    title: district.title,
    emblem: visualGlyph(district.emblem),
    color: district.color,
    level: Number(district.level ?? 1),
    xp: Number(district.xp ?? 0),
    stability: clampPercent(district.stability ?? 0),
  }));
  const featuredDistrict = pickFeaturedDistrict(districts);
  const cityProgressPercent =
    districts.length > 0
      ? clampPercent(districts.reduce((sum, district) => sum + district.stability, 0) / districts.length)
      : 0;
  const verifiedNodeCount = Number(today?.mastery.verifiedNodeCount ?? 0);
  const totalXp = Number(city?.totalXp ?? 0);
  const activity = today?.activity ?? null;
  const streakDays = Number(activity?.streakDays ?? 0);

  return {
    race: {
      title: race?.title ?? 'Профиль не выбран',
      emblem: visualGlyph(race?.emblem),
      color: race?.color ?? '#7dd3fc',
      stateLabel: raceStateLabel(today?.careerStatus ?? null, currentSpecialization),
      rankLabel: rankLabelForProgress(totalXp, verifiedNodeCount),
      streakLabel: streakDays > 0 ? `${formatCount(streakDays)} дн.` : 'серия не начата',
      xpLabel: `${formatCount(totalXp)} XP`,
      hasIdentity: Boolean(race),
    },
    city: {
      title: featuredDistrict ? featuredDistrict.title : districts.length > 0 ? 'Город знаний' : 'Город ждет данных',
      levelLabel: city ? `ур. ${formatCount(city.level)}` : 'уровень не открыт',
      xpLabel: totalXp > 0 ? `${formatCount(totalXp)} XP` : 'XP еще не начислен',
      progressPercent: cityProgressPercent,
      progressLabel: districts.length > 0 ? `${cityProgressPercent}% стабильность` : 'добавьте статы кампании',
      hasDistricts: districts.length > 0,
      featuredDistrict,
      districts,
    },
    opponent: {
      title: currentSpecialization ? 'ИИ-соперник' : 'Соперник не назначен',
      subtitle: opponent
        ? `${formatCount(opponent.daysElapsed)} дн. в маршруте`
        : currentSpecialization
          ? 'давление появится после старта маршрута'
          : 'выберите карьерный маршрут',
      hasOpponent: Boolean(opponent),
      userProgressPercent: routeCompletionPercent,
      opponentProgressPercent: opponentPressurePercent,
      campaignProgressLabel: opponent
        ? `вы ${routeCompletionPercent}% / ИИ ${opponentPressurePercent}%`
        : 'гонка не активна',
      scoreLabel: opponent ? `${formatCount(opponent.score)} очков` : 'без счета',
      stateLabel: opponent
        ? opponentPressurePercent > routeCompletionPercent
          ? 'ИИ впереди'
          : opponentPressurePercent === routeCompletionPercent
            ? 'ровная гонка'
            : 'вы впереди'
        : 'нет активного соперника',
    },
    route: {
      title: planner?.currentStage ?? (route?.isComplete ? 'Маршрут закрыт' : 'Текущий фронт'),
      nodeLabel: `${formatCount(route?.routeNodeCount ?? today?.state.content.routeNodeCount ?? 0)} узл.`,
      stageLabel:
        (planner?.currentStageItems.length ?? 0) > 0
          ? `${formatCount((planner?.currentStageItems ?? []).filter((item) => item.is_complete).length)}/${formatCount(
              planner?.currentStageItems.length ?? 0,
            )} этап`
          : 'этап не выбран',
      verifyLabel: `${formatCount(planner?.readyToVerify.length ?? 0)} к проверке`,
      sessionLabel: todaySessionLabel(todaySession),
    },
  };
};

const uniqueRouteItems = (items: Array<RouteProgressItem | null | undefined>) => {
  const byId = new Map<number, RouteProgressItem>();

  for (const item of items) {
    if (item) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
};

const routeItemProgress = (item: RouteProgressItem) => {
  if (item.is_complete) {
    return 100;
  }

  const requiredRank = Math.max(1, masteryRank(item.required_mastery_level));
  return clampPercent((Number(item.current_mastery_rank ?? 0) / requiredRank) * 100);
};

const routeItemState = (
  item: RouteProgressItem,
  focusItem: RouteProgressItem | null,
  nextItemIds: Set<number>,
  weakSpotIds: Set<number>,
): DailyTaskState => {
  if (item.is_actionable === false) {
    return 'locked';
  }

  if (item.is_complete) {
    return 'complete';
  }

  if (focusItem?.id === item.id) {
    return 'current';
  }

  if (weakSpotIds.has(item.id)) {
    return 'recovery';
  }

  if (nextItemIds.has(item.id)) {
    return 'next';
  }

  return 'future';
};

const dailyStatusByState: Record<DailyTaskState, string> = {
  current: 'Текущая',
  next: 'Следующая',
  recovery: 'Повторение',
  locked: 'Закрыта',
  future: 'Позже',
  complete: 'Готово',
};

const dailyActionByState: Record<DailyTaskState, string> = {
  current: 'Начать',
  next: 'Открыть',
  recovery: 'Повторить',
  locked: 'Недоступно',
  future: 'Открыть карту',
  complete: 'Повторить',
};

const dailyStatusLabel = (state: DailyTaskState) => dailyStatusByState[state];
const dailyActionLabel = (state: DailyTaskState) => dailyActionByState[state];

const recommendationToTaskCard = (
  candidate: RecommendationCandidate,
  order: number,
  state: DailyTaskState,
): DailyTaskCardViewModel => ({
  key: candidate.actionId == null ? `recommendation-node-${candidate.nodeId}` : `recommendation-action-${candidate.actionId}`,
  order,
  title: candidate.actionTitle,
  subtitle: candidate.nodeTitle,
  status: dailyStatusLabel(state),
  state,
  progressPercent: state === 'current' ? 35 : 0,
  actionLabel: dailyActionLabel(state),
  nodeId: candidate.nodeId,
  actionId: candidate.actionId,
  disabled: false,
});

export const resolveDirectLessonAction = ({
  focusItem,
  primaryRecommendation,
  queue,
}: {
  focusItem: RouteProgressItem | null;
  primaryRecommendation: RecommendationCandidate | null;
  queue: RecommendationCandidate[];
}): DirectLessonActionViewModel | null => {
  if (focusItem?.node_id == null) {
    return null;
  }

  const candidate = uniqueRecommendations([primaryRecommendation, ...queue]).find(
    (item) => item.actionId != null && Number(item.nodeId) === Number(focusItem.node_id),
  );

  if (candidate?.actionId == null) {
    return null;
  }

  return {
    nodeId: focusItem.node_id,
    actionId: candidate.actionId,
  };
};

export const buildDailyTaskCards = ({
  focusItem,
  nextItems,
  weakSpots = [],
  routeItems,
  primaryRecommendation,
  queue,
  maxCards = 5,
}: {
  focusItem: RouteProgressItem | null;
  nextItems: RouteProgressItem[];
  weakSpots?: RouteProgressItem[];
  routeItems: RouteProgressItem[];
  primaryRecommendation: RecommendationCandidate | null;
  queue: RecommendationCandidate[];
  maxCards?: number;
}): DailyTaskCardViewModel[] => {
  const nextItemIds = new Set(nextItems.map((item) => item.id));
  const weakSpotIds = new Set(weakSpots.map((item) => item.id));
  const routeCandidates = uniqueRouteItems([
    focusItem,
    ...weakSpots,
    ...nextItems,
    ...routeItems.filter((item) => item.is_actionable === false),
    ...routeItems.filter((item) => item.is_required === 1 && !item.is_complete && item.is_actionable !== false),
    ...routeItems.filter((item) => item.is_required !== 1 && !item.is_complete),
    ...routeItems.filter((item) => item.is_complete && item.is_actionable !== false),
  ]);

  if (routeCandidates.length > 0) {
    const cards: DailyTaskCardViewModel[] = routeCandidates.slice(0, maxCards).map((item, index) => {
      const state = routeItemState(item, focusItem, nextItemIds, weakSpotIds);
      const requiredRank = Math.max(1, masteryRank(item.required_mastery_level));
      return {
        key: `route-${item.id}`,
        order: index + 1,
        title: item.title,
        subtitle: item.route_stage ?? item.path ?? 'Маршрут',
        status: dailyStatusLabel(state),
        state,
        progressPercent: routeItemProgress(item),
        actionLabel: dailyActionLabel(state),
        nodeId: item.node_id ?? null,
        disabled: state === 'locked',
        progressLabel: `${Number(item.current_mastery_rank ?? 0)}/${requiredRank}`,
      };
    });

    while (cards.length < maxCards) {
      const order = cards.length + 1;
      const placeholderIndex = cards.length - routeCandidates.slice(0, maxCards).length;
      cards.push({
        key: `locked-slot-${order}`,
        order,
        title: placeholderIndex === 0 ? 'Позже' : 'Слот закрыт',
        subtitle: 'откроется после текущего шага',
        status: dailyStatusByState.locked,
        state: 'locked',
        progressPercent: 0,
        actionLabel: dailyActionByState.locked,
        nodeId: null,
        disabled: true,
      });
    }

    return cards;
  }

  const recommendationCandidates = uniqueRecommendations([primaryRecommendation, ...queue]);
  const cards = recommendationCandidates.slice(0, maxCards).map((candidate, index) =>
    recommendationToTaskCard(candidate, index + 1, index === 0 ? 'current' : 'next'),
  );

  while (cards.length > 0 && cards.length < maxCards) {
    const order = cards.length + 1;
    const placeholderIndex = cards.length - recommendationCandidates.slice(0, maxCards).length;
    const state = placeholderIndex === 0 ? 'future' : 'locked';
    cards.push({
      key: `future-slot-${order}`,
      order,
      title: state === 'future' ? 'Следующий шаг' : 'Слот закрыт',
      subtitle: 'появится после текущей задачи',
      status: dailyStatusByState[state],
      state,
      progressPercent: 0,
      actionLabel: dailyActionByState[state],
      nodeId: null,
      disabled: state === 'locked',
    });
  }

  return cards;
};

const uniqueRecommendations = (items: Array<RecommendationCandidate | null | undefined>) => {
  const byRecommendationKey = new Map<string, RecommendationCandidate>();

  for (const item of items) {
    if (item) {
      const key = item.actionId == null ? `node:${item.nodeId}` : `action:${item.actionId}`;
      byRecommendationKey.set(key, item);
    }
  }

  return [...byRecommendationKey.values()];
};

const windowRouteItems = (
  routeItems: RouteProgressItem[],
  focusItem: RouteProgressItem | null,
  weakSpots: RouteProgressItem[],
  maxNodes: number,
) => {
  const sorted = [...routeItems].sort(
    (left, right) => Number(left.route_order ?? left.id) - Number(right.route_order ?? right.id) || left.id - right.id,
  );

  if (sorted.length <= maxNodes) {
    return sorted;
  }

  const focusIndex = Math.max(
    0,
    sorted.findIndex((item) => item.id === focusItem?.id),
  );
  const start = Math.min(Math.max(0, focusIndex - 2), Math.max(0, sorted.length - maxNodes));
  const windowed = sorted.slice(start, start + maxNodes);
  const missingWeakSpot = weakSpots.find((weakSpot) => !windowed.some((item) => item.id === weakSpot.id));

  if (missingWeakSpot && windowed.length === maxNodes) {
    windowed[windowed.length - 1] = missingWeakSpot;
  }

  return uniqueRouteItems(windowed).sort(
    (left, right) => Number(left.route_order ?? left.id) - Number(right.route_order ?? right.id) || left.id - right.id,
  );
};

export const buildMiniMapPreview = ({
  focusItem,
  nextItems,
  weakSpots,
  routeItems,
  currentStage,
  maxNodes = 7,
}: {
  focusItem: RouteProgressItem | null;
  nextItems: RouteProgressItem[];
  weakSpots: RouteProgressItem[];
  routeItems: RouteProgressItem[];
  currentStage?: string | null;
  maxNodes?: number;
}): MiniMapViewModel => {
  const visibleItems = windowRouteItems(routeItems, focusItem, weakSpots, maxNodes);
  const nextItemIds = new Set(nextItems.map((item) => item.id));
  const weakSpotIds = new Set(weakSpots.map((item) => item.id));
  const denom = Math.max(1, visibleItems.length - 1);
  const nodes = visibleItems.map((item, index): MiniMapNodeViewModel => {
    const isFocus = item.id === focusItem?.id;
    const isWeakSpot = weakSpotIds.has(item.id);
    const kind: MiniMapNodeKind = isFocus
      ? 'front'
      : isWeakSpot
        ? 'weak'
        : item.is_complete
          ? 'complete'
          : nextItemIds.has(item.id)
            ? 'route'
            : 'future';

    return {
      id: `route-${item.id}`,
      routeItemId: item.id,
      title: item.title,
      x: clampPercent(8 + (index / denom) * 84),
      y: clampPercent(50 + Math.sin(index * 1.4) * 22),
      kind,
    };
  });

  const edges: MiniMapEdgeViewModel[] = nodes.slice(1).map((node, index) => ({
    id: `route-edge-${index}`,
    from: nodes[index].id,
    to: node.id,
    kind: 'route',
  }));
  const focusNode = nodes.find((node) => node.kind === 'front') ?? null;
  const weakNode = nodes.find((node) => node.kind === 'weak') ?? null;

  if (focusNode && weakNode) {
    edges.push({
      id: 'weak-edge',
      from: focusNode.id,
      to: weakNode.id,
      kind: 'weak',
    });
  }

  return {
    nodes,
    edges,
    frontTitle: focusItem?.title ?? null,
    weakTitle: weakSpots[0]?.title ?? null,
    routeTitle: currentStage ?? focusItem?.route_stage ?? null,
    hasOverflow: routeItems.length > visibleItems.length,
  };
};
