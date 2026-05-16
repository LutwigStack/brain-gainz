import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  Flag,
  Layers,
  ListChecks,
  Lock,
  Map as MapIcon,
  RefreshCw,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';

import { PixelButton, PixelMeter, PixelStack, PixelSurface, PixelText } from './pixel';
import type {
  NodeFocusSnapshot,
  NowDashboardSnapshot,
  RecommendationCandidate,
  RouteProgressItem,
} from '../types/app-shell';

const reasonLabels: Record<string, string> = {
  'Открывает следующее': 'Открывает следующее',
  'Давно не трогали': 'Давно не трогали',
  'Важно для остального': 'Важно для остального',
  'Быстрый шаг': 'Быстрый шаг',
  'По силам сейчас': 'По силам сейчас',
};

const statusLabels: Record<string, string> = {
  todo: 'когда-нибудь',
  ready: 'готов к старту',
  doing: 'в работе',
  done: 'сделано',
  active: 'идет',
  completed: 'завершено',
};

const eventLabels: Record<string, string> = {
  selected: 'выбрано',
  completed: 'сделано',
  deferred: 'отложено',
  blocked: 'заблокировано',
  shrunk: 'упрощено',
};

const masterySteps = [
  { level: 'seen', label: 'Ознакомился', icon: Eye },
  { level: 'understood', label: 'Понял', icon: Brain },
  { level: 'remembered', label: 'Запомнил', icon: BookOpen },
  { level: 'applied', label: 'Применил', icon: Layers },
  { level: 'confirmed', label: 'Подтвердил', icon: ShieldCheck },
  { level: 'retained', label: 'Удержал', icon: Trophy },
] as const;

const masteryRankByLevel = {
  seen: 1,
  understood: 2,
  remembered: 3,
  applied: 4,
  confirmed: 5,
  retained: 6,
} as const;

const emptyMetrics = {
  spheres: 0,
  directions: 0,
  skills: 0,
  nodes: 0,
  actions: 0,
  dueReviews: 0,
};

const statusLabel = (value: string) => statusLabels[value] ?? value;
const eventLabel = (value: string) => eventLabels[value] ?? value;
const candidatePath = (candidate: RecommendationCandidate) =>
  `${candidate.sphereName} / ${candidate.directionName} / ${candidate.skillName}`;
const isRecommendationCandidate = (
  candidate: RecommendationCandidate | null,
): candidate is RecommendationCandidate => candidate != null;
const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
const masteryRank = (level?: string | null) => masteryRankByLevel[level as keyof typeof masteryRankByLevel] ?? 0;

const renderReasons = (reasons: string[]) =>
  reasons.slice(0, 2).map((reason) => (
    <PixelSurface key={reason} frame="ghost" padding="xs" fullWidth={false} className="today-chip">
      <PixelText as="span" size="xs" color="textMuted" uppercase>
        {reasonLabels[reason] ?? reason}
      </PixelText>
    </PixelSurface>
  ));

