import {
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  Layers,
  Map as MapIcon,
  RefreshCw,
  ShieldCheck,
  Swords,
} from 'lucide-react';

import {
  PixelActionCard,
  PixelButton,
  PixelMeter,
  PixelPanelHeader,
  PixelStack,
  PixelStatCard,
  PixelSurface,
  PixelText,
} from './pixel';
import type {
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

const _barrierTypes = [
  { value: 'too complex', label: 'Слишком сложно' },
  { value: 'unclear next step', label: 'Непонятен следующий шаг' },
  { value: 'low energy', label: 'Нет сил' },
  { value: 'aversive / scary to start', label: 'Тяжело начать' },
  { value: 'wrong time / wrong context', label: 'Не тот момент' },
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
    <PixelSurface
      key={reason}
      frame="ghost"
      padding="xs"
      fullWidth={false}
      style={{ display: 'inline-block' }}
    >
      <PixelText as="span" size="xs" color="textMuted" uppercase>
        {reasonLabels[reason] ?? reason}
      </PixelText>
    </PixelSurface>
  ));

const buildDigestSummary = ({
  weakeningCount,
  queueCount,
  progressPercent,
  metrics,
  todaySession,
}: {
  weakeningCount: number;
  queueCount: number;
  progressPercent: number;
  metrics: typeof emptyMetrics;
  todaySession: NowDashboardSnapshot['todaySession'];
}) => {
  const sessionPart =
    todaySession == null
      ? 'Сегодня сессия еще не стартовала.'
      : `Сегодня сессия ${statusLabel(todaySession.status)}.`;
  const completionPart =
    progressPercent > 0
      ? `почти закрыто ${progressPercent}%`
      : 'сейчас нет узлов на добивку';

  return `${sessionPart} Ослабевает ${weakeningCount} фокуса, ${completionPart}, в запасе еще ${queueCount} шага. Всего ${metrics.actions} открытых шагов в ${metrics.nodes} узлах, ${metrics.dueReviews} ждут проверки.`;
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
  const recentEvents = todaySession?.events.slice(-3).reverse() ?? [];
  const progressPercent = progress?.completionPercent ?? 0;
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
  const routePreviewItems = (plannerNextItems.length > 0 ? plannerNextItems : routeItems)
    .filter((item) => item.is_required === 1 && !item.is_complete)
    .slice(0, 4);
  const routeDonePreviewItems = routePreviewItems.length === 0 ? routeItems.filter((item) => item.is_complete).slice(0, 3) : [];
  const city = today?.city ?? null;
  const opponent = today?.opponent ?? null;
  const race = today?.race ?? null;
  const verifiedMasteryCount = today?.mastery.verifiedNodeCount ?? 0;
  const selfMarkedOnlyCount = today?.mastery.selfMarkedOnlyNodeCount ?? 0;
  const routeCompletionPercent = routeProgress?.completionPercent ?? 0;
  const opponentPressure = opponent?.pressure ?? 0;
  const opponentIsAhead = opponentPressure >= routeCompletionPercent && opponentPressure > 0;
  const nearCompletionReady =
    focusedNode != null &&
    focusedAction != null &&
    progress != null &&
    progress.totalActions > 0 &&
    progress.completedActions > 0 &&
    progressPercent >= 60;
  const shouldShowWeakeningSection = !primaryRecommendation && weakeningItems.length > 0;
  const shouldShowNearCompletionSection = nearCompletionReady;
  const shouldShowOptionalSection = optionalItems.length > 0 || remainingNodeActions.length > 0;
  const focusedPath = focusedNode
    ? `${focusedNode.sphere_name} / ${focusedNode.direction_name} / ${focusedNode.skill_name}`
    : '';
  const digestSummary = buildDigestSummary({
    weakeningCount: weakeningItems.length,
    queueCount: extraOptionsCount,
    progressPercent: nearCompletionReady ? progressPercent : 0,
    metrics,
    todaySession,
  });
  const modeTitle = currentSpecialization?.name ?? 'Свободный режим';
  const hasRouteItems = Boolean(routePlanner?.hasRouteItems || routeItems.length > 0);
  const hasRouteFocusNode = plannerFocusItem?.node_id != null;
  const routeFocusMeta = plannerFocusItem
    ? `${plannerFocusItem.route_stage ? `${plannerFocusItem.route_stage} · ` : ''}${
        plannerFocusItem.path || 'Концепт маршрута'
      } · ${plannerFocusItem.current_mastery_rank}/6 · нужно ${plannerFocusItem.required_mastery_level}`
    : null;
  const primaryWorkTitle = routeProgress?.isComplete
    ? 'Маршрут готов к завершению'
    : plannerFocusItem?.title ?? primaryCandidate?.actionTitle ?? (currentSpecialization ? (hasRouteItems ? 'Нет валидного следующего узла' : 'Маршрут пустой') : 'Стартовый набор');
  const primaryWorkDescription = routeProgress?.isComplete
    ? 'Все обязательные узлы закрыты. Завершение засчитает текущий маршрут.'
    : plannerFocusItem
      ? routeFocusMeta
      : primaryCandidate
        ? `${primaryCandidate.whatDegrades || primaryCandidate.nodeTitle} · ${candidatePath(primaryCandidate)}`
        : currentSpecialization
          ? hasRouteItems
            ? 'Откройте карту и проверьте требования маршрута: сейчас нет безопасного следующего узла.'
            : 'Добавьте обязательные узлы на карте, чтобы Today начал выбирать следующий ход.'
          : 'Создайте стартовый набор или откройте карту, чтобы появился первый рабочий шаг.';
  const primaryActionLabel = isVictory
    ? 'Новый маршрут'
    : routeProgress?.isComplete
      ? 'Завершить'
      : hasRouteFocusNode
        ? 'Проверить'
        : plannerFocusItem
          ? 'На карту'
          : primaryCandidate
            ? 'Открыть карту'
            : currentSpecialization
              ? hasRouteItems
                ? 'Настроить на карте'
                : 'Добавить узлы на карте'
              : 'Стартовый набор';
  const primaryActionIcon = isVictory ? (
    <Compass size={16} />
  ) : routeProgress?.isComplete || hasRouteFocusNode ? (
    <CheckCircle2 size={16} />
  ) : primaryCandidate || currentSpecialization ? (
    <MapIcon size={16} />
  ) : (
    <Layers size={16} />
  );
  const handlePrimaryAction = () => {
    if (isVictory) {
      onContinueSpecialization();
      return;
    }

    if (routeProgress?.isComplete) {
      onCompleteSpecialization();
      return;
    }

    if (hasRouteFocusNode) {
      onOpenRouteNode(plannerFocusItem.node_id as number);
      return;
    }

    if (primaryCandidate) {
      onOpenMap(primaryCandidate);
      return;
    }

    if (currentSpecialization) {
      onOpenRouteMap();
      return;
    }

    onCreateStarterWorkspace();
  };
  const isPrimaryActionDisabled = isLoading || (!currentSpecialization && !primaryCandidate && isCreatingStarter);

  return (
    <div className="now-view space-y-4">
      <PixelSurface frame="panel" padding="xl" className="now-primary-panel">
        <PixelStack gap="lg">
          <PixelPanelHeader
            eyebrow="Сейчас"
            title={
              <span className="flex items-center gap-3">
                <Brain size={24} className="text-[var(--pixel-accent)]" /> Следующий ход
              </span>
            }
            description="Один шаг, который сейчас лучше всего поддерживает карту."
            aside={
              <div className="flex flex-wrap gap-2">
                <PixelButton onClick={onRefresh} disabled={isLoading}>
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
                </PixelButton>
              </div>
            }
          />

          {error ? (
            <PixelSurface frame="accent" padding="md">
              <PixelText as="p" readable size="sm">
                {error}
              </PixelText>
            </PixelSurface>
          ) : null}

          {notice ? (
            <PixelSurface frame="ghost" padding="sm">
              <PixelText as="p" readable size="sm" color="textMuted">
                {notice}
              </PixelText>
            </PixelSurface>
          ) : null}

          <PixelSurface frame={isVictory ? 'accent' : 'ghost'} padding="md" className="now-work-panel">
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <PixelStack gap="sm" className="min-w-0">
                <PixelText as="p" size="xs" color="textMuted" uppercase>
                  Today / текущий режим
                </PixelText>
                <PixelText as="h3" readable size="lg" style={{ margin: 0, fontWeight: 800 }}>
                  {modeTitle}
                </PixelText>
                <PixelSurface frame="inset" padding="md" className="now-next-work">
                  <PixelText as="p" size="xs" color="accent" uppercase style={{ margin: 0 }}>
                    следующий ход
                  </PixelText>
                  <PixelText as="h2" readable size="xl" style={{ marginTop: 8, fontWeight: 800 }}>
                    {primaryWorkTitle}
                  </PixelText>
                  <PixelText as="p" readable size="sm" color="textMuted" style={{ marginTop: 10 }}>
                    {primaryWorkDescription}
                  </PixelText>
                </PixelSurface>
              </PixelStack>

              <div className="flex min-w-[180px] flex-col gap-2 lg:items-end">
                <PixelButton tone="accent" onClick={handlePrimaryAction} disabled={isPrimaryActionDisabled}>
                  {primaryActionIcon} {primaryActionLabel}
                </PixelButton>
                {hasRouteFocusNode ? (
                  <PixelButton tone="ghost" onClick={() => onOpenRouteNode(plannerFocusItem.node_id as number)} disabled={isLoading}>
                    <MapIcon size={16} /> На карту
                  </PixelButton>
                ) : currentSpecialization && !routeProgress?.isComplete ? (
                  <PixelButton tone="ghost" onClick={onOpenRouteMap} disabled={isLoading}>
                    <MapIcon size={16} /> Карта маршрута
                  </PixelButton>
                ) : null}
              </div>
            </div>

            <PixelSurface frame="inset" padding="md" className="now-route-strip mt-4 overflow-hidden">
              <div className="grid gap-4 xl:grid-cols-[minmax(180px,0.7fr)_minmax(260px,1.4fr)_minmax(180px,0.7fr)] xl:items-center">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center border-2 text-2xl font-black"
                      style={{
                        borderColor: race?.color ?? 'var(--pixel-accent)',
                        color: race?.color ?? 'var(--pixel-accent)',
                        background: 'var(--pixel-panel)',
                      }}
                      aria-hidden="true"
                    >
                      {race?.emblem ?? '◆'}
                    </div>
                    <div className="min-w-0">
                      <PixelText as="p" size="xs" color="textMuted" uppercase style={{ margin: 0 }}>
                        игрок
                      </PixelText>
                      <PixelText as="p" size="sm" readable style={{ marginTop: 5, fontWeight: 800 }}>
                        {race?.title ?? 'Свободный режим'}
                      </PixelText>
                      <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 5 }}>
                        город {city?.level ?? 1} · {verifiedMasteryCount} проверено · {selfMarkedOnlyCount} сам отметил
                      </PixelText>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      забег маршрута
                    </PixelText>
                    <PixelText as="span" size="xs" color={opponentIsAhead ? 'danger' : 'success'} uppercase>
                      {routeProgress ? `${routeCompletionPercent}%` : 'нет маршрута'}
                    </PixelText>
                  </div>
                  <div className="relative h-12 border-2 border-[var(--pixel-line-soft)] bg-[var(--pixel-panel)]">
                    <div
                      className="absolute inset-y-0 left-0 bg-[rgba(45,212,191,0.22)]"
                      style={{ width: `${Math.min(100, Math.max(0, routeCompletionPercent))}%` }}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-y-2 w-1.5 bg-[var(--pixel-danger)]"
                      style={{ left: `calc(${Math.min(100, Math.max(0, opponentPressure))}% - 3px)` }}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 grid grid-cols-5 opacity-40" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} className="border-r border-[var(--pixel-line-soft)] last:border-r-0" />
                      ))}
                    </div>
                    <div className="relative flex h-full items-center justify-between px-3">
                      <PixelText as="span" size="xs" color="accent" uppercase>
                        вы
                      </PixelText>
                      <PixelText as="span" size="xs" color="textMuted" uppercase>
                        {routeProgress
                          ? `${routeProgress.completedRequiredNodeCount}/${routeProgress.requiredNodeCount} обяз.`
                          : 'добавьте узлы'}
                      </PixelText>
                      <PixelText as="span" size="xs" color="danger" uppercase>
                        соперник {opponentPressure}%
                      </PixelText>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <Swords size={15} className="text-[var(--pixel-danger)]" />
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      давление
                    </PixelText>
                  </div>
                  <PixelMeter
                    value={opponentPressure}
                    max={100}
                    tone={opponentIsAhead ? 'danger' : 'info'}
                    showValue={false}
                  />
                  <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 10 }}>
                    {opponent ? `${opponent.projectedRequired} узл. / ${opponent.score} счет` : 'Нет активной гонки.'}
                  </PixelText>
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t border-[var(--pixel-line-soft)] pt-3 md:grid-cols-2">
                <div className="now-mastery-badge now-mastery-badge--verified flex items-center justify-between gap-3 border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel)] p-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <ShieldCheck size={15} className="text-[var(--pixel-success)]" />
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      проверено
                    </PixelText>
                  </span>
                  <PixelText as="span" size="xs" color="success" uppercase>
                    {verifiedMasteryCount} · XP/маршрут
                  </PixelText>
                </div>
                <div className="now-mastery-badge now-mastery-badge--self flex items-center justify-between gap-3 border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel)] p-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <Eye size={15} className="text-[var(--pixel-accent)]" />
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      сам отметил
                    </PixelText>
                  </span>
                  <PixelText as="span" size="xs" color="accent" uppercase>
                    {selfMarkedOnlyCount} · без XP
                  </PixelText>
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t border-[var(--pixel-line-soft)] pt-3 sm:grid-cols-3">
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  город {city?.level ?? 1} · XP {city?.totalXp ?? 0}
                </PixelText>
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  раса {race?.title ?? 'свободный режим'}
                </PixelText>
                <PixelText as="span" size="xs" color={opponentIsAhead ? 'danger' : 'textMuted'} uppercase>
                  соперник {opponentPressure}% · {opponent ? `${opponent.projectedRequired} узл.` : 'нет гонки'}
                </PixelText>
              </div>
            </PixelSurface>

            {currentSpecialization?.status === 'active' ? (
              <PixelSurface frame="inset" padding="md" className="mt-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        План на маршрут
                      </PixelText>
                      {plannerReadyToVerify.length > 0 ? (
                        <PixelText as="span" size="xs" color="success" uppercase>
                          готово к проверке: {plannerReadyToVerify.length}
                        </PixelText>
                      ) : null}
                    </div>

                    {plannerCurrentStage || plannerStageItems.length > 0 ? (
                      <PixelSurface frame="inset" padding="sm" className="mb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <PixelText as="p" size="xs" color="textMuted" uppercase style={{ margin: 0 }}>
                              текущий этап
                            </PixelText>
                            <PixelText as="p" readable size="sm" style={{ marginTop: 4, fontWeight: 800 }}>
                              {plannerCurrentStage ?? 'Без этапа'}
                            </PixelText>
                          </div>
                          <PixelText as="span" size="xs" color="accent" uppercase>
                            {plannerStageItems.filter((item) => item.is_complete).length}/{plannerStageItems.length} готово
                          </PixelText>
                        </div>
                      </PixelSurface>
                    ) : null}

                    {plannerFocusItem ? (
                      <PixelSurface frame="ghost" padding="sm">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                          <div className="min-w-0">
                            <PixelText as="p" size="xs" color="accent" uppercase>
                              следующий узел
                            </PixelText>
                            <PixelText as="p" readable size="sm" style={{ marginTop: 6, fontWeight: 800 }}>
                              {plannerFocusItem.title}
                            </PixelText>
                            <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 6 }}>
                              {plannerFocusItem.route_stage ? `${plannerFocusItem.route_stage} · ` : ''}
                              {plannerFocusItem.path || 'Концепт маршрута'} · {plannerFocusItem.current_mastery_rank}/6 · нужно{' '}
                              {plannerFocusItem.required_mastery_level}
                            </PixelText>
                          </div>
                          <div className="flex flex-wrap gap-2 md:justify-end">
                            {plannerFocusItem.node_id ? (
                              <>
                                <PixelButton
                                  tone="accent"
                                  onClick={() => onOpenRouteNode(plannerFocusItem.node_id as number)}
                                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                                >
                                  <CheckCircle2 size={14} /> Проверить
                                </PixelButton>
                                <PixelButton
                                  tone="ghost"
                                  onClick={() => onOpenRouteNode(plannerFocusItem.node_id as number)}
                                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                                >
                                  <MapIcon size={14} /> На карту
                                </PixelButton>
                              </>
                            ) : (
                              <PixelButton
                                tone="ghost"
                                onClick={onOpenRouteMap}
                                style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                              >
                                <MapIcon size={14} /> На карту
                              </PixelButton>
                            )}
                          </div>
                        </div>
                      </PixelSurface>
                    ) : (
                      <PixelSurface frame="ghost" padding="sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <PixelText as="p" readable size="sm" color="textMuted">
                            {routeProgress?.isComplete
                              ? 'Все обязательные узлы маршрута закрыты. Можно завершать специализацию.'
                              : routePlanner?.hasRouteItems
                                ? 'В маршруте нет следующего обязательного узла. Проверьте требования или добавьте обязательные узлы на карте.'
                                : 'Маршрут пустой. Добавьте узлы из карты, чтобы Today начал выбирать следующий ход.'}
                          </PixelText>
                          <PixelButton
                            tone="accent"
                            onClick={routeProgress?.isComplete ? onCompleteSpecialization : onOpenRouteMap}
                            style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                          >
                            {routeProgress?.isComplete ? (
                              <>
                                <CheckCircle2 size={14} /> Завершить
                              </>
                            ) : (
                              <>
                                <MapIcon size={14} /> {routePlanner?.hasRouteItems ? 'Открыть карту' : 'Добавить узлы'}
                              </>
                            )}
                          </PixelButton>
                        </div>
                      </PixelSurface>
                    )}

                    {plannerNextItems.length > 1 ? (
                      <div className="mt-3 grid gap-2">
                        <PixelText as="p" size="xs" color="textMuted" uppercase style={{ margin: 0 }}>
                          ближайшие ходы
                        </PixelText>
                        <div className="grid gap-2">
                          {plannerNextItems.slice(1, 4).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => (item.node_id ? onOpenRouteNode(item.node_id as number) : onOpenRouteMap())}
                              className="min-w-0 border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel)] px-3 py-2 text-left hover:border-[var(--pixel-accent)]"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <PixelText as="p" readable size="sm" style={{ margin: 0, fontWeight: 800 }}>
                                    {item.title}
                                  </PixelText>
                                  <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 4 }}>
                                    {item.route_stage ?? 'Без этапа'} · нужно {item.required_mastery_level}
                                  </PixelText>
                                </div>
                                <PixelText as="span" size="xs" color="accent" uppercase>
                                  {item.current_mastery_rank}/6
                                </PixelText>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      слабые места
                    </PixelText>
                    <div className="mt-3 grid gap-2">
                      {plannerWeakSpots.length > 0 ? (
                        plannerWeakSpots.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => (item.node_id ? onOpenRouteNode(item.node_id as number) : onOpenRouteMap())}
                            className="min-w-0 border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel)] px-3 py-2 text-left hover:border-[var(--pixel-accent)]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <PixelText as="span" readable size="sm" style={{ minWidth: 0 }}>
                                {item.title}
                              </PixelText>
                              <PixelText as="span" size="xs" color="accent" uppercase>
                                {item.current_mastery_rank}/6
                              </PixelText>
                            </div>
                          </button>
                        ))
                      ) : (
                        <PixelText as="p" readable size="sm" color="textMuted">
                          Нет отдельного списка: держите фокус на следующем узле.
                        </PixelText>
                      )}
                    </div>
                  </div>
                </div>
              </PixelSurface>
            ) : null}

            {routeProgress && routeItems.length > 0 ? (
              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    Ближайшие узлы маршрута
                  </PixelText>
                  {routeProgress.nextItem ? (
                    <PixelText as="span" size="xs" color="accent" uppercase>
                      следующий: {routeProgress.nextItem.current_mastery_rank}/6
                    </PixelText>
                  ) : null}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {(routePreviewItems.length > 0 ? routePreviewItems : routeDonePreviewItems).map((item) => (
                    <PixelSurface key={item.id} frame={item.is_complete ? 'ghost' : 'inset'} padding="sm">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <PixelText as="p" readable size="sm" style={{ margin: 0, fontWeight: 800 }}>
                            {item.title}
                          </PixelText>
                          <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 6 }}>
                            {item.path || 'Концепт маршрута'} · нужно {item.required_mastery_level}
                          </PixelText>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <PixelText as="span" size="xs" color={item.is_complete ? 'success' : 'accent'} uppercase>
                            {item.is_complete ? 'готово' : `${item.current_mastery_rank}/6`}
                          </PixelText>
                          {item.node_id ? (
                            <PixelButton
                              tone="ghost"
                              onClick={() => onOpenRouteNode(item.node_id as number)}
                              style={{ minHeight: 28, padding: '4px 8px' }}
                            >
                              <MapIcon size={13} /> Карта
                            </PixelButton>
                          ) : null}
                        </div>
                      </div>
                    </PixelSurface>
                  ))}
                </div>
              </div>
            ) : null}

          </PixelSurface>

          {primaryCandidate ? (
            <PixelSurface frame="inset" padding="md">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <PixelStack gap="sm" className="min-w-0">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    в очереди на сегодня
                  </PixelText>
                  <PixelText as="h3" readable size="lg" style={{ margin: 0, fontWeight: 800 }}>
                    {primaryCandidate.actionTitle}
                  </PixelText>
                  <PixelText as="p" readable color="textMuted" size="sm">
                    {primaryCandidate.whatDegrades || primaryCandidate.nodeTitle}
                  </PixelText>
                  <div className="flex flex-wrap gap-2">{renderReasons(primaryCandidate.whyNow)}</div>
                  <PixelText as="p" readable color="textMuted" size="sm">
                    {candidatePath(primaryCandidate)} / {primaryCandidate.nodeTitle}
                  </PixelText>
                </PixelStack>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <PixelButton tone="ghost" onClick={() => onSelectRecommendation(primaryCandidate)}>
                    <Compass size={16} /> Сделать фокусом
                  </PixelButton>
                  <PixelButton tone="ghost" onClick={() => onOpenMap(primaryCandidate)}>
                    <MapIcon size={16} /> Открыть карту
                  </PixelButton>
                </div>
              </div>
            </PixelSurface>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <PixelStatCard label="Ослабевает" value={weakeningItems.length} tone="inset" compact />
            <PixelStatCard label="В очереди" value={extraOptionsCount} tone="inset" compact />
          </div>

          <PixelText as="p" readable color="textMuted" size="sm">
            {digestSummary}
          </PixelText>
        </PixelStack>
      </PixelSurface>

      {!primaryRecommendation && !focusedNode && !isLoading ? (
        <PixelSurface frame="ghost" padding="xxl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center text-[var(--pixel-accent)]">
            <Compass size={36} />
          </div>
          <PixelText as="h3" size="lg" style={{ marginTop: 24, textAlign: 'center' }}>
            Пока пусто
          </PixelText>
          <PixelText
            as="p"
            readable
            color="textMuted"
            size="sm"
            style={{ margin: '16px auto 0', maxWidth: 640, textAlign: 'center' }}
          >
            Создайте стартовый набор, чтобы появилась первая сводка дня.
          </PixelText>
        </PixelSurface>
      ) : null}

      {shouldShowWeakeningSection || shouldShowNearCompletionSection || shouldShowOptionalSection ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {shouldShowWeakeningSection ? (
          <PixelSurface frame="panel" padding="lg">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Ослабевает
            </PixelText>
            <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 12 }}>
              Шаги, которые первыми теряют ясность и возвращаются дороже.
            </PixelText>

            {weakeningItems.length === 0 ? (
              <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                Сейчас нет явных кандидатов на потерю темпа.
              </PixelText>
            ) : (
              <div className="mt-4 space-y-4">
                {weakeningItems.map((item) => (
                  <PixelActionCard
                    key={item.actionId}
                    onClick={() => onSelectRecommendation(item)}
                    active={item.actionId === focusedAction?.id}
                    title={item.actionTitle}
                    description={item.whatDegrades}
                    meta={candidatePath(item)}
                    badges={renderReasons(item.whyNow)}
                    aside={
                      <PixelSurface frame="ghost" padding="sm" fullWidth={false}>
                        <PixelText as="div" size="xs" color="textMuted" uppercase>
                          Узел
                        </PixelText>
                        <PixelText as="div" size="sm" style={{ marginTop: 8 }}>
                          {item.nodeTitle}
                        </PixelText>
                      </PixelSurface>
                    }
                  />
                ))}
              </div>
            )}
          </PixelSurface>
          ) : null}

          {shouldShowNearCompletionSection ? (
          <PixelSurface frame="panel" padding="lg">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Почти завершено
            </PixelText>
            <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 12 }}>
              Текущий узел, прогресс по нему и быстрые исходы, если движение застопорилось.
            </PixelText>

            {isFocusLoading ? (
              <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                Загрузка…
              </PixelText>
            ) : null}

            {!isFocusLoading && focusedNode && focusedAction && progress ? (
              <PixelStack gap="md" style={{ marginTop: 16 }}>
                <PixelActionCard
                  active
                  title={focusedAction.title}
                  description={focusedNode.summary || focusedNode.title}
                  meta={`${statusLabel(focusedAction.status)} · ${focusedPath}`}
                  aside={
                    <PixelSurface frame="inset" padding="sm" fullWidth={false}>
                      <PixelText as="p" size="xs" color="textDim" uppercase>
                        Узел
                      </PixelText>
                      <PixelText as="p" size="sm" style={{ marginTop: 8 }}>
                        {focusedNode.title}
                      </PixelText>
                    </PixelSurface>
                  }
                />

                {progress ? (
                  <PixelSurface frame="inset" padding="md">
                    <PixelMeter
                      label={`Готово ${progress.completedActions} из ${progress.totalActions}`}
                      value={progress.completedActions}
                      max={progress.totalActions || 1}
                      tone="success"
                    />

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <PixelStatCard label="Прогресс" value={`${progressPercent}%`} tone="inset" />
                      <PixelStatCard label="Осталось" value={progress.openActions} tone="inset" />
                      <PixelStatCard
                        label="Сессия"
                        value={todaySession ? statusLabel(todaySession.status) : 'не начата'}
                        tone="inset"
                      />
                    </div>
                  </PixelSurface>
                ) : null}

                {recentEvents.length > 0 ? (
                  <div className="space-y-3">
                    {recentEvents.map((event) => (
                      <PixelActionCard
                        key={event.id}
                        title={
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-[var(--pixel-accent)]" />
                            {eventLabel(event.event_type)}
                          </span>
                        }
                        description={event.note || 'Без заметки.'}
                      />
                    ))}
                  </div>
                ) : null}
              </PixelStack>
            ) : null}

          </PixelSurface>
          ) : null}

          {shouldShowOptionalSection ? (
          <PixelSurface frame="panel" padding="lg">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Еще можно сделать
            </PixelText>
            <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 12 }}>
              Следующие доступные шаги после текущего фокуса.
            </PixelText>

            {optionalItems.length > 0 ? (
              <div className="mt-4 space-y-4">
                {optionalItems.map((item) => (
                  <PixelActionCard
                    key={item.actionId}
                    onClick={() => onSelectRecommendation(item)}
                    active={item.actionId === focusedAction?.id}
                    title={item.actionTitle}
                    description={item.nodeTitle}
                    meta={candidatePath(item)}
                    badges={renderReasons(item.whyNow)}
                  />
                ))}
              </div>
            ) : remainingNodeActions.length > 0 ? (
              <div className="mt-4 space-y-4">
                {remainingNodeActions.map((action) => (
                  <PixelActionCard
                    key={action.id}
                    title={action.title}
                    description={focusedNode?.title}
                    meta={statusLabel(action.status)}
                  />
                ))}
              </div>
            ) : null}
          </PixelSurface>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
