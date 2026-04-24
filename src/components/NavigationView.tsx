import { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Compass,
  Copy,
  GitBranch,
  Map as MapIcon,
  PauseCircle,
  PencilLine,
  Play,
  Plus,
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
  getGraphEdgeDirectionalCopy,
  getGraphEdgeLineTitle,
  getGraphEdgeSemantics,
  graphEdgeTypeOrder,
  type GraphEdgeDirection,
} from '../application/graph-edge-semantics';
import { resolveMapShortcutIntent } from '../application/map-shortcuts';
import {
  buildBulkLayoutPreview,
  type BulkLayoutPreview,
  type BulkLayoutScope,
  type BulkLayoutStrategy,
} from '../application/map-layout';
import {
  canDuplicateNodeEditorDraft,
  createNodeEditorDraft,
  getNodeEditorCompletionCriteriaPreview,
  getNodeEditorLinksPreview,
  getNodeEditorRewardPreview,
  hasNodeEditorPersistedChanges,
  type NodeEditorDraft,
} from './navigation-editor-draft';
import type {
  BarrierType,
  GraphEdgeType,
  NavigationGraphEdge,
  NavigationNodeSummary,
  NavigationSnapshot,
  NodeAction,
  NodeFocusSnapshot,
  OutcomeAction,
} from '../types/app-shell';
import { createGameViewModel } from '../game';

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

const statusLabel = (value: string) => statusLabels[value] ?? value;
const typeLabel = (value: string) => typeLabels[value] ?? value;
const riskLabel = (value: string) => riskLabels[value] ?? value;