const uniqueRouteItems = (items: Array<RouteProgressItem | null | undefined>) => {
  const byId = new Map<number, RouteProgressItem>();

  for (const item of items) {
    if (item) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
};

interface NowViewProps {
  snapshot: NowDashboardSnapshot | null;
  focus: NodeFocusSnapshot | null;
  isLoading: boolean;
  isFocusLoading: boolean;
  error: string | null;
  notice?: string | null;
  isCreatingStarter: boolean;
  onCreateStarterWorkspace: () => void;
  onSelectRecommendation: (recommendation: RecommendationCandidate) => void;
  onOpenMap: (recommendation: RecommendationCandidate) => void;
  onOpenRouteNode: (nodeId: number) => void;
  onOpenRouteMap: () => void;
  onRefresh: () => void;
  onCompleteSpecialization: () => void;
  onContinueSpecialization: () => void;
}

export const NowView = ({
  snapshot,
  focus,
  isLoading,
  isFocusLoading,
  error,
  notice = null,
  isCreatingStarter,
  onCreateStarterWorkspace,
  onSelectRecommendation,
  onOpenMap,
  onOpenRouteNode,
  onOpenRouteMap,
  onRefresh,
  onCompleteSpecialization,
  onContinueSpecialization,
}: NowViewProps) => {
  const metrics = snapshot?.metrics ?? emptyMetrics;
  const primaryRecommendation = snapshot?.primaryRecommendation ?? null;
  const queue = snapshot?.queue ?? [];
  const todaySession = snapshot?.todaySession ?? null;
  const focusedAction = focus?.selectedAction ?? null;
  const focusedNode = focus?.node ?? null;
  const progress = focus?.progress ?? null;
  const recentEvents = todaySession?.events.slice(-3).reverse() ?? [];
  const today = snapshot?.today ?? null;
  const currentSpecialization = today?.currentSpecialization ?? null;
  const isVictory = today?.careerStatus === 'victory';
  const routeProgress = today?.route ?? null;
  const routePlanner = today?.planner ?? null;
  const plannerFocusItem = routePlanner?.focusItem ?? routeProgress?.nextItem ?? null;
  const plannerCurrentStage = routePlanner?.currentStage ?? null;
  const plannerNextItems = routePlanner?.nextItems ?? [];
  const plannerStageItems = routePlanner?.currentStageItems ?? [];
  const plannerWeakSpots = routePlanner?.weakSpots ?? [];
  const plannerReadyToVerify = routePlanner?.readyToVerify ?? [];
  const routeItems = routeProgress?.items ?? [];
  const visibleRoutePreviewItems = uniqueRouteItems([
    plannerFocusItem,
    ...plannerNextItems,
    ...(routeItems.filter((item) => item.is_actionable !== false && item.is_required === 1 && !item.is_complete) ?? []),
    ...(routeItems.filter((item) => item.is_complete) ?? []),
  ]).slice(0, 7);
  const city = today?.city ?? null;
  const opponent = today?.opponent ?? null;
  const race = today?.race ?? null;
  const verifiedMasteryCount = today?.mastery.verifiedNodeCount ?? 0;
  const selfMarkedOnlyCount = today?.mastery.selfMarkedOnlyNodeCount ?? 0;
  const routeCompletionPercent = clampPercent(routeProgress?.completionPercent ?? 0);
  const opponentPressure = clampPercent(opponent?.pressure ?? 0);
  const opponentIsAhead = opponentPressure >= routeCompletionPercent && opponentPressure > 0;
  const weakeningItems = primaryRecommendation
    ? [primaryRecommendation]
    : queue.filter(isRecommendationCandidate).slice(0, 1);
  const primaryCandidate = primaryRecommendation ?? weakeningItems[0] ?? null;
  const optionalItems = queue
    .filter((item) => item.actionId !== weakeningItems[0]?.actionId)
    .slice(0, 4);
  const remainingNodeActions =
    focus?.actions.filter((action) => action.id !== focusedAction?.id && action.status !== 'done') ?? [];
  const extraOptionsCount = optionalItems.length > 0 ? optionalItems.length : remainingNodeActions.length;
  const routeDailyTasks = uniqueRouteItems([plannerFocusItem, ...plannerNextItems]).slice(0, 5);
  const activeDailyTaskCount = routeDailyTasks.length || (primaryCandidate ? 1 : 0);
  const taskPlaceholderCount = activeDailyTaskCount > 0 ? Math.max(0, 5 - activeDailyTaskCount) : 0;
  const progressPercent = progress?.completionPercent ?? 0;
  const mainProgressPercent = routeProgress ? routeCompletionPercent : progressPercent;
  const mainProgressLabel = routeProgress
    ? `${routeProgress.completedRequiredNodeCount}/${routeProgress.requiredNodeCount} обязательных`
    : progress
      ? `${progress.completedActions}/${progress.totalActions} шагов`
      : `${metrics.actions} открытых шагов`;
  const modeTitle = currentSpecialization?.name ?? 'Свободный режим';
  const todayState = today?.state ?? {
    key: 'content_without_day_plan' as const,
    label: 'План дня не получен',
    title: 'Проверьте карту кампании',
    reason: 'Today не получил готовый дневной план. Кампания не потеряна: откройте карту и выберите безопасный следующий узел.',
    primaryCta: { action: 'open_route_map' as const, label: 'Открыть карту' },
    content: {
      hasContent: metrics.nodes > 0 || metrics.actions > 0,
      nodeCount: metrics.nodes,
      openActionCount: metrics.actions,
      totalXp: 0,
      verifiedNodeCount: 0,
      selfMarkedOnlyNodeCount: 0,
      routeNodeCount: 0,
    },
  };
  const hasRouteFocusNode = plannerFocusItem?.node_id != null;
  const primaryWorkTitle = todayState.title;
  const primaryWorkDescription = todayState.reason;
  const primaryActionLabel = todayState.primaryCta.label;
  const primaryActionIcon = isVictory ? (
    <Compass size={16} />
  ) : todayState.primaryCta.action === 'complete_route' || todayState.primaryCta.action === 'open_route_node' ? (
    <CheckCircle2 size={16} />
  ) : todayState.primaryCta.action === 'open_recommendation_map' || todayState.primaryCta.action === 'open_route_map' ? (
    <MapIcon size={16} />
  ) : (
    <Layers size={16} />
  );
  const focusedPath = focusedNode
    ? `${focusedNode.sphere_name} / ${focusedNode.direction_name} / ${focusedNode.skill_name}`
    : '';
  const routeRequiredRank = masteryRank(plannerFocusItem?.required_mastery_level);
  const routeCurrentRank = plannerFocusItem?.current_mastery_rank ?? 0;
  const currentStageDoneCount = plannerStageItems.filter((item) => item.is_complete).length;
  const hasNoRoute = todayState.key === 'no_route' || todayState.key === 'free_mode' || todayState.key === 'truly_empty';

  const handlePrimaryAction = () => {
    switch (todayState.primaryCta.action) {
      case 'continue_route':
        onContinueSpecialization();
        return;
      case 'complete_route':
        onCompleteSpecialization();
        return;
      case 'open_route_node':
        if (plannerFocusItem?.node_id != null) {
          onOpenRouteNode(plannerFocusItem.node_id as number);
        }
        return;
      case 'open_recommendation_map':
        if (primaryCandidate) {
          onOpenMap(primaryCandidate);
        }
        return;
      case 'open_route_map':
        onOpenRouteMap();
        return;
      case 'create_starter':
        onCreateStarterWorkspace();
        return;
      default:
        onRefresh();
    }
  };

  const isPrimaryActionDisabled =
    isLoading ||
    (todayState.primaryCta.action === 'create_starter' && isCreatingStarter) ||
    (todayState.primaryCta.action === 'open_recommendation_map' && !primaryCandidate) ||
    (todayState.primaryCta.action === 'open_route_node' && !hasRouteFocusNode);

  return (
    <div className="now-view today-dashboard-shell">
      <div className="today-dashboard-header">
        <div className="min-w-0">
          <PixelText as="p" size="xs" color="textMuted" uppercase>
            Сегодня / {todayState.label}
          </PixelText>
          <PixelText as="h2" readable size="xl" className="today-dashboard-title">
            {modeTitle}
          </PixelText>
        </div>
        <PixelButton onClick={onRefresh} disabled={isLoading} tone="ghost" className="today-refresh-button">
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Обновить
        </PixelButton>
      </div>

      {error ? (
        <PixelSurface frame="accent" padding="md" className="today-alert">
          <PixelText as="p" readable size="sm">
            {error}
          </PixelText>
        </PixelSurface>
      ) : null}

      {notice ? (
        <PixelSurface frame="ghost" padding="sm" className="today-alert">
          <PixelText as="p" readable size="sm" color="textMuted">
            {notice}
          </PixelText>
        </PixelSurface>
      ) : null}

      <div className="today-dashboard-grid">
        <main className="today-dashboard-main">
          <PixelSurface frame={isVictory ? 'accent' : 'panel'} padding="xl" className="today-main-goal-card">
            <div className="today-main-goal-layout">
              <div className="today-goal-icon" aria-hidden="true">
                <Target size={34} />
              </div>
              <div className="min-w-0">
                <PixelText as="p" size="xs" color="accent" uppercase>
                  Главная цель
                </PixelText>
                <PixelText as="h1" readable size="xl" className="today-main-goal-title">
                  {primaryWorkTitle}
                </PixelText>
                <PixelText as="p" readable size="sm" color="textMuted" className="today-main-goal-reason">
                  {primaryWorkDescription}
                </PixelText>
              </div>
              <div className="today-main-goal-action">
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  Прогресс
                </PixelText>
                <PixelText as="strong" readable size="xl" color={opponentIsAhead ? 'danger' : 'success'}>
                  {clampPercent(mainProgressPercent)}%
                </PixelText>
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  {mainProgressLabel}
                </PixelText>
                <PixelButton tone="accent" onClick={handlePrimaryAction} disabled={isPrimaryActionDisabled} fullWidth>
                  {primaryActionIcon} {primaryActionLabel}
                </PixelButton>
              </div>
            </div>
            <div className="today-main-progress-track" aria-hidden="true">
              <span style={{ width: `${clampPercent(mainProgressPercent)}%` }} />
            </div>
          </PixelSurface>

          <section className="today-daily-tasks">
            <div className="today-section-heading">
              <span className="today-section-icon">
                <ListChecks size={16} />
              </span>
              <PixelText as="h3" size="sm" uppercase>
                Задачи дня
              </PixelText>
              <PixelText as="span" size="xs" color="textMuted" uppercase>
                {activeDailyTaskCount} активных
              </PixelText>
            </div>

            <div className="today-task-grid">
              {routeDailyTasks.length > 0
                ? routeDailyTasks.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => (item.node_id ? onOpenRouteNode(item.node_id as number) : onOpenRouteMap())}
                      className="today-task-card"
                    >
                      <span className="today-task-card__index">{index + 1}</span>
                      <span className="today-task-card__body">
                        <PixelText as="span" readable size="sm" className="today-task-card__title">
                          {item.title}
                        </PixelText>
                        <PixelText as="span" size="xs" color="textMuted">
                          {item.route_stage ?? plannerCurrentStage ?? 'Маршрут'} · {item.current_mastery_rank}/6
                        </PixelText>
                      </span>
                      <span className="today-task-card__meter">
                        <span style={{ width: `${clampPercent((item.current_mastery_rank / 6) * 100)}%` }} />
                      </span>
                    </button>
                  ))
                : null}

              {routeDailyTasks.length === 0 && primaryCandidate ? (
                <button type="button" onClick={() => onSelectRecommendation(primaryCandidate)} className="today-task-card">
                  <span className="today-task-card__index">1</span>
                  <span className="today-task-card__body">
                    <PixelText as="span" readable size="sm" className="today-task-card__title">
                      {primaryCandidate.actionTitle}
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted">
                      {primaryCandidate.nodeTitle}
                    </PixelText>
                  </span>
                  <span className="today-task-card__meter">
                    <span style={{ width: '35%' }} />
                  </span>
                </button>
              ) : null}

              {Array.from({ length: taskPlaceholderCount }).map((_, index) => (
                <div key={`task-placeholder-${index}`} className="today-task-card today-task-card--locked">
                  <span className="today-task-card__index">{activeDailyTaskCount + index + 1}</span>
                  <span className="today-task-card__body">
                    <PixelText as="span" readable size="sm" className="today-task-card__title">
                      Доп. задание
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted">
                      откроется позже
                    </PixelText>
                  </span>
                  <span className="today-task-card__lock">
                    <Lock size={15} />
                  </span>
                </div>
              ))}

              {routeDailyTasks.length === 0 && !primaryCandidate ? (
                <PixelSurface frame="ghost" padding="md" className="today-empty-slot">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    {todayState.key === 'truly_empty'
                      ? 'Создайте стартовый набор, чтобы Today выбрал первый рабочий шаг.'
                      : hasNoRoute
                        ? 'Добавьте маршрутные узлы на карте.'
                        : 'На сегодня нет безопасных задач.'}
                  </PixelText>
                  {todayState.key === 'truly_empty' ? (
                    <PixelButton tone="ghost" onClick={onCreateStarterWorkspace} disabled={isCreatingStarter}>
                      <Layers size={14} /> Стартовый набор
                    </PixelButton>
                  ) : (
                    <PixelButton tone="ghost" onClick={onOpenRouteMap}>
                      <MapIcon size={14} /> Карта
                    </PixelButton>
                  )}
                </PixelSurface>
              ) : null}
            </div>
          </section>

          <PixelSurface frame="panel" padding="md" className="today-mastery-panel">
            <div className="today-section-heading">
              <span className="today-section-icon">
                <ShieldCheck size={16} />
              </span>
              <PixelText as="h3" size="sm" uppercase>
                Уровни освоения
              </PixelText>
              <PixelText as="span" size="xs" color="textMuted" uppercase>
                доказанное понимание
              </PixelText>
            </div>

            <div className="today-mastery-row">
              {masterySteps.map((step, index) => {
                const Icon = step.icon;
                const rank = index + 1;
                const isDone = routeCurrentRank >= rank;
                const isRequired = routeRequiredRank === rank;
                return (
                  <div
                    key={step.level}
                    className={`today-mastery-step ${isDone ? 'today-mastery-step--done' : ''} ${
                      isRequired ? 'today-mastery-step--required' : ''
                    }`}
                  >
                    <Icon size={18} />
                    <PixelText as="span" size="xs" uppercase>
                      {rank}
                    </PixelText>
                    <PixelText as="span" readable size="xs" className="today-mastery-step__label">
                      {step.label}
                    </PixelText>
                  </div>
                );
              })}
            </div>
          </PixelSurface>

          <div className="today-lower-grid">
            <PixelSurface frame="panel" padding="md" className="today-weak-panel">
              <div className="today-section-heading">
                <span className="today-section-icon today-section-icon--warning">
                  <AlertTriangle size={16} />
                </span>
                <PixelText as="h3" size="sm" uppercase>
                  Слабые места
                </PixelText>
              </div>

              <div className="today-weak-list">
                {plannerWeakSpots.length > 0
                  ? plannerWeakSpots.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => (item.node_id ? onOpenRouteNode(item.node_id as number) : onOpenRouteMap())}
                        className="today-weak-row"
                      >
                        <span className="today-weak-row__icon">
                          <AlertTriangle size={14} />
                        </span>
                        <span className="min-w-0">
                          <PixelText as="span" readable size="sm" className="today-weak-row__title">
                            {item.title}
                          </PixelText>
                          <PixelText as="span" size="xs" color="textMuted">
                            удержание {item.current_mastery_rank}/6
                          </PixelText>
                        </span>
                        <PixelText as="span" size="xs" color="accent" uppercase>
                          Повторить
                        </PixelText>
                      </button>
                    ))
                  : null}

                {plannerWeakSpots.length === 0 && weakeningItems.length > 0
                  ? weakeningItems.map((item) => (
                      <button
                        key={item.actionId}
                        type="button"
                        onClick={() => onSelectRecommendation(item)}
                        className="today-weak-row"
                      >
                        <span className="today-weak-row__icon">
                          <AlertTriangle size={14} />
                        </span>
                        <span className="min-w-0">
                          <PixelText as="span" readable size="sm" className="today-weak-row__title">
                            {item.nodeTitle}
                          </PixelText>
                          <span className="today-weak-row__chips">{renderReasons(item.whyNow)}</span>
                        </span>
                        <PixelText as="span" size="xs" color="accent" uppercase>
                          Фокус
                        </PixelText>
                      </button>
                    ))
                  : null}

                {plannerWeakSpots.length === 0 && weakeningItems.length === 0 ? (
                  <div className="today-weak-empty">
                    <PixelText as="p" readable size="sm" color="textMuted">
                      Явных провалов нет.
                    </PixelText>
                  </div>
                ) : null}
              </div>
            </PixelSurface>

            <PixelSurface frame="panel" padding="md" className="today-mini-map-panel">
              <div className="today-section-heading">
                <span className="today-section-icon">
                  <MapIcon size={16} />
                </span>
                <PixelText as="h3" size="sm" uppercase>
                  Мини-карта
                </PixelText>
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  фронт маршрута
                </PixelText>
              </div>

              <button
                type="button"
                onClick={onOpenRouteMap}
                className="today-mini-map"
                aria-label="Открыть карту маршрута"
              >
                {visibleRoutePreviewItems.length > 0 ? (
                  visibleRoutePreviewItems.map((item, index) => (
                    <span
                      key={item.id}
                      className={`today-mini-map__node ${item.is_complete ? 'today-mini-map__node--done' : ''} ${
                        item.id === plannerFocusItem?.id ? 'today-mini-map__node--focus' : ''
                      }`}
                      style={{
                        left: `${10 + (index % 4) * 25}%`,
                        top: `${20 + Math.floor(index / 4) * 42 + (index % 2) * 8}%`,
                      }}
                      title={item.title}
                    />
                  ))
                ) : (
                  <span className="today-mini-map__empty">
                    {hasNoRoute ? 'Маршрут еще не собран' : 'Нет узлов для превью'}
                  </span>
                )}
                <span className="today-mini-map__crosshair" aria-hidden="true" />
              </button>
            </PixelSurface>
          </div>

          {primaryCandidate || focusedNode || optionalItems.length > 0 || remainingNodeActions.length > 0 ? (
            <PixelSurface frame="ghost" padding="md" className="today-secondary-panel">
              <div className="today-secondary-grid">
                {primaryCandidate ? (
                  <div className="min-w-0">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Очередь
                    </PixelText>
                    <PixelText as="p" readable size="sm" className="today-secondary-title">
                      {primaryCandidate.actionTitle}
                    </PixelText>
                    <PixelText as="p" readable size="xs" color="textMuted">
                      {candidatePath(primaryCandidate)} / {primaryCandidate.nodeTitle}
                    </PixelText>
                  </div>
                ) : null}

                {focusedNode && focusedAction && progress ? (
                  <div className="min-w-0">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Текущий фокус
                    </PixelText>
                    <PixelText as="p" readable size="sm" className="today-secondary-title">
                      {focusedAction.title}
                    </PixelText>
                    <PixelText as="p" readable size="xs" color="textMuted">
                      {statusLabel(focusedAction.status)} · {focusedPath}
                    </PixelText>
                  </div>
                ) : null}

                {extraOptionsCount > 0 ? (
                  <div className="today-secondary-count">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Еще можно
                    </PixelText>
                    <PixelText as="strong" readable size="lg" color="accent">
                      {extraOptionsCount}
                    </PixelText>
                  </div>
                ) : null}
              </div>

              {isFocusLoading ? (
                <PixelText as="p" readable size="sm" color="textMuted" className="mt-3">
                  Загрузка...
                </PixelText>
              ) : null}

              {recentEvents.length > 0 ? (
                <div className="today-event-row">
                  {recentEvents.map((event) => (
                    <span key={event.id} className="today-event-pill">
                      <CheckCircle2 size={13} /> {eventLabel(event.event_type)}
                    </span>
                  ))}
                </div>
              ) : null}
            </PixelSurface>
          ) : null}
        </main>

        <aside className="today-meta-rail">
          <PixelSurface frame="panel" padding="md" className="today-rail-card today-rail-card--race">
            <div className="today-rail-race-portrait" style={{ borderColor: race?.color ?? 'var(--pixel-accent)' }}>
              <span>{race?.emblem ?? '◆'}</span>
            </div>
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Ваша раса
            </PixelText>
            <PixelText as="h3" readable size="lg" className="today-rail-title">
              {race?.title ?? 'Свободный режим'}
            </PixelText>
          </PixelSurface>

          <PixelSurface frame="panel" padding="md" className="today-rail-card">
            <div className="today-rail-card-heading">
              <Flag size={16} />
              <PixelText as="h3" size="sm" uppercase>
                Цивилизация
              </PixelText>
            </div>
            <div className="today-city-line">
              <PixelText as="span" size="xs" color="textMuted" uppercase>
                Уровень города
              </PixelText>
              <PixelText as="strong" readable size="lg" color="info">
                {city?.level ?? 1}
              </PixelText>
            </div>
            <PixelMeter value={city?.totalXp ?? 0} max={Math.max(city?.totalXp ?? 0, 1000)} tone="info" showValue={false} />
            <div className="today-rail-stats">
              <span>XP {city?.totalXp ?? 0}</span>
              <span>{verifiedMasteryCount} проверено</span>
              <span>{selfMarkedOnlyCount} сам отметил</span>
            </div>
          </PixelSurface>

          <PixelSurface frame="panel" padding="md" className="today-rail-card">
            <div className="today-rail-card-heading today-rail-card-heading--danger">
              <Swords size={16} />
              <PixelText as="h3" size="sm" uppercase>
                ИИ-соперник
              </PixelText>
            </div>
            <div className="today-opponent-row">
              <div className="today-opponent-avatar" aria-hidden="true">
                <Swords size={22} />
              </div>
              <div className="min-w-0">
                <PixelText as="p" readable size="sm" className="today-rail-title">
                  Corvus AI
                </PixelText>
                <PixelText as="p" size="xs" color="textMuted">
                  {opponent ? `${opponent.daysElapsed} дней в кампании` : 'Гонка не активна'}
                </PixelText>
              </div>
            </div>
            <PixelMeter
              label="Прогресс по кампании"
              value={opponentPressure}
              max={100}
              tone={opponentIsAhead ? 'danger' : 'info'}
              showValue
            />
            <div className="today-rail-stats">
              <span>Вы {routeCompletionPercent}%</span>
              <span>ИИ {opponentPressure}%</span>
              <span>{opponent ? `${opponent.score} счет` : 'без счета'}</span>
            </div>
          </PixelSurface>

          <PixelSurface frame="ghost" padding="md" className="today-rail-card today-rail-card--route">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Статус маршрута
            </PixelText>
            <PixelText as="p" readable size="sm" className="today-rail-title">
              {plannerCurrentStage ?? (routeProgress?.isComplete ? 'Маршрут закрыт' : 'Текущий фронт')}
            </PixelText>
            <div className="today-route-meta">
              <span>{routeProgress?.routeNodeCount ?? todayState.content.routeNodeCount} узлов</span>
              <span>
                {plannerStageItems.length > 0 ? `${currentStageDoneCount}/${plannerStageItems.length} этап` : 'этап не выбран'}
              </span>
              <span>{plannerReadyToVerify.length} к проверке</span>
              <span>{todaySession ? statusLabel(todaySession.status) : 'сессия не начата'}</span>
            </div>
            {hasNoRoute ? (
              <PixelButton tone="ghost" onClick={onOpenRouteMap} fullWidth>
                <MapIcon size={14} /> Настроить маршрут
              </PixelButton>
            ) : null}
          </PixelSurface>

          {todayState.primaryCta.action === 'open_route_node' && !hasRouteFocusNode ? (
            <PixelSurface frame="ghost" padding="sm" className="today-rail-card">
              <PixelText as="p" size="xs" color="textMuted" uppercase>
                <Lock size={13} /> Узел недоступен
              </PixelText>
            </PixelSurface>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
