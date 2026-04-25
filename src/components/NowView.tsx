import {
  Brain,
  CheckCircle2,
  Compass,
  Layers,
  Map as MapIcon,
  RefreshCw,
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
  isCreatingStarter: boolean;
  onCreateStarterWorkspace: () => void;
  onSelectRecommendation: (recommendation: RecommendationCandidate) => void;
  onOpenMap: (recommendation: RecommendationCandidate) => void;
  onRefresh: () => void;
}

export const NowView = ({
  snapshot,
  focus,
  isLoading,
  isFocusLoading,
  error,
  isCreatingStarter,
  onCreateStarterWorkspace,
  onSelectRecommendation,
  onOpenMap,
  onRefresh,
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

  return (
    <div className="space-y-4">
      <PixelSurface frame="panel" padding="xl">
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

                {!primaryRecommendation ? (
                  <PixelButton
                    tone="accent"
                    onClick={onCreateStarterWorkspace}
                    disabled={isCreatingStarter || isLoading}
                  >
                    <Layers size={16} /> {isCreatingStarter ? 'Создаю…' : 'Стартовый набор'}
                  </PixelButton>
                ) : null}
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

          {primaryCandidate ? (
            <PixelSurface frame="accent" padding="lg">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <PixelStack gap="sm" className="min-w-0">
                  <PixelText as="p" size="xs" color="accentGlow" uppercase>
                    Фокус дня
                  </PixelText>
                  <PixelText as="h2" readable size="xl" style={{ margin: 0, fontWeight: 800 }}>
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
                  <PixelButton tone="accent" onClick={() => onOpenMap(primaryCandidate)}>
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