const edgeTypeOptions = [
  { value: 'requires', label: '\u0422\u0440\u0435\u0431\u0443\u0435\u0442' },
  { value: 'supports', label: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442' },
  { value: 'relates_to', label: '\u0421\u0432\u044f\u0437\u0430\u043d\u043e' },
] as const;

const bulkLayoutScopeOptions = [
  { value: 'region', label: '\u0420\u0435\u0433\u0438\u043e\u043d' },
  { value: 'focus-neighborhood', label: '\u0412\u043e\u043a\u0440\u0443\u0433 \u0444\u043e\u043a\u0443\u0441\u0430' },
] as const;

const bulkLayoutStrategyOptions = [
  { value: 'tidy', label: '\u0423\u043f\u043e\u0440\u044f\u0434\u043e\u0447\u0438\u0442\u044c' },
  { value: 'spread', label: '\u0420\u0430\u0437\u0434\u0432\u0438\u043d\u0443\u0442\u044c' },
  { value: 'radial', label: '\u0420\u0430\u0434\u0438\u0430\u043b\u044c\u043d\u043e' },
] as const;

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

interface GraphRailEdgeEntry {
  edge: NavigationGraphEdge;
  node: NavigationNodeSummary;
  direction: 'incoming' | 'outgoing';
}

interface GraphRailEdgeGroup {
  type: GraphEdgeType;
  items: GraphRailEdgeEntry[];
}

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
  onCreateNodeAt: (input: {
    skillId: number;
    existingNodeCount: number;
    x: number;
    y: number;
  }) => Promise<boolean> | boolean;
  onMoveNode: (input: { nodeId: number; x: number; y: number }) => Promise<void> | void;
  onApplyBulkLayout: (positions: Record<number, { x: number; y: number }>) => Promise<boolean> | boolean;
  onCreateEdge: (input: {
    sourceNodeId: number;
    targetNodeId: number;
    edgeType: GraphEdgeType;
  }) => Promise<boolean> | boolean;
  onDeleteEdge: (edgeId: number) => Promise<boolean> | boolean;
  editorPendingAction: 'save' | 'duplicate' | 'archive' | null;
  editorNotice: string | null;
  mapMutationPendingAction: 'create-node' | 'move-node' | 'create-edge' | 'delete-edge' | 'layout' | null;
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
  onCreateNodeAt,
  onMoveNode,
  onApplyBulkLayout,
  onCreateEdge,
  onDeleteEdge,
  editorPendingAction,
  editorNotice,
  mapMutationPendingAction,
}: NavigationViewProps) => {
  const [editorOverride, setEditorOverride] = useState<Partial<NodeEditorDraft> | null>(null);
  const [editorOverrideNodeId, setEditorOverrideNodeId] = useState<number | null>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isMapCreateMode, setIsMapCreateMode] = useState(false);
  const [isSnapToGrid, setIsSnapToGrid] = useState(true);
  const [isEdgeConnectMode, setIsEdgeConnectMode] = useState(false);
  const [layoutScope, setLayoutScope] = useState<BulkLayoutScope>('region');
  const [layoutStrategy, setLayoutStrategy] = useState<BulkLayoutStrategy>('tidy');
  const [layoutPreview, setLayoutPreview] = useState<BulkLayoutPreview | null>(null);
  const [pendingEdgeSourceNodeId, setPendingEdgeSourceNodeId] = useState<number | null>(null);
  const [pendingEdgeType, setPendingEdgeType] = useState<GraphEdgeType>('requires');
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null);
  const [isMapFocused, setIsMapFocused] = useState(false);
  const [mapCommand, setMapCommand] = useState<{
    id: number;
    type: 'focus-node' | 'fit-graph' | 'reset-camera';
  } | null>(null);

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
  const selectedSkill =
    selectedDirection?.skills.find((skill) => skill.id === selectedSkillId) ??
    selectedDirection?.skills[0] ??
    null;
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
  const isMapMutating = mapMutationPendingAction != null;
  const isEditorArchived = focus?.node?.status === 'archived' || editorDraft?.status === 'archived';
  const canDuplicateEditor =
    focus != null && editorDraft != null ? canDuplicateNodeEditorDraft(focus, editorDraft) : false;
  const modalEditorDraft = isEditorExpanded && focus?.node && editorDraft ? editorDraft : null;
  const modalSummaryFocus = isSummaryExpanded && focus?.node ? focus : null;
  const showInlineEditor = isEditorExpanded && focus == null;
  const completionCriteriaPreview =
    focus != null && editorDraft != null ? getNodeEditorCompletionCriteriaPreview(focus, editorDraft) : '';
  const linksPreview =
    focus != null && editorDraft != null ? getNodeEditorLinksPreview(focus, editorDraft) : '';
  const rewardPreview =
    focus != null && editorDraft != null ? getNodeEditorRewardPreview(focus, editorDraft) : '';
  const hasAuthoredCompletionCriteria = Boolean(editorDraft?.completionCriteria.trim());
  const hasAuthoredLinks = Boolean(editorDraft?.links.trim());
  const hasAuthoredReward = Boolean(editorDraft?.reward.trim());
  const navigationNodeIndex = new globalThis.Map<number, NavigationNodeSummary>();

  for (const sphere of spheres) {
    for (const direction of sphere.directions) {
      for (const skill of direction.skills) {
        for (const node of skill.nodes) {
          navigationNodeIndex.set(node.id, node);
        }
      }
    }
  }
  const graphEdges = snapshot?.edges ?? [];
  const mapModel = createGameViewModel(snapshot, focus);
  const mapPositionIndex = new globalThis.Map(mapModel.nodes.map((node) => [node.id, node.position]));
  const resolvedSelectedEdgeId =
    selectedEdgeId != null && graphEdges.some((edge) => edge.id === selectedEdgeId) ? selectedEdgeId : null;
  const selectedEdge =
    resolvedSelectedEdgeId != null ? graphEdges.find((edge) => edge.id === resolvedSelectedEdgeId) ?? null : null;
  const incomingGraphEdges: GraphRailEdgeEntry[] = !focus?.node
    ? []
    : graphEdges.flatMap((edge) => {
        if (edge.target_node_id !== focus.node.id) {
          return [];
        }

        const node = navigationNodeIndex.get(edge.source_node_id);
        return node ? [{ edge, node, direction: 'incoming' as const }] : [];
      });
  const outgoingGraphEdges: GraphRailEdgeEntry[] = !focus?.node
    ? []
    : graphEdges.flatMap((edge) => {
        if (edge.source_node_id !== focus.node.id) {
          return [];
        }

        const node = navigationNodeIndex.get(edge.target_node_id);
        return node ? [{ edge, node, direction: 'outgoing' as const }] : [];
      });
  const resolvedPendingEdgeSourceNodeId =
    pendingEdgeSourceNodeId != null && navigationNodeIndex.has(pendingEdgeSourceNodeId)
      ? pendingEdgeSourceNodeId
      : null;
  const pendingEdgeSourceNode =
    resolvedPendingEdgeSourceNodeId != null ? navigationNodeIndex.get(resolvedPendingEdgeSourceNodeId) ?? null : null;
  const selectedEdgeSourceNode =
    selectedEdge != null ? navigationNodeIndex.get(selectedEdge.source_node_id) ?? null : null;
  const selectedEdgeTargetNode =
    selectedEdge != null ? navigationNodeIndex.get(selectedEdge.target_node_id) ?? null : null;
  const groupedOutgoingGraphEdges: GraphRailEdgeGroup[] = graphEdgeTypeOrder
    .map((type) => ({
      type,
      items: outgoingGraphEdges.filter(({ edge }) => edge.edge_type === type),
    }))
    .filter((group) => group.items.length > 0);
  const groupedIncomingGraphEdges: GraphRailEdgeGroup[] = graphEdgeTypeOrder
    .map((type) => ({
      type,
      items: incomingGraphEdges.filter(({ edge }) => edge.edge_type === type),
    }))
    .filter((group) => group.items.length > 0);
  const selectedEdgeSemantics = selectedEdge ? getGraphEdgeSemantics(selectedEdge.edge_type) : null;
  const selectedEdgeDirection: GraphEdgeDirection | null = !focus?.node || !selectedEdge
    ? null
    : selectedEdge.source_node_id === focus.node.id
      ? 'outgoing'
      : selectedEdge.target_node_id === focus.node.id
        ? 'incoming'
        : null;
  const resolvedLayoutPreview =
    layoutPreview &&
    layoutPreview.nodeIds.every((nodeId) => navigationNodeIndex.has(nodeId))
      ? layoutPreview
      : null;
  const isLayoutPreviewActive = resolvedLayoutPreview != null;
  const layoutTargetLabel =
    layoutScope === 'region'
      ? selectedSphere?.name ?? 'регион'
      : focus?.node?.title ?? 'фокусный узел';

  const runMapCommand = (type: 'focus-node' | 'fit-graph' | 'reset-camera') => {
    setMapCommand({
      id: Date.now(),
      type,
    });
  };

  const clearMapTransientState = () => {
    setIsMapCreateMode(false);
    setIsEdgeConnectMode(false);
    setPendingEdgeSourceNodeId(null);
    setSelectedEdgeId(null);
    setLayoutPreview(null);
  };

  const toggleCreateNodeMode = useCallback(() => {
    if (isMapMutating) {
      return;
    }

    setIsMapCreateMode((current) => {
      const next = !current;
      if (next) {
        setIsEdgeConnectMode(false);
        setPendingEdgeSourceNodeId(null);
        setSelectedEdgeId(null);
      }
      return next;
    });
  }, [isMapMutating]);

  const toggleConnectEdgeMode = useCallback(() => {
    if (isMapMutating || !focus?.node) {
      return;
    }

    setIsEdgeConnectMode((current) => {
      const next = !current;
      if (next) {
        setIsMapCreateMode(false);
        setSelectedEdgeId(null);
        setPendingEdgeSourceNodeId(focus.node.id);
      } else {
        setPendingEdgeSourceNodeId(null);
      }
      return next;
    });
  }, [focus?.node, isMapMutating]);

  const isInteractiveTextElement = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
    ) != null;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const intent = resolveMapShortcutIntent(
        {
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
        },
        {
          isMapFocused,
          hasTextInputFocus:
            isInteractiveTextElement(event.target) || isInteractiveTextElement(document.activeElement),
          hasOverlayOpen: isEditorExpanded || isSummaryExpanded,
          hasFocusNode: Boolean(focus?.node),
          hasSelectedEdge: resolvedSelectedEdgeId != null,
        },
      );

      if (!intent) {
        return;
      }

      event.preventDefault();

      switch (intent) {
        case 'toggle-create-node':
          toggleCreateNodeMode();
          break;
        case 'toggle-connect-edge':
          toggleConnectEdgeMode();
          break;
        case 'toggle-snap-grid':
          if (!isMapMutating) {
            setIsSnapToGrid((current) => !current);
          }
          break;
        case 'focus-node':
          if (focus?.node) {
            runMapCommand('focus-node');
          }
          break;
        case 'fit-graph':
          runMapCommand('fit-graph');
          break;
        case 'reset-camera':
          runMapCommand('reset-camera');
          break;
        case 'refresh-map':
          if (!isLoading && !isMapMutating) {
            onRefresh();
          }
          break;
        case 'cancel-transients':
          clearMapTransientState();
          break;
        case 'delete-selected-edge':
          if (resolvedSelectedEdgeId != null && !isMapMutating) {
            void (async () => {
              const deleted = await onDeleteEdge(resolvedSelectedEdgeId);
              if (deleted) {
                setSelectedEdgeId(null);
              }
            })();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    focus?.node,
    isEditorExpanded,
    isLoading,
    isMapFocused,
    isMapMutating,
    isSummaryExpanded,
    onDeleteEdge,
    onRefresh,
    resolvedSelectedEdgeId,
    toggleConnectEdgeMode,
    toggleCreateNodeMode,
  ]);
  const handleCanvasNodeSelect = async (node: NavigationNodeSummary) => {
    if (!isEdgeConnectMode) {
      setSelectedEdgeId(null);
      onSelectNode(node);
      return;
    }

    setSelectedEdgeId(null);

    if (resolvedPendingEdgeSourceNodeId == null) {
      setPendingEdgeSourceNodeId(node.id);
      onSelectNode(node);
      return;
    }

    if (resolvedPendingEdgeSourceNodeId === node.id || isMapMutating) {
      return;
    }

    const created = await onCreateEdge({
      sourceNodeId: resolvedPendingEdgeSourceNodeId,
      targetNodeId: node.id,
      edgeType: pendingEdgeType,
    });

    if (created) {
      setPendingEdgeSourceNodeId(null);
      setIsEdgeConnectMode(false);
    }
  };

  const handlePreviewBulkLayout = () => {
    const preview = buildBulkLayoutPreview({
      snapshot,
      focus,
      scope: layoutScope,
      strategy: layoutStrategy,
      selectedSphereId,
      positionIndex: mapPositionIndex,
    });

    setLayoutPreview(preview);
  };

  const handleApplyBulkLayout = async () => {
    if (!resolvedLayoutPreview || isMapMutating) {
      return;
    }

    const applied = await onApplyBulkLayout(resolvedLayoutPreview.positions);
    if (applied) {
      setLayoutPreview(null);
    }
  };

  const hasMapNodes = mapModel.nodes.length > 0;
  const mapFocusTitle = focus?.node?.title ?? selectedSphere?.name ?? 'Пустая карта';
  const mapFocusPath = focus?.node
    ? `${focus.node.sphere_name} / ${focus.node.direction_name} / ${focus.node.skill_name}`
    : selectedSphere
      ? `${selectedSphere.name} / ${totalDirections} направл. / ${totalSkills} навык.`
      : 'Создайте стартовый набор, чтобы карта стала рабочей.';
  const modeLabel = !hasMapNodes
    ? 'Карта пуста: начните со стартового набора или нового узла'
    : isMapCreateMode
      ? 'Клик по карте создаст узел'
      : isEdgeConnectMode
        ? pendingEdgeSourceNode
          ? `Связь: ${pendingEdgeSourceNode.title} -> выберите цель`
          : 'Выберите источник связи'
        : isLayoutPreviewActive
          ? `Предпросмотр: ${resolvedLayoutPreview.nodeIds.length} узл.`
          : isMapFocused
            ? 'Клавиши карты активны'
            : 'Кликните по карте для клавиш';
  const mapStats = [
    { label: 'Узлы', value: workspaceNodes },
    { label: 'Шаги', value: workspaceActions },
    { label: 'Ветки', value: `${workspaceDirections}/${workspaceSkills}` },
    { label: 'Фокус', value: selectedAction?.title ?? focus?.node?.title ?? 'не выбран' },
  ];

  return (
    <div className="space-y-3">
      {error ? (
        <PixelSurface frame="accent" padding="md">
          <PixelText as="p" readable size="sm">
            {error}
          </PixelText>
        </PixelSurface>
      ) : null}

      <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <PixelSurface frame="panel" padding="md">
            <PixelPanelHeader
              eyebrow="Граф"
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <MapIcon size={20} className="text-[var(--pixel-accent)]" /> Карта задач
                </span>
              }
              description={`${mapFocusTitle} · ${mapFocusPath}`}
              aside={
                <div className="flex flex-wrap items-center gap-2">
                  <PixelButton
                    tone={isMapCreateMode ? 'accent' : 'ghost'}
                    onClick={toggleCreateNodeMode}
                    disabled={!selectedSkill || isMapMutating}
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                      <Plus size={16} /> {isMapCreateMode ? 'Отмена' : 'Новый узел'}
                    </PixelButton>
                  <PixelButton
                    tone={isEdgeConnectMode ? 'accent' : 'ghost'}
                    onClick={toggleConnectEdgeMode}
                    disabled={isMapMutating || !focus?.node}
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                      <GitBranch size={16} /> {isEdgeConnectMode ? 'Отмена связи' : 'Новая связь'}
                    </PixelButton>
                  <PixelButton
                    onClick={onRefresh}
                    disabled={isLoading || isMapMutating}
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
                  </PixelButton>
                </div>
              }
            />

            <div className="mt-3 space-y-3">
              <PixelSurface frame="inset" padding="xs">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {mapStats.map((item) => (
                    <div key={item.label} className="min-w-0 border-l border-[var(--pixel-line-soft)] pl-2 first:border-l-0">
                      <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0, lineHeight: 1 }}>
                        {item.label}
                      </PixelText>
                      <PixelText
                        as="p"
                        readable
                        size="sm"
                        style={{ marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.value}
                      </PixelText>
                    </div>
                  ))}
                </div>
              </PixelSurface>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
                <PixelSurface frame={isMapCreateMode || isEdgeConnectMode || isLayoutPreviewActive ? 'accent' : 'ghost'} padding="sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color={isMapCreateMode || isEdgeConnectMode || isLayoutPreviewActive ? 'accent' : 'textMuted'} uppercase>
                      {modeLabel}
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      {selectedSkill ? `Контекст: ${selectedSkill.name}` : 'Сначала выберите навык'}
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      {isSnapToGrid ? 'Сетка включена' : 'Сетка выключена'}
                    </PixelText>
                  </div>
                </PixelSurface>

                {isEdgeConnectMode ? (
                  <PixelSurface frame="ghost" padding="sm">
                    <div className="grid gap-2">
                      <PixelText as="span" size="xs" color="textMuted" uppercase>
                        Тип связи
                      </PixelText>
                      <PixelSelect
                        aria-label="Тип связи"
                        value={pendingEdgeType}
                        onChange={(event) => setPendingEdgeType(event.target.value as GraphEdgeType)}
                        disabled={isMapMutating}
                      >
                        {edgeTypeOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </PixelSelect>
                    </div>
                  </PixelSurface>
                ) : (
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <PixelSurface frame="ghost" padding="sm">
                        <div className="flex items-center justify-between gap-3">
                          <PixelText as="span" size="xs" color="textMuted" uppercase>
                            Размещение
                          </PixelText>
                          <PixelText as="span" size="xs" color="textMuted" uppercase>
                            {resolvedLayoutPreview ? `${resolvedLayoutPreview.nodeIds.length} узл.` : layoutTargetLabel}
                          </PixelText>
                        </div>
                      </PixelSurface>
                    </summary>
                    <PixelSurface frame="inset" padding="sm" className="mt-2">
                      <div className="grid gap-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <PixelSelect
                            label="Область"
                            value={layoutScope}
                            onChange={(event) => setLayoutScope(event.target.value as BulkLayoutScope)}
                            disabled={isMapMutating}
                          >
                            {bulkLayoutScopeOptions.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </PixelSelect>
                          <PixelSelect
                            label="Режим"
                            value={layoutStrategy}
                            onChange={(event) => setLayoutStrategy(event.target.value as BulkLayoutStrategy)}
                            disabled={isMapMutating}
                          >
                            {bulkLayoutStrategyOptions.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </PixelSelect>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <PixelButton
                            tone="ghost"
                            onClick={handlePreviewBulkLayout}
                            disabled={isMapMutating || (!selectedSphere && layoutScope === 'region') || (!focus?.node && layoutScope === 'focus-neighborhood')}
                            style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                          >
                            <Compass size={14} /> Показать
                          </PixelButton>
                          <PixelButton
                            tone="ghost"
                            onClick={() => setLayoutPreview(null)}
                            disabled={!resolvedLayoutPreview || isMapMutating}
                            style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                          >
                            <X size={14} /> Отменить
                          </PixelButton>
                          <PixelButton
                            tone="accent"
                            onClick={handleApplyBulkLayout}
                            disabled={!resolvedLayoutPreview || isMapMutating}
                            style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                          >
                            <Save size={14} /> Применить
                          </PixelButton>
                        </div>
                      </div>
                    </PixelSurface>
                  </details>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {mapMutationPendingAction === 'create-node' ? (
                  <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Сохраняю новый узел…
                    </PixelText>
                  </PixelSurface>
                ) : null}
                {mapMutationPendingAction === 'move-node' ? (
                  <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Сохраняю позицию узла…
                    </PixelText>
                  </PixelSurface>
                ) : null}
                {mapMutationPendingAction === 'create-edge' ? (
                  <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Сохраняю связь…
                    </PixelText>
                  </PixelSurface>
                ) : null}
                {mapMutationPendingAction === 'delete-edge' ? (
                  <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Удаляю связь…
                    </PixelText>
                  </PixelSurface>
                ) : null}
                {mapMutationPendingAction === 'layout' ? (
                  <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Применяю размещение…
                    </PixelText>
                  </PixelSurface>
                ) : null}
              </div>

              <PixelSurface frame="inset" padding="xxs" className="overflow-hidden">
                <GameMapCanvas
                  snapshot={snapshot}
                  focus={focus}
                  onSelectNode={handleCanvasNodeSelect}
                  onFocusChange={setIsMapFocused}
                  onSelectEdge={(edgeId) => {
                    setSelectedEdgeId(edgeId);
                    setIsMapCreateMode(false);
                  }}
                  mapCommand={mapCommand}
                  previewNodePositions={resolvedLayoutPreview?.positions ?? null}
                  canDragNodes={!isLayoutPreviewActive}
                  createMode={isMapCreateMode && !isMapMutating}
                  snapToGrid={isSnapToGrid}
                  selectedEdgeId={selectedEdgeId}
                  connectSourceNodeId={pendingEdgeSourceNodeId}
                  connectEdgeType={isEdgeConnectMode ? pendingEdgeType : null}
                  onToggleSnapToGrid={() => setIsSnapToGrid((current) => !current)}
                  onCreateNodeAt={async ({ x, y }) => {
                    if (!selectedSkill || isMapMutating) {
                      return false;
                    }

                    const created = await onCreateNodeAt({
                      skillId: selectedSkill.id,
                      existingNodeCount: selectedSkill.nodes.length,
                      x,
                      y,
                    });

                    if (created) {
                      setIsMapCreateMode(false);
                    }

                    return created;
                  }}
                  onMoveNode={isLayoutPreviewActive ? undefined : onMoveNode}
                  className="h-[520px] w-full overflow-hidden rounded-md border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] sm:h-[clamp(680px,calc(100dvh-220px),1040px)]"
                />
              </PixelSurface>

              <PixelSurface frame="ghost" padding="xs">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <PixelText as="span" size="xs" color="textMuted" uppercase>
                    Закрыт · серый
                  </PixelText>
                  <PixelText as="span" size="xs" color="textMuted" uppercase>
                    Доступен · бирюзовый
                  </PixelText>
                  <PixelText as="span" size="xs" color="textMuted" uppercase>
                    Активен · синий
                  </PixelText>
                  <PixelText as="span" size="xs" color="textMuted" uppercase>
                    Завершен · зеленый
                  </PixelText>
                  <PixelText as="span" size="xs" color="textMuted" uppercase>
                    На паузе · янтарный
                  </PixelText>
                </div>
              </PixelSurface>
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
                              renderNodeCard(node, focus?.node?.id === node.id, handleCanvasNodeSelect),
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
                    eyebrow="Инспектор"
                    title={editorDraft.title}
                    description={editorDraft.theme}
                    aside={
                      <PixelButton
                        tone="ghost"
                        onClick={() => setIsEditorExpanded(true)}
                        disabled={isEditorBusy}
                        style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                      >
                        <PencilLine size={14} /> Открыть
                      </PixelButton>
                    }
                  />

                  <PixelSurface frame="inset" padding="sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <PixelText as="span" size="xs" color="textMuted" uppercase>
                          node_{focus.node.id}
                        </PixelText>
                        <PixelText as="span" size="xs" color={isEditorDirty ? 'accent' : 'textMuted'} uppercase>
                          {isEditorDirty
                            ? 'есть черновик'
                            : focus.node.updated_at?.slice(0, 16).replace('T', ' ') ?? 'сохранено'}
                        </PixelText>
                      </div>
                      {(editorDraft.summary || focus.node.summary) ? (
                        <PixelText as="p" readable size="sm" color="textMuted">
                          {editorDraft.summary || focus.node.summary}
                        </PixelText>
                      ) : null}
                      <div className="grid grid-cols-2 gap-2">
                        <PixelStatCard label="Тип" value={typeLabel(editorDraft.type)} tone="ghost" compact />
                        <PixelStatCard label="Статус" value={statusLabel(editorDraft.status)} tone="ghost" compact />
                      </div>
                    </div>
                  </PixelSurface>

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

                      <div className="grid gap-2">
                        <PixelTextarea
                          label="Критерий завершения"
                          value={editorDraft.completionCriteria}
                          onChange={(event) => updateDraft({ completionCriteria: event.target.value })}
                          placeholder={completionCriteriaPreview || 'Что должно быть истинно, чтобы узел считался завершенным'}
                          disabled={isEditorBusy}
                        />
                        {!hasAuthoredCompletionCriteria && completionCriteriaPreview ? (
                          <PixelSurface frame="ghost" padding="xs">
                            <PixelText as="p" readable size="xs" color="textMuted" style={{ whiteSpace: 'pre-line' }}>
                              Вычислено сейчас: {completionCriteriaPreview}
                            </PixelText>
                          </PixelSurface>
                        ) : null}
                      </div>

                      <PixelSurface frame="inset" padding="sm">
                        <PixelText as="p" size="xs" color="textDim" uppercase>
                          Следующий шаг
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                          {editorDraft.nextStep || 'Пока нет.'}
                        </PixelText>
                      </PixelSurface>

                      <div className="grid gap-2">
                        <PixelTextarea
                          label="Примечание к графу"
                          value={editorDraft.links}
                          onChange={(event) => updateDraft({ links: event.target.value })}
                          placeholder={linksPreview || 'Необязательная заметка к связям и контексту узла'}
                          disabled={isEditorBusy}
                        />
                        {!hasAuthoredLinks && linksPreview ? (
                          <PixelSurface frame="ghost" padding="xs">
                            <PixelText as="p" readable size="xs" color="textMuted" style={{ whiteSpace: 'pre-line' }}>
                              Вычислено сейчас: {linksPreview}
                            </PixelText>
                          </PixelSurface>
                        ) : null}
                      </div>

                      <div className="grid gap-2">
                        <PixelTextarea
                          label="Награда"
                          value={editorDraft.reward}
                          onChange={(event) => updateDraft({ reward: event.target.value })}
                          placeholder={rewardPreview || 'Что откроется или что станет легче после завершения'}
                          disabled={isEditorBusy}
                        />
                        {!hasAuthoredReward && rewardPreview ? (
                          <PixelSurface frame="ghost" padding="xs">
                            <PixelText as="p" readable size="xs" color="textMuted" style={{ whiteSpace: 'pre-line' }}>
                              Вычислено сейчас: {rewardPreview}
                            </PixelText>
                          </PixelSurface>
                        ) : null}
                      </div>
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
                        Копия берет authored поля редактора, но если меняли тип или статус, сначала сохраните узел.
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
            <PixelSurface frame="panel" padding="sm">
              <PixelStack gap="sm">
                <PixelPanelHeader
                  eyebrow="Сводка узла"
                  title={editorDraft?.title ?? focus.node.title}
                  description={editorDraft?.theme ?? `${focus.node.sphere_name} / ${focus.node.direction_name} / ${focus.node.skill_name}`}
                  aside={
                    <PixelButton
                      tone="ghost"
                      onClick={() => setIsSummaryExpanded(true)}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Compass size={14} /> Открыть
                    </PixelButton>
                  }
                />

                <PixelMeter
                  value={completionValue}
                  max={100}
                  label="Прогресс узла"
                  tone={focus.session?.status === 'active' ? 'success' : 'accent'}
                  showValue
                />

                <div className="grid gap-2 grid-cols-3">
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

                {(editorDraft?.summary || focus.node.summary) ? (
                  <PixelText as="p" readable color="textMuted" size="xs">
                    {editorDraft?.summary || focus.node.summary}
                  </PixelText>
                ) : null}

                <div className="grid gap-2">
                  <PixelSurface frame="inset" padding="xs">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Критерий завершения
                    </PixelText>
                    <PixelText as="p" readable size="xs" style={{ marginTop: 6, whiteSpace: 'pre-line' }}>
                      {hasAuthoredCompletionCriteria
                        ? editorDraft?.completionCriteria
                        : completionCriteriaPreview || 'Пока не определен.'}
                    </PixelText>
                  </PixelSurface>
                  {!hasAuthoredCompletionCriteria && completionCriteriaPreview ? (
                    <PixelText as="p" readable color="textMuted" size="xs">
                      Рассчитано автоматически, пока поле не заполнено вручную.
                    </PixelText>
                  ) : null}

                  <PixelSurface frame="inset" padding="xs">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Заметка к графу
                    </PixelText>
                    <PixelText as="p" readable size="xs" style={{ marginTop: 6, whiteSpace: 'pre-line' }}>
                      {hasAuthoredLinks ? editorDraft?.links : linksPreview || 'Пока заметка не задана.'}
                    </PixelText>
                  </PixelSurface>
                  {!hasAuthoredLinks && linksPreview ? (
                    <PixelText as="p" readable color="textMuted" size="xs">
                      Рассчитано автоматически, пока поле не заполнено вручную.
                    </PixelText>
                  ) : null}

                  <PixelSurface frame="inset" padding="xs">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Награда
                    </PixelText>
                    <PixelText as="p" readable size="xs" style={{ marginTop: 6, whiteSpace: 'pre-line' }}>
                      {hasAuthoredReward ? editorDraft?.reward : rewardPreview || 'Пока не задана.'}
                    </PixelText>
                  </PixelSurface>
                  {!hasAuthoredReward && rewardPreview ? (
                    <PixelText as="p" readable color="textMuted" size="xs">
                      Рассчитано автоматически, пока поле не заполнено вручную.
                    </PixelText>
                  ) : null}
                </div>

                <PixelSurface frame="inset" padding="xs">
                  <PixelStack gap="xs">
                    <PixelText as="p" size="xs" color="textDim" uppercase>
                      Граф
                    </PixelText>

                    {selectedEdge && selectedEdgeSemantics ? (
                      <PixelSurface frame="ghost" padding="xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-2">
                            <PixelText as="p" readable size="xs">
                              {selectedEdgeSemantics.label}: {selectedEdgeSourceNode?.title ?? '\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a'} →{' '}
                              {selectedEdgeTargetNode?.title ?? '\u0426\u0435\u043b\u044c'}
                            </PixelText>
                            {selectedEdgeDirection ? (
                              <PixelText as="p" readable size="xs" color="textMuted">
                                {getGraphEdgeDirectionalCopy(selectedEdge.edge_type, selectedEdgeDirection)}
                              </PixelText>
                            ) : null}
                            <PixelText as="p" readable size="xs" color="textMuted">
                              {selectedEdgeSemantics.arrowMeaning}
                            </PixelText>
                          </div>
                          <PixelButton
                            tone="ghost"
                            onClick={async () => {
                              const deleted = await onDeleteEdge(selectedEdge.id);
                              if (deleted) {
                                setSelectedEdgeId(null);
                              }
                            }}
                            disabled={isMapMutating}
                            style={{ minHeight: 26, padding: '4px 8px', gap: 6 }}
                          >
                            <X size={12} /> {'\u0423\u0431\u0440\u0430\u0442\u044c'}
                          </PixelButton>
                        </div>
                      </PixelSurface>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-3">
                      {graphEdgeTypeOrder.map((type) => {
                        const semantics = getGraphEdgeSemantics(type);
                        return (
                          <PixelSurface key={type} frame="ghost" padding="xs">
                            <PixelText as="p" size="xs" color="textMuted" uppercase>
                              {semantics.label}
                            </PixelText>
                            <PixelText as="p" readable size="xs" style={{ marginTop: 4 }}>
                              {semantics.railSummary}
                            </PixelText>
                          </PixelSurface>
                        );
                      })}
                    </div>

                    <PixelSurface frame="ghost" padding="xs">
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        {'\u0418\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0435'}
                      </PixelText>
                      {groupedOutgoingGraphEdges.length === 0 ? (
                        <PixelText as="p" readable size="xs" style={{ marginTop: 6 }}>
                          {'\u041f\u043e\u043a\u0430 \u043d\u0435\u0442.'}
                        </PixelText>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {groupedOutgoingGraphEdges.map((group) => {
                            const semantics = getGraphEdgeSemantics(group.type);
                            return (
                              <div key={group.type} className="space-y-2">
                                <PixelText as="p" size="xs" color="textMuted" uppercase>
                                  {semantics.label} {'\u00b7'} {group.items.length}
                                </PixelText>
                                {group.items.map(({ edge, node }) => (
                                  <button
                                    key={edge.id}
                                    type="button"
                                    onClick={() => setSelectedEdgeId(edge.id)}
                                    className="w-full text-left"
                                  >
                                    <PixelSurface frame={selectedEdgeId === edge.id ? 'accent' : 'ghost'} padding="xs">
                                      <PixelText as="p" readable size="xs">
                                        {getGraphEdgeLineTitle(edge.edge_type, 'outgoing', node.title)}
                                      </PixelText>
                                      <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 4 }}>
                                        {getGraphEdgeDirectionalCopy(edge.edge_type, 'outgoing')}
                                      </PixelText>
                                    </PixelSurface>
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </PixelSurface>

                    <PixelSurface frame="ghost" padding="xs">
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        {'\u0412\u0445\u043e\u0434\u044f\u0449\u0438\u0435'}
                      </PixelText>
                      {groupedIncomingGraphEdges.length === 0 ? (
                        <PixelText as="p" readable size="xs" style={{ marginTop: 6 }}>
                          {'\u041f\u043e\u043a\u0430 \u043d\u0435\u0442.'}
                        </PixelText>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {groupedIncomingGraphEdges.map((group) => {
                            const semantics = getGraphEdgeSemantics(group.type);
                            return (
                              <div key={group.type} className="space-y-2">
                                <PixelText as="p" size="xs" color="textMuted" uppercase>
                                  {semantics.label} {'\u00b7'} {group.items.length}
                                </PixelText>
                                {group.items.map(({ edge, node }) => (
                                  <button
                                    key={edge.id}
                                    type="button"
                                    onClick={() => setSelectedEdgeId(edge.id)}
                                    className="w-full text-left"
                                  >
                                    <PixelSurface frame={selectedEdgeId === edge.id ? 'accent' : 'ghost'} padding="xs">
                                      <PixelText as="p" readable size="xs">
                                        {getGraphEdgeLineTitle(edge.edge_type, 'incoming', node.title)}
                                      </PixelText>
                                      <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 4 }}>
                                        {getGraphEdgeDirectionalCopy(edge.edge_type, 'incoming')}
                                      </PixelText>
                                    </PixelSurface>
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </PixelSurface>
                  </PixelStack>
                </PixelSurface>

                <PixelSurface frame="inset" padding="xs">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Следующий шаг
                  </PixelText>
                  <PixelText as="p" readable size="xs" style={{ marginTop: 6, lineHeight: 1.25 }}>
                    {selectedAction?.title ?? 'Пока нет активного шага.'}
                  </PixelText>
                </PixelSurface>
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
                description="Черновик меняется локально. Сохранение записывает узел в базу."
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
                    Сохранено
                  </PixelText>
                  <PixelText as="p" size="sm" style={{ marginTop: 4 }}>
                    {isEditorDirty
                      ? 'есть несохраненные правки'
                      : focus.node.updated_at?.slice(0, 16).replace('T', ' ') ?? 'сохранено'}
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

              <div className="grid gap-2">
                <PixelTextarea
                  label="Критерий завершения"
                  value={modalEditorDraft.completionCriteria}
                  onChange={(event) => updateDraft({ completionCriteria: event.target.value })}
                  placeholder={completionCriteriaPreview || 'Что должно быть истинно, чтобы узел считался завершенным'}
                  disabled={isEditorBusy}
                />
                {!hasAuthoredCompletionCriteria && completionCriteriaPreview ? (
                  <PixelSurface frame="ghost" padding="xs">
                    <PixelText as="p" readable size="xs" color="textMuted" style={{ whiteSpace: 'pre-line' }}>
                      Вычислено сейчас: {completionCriteriaPreview}
                    </PixelText>
                  </PixelSurface>
                ) : null}
              </div>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Следующий шаг
                </PixelText>
                <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                  {modalEditorDraft.nextStep || 'Пока нет.'}
                </PixelText>
              </PixelSurface>

              <div className="grid gap-2">
                <PixelTextarea
                  label="Примечание к графу"
                  value={modalEditorDraft.links}
                  onChange={(event) => updateDraft({ links: event.target.value })}
                  placeholder={linksPreview || 'Необязательная заметка к связям и контексту узла'}
                  disabled={isEditorBusy}
                />
                {!hasAuthoredLinks && linksPreview ? (
                  <PixelSurface frame="ghost" padding="xs">
                    <PixelText as="p" readable size="xs" color="textMuted" style={{ whiteSpace: 'pre-line' }}>
                      Вычислено сейчас: {linksPreview}
                    </PixelText>
                  </PixelSurface>
                ) : null}
              </div>

              <div className="grid gap-2">
                <PixelTextarea
                  label="Награда"
                  value={modalEditorDraft.reward}
                  onChange={(event) => updateDraft({ reward: event.target.value })}
                  placeholder={rewardPreview || 'Что откроется или что станет легче после завершения'}
                  disabled={isEditorBusy}
                />
                {!hasAuthoredReward && rewardPreview ? (
                  <PixelSurface frame="ghost" padding="xs">
                    <PixelText as="p" readable size="xs" color="textMuted" style={{ whiteSpace: 'pre-line' }}>
                      Вычислено сейчас: {rewardPreview}
                    </PixelText>
                  </PixelSurface>
                ) : null}
              </div>

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
                    Копия берет authored поля редактора, но если меняли тип или статус, сначала сохраните узел.
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

      {modalSummaryFocus ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-200/10 p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-white/10" onClick={() => setIsSummaryExpanded(false)} aria-hidden="true" />
          <PixelSurface
            frame="panel"
            padding="md"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[860px] overflow-auto"
          >
            <PixelStack gap="md">
              <PixelPanelHeader
                eyebrow="Сводка узла"
                title={editorDraft?.title ?? modalSummaryFocus.node.title}
                description={editorDraft?.theme ?? `${modalSummaryFocus.node.sphere_name} / ${modalSummaryFocus.node.direction_name} / ${modalSummaryFocus.node.skill_name}`}
                aside={
                  <PixelButton
                    tone="ghost"
                    onClick={() => setIsSummaryExpanded(false)}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <X size={14} /> Закрыть
                  </PixelButton>
                }
              />

              <PixelMeter
                value={completionValue}
                max={100}
                label="Прогресс узла"
                tone={modalSummaryFocus.session?.status === 'active' ? 'success' : 'accent'}
                showValue
              />

              <div className="grid gap-2 sm:grid-cols-3">
                <PixelStatCard label="Открыто" value={modalSummaryFocus.progress.openActions} tone="inset" compact />
                <PixelStatCard
                  label="Риск"
                  value={riskLabel(modalSummaryFocus.reviewState?.current_risk ?? 'none')}
                  tone="inset"
                  compact
                />
                <PixelStatCard
                  label="Статус"
                  value={statusLabel(editorDraft?.status ?? modalSummaryFocus.node.status)}
                  tone="inset"
                  compact
                />
              </div>

              {isEditorArchived ? (
                <PixelSurface frame="ghost" padding="xs">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    Узел уже в архиве. Операционные действия отключены.
                  </PixelText>
                </PixelSurface>
              ) : null}

              {(editorDraft?.summary || modalSummaryFocus.node.summary) ? (
                <PixelText as="p" readable color="textMuted" size="sm">
                  {editorDraft?.summary || modalSummaryFocus.node.summary}
                </PixelText>
              ) : null}

              <div className="grid gap-3 lg:grid-cols-3">
                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Критерий завершения
                  </PixelText>
                  <PixelText as="p" readable size="sm" style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
                    {hasAuthoredCompletionCriteria
                      ? editorDraft?.completionCriteria
                      : completionCriteriaPreview || 'Пока не определен.'}
                  </PixelText>
                  {!hasAuthoredCompletionCriteria && completionCriteriaPreview ? (
                    <PixelText as="p" readable color="textMuted" size="xs" style={{ marginTop: 8 }}>
                      Рассчитано автоматически, пока поле не заполнено вручную.
                    </PixelText>
                  ) : null}
                </PixelSurface>

                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Заметка к графу
                  </PixelText>
                  <PixelText as="p" readable size="sm" style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
                    {hasAuthoredLinks ? editorDraft?.links : linksPreview || 'Пока заметка не задана.'}
                  </PixelText>
                  {!hasAuthoredLinks && linksPreview ? (
                    <PixelText as="p" readable color="textMuted" size="xs" style={{ marginTop: 8 }}>
                      Рассчитано автоматически, пока поле не заполнено вручную.
                    </PixelText>
                  ) : null}
                </PixelSurface>

                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Награда
                  </PixelText>
                  <PixelText as="p" readable size="sm" style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
                    {hasAuthoredReward ? editorDraft?.reward : rewardPreview || 'Пока не задана.'}
                  </PixelText>
                  {!hasAuthoredReward && rewardPreview ? (
                    <PixelText as="p" readable color="textMuted" size="xs" style={{ marginTop: 8 }}>
                      Рассчитано автоматически, пока поле не заполнено вручную.
                    </PixelText>
                  ) : null}
                </PixelSurface>
              </div>

              <PixelSurface frame="inset" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase>
                  Открытые шаги
                </PixelText>
                <div className="mt-2 space-y-2">
                  {modalSummaryFocus.actions.length === 0 ? (
                    <PixelText as="p" readable color="textMuted" size="sm">
                      Пока нет открытых шагов.
                    </PixelText>
                  ) : (
                    modalSummaryFocus.actions.map((action) => (
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

              <div className="grid gap-3 lg:grid-cols-2">
                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Откроет дальше
                  </PixelText>
                  {modalSummaryFocus.dependents.length === 0 ? (
                    <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                      Пока ничего.
                    </PixelText>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {modalSummaryFocus.dependents.map((item) => (
                        <PixelActionCard key={item.id} title={item.title} meta={statusLabel(item.status)} />
                      ))}
                    </div>
                  )}
                </PixelSurface>

                <PixelSurface frame="inset" padding="sm">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Что мешает
                  </PixelText>
                  {modalSummaryFocus.dependencies.length === 0 ? (
                    <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                      Ничего.
                    </PixelText>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {modalSummaryFocus.dependencies.map((item) => (
                        <PixelActionCard key={item.id} title={item.title} meta={statusLabel(item.status)} />
                      ))}
                    </div>
                  )}
                </PixelSurface>
              </div>

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
                    modalSummaryFocus.session?.status === 'active' ||
                    !selectedAction
                  }
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                >
                  <Play size={16} />{' '}
                  {modalSummaryFocus.session?.status === 'active'
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
                    modalSummaryFocus.session?.status !== 'active'
                  }
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                >
                  <CheckCircle2 size={16} /> {isCompletingAction ? 'Сохраняю…' : 'Готово'}
                </PixelButton>

                <PixelButton
                  tone="ghost"
                  onClick={onCreateFollowUp}
                  disabled={!modalSummaryFocus.node || isEditorArchived}
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
                    modalSummaryFocus.session?.status !== 'active' ||
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
                    modalSummaryFocus.session?.status !== 'active' ||
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
                    modalSummaryFocus.session?.status !== 'active' ||
                    selectedAction.status === 'done'
                  }
                >
                  <Scissors size={16} /> {activeOutcomeAction === 'shrink' ? 'Упрощаю…' : 'Упростить'}
                </PixelButton>
              </div>
            </PixelStack>
          </PixelSurface>
        </div>
      ) : null}
    </div>
  );
};
