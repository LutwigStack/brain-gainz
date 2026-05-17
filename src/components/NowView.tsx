import {
  Activity,
  AlertTriangle,
  ArrowRight,
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

import { PixelButton, PixelStack, PixelSurface, PixelText } from './pixel';
import { ReferenceAssetImage } from '../assets/ReferenceAssetImage';
import {
  csBachelorReferenceAssets,
  isCoreCsFoundations,
  resolveMasteryAsset,
  resolveRouteLandmarkAsset,
  resolveTaskAsset,
} from '../assets/referenceStyleAssets';
import {
  buildTodayRightRail,
  buildDailyTaskCards,
  buildMiniMapPreview,
  clampPercent,
  masteryRank,
  type DailyTaskCardViewModel,
} from './today-dashboard-model';
import type {
  DailyRunTaskOutcome,
  NodeFocusSnapshot,
  NowDashboardSnapshot,
  RecommendationCandidate,
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

const renderReasons = (reasons: string[]) =>
  reasons.slice(0, 2).map((reason) => (
    <PixelSurface key={reason} frame="ghost" padding="xs" fullWidth={false} className="today-chip">
      <PixelText as="span" size="xs" color="textMuted" uppercase>
        {reasonLabels[reason] ?? reason}
      </PixelText>
    </PixelSurface>
  ));

const taskIconByState = {
  current: Target,
  next: ArrowRight,
  recovery: RefreshCw,
  locked: Lock,
  future: MapIcon,
  complete: CheckCircle2,
} as const;

type TaskStateIconKind = 'practice' | 'assessment' | 'recovery' | 'deferred';

const dailyRunTaskIconState = (
  source: string | null | undefined,
  outcome: DailyRunTaskOutcome | null | undefined,
): TaskStateIconKind => {
  if (outcome === 'deferred' || outcome === 'skipped') {
    return 'deferred';
  }

  if (outcome === 'failed' || source === 'weak_spot' || source === 'recovery_retry') {
    return 'recovery';
  }

  if (source === 'due_check' || source === 'ready_check') {
    return 'assessment';
  }

  return 'practice';
};

const dailyCardIconState = (state: DailyTaskCardViewModel['state']): TaskStateIconKind => {
  if (state === 'recovery') {
    return 'recovery';
  }

  if (state === 'locked' || state === 'future') {
    return 'deferred';
  }

  return 'practice';
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
  isDailyRunPending?: boolean;
  onStartDailyRun: () => void;
  onCompleteDailyRunTask: (taskId: number) => void;
  onFailDailyRunTask: (taskId: number) => void;
  onRetryDailyRunTask: (actionId: number) => void;
  onSkipDailyRunTask: (taskId: number) => void;
  onDeferDailyRunTask: (taskId: number) => void;
  onFinishDailyRun: () => void;
  onAbandonDailyRun: () => void;
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
  isDailyRunPending = false,
  onStartDailyRun,
  onCompleteDailyRunTask,
  onFailDailyRunTask,
  onRetryDailyRunTask,
  onSkipDailyRunTask,
  onDeferDailyRunTask,
  onFinishDailyRun,
  onAbandonDailyRun,
}: NowViewProps) => {
  const metrics = snapshot?.metrics ?? emptyMetrics;
  const primaryRecommendation = snapshot?.primaryRecommendation ?? null;
  const queue = snapshot?.queue ?? [];
  const todaySession = snapshot?.todaySession ?? null;
  const focusedAction = focus?.selectedAction ?? null;
  const focusedNode = focus?.node ?? null;
  const progress = focus?.progress ?? null;
  const recentEvents = todaySession?.events.slice(-3).reverse() ?? [];
  const dailyRunTasks = todaySession?.tasks ?? [];
  const dailyRunState =
    todaySession?.state ?? (todaySession?.status === 'planned' ? 'not_started' : todaySession?.status ?? 'not_started');
  const isDailyRunActive = dailyRunState === 'active';
  const isDailyRunFinished = dailyRunState === 'completed' || dailyRunState === 'abandoned';
  const pendingRunTaskCount = dailyRunTasks.filter((task) => task.outcome === 'pending').length;
  const resolvedRunTaskCount = Math.max(0, dailyRunTasks.length - pendingRunTaskCount);
  const firstPendingRunTaskId = dailyRunTasks.find((task) => task.outcome === 'pending')?.id ?? null;
  const canFinishDailyRun = isDailyRunActive && dailyRunTasks.length > 0 && pendingRunTaskCount === 0;
  const dailyRunResolvedPercent =
    dailyRunTasks.length > 0 ? clampPercent((resolvedRunTaskCount / dailyRunTasks.length) * 100) : 0;
  const today = snapshot?.today ?? null;
  const currentSpecialization = today?.currentSpecialization ?? null;
  const hasCoreCsAssets = isCoreCsFoundations(currentSpecialization);
  const isVictory = today?.careerStatus === 'victory';
  const routeProgress = today?.route ?? null;
  const routePlanner = today?.planner ?? null;
  const plannerFocusItem = routePlanner?.focusItem ?? routeProgress?.nextItem ?? null;
  const plannerCurrentStage = routePlanner?.currentStage ?? null;
  const plannerNextItems = routePlanner?.nextItems ?? [];
  const plannerWeakSpots = routePlanner?.weakSpots ?? [];
  const routeItems = routeProgress?.items ?? [];
  const opponent = today?.opponent ?? null;
  const todayRail = buildTodayRightRail({ today, todaySession });
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
  const dailyTaskCards = buildDailyTaskCards({
    focusItem: plannerFocusItem,
    nextItems: plannerNextItems,
    weakSpots: plannerWeakSpots,
    routeItems,
    primaryRecommendation: primaryCandidate,
    queue,
  });
  const activeDailyTaskCount = dailyTaskCards.filter((task) => ['current', 'next', 'recovery'].includes(task.state)).length;
  const miniMapPreview = buildMiniMapPreview({
    focusItem: plannerFocusItem,
    nextItems: plannerNextItems,
    weakSpots: plannerWeakSpots,
    routeItems,
    currentStage: plannerCurrentStage,
  });
  const miniMapLandmarkAsset = hasCoreCsAssets
    ? resolveRouteLandmarkAsset(miniMapPreview.routeTitle ?? miniMapPreview.frontTitle)
    : null;
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

  const handleDailyTaskAction = (task: DailyTaskCardViewModel) => {
    if (task.disabled) {
      return;
    }

    if (task.actionId != null) {
      const recommendation = [primaryCandidate, ...queue].find((item) => item?.actionId === task.actionId);
      if (recommendation) {
        onSelectRecommendation(recommendation);
        return;
      }
    }

    if (task.state === 'future' || task.nodeId == null) {
      onOpenRouteMap();
      return;
    }

    onOpenRouteNode(task.nodeId);
  };

  const handleRunTaskOutcome = (
    task: NonNullable<NonNullable<NowDashboardSnapshot['todaySession']>['tasks']>[number],
    outcome: 'completed' | 'failed' | 'skipped' | 'deferred',
  ) => {
    if (isDailyRunPending || task.outcome !== 'pending') {
      return;
    }

    if (outcome === 'completed') {
      onCompleteDailyRunTask(task.id);
      return;
    }

    if (outcome === 'failed') {
      onFailDailyRunTask(task.id);
      return;
    }

    if (outcome === 'skipped') {
      onSkipDailyRunTask(task.id);
      return;
    }

    onDeferDailyRunTask(task.id);
  };

  const handleRetryRunTask = (
    task: NonNullable<NonNullable<NowDashboardSnapshot['todaySession']>['tasks']>[number],
  ) => {
    if (isDailyRunPending || task.actionId == null || !isDailyRunActive || task.outcome === 'pending') {
      return;
    }

    onRetryDailyRunTask(task.actionId);
  };

  const runOutcomeLabel = (outcome: string) => {
    if (outcome === 'completed') {
      return 'reinforced';
    }
    if (outcome === 'failed') {
      return 'retry ready';
    }
    if (outcome === 'skipped') {
      return 'kept for later';
    }
    if (outcome === 'deferred') {
      return 'queued';
    }
    return outcome;
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
        <PixelSurface frame="destructive" padding="md" className="today-alert">
          <PixelText as="p" readable size="sm">
            {error}
          </PixelText>
        </PixelSurface>
      ) : null}

      {notice ? (
        <PixelSurface frame="secondary" padding="sm" className="today-alert">
          <PixelText as="p" readable size="sm" color="textMuted">
            {notice}
          </PixelText>
        </PixelSurface>
      ) : null}

      <div className="today-dashboard-grid">
        <main className="today-dashboard-main">
          <PixelSurface frame={isVictory ? 'selected' : 'primary'} padding="xl" className="today-main-goal-card">
            <div className="today-main-goal-layout">
              <div className="today-goal-icon" aria-hidden="true">
                {hasCoreCsAssets ? (
                  <ReferenceAssetImage
                    asset={csBachelorReferenceAssets.campaign.crest}
                    decorative
                    className="today-goal-icon__asset"
                    fallback={<Target size={34} />}
                  />
                ) : (
                  <Target size={34} />
                )}
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
                <PixelText as="strong" readable size="xl" color={opponentIsAhead ? 'warning' : 'success'}>
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

            <PixelSurface
              frame={isDailyRunActive ? 'selected' : isDailyRunFinished ? 'secondary' : 'ghost'}
              padding="md"
              className={`today-run-panel${isDailyRunActive ? ' today-run-panel--active' : ''}${
                canFinishDailyRun ? ' today-run-panel--ready' : ''
              }${isDailyRunFinished ? ' today-run-panel--finished' : ''}`}
            >
              {!todaySession || dailyRunState === 'not_started' ? (
                <div className="today-run-start">
                  <div className="min-w-0">
                    <PixelText as="p" readable size="sm" className="today-secondary-title">
                      Start a 3-5 task run from route, weak spots, due checks, and the current front.
                    </PixelText>
                    <PixelText as="p" readable size="xs" color="textMuted">
                      Tasks are saved, so refresh keeps the active run.
                    </PixelText>
                  </div>
                  <PixelButton tone="accent" onClick={onStartDailyRun} disabled={isDailyRunPending || dailyTaskCards.length === 0}>
                    <Activity size={14} /> Start Run
                  </PixelButton>
                </div>
              ) : null}

              {isDailyRunActive ? (
                <div className="today-run-active">
                  <div className={`today-run-progress${canFinishDailyRun ? ' today-run-progress--ready' : ''}`}>
                    <PixelText as="span" size="xs" color={canFinishDailyRun ? 'accent' : 'textMuted'} uppercase>
                      {canFinishDailyRun ? 'ready to finish' : `${resolvedRunTaskCount}/${dailyRunTasks.length} resolved`}
                    </PixelText>
                    <span className="today-run-progress__meter" aria-hidden="true">
                      <span style={{ width: `${dailyRunResolvedPercent}%` }} />
                    </span>
                  </div>
                  <div className="today-run-task-list">
                    {dailyRunTasks.map((task) => {
                      const taskAsset = hasCoreCsAssets ? resolveTaskAsset(task.source, task.outcome) : null;
                      const taskIconState = dailyRunTaskIconState(task.source, task.outcome);
                      const isCurrentRunTask = task.outcome === 'pending' && task.id === firstPendingRunTaskId;

                      return (
                      <div
                        key={task.id}
                        className={`today-run-task today-run-task--${task.outcome}${
                          isCurrentRunTask ? ' today-run-task--current' : ''
                        }`}
                      >
                        <div className="today-run-task__main">
                          <span className={`today-task-card__asset today-task-card__asset--${taskIconState}`} aria-hidden="true">
                            <ReferenceAssetImage
                              asset={taskAsset}
                              decorative
                              className="today-task-card__asset-image"
                              fallback={<Target size={14} />}
                            />
                            <span className="today-task-card__asset-order">{task.order}</span>
                          </span>
                          <span className="min-w-0">
                            <PixelText as="span" readable size="sm" className="today-run-task__title">
                              {task.title}
                            </PixelText>
                            <PixelText as="span" size="xs" color="textMuted" className="today-run-task__subtitle">
                              {task.sourceLabel} / {task.subtitle}
                            </PixelText>
                            {isCurrentRunTask ? (
                              <span className="today-run-task__current-chip">current</span>
                            ) : null}
                          </span>
                        </div>
                        {task.outcome === 'pending' ? (
                          <div className="today-run-task__actions">
                            <PixelButton tone="accent" onClick={() => handleRunTaskOutcome(task, 'completed')} disabled={isDailyRunPending}>
                              <CheckCircle2 size={13} /> Complete
                            </PixelButton>
                            <PixelButton tone="ghost" onClick={() => handleRunTaskOutcome(task, 'failed')} disabled={isDailyRunPending}>
                              <RefreshCw size={13} /> Another pass
                            </PixelButton>
                            <PixelButton tone="ghost" onClick={() => handleRunTaskOutcome(task, 'skipped')} disabled={isDailyRunPending}>
                              <ArrowRight size={13} /> Skip
                            </PixelButton>
                            <PixelButton tone="ghost" onClick={() => handleRunTaskOutcome(task, 'deferred')} disabled={isDailyRunPending}>
                              <RefreshCw size={13} /> Defer
                            </PixelButton>
                          </div>
                        ) : (
                          <div className="today-run-task__resolved">
                            <span className={`today-run-task__outcome today-run-task__outcome--${task.outcome}`}>
                              {runOutcomeLabel(task.outcome)}
                            </span>
                            {isDailyRunActive && task.actionId != null ? (
                              <PixelButton tone="ghost" onClick={() => handleRetryRunTask(task)} disabled={isDailyRunPending}>
                                <RefreshCw size={13} /> {task.outcome === 'completed' ? 'Repeat' : 'Retry'}
                              </PixelButton>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                  <div className={`today-run-footer${canFinishDailyRun ? ' today-run-footer--ready' : ''}`}>
                    <PixelText as="span" size="xs" color={canFinishDailyRun ? 'accent' : 'textMuted'} uppercase>
                      {pendingRunTaskCount === 0 ? 'ready to finish' : `${pendingRunTaskCount} pending`}
                    </PixelText>
                    <div className="today-run-footer__actions">
                      <PixelButton tone="ghost" onClick={onAbandonDailyRun} disabled={isDailyRunPending}>
                        <AlertTriangle size={13} /> Abandon
                      </PixelButton>
                      <PixelButton tone="accent" onClick={onFinishDailyRun} disabled={isDailyRunPending || !canFinishDailyRun}>
                        <Flag size={13} /> Finish
                      </PixelButton>
                    </div>
                  </div>
                </div>
              ) : null}

              {isDailyRunFinished ? (
                <div className="today-run-summary">
                  <PixelText as="p" size="xs" color={dailyRunState === 'completed' ? 'success' : 'warning'} uppercase>
                    {dailyRunState === 'completed' ? 'Run completed' : 'Run abandoned'}
                  </PixelText>
                  {(todaySession.summary?.lines.length ? todaySession.summary.lines : [todaySession.summary_note ?? 'No summary recorded.']).map((line) => (
                    <PixelText key={line} as="p" readable size="sm" color="textMuted">
                      {line}
                    </PixelText>
                  ))}
                  <PixelButton tone="ghost" onClick={onStartDailyRun} disabled={isDailyRunPending || dailyTaskCards.length === 0}>
                    <Activity size={14} /> Start New Run
                  </PixelButton>
                </div>
              ) : null}
            </PixelSurface>

            <div className="today-task-grid">
              {dailyTaskCards.length > 0
                ? dailyTaskCards.map((task) => {
                    const TaskIcon = taskIconByState[task.state];
                    const taskAsset = hasCoreCsAssets ? resolveTaskAsset(task.state) : null;
                    const taskIconState = dailyCardIconState(task.state);
                    return (
                    <button
                      key={task.key}
                      type="button"
                      onClick={() => handleDailyTaskAction(task)}
                      disabled={task.disabled}
                      className={`today-task-card today-task-card--${task.state}`}
                    >
                      <span className="today-task-card__topline">
                        <span className={`today-task-card__asset today-task-card__asset--${taskIconState}`} aria-hidden="true">
                          <ReferenceAssetImage
                            asset={taskAsset}
                            decorative
                            className="today-task-card__asset-image"
                            fallback={<TaskIcon size={15} />}
                          />
                          <span className="today-task-card__asset-order">{task.order}</span>
                        </span>
                        <span className="today-task-card__status">{task.status}</span>
                      </span>
                      <span className="today-task-card__body">
                        <PixelText as="span" readable size="sm" className="today-task-card__title">
                          {task.title}
                        </PixelText>
                        <PixelText as="span" size="xs" color="textMuted" className="today-task-card__subtitle">
                          {task.subtitle}
                        </PixelText>
                      </span>
                      <span className="today-task-card__footer">
                        <span className="today-task-card__meter" aria-hidden="true">
                          <span style={{ width: `${task.progressPercent}%` }} />
                        </span>
                        <span className="today-task-card__action">
                          {task.state === 'locked' ? <Lock size={14} /> : <ArrowRight size={14} />}
                          {task.actionLabel}
                        </span>
                      </span>
                    </button>
                  );
                  })
                : null}

              {dailyTaskCards.length === 0 ? (
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

          <PixelSurface frame="secondary" padding="md" className="today-mastery-panel">
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
                const masteryAsset = hasCoreCsAssets ? resolveMasteryAsset(step.level) : null;
                return (
                  <div
                    key={step.level}
                    className={`today-mastery-step ${isDone ? 'today-mastery-step--done' : ''} ${
                      isRequired ? 'today-mastery-step--required' : ''
                    } today-mastery-step--${step.level}`}
                  >
                    <ReferenceAssetImage
                      asset={masteryAsset}
                      decorative
                      className="today-mastery-step__asset"
                      fallback={<Icon size={18} />}
                    />
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
            <PixelSurface frame="warning" padding="md" className="today-weak-panel">
              <div className="today-section-heading">
                <span className="today-section-icon today-section-icon--warning">
                  <RefreshCw size={16} />
                </span>
                <PixelText as="h3" size="sm" uppercase>
                  Recovery
                </PixelText>
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  practice opportunities
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
                          <ReferenceAssetImage
                            asset={hasCoreCsAssets ? csBachelorReferenceAssets.task.recovery : null}
                            decorative
                            className="today-weak-row__asset"
                            fallback={<RefreshCw size={14} />}
                          />
                        </span>
                        <span className="min-w-0">
                          <PixelText as="span" readable size="sm" className="today-weak-row__title">
                            {item.title}
                          </PixelText>
                          <PixelText as="span" size="xs" color="textMuted">
                            {item.weak_spot_reason_label ?? 'Reinforce the route foundation'}
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
                          <ReferenceAssetImage
                            asset={hasCoreCsAssets ? csBachelorReferenceAssets.task.recovery : null}
                            decorative
                            className="today-weak-row__asset"
                            fallback={<RefreshCw size={14} />}
                          />
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
                      Nothing needs extra reinforcement right now.
                    </PixelText>
                  </div>
                ) : null}
              </div>
            </PixelSurface>

            <PixelSurface frame="secondary" padding="md" className="today-mini-map-panel">
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

              <div
                className="today-mini-map"
                role="img"
                aria-label="Превью текущего фронта, маршрута и слабого места"
                data-mini-map-preview="non-destructive"
              >
                <ReferenceAssetImage
                  asset={miniMapLandmarkAsset}
                  decorative
                  className="today-mini-map__landmark"
                  fallback={<span className="today-mini-map__landmark today-mini-map__landmark--fallback" />}
                />
                {miniMapPreview.nodes.length > 0 ? (
                  <>
                    <svg className="today-mini-map__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      {miniMapPreview.edges.map((edge) => {
                        const from = miniMapPreview.nodes.find((node) => node.id === edge.from);
                        const to = miniMapPreview.nodes.find((node) => node.id === edge.to);
                        if (!from || !to) {
                          return null;
                        }
                        return (
                          <line
                            key={edge.id}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            className={`today-mini-map__edge today-mini-map__edge--${edge.kind}`}
                          />
                        );
                      })}
                    </svg>
                    {miniMapPreview.nodes.map((node) => (
                      <span
                        key={node.id}
                        className={`today-mini-map__node today-mini-map__node--${node.kind}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        title={node.title}
                      />
                    ))}
                    <span className="today-mini-map__front-label">
                      <Target size={13} /> {miniMapPreview.frontTitle ?? 'Фронт'}
                    </span>
                  </>
                ) : (
                  <span className="today-mini-map__empty">
                    {hasNoRoute ? 'Маршрут еще не собран' : 'Нет узлов для превью'}
                  </span>
                )}
              </div>

              <div className="today-mini-map__meta">
                <span className="today-mini-map__chip today-mini-map__chip--front">Фронт</span>
                <span className="today-mini-map__chip today-mini-map__chip--route">
                  {miniMapPreview.routeTitle ?? 'Маршрут'}
                </span>
                <span className="today-mini-map__chip today-mini-map__chip--weak">
                  {miniMapPreview.weakTitle ? `Recovery: ${miniMapPreview.weakTitle}` : 'No recovery item'}
                </span>
              </div>

              <PixelButton tone="accent" onClick={onOpenRouteMap} fullWidth className="today-mini-map__cta">
                <MapIcon size={14} /> Открыть карту
              </PixelButton>
            </PixelSurface>
          </div>

          {primaryCandidate || focusedNode || optionalItems.length > 0 || remainingNodeActions.length > 0 ? (
            <PixelSurface frame="secondary" padding="md" className="today-secondary-panel">
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

        <aside className="today-meta-rail" aria-label="Статус гонки, города и соперника">
          <PixelSurface
            frame="secondary"
            padding="md"
            className={`today-rail-card today-rail-card--race ${todayRail.race.hasIdentity ? '' : 'today-rail-card--empty'}`}
            style={{ borderColor: todayRail.race.color }}
          >
            <div className="today-rail-card-heading">
              <Trophy size={16} />
              <PixelText as="h3" size="sm" uppercase>
                Ваша раса
              </PixelText>
            </div>
            <div className="today-rail-race-portrait" style={{ borderColor: todayRail.race.color }}>
              <ReferenceAssetImage
                asset={hasCoreCsAssets && todayRail.race.hasIdentity ? csBachelorReferenceAssets.race.ravenStrategist : null}
                decorative
                className="today-rail-race-portrait__image"
                fallback={
                  <>
                    <span style={{ color: todayRail.race.color }}>{todayRail.race.emblem}</span>
                    <i aria-hidden="true" />
                  </>
                }
              />
            </div>
            <div className="today-rail-identity">
              <PixelText as="h3" readable size="lg" className="today-rail-title">
                {todayRail.race.title}
              </PixelText>
              <PixelText as="p" size="xs" color="textMuted">
                {todayRail.race.stateLabel}
              </PixelText>
            </div>
            <div className="today-rail-kpi-grid">
              <span>
                <strong>{todayRail.race.xpLabel}</strong>
                <small>очки знаний</small>
              </span>
              <span>
                <strong>{todayRail.race.streakLabel}</strong>
                <small>серия</small>
              </span>
              <span className="today-rail-kpi-grid__wide">
                <strong>{todayRail.race.rankLabel}</strong>
                <small>ранг</small>
              </span>
            </div>
          </PixelSurface>

          <PixelSurface
            frame="secondary"
            padding="md"
            className={`today-rail-card today-rail-card--city ${todayRail.city.hasDistricts ? '' : 'today-rail-card--empty'}`}
          >
            <div className="today-rail-card-heading">
              <Flag size={16} />
              <PixelText as="h3" size="sm" uppercase>
                Цивилизация
              </PixelText>
              <PixelText as="span" size="xs" color="info" uppercase>
                {todayRail.city.levelLabel}
              </PixelText>
            </div>
            <div className={`today-city-visual ${hasCoreCsAssets ? 'today-city-visual--asset' : ''}`} aria-hidden="true">
              <ReferenceAssetImage
                asset={hasCoreCsAssets ? csBachelorReferenceAssets.city.coreCsCitadel : null}
                decorative
                className="today-city-visual__image"
                fallback={
                  todayRail.city.hasDistricts ? (
                    <>
                      {todayRail.city.districts.slice(0, 6).map((district, index) => (
                        <span
                          key={district.id}
                          className={`today-city-tower today-city-tower--${index + 1}`}
                          style={{ backgroundColor: district.color, height: `${28 + district.level * 8}px` }}
                          title={district.title}
                        >
                          <i>{district.emblem}</i>
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="today-city-empty-silhouette">
                      <Flag size={26} />
                    </span>
                  )
                }
              />
            </div>
            <div className="today-rail-split-line">
              <span>
                <small>{todayRail.city.hasDistricts ? 'главный район' : 'состояние'}</small>
                <strong>{todayRail.city.title}</strong>
              </span>
              <span>
                <small>XP</small>
                <strong>{todayRail.city.xpLabel}</strong>
              </span>
            </div>
            <div className="today-rail-meter" aria-label={`Прогресс города: ${todayRail.city.progressLabel}`}>
              <span style={{ width: `${todayRail.city.progressPercent}%` }} />
            </div>
            <div className="today-rail-stats">
              <span>{todayRail.city.progressLabel}</span>
              <span>{todayRail.city.districts.length} районов</span>
              <span>{todayRail.city.featuredDistrict ? `${todayRail.city.featuredDistrict.level} ур. района` : 'рост начнется с XP'}</span>
            </div>
          </PixelSurface>

          <PixelSurface
            frame="secondary"
            padding="md"
            className={`today-rail-card today-rail-card--opponent ${todayRail.opponent.hasOpponent ? '' : 'today-rail-card--empty'}`}
          >
            <div className="today-rail-card-heading today-rail-card-heading--danger">
              <Swords size={16} />
              <PixelText as="h3" size="sm" uppercase>
                ИИ-соперник
              </PixelText>
            </div>
            <div className="today-opponent-banner">
              <ReferenceAssetImage
                asset={hasCoreCsAssets && todayRail.opponent.hasOpponent ? csBachelorReferenceAssets.opponent.corvusAi : null}
                decorative
                className="today-opponent-banner__image"
                fallback={<span className="today-opponent-banner__image today-opponent-banner__image--fallback" />}
              />
              <div className="today-opponent-banner__content">
                <div className="today-opponent-avatar" aria-hidden="true">
                  <Swords size={24} />
                </div>
                <div className="min-w-0">
                  <PixelText as="p" readable size="sm" className="today-rail-title">
                    {todayRail.opponent.title}
                  </PixelText>
                  <PixelText as="p" size="xs" color="textMuted">
                    {todayRail.opponent.subtitle}
                  </PixelText>
                </div>
              </div>
            </div>
            <div className="today-opponent-race-track" aria-label={`Гонка: ${todayRail.opponent.campaignProgressLabel}`}>
              <span className="today-opponent-race-track__user" style={{ width: `${todayRail.opponent.userProgressPercent}%` }} />
              <span className="today-opponent-race-track__ai" style={{ width: `${todayRail.opponent.opponentProgressPercent}%` }} />
            </div>
            <div className="today-rail-split-line">
              <span>
                <small>кампания</small>
                <strong>{todayRail.opponent.campaignProgressLabel}</strong>
              </span>
              <span>
                <small>статус</small>
                <strong>{todayRail.opponent.stateLabel}</strong>
              </span>
            </div>
            <div className="today-rail-stats">
              <span>{todayRail.opponent.scoreLabel}</span>
              <span>{todayRail.opponent.hasOpponent ? 'давление маршрута' : 'пустой слот'}</span>
            </div>
          </PixelSurface>

          <PixelSurface frame="secondary" padding="md" className="today-rail-card today-rail-card--route">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Статус маршрута
            </PixelText>
            <PixelText as="p" readable size="sm" className="today-rail-title">
              {todayRail.route.title}
            </PixelText>
            <div className="today-route-meta">
              <span>{todayRail.route.nodeLabel}</span>
              <span>{todayRail.route.stageLabel}</span>
              <span>{todayRail.route.verifyLabel}</span>
              <span>
                <Activity size={13} /> {todayRail.route.sessionLabel}
              </span>
            </div>
            {hasNoRoute ? (
              <PixelButton tone="ghost" onClick={onOpenRouteMap} fullWidth>
                <MapIcon size={14} /> Настроить маршрут
              </PixelButton>
            ) : null}
          </PixelSurface>

          {todayState.primaryCta.action === 'open_route_node' && !hasRouteFocusNode ? (
            <PixelSurface frame="disabled" padding="sm" className="today-rail-card">
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
