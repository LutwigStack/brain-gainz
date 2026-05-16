import type { RecommendationCandidate, RouteProgressItem } from '../types/app-shell';

export type DailyTaskState = 'current' | 'next' | 'locked' | 'future' | 'complete';

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

  if (nextItemIds.has(item.id)) {
    return 'next';
  }

  return 'future';
};

const dailyStatusByState: Record<DailyTaskState, string> = {
  current: 'Текущая',
  next: 'Следующая',
  locked: 'Закрыта',
  future: 'Позже',
  complete: 'Готово',
};

const dailyActionByState: Record<DailyTaskState, string> = {
  current: 'Начать',
  next: 'Открыть',
  locked: 'Закрыто',
  future: 'Открыть карту',
  complete: 'Повторить',
};

const recommendationToTaskCard = (
  candidate: RecommendationCandidate,
  order: number,
  state: DailyTaskState,
): DailyTaskCardViewModel => ({
  key: candidate.actionId == null ? `recommendation-node-${candidate.nodeId}` : `recommendation-action-${candidate.actionId}`,
  order,
  title: candidate.actionTitle,
  subtitle: candidate.nodeTitle,
  status: dailyStatusByState[state],
  state,
  progressPercent: state === 'current' ? 35 : 0,
  actionLabel: dailyActionByState[state],
  nodeId: candidate.nodeId,
  actionId: candidate.actionId,
  disabled: false,
});

export const buildDailyTaskCards = ({
  focusItem,
  nextItems,
  routeItems,
  primaryRecommendation,
  queue,
  maxCards = 5,
}: {
  focusItem: RouteProgressItem | null;
  nextItems: RouteProgressItem[];
  routeItems: RouteProgressItem[];
  primaryRecommendation: RecommendationCandidate | null;
  queue: RecommendationCandidate[];
  maxCards?: number;
}): DailyTaskCardViewModel[] => {
  const nextItemIds = new Set(nextItems.map((item) => item.id));
  const routeCandidates = uniqueRouteItems([
    focusItem,
    ...nextItems,
    ...routeItems.filter((item) => item.is_actionable === false),
    ...routeItems.filter((item) => item.is_required === 1 && !item.is_complete && item.is_actionable !== false),
    ...routeItems.filter((item) => item.is_required !== 1 && !item.is_complete),
    ...routeItems.filter((item) => item.is_complete && item.is_actionable !== false),
  ]);

  if (routeCandidates.length > 0) {
    const cards: DailyTaskCardViewModel[] = routeCandidates.slice(0, maxCards).map((item, index) => {
      const state = routeItemState(item, focusItem, nextItemIds);
      const requiredRank = Math.max(1, masteryRank(item.required_mastery_level));
      return {
        key: `route-${item.id}`,
        order: index + 1,
        title: item.title,
        subtitle: item.route_stage ?? item.path ?? 'Маршрут',
        status: dailyStatusByState[state],
        state,
        progressPercent: routeItemProgress(item),
        actionLabel: dailyActionByState[state],
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
        title: placeholderIndex === 0 ? 'Доп. задание' : 'Слот маршрута',
        subtitle: 'откроется позже',
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
      title: state === 'future' ? 'Будущий шаг' : 'Следующий слот',
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
