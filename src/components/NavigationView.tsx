import { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Compass,
  Copy,
  GitBranch,
  Map,
  PauseCircle,
  PencilLine,
  Play,
  RefreshCw,
  Save,
  Scissors,
  Target,
  X,
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
import { GameMapCanvas } from '../game';
import {
  canDuplicateNodeEditorDraft,
  createNodeEditorDraft,
  hasNodeEditorPersistedChanges,
  type NodeEditorDraft,
} from './navigation-editor-draft';
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
  paused: 'на паузе',
  archived: 'в архиве',
  draft: 'черновик',
};

const typeLabels: Record<string, string> = {
  task: 'задача',
  project: 'проект',
  theory: 'теория',
  maintenance: 'поддержка',
  habit: 'привычка',
  research: 'исследование',
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

const editorTypeOptions = [
  { value: 'task', label: 'Задача' },
  { value: 'project', label: 'Проект' },
  { value: 'theory', label: 'Теория' },
  { value: 'habit', label: 'Привычка' },
  { value: 'maintenance', label: 'Поддержка' },
  { value: 'research', label: 'Исследование' },
];

const editorStatusOptions = [
  { value: 'active', label: 'Активен' },
  { value: 'paused', label: 'На паузе' },
  { value: 'done', label: 'Завершен' },
];

const mapLegend = [
  { label: 'Открыт', value: 'узел доступен для работы' },
  { label: 'В процессе', value: 'идет активная сессия' },
  { label: 'Доступен', value: 'есть следующий шаг' },
  { label: 'Заблокирован', value: 'ждет зависимость' },
];

const statusLabel = (value: string) => statusLabels[value] ?? value;
const typeLabel = (value: string) => typeLabels[value] ?? value;
const noteKindLabel = (value: string) => noteKindLabels[value] ?? value;
const barrierLabel = (value: string) =>
  barrierTypes.find((item) => item.value === value)?.label ?? value;
const riskLabel = (value: string) => riskLabels[value] ?? value;

const pickSphereFocusNode = (sphere: NavigationSnapshot['spheres'][number]) => {
  const nodes = sphere.directions.flatMap((direction) =>
    direction.skills.flatMap((skill) => skill.nodes),
  );

  return (
    nodes.find((node) => node.next_action_id != null) ??
    nodes.find((node) => node.open_action_count > 0 && node.status !== 'done') ??
    nodes.find((node) => node.status === 'doing' || node.status === 'ready') ??
    nodes[0] ??
    null
  );
};

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
  onCreateFollowUp: () => void;
  onSaveEditor: (draft: NodeEditorDraft) => void;
  onDuplicateEditor: (draft: NodeEditorDraft) => void;
  onArchiveEditor: (draft: NodeEditorDraft) => void;
  editorPendingAction: 'save' | 'duplicate' | 'archive' | null;
  editorNotice: string | null;
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
  onCreateFollowUp,
  onSaveEditor,
  onDuplicateEditor,
  onArchiveEditor,
  editorPendingAction,
  editorNotice,
}: NavigationViewProps) => {
  const [editorOverride, setEditorOverride] = useState<Partial<NodeEditorDraft> | null>(null);
  const [editorOverrideNodeId, setEditorOverrideNodeId] = useState<number | null>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  const updateDraft = (patch: Partial<NodeEditorDraft>) => {
    if (!focus?.node) {
      return;
    }

    setEditorOverrideNodeId(focus.node.id);
    setEditorOverride((current) => ({
      ...(current ?? {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  };

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

  const workspaceDirections = spheres.reduce((sum, sphere) => sum + sphere.directions.length, 0);
  const workspaceSkills = spheres.reduce(
    (sum, sphere) =>
      sum + sphere.directions.reduce((directionSum, direction) => directionSum + direction.skills.length, 0),
    0,
  );
  const workspaceNodes = spheres.reduce((sum, sphere) => sum + sphere.node_count, 0);
  const workspaceActions = spheres.reduce((sum, sphere) => sum + sphere.open_action_count, 0);
  const completionValue = focus?.progress.totalActions ? focus.progress.completionPercent : 0;
  const baseEditorDraft = focus?.node ? createNodeEditorDraft(focus) : null;
  const editorDraft =
    baseEditorDraft && editorOverrideNodeId === baseEditorDraft.nodeId
      ? {
          ...baseEditorDraft,
          ...(editorOverride ?? {}),
        }
      : baseEditorDraft;
  const isEditorDirty =
    focus != null && editorDraft != null ? hasNodeEditorPersistedChanges(focus, editorDraft) : false;
  const isEditorBusy = editorPendingAction != null;
  const isEditorArchived = focus?.node?.status === 'archived' || editorDraft?.status === 'archived';
  const canDuplicateEditor =
    focus != null && editorDraft != null ? canDuplicateNodeEditorDraft(focus, editorDraft) : false;
  const modalEditorDraft = isEditorExpanded && focus?.node && editorDraft ? editorDraft : null;
  const showInlineEditor = isEditorExpanded && focus == null;

  return (
    <div className="space-y-3">
      {error ? (
        <PixelSurface frame="accent" padding="md">
          <PixelText as="p" readable size="sm">
            {error}
          </PixelText>
        </PixelSurface>
      ) : null}

      <PixelSurface frame="panel" padding="xxs">
        <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))]">
          <PixelStatCard label="Узлы" value={workspaceNodes} tone="inset" compact />
          <PixelStatCard label="Открытые шаги" value={workspaceActions} tone="inset" compact />
          <PixelStatCard label="Ветки / навыки" value={`${workspaceDirections} / ${workspaceSkills}`} tone="inset" compact />
          <PixelStatCard label="Регион" value={selectedSphere?.name ?? 'Не выбран'} tone="inset" compact />
          <PixelStatCard
            label="Текущий фокус"
            value={selectedAction?.title ?? focus?.node?.title ?? 'Выберите узел'}
            tone="inset"
            compact
          />
        </div>
      </PixelSurface>

      <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <PixelSurface frame="panel" padding="lg">
            <PixelPanelHeader
              eyebrow="Карта"
              title={
                <span className="flex items-center gap-2">
                  <Map size={20} className="text-[var(--pixel-accent)]" /> Основная карта
                </span>
              }
              description="Карта слева, редактор справа."
              aside={
                <PixelButton onClick={onRefresh} disabled={isLoading} style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}>
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
                </PixelButton>
              }
            />

            <div className="mt-3 space-y-3">
              <PixelSurface frame="inset" padding="xxs">
                <GameMapCanvas
                  snapshot={snapshot}
                  focus={focus}
                  onSelectNode={onSelectNode}
                  className="h-[clamp(620px,calc(100dvh-180px),1080px)] w-full overflow-hidden rounded-[1rem] border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)]"
                />
              </PixelSurface>

              <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr_1fr]">
                <PixelSurface frame="inset" padding="sm">
                  <PixelStack gap="sm">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Легенда
                    </PixelText>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {mapLegend.map((item) => (
                        <PixelSurface key={item.label} frame="ghost" padding="xxs">
                          <PixelText as="p" size="xs" color="textMuted" uppercase style={{ lineHeight: 1 }}>
                            {item.label}
                          </PixelText>
                          <PixelText as="p" readable size="xs" style={{ marginTop: 4 }}>
                            {item.value}
                          </PixelText>
                        </PixelSurface>
                      ))}
                    </div>
                  </PixelStack>
                </PixelSurface>

                <PixelSurface frame="inset" padding="sm">
                  <PixelStack gap="sm">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Карта сейчас
                    </PixelText>
                    <PixelText as="p" size="md">
                      {selectedSphere?.name ?? 'Нет региона'}
                    </PixelText>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <PixelStatCard label="Направления" value={totalDirections} tone="ghost" compact />
                      <PixelStatCard label="Навыки" value={totalSkills} tone="ghost" compact />
                      <PixelStatCard label="Узлы / шаги" value={`${totalNodes} / ${totalActions}`} tone="ghost" compact />
                      <PixelStatCard
                        label="Сессия"
                        value={focus?.session?.status ? statusLabel(focus.session.status) : 'не начата'}
                        tone="ghost"
                        compact
                      />
                    </div>
                  </PixelStack>
                </PixelSurface>

                <PixelSurface frame="inset" padding="sm">
                  <PixelStack gap="sm">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Быстрый переход
                    </PixelText>
                    <div className="grid gap-2">
                      {spheres.map((sphere) => {
                        const nextNode = pickSphereFocusNode(sphere);

                        return (
                          <PixelButton
                            key={sphere.id}
                            tone={sphere.id === selectedSphereId ? 'accent' : 'panel'}
                            onClick={() => {
                              if (nextNode) {
                                onSelectNode(nextNode);
                              }
                            }}
                            disabled={!nextNode}
                            fullWidth
                            style={{ minHeight: 30, padding: '6px 10px', justifyContent: 'space-between', gap: 8 }}
                          >
                            <span>{sphere.name}</span>
                            <span className="text-[10px] opacity-80">{sphere.node_count}/{sphere.open_action_count}</span>
                          </PixelButton>
                        );
                      })}
                    </div>
                  </PixelStack>
                </PixelSurface>
              </div>
            </div>
          </PixelSurface>

          <PixelSurface frame="panel" padding="lg">
            <PixelPanelHeader
              eyebrow={
                <span className="flex items-center gap-2">
                  <GitBranch size={14} className="text-[var(--pixel-accent)]" /> Навигационные ветки
                </span>
              }
              title={selectedSphere?.name ?? 'Структура карты'}
              description={
                selectedSphere
                  ? 'Под картой: направления, навыки и узлы региона.'
                  : 'Пока пусто. Сначала создайте стартовый набор.'
              }
            />

            {!selectedSphere ? (
              <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                Пока пусто. Сначала создайте стартовый набор.
              </PixelText>
            ) : (
              <div className="mt-3 grid gap-3 2xl:grid-cols-2">
                {selectedSphere.directions.map((direction) => (
                  <PixelSurface
                    key={direction.id}
                    frame={direction.id === selectedDirectionId ? 'inset' : 'ghost'}
                    padding="md"
                  >
                    <PixelPanelHeader
                      eyebrow="Направление"
                      title={direction.name}
                      description={`${direction.node_count} узл. · ${direction.open_action_count} шаг.`}
                    />

                    <div className="mt-3 space-y-3">
                      {direction.skills.map((skill) => (
                        <PixelSurface
                          key={skill.id}
                          frame={skill.id === selectedSkillId ? 'panel' : 'ghost'}
                          padding="sm"
                        >
                          <PixelPanelHeader
                            eyebrow="Навык"
                            title={skill.name}
                            description={`${skill.node_count} узл. · ${skill.open_action_count} шаг.`}
                          />

                          <div className="mt-2 space-y-2">
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

        <div className="self-start xl:sticky xl:top-3 xl:justify-self-end xl:w-[340px] 2xl:w-[360px]">
          <PixelStack gap="md">
            <PixelSurface frame="panel" padding="md">
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
                    Выберите узел на карте или в навигационных ветках.
                  </PixelText>
                </PixelSurface>
              ) : null}

              {!isFocusLoading && focus?.node && editorDraft ? (
                <PixelStack gap="md">
                  <PixelPanelHeader
                    eyebrow="Редактор узла"
                    title="Редактор узла"
                    description="Изменения пишутся сразу."
                    aside={
                      <PixelButton
                        tone="accent"
                        onClick={() => setIsEditorExpanded(true)}
                        disabled={isEditorBusy}
                        style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                      >
                        <PencilLine size={14} /> Редактировать
                      </PixelButton>
                    }
                  />

                  <PixelSurface frame="inset" padding="sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <PixelText as="p" size="xs" color="textMuted" uppercase>
                          ID узла
                        </PixelText>
                        <PixelText as="p" size="sm" style={{ marginTop: 8 }}>
                          node_{focus.node.id}
                        </PixelText>
                      </div>
                      <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                        <PixelText as="span" size="xs" color="textMuted" uppercase>
                          {editorDraft?.updatedAt.slice(0, 16).replace('T', ' ') ?? 'сохранено'}
                        </PixelText>
                      </PixelSurface>
                    </div>
                  </PixelSurface>

                  <PixelSurface frame="inset" padding="sm">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Название
                    </PixelText>
                    <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                      {editorDraft.title}
                    </PixelText>
                  </PixelSurface>

                  {(editorDraft.summary || focus.node.summary) ? (
                    <PixelSurface frame="inset" padding="sm">
                      <PixelText as="p" size="xs" color="textDim" uppercase>
                        Описание
                      </PixelText>
                      <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                        {editorDraft.summary || focus.node.summary}
                      </PixelText>
                    </PixelSurface>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                    <PixelStatCard label="Тип" value={typeLabel(editorDraft.type)} tone="inset" compact />
                    <PixelStatCard label="Статус" value={statusLabel(editorDraft.status)} tone="inset" compact />
                  </div>

                  {showInlineEditor && isEditorExpanded && editorDraft ? (
                    <div className="grid gap-3">
                      <PixelSurface frame="inset" padding="sm">
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Тематика / путь
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                          {editorDraft.theme}
                        </PixelText>
                      </PixelSurface>

                      <PixelInput
                        label="Название"
                        type="text"
                        value={editorDraft.title}
                        onChange={(event) => updateDraft({ title: event.target.value })}
                        disabled={isEditorBusy}
                      />

                      <PixelTextarea
                        label="Описание"
                        value={editorDraft.summary}
                        onChange={(event) => updateDraft({ summary: event.target.value })}
                        placeholder="Короткое описание узла"
                        disabled={isEditorBusy}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <PixelSelect
                          label="Тип узла"
                          value={editorDraft.type}
                          onChange={(event) => updateDraft({ type: event.target.value })}
                          disabled={isEditorBusy}
                        >
                          {editorTypeOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </PixelSelect>

                        <PixelSelect
                          label="Статус"
                          value={editorDraft.status}
                          onChange={(event) => updateDraft({ status: event.target.value, isArchived: false })}
                          disabled={isEditorBusy}
                        >
                          {editorStatusOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </PixelSelect>
                      </div>

                      <PixelSurface frame="inset" padding="sm">
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Критерий завершения
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                          {editorDraft.completionCriteria || 'Пока не определен.'}
                        </PixelText>
                      </PixelSurface>

                      <PixelSurface frame="inset" padding="sm">
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Следующий шаг
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                          {editorDraft.nextStep || 'Пока нет.'}
                        </PixelText>
                      </PixelSurface>

                      <PixelSurface frame="inset" padding="sm">
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Связи / открывает
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
                          {editorDraft.links || 'Пока нет зависимостей и открытий.'}
                        </PixelText>
                      </PixelSurface>

                      <PixelSurface frame="inset" padding="sm">
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Награда
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                          {editorDraft.reward || 'Пока не задана.'}
                        </PixelText>
                      </PixelSurface>
                    </div>
                  ) : null}

                  {isEditorBusy ? (
                    <PixelSurface frame="ghost" padding="xs">
                      <PixelText as="p" readable size="sm" color="textMuted">
                        {editorPendingAction === 'save'
                          ? 'Сохраняю узел…'
                          : editorPendingAction === 'duplicate'
                            ? 'Создаю копию…'
                            : 'Архивирую узел и переношу фокус…'}
                      </PixelText>
                    </PixelSurface>
                  ) : null}

                  {editorNotice ? (
                    <PixelSurface frame="ghost" padding="xs">
                      <PixelText as="p" readable size="sm" color="textMuted">
                        {editorNotice}
                      </PixelText>
                    </PixelSurface>
                  ) : null}

                  {showInlineEditor && !canDuplicateEditor && editorDraft ? (
                    <PixelSurface frame="ghost" padding="xs">
                      <PixelText as="p" readable size="sm" color="textMuted">
                        Копия берёт только сохранённые название и описание. Если меняли тип или статус, сначала сохраните узел.
                      </PixelText>
                    </PixelSurface>
                  ) : null}

                  {showInlineEditor ? (
                  <div className="flex flex-wrap gap-2">
                    <PixelButton
                      tone="accent"
                      onClick={() => {
                        if (editorDraft) {
                          onSaveEditor(editorDraft);
                        }
                      }}
                      disabled={!editorDraft || isEditorBusy || !isEditorDirty}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Save size={16} /> {editorPendingAction === 'save' ? 'Сохраняю…' : 'Сохранить'}
                    </PixelButton>
                    <PixelButton
                      tone="ghost"
                      onClick={() => {
                        if (editorDraft) {
                          onDuplicateEditor(editorDraft);
                        }
                      }}
                      disabled={!editorDraft || isEditorBusy || !canDuplicateEditor}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Copy size={16} /> {editorPendingAction === 'duplicate' ? 'Дублирую…' : 'Дублировать'}
                    </PixelButton>
                    <PixelButton
                      onClick={() => {
                        if (editorDraft) {
                          onArchiveEditor(editorDraft);
                        }
                      }}
                      disabled={!editorDraft || isEditorBusy || isEditorArchived}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Archive size={16} /> {editorPendingAction === 'archive' ? 'Архивирую…' : 'Архивировать'}
                    </PixelButton>
                  </div>
                  ) : null}
                </PixelStack>
              ) : null}
            </PixelSurface>

            {focus?.node ? (
            <PixelSurface frame="panel" padding="md">
              <PixelStack gap="md">
                <PixelPanelHeader
                  eyebrow="Сводка узла"
                  title={editorDraft?.title ?? focus.node.title}
                  description={editorDraft?.theme ?? `${focus.node.sphere_name} / ${focus.node.direction_name} / ${focus.node.skill_name}`}
                />

                  <PixelMeter
                    value={completionValue}
                    max={100}
                    label="Прогресс узла"
                    tone={focus.session?.status === 'active' ? 'success' : 'accent'}
                    showValue
                  />

                  <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                    <PixelStatCard label="Открыто" value={focus.progress.openActions} tone="inset" compact />
                    <PixelStatCard
                      label="Риск"
                      value={riskLabel(focus.reviewState?.current_risk ?? 'none')}
                      tone="inset"
                      compact
                    />
                    <PixelStatCard
                      label="Редактор"
                      value={statusLabel(editorDraft?.status ?? focus.node.status)}
                      tone="inset"
                      compact
                    />
                  </div>

                  {isEditorArchived ? (
                    <PixelSurface frame="ghost" padding="xs">
                      <PixelText as="p" readable size="sm" color="textMuted">
                        Узел уже в архиве. Операционные действия ниже отключены до переключения на живой фокус.
                      </PixelText>
                    </PixelSurface>
                  ) : null}

                  {(editorDraft?.summary || focus.node.summary) ? (
                    <PixelText as="p" readable color="textMuted" size="sm">
                      {editorDraft?.summary || focus.node.summary}
                    </PixelText>
                  ) : null}

                  <PixelSurface frame="inset" padding="sm">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Что нужно сделать
                    </PixelText>
                    <div className="mt-2 space-y-2">
                      {focus.actions.length === 0 ? (
                        <PixelText as="p" readable color="textMuted" size="sm">
                          Пока нет открытых шагов.
                        </PixelText>
                      ) : (
                        focus.actions.map((action) => (
                          <PixelActionCard
                            key={action.id}
                            onClick={() => onSelectAction(action)}
                            title={action.title}
                            description={action.details}
                            meta={statusLabel(action.status)}
                            active={action.id === selectedAction?.id}
                          />
                        ))
                      )}
                    </div>
                  </PixelSurface>

                  <PixelSurface frame="inset" padding="sm">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Откроет дальше
                    </PixelText>
                    {focus.dependents.length === 0 ? (
                      <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                        Пока ничего.
                      </PixelText>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {focus.dependents.map((item) => (
                          <PixelActionCard key={item.id} title={item.title} meta={statusLabel(item.status)} />
                        ))}
                      </div>
                    )}
                  </PixelSurface>

                  <PixelSurface frame="inset" padding="sm">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Что мешает
                    </PixelText>
                    {focus.dependencies.length === 0 ? (
                      <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                        Ничего.
                      </PixelText>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {focus.dependencies.map((item) => (
                          <PixelActionCard key={item.id} title={item.title} meta={statusLabel(item.status)} />
                        ))}
                      </div>
                    )}
                  </PixelSurface>

                  {selectedAction ? (
                    <PixelActionCard
                      eyebrow="Следующий шаг"
                      title={selectedAction.title}
                      description={selectedAction.details}
                      meta={statusLabel(selectedAction.status)}
                      active
                      onClick={() => onSelectAction(selectedAction)}
                    />
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <PixelButton
                      tone="accent"
                      onClick={onStartSession}
                      disabled={
                        isEditorArchived ||
                        isStartingSession ||
                        focus.session?.status === 'active' ||
                        !selectedAction
                      }
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
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
                        isEditorArchived ||
                        isCompletingAction ||
                        !selectedAction ||
                        selectedAction.status === 'done' ||
                        focus.session?.status !== 'active'
                      }
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <CheckCircle2 size={16} /> {isCompletingAction ? 'Сохраняю…' : 'Готово'}
                    </PixelButton>

                    <PixelButton
                      tone="ghost"
                      onClick={onCreateFollowUp}
                      disabled={!focus.node || isEditorArchived}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Scissors size={16} /> Следующий шаг
                    </PixelButton>
                  </div>

                  <div className="grid gap-3">
                    <PixelTextarea
                      label="Заметка по исходу"
                      value={outcomeNote}
                      onChange={(event) => onOutcomeNoteChange(event.target.value)}
                      placeholder="Короткая заметка"
                      disabled={isEditorArchived}
                    />

                    <PixelSelect
                      label="Тип барьера"
                      value={barrierType}
                      onChange={(event) => onBarrierTypeChange(event.target.value as BarrierType)}
                      disabled={isEditorArchived}
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
                      disabled={isEditorArchived}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <PixelButton
                      tone="ghost"
                      onClick={onDeferAction}
                      disabled={
                        isEditorArchived ||
                        activeOutcomeAction != null ||
                        !selectedAction ||
                        focus.session?.status !== 'active' ||
                        selectedAction.status === 'done'
                      }
                    >
                      <PauseCircle size={16} /> {activeOutcomeAction === 'defer' ? 'Откладываю…' : 'Отложить'}
                    </PixelButton>

                    <PixelButton
                      onClick={onBlockAction}
                      disabled={
                        isEditorArchived ||
                        activeOutcomeAction != null ||
                        !selectedAction ||
                        focus.session?.status !== 'active' ||
                        selectedAction.status === 'done'
                      }
                    >
                      <Target size={16} /> {activeOutcomeAction === 'block' ? 'Сохраняю…' : 'Есть барьер'}
                    </PixelButton>

                    <PixelButton
                      onClick={onShrinkAction}
                      disabled={
                        isEditorArchived ||
                        activeOutcomeAction != null ||
                        !selectedAction ||
                        focus.session?.status !== 'active' ||
                        selectedAction.status === 'done'
                      }
                    >
                      <Scissors size={16} /> {activeOutcomeAction === 'shrink' ? 'Упрощаю…' : 'Упростить'}
                    </PixelButton>
                  </div>

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
                </PixelStack>
              </PixelSurface>
            ) : null}
          </PixelStack>
        </div>
      </section>

      {modalEditorDraft && focus?.node ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-200/10 p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-white/10" onClick={() => setIsEditorExpanded(false)} aria-hidden="true" />
          <PixelSurface
            frame="panel"
            padding="md"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[820px] overflow-auto"
          >
            <PixelStack gap="md">
              <PixelPanelHeader
                eyebrow="Редактор узла"
                title="Редактор узла"
                description="Изменения пишутся сразу. Форма открыта поверх карты."
                aside={
                  <PixelButton
                    tone="ghost"
                    onClick={() => setIsEditorExpanded(false)}
                    disabled={isEditorBusy}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <X size={14} /> Закрыть
                  </PixelButton>
                }
              />

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    ID узла
                  </PixelText>
                  <PixelText as="p" size="sm" style={{ marginTop: 4 }}>
                    node_{focus.node.id}
                  </PixelText>
                </PixelSurface>

                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    Обновлен
                  </PixelText>
                  <PixelText as="p" size="sm" style={{ marginTop: 4 }}>
                    {modalEditorDraft.updatedAt.slice(0, 16).replace('T', ' ')}
                  </PixelText>
                </PixelSurface>
              </div>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Тематика / путь
                </PixelText>
                <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                  {modalEditorDraft.theme}
                </PixelText>
              </PixelSurface>

              <PixelInput
                label="Название"
                type="text"
                value={modalEditorDraft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                disabled={isEditorBusy}
              />

              <PixelTextarea
                label="Описание"
                value={modalEditorDraft.summary}
                onChange={(event) => updateDraft({ summary: event.target.value })}
                placeholder="Короткое описание узла"
                disabled={isEditorBusy}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <PixelSelect
                  label="Тип узла"
                  value={modalEditorDraft.type}
                  onChange={(event) => updateDraft({ type: event.target.value })}
                  disabled={isEditorBusy}
                >
                  {editorTypeOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </PixelSelect>

                <PixelSelect
                  label="Статус"
                  value={modalEditorDraft.status}
                  onChange={(event) => updateDraft({ status: event.target.value, isArchived: false })}
                  disabled={isEditorBusy}
                >
                  {editorStatusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </PixelSelect>
              </div>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Критерий завершения
                </PixelText>
                <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                  {modalEditorDraft.completionCriteria || 'Пока не определен.'}
                </PixelText>
              </PixelSurface>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Следующий шаг
                </PixelText>
                <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                  {modalEditorDraft.nextStep || 'Пока нет.'}
                </PixelText>
              </PixelSurface>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Связи / открывает
                </PixelText>
                <PixelText as="p" readable size="sm" style={{ marginTop: 4, whiteSpace: 'pre-line' }}>
                  {modalEditorDraft.links || 'Пока нет зависимостей и открытий.'}
                </PixelText>
              </PixelSurface>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Награда
                </PixelText>
                <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                  {modalEditorDraft.reward || 'Пока не задана.'}
                </PixelText>
              </PixelSurface>

              {isEditorBusy ? (
                <PixelSurface frame="ghost" padding="xs">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    {editorPendingAction === 'save'
                      ? 'Сохраняю узел...'
                      : editorPendingAction === 'duplicate'
                        ? 'Создаю копию...'
                        : 'Архивирую узел...'}
                  </PixelText>
                </PixelSurface>
              ) : null}

              {editorNotice ? (
                <PixelSurface frame="ghost" padding="xs">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    {editorNotice}
                  </PixelText>
                </PixelSurface>
              ) : null}

              {!canDuplicateEditor ? (
                <PixelSurface frame="ghost" padding="xs">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    Копия берет только сохраненные название и описание. Если меняли тип или статус, сначала сохраните узел.
                  </PixelText>
                </PixelSurface>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <PixelButton
                  tone="accent"
                  onClick={() => onSaveEditor(modalEditorDraft)}
                  disabled={isEditorBusy || !isEditorDirty}
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                >
                  <Save size={16} /> {editorPendingAction === 'save' ? 'Сохраняю...' : 'Сохранить'}
                </PixelButton>
                <PixelButton
                  tone="ghost"
                  onClick={() => onDuplicateEditor(modalEditorDraft)}
                  disabled={isEditorBusy || !canDuplicateEditor}
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                >
                  <Copy size={16} /> {editorPendingAction === 'duplicate' ? 'Дублирую...' : 'Дублировать'}
                </PixelButton>
                <PixelButton
                  onClick={() => onArchiveEditor(modalEditorDraft)}
                  disabled={isEditorBusy || isEditorArchived}
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                >
                  <Archive size={16} /> {editorPendingAction === 'archive' ? 'Архивирую...' : 'Архивировать'}
                </PixelButton>
              </div>
            </PixelStack>
          </PixelSurface>
        </div>
      ) : null}
    </div>
  );
};
