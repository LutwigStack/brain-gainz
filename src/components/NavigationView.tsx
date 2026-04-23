import {
  CheckCircle2,
  Compass,
  GitBranch,
  Map,
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
  PixelPanelHeader,
  PixelSelect,
  PixelStack,
  PixelStatCard,
  PixelSurface,
  PixelText,
  PixelTextarea,
} from './pixel';
import { GameMapCanvas } from '../game';
import type {
  BarrierType,
  NavigationNodeSummary,
  NavigationSnapshot,
  NodeAction,
  NodeFocusSnapshot,
  OutcomeAction,
} from '../types/app-shell';

const statusLabels: Record<string, string> = {
  todo: 'когда-нибудь',
  ready: 'готов к старту',
  doing: 'в работе',
  done: 'сделано',
  active: 'идет',
  completed: 'завершено',
};

const typeLabels: Record<string, string> = {
  project: 'проект',
  theory: 'теория',
  maintenance: 'поддержка',
  habit: 'привычка',
};

const noteKindLabels: Record<string, string> = {
  shrink: 'упростили',
  defer: 'отложили',
  error: 'ошибка',
  follow_up: 'следующий шаг',
};

const riskLabels: Record<string, string> = {
  none: 'нет',
  low: 'низкий',
  medium: 'средний',
  high: 'высокий',
};

const barrierTypes = [
  { value: 'too complex', label: 'Слишком сложно' },
  { value: 'unclear next step', label: 'Непонятен следующий шаг' },
  { value: 'low energy', label: 'Нет сил' },
  { value: 'aversive / scary to start', label: 'Тяжело начать' },
  { value: 'wrong time / wrong context', label: 'Не тот момент' },
] as const;

const statusLabel = (value: string) => statusLabels[value] ?? value;
const typeLabel = (value: string) => typeLabels[value] ?? value;
const noteKindLabel = (value: string) => noteKindLabels[value] ?? value;
const barrierLabel = (value: string) =>
  barrierTypes.find((item) => item.value === value)?.label ?? value;
const riskLabel = (value: string) => riskLabels[value] ?? value;

const renderNodeCard = (
  node: NavigationNodeSummary,
  isSelected: boolean,
  onSelectNode: (node: NavigationNodeSummary) => void,
) => (
  <PixelActionCard
    key={node.id}
    onClick={() => onSelectNode(node)}
    active={isSelected}
    title={node.title}
    description={node.next_action_title ? `Дальше: ${node.next_action_title}` : undefined}
    meta={`${typeLabel(node.type)} · ${statusLabel(node.status)}`}
    aside={
      <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
        <PixelText as="span" size="xs" color="textMuted" uppercase>
          {node.open_action_count} шаг.
        </PixelText>
      </PixelSurface>
    }
  />
);

interface NavigationViewProps {
  snapshot: NavigationSnapshot | null;
  focus: NodeFocusSnapshot | null;
  isLoading: boolean;
  isFocusLoading: boolean;
  error: string | null;
  isStartingSession: boolean;
  isCompletingAction: boolean;
  activeOutcomeAction: OutcomeAction | null;
  outcomeNote: string;
  barrierType: BarrierType;
  shrinkTitle: string;
  onRefresh: () => void;
  onSelectNode: (node: NavigationNodeSummary) => void;
  onSelectAction: (action: NodeAction) => void;
  onStartSession: () => void;
  onCompleteAction: () => void;
  onDeferAction: () => void;
  onBlockAction: () => void;
  onShrinkAction: () => void;
  onOutcomeNoteChange: (value: string) => void;
  onBarrierTypeChange: (value: BarrierType) => void;
  onShrinkTitleChange: (value: string) => void;
  onOpenJournal: () => void;
  onCreateFollowUp: () => void;
}

