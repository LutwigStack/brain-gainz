import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  Layers,
  ListTodo,
  PauseCircle,
  Play,
  RefreshCw,
  Scissors,
  Target,
} from 'lucide-react';

import {
  PixelActionCard,
  PixelButton,
  PixelInput,
  PixelMeter,
  PixelPanelHeader,
  PixelSelect,
  PixelStack,
  PixelStatCard,
  PixelSurface,
  PixelText,
  PixelTextarea,
} from './pixel';
import type {
  BarrierType,
  DashboardMetrics,
  NodeFocusSnapshot,
  NowDashboardSnapshot,
  OutcomeAction,
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

const barrierTypes = [
  { value: 'too complex', label: 'Слишком сложно' },
  { value: 'unclear next step', label: 'Непонятен следующий шаг' },
  { value: 'low energy', label: 'Нет сил' },
  { value: 'aversive / scary to start', label: 'Тяжело начать' },
  { value: 'wrong time / wrong context', label: 'Не тот момент' },
] as const;

const metricCards = [
  { key: 'spheres', label: 'Сферы' },
  { key: 'directions', label: 'Направления' },
  { key: 'skills', label: 'Навыки' },
  { key: 'nodes', label: 'Узлы' },
  { key: 'actions', label: 'Шаги' },
  { key: 'dueReviews', label: 'На проверку' },
] as const;

const emptyMetrics = Object.fromEntries(metricCards.map((item) => [item.key, 0]));

const statusLabel = (value: string) => statusLabels[value] ?? value;
const eventLabel = (value: string) => eventLabels[value] ?? value;

const renderReasons = (reasons: string[]) =>
  reasons.map((reason) => (
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

interface NowViewProps {
  snapshot: NowDashboardSnapshot | null;
  focus: NodeFocusSnapshot | null;
  isLoading: boolean;
  isFocusLoading: boolean;
  error: string | null;
  isCreatingStarter: boolean;
  isStartingSession: boolean;
  isCompletingAction: boolean;
  activeOutcomeAction: OutcomeAction | null;
  outcomeNote: string;
  barrierType: BarrierType;
  shrinkTitle: string;
  onCreateStarterWorkspace: () => void;
  onStartSession: () => void;
  onCompleteAction: () => void;
  onDeferAction: () => void;
  onBlockAction: () => void;
  onShrinkAction: () => void;
  onSelectRecommendation: (recommendation: RecommendationCandidate) => void;
  onOutcomeNoteChange: (value: string) => void;
  onBarrierTypeChange: (value: BarrierType) => void;
  onShrinkTitleChange: (value: string) => void;
  onRefresh: () => void;
}

export const NowView = ({
  snapshot,
  focus,
  isLoading,
  isFocusLoading,
  error,
  isCreatingStarter,
  isStartingSession,
  isCompletingAction,
  activeOutcomeAction,
  outcomeNote,
  barrierType,
  shrinkTitle,
  onCreateStarterWorkspace,
  onStartSession,
  onCompleteAction,
  onDeferAction,
  onBlockAction,
  onShrinkAction,
  onSelectRecommendation,
  onOutcomeNoteChange,
  onBarrierTypeChange,
  onShrinkTitleChange,
  onRefresh,
}: NowViewProps) => {
  const metrics = snapshot?.metrics ?? emptyMetrics;
  const primaryRecommendation = snapshot?.primaryRecommendation ?? null;
  const queue = snapshot?.queue ?? [];
  const todaySession = snapshot?.todaySession ?? null;
  const focusedAction = focus?.selectedAction ?? null;
  const focusedNode = focus?.node ?? null;
  const focusData = focus;

  return (
    <div className="space-y-8">
      <PixelSurface frame="panel" padding="xxl">
        <PixelStack gap="lg">
          <PixelPanelHeader
            eyebrow="Сейчас"
            title={
              <span className="flex items-center gap-3">
                <Brain size={24} className="text-[var(--pixel-accent)]" /> Что делать сейчас
              </span>
            }
            description="Один главный шаг на сейчас."
            aside={
              <div className="flex flex-wrap gap-3">
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {metricCards.map((item) => (
              <PixelStatCard
                key={item.key}
                label={item.label}
                value={metrics[item.key as keyof DashboardMetrics]}
                tone="inset"
              />
            ))}
          </div>
        </PixelStack>
      </PixelSurface>

      {!primaryRecommendation && !isLoading ? (
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
            Создайте стартовый набор, чтобы увидеть первый шаг.
          </PixelText>
        </PixelSurface>
      ) : null}

      {primaryRecommendation ? (
        <section className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
            <PixelActionCard
              onClick={() => onSelectRecommendation(primaryRecommendation)}
              active
              eyebrow="Главное"
              title={primaryRecommendation.actionTitle}
              description={`${primaryRecommendation.sphereName} / ${primaryRecommendation.directionName} / ${primaryRecommendation.skillName}`}
              badges={renderReasons(primaryRecommendation.whyNow)}
              aside={
                <PixelSurface frame="ghost" padding="sm" fullWidth={false}>
                  <PixelText as="div" size="xs" color="textMuted" uppercase>
                    Узел
                  </PixelText>
                  <PixelText as="div" size="sm" style={{ marginTop: 8 }}>
                    {primaryRecommendation.nodeTitle}
                  </PixelText>
                </PixelSurface>
              }
            />

            <PixelSurface frame="panel" padding="lg">
              <PixelText as="p" size="xs" color="textMuted" uppercase>
                Дальше
              </PixelText>

              {queue.length === 0 ? (
                <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                  Пока других свободных шагов нет.
                </PixelText>
              ) : (
                <div className="mt-4 space-y-4">
                  {queue.map((item) => (
                    <PixelActionCard
                      key={item.actionId}
                      onClick={() => onSelectRecommendation(item)}
                      title={item.actionTitle}
                      description={item.nodeTitle}
                      badges={renderReasons(item.whyNow)}
                    />
                  ))}
                </div>
              )}
            </PixelSurface>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <PixelSurface frame="panel" padding="xxl">
              {isFocusLoading ? (
                <PixelText as="p" readable color="textMuted" size="sm">
                  Загрузка…
                </PixelText>
              ) : null}

              {!isFocusLoading && focusedNode && focusedAction ? (
                <PixelStack gap="lg">
                  <PixelPanelHeader
                    eyebrow="В фокусе"
                    title={focusedNode.title}
                    description={`${focusedNode.sphere_name} / ${focusedNode.direction_name} / ${focusedNode.skill_name}`}
                    aside={
                      <PixelSurface frame="inset" padding="sm" fullWidth={false}>
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Текущий шаг
                        </PixelText>
                        <PixelText as="p" size="sm" style={{ marginTop: 8 }}>
                          {focusedAction.title}
                        </PixelText>
                      </PixelSurface>
                    }
                  />

                  {focusedNode.summary ? (
                    <PixelText as="p" readable color="textMuted" size="sm">
                      {focusedNode.summary}
                    </PixelText>
                  ) : null}

                  {focusedAction.details ? (
                    <PixelSurface frame="inset" padding="lg">
                      <PixelText as="p" size="xs" color="textDim" uppercase>
                        Детали
                      </PixelText>
                      <PixelText
                        as="p"
                        readable
                        color="textMuted"
                        size="sm"
                        style={{ marginTop: 12 }}
                      >
                        {focusedAction.details}
                      </PixelText>
                    </PixelSurface>
                  ) : null}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <PixelSurface frame="inset" padding="lg">
                      <PixelText as="p" size="xs" color="textDim" uppercase>
                        <span className="flex items-center gap-2">
                          <ListTodo size={14} className="text-[var(--pixel-accent)]" /> Шаги
                        </span>
                      </PixelText>
                      <div className="mt-4 space-y-3">
                        {focusData?.actions.map((action) => (
                          <PixelActionCard
                            key={action.id}
                            title={action.title}
                            meta={statusLabel(action.status)}
                            active={action.id === focusedAction.id}
                          />
                        ))}
                      </div>
                    </PixelSurface>

                    <PixelSurface frame="inset" padding="lg">
                      <PixelText as="p" size="xs" color="textDim" uppercase>
                        <span className="flex items-center gap-2">
                          <Target size={14} className="text-[var(--pixel-accent)]" /> Связи
                        </span>
                      </PixelText>
                      <div className="mt-4 space-y-4">
                        <div>
                          <PixelText as="p" size="xs" color="textMuted" uppercase>
                            Мешает
                          </PixelText>
                          {focusData?.dependencies.length === 0 ? (
                            <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 8 }}>
                              Ничего.
                            </PixelText>
                          ) : (
                            <div className="mt-2 space-y-2">
                              {focusData?.dependencies.map((item) => (
                                <PixelActionCard key={item.id} title={`${item.title} · ${item.status}`} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <PixelText as="p" size="xs" color="textMuted" uppercase>
                            Откроет
                          </PixelText>
                          {focusData?.dependents.length === 0 ? (
                            <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 8 }}>
                              Пока ничего.
                            </PixelText>
                          ) : (
                            <div className="mt-2 space-y-2">
                              {focusData?.dependents.map((item) => (
                                <PixelActionCard key={item.id} title={`${item.title} · ${item.status}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </PixelSurface>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <PixelButton
                      tone="accent"
                      onClick={onStartSession}
                      disabled={isStartingSession || focusData?.session?.status === 'active'}
                    >
                      <Play size={16} />{' '}
                      {focusData?.session?.status === 'active'
                        ? 'Сессия идет'
                        : isStartingSession
                          ? 'Запускаю…'
                          : 'Начать сессию'}
                    </PixelButton>

                    <PixelButton
                      onClick={onCompleteAction}
                      disabled={
                        isCompletingAction ||
                        focusedAction.status === 'done' ||
                        focusData?.session?.status !== 'active'
                      }
                    >
                      <CheckCircle2 size={16} />{' '}
                      {focusedAction.status === 'done'
                        ? 'Сделано'
                        : isCompletingAction
                          ? 'Сохраняю…'
                          : 'Готово'}
                    </PixelButton>

                    <PixelButton tone="ghost" onClick={onRefresh}>
                      <ArrowRight size={16} /> Обновить
                    </PixelButton>
                  </div>

                  <PixelSurface frame="inset" padding="lg">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Если шаг не идет
                    </PixelText>

                    <div className="mt-4">
                      <PixelTextarea
                        label="Заметка"
                        value={outcomeNote}
                        onChange={(event) => onOutcomeNoteChange(event.target.value)}
                        placeholder="Короткая заметка"
                      />
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <PixelSelect
                        label="Тип барьера"
                        value={barrierType}
                        onChange={(event) => onBarrierTypeChange(event.target.value as BarrierType)}
                      >
                        {barrierTypes.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </PixelSelect>

                      <PixelInput
                        label="Новый маленький шаг"
                        type="text"
                        value={shrinkTitle}
                        onChange={(event) => onShrinkTitleChange(event.target.value)}
                        placeholder="Название маленького шага"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <PixelButton
                        tone="ghost"
                        onClick={onDeferAction}
                        disabled={
                          activeOutcomeAction != null ||
                          focusData?.session?.status !== 'active' ||
                          focusedAction.status === 'done'
                        }
                      >
                        <PauseCircle size={16} />{' '}
                        {activeOutcomeAction === 'defer' ? 'Откладываю…' : 'Отложить'}
                      </PixelButton>

                      <PixelButton
                        tone="panel"
                        onClick={onBlockAction}
                        disabled={
                          activeOutcomeAction != null ||
                          focusData?.session?.status !== 'active' ||
                          focusedAction.status === 'done'
                        }
                      >
                        <Target size={16} />{' '}
                        {activeOutcomeAction === 'block' ? 'Сохраняю…' : 'Есть барьер'}
                      </PixelButton>

                      <PixelButton
                        tone="panel"
                        onClick={onShrinkAction}
                        disabled={
                          activeOutcomeAction != null ||
                          focusData?.session?.status !== 'active' ||
                          focusedAction.status === 'done'
                        }
                      >
                        <Scissors size={16} />{' '}
                        {activeOutcomeAction === 'shrink' ? 'Упрощаю…' : 'Упростить'}
                      </PixelButton>
                    </div>
                  </PixelSurface>
                </PixelStack>
              ) : null}
            </PixelSurface>

            <div className="space-y-6">
              <PixelSurface frame="panel" padding="lg">
                <PixelText as="p" size="xs" color="textMuted" uppercase>
                  Сегодня
                </PixelText>

                {!todaySession ? (
                  <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                    Сегодня сессии еще не было.
                  </PixelText>
                ) : (
                  <div className="mt-4 space-y-4">
                    <PixelSurface frame="inset" padding="md">
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        {statusLabel(todaySession.status)}
                      </PixelText>
                      <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                        Дата: {todaySession.session_date}
                      </PixelText>
                      {focusData?.progress ? (
                        <div className="mt-4">
                          <PixelMeter
                            label="Прогресс"
                            value={focusData.progress.completedActions}
                            max={focusData.progress.totalActions || 1}
                            tone="success"
                          />
                        </div>
                      ) : null}
                    </PixelSurface>

                    <div className="space-y-3">
                      {todaySession.events.map((event) => (
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
                  </div>
                )}
              </PixelSurface>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};
