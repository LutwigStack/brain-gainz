import { useEffect, useState, type ReactNode } from 'react';
import {
  Archive,
  CheckCircle2,
  Compass,
  Copy,
  GitBranch,
  Map as MapIcon,
  PauseCircle,
  PencilLine,
  Plus,
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
  getGraphEdgeDirectionalCopy,
  getGraphEdgeLineTitle,
  getGraphEdgeSemantics,
  graphEdgeTypeOrder,
  type GraphEdgeDirection,
} from '../application/graph-edge-semantics';
import { resolveMapShortcutIntent } from '../application/map-shortcuts';
import { buildGraphHierarchyIndex } from '../application/graph-hierarchy';
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

const linearAlgebraTemplateValue = 'template:linear-algebra';
type MapCanvasMode = 'free' | 'layers';

interface CanvasContextMenuState {
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  nodeId: number | null;
  edgeId: number | null;
}

interface InlineNodeEditorState {
  mode: 'create' | 'rename';
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  value: string;
  nodeId?: number;
  skillId?: number;
  existingNodeCount?: number;
}

interface FloatingMapPanelState {
  screenX: number;
  screenY: number;
  nodeId?: number;
  edgeId?: number;
}

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
  onCreateStructure: (name: string) => Promise<void> | void;
  onCreateLinearAlgebraGraph: () => Promise<void> | void;
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
    title?: string;
  }) => Promise<boolean> | boolean;
  onCreateChildNodeAt: (input: {
    parentNodeId: number;
    skillId: number;
    existingNodeCount: number;
    x: number;
    y: number;
    title?: string;
  }) => Promise<boolean> | boolean;
  onMoveNode: (input: { nodeId: number; x: number; y: number }) => Promise<void> | void;
  onCreateEdge: (input: {
    sourceNodeId: number;
    targetNodeId: number;
    edgeType: GraphEdgeType;
  }) => Promise<boolean> | boolean;
  onDeleteEdge: (edgeId: number) => Promise<boolean> | boolean;
  onRenameNode: (input: { nodeId: number; title: string }) => Promise<boolean> | boolean;
  onArchiveNode: (input: { nodeId: number }) => Promise<boolean> | boolean;
  onDuplicateNode: (input: { nodeId: number; x: number; y: number }) => Promise<boolean> | boolean;
  onUndoMapMutation: () => Promise<boolean> | boolean;
  editorPendingAction: 'save' | 'duplicate' | 'archive' | null;
  editorNotice: string | null;
  mapMutationPendingAction:
    | 'create-node'
    | 'move-node'
    | 'create-edge'
    | 'delete-edge'
    | 'rename-node'
    | 'archive-node'
    | 'duplicate-node'
    | 'undo'
    | 'layout'
    | null;
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
  onCreateStructure,
  onCreateLinearAlgebraGraph,
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
  onCreateChildNodeAt,
  onMoveNode,
  onCreateEdge,
  onDeleteEdge,
  onRenameNode,
  onArchiveNode,
  onDuplicateNode,
  onUndoMapMutation,
  editorPendingAction,
  editorNotice,
  mapMutationPendingAction,
}: NavigationViewProps) => {
  const [editorOverride, setEditorOverride] = useState<Partial<NodeEditorDraft> | null>(null);
  const [editorOverrideNodeId, setEditorOverrideNodeId] = useState<number | null>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [mapCanvasMode, setMapCanvasMode] = useState<MapCanvasMode>('free');
  const [layerParentNodeId, setLayerParentNodeId] = useState<number | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<CanvasContextMenuState | null>(null);
  const [newStructureName, setNewStructureName] = useState('');
  const [nodeCreateTitle, setNodeCreateTitle] = useState('');
  const [inlineNodeEditor, setInlineNodeEditor] = useState<InlineNodeEditorState | null>(null);
  const [floatingMapPanel, setFloatingMapPanel] = useState<FloatingMapPanelState | null>(null);
  const [isCreatingStructure, setIsCreatingStructure] = useState(false);
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

  useEffect(() => {
    if (selectedSphereId == null) {
      return;
    }

    setLayerParentNodeId(null);
    setMapCanvasMode('free');
  }, [selectedSphereId]);

  const selectedAction = focus?.selectedAction ?? null;
  const totalDirections = selectedSphere?.directions.length ?? 0;
  const totalSkills =
    selectedSphere?.directions.reduce((sum, direction) => sum + direction.skills.length, 0) ?? 0;
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
  const mapModel = createGameViewModel(snapshot, focus, { visibleSphereId: selectedSphereId });
  const structureHierarchy = buildGraphHierarchyIndex(snapshot, selectedSphereId, focus?.node?.id ?? null);
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
  const findSphereEntryNode = (sphereId: number): NavigationNodeSummary | null => {
    const sphere = spheres.find((item) => item.id === sphereId);
    const nodes = sphere?.directions.flatMap((direction) => direction.skills.flatMap((skill) => skill.nodes)) ?? [];

    return (
      nodes.find((node) => node.type === 'project') ??
      nodes.find((node) => node.open_action_count > 0) ??
      nodes[0] ??
      null
    );
  };

  const handleCreateStructure = async () => {
    const title = newStructureName.trim();
    if (!title || isCreatingStructure || isLoading || isMapMutating) {
      return;
    }

    setIsCreatingStructure(true);
    clearMapTransientState();

    try {
      await onCreateStructure(title);
      setNewStructureName('');
      setMapCanvasMode('free');
    } finally {
      setIsCreatingStructure(false);
    }
  };

  const handleSelectStructure = async (value: string) => {
    if (value === linearAlgebraTemplateValue) {
      clearMapTransientState();
      await onCreateLinearAlgebraGraph();
      return;
    }

    const nextSphereId = Number(value);
    const entryNode = Number.isFinite(nextSphereId) ? findSphereEntryNode(nextSphereId) : null;

    if (!entryNode) {
      return;
    }

    clearMapTransientState();
    onSelectNode(entryNode);
  };

  const runMapCommand = (type: 'focus-node' | 'fit-graph' | 'reset-camera') => {
    setMapCommand({
      id: Date.now(),
      type,
    });
  };

  const clearMapTransientState = () => {
    setSelectedEdgeId(null);
    setCanvasContextMenu(null);
    setNodeCreateTitle('');
    setInlineNodeEditor(null);
    setFloatingMapPanel(null);
  };

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
          hasSelectedNode: Boolean(focus?.node),
          canUndo: true,
        },
      );

      if (!intent) {
        return;
      }

      event.preventDefault();

      switch (intent) {
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
        case 'archive-selected-node':
          if (focus?.node && !isMapMutating) {
            void onArchiveNode({ nodeId: focus.node.id });
          }
          break;
        case 'duplicate-selected-node':
          if (focus?.node && !isMapMutating) {
            void onDuplicateNode({
              nodeId: focus.node.id,
              x: (focus.node.x ?? 0) + 40,
              y: (focus.node.y ?? 0) + 40,
            });
          }
          break;
        case 'undo-map-mutation':
          if (!isMapMutating) {
            void onUndoMapMutation();
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
    onArchiveNode,
    onDuplicateNode,
    onRefresh,
    onUndoMapMutation,
    resolvedSelectedEdgeId,
  ]);
  const startInlineRename = (
    node: NavigationNodeSummary,
    input?: { screenX: number; screenY: number; worldX?: number; worldY?: number },
  ) => {
    setCanvasContextMenu(null);
    setNodeCreateTitle('');
    setFloatingMapPanel(null);
    setInlineNodeEditor({
      mode: 'rename',
      nodeId: node.id,
      screenX: input?.screenX ?? window.innerWidth / 2,
      screenY: input?.screenY ?? window.innerHeight / 2,
      worldX: input?.worldX ?? node.x ?? 0,
      worldY: input?.worldY ?? node.y ?? 0,
      value: node.title,
    });
  };

  const startInlineCreate = (input: { screenX: number; screenY: number; worldX: number; worldY: number }) => {
    if (!selectedSkill) {
      return;
    }

    setSelectedEdgeId(null);
    setCanvasContextMenu(null);
    setNodeCreateTitle('');
    setFloatingMapPanel(null);
    setInlineNodeEditor({
      mode: 'create',
      screenX: input.screenX,
      screenY: input.screenY,
      worldX: input.worldX,
      worldY: input.worldY,
      value: '',
      skillId: selectedSkill.id,
      existingNodeCount: selectedSkill.nodes.length,
    });
  };

  const commitInlineNodeEditor = async () => {
    if (!inlineNodeEditor || isMapMutating) {
      return;
    }

    const title = inlineNodeEditor.value.trim() || 'Новый узел';
    const saved =
      inlineNodeEditor.mode === 'rename' && inlineNodeEditor.nodeId != null
        ? await onRenameNode({ nodeId: inlineNodeEditor.nodeId, title })
        : inlineNodeEditor.mode === 'create' && inlineNodeEditor.skillId != null
          ? await onCreateNodeAt({
              skillId: inlineNodeEditor.skillId,
              existingNodeCount: inlineNodeEditor.existingNodeCount ?? 0,
              x: inlineNodeEditor.worldX,
              y: inlineNodeEditor.worldY,
              title,
            })
          : false;

    if (saved) {
      setInlineNodeEditor(null);
    }
  };

  const handleCanvasNodeSelect = async (
    node: NavigationNodeSummary,
    input?: { screenX: number; screenY: number },
  ) => {
    setSelectedEdgeId(null);
    setCanvasContextMenu(null);
    setInlineNodeEditor(null);
    if (input) {
      setFloatingMapPanel({
        nodeId: node.id,
        screenX: input.screenX,
        screenY: input.screenY,
      });
    }
    onSelectNode(node);
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
    : mapCanvasMode === 'layers'
      ? 'Слои: показан один родитель и его прямые дочерние узлы'
      : isMapFocused
        ? 'Свободный канвас: перетаскивайте поле мышью, колесо меняет масштаб'
        : 'Свободный канвас: правый клик открывает меню действий';
  const mapStats = [
    { label: 'Узлы', value: workspaceNodes },
    { label: 'Шаги', value: workspaceActions },
    { label: 'Ветки', value: `${workspaceDirections}/${workspaceSkills}` },
    { label: 'Фокус', value: selectedAction?.title ?? focus?.node?.title ?? 'не выбран' },
  ];
  const fallbackLayerParentId =
    focus?.node && structureHierarchy.entries.get(focus.node.id)?.childIds.length
      ? focus.node.id
      : focus?.node
        ? structureHierarchy.entries.get(focus.node.id)?.parentId ?? null
        : structureHierarchy.roots[0] ?? null;
  const effectiveLayerParentId =
    layerParentNodeId != null && structureHierarchy.entries.has(layerParentNodeId)
      ? layerParentNodeId
      : fallbackLayerParentId;
  const layerParentEntry =
    effectiveLayerParentId != null ? structureHierarchy.entries.get(effectiveLayerParentId) ?? null : null;
  const layerChildIds = layerParentEntry?.childIds ?? structureHierarchy.roots;
  const layerNodeIds =
    mapCanvasMode === 'layers'
      ? [...(layerParentEntry ? [layerParentEntry.node.id] : []), ...layerChildIds]
      : null;
  const layerPreviewPositions =
    mapCanvasMode === 'layers' && layerNodeIds
      ? Object.fromEntries(
          layerNodeIds.map((nodeId, index) => {
            if (layerParentEntry && nodeId === layerParentEntry.node.id) {
              return [nodeId, { x: -240, y: 0 }];
            }

            const childIndex = layerParentEntry ? index - 1 : index;
            const childCount = Math.max(1, layerChildIds.length);
            return [
              nodeId,
              {
                x: layerParentEntry ? 260 : 0,
                y: (childIndex - (childCount - 1) / 2) * 118,
              },
            ];
          }),
        )
      : null;
  const layerParentParentId = layerParentEntry?.parentId ?? null;
  const contextNode =
    canvasContextMenu?.nodeId != null ? navigationNodeIndex.get(canvasContextMenu.nodeId) ?? null : null;
  const contextEdge =
    canvasContextMenu?.edgeId != null
      ? graphEdges.find((edge) => edge.id === canvasContextMenu.edgeId) ?? null
      : null;
  const contextEdgeSemantics = contextEdge ? getGraphEdgeSemantics(contextEdge.edge_type) : null;
  const contextEdgeSourceNode =
    contextEdge != null ? navigationNodeIndex.get(contextEdge.source_node_id) ?? null : null;
  const contextEdgeTargetNode =
    contextEdge != null ? navigationNodeIndex.get(contextEdge.target_node_id) ?? null : null;
  const contextNodeHierarchy =
    contextNode != null ? structureHierarchy.entries.get(contextNode.id) ?? null : null;
  const floatingPanelNode =
    floatingMapPanel?.nodeId != null ? navigationNodeIndex.get(floatingMapPanel.nodeId) ?? null : null;
  const floatingPanelNodeHierarchy =
    floatingPanelNode != null ? structureHierarchy.entries.get(floatingPanelNode.id) ?? null : null;
  const floatingPanelEdge =
    floatingMapPanel?.edgeId != null
      ? graphEdges.find((edge) => edge.id === floatingMapPanel.edgeId) ?? null
      : null;
  const contextSkill =
    contextNode != null
      ? spheres
          .flatMap((sphere) => sphere.directions)
          .flatMap((direction) => direction.skills)
          .find((skill) => skill.id === contextNode.skill_id) ?? selectedSkill
      : selectedSkill;
  const handleCreateNodeFromContext = async () => {
    if (!canvasContextMenu || !contextSkill || isMapMutating) {
      return;
    }

    const created = await onCreateNodeAt({
      skillId: contextSkill.id,
      existingNodeCount: contextSkill.nodes.length,
      x: canvasContextMenu.worldX,
      y: canvasContextMenu.worldY,
      title: nodeCreateTitle.trim() || undefined,
    });

    if (created) {
      setCanvasContextMenu(null);
      setNodeCreateTitle('');
      setMapCanvasMode('free');
    }
  };
  const handleCreateChildNodeFromContext = async () => {
    if (!canvasContextMenu || !contextNode || !contextSkill || isMapMutating) {
      return;
    }

    const parentX = contextNode.x ?? canvasContextMenu.worldX;
    const parentY = contextNode.y ?? canvasContextMenu.worldY;
    const created = await onCreateChildNodeAt({
      parentNodeId: contextNode.id,
      skillId: contextSkill.id,
      existingNodeCount: contextSkill.nodes.length,
      x: parentX + 320,
      y: parentY + Math.max(0, contextNodeHierarchy?.childIds.length ?? 0) * 120,
      title: nodeCreateTitle.trim() || undefined,
    });

    if (created) {
      setNodeCreateTitle('');
      setMapCanvasMode('free');
    }
  };
  const openLayerAtNode = (nodeId: number) => {
    setMapCanvasMode('layers');
    setLayerParentNodeId(nodeId);
    setCanvasContextMenu(null);
    runMapCommand('fit-graph');
  };
  const renderStructureTreeNode = (nodeId: number): ReactNode => {
    const entry = structureHierarchy.entries.get(nodeId);
    if (!entry) {
      return null;
    }

    const isSelected = focus?.node?.id === nodeId;
    const hasChildren = entry.childIds.length > 0;
    const selectTreeNode = () => {
      void handleCanvasNodeSelect(entry.node);
    };
    const rowClassName = `w-full min-w-0 rounded border px-2 py-1.5 text-left transition ${
      isSelected
        ? 'border-[var(--pixel-accent)] bg-[rgba(94,234,212,0.14)] text-[var(--pixel-text)]'
        : 'border-[var(--pixel-line-soft)] bg-[rgba(8,16,29,0.48)] text-[var(--pixel-text-muted)] hover:border-[var(--pixel-line)] hover:text-[var(--pixel-text)]'
    }`;
    const rowContent = (
      <span className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate">{entry.node.title}</span>
        <span className="shrink-0 text-[10px] uppercase text-[var(--pixel-text-dim)]">
          {hasChildren ? `${entry.descendantCount} узл.` : statusLabel(entry.node.status)}
        </span>
      </span>
    );
    const leafRow = (
      <button
        type="button"
        onClick={selectTreeNode}
        className={rowClassName}
        style={{ marginLeft: entry.depth * 12, width: `calc(100% - ${entry.depth * 12}px)` }}
      >
        {rowContent}
      </button>
    );
    const parentRow = (
      <summary
        className={`list-none cursor-pointer ${rowClassName}`}
        onClick={selectTreeNode}
        style={{ marginLeft: entry.depth * 12, width: `calc(100% - ${entry.depth * 12}px)` }}
      >
        {rowContent}
      </summary>
    );

    if (!hasChildren) {
      return <div key={nodeId}>{leafRow}</div>;
    }

    return (
      <details key={nodeId} open={entry.depth <= 1 || entry.isOnSelectedPath} className="min-w-0">
        {parentRow}
        <div className="mt-1 grid gap-1">
          {entry.childIds.map((childId) => renderStructureTreeNode(childId))}
        </div>
      </details>
    );
  };

  return (
    <div className="space-y-3">
      {error ? (
        <PixelSurface frame="accent" padding="md">
          <PixelText as="p" readable size="sm">
            {error}
          </PixelText>
        </PixelSurface>
      ) : null}

      <section className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
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
                    onClick={onRefresh}
                    disabled={isLoading || isMapMutating}
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
                  </PixelButton>
                </div>
              }
            />

            <div className="mt-3 min-w-0 space-y-3">
              <PixelSurface frame="ghost" padding="sm">
                <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(220px,360px)_minmax(0,1fr)] md:items-end">
                  <PixelSelect
                    label="Структура"
                    value={selectedSphereId ?? ''}
                    onChange={(event) => handleSelectStructure(event.target.value)}
                    disabled={isLoading || isMapMutating}
                  >
                    {spheres.length === 0 ? (
                      <option value="">Выберите структуру</option>
                    ) : null}
                    {spheres.every((sphere) => sphere.name !== 'Алгебра I') ? (
                      <option value={linearAlgebraTemplateValue}>Алгебра I · базовый шаблон</option>
                    ) : null}
                    {spheres.map((sphere) => (
                      <option key={sphere.id} value={sphere.id}>
                        {sphere.name} · {sphere.node_count} узл.
                      </option>
                    ))}
                  </PixelSelect>
                  <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(180px,1fr)_auto] sm:items-end">
                    <PixelInput
                      id="new-structure-name"
                      label="Новая структура"
                      type="text"
                      value={newStructureName}
                      onChange={(event) => setNewStructureName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void handleCreateStructure();
                        }
                      }}
                      disabled={isLoading || isMapMutating || isCreatingStructure}
                      placeholder="English Foundations"
                    />
                    <PixelButton
                      tone="accent"
                      onClick={() => {
                        void handleCreateStructure();
                      }}
                      disabled={!newStructureName.trim() || isLoading || isMapMutating || isCreatingStructure}
                      style={{ minHeight: 34, padding: '7px 10px', gap: 6 }}
                    >
                      <Plus size={14} /> {isCreatingStructure ? 'Создаю...' : 'Создать'}
                    </PixelButton>
                  </div>
                  <PixelText as="p" readable size="xs" color="textMuted" className="md:col-span-2" style={{ margin: 0 }}>
                    Выбор переключает карту на записанную структуру; базовый шаблон создается при первом выборе.
                  </PixelText>
                </div>
              </PixelSurface>

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

              <PixelSurface frame="ghost" padding="sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Вид карты
                    </PixelText>
                    <PixelButton
                      tone={mapCanvasMode === 'free' ? 'accent' : 'ghost'}
                      onClick={() => {
                        setMapCanvasMode('free');
                        setCanvasContextMenu(null);
                      }}
                      disabled={!hasMapNodes}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <MapIcon size={14} /> Свободный канвас
                    </PixelButton>
                    <PixelButton
                      tone={mapCanvasMode === 'layers' ? 'accent' : 'ghost'}
                      onClick={() => {
                        setMapCanvasMode('layers');
                        setLayerParentNodeId(fallbackLayerParentId);
                        setCanvasContextMenu(null);
                        runMapCommand('fit-graph');
                      }}
                      disabled={!hasMapNodes}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <GitBranch size={14} /> Слои
                    </PixelButton>
                  </div>
                  <PixelText as="span" size="xs" color="textMuted" uppercase>
                    {modeLabel}
                  </PixelText>
                </div>
              </PixelSurface>

              {mapCanvasMode === 'layers' ? (
                <PixelSurface frame="inset" padding="sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Слой
                    </PixelText>
                    <PixelText as="span" readable size="sm">
                      {layerParentEntry?.node.title ?? selectedSphere?.name ?? 'Корень структуры'}
                    </PixelText>
                    <PixelButton
                      tone="ghost"
                      onClick={() => setLayerParentNodeId(layerParentParentId)}
                      disabled={!layerParentEntry || layerParentParentId == null}
                      style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
                    >
                      <Target size={13} /> Уровень выше
                    </PixelButton>
                  </div>
                  {layerChildIds.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {layerChildIds.map((childId) => {
                        const child = structureHierarchy.entries.get(childId);
                        if (!child) {
                          return null;
                        }

                        return (
                          <span key={childId} className="inline-flex items-center gap-1">
                            <PixelButton
                              tone={child.childIds.length ? 'ghost' : 'panel'}
                              onClick={() => {
                                void handleCanvasNodeSelect(child.node);
                              }}
                              style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
                            >
                              {child.node.title}
                            </PixelButton>
                            {child.childIds.length ? (
                              <PixelButton
                                tone="ghost"
                                onClick={() => openLayerAtNode(child.node.id)}
                                title={`Открыть слой: ${child.node.title}`}
                                style={{ minHeight: 28, padding: '5px 7px', gap: 4 }}
                              >
                                <GitBranch size={13} /> Слой
                              </PixelButton>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </PixelSurface>
              ) : null}

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

              <PixelSurface frame="inset" padding="xxs" className="min-w-0 overflow-hidden">
                  <GameMapCanvas
                    snapshot={snapshot}
                    focus={focus}
                    visibleSphereId={selectedSphereId}
                    canvasMode={mapCanvasMode}
                    visibleNodeIds={layerNodeIds}
                    onSelectNode={handleCanvasNodeSelect}
                    onFocusChange={setIsMapFocused}
                    onSelectEdge={(edgeId) => {
                      setSelectedEdgeId(edgeId);
                      setCanvasContextMenu(null);
                      setInlineNodeEditor(null);
                    }}
                    onCreateChildNodeAt={async (input) => {
                      const parentNode = navigationNodeIndex.get(input.parentNodeId);
                      if (!parentNode || isMapMutating) {
                        return false;
                      }

                      const parentSkill =
                        spheres
                          .flatMap((sphere) => sphere.directions)
                          .flatMap((direction) => direction.skills)
                          .find((skill) => skill.id === parentNode.skill_id) ?? selectedSkill;
                      if (!parentSkill) {
                        return false;
                      }

                      const created = await onCreateChildNodeAt({
                        parentNodeId: input.parentNodeId,
                        skillId: parentSkill.id,
                        existingNodeCount: parentSkill.nodes.length,
                        x: input.x,
                        y: input.y,
                        title: undefined,
                      });
                      if (created) {
                        setCanvasContextMenu(null);
                        setInlineNodeEditor(null);
                        setFloatingMapPanel(null);
                        setSelectedEdgeId(null);
                        setMapCanvasMode('free');
                      }
                      return created;
                    }}
                    onCreateEdge={async (input) => {
                      if (isMapMutating) {
                        return false;
                      }

                      const created = await onCreateEdge(input);
                      if (created) {
                        setCanvasContextMenu(null);
                        setSelectedEdgeId(null);
                      }
                      return created;
                    }}
                    mapCommand={mapCommand}
                    previewNodePositions={layerPreviewPositions}
                    canDragNodes={mapCanvasMode === 'free'}
                    createMode={false}
                    snapToGrid={false}
                    selectedEdgeId={selectedEdgeId}
                    connectSourceNodeId={null}
                    connectEdgeType={null}
                    onCanvasContextMenu={(menu) => {
                      setCanvasContextMenu(menu);
                      setNodeCreateTitle('');
                      setInlineNodeEditor(null);
                      setFloatingMapPanel(null);
                    }}
                    onCanvasDoubleClick={(input) => {
                      if (mapCanvasMode === 'free') {
                        startInlineCreate(input);
                      }
                    }}
                    onNodeDoubleClick={(input) => {
                      void handleCanvasNodeSelect(input.node, {
                        screenX: input.screenX,
                        screenY: input.screenY,
                      });
                      startInlineRename(input.node, input);
                    }}
                    onCanvasPointerDown={(hit) => {
                      if (hit.button === 0 && hit.nodeId == null && hit.edgeId == null) {
                        setCanvasContextMenu(null);
                        setNodeCreateTitle('');
                        setInlineNodeEditor(null);
                        setFloatingMapPanel(null);
                      } else if (hit.button === 0 && hit.nodeId != null) {
                        setFloatingMapPanel({
                          nodeId: hit.nodeId,
                          screenX: hit.screenX,
                          screenY: hit.screenY,
                        });
                      } else if (hit.button === 0 && hit.edgeId != null) {
                        setFloatingMapPanel({
                          edgeId: hit.edgeId,
                          screenX: hit.screenX,
                          screenY: hit.screenY,
                        });
                      }
                    }}
                    onMoveNode={mapCanvasMode === 'free' ? onMoveNode : undefined}
                  className="h-[480px] min-w-0 max-w-full overflow-hidden rounded-md border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] sm:h-[clamp(680px,calc(100dvh-220px),1040px)]"
                />
              </PixelSurface>

              {inlineNodeEditor ? (
                <form
                  className="fixed z-50 min-w-[240px]"
                  style={{
                    left: Math.min(inlineNodeEditor.screenX + 12, window.innerWidth - 270),
                    top: Math.max(8, Math.min(inlineNodeEditor.screenY - 18, window.innerHeight - 90)),
                  }}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void commitInlineNodeEditor();
                  }}
                >
                  <PixelSurface frame="panel" padding="xs">
                    <input
                      autoFocus
                      value={inlineNodeEditor.value}
                      onChange={(event) =>
                        setInlineNodeEditor((current) =>
                          current ? { ...current, value: event.target.value } : current,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          event.preventDefault();
                          setInlineNodeEditor(null);
                        }
                      }}
                      disabled={isMapMutating}
                      placeholder="Новый узел"
                      className="w-full rounded border border-[var(--pixel-line)] bg-[var(--pixel-panel-inset)] px-2 py-1.5 text-sm font-semibold text-[var(--pixel-text)] outline-none focus:border-[var(--pixel-accent)]"
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <PixelButton
                        type="button"
                        tone="ghost"
                        onClick={() => setInlineNodeEditor(null)}
                        style={{ minHeight: 26, padding: '4px 8px' }}
                      >
                        Esc
                      </PixelButton>
                      <PixelButton
                        type="submit"
                        tone="accent"
                        disabled={isMapMutating}
                        style={{ minHeight: 26, padding: '4px 8px' }}
                      >
                        Enter
                      </PixelButton>
                    </div>
                  </PixelSurface>
                </form>
              ) : null}

              {floatingMapPanel && (floatingPanelNode || floatingPanelEdge) && !inlineNodeEditor && !canvasContextMenu ? (
                <div
                  className="fixed z-40"
                  style={{
                    left: Math.min(floatingMapPanel.screenX + 12, window.innerWidth - 280),
                    top: Math.max(8, Math.min(floatingMapPanel.screenY + 12, window.innerHeight - 120)),
                  }}
                >
                  <PixelSurface frame="panel" padding="xxs" fullWidth={false}>
                    <div className="flex items-center gap-1">
                      {floatingPanelNode ? (
                        <>
                          <PixelButton
                            tone="ghost"
                            onClick={() =>
                              startInlineRename(floatingPanelNode, {
                                screenX: floatingMapPanel.screenX,
                                screenY: floatingMapPanel.screenY,
                              })
                            }
                            style={{ minHeight: 28, padding: '5px 7px' }}
                            title="Переименовать"
                          >
                            <PencilLine size={13} />
                          </PixelButton>
                          <PixelButton
                            tone="ghost"
                            onClick={async () => {
                              const duplicated = await onDuplicateNode({
                                nodeId: floatingPanelNode.id,
                                x: (floatingPanelNode.x ?? 0) + 40,
                                y: (floatingPanelNode.y ?? 0) + 40,
                              });
                              if (duplicated) {
                                setFloatingMapPanel(null);
                              }
                            }}
                            disabled={isMapMutating}
                            style={{ minHeight: 28, padding: '5px 7px' }}
                            title="Дублировать"
                          >
                            <Copy size={13} />
                          </PixelButton>
                          {floatingPanelNodeHierarchy?.childIds.length ? (
                            <PixelButton
                              tone="ghost"
                              onClick={() => openLayerAtNode(floatingPanelNode.id)}
                              style={{ minHeight: 28, padding: '5px 7px' }}
                              title="Открыть слой"
                            >
                              <GitBranch size={13} />
                            </PixelButton>
                          ) : null}
                          <PixelButton
                            tone="ghost"
                            onClick={async () => {
                              const archived = await onArchiveNode({ nodeId: floatingPanelNode.id });
                              if (archived) {
                                setFloatingMapPanel(null);
                              }
                            }}
                            disabled={isMapMutating}
                            style={{ minHeight: 28, padding: '5px 7px', color: 'var(--pixel-danger)' }}
                            title="Архивировать"
                          >
                            <Archive size={13} />
                          </PixelButton>
                        </>
                      ) : null}
                      {floatingPanelEdge ? (
                        <PixelButton
                          tone="ghost"
                          onClick={async () => {
                            const deleted = await onDeleteEdge(floatingPanelEdge.id);
                            if (deleted) {
                              setSelectedEdgeId(null);
                              setFloatingMapPanel(null);
                            }
                          }}
                          disabled={isMapMutating}
                          style={{ minHeight: 28, padding: '5px 7px', color: 'var(--pixel-danger)' }}
                          title="Удалить связь"
                        >
                          <X size={13} />
                        </PixelButton>
                      ) : null}
                    </div>
                  </PixelSurface>
                </div>
              ) : null}

              {canvasContextMenu ? (
                <div
                  className="fixed z-50 min-w-[210px]"
                  style={{
                    left: Math.min(canvasContextMenu.screenX, window.innerWidth - 230),
                    top: Math.max(8, Math.min(canvasContextMenu.screenY, window.innerHeight - 380)),
                    maxHeight: 'calc(100dvh - 16px)',
                    overflowY: 'auto',
                  }}
                >
                  <PixelSurface frame="panel" padding="xs">
                    <div className="grid gap-1">
                      {contextEdge && contextEdgeSemantics ? (
                        <>
                          <PixelText as="p" readable size="sm" style={{ margin: '2px 4px 6px' }}>
                            {contextEdgeSemantics.label}: {contextEdgeSourceNode?.title ?? 'Источник'} →{' '}
                            {contextEdgeTargetNode?.title ?? 'Цель'}
                          </PixelText>
                          <PixelButton
                            tone="ghost"
                            onClick={() => {
                              setSelectedEdgeId(contextEdge.id);
                              setCanvasContextMenu(null);
                            }}
                            style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                          >
                            Выбрать связь
                          </PixelButton>
                          <PixelButton
                            tone="ghost"
                            onClick={async () => {
                              const deleted = await onDeleteEdge(contextEdge.id);
                              if (deleted) {
                                setSelectedEdgeId(null);
                                setCanvasContextMenu(null);
                              }
                            }}
                            disabled={isMapMutating}
                            style={{
                              justifyContent: 'flex-start',
                              minHeight: 30,
                              padding: '6px 8px',
                              color: 'var(--pixel-danger)',
                            }}
                          >
                            Разъединить
                          </PixelButton>
                        </>
                      ) : null}
                      {contextNode ? (
                        <>
                          <PixelText as="p" readable size="sm" style={{ margin: '2px 4px 6px' }}>
                            {contextNode.title}
                          </PixelText>
                          <PixelButton
                            tone="ghost"
                            onClick={() => {
                              void handleCanvasNodeSelect(contextNode);
                            }}
                            style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                          >
                            Выбрать
                          </PixelButton>
                          {contextNodeHierarchy?.childIds.length ? (
                            <PixelButton
                              tone="ghost"
                              onClick={() => openLayerAtNode(contextNode.id)}
                              style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                            >
                              Открыть слой
                            </PixelButton>
                          ) : null}
                          <PixelButton
                            tone="ghost"
                            onClick={() => {
                              onSelectNode(contextNode);
                              setCanvasContextMenu(null);
                              setIsEditorExpanded(true);
                            }}
                            style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                          >
                            Редактировать
                          </PixelButton>
                          <PixelButton
                            tone="ghost"
                            onClick={() => {
                              onSelectNode(contextNode);
                              setCanvasContextMenu(null);
                              setIsSummaryExpanded(true);
                            }}
                            style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                          >
                            Сводка
                          </PixelButton>
                        </>
                      ) : null}
                      {!contextEdge ? (
                        <>
                          <PixelInput
                            id="map-node-create-title"
                            label="Название узла"
                            type="text"
                            value={nodeCreateTitle}
                            onChange={(event) => setNodeCreateTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                void handleCreateNodeFromContext();
                              }
                            }}
                            disabled={!contextSkill || isMapMutating}
                            placeholder="Sound System"
                          />
                          {contextNode ? (
                            <PixelButton
                              tone="accent"
                              onClick={() => {
                                void handleCreateChildNodeFromContext();
                              }}
                              disabled={!contextSkill || isMapMutating}
                              style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                            >
                              Создать дочерний узел
                            </PixelButton>
                          ) : null}
                          <PixelButton
                            tone="accent"
                          onClick={() => {
                            void handleCreateNodeFromContext();
                          }}
                          disabled={!contextSkill || isMapMutating}
                          style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                        >
                          Создать узел здесь
                        </PixelButton>
                        </>
                      ) : null}
                      <PixelButton
                        tone="ghost"
                        onClick={() => setCanvasContextMenu(null)}
                        style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                      >
                        Закрыть
                      </PixelButton>
                    </div>
                  </PixelSurface>
                </div>
              ) : null}

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

          <PixelSurface frame="panel" padding="lg" className="min-w-0">
            <PixelPanelHeader
              eyebrow={
                <span className="flex items-center gap-2">
                  <GitBranch size={14} className="text-[var(--pixel-accent)]" /> Дерево структуры
                </span>
              }
              title={selectedSphere?.name ?? 'Структура карты'}
              description={
                selectedSphere
                  ? 'Разделы, темы и листья выбранной структуры.'
                  : 'Пока пусто. Сначала создайте стартовый набор.'
              }
            />

            {!selectedSphere ? (
              <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                Пока пусто. Сначала создайте стартовый набор.
              </PixelText>
            ) : structureHierarchy.roots.length > 0 ? (
              <div className="mt-3 grid min-w-0 gap-1">
                {structureHierarchy.roots.map((nodeId) => renderStructureTreeNode(nodeId))}
              </div>
            ) : (
              <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 16 }}>
                В этой структуре пока нет узлов.
              </PixelText>
            )}
          </PixelSurface>
        </div>

        <div className="min-w-0 max-w-full self-start xl:sticky xl:top-3 xl:justify-self-end xl:w-[340px] 2xl:w-[360px]">
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
                        <PencilLine size={14} /> Редактировать
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
                      <Compass size={14} /> Сводка
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
            role="dialog"
            aria-modal="true"
            aria-label="Редактор узла"
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
            role="dialog"
            aria-modal="true"
            aria-label="Сводка узла"
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