export const NavigationView = ({
  snapshot,
  focus,
  isLoading,
  isFocusLoading,
  error,
  isStartingSession,
  isCompletingAction,
  activeOutcomeAction,
  outcomeNote,
  barrierType,
  shrinkTitle,
  onRefresh,
  onSelectNode,
  onSelectAction,
  onStartSession,
  onCompleteAction,
  onDeferAction,
  onBlockAction,
  onShrinkAction,
  onOutcomeNoteChange,
  onBarrierTypeChange,
  onShrinkTitleChange,
  onOpenJournal,
  onCreateFollowUp,
}: NavigationViewProps) => {
  const spheres = snapshot?.spheres ?? [];
  const selectedSphereId = focus?.node?.sphere_id ?? spheres[0]?.id ?? null;
  const selectedSphere = spheres.find((sphere) => sphere.id === selectedSphereId) ?? spheres[0] ?? null;
  const selectedDirectionId = focus?.node?.direction_id ?? selectedSphere?.directions[0]?.id ?? null;
  const selectedDirection =
    selectedSphere?.directions.find((direction) => direction.id === selectedDirectionId) ??
    selectedSphere?.directions[0] ??
    null;
  const selectedSkillId = focus?.node?.skill_id ?? selectedDirection?.skills[0]?.id ?? null;
  const barrierNotes = focus?.barrierNotes ?? [];
  const errorNotes = focus?.errorNotes ?? [];
  const selectedAction = focus?.selectedAction ?? null;
  const totalDirections = selectedSphere?.directions.length ?? 0;
  const totalSkills =
    selectedSphere?.directions.reduce((sum, direction) => sum + direction.skills.length, 0) ?? 0;
  const totalNodes = selectedSphere?.node_count ?? 0;
  const totalActions = selectedSphere?.open_action_count ?? 0;

  return (
    <div className="space-y-8">
      <PixelSurface frame="panel" padding="xxl">
        <PixelStack gap="lg">
          <PixelPanelHeader
            eyebrow="Карта"
            title={
              <span className="flex items-center gap-3">
                <Map size={24} className="text-[var(--pixel-accent)]" /> Карта работы
              </span>
            }
            description="Главная игровая поверхность: карта слева, inspector справа."
            aside={
              <PixelButton onClick={onRefresh} disabled={isLoading}>
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
              </PixelButton>
            }
          />

          {error ? (
            <PixelSurface frame="accent" padding="md">
              <PixelText as="p" readable size="sm">
                {error}
              </PixelText>
            </PixelSurface>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PixelStatCard label="Сфера" value={selectedSphere?.name ?? 'Нет'} tone="inset" />
            <PixelStatCard label="Направления" value={totalDirections} tone="inset" />
            <PixelStatCard label="Навыки" value={totalSkills} tone="inset" />
            <PixelStatCard label="Узлы / шаги" value={`${totalNodes} / ${totalActions}`} tone="inset" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spheres.map((sphere) => {
              const nextDirection = sphere.directions[0];
              const nextSkill = nextDirection?.skills[0];
              const nextNode = nextSkill?.nodes[0];

              return (
                <PixelActionCard
                  key={sphere.id}
                  onClick={() => {
                    if (nextNode) {
                      onSelectNode(nextNode);
                    }
                  }}
                  active={sphere.id === selectedSphereId}
                  eyebrow="Сфера"
                  title={sphere.name}
                  meta={`${sphere.node_count} узл. · ${sphere.open_action_count} шаг.`}
                  description={
                    sphere.id === selectedSphereId
                      ? 'Текущая активная зона карты.'
                      : 'Открыть ближайший узел этой сферы.'
                  }
                  disabled={!nextNode}
                />
              );
            })}
          </div>
        </PixelStack>
      </PixelSurface>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <div className="space-y-6">
          <PixelSurface frame="panel" padding="xl">
            <PixelPanelHeader
              eyebrow="World Surface"
              title="Живая карта"
              description="PixiJS рендерит узлы, связи и атмосферу как отдельный слой мира."
              aside={
                focus?.node ? (
                  <PixelSurface frame="ghost" padding="sm" fullWidth={false}>
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      В фокусе
                    </PixelText>
                    <PixelText as="p" size="sm" style={{ marginTop: 8 }}>
                      {focus.node.title}
                    </PixelText>
                  </PixelSurface>
                ) : null
              }
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <PixelSurface frame="inset" padding="sm">
                <GameMapCanvas snapshot={snapshot} focus={focus} onSelectNode={onSelectNode} />
              </PixelSurface>

              <PixelSurface frame="inset" padding="md">
                <PixelStack gap="md">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    Регион
                  </PixelText>
                  <PixelText as="p" size="lg">
                    {selectedSphere?.name ?? 'Нет региона'}
                  </PixelText>
                  <PixelText as="p" readable color="textMuted" size="sm">
                    Карта держит текущую сферу как активную область исследования.
                  </PixelText>

                  <div className="grid gap-3">
                    <PixelStatCard label="Навыки" value={totalSkills} tone="ghost" />
                    <PixelStatCard
                      label="Риск проверки"
                      value={riskLabel(focus?.reviewState?.current_risk ?? 'none')}
                      tone="ghost"
                    />
                    <PixelStatCard
                      label="Сессия"
                      value={focus?.session?.status ? statusLabel(focus.session.status) : 'не начата'}
                      tone="ghost"
                    />
                  </div>
                </PixelStack>
              </PixelSurface>
            </div>
          </PixelSurface>

          <PixelSurface frame="panel" padding="xl">
            <PixelPanelHeader
              eyebrow={
                <span className="flex items-center gap-2">
                  <GitBranch size={14} className="text-[var(--pixel-accent)]" /> Дерево
                </span>
              }
              title={selectedSphere?.name ?? 'Навигация'}
              description={
                selectedSphere
                  ? 'Направления, навыки и узлы выбранной сферы.'
                  : 'Пока пусто. Сначала создайте стартовый набор.'
              }
            />

            {!selectedSphere ? (
              <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                Пока пусто. Сначала создайте стартовый набор.
              </PixelText>
            ) : (
              <div className="mt-4 space-y-4">
                {selectedSphere.directions.map((direction) => (
                  <PixelSurface
                    key={direction.id}
                    frame={direction.id === selectedDirectionId ? 'inset' : 'ghost'}
                    padding="lg"
                  >
                    <PixelPanelHeader
                      eyebrow="Направление"
                      title={direction.name}
                      description={`${direction.node_count} узл. · ${direction.open_action_count} шаг.`}
                    />

                    <div className="mt-4 space-y-4">
                      {direction.skills.map((skill) => (
                        <PixelSurface
                          key={skill.id}
                          frame={skill.id === selectedSkillId ? 'panel' : 'ghost'}
                          padding="md"
                        >
                          <PixelPanelHeader
                            eyebrow="Навык"
                            title={skill.name}
                            description={`${skill.node_count} узл. · ${skill.open_action_count} шаг.`}
                          />

                          <div className="mt-3 space-y-3">
                            {skill.nodes.map((node) =>
                              renderNodeCard(node, focus?.node?.id === node.id, onSelectNode),
                            )}
                          </div>
                        </PixelSurface>
                      ))}
                    </div>
                  </PixelSurface>
                ))}
              </div>
            )}
          </PixelSurface>
        </div>

        <div className="self-start xl:sticky xl:top-6">
          <PixelSurface frame="panel" padding="xl">
            {isFocusLoading ? (
              <PixelText as="p" readable color="textMuted" size="sm">
                Загрузка…
              </PixelText>
            ) : null}

            {!isFocusLoading && !focus?.node ? (
              <PixelSurface frame="ghost" padding="xxl">
                <Compass size={30} className="mx-auto text-[var(--pixel-accent)]" />
                <PixelText
                  as="p"
                  readable
                  color="textMuted"
                  size="sm"
                  style={{ marginTop: 16, textAlign: 'center' }}
                >
                  Выберите узел на карте или в дереве.
                </PixelText>
              </PixelSurface>
            ) : null}

            {!isFocusLoading && focus?.node ? (
              <PixelStack gap="lg">
                <PixelPanelHeader
                  eyebrow="Inspector"
                  title={focus.node.title}
                  description={`${focus.node.sphere_name} / ${focus.node.direction_name} / ${focus.node.skill_name}`}
                />

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <PixelStatCard
                    label="Прогресс"
                    value={`${focus.progress.completedActions}/${focus.progress.totalActions}`}
                    tone="inset"
                  />
                  <PixelStatCard
                    label="Открыто"
                    value={focus.progress.openActions}
                    tone="inset"
                  />
                  <PixelStatCard
                    label="Проверка"
                    value={riskLabel(focus.reviewState?.current_risk ?? 'none')}
                    tone="inset"
                  />
                </div>

                {focus.node.summary ? (
                  <PixelText as="p" readable color="textMuted" size="sm">
                    {focus.node.summary}
                  </PixelText>
                ) : null}

                {selectedAction ? (
                  <PixelActionCard
                    eyebrow="Текущий шаг"
                    title={selectedAction.title}
                    description={selectedAction.details}
                    meta={statusLabel(selectedAction.status)}
                    active
                    onClick={() => onSelectAction(selectedAction)}
                  />
                ) : null}

                <PixelSurface frame="inset" padding="lg">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Шаги узла
                  </PixelText>
                  <div className="mt-4 space-y-3">
                    {focus.actions.map((action) => (
                      <PixelActionCard
                        key={action.id}
                        onClick={() => onSelectAction(action)}
                        title={action.title}
                        description={action.details}
                        meta={statusLabel(action.status)}
                        active={action.id === selectedAction?.id}
                      />
                    ))}
                  </div>
                </PixelSurface>

                <PixelSurface frame="inset" padding="lg">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Связи
                  </PixelText>

                  <div className="mt-4 space-y-4">
                    <PixelSurface frame="ghost" padding="md">
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        Следующая проверка
                      </PixelText>
                      <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 8 }}>
                        {focus.reviewState?.next_due_at ?? 'не задана'}
                      </PixelText>
                    </PixelSurface>

                    <div>
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        Мешает
                      </PixelText>
                      {focus.dependencies.length === 0 ? (
                        <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 8 }}>
                          Ничего.
                        </PixelText>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {focus.dependencies.map((item) => (
                            <PixelActionCard
                              key={item.id}
                              title={item.title}
                              meta={statusLabel(item.status)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        Откроет
                      </PixelText>
                      {focus.dependents.length === 0 ? (
                        <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 8 }}>
                          Пока ничего.
                        </PixelText>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {focus.dependents.map((item) => (
                            <PixelActionCard
                              key={item.id}
                              title={item.title}
                              meta={statusLabel(item.status)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PixelSurface>

                <div className="grid gap-4">
                  <PixelSurface frame="inset" padding="lg">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Барьеры
                    </PixelText>
                    <div className="mt-4 space-y-3">
                      {barrierNotes.length === 0 ? (
                        <PixelText as="p" readable color="textMuted" size="sm">
                          Пока нет.
                        </PixelText>
                      ) : (
                        barrierNotes.map((note) => (
                          <PixelActionCard
                            key={note.id}
                            eyebrow={barrierLabel(note.barrier_type)}
                            title={note.note || 'Без заметки'}
                          />
                        ))
                      )}
                    </div>
                  </PixelSurface>

                  <PixelSurface frame="inset" padding="lg">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Заметки
                    </PixelText>
                    <div className="mt-4 space-y-3">
                      {errorNotes.length === 0 ? (
                        <PixelText as="p" readable color="textMuted" size="sm">
                          Пока нет.
                        </PixelText>
                      ) : (
                        errorNotes.map((note) => (
                          <PixelActionCard
                            key={note.id}
                            eyebrow={noteKindLabel(note.note_kind)}
                            title={note.note || 'Без заметки'}
                          />
                        ))
                      )}
                    </div>
                  </PixelSurface>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PixelButton
                    tone="accent"
                    onClick={onStartSession}
                    disabled={isStartingSession || focus.session?.status === 'active' || !selectedAction}
                  >
                    <Play size={16} />{' '}
                    {focus.session?.status === 'active'
                      ? 'Сессия идет'
                      : isStartingSession
                        ? 'Запускаю…'
                        : 'Начать'}
                  </PixelButton>

                  <PixelButton
                    onClick={onCompleteAction}
                    disabled={
                      isCompletingAction ||
                      !selectedAction ||
                      selectedAction.status === 'done' ||
                      focus.session?.status !== 'active'
                    }
                  >
                    <CheckCircle2 size={16} /> {isCompletingAction ? 'Сохраняю…' : 'Готово'}
                  </PixelButton>

                  <PixelButton tone="ghost" onClick={onOpenJournal} disabled={!focus.node}>
                    <Target size={16} /> В журнал
                  </PixelButton>

                  <PixelButton tone="ghost" onClick={onCreateFollowUp} disabled={!focus.node}>
                    <Scissors size={16} /> Следующий шаг
                  </PixelButton>
                </div>

                <PixelSurface frame="inset" padding="lg">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    Outcome Console
                  </PixelText>

                  <div className="mt-4">
                    <PixelTextarea
                      label="Заметка"
                      value={outcomeNote}
                      onChange={(event) => onOutcomeNoteChange(event.target.value)}
                      placeholder="Короткая заметка"
                    />
                  </div>

                  <div className="mt-4 grid gap-4">
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
                        !selectedAction ||
                        focus.session?.status !== 'active' ||
                        selectedAction.status === 'done'
                      }
                    >
                      <PauseCircle size={16} />{' '}
                      {activeOutcomeAction === 'defer' ? 'Откладываю…' : 'Отложить'}
                    </PixelButton>

                    <PixelButton
                      onClick={onBlockAction}
                      disabled={
                        activeOutcomeAction != null ||
                        !selectedAction ||
                        focus.session?.status !== 'active' ||
                        selectedAction.status === 'done'
                      }
                    >
                      <Target size={16} />{' '}
                      {activeOutcomeAction === 'block' ? 'Сохраняю…' : 'Есть барьер'}
                    </PixelButton>

                    <PixelButton
                      onClick={onShrinkAction}
                      disabled={
                        activeOutcomeAction != null ||
                        !selectedAction ||
                        focus.session?.status !== 'active' ||
                        selectedAction.status === 'done'
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
        </div>
      </section>
    </div>
  );
};
