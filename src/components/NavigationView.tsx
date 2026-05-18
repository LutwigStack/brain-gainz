import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Compass,
  Copy,
  Eye,
  GitBranch,
  Map as MapIcon,
  PauseCircle,
  PencilLine,
  Plus,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Scissors,
  ShieldCheck,
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
import { ReferenceAssetImage } from '../assets/ReferenceAssetImage';
import {
  isCoreCsFoundations,
  resolveRouteLandmarkAsset,
} from '../assets/referenceStyleAssets';
import { GameMapCanvas } from '../game';
import {
  getGraphEdgeSemantics,
} from '../application/graph-edge-semantics';
import {
  resolveCanvasCreatePosition,
  resolveCanvasCreateRoute,
  type CanvasCreateMode,
} from '../application/map-create-routing';
import { shouldAutoDisableRouteFilter } from '../application/learner-map-overview';
import { resolveMapShortcutIntent } from '../application/map-shortcuts';
import { buildGraphHierarchyIndex } from '../application/graph-hierarchy';
import {
  getAssessmentAnswerInputCopy,
  getAssessmentAttemptResultCopy,
  getAssessmentCheckTypeLabel,
  getAssessmentEvidenceHint,
  getAssessmentFailedAttemptState,
  getAssessmentExpectedInputText,
  getAssessmentPrimaryActionLabel,
  getAssessmentResultIdLabel,
  getAssessmentResultIdPlaceholder,
  getAssessmentValidationState,
} from './assessment-copy';
import {
  canDuplicateNodeEditorDraft,
  createNodeEditorDraft,
  emptyCheckMetadataDraft,
  getCheckMetadataCriterionHint,
  getCheckMetadataCriterionLabel,
  getCheckMetadataPreview,
  getCheckMetadataValidationMessage,
  getNodeEditorCompletionCriteriaPreview,
  getNodeEditorLinksPreview,
  getNodeEditorRewardPreview,
  hasNodeEditorPersistedChanges,
  type NodeEditorDraft,
  type CheckMetadataKind,
} from './navigation-editor-draft';
import {
  canRunAuthorAction,
  canShowAuthorSurface,
  requiresAuthorConfirmation,
  type AuthorAction,
  type WorkspaceMode,
} from './mode-boundary';
import {
  getNavigationMapShellClassName,
  shouldShowNavigationInspectorRail,
  shouldUseFocusedLearnerLessonScreen,
} from './learner-lesson-layout';
import type {
  BarrierType,
  GraphEdgeType,
  NavigationGraphEdge,
  NavigationNodeSummary,
  NavigationSnapshot,
  CareerSpecialization,
  MasteryLevel,
  TodaySnapshot,
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

const checkMetadataKindOptions: Array<{ value: CheckMetadataKind; label: string }> = [
  { value: 'none', label: 'Нет проверки' },
  { value: 'exact', label: 'Точный ответ' },
  { value: 'number', label: 'Число' },
  { value: 'contains', label: 'Содержит термины' },
  { value: 'checklist', label: 'Чек-лист' },
  { value: 'manual_strict', label: 'Ручная строгая' },
  { value: 'llm_assisted', label: 'ИИ-проверка' },
];

const statusLabel = (value: string) => statusLabels[value] ?? value;
const typeLabel = (value: string) => typeLabels[value] ?? value;
const riskLabel = (value: string) => riskLabels[value] ?? value;

const masteryLevelItems: Array<{ value: MasteryLevel; label: string; short: string }> = [
  { value: 'seen', label: 'Видел', short: '1' },
  { value: 'understood', label: 'Понял', short: '2' },
  { value: 'remembered', label: 'Помню', short: '3' },
  { value: 'applied', label: 'Применил', short: '4' },
  { value: 'confirmed', label: 'Подтвердил', short: '5' },
  { value: 'retained', label: 'Удержал', short: '6' },
];

const masteryLabel = (value: string | null | undefined) =>
  masteryLevelItems.find((item) => item.value === value)?.label ?? 'Нет';

const linearAlgebraTemplateValue = 'template:linear-algebra';
type MapCanvasMode = 'free' | 'layers';
type MapEditTool = 'select' | 'create' | 'connect';
type InspectorMode = 'overview' | 'route' | 'assessment' | 'graph';
type LayerParentSelection = number | 'top' | null;

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
  createMode?: CanvasCreateMode;
  sourceCanvasMode?: MapCanvasMode;
  layerParentNodeIdAtStart?: number | null;
  nodeId?: number;
  skillId?: number;
  existingNodeCount?: number;
}

interface FloatingMapPanelState {
  screenX: number;
  screenY: number;
  edgeId?: number;
}

interface PendingEdgeSelection {
  sourceNodeId: number;
  targetNodeId: number;
  edgeType: GraphEdgeType;
}

interface PendingNodeArchiveState {
  nodeId: number;
  title: string;
  source: 'map' | 'context-menu' | 'inspector' | 'editor' | 'shortcut';
  draft?: NodeEditorDraft | null;
}

interface GraphRailEdgeEntry {
  edge: NavigationGraphEdge;
  node: NavigationNodeSummary;
  direction: 'incoming' | 'outgoing';
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
  onOpenToday: () => void;
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
  onArchiveEditor: (draft: NodeEditorDraft) => Promise<boolean> | boolean;
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
  }) => Promise<boolean | number> | boolean | number;
  onDeleteEdge: (edgeId: number) => Promise<boolean> | boolean;
  onRenameNode: (input: { nodeId: number; title: string }) => Promise<boolean> | boolean;
  onArchiveNode: (input: { nodeId: number }) => Promise<boolean> | boolean;
  onRestoreNode: (input: { nodeId: number }) => Promise<boolean> | boolean;
  onDuplicateNode: (input: { nodeId: number; x: number; y: number }) => Promise<boolean> | boolean;
  onUndoMapMutation: () => Promise<boolean> | boolean;
  onMarkSelfMastery: (masteryLevel: MasteryLevel) => Promise<void> | void;
  onSubmitAssessment: (input: {
    targetMasteryLevel: MasteryLevel;
    checkMethod: 'strict' | 'llm_assisted';
    passed: boolean;
    submittedAnswer?: string;
    feedbackSummary?: string;
    evidencePayload?: Record<string, unknown> | null;
    checklistResults?: Record<string, boolean> | null;
    usesAutomaticStrictCheck?: boolean;
  }) => Promise<void> | void;
  inspectorModeRequest?: { mode: InspectorMode; requestId: number } | null;
  onInspectorModeChange?: (mode: InspectorMode) => void;
  currentSpecialization: CareerSpecialization | null;
  currentRoute: TodaySnapshot['route'] | null;
  routeFilterRequestId?: number | null;
  onRouteFilterRequestHandled?: () => void;
  onAddNodeToRoute: (input: { nodeId: number; requiredMasteryLevel: MasteryLevel }) => Promise<void> | void;
  onUpdateRouteNode: (input: {
    routeNodeId: number;
    requiredMasteryLevel?: MasteryLevel;
    routeOrder?: number;
    routeStage?: string | null;
    routeLabel?: string | null;
    isRequired?: boolean;
  }) => Promise<void> | void;
  onReorderRouteNodes: (input: { firstRouteNodeId: number; secondRouteNodeId: number }) => Promise<void> | void;
  onRemoveRouteNode: (input: { routeNodeId: number }) => Promise<void> | void;
  workspaceMode?: WorkspaceMode;
  editorPendingAction: 'save' | 'duplicate' | 'archive' | null;
  masteryPendingAction: 'self-mark' | 'assessment' | null;
  routeMutationPending: boolean;
  editorNotice: string | null;
  mapMutationPendingAction:
    | 'create-node'
    | 'move-node'
    | 'create-edge'
    | 'delete-edge'
    | 'rename-node'
    | 'archive-node'
    | 'restore-node'
    | 'duplicate-node'
    | 'undo'
    | 'layout'
    | null;
  canUndoMapMutation: boolean;
  isSystemCampaign: boolean;
  branchFilterSkillId?: number | null;
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
  onOpenToday,
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
  onRestoreNode,
  onDuplicateNode,
  onUndoMapMutation,
  onMarkSelfMastery,
  onSubmitAssessment,
  inspectorModeRequest = null,
  onInspectorModeChange,
  currentSpecialization,
  currentRoute,
  routeFilterRequestId = null,
  onRouteFilterRequestHandled,
  onAddNodeToRoute,
  onUpdateRouteNode,
  onReorderRouteNodes,
  onRemoveRouteNode,
  workspaceMode = 'learner',
  editorPendingAction,
  masteryPendingAction,
  routeMutationPending,
  editorNotice,
  mapMutationPendingAction,
  canUndoMapMutation,
  isSystemCampaign,
  branchFilterSkillId = null,
}: NavigationViewProps) => {
  const canUseAuthorTools = canShowAuthorSurface(workspaceMode, 'node-editing');
  const canEditRoutes = canShowAuthorSurface(workspaceMode, 'route-authoring');
  const canEditGraph = canShowAuthorSurface(workspaceMode, 'graph-editing');
  const canEditChecks = canShowAuthorSurface(workspaceMode, 'check-metadata');
  const canArchiveNodes = canRunAuthorAction(workspaceMode, 'archive-node');
  const canDeleteEdges = canRunAuthorAction(workspaceMode, 'delete-edge');
  const canCreateEdges = canRunAuthorAction(workspaceMode, 'create-edge');
  const canCreateNodes = canRunAuthorAction(workspaceMode, 'create-node');
  const canMoveNodes = canRunAuthorAction(workspaceMode, 'move-node');
  const nodeArchiveRequiresConfirmation = requiresAuthorConfirmation('archive-node');
  const hasCoreCsAssets = isCoreCsFoundations(currentSpecialization);
  const [editorOverride, setEditorOverride] = useState<Partial<NodeEditorDraft> | null>(null);
  const [editorOverrideNodeId, setEditorOverrideNodeId] = useState<number | null>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [mapCanvasMode, setMapCanvasMode] = useState<MapCanvasMode>('free');
  const [layerParentNodeId, setLayerParentNodeId] = useState<LayerParentSelection>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<CanvasContextMenuState | null>(null);
  const [newStructureName, setNewStructureName] = useState('');
  const [nodeCreateTitle, setNodeCreateTitle] = useState('');
  const [inlineNodeEditor, setInlineNodeEditor] = useState<InlineNodeEditorState | null>(null);
  const [floatingMapPanel, setFloatingMapPanel] = useState<FloatingMapPanelState | null>(null);
  const [expandedTreeNodeIds, setExpandedTreeNodeIds] = useState<Set<number>>(new Set());
  const [isCreatingStructure, setIsCreatingStructure] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>('overview');
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [assessmentTargetLevel, setAssessmentTargetLevel] = useState<MasteryLevel>('understood');
  const [assessmentCheckMethod, setAssessmentCheckMethod] = useState<'strict' | 'llm_assisted'>('strict');
  const [assessmentAnswer, setAssessmentAnswer] = useState('');
  const [assessmentResultId, setAssessmentResultId] = useState('');
  const [assessmentEvidence, setAssessmentEvidence] = useState('');
  const [assessmentChecklistValues, setAssessmentChecklistValues] = useState<Record<string, boolean>>({});
  const [routeRequiredLevel, setRouteRequiredLevel] = useState<MasteryLevel>('confirmed');
  const [routeStageDrafts, setRouteStageDrafts] = useState<Record<number, string>>({});
  const [isRouteFilterEnabled, setIsRouteFilterEnabled] = useState(workspaceMode !== 'author');
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null);
  const [pendingEdgeSelection, setPendingEdgeSelection] = useState<PendingEdgeSelection | null>(null);
  const [mapEditTool, setMapEditTool] = useState<MapEditTool>('select');
  const [connectSourceNodeId, setConnectSourceNodeId] = useState<number | null>(null);
  const [connectEdgeType, setConnectEdgeType] = useState<GraphEdgeType>('supports');
  const [pendingNodeArchive, setPendingNodeArchive] = useState<PendingNodeArchiveState | null>(null);
  const [isMapFocused, setIsMapFocused] = useState(false);
  const [hasManualMapViewport, setHasManualMapViewport] = useState(false);
  const [mapCommand, setMapCommand] = useState<{
    id: number;
    type: 'focus-node' | 'fit-graph' | 'fit-overview' | 'center-layer' | 'reset-camera';
  } | null>(null);
  const hasInitializedTreeExpansion = useRef(false);
  const handledRouteFilterRequestId = useRef<number | null>(null);
  const handledVisibleMapFitKey = useRef<string | null>(null);
  const requestedInspectorMode = inspectorModeRequest?.mode ?? null;
  const requestedInspectorRequestId = inspectorModeRequest?.requestId ?? null;

  useEffect(() => {
    if (!requestedInspectorMode) {
      return;
    }

    setInspectorMode(requestedInspectorMode);
    setIsInspectorCollapsed(false);
  }, [requestedInspectorMode, requestedInspectorRequestId]);

  const handleInspectorModeChange = (mode: InspectorMode) => {
    setInspectorMode(mode);
    onInspectorModeChange?.(mode);
  };

  useEffect(() => {
    if ((!canEditRoutes && inspectorMode === 'route') || (!canEditGraph && inspectorMode === 'graph')) {
      setInspectorMode('overview');
      onInspectorModeChange?.('overview');
    }
  }, [canEditGraph, canEditRoutes, inspectorMode, onInspectorModeChange]);

  useEffect(() => {
    if (canUseAuthorTools) {
      return;
    }

    setIsEditorExpanded(false);
    setCanvasContextMenu(null);
    setInlineNodeEditor(null);
    setFloatingMapPanel(null);
    setSelectedEdgeId(null);
    setPendingEdgeSelection(null);
    setMapEditTool('select');
    setConnectSourceNodeId(null);
    setPendingNodeArchive(null);
    setMapCanvasMode('free');
    setLayerParentNodeId(null);
    setIsRouteFilterEnabled(true);
  }, [canUseAuthorTools]);

  const clearMapTransientUi = () => {
    setCanvasContextMenu(null);
    setNodeCreateTitle('');
    setInlineNodeEditor(null);
    setFloatingMapPanel(null);
    setSelectedEdgeId(null);
    setPendingEdgeSelection(null);
    setMapEditTool('select');
    setConnectSourceNodeId(null);
  };

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
  const branchFilterSkill =
    branchFilterSkillId == null
      ? null
      : spheres
          .flatMap((sphere) =>
            sphere.directions.flatMap((direction) =>
              direction.skills.map((skill) => ({ sphere, direction, skill })),
            ),
          )
          .find((entry) => entry.skill.id === branchFilterSkillId) ?? null;
  const selectedSphereId = branchFilterSkill?.sphere.id ?? focus?.node?.sphere_id ?? spheres[0]?.id ?? null;
  const selectedSphere = spheres.find((sphere) => sphere.id === selectedSphereId) ?? spheres[0] ?? null;
  const selectedDirectionId = branchFilterSkill?.direction.id ?? focus?.node?.direction_id ?? selectedSphere?.directions[0]?.id ?? null;
  const selectedDirection =
    selectedSphere?.directions.find((direction) => direction.id === selectedDirectionId) ??
    selectedSphere?.directions[0] ??
    null;
  const selectedSkillId = branchFilterSkill?.skill.id ?? focus?.node?.skill_id ?? selectedDirection?.skills[0]?.id ?? null;
  const selectedSkill =
    selectedDirection?.skills.find((skill) => skill.id === selectedSkillId) ??
    selectedDirection?.skills[0] ??
    null;

  useEffect(() => {
    if (selectedSphereId == null) {
      return;
    }

    setHasManualMapViewport(false);
    setLayerParentNodeId(null);
    setMapCanvasMode('free');
  }, [selectedSphereId]);

  const selectedAction = focus?.selectedAction ?? null;
  const totalDirections = selectedSphere?.directions.length ?? 0;
  const totalSkills =
    selectedSphere?.directions.reduce((sum, direction) => sum + direction.skills.length, 0) ?? 0;
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
  const modalEditorDraft = canUseAuthorTools && isEditorExpanded && focus?.node && editorDraft ? editorDraft : null;
  const modalSummaryFocus = isSummaryExpanded && focus?.node ? focus : null;
  const showInlineEditor = canUseAuthorTools && isEditorExpanded && focus == null;
  const completionCriteriaPreview =
    focus != null && editorDraft != null ? getNodeEditorCompletionCriteriaPreview(focus, editorDraft) : '';
  const linksPreview =
    focus != null && editorDraft != null ? getNodeEditorLinksPreview(focus, editorDraft) : '';
  const rewardPreview =
    focus != null && editorDraft != null ? getNodeEditorRewardPreview(focus, editorDraft) : '';
  const hasAuthoredCompletionCriteria = Boolean(editorDraft?.completionCriteria.trim());
  const hasAuthoredLinks = Boolean(editorDraft?.links.trim());
  const hasAuthoredReward = Boolean(editorDraft?.reward.trim());
  const resetAssessmentDraft = () => {
    setAssessmentAnswer('');
    setAssessmentResultId('');
    setAssessmentEvidence('');
    setAssessmentChecklistValues({});
  };

  const openAssessmentStep = () => {
    resetAssessmentDraft();
    handleInspectorModeChange('assessment');
  };

  const renderLearnerLessonPanel = (nodeFocus: NodeFocusSnapshot) => {
    if (canUseAuthorTools) {
      return null;
    }

    const lessonAction = nodeFocus.selectedAction;
    const session = nodeFocus.session;
    const hasActiveDailySession = session?.status === 'active';
    const matchesNode = (nodeId?: number | null) => nodeId != null && Number(nodeId) === Number(nodeFocus.node.id);
    const matchesAction = (actionId?: number | null) =>
      lessonAction?.id != null && actionId != null && Number(actionId) === Number(lessonAction.id);
    const primarySessionMatches =
      session?.primary_action_id != null ? matchesAction(session.primary_action_id) : matchesNode(session?.primary_node_id);
    const selectedSessionTaskMatches =
      session?.tasks?.some(
        (task) =>
          task.outcome === 'pending' &&
          matchesNode(task.nodeId) &&
          (task.actionId != null ? matchesAction(task.actionId) : true),
      ) ?? false;
    const activeSession = Boolean(hasActiveDailySession && (primarySessionMatches || selectedSessionTaskMatches));
    const latestAttempt = nodeFocus.mastery?.latestAttempt ?? null;
    const routeRequirement = nodeFocus.mastery?.routeRequirement ?? null;
    const canStartLesson = Boolean(lessonAction) && !hasActiveDailySession && !isStartingSession && !isEditorArchived;

    let stateLabel = 'старт';
    let title = lessonAction?.title ?? nodeFocus.node.title;
    let description = lessonAction?.details ?? nodeFocus.node.summary ?? 'Начните занятие, затем пройдите проверку.';
    let buttonLabel = isStartingSession ? 'Запускаю...' : 'Начать занятие';
    let buttonIcon: ReactNode = <Play size={15} />;
    let buttonDisabled = !canStartLesson;
    let buttonAction = onStartSession;

    if (latestAttempt) {
      stateLabel = latestAttempt.passed ? 'результат' : 'повтор';
      title = latestAttempt.passed ? 'Зачтено' : 'Не зачтено';
      description = latestAttempt.passed
        ? 'Today покажет следующий шаг.'
        : 'Попробуйте еще раз или вернитесь в Today.';
      buttonLabel = latestAttempt.passed ? 'Следующий шаг' : 'Повторить проверку';
      buttonIcon = latestAttempt.passed ? <ChevronRight size={15} /> : <RotateCcw size={15} />;
      buttonDisabled = false;
      buttonAction = latestAttempt.passed ? onOpenToday : openAssessmentStep;
    } else if (activeSession) {
      stateLabel = 'занятие';
      buttonLabel = 'Перейти к проверке';
      buttonIcon = <ShieldCheck size={15} />;
      buttonDisabled = isEditorArchived;
      buttonAction = openAssessmentStep;
    } else if (hasActiveDailySession) {
      stateLabel = 'сейчас';
      title = 'Уже идет занятие';
      description = 'Вернитесь в Today и продолжите текущий шаг.';
      buttonLabel = 'Вернуться в Сегодня';
      buttonIcon = <ChevronRight size={15} />;
      buttonDisabled = false;
      buttonAction = onOpenToday;
    }

    return (
      <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
        <PixelStack gap="xs">
          <div className="flex items-center justify-between gap-2">
            <PixelText as="span" size="xs" color="textDim" uppercase>
              Учебный путь
            </PixelText>
            <PixelText as="span" size="xs" color={activeSession ? 'success' : 'accent'} uppercase>
              {stateLabel}
            </PixelText>
          </div>
          <PixelText as="p" readable size="sm" style={{ margin: 0 }}>
            {title}
          </PixelText>
          <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
            {description}
          </PixelText>
          {routeRequirement ? (
            <PixelText as="p" readable size="xs" color="accent" style={{ margin: 0 }}>
              Нужно: {masteryLabel(routeRequirement.required_mastery_level)}
            </PixelText>
          ) : null}
          <PixelButton
            tone="accent"
            onClick={() => void buttonAction()}
            disabled={buttonDisabled}
            fullWidth
            style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
          >
            {buttonIcon} {buttonLabel}
          </PixelButton>
          {!lessonAction && !activeSession && !latestAttempt ? (
            <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
              Нет открытого действия. Вернитесь в Today или выберите другой узел.
            </PixelText>
          ) : null}
        </PixelStack>
      </PixelSurface>
    );
  };

  useEffect(() => {
    const routeTarget = focus?.mastery?.routeRequirement?.required_mastery_level;
    setAssessmentTargetLevel(routeTarget ?? 'understood');
    setRouteRequiredLevel(routeTarget ?? 'confirmed');
    setAssessmentCheckMethod(focus?.mastery?.check?.checkMethod === 'llm_assisted' ? 'llm_assisted' : 'strict');
    setAssessmentAnswer('');
    setAssessmentResultId('');
    setAssessmentEvidence('');
    setAssessmentChecklistValues({});
  }, [
    focus?.node?.id,
    focus?.mastery?.routeRequirement?.required_mastery_level,
    focus?.mastery?.check?.checkMethod,
  ]);

  useEffect(() => {
    setAssessmentAnswer('');
    setAssessmentResultId('');
    setAssessmentEvidence('');
    setAssessmentChecklistValues({});
  }, [focus?.mastery?.latestAttempt?.id]);

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
  const graphEdges = useMemo(() => snapshot?.edges ?? [], [snapshot?.edges]);
  useEffect(() => {
    if (!pendingEdgeSelection) {
      return;
    }

    const createdEdge = graphEdges.find(
      (edge) =>
        edge.source_node_id === pendingEdgeSelection.sourceNodeId &&
        edge.target_node_id === pendingEdgeSelection.targetNodeId &&
        edge.edge_type === pendingEdgeSelection.edgeType,
    );

    if (!createdEdge) {
      return;
    }

    setSelectedEdgeId(createdEdge.id);
    setPendingEdgeSelection(null);
  }, [graphEdges, pendingEdgeSelection]);

  const archivedNodes = snapshot?.archivedNodes ?? [];
  const selectedStructureArchivedNodes =
    selectedSphereId == null
      ? archivedNodes
      : archivedNodes.filter((node) => node.sphere_id === selectedSphereId);
  const visibleSkillId = branchFilterSkill?.skill.id ?? null;
  const routeItems = useMemo(() => currentRoute?.items ?? [], [currentRoute]);
  const routeItemsByNodeId = useMemo(() => {
    const items = new globalThis.Map<number, NonNullable<TodaySnapshot['route']>['items'][number]>();
    for (const item of routeItems) {
      if (item.node_id != null) {
        items.set(item.node_id, item);
      }
    }
    return items;
  }, [routeItems]);
  const routeNodeIds = useMemo(() => new Set(routeItemsByNodeId.keys()), [routeItemsByNodeId]);
  const isRouteFilterActive = isRouteFilterEnabled && routeNodeIds.size > 0;
  const routeNodeMetadata = useMemo(
    () =>
      routeItems
        .filter((item) => item.node_id != null)
        .map((item) => ({
          nodeId: item.node_id as number,
          routeNodeId: item.id,
          isComplete: item.is_complete,
          isCurrentTarget: currentRoute?.nextItem?.id === item.id,
          isLocked: item.is_actionable === false,
          isWeakSpot: Boolean(item.weak_spot_reason),
          routeOrder: item.route_order,
          routeStage: item.route_stage,
          requiredMasteryLevel: item.required_mastery_level,
          currentMasteryRank: item.current_mastery_rank,
        })),
    [currentRoute?.nextItem?.id, routeItems],
  );
  const routeStageDraftValue = (item: NonNullable<TodaySnapshot['route']>['items'][number]) =>
    Object.prototype.hasOwnProperty.call(routeStageDrafts, item.id)
      ? routeStageDrafts[item.id]
      : item.route_stage ?? '';
  const saveRouteStageDraft = (item: NonNullable<TodaySnapshot['route']>['items'][number]) => {
    const nextStage = routeStageDraftValue(item).trim();
    const currentStage = item.route_stage ?? '';
    if (nextStage !== currentStage) {
      void onUpdateRouteNode({
        routeNodeId: item.id,
        routeStage: nextStage || null,
      });
    }
    setRouteStageDrafts((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });
  };
  const moveRouteItem = async (itemIndex: number, direction: -1 | 1) => {
    const currentItem = routeItems[itemIndex];
    const targetItem = routeItems[itemIndex + direction];
    if (!currentItem || !targetItem || routeMutationPending || currentSpecialization?.status !== 'active') {
      return;
    }

    await onReorderRouteNodes({
      firstRouteNodeId: currentItem.id,
      secondRouteNodeId: targetItem.id,
    });
  };
  const selectRouteItemOnMap = (item: NonNullable<TodaySnapshot['route']>['items'][number]) => {
    if (item.node_id == null) {
      return;
    }
    const node = navigationNodeIndex.get(item.node_id);
    if (!node) {
      return;
    }
    setMapCanvasMode('free');
    setLayerParentNodeId(null);
    setIsRouteFilterEnabled(true);
    clearMapTransientState();
    void handleCanvasNodeSelect(node);
  };
  const baseMapModel = createGameViewModel(snapshot, focus, {
    visibleSphereId: isRouteFilterActive ? null : selectedSphereId,
    visibleSkillId: isRouteFilterActive ? null : visibleSkillId,
    visibleNodeIds: isRouteFilterActive ? routeNodeIds : null,
  });
  const mapModel = {
    ...baseMapModel,
    nodes: baseMapModel.nodes.map((node) => {
      const routeItem = routeItemsByNodeId.get(node.id);
      return routeItem
        ? {
            ...node,
            isRouteNode: true,
            isRouteComplete: routeItem.is_complete,
            isRouteLocked: routeItem.is_actionable === false,
            isWeakRouteNode: Boolean(routeItem.weak_spot_reason),
            routeRequiredMasteryLevel: routeItem.required_mastery_level,
            routeCurrentMasteryRank: routeItem.current_mastery_rank,
          }
        : node;
    }),
  };
  useEffect(() => {
    if (shouldAutoDisableRouteFilter({ canUseAuthorTools, isRouteFilterEnabled, routeNodeCount: routeNodeIds.size })) {
      setIsRouteFilterEnabled(false);
    }
  }, [canUseAuthorTools, isRouteFilterEnabled, routeNodeIds.size]);
  const structureHierarchy = useMemo(
    () => buildGraphHierarchyIndex(snapshot, selectedSphereId, focus?.node?.id ?? null),
    [snapshot, selectedSphereId, focus?.node?.id],
  );
  useEffect(() => {
    hasInitializedTreeExpansion.current = false;
    setExpandedTreeNodeIds(new Set());
  }, [selectedSphereId]);
  useEffect(() => {
    setExpandedTreeNodeIds((current) => {
      const next = new Set<number>();
      let changed = false;

      for (const nodeId of current) {
        if (structureHierarchy.entries.has(nodeId)) {
          next.add(nodeId);
        } else {
          changed = true;
        }
      }

      if (!hasInitializedTreeExpansion.current) {
        for (const [nodeId, entry] of structureHierarchy.entries) {
          if (entry.depth <= 1) {
            next.add(nodeId);
          }
        }
        hasInitializedTreeExpansion.current = true;
        changed = true;
      }

      for (const [nodeId, entry] of structureHierarchy.entries) {
        if (entry.isOnSelectedPath && !next.has(nodeId)) {
          next.add(nodeId);
          changed = true;
        }
      }

      return changed || next.size !== current.size ? next : current;
    });
  }, [structureHierarchy]);
  const resolvedSelectedEdgeId =
    selectedEdgeId != null && graphEdges.some((edge) => edge.id === selectedEdgeId) ? selectedEdgeId : null;
  const selectedEdge =
    resolvedSelectedEdgeId != null ? graphEdges.find((edge) => edge.id === resolvedSelectedEdgeId) ?? null : null;
  const focusHierarchyEntry =
    focus?.node != null ? structureHierarchy.entries.get(focus.node.id) ?? null : null;
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
  const selectedEdgeSemantics = selectedEdge ? getGraphEdgeSemantics(selectedEdge.edge_type) : null;
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
      setMapCanvasMode('free');
      setLayerParentNodeId(null);
      setIsRouteFilterEnabled(false);
      await onCreateLinearAlgebraGraph();
      return;
    }

    const nextSphereId = Number(value);
    const entryNode = Number.isFinite(nextSphereId) ? findSphereEntryNode(nextSphereId) : null;

    if (!entryNode) {
      return;
    }

    clearMapTransientState();
    setMapCanvasMode('free');
    setLayerParentNodeId(null);
    setIsRouteFilterEnabled(false);
    onSelectNode(entryNode);
  };

  const runMapCommand = useCallback((type: 'focus-node' | 'fit-graph' | 'fit-overview' | 'center-layer' | 'reset-camera') => {
    setHasManualMapViewport(false);
    setMapCommand({
      id: Date.now(),
      type,
    });
  }, []);

  const clearMapTransientState = () => {
    setSelectedEdgeId(null);
    setCanvasContextMenu(null);
    setNodeCreateTitle('');
    setInlineNodeEditor(null);
    setFloatingMapPanel(null);
    setPendingEdgeSelection(null);
  };

  const requestNodeArchive = (input: PendingNodeArchiveState) => {
    if (!canArchiveNodes || !nodeArchiveRequiresConfirmation) {
      return;
    }

    setPendingNodeArchive(input);
    setCanvasContextMenu(null);
  };

  const confirmAuthorAction = useCallback((action: AuthorAction, message: string) => {
    if (!requiresAuthorConfirmation(action)) {
      return true;
    }

    return globalThis.confirm(message);
  }, []);

  const requestFocusedNodeArchive = (source: PendingNodeArchiveState['source']) => {
    if (!focus?.node || isMapMutating || isEditorArchived) {
      return;
    }

    requestNodeArchive({
      nodeId: focus.node.id,
      title: editorDraft?.title || focus.node.title,
      source,
    });
  };

  const confirmPendingNodeArchive = async () => {
    if (!pendingNodeArchive || isMapMutating || isEditorBusy) {
      return;
    }

    const archived =
      pendingNodeArchive.source === 'editor' && pendingNodeArchive.draft
        ? await onArchiveEditor(pendingNodeArchive.draft)
        : await onArchiveNode({ nodeId: pendingNodeArchive.nodeId });

    if (archived) {
      setPendingNodeArchive(null);
      clearMapTransientState();
      setIsEditorExpanded(false);
      setIsSummaryExpanded(false);
    }
  };

  const cancelPendingNodeArchive = () => {
    setPendingNodeArchive(null);
  };

  useEffect(() => {
    if (routeFilterRequestId == null || routeFilterRequestId === handledRouteFilterRequestId.current) {
      return;
    }

    handledRouteFilterRequestId.current = routeFilterRequestId;
    onRouteFilterRequestHandled?.();

    if (routeNodeIds.size === 0) {
      return;
    }

    setMapCanvasMode('free');
    setLayerParentNodeId(null);
    setIsRouteFilterEnabled(true);
    clearMapTransientState();
    runMapCommand('fit-overview');
  }, [onRouteFilterRequestHandled, routeFilterRequestId, routeNodeIds.size, runMapCommand]);

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
      if (pendingNodeArchive != null) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setPendingNodeArchive(null);
        }
        return;
      }

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
          hasOverlayOpen: isEditorExpanded || isSummaryExpanded || pendingNodeArchive != null,
          hasFocusNode: Boolean(focus?.node),
          hasSelectedEdge: resolvedSelectedEdgeId != null,
          hasSelectedNode: Boolean(focus?.node),
          canUndo: canUndoMapMutation,
          canUseAuthorTools,
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
          if (resolvedSelectedEdgeId != null && canDeleteEdges && !isMapMutating) {
            if (!confirmAuthorAction('delete-edge', 'Удалить выбранную связь с карты?')) {
              break;
            }

            void (async () => {
              const deleted = await onDeleteEdge(resolvedSelectedEdgeId);
              if (deleted) {
                setSelectedEdgeId(null);
              }
            })();
          }
          break;
        case 'archive-selected-node':
          if (focus?.node && !isMapMutating && !isEditorArchived) {
            setPendingNodeArchive({
              nodeId: focus.node.id,
              title: editorDraft?.title || focus.node.title,
              source: 'shortcut',
            });
            setCanvasContextMenu(null);
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
    canDeleteEdges,
    canUndoMapMutation,
    canUseAuthorTools,
    confirmAuthorAction,
    isEditorArchived,
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
    pendingNodeArchive,
    resolvedSelectedEdgeId,
    runMapCommand,
    editorDraft?.title,
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
    if (!selectedSkill && !(mapCanvasMode === 'layers' && layerParentEntry)) {
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
      createMode: mapCanvasMode === 'layers' ? 'layer-child' : 'free-node',
      sourceCanvasMode: mapCanvasMode,
      layerParentNodeIdAtStart: mapCanvasMode === 'layers' ? layerParentEntry?.node.id ?? null : null,
      skillId: selectedSkill?.id,
      existingNodeCount: selectedSkill?.nodes.length ?? 0,
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
        : inlineNodeEditor.mode === 'create'
          ? await createNodeFromCanvasPoint(
              {
                worldX: inlineNodeEditor.worldX,
                worldY: inlineNodeEditor.worldY,
              },
              title,
              inlineNodeEditor.createMode ?? 'free-node',
              undefined,
              inlineNodeEditor.sourceCanvasMode ?? mapCanvasMode,
              inlineNodeEditor.layerParentNodeIdAtStart ?? null,
            )
          : false;

    if (saved) {
      setInlineNodeEditor(null);
    }
  };

  const handleCanvasNodeSelect = async (node: NavigationNodeSummary) => {
    setSelectedEdgeId(null);
    setCanvasContextMenu(null);
    setInlineNodeEditor(null);
    setFloatingMapPanel(null);

    if (mapEditTool === 'connect') {
      if (connectSourceNodeId == null) {
        setConnectSourceNodeId(node.id);
        onSelectNode(node);
        return;
      }

      if (connectSourceNodeId !== node.id && !isMapMutating) {
        const edgeInput = {
          sourceNodeId: connectSourceNodeId,
          targetNodeId: node.id,
          edgeType: connectEdgeType,
        };
        setPendingEdgeSelection(edgeInput);
        const created = await onCreateEdge(edgeInput);
        if (created) {
          setMapEditTool('select');
          setConnectSourceNodeId(null);
          if (typeof created === 'number') {
            setSelectedEdgeId(created);
            setPendingEdgeSelection(null);
          }
        } else {
          setPendingEdgeSelection(null);
        }
        return;
      }
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
  const renderCheckMetadataEditor = (draft: NodeEditorDraft) => {
    const check = draft.checkMetadata;
    const updateCheck = (patch: Partial<NodeEditorDraft['checkMetadata']>) =>
      updateDraft({ checkMetadata: { ...check, ...patch } });
    const resetKind = (kind: CheckMetadataKind) => {
      if (kind === 'none') {
        updateDraft({ checkMetadata: emptyCheckMetadataDraft(check.taskId) });
        return;
      }
      updateDraft({
        checkMetadata: {
          ...emptyCheckMetadataDraft(check.taskId),
          kind,
          prompt: check.prompt,
        },
      });
    };
    const selectedKindLabel =
      checkMetadataKindOptions.find((item) => item.value === check.kind)?.label ?? 'Проверка';
    const checkValidationMessage = getCheckMetadataValidationMessage(check);

    if (check.kind === 'raw') {
      return (
        <PixelSurface frame="inset" padding="sm">
          <PixelStack gap="sm">
            <PixelText as="p" size="xs" color="textDim" uppercase>
              Проверка
            </PixelText>
            <PixelText as="p" readable size="xs" color="textMuted">
              {check.invalidRaw
                ? 'Метаданные проверки не разобраны. Исходный JSON скрыт и сохранится без изменений.'
                : 'Формат проверки пока не поддержан формой. Исходный JSON скрыт и сохранится без изменений.'}
            </PixelText>
            <PixelButton
              tone="ghost"
              onClick={() => updateDraft({ checkMetadata: emptyCheckMetadataDraft(check.taskId) })}
              disabled={isEditorBusy}
              style={{ minHeight: 30, padding: '6px 10px', justifySelf: 'start' }}
            >
              Очистить проверку
            </PixelButton>
          </PixelStack>
        </PixelSurface>
      );
    }

    return (
      <PixelSurface frame="inset" padding="sm">
        <PixelStack gap="sm">
          <PixelSurface frame="ghost" padding="xs">
            <PixelText as="p" size="xs" color="textDim" uppercase>
              1 · Тип
            </PixelText>
            <PixelSelect
              label="Тип проверки"
              value={check.kind}
              onChange={(event) => resetKind(event.target.value as CheckMetadataKind)}
              disabled={isEditorBusy}
              style={{ marginTop: 8 }}
            >
              {checkMetadataKindOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </PixelSelect>
            <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 8 }}>
              {selectedKindLabel}
              {check.kind === 'none'
                ? ': форма проверки скрыта, пока не выбран тип.'
                : `: ${getCheckMetadataCriterionHint(check)}`}
            </PixelText>
          </PixelSurface>

          {check.kind !== 'none' ? (
            <PixelSurface frame="ghost" padding="xs">
              <PixelText as="p" size="xs" color="textDim" uppercase>
                2 · Задание
              </PixelText>
              <PixelTextarea
                label="Задание для ученика"
                value={check.prompt}
                onChange={(event) => updateCheck({ prompt: event.target.value })}
                placeholder="Что пользователь должен сделать перед проверкой"
                disabled={isEditorBusy}
                style={{ minHeight: 58, marginTop: 8 }}
              />
            </PixelSurface>
          ) : null}

          {check.kind !== 'none' ? (
            <PixelSurface frame="ghost" padding="xs">
              <PixelText as="p" size="xs" color="textDim" uppercase>
                3 · {getCheckMetadataCriterionLabel(check)}
              </PixelText>
              <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 4 }}>
                {getCheckMetadataCriterionHint(check)}
              </PixelText>
              {checkValidationMessage ? (
                <PixelText as="p" readable size="xs" color="accent" style={{ marginTop: 6 }}>
                  {checkValidationMessage}
                </PixelText>
              ) : null}

              {check.kind === 'exact' ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <PixelInput
                    label="Правильный ответ"
                    value={check.expectedAnswer}
                    onChange={(event) => updateCheck({ expectedAnswer: event.target.value })}
                    placeholder="Например: детерминант"
                    disabled={isEditorBusy}
                  />
                  <label className="flex items-center gap-2 self-end border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={check.caseSensitive}
                      onChange={(event) => updateCheck({ caseSensitive: event.target.checked })}
                      disabled={isEditorBusy}
                    />
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      регистр важен
                    </PixelText>
                  </label>
                </div>
              ) : null}

              {check.kind === 'number' ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <PixelInput
                    label="Ожидаемое число"
                    value={check.expectedNumber}
                    onChange={(event) => updateCheck({ expectedNumber: event.target.value })}
                    placeholder="42"
                    disabled={isEditorBusy}
                  />
                  <PixelInput
                    label="Допуск"
                    value={check.tolerance}
                    onChange={(event) => updateCheck({ tolerance: event.target.value })}
                    placeholder="0"
                    disabled={isEditorBusy}
                  />
                </div>
              ) : null}

              {check.kind === 'contains' ? (
                <PixelTextarea
                  label="Обязательные термины"
                  value={check.requiredTerms}
                  onChange={(event) => updateCheck({ requiredTerms: event.target.value })}
                  placeholder="Один термин на строку или через запятую"
                  disabled={isEditorBusy}
                  style={{ minHeight: 70, marginTop: 8 }}
                />
              ) : null}

              {check.kind === 'checklist' ? (
                <div className="mt-2 grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Пункты чек-листа
                    </PixelText>
                    <PixelButton
                      tone="ghost"
                      onClick={() =>
                        updateCheck({
                          checklistItems: [
                            ...check.checklistItems,
                            { id: `item-${check.checklistItems.length + 1}`, label: '', required: true },
                          ],
                        })
                      }
                      disabled={isEditorBusy}
                      style={{ minHeight: 28, padding: '4px 8px' }}
                    >
                      <Plus size={13} /> Добавить
                    </PixelButton>
                  </div>
                  {check.checklistItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                      <PixelInput
                        label={`Пункт ${index + 1}`}
                        value={item.label}
                        onChange={(event) => {
                          const nextItems = [...check.checklistItems];
                          nextItems[index] = { ...item, label: event.target.value };
                          updateCheck({ checklistItems: nextItems });
                        }}
                        disabled={isEditorBusy}
                      />
                      <label className="flex items-center gap-2 self-end border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] px-3 py-2">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(event) => {
                            const nextItems = [...check.checklistItems];
                            nextItems[index] = { ...item, required: event.target.checked };
                            updateCheck({ checklistItems: nextItems });
                          }}
                          disabled={isEditorBusy}
                        />
                        <PixelText as="span" size="xs" color="textMuted" uppercase>
                          нужно
                        </PixelText>
                      </label>
                      <PixelButton
                        tone="ghost"
                        onClick={() =>
                          updateCheck({
                            checklistItems: check.checklistItems.filter((_, itemIndex) => itemIndex !== index),
                          })
                        }
                        disabled={isEditorBusy}
                        style={{ minHeight: 34, alignSelf: 'end', padding: '6px 8px' }}
                      >
                        <X size={13} /> Убрать
                      </PixelButton>
                    </div>
                  ))}
                </div>
              ) : null}

              {check.kind === 'manual_strict' ? (
                <PixelTextarea
                  label="Критерий внешней строгой проверки"
                  value={check.expectedSummary}
                  onChange={(event) => updateCheck({ expectedSummary: event.target.value })}
                  placeholder="Какой результат внешней проверки подтверждает зачет"
                  disabled={isEditorBusy}
                  style={{ minHeight: 70, marginTop: 8 }}
                />
              ) : null}

              {check.kind === 'llm_assisted' ? (
                <PixelTextarea
                  label="Критерии для ИИ-проверки"
                  value={check.rubric}
                  onChange={(event) => updateCheck({ rubric: event.target.value })}
                  placeholder="По каким критериям проверка должна зачесть объяснение"
                  disabled={isEditorBusy}
                  style={{ minHeight: 70, marginTop: 8 }}
                />
              ) : null}
            </PixelSurface>
          ) : null}

          <PixelSurface frame="ghost" padding="xs">
            <PixelText as="p" size="xs" color="textDim" uppercase>
              4 · Как увидит ученик
            </PixelText>
            <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 4 }}>
              {getCheckMetadataPreview(check)}
            </PixelText>
          </PixelSurface>
        </PixelStack>
      </PixelSurface>
    );
  };

  const renderMasteryPanel = (nodeFocus: NodeFocusSnapshot, mode: InspectorMode = 'overview', compact = false) => {
    const mastery = nodeFocus.mastery ?? null;
    const currentRank = mastery?.currentRank ?? 0;
    const routeRequirement = mastery?.routeRequirement ?? null;
    const routeItem = routeItemsByNodeId.get(nodeFocus.node.id) ?? null;
    const activeRouteSpecialization =
      currentSpecialization?.status === 'active' ? currentSpecialization : null;
    const strictLocked = Boolean(mastery?.check.isStrictCheckable);
    const resolvedCheckMethod = strictLocked ? 'strict' : assessmentCheckMethod;
    const strictCheckType = mastery?.check.strictCheckType ?? null;
    const isAutoStrictCheck = resolvedCheckMethod === 'strict' && Boolean(mastery?.check.isAutoStrictCheck);
    const checklistItems = mastery?.check.checklistItems ?? [];
    const isChecklistCheck = isAutoStrictCheck && strictCheckType === 'checklist' && checklistItems.length > 0;
    const pendingSelfMark = masteryPendingAction === 'self-mark';
    const pendingAssessment = masteryPendingAction === 'assessment';
    const trimmedAnswer = assessmentAnswer.trim();
    const trimmedResultId = assessmentResultId.trim();
    const trimmedEvidence = assessmentEvidence.trim();
    const hasTechnicalResultId = trimmedResultId.length >= 2;
    const hasVisibleEvidence = trimmedEvidence.length >= 3;
    const hasVerifierEvidence = hasTechnicalResultId || hasVisibleEvidence;
    const hasChecklistSelection = checklistItems.some((item) => assessmentChecklistValues[item.id]);
    const canRunAutoStrictCheck = isAutoStrictCheck && (isChecklistCheck ? hasChecklistSelection : trimmedAnswer.length > 0);
    const canSubmitAssessmentPass = isAutoStrictCheck ? canRunAutoStrictCheck : hasVerifierEvidence;
    const evidencePayload = !isAutoStrictCheck && canSubmitAssessmentPass
      ? resolvedCheckMethod === 'strict'
        ? {
            method: 'strict',
            source: 'node-inspector',
            strict_result_id: trimmedResultId || null,
            result: trimmedEvidence || trimmedResultId,
            answer: trimmedAnswer || null,
            strict_check_type: strictLocked ? strictCheckType : null,
            captured_at: new Date().toISOString(),
          }
        : {
            method: 'llm_assisted',
            source: 'node-inspector',
            llm_result_id: trimmedResultId || null,
            result: trimmedEvidence || trimmedResultId,
            answer: trimmedAnswer || null,
            captured_at: new Date().toISOString(),
          }
      : null;
    const assessmentSubmittedAnswer = isChecklistCheck
      ? JSON.stringify(
          Object.entries(assessmentChecklistValues)
            .filter(([, selected]) => selected)
            .map(([id]) => id),
        )
      : trimmedAnswer;
    const verifiedRank = mastery?.isVerified ? currentRank : 0;
    const selfMarkedRank = mastery?.isSelfMarkedOnly ? currentRank : 0;
    const showRouteControls = canEditRoutes && !compact && mode === 'route';
    const showAssessmentControls = !compact && mode === 'assessment';
    const hasAnswer = trimmedAnswer.length > 0;
    const requiresVerifierEvidence = !isAutoStrictCheck;
    const checkTypeLabel = getAssessmentCheckTypeLabel({ strictCheckType, resolvedCheckMethod });
    const expectedInputText = getAssessmentExpectedInputText({
      isChecklistCheck,
      checklistItems,
      strictCheckType,
      expectedSummary: mastery?.check.expectedSummary,
      requiredTerms: mastery?.check.requiredTerms,
      resolvedCheckMethod,
    });
    const verifierEvidenceHint = getAssessmentEvidenceHint({ hasVisibleEvidence, hasTechnicalResultId });
    const answerInputCopy = getAssessmentAnswerInputCopy({ strictCheckType, resolvedCheckMethod });
    const assessmentValidationState = getAssessmentValidationState({
      pendingAssessment,
      pendingSelfMark,
      isEditorArchived,
      isAutoStrictCheck,
      isChecklistCheck,
      canSubmitAssessmentPass,
      checkTypeLabel,
      hasAnswer,
      hasVerifierEvidence,
      resolvedCheckMethod,
    });
    const assessmentValidationTone =
      assessmentValidationState.tone === 'success' ? 'var(--pixel-success)' : 'var(--pixel-accent)';
    const latestAttemptResultCopy = mastery?.latestAttempt
      ? getAssessmentAttemptResultCopy({
          passed: mastery.latestAttempt.passed,
          targetMasteryLabel: masteryLabel(mastery.latestAttempt.target_mastery_level),
        })
      : null;
    const primaryAssessmentActionLabel = getAssessmentPrimaryActionLabel({
      pendingAssessment,
      isAutoStrictCheck,
    });
    const failedAttemptState = getAssessmentFailedAttemptState({
      isAutoStrictCheck,
      isChecklistCheck,
      hasChecklistSelection,
      pendingAssessment,
      pendingSelfMark,
      isEditorArchived,
      hasAnswer,
      hasVerifierEvidence,
      resolvedCheckMethod,
    });
    const failedAttemptSubmittedAnswer = isChecklistCheck ? assessmentSubmittedAnswer : trimmedAnswer || trimmedEvidence;
    const failedAttemptFeedbackSummary = isChecklistCheck
      ? 'Пока не зачтено: чек-лист не выполнен.'
      : trimmedEvidence || trimmedAnswer || 'Попытка сохранена: пока не зачтено.';
    const failedAttemptActionLabel = isChecklistCheck ? 'Не получилось' : 'Сохранить попытку';

    return (
      <PixelSurface frame="inset" padding="sm">
        <PixelStack gap="sm">
          {showRouteControls && routeItem && activeRouteSpecialization ? (
            <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
              <PixelStack gap="xs">
                <div className="flex items-center justify-between gap-2">
                  <PixelText as="span" size="xs" color="textDim" uppercase>
                    Основное действие
                  </PixelText>
                  <PixelText as="span" size="xs" color={routeItem.is_complete ? 'success' : 'accent'} uppercase>
                    {routeItem.is_complete ? 'готово' : 'в маршруте'}
                  </PixelText>
                </div>
                <PixelSelect
                  label="Требование маршрута"
                  value={routeRequiredLevel}
                  onChange={(event) => setRouteRequiredLevel(event.target.value as MasteryLevel)}
                  disabled={routeMutationPending || isEditorArchived}
                  style={{ minHeight: 34, padding: '4px 8px' }}
                >
                  {masteryLevelItems
                    .filter((item) => item.value !== 'seen')
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </PixelSelect>
                <PixelButton
                  tone="accent"
                  onClick={() =>
                    void onUpdateRouteNode({
                      routeNodeId: routeItem.id,
                      requiredMasteryLevel: routeRequiredLevel,
                    })
                  }
                  disabled={routeMutationPending || isEditorArchived}
                  fullWidth
                  style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                >
                  <Save size={15} /> Сохранить требование
                </PixelButton>
                <PixelButton
                  tone="ghost"
                  onClick={() => void onRemoveRouteNode({ routeNodeId: routeItem.id })}
                  disabled={routeMutationPending || isEditorArchived}
                  style={{ minHeight: 30, padding: '6px 8px', gap: 6 }}
                >
                  <X size={14} /> Убрать из маршрута
                </PixelButton>
              </PixelStack>
            </PixelSurface>
          ) : null}

          {showRouteControls && !routeRequirement && activeRouteSpecialization ? (
            <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
              <PixelStack gap="xs">
                <div className="flex items-center justify-between gap-2">
                  <PixelText as="span" size="xs" color="textDim" uppercase>
                    Основное действие
                  </PixelText>
                  <PixelText as="span" size="xs" color="accent" uppercase>
                    не в маршруте
                  </PixelText>
                </div>
                <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
                  Маршрут: {activeRouteSpecialization.name}
                </PixelText>
                <PixelSelect
                  label="Требование маршрута"
                  value={routeRequiredLevel}
                  onChange={(event) => setRouteRequiredLevel(event.target.value as MasteryLevel)}
                  disabled={routeMutationPending || isEditorArchived}
                  style={{ minHeight: 34, padding: '4px 8px' }}
                >
                  {masteryLevelItems
                    .filter((item) => item.value !== 'seen')
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </PixelSelect>
                <PixelButton
                  tone="accent"
                  onClick={() =>
                    void onAddNodeToRoute({
                      nodeId: nodeFocus.node.id,
                      requiredMasteryLevel: routeRequiredLevel,
                    })
                  }
                  disabled={routeMutationPending || isEditorArchived}
                  fullWidth
                  style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                >
                  <GitBranch size={15} /> {routeMutationPending ? 'Добавляю…' : 'Добавить в маршрут'}
                </PixelButton>
              </PixelStack>
            </PixelSurface>
          ) : null}

          {showRouteControls && !routeRequirement && currentSpecialization && currentSpecialization.status !== 'active' ? (
            <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
              <PixelStack gap="xs">
                <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                  Основное действие
                </PixelText>
                <PixelButton
                  tone="accent"
                  disabled
                  fullWidth
                  style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                >
                  <Target size={15} /> Маршрут завершен
                </PixelButton>
                <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
                  Новый маршрут можно начать на экране «Сегодня».
                </PixelText>
              </PixelStack>
            </PixelSurface>
          ) : null}

          {showRouteControls && !currentSpecialization ? (
            <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
              <PixelStack gap="xs">
                <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                  Основное действие
                </PixelText>
                <PixelButton
                  tone="accent"
                  disabled
                  fullWidth
                  style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                >
                  <Target size={15} /> Начать маршрут в «Сегодня»
                </PixelButton>
                <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
                  У кампании нет активного маршрута, поэтому этот узел пока нельзя добавить в маршрут из инспектора.
                </PixelText>
              </PixelStack>
            </PixelSurface>
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <div>
              <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                Освоение
              </PixelText>
              <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                {masteryLabel(mastery?.currentLevel)}
                {mastery?.isVerified
                  ? ' · подтверждено проверкой'
                  : mastery?.isSelfMarkedOnly
                    ? ' · самооценка'
                    : ' · нет проверки'}
              </PixelText>
            </div>
            <div
              className="inline-flex h-9 w-9 items-center justify-center border-2 text-xs font-bold"
              style={{
                borderColor: mastery?.isVerified ? 'var(--pixel-success)' : 'var(--pixel-line-soft)',
                color: mastery?.isVerified ? 'var(--pixel-success)' : 'var(--pixel-text-muted)',
                background: 'var(--pixel-panel-inset)',
              }}
            >
              {currentRank || '-'}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div
              className="inspector-mastery-status inspector-mastery-status--verified flex items-center justify-between gap-2 border p-2"
              style={{
                borderColor: mastery?.isVerified ? 'var(--pixel-success)' : 'var(--pixel-line-soft)',
                background: mastery?.isVerified ? 'rgba(110, 231, 183, 0.08)' : 'var(--pixel-panel-inset)',
              }}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: mastery?.isVerified ? 'var(--pixel-success)' : 'var(--pixel-text-dim)' }} />
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  подтверждено
                </PixelText>
              </span>
              <PixelText as="span" size="xs" color={mastery?.isVerified ? 'success' : 'textDim'} uppercase>
                {verifiedRank || '-'} · XP
              </PixelText>
            </div>
            <div
              className="inspector-mastery-status inspector-mastery-status--self flex items-center justify-between gap-2 border p-2"
              style={{
                borderColor: mastery?.isSelfMarkedOnly ? 'var(--pixel-accent)' : 'var(--pixel-line-soft)',
                background: mastery?.isSelfMarkedOnly ? 'rgba(247, 201, 72, 0.045)' : 'var(--pixel-panel-inset)',
              }}
            >
              <span className="flex items-center gap-2">
                <Eye size={14} style={{ color: mastery?.isSelfMarkedOnly ? 'var(--pixel-accent)' : 'var(--pixel-text-dim)' }} />
                <PixelText as="span" size="xs" color="textMuted" uppercase>
                  самооценка
                </PixelText>
              </span>
              <PixelText as="span" size="xs" color={mastery?.isSelfMarkedOnly ? 'accent' : 'textDim'} uppercase>
                {selfMarkedRank || '-'} · без XP
              </PixelText>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {masteryLevelItems.map((item, index) => {
              const isReached = currentRank >= index + 1;
              const isVerifiedReached = Boolean(mastery?.isVerified && isReached);
              const isSelfReached = Boolean(mastery?.isSelfMarkedOnly && isReached);
              const isRequired = routeRequirement?.required_mastery_level === item.value;
              return (
                <div
                  key={item.value}
                  title={item.label}
                  className="flex h-8 items-center justify-center border text-[10px] font-bold"
                  style={{
                    borderColor: isRequired
                      ? 'var(--pixel-accent)'
                      : isVerifiedReached
                        ? 'var(--pixel-success)'
                        : isSelfReached
                          ? 'var(--pixel-accent-muted)'
                        : 'var(--pixel-line-soft)',
                    background: isVerifiedReached
                      ? 'rgba(45, 212, 191, 0.14)'
                      : isSelfReached
                        ? 'rgba(247, 201, 72, 0.12)'
                        : 'var(--pixel-panel-inset)',
                    color: isRequired
                      ? 'var(--pixel-accent-glow)'
                      : isVerifiedReached
                        ? 'var(--pixel-success)'
                        : isSelfReached
                          ? 'var(--pixel-accent)'
                        : 'var(--pixel-text-dim)',
                  }}
                >
                  {item.short}
                </div>
              );
            })}
          </div>

          {routeRequirement ? (
            <div className="flex items-center justify-between gap-2">
              <PixelText as="span" size="xs" color="textMuted">
                Маршрут: {routeRequirement.specialization_name}
              </PixelText>
              <PixelText as="span" size="xs" color="accent" uppercase>
                нужно {masteryLabel(routeRequirement.required_mastery_level)}
              </PixelText>
            </div>
          ) : null}

          {showAssessmentControls ? (
            <div className="grid gap-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <PixelSelect
                  label="Проверенный уровень"
                  value={assessmentTargetLevel}
                  onChange={(event) => setAssessmentTargetLevel(event.target.value as MasteryLevel)}
                  disabled={pendingAssessment}
                  style={{ minHeight: 34, padding: '4px 8px' }}
                >
                  {masteryLevelItems
                    .filter((item) => item.value !== 'seen')
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </PixelSelect>

                <PixelSelect
                  label="Способ проверки"
                  value={resolvedCheckMethod}
                  onChange={(event) => setAssessmentCheckMethod(event.target.value as 'strict' | 'llm_assisted')}
                  disabled={pendingAssessment || strictLocked}
                  style={{ minHeight: 34, padding: '4px 8px' }}
                  hint={strictLocked ? `Задан в критериях: ${checkTypeLabel}` : null}
                >
                  <option value="strict">Строгая</option>
                  <option value="llm_assisted">ИИ-проверка</option>
                </PixelSelect>
              </div>

              <PixelSurface frame="ghost" padding="sm">
                <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                  Критерии · {checkTypeLabel}
                </PixelText>
                <PixelText as="p" readable size="sm" color="textMuted" style={{ marginTop: 6 }}>
                  {expectedInputText}
                </PixelText>
                {requiresVerifierEvidence ? (
                  <PixelText as="p" readable size="xs" color="accent" style={{ marginTop: 6 }}>
                    Для проверенного прогресса нужно подтверждение проверки.
                  </PixelText>
                ) : null}
                  {mastery?.check.prompt ? (
                    <PixelText as="p" readable size="sm" style={{ marginTop: 8 }}>
                      {mastery.check.prompt}
                    </PixelText>
                  ) : null}
                  {mastery?.check.expectedSummary ? (
                    <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 6 }}>
                      Критерий: {mastery.check.expectedSummary}
                    </PixelText>
                  ) : null}
                  {(mastery?.check.requiredTerms?.length ?? 0) > 0 ? (
                    <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 6 }}>
                      Обязательные элементы: {mastery.check.requiredTerms?.join(', ')}
                    </PixelText>
                  ) : null}
                </PixelSurface>

              {isChecklistCheck ? (
                <div className="grid gap-2">
                  <PixelText as="p" size="xs" color="textMuted" uppercase style={{ margin: 0 }}>
                    Чек-лист проверки
                  </PixelText>
                  <div className="grid gap-1">
                    {checklistItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] px-2 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(assessmentChecklistValues[item.id])}
                          onChange={(event) =>
                            setAssessmentChecklistValues((current) => ({
                              ...current,
                              [item.id]: event.target.checked,
                            }))
                          }
                          disabled={pendingAssessment || isEditorArchived}
                        />
                        <PixelText as="span" readable size="sm">
                          {item.label}
                        </PixelText>
                        {item.required ? (
                          <PixelText as="span" size="xs" color="accent" uppercase>
                            нужно
                          </PixelText>
                        ) : null}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
              <PixelTextarea
                label={answerInputCopy.label}
                value={assessmentAnswer}
                onChange={(event) => setAssessmentAnswer(event.target.value)}
                placeholder={answerInputCopy.placeholder}
                disabled={pendingAssessment || isEditorArchived}
                hint={answerInputCopy.helperText}
                style={{ minHeight: 68 }}
              />
              )}

              {!isAutoStrictCheck ? (
                <>
              <PixelTextarea
                label="Подтверждение проверки"
                value={assessmentEvidence}
                onChange={(event) => setAssessmentEvidence(event.target.value)}
                placeholder={
                  resolvedCheckMethod === 'strict'
                    ? 'Например: внешний результат совпал с критерием, ответ подтвержден'
                    : 'Например: краткий вывод проверки, почему ответ засчитан'
                }
                disabled={pendingAssessment || isEditorArchived}
                hint={verifierEvidenceHint}
                style={{ minHeight: 78 }}
              />

              {canEditChecks ? (
              <details className="border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] px-2 py-2">
                <summary className="cursor-pointer text-xs uppercase text-[var(--pixel-text-muted)]">
                  Технические детали
                </summary>
                <div className="mt-2 grid gap-2">
                  <PixelInput
                    label={getAssessmentResultIdLabel(resolvedCheckMethod)}
                    value={assessmentResultId}
                    onChange={(event) => setAssessmentResultId(event.target.value)}
                    placeholder={getAssessmentResultIdPlaceholder(resolvedCheckMethod)}
                    disabled={pendingAssessment || isEditorArchived}
                    hint="Для авторского режима и аудита. Обычно достаточно подтверждения проверки выше."
                    style={{ minHeight: 34, padding: '4px 8px' }}
                  />
                </div>
              </details>
              ) : null}
                </>
              ) : (
                <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
                  Локальная строгая проверка сама сохранит попытку и подтверждение проверки.
                </PixelText>
              )}

              <PixelSurface
                frame="ghost"
                padding="xs"
                style={{
                  borderColor: assessmentValidationTone,
                  boxShadow: `inset 2px 2px 0 var(--pixel-line), inset -2px -2px 0 ${assessmentValidationTone}`,
                }}
              >
                <div className="flex items-start gap-2">
                  {canSubmitAssessmentPass ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--pixel-success)', marginTop: 2 }} />
                  ) : (
                    <ShieldCheck size={14} style={{ color: assessmentValidationTone, marginTop: 2 }} />
                  )}
                  <div>
                    <PixelText as="p" size="xs" color="textMuted" uppercase style={{ margin: 0 }}>
                      Готовность к действию
                    </PixelText>
                    <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                      {assessmentValidationState.message}
                    </PixelText>
                  </div>
                </div>
              </PixelSurface>

              <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
                <PixelStack gap="xs">
                  <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                    Основное действие
                  </PixelText>
                <PixelButton
                  tone="accent"
                  onClick={() =>
                    void onSubmitAssessment({
                      targetMasteryLevel: assessmentTargetLevel,
                      checkMethod: resolvedCheckMethod,
                      passed: true,
                      submittedAnswer: assessmentSubmittedAnswer,
                      feedbackSummary: trimmedEvidence || trimmedResultId,
                      evidencePayload,
                      checklistResults: isChecklistCheck ? assessmentChecklistValues : null,
                      usesAutomaticStrictCheck: isAutoStrictCheck,
                    })
                  }
                  disabled={!assessmentValidationState.ready}
                  fullWidth
                  style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                >
                  <ShieldCheck size={15} /> {primaryAssessmentActionLabel}
                </PixelButton>
                </PixelStack>
              </PixelSurface>

              <div className="grid gap-2 sm:grid-cols-2">
                <PixelButton
                  tone="ghost"
                  onClick={() => void onMarkSelfMastery('seen')}
                  disabled={pendingSelfMark || pendingAssessment || isEditorArchived}
                  className="inspector-self-mark-button"
                  style={{ minHeight: 30, padding: '6px 8px', gap: 6 }}
                >
                  <Eye size={14} /> Сам отметил без XP
                </PixelButton>
                {failedAttemptState.visible ? (
                  <PixelButton
                    tone="ghost"
                    onClick={() =>
                      void onSubmitAssessment({
                        targetMasteryLevel: assessmentTargetLevel,
                        checkMethod: resolvedCheckMethod,
                        passed: false,
                        submittedAnswer: failedAttemptSubmittedAnswer,
                        feedbackSummary: failedAttemptFeedbackSummary,
                        evidencePayload: null,
                        checklistResults: isChecklistCheck ? assessmentChecklistValues : null,
                        usesAutomaticStrictCheck: isChecklistCheck,
                      })
                    }
                    disabled={failedAttemptState.disabled}
                    style={{ minHeight: 30, padding: '6px 8px', gap: 6 }}
                  >
                    <X size={14} /> {failedAttemptActionLabel}
                  </PixelButton>
                ) : null}
              </div>
              {failedAttemptState.visible ? (
                <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
                  {failedAttemptState.message}
                </PixelText>
              ) : null}

              {mastery?.latestAttempt ? (
                <PixelSurface
                  frame="ghost"
                  padding="xs"
                  style={{
                    borderColor: mastery.latestAttempt.passed ? 'var(--pixel-success)' : 'var(--pixel-accent)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    {mastery.latestAttempt.passed ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--pixel-success)', marginTop: 2 }} />
                    ) : (
                      <X size={14} style={{ color: 'var(--pixel-accent)', marginTop: 2 }} />
                    )}
                    <div>
                      <PixelText as="p" size="xs" color="textMuted" uppercase style={{ margin: 0 }}>
                        {latestAttemptResultCopy?.status ?? 'Попытка сохранена'}
                      </PixelText>
                      <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
                        {latestAttemptResultCopy?.message ?? 'Попытка сохранена.'}
                      </PixelText>
                      {mastery.latestAttempt.feedback_summary ? (
                        <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 4 }}>
                          {mastery.latestAttempt.feedback_summary}
                        </PixelText>
                      ) : null}
                      {canEditChecks && mastery.latestAttempt.evidence_payload ? (
                        <details className="mt-2 border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] px-2 py-2">
                          <summary className="cursor-pointer text-xs uppercase text-[var(--pixel-text-muted)]">
                            Технические детали попытки
                          </summary>
                          <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 6, wordBreak: 'break-word' }}>
                            {mastery.latestAttempt.evidence_payload}
                          </PixelText>
                        </details>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <PixelButton
                          tone="accent"
                          onClick={mastery.latestAttempt.passed ? onOpenToday : openAssessmentStep}
                          disabled={pendingAssessment || pendingSelfMark}
                          style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                        >
                          {mastery.latestAttempt.passed ? (
                            <>
                              <ChevronRight size={14} /> Следующий шаг
                            </>
                          ) : (
                            <>
                              <RotateCcw size={14} /> Повторить проверку
                            </>
                          )}
                        </PixelButton>
                        {!mastery.latestAttempt.passed ? (
                          <PixelButton
                            tone="ghost"
                            onClick={onOpenToday}
                            disabled={pendingAssessment || pendingSelfMark}
                            style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                          >
                            <ChevronRight size={14} /> Сегодня
                          </PixelButton>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </PixelSurface>
              ) : null}
              <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
                Самооценка нужна для памяти. XP, маршрут и подтвержденное освоение обновляет только проверенный прогресс.
              </PixelText>
            </div>
          ) : null}
        </PixelStack>
      </PixelSurface>
    );
  };

  const renderLearnerFocusedCheckFlow = (nodeFocus: NodeFocusSnapshot) => {
    const latestAttempt = nodeFocus.mastery?.latestAttempt ?? null;
    const routeRequirement = nodeFocus.mastery?.routeRequirement ?? null;
    const focusAction = nodeFocus.selectedAction ?? null;

    return (
      <PixelSurface frame="selected" padding="md" className="navigation-focused-check-flow">
        <PixelPanelHeader
          eyebrow={
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[var(--pixel-accent)]" /> Проверка
            </span>
          }
          title={focusAction?.title ?? nodeFocus.node.title}
          description={
            focusAction?.details ??
            nodeFocus.node.summary ??
            'Ответьте на задание, проверьте результат и посмотрите, как изменится подтвержденный прогресс.'
          }
          aside={
            <PixelText as="span" size="xs" color={latestAttempt?.passed ? 'success' : 'accent'} uppercase>
              {latestAttempt ? (latestAttempt.passed ? 'результат' : 'повтор') : 'учебный поток'}
            </PixelText>
          }
        />

        <div className="navigation-focused-check-flow__meta">
          <PixelSurface frame="ghost" padding="xs">
            <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
              1 · Задание
            </PixelText>
            <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
              {focusAction?.title ?? nodeFocus.node.title}
            </PixelText>
          </PixelSurface>
          <PixelSurface frame="ghost" padding="xs">
            <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
              2 · Цель
            </PixelText>
            <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
              {routeRequirement ? `Подтвердить: ${masteryLabel(routeRequirement.required_mastery_level)}` : 'Засчитать прогресс'}
            </PixelText>
          </PixelSurface>
          <PixelSurface frame="ghost" padding="xs">
            <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
              3 · Результат
            </PixelText>
            <PixelText as="p" readable size="sm" style={{ marginTop: 4 }}>
              {latestAttempt ? (latestAttempt.passed ? 'Зачтено' : 'Не зачтено') : 'Появится после проверки'}
            </PixelText>
          </PixelSurface>
        </div>

        <div className="navigation-focused-check-flow__actions">
          <PixelButton
            tone="ghost"
            onClick={() => handleInspectorModeChange('overview')}
            style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
          >
            <MapIcon size={14} /> Обзор карты
          </PixelButton>
          <PixelButton
            tone="ghost"
            onClick={onOpenToday}
            style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
          >
            <ChevronRight size={14} /> Сегодня
          </PixelButton>
        </div>

        <div className="navigation-focused-check-flow__body">
          {renderMasteryPanel(nodeFocus, 'assessment')}
        </div>
      </PixelSurface>
    );
  };

  const renderLearnerFocusedCheckRailSummary = (nodeFocus: NodeFocusSnapshot) => (
    <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
      <PixelStack gap="xs">
        <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
          Проверка открыта
        </PixelText>
        <PixelText as="p" readable size="sm" style={{ margin: 0 }}>
          {nodeFocus.selectedAction?.title ?? nodeFocus.node.title}
        </PixelText>
        <PixelText as="p" readable size="xs" color="textMuted" style={{ margin: 0 }}>
          Форма ответа и результат находятся в основном учебном потоке слева.
        </PixelText>
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            tone="ghost"
            onClick={() => handleInspectorModeChange('overview')}
            style={{ justifyContent: 'center', minHeight: 30, padding: '6px 8px', gap: 6 }}
          >
            <MapIcon size={14} /> Обзор
          </PixelButton>
          <PixelButton
            tone="accent"
            onClick={onOpenToday}
            style={{ justifyContent: 'center', minHeight: 30, padding: '6px 8px', gap: 6 }}
          >
            <ChevronRight size={14} /> Сегодня
          </PixelButton>
        </div>
      </PixelStack>
    </PixelSurface>
  );

  const renderRouteAuthoringPanel = () => {
    if (!currentSpecialization) {
      return null;
    }

    const isRouteEditable = currentSpecialization.status === 'active';

    return (
      <PixelSurface frame="panel" padding="sm" className="min-w-0">
        <PixelPanelHeader
          eyebrow={
            <span className="flex items-center gap-2">
              <Target size={14} className="text-[var(--pixel-accent)]" /> Маршрут
            </span>
          }
          title={currentSpecialization.name}
          description={
            isRouteEditable
              ? 'Порядок, этапы и требования текущего маршрута.'
              : 'Завершенный маршрут доступен только для просмотра.'
          }
          aside={
            routeNodeIds.size > 0 ? (
              <PixelButton
                tone={isRouteFilterActive ? 'accent' : 'ghost'}
                onClick={() => {
                  setMapCanvasMode('free');
                  setLayerParentNodeId(null);
                  setIsRouteFilterEnabled((value) => !value);
                  clearMapTransientState();
                }}
                style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
              >
                <MapIcon size={13} /> {isRouteFilterActive ? 'Вся карта' : 'На карте'}
              </PixelButton>
            ) : null
          }
        />

        {routeItems.length === 0 ? (
          <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 12 }}>
            Маршрут пуст. Добавьте узлы в режиме «Настраиваю».
          </PixelText>
        ) : (
          <div
            className="mt-3 grid max-h-[34dvh] min-w-0 gap-2 overflow-y-auto overflow-x-hidden pr-1"
            style={{ scrollbarGutter: 'stable' }}
          >
            {routeItems.map((item, index) => {
              const node = item.node_id != null ? navigationNodeIndex.get(item.node_id) : null;
              const isFocused = focus?.node?.id != null && item.node_id === focus.node.id;
              const stageDraft = routeStageDraftValue(item);
              return (
                <PixelSurface
                  key={item.id}
                  frame={isFocused ? 'ghost' : 'inset'}
                  padding="xs"
                  style={{
                    borderColor: isFocused ? 'var(--pixel-accent)' : undefined,
                  }}
                >
                  <div className="grid gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => selectRouteItemOnMap(item)}
                        disabled={!node}
                        className="min-w-0 text-left"
                        style={{
                          color: node ? 'var(--pixel-text)' : 'var(--pixel-text-muted)',
                          cursor: node ? 'pointer' : 'default',
                        }}
                      >
                        <PixelText as="span" size="xs" color="textDim" uppercase>
                          #{index + 1} · {item.is_required ? 'обяз.' : 'опц.'}
                        </PixelText>
                        <PixelText as="p" readable size="sm" style={{ margin: '3px 0 0' }}>
                          {item.title}
                        </PixelText>
                        <PixelText as="p" size="xs" color={item.is_complete ? 'success' : 'textMuted'} style={{ margin: '2px 0 0' }}>
                          нужно {masteryLabel(item.required_mastery_level)} · сейчас {masteryLabel(item.current_mastery_level)}
                        </PixelText>
                      </button>
                      {isRouteEditable ? (
                        <div className="flex shrink-0 gap-1">
                          <PixelButton
                            tone="ghost"
                            onClick={() => void moveRouteItem(index, -1)}
                            disabled={routeMutationPending || index === 0}
                            style={{ minHeight: 26, minWidth: 28, padding: 4 }}
                            title="Выше"
                          >
                            <ArrowUp size={13} />
                          </PixelButton>
                          <PixelButton
                            tone="ghost"
                            onClick={() => void moveRouteItem(index, 1)}
                            disabled={routeMutationPending || index === routeItems.length - 1}
                            style={{ minHeight: 26, minWidth: 28, padding: 4 }}
                            title="Ниже"
                          >
                            <ArrowDown size={13} />
                          </PixelButton>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                      <PixelSelect
                        label="Требование"
                        value={item.required_mastery_level}
                        onChange={(event) =>
                          void onUpdateRouteNode({
                            routeNodeId: item.id,
                            requiredMasteryLevel: event.target.value as MasteryLevel,
                          })
                        }
                        disabled={!isRouteEditable || routeMutationPending}
                        style={{ minHeight: 30, padding: '4px 7px' }}
                      >
                        {masteryLevelItems
                          .filter((level) => level.value !== 'seen')
                          .map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                      </PixelSelect>
                      <PixelSelect
                        label="Тип"
                        value={String(item.is_required)}
                        onChange={(event) =>
                          void onUpdateRouteNode({
                            routeNodeId: item.id,
                            isRequired: event.target.value === '1',
                          })
                        }
                        disabled={!isRouteEditable || routeMutationPending}
                        style={{ minHeight: 30, padding: '4px 7px' }}
                      >
                        <option value="1">Обязательный</option>
                        <option value="0">Опциональный</option>
                      </PixelSelect>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <PixelInput
                        label="Этап"
                        value={stageDraft}
                        onChange={(event) =>
                          setRouteStageDrafts((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        onBlur={() => saveRouteStageDraft(item)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            saveRouteStageDraft(item);
                          }
                        }}
                        disabled={!isRouteEditable || routeMutationPending}
                        placeholder="База / Практика / Финал"
                        style={{ minHeight: 30, padding: '4px 7px' }}
                      />
                      {isRouteEditable ? (
                        <PixelButton
                          tone="danger"
                          onClick={() => void onRemoveRouteNode({ routeNodeId: item.id })}
                          disabled={routeMutationPending}
                          style={{
                            alignSelf: 'end',
                            minHeight: 30,
                            padding: '5px 8px',
                          }}
                        >
                          <X size={13} />
                        </PixelButton>
                      ) : null}
                    </div>
                  </div>
                </PixelSurface>
              );
            })}
          </div>
        )}
      </PixelSurface>
    );
  };
  const fallbackLayerParentId =
    focus?.node && structureHierarchy.entries.get(focus.node.id)?.childIds.length
      ? focus.node.id
      : focus?.node
        ? structureHierarchy.entries.get(focus.node.id)?.parentId ?? null
        : structureHierarchy.roots[0] ?? null;
  const isTopLayerOpen = layerParentNodeId === 'top';
  const effectiveLayerParentId =
    isTopLayerOpen
      ? null
      : typeof layerParentNodeId === 'number' && structureHierarchy.entries.has(layerParentNodeId)
      ? layerParentNodeId
      : fallbackLayerParentId;
  const layerParentEntry =
    effectiveLayerParentId != null ? structureHierarchy.entries.get(effectiveLayerParentId) ?? null : null;
  const activeRouteTargetItem = currentRoute?.nextItem ?? null;
  const activeRouteTargetIndex =
    activeRouteTargetItem != null ? routeItems.findIndex((item) => item.id === activeRouteTargetItem.id) : -1;
  const focusedRouteItem = focus?.node ? routeItemsByNodeId.get(focus.node.id) ?? null : null;
  const focusedRouteIndex = focusedRouteItem != null ? routeItems.findIndex((item) => item.id === focusedRouteItem.id) : -1;
  const routeProgressSummary = useMemo(() => {
    const completed = routeItems.filter((item) => item.is_complete).length;
    const locked = routeItems.filter((item) => item.is_actionable === false && !item.is_complete).length;
    const weak = routeItems.filter((item) => Boolean(item.weak_spot_reason)).length;
    const available = routeItems.filter((item) => item.is_actionable !== false && !item.is_complete).length;

    return { completed, locked, weak, available };
  }, [routeItems]);
  const learnerRouteStatusItems = [
    { key: 'current', label: 'Текущий', value: activeRouteTargetIndex >= 0 ? `#${activeRouteTargetIndex + 1}` : '-' },
    { key: 'done', label: 'Готово', value: `${routeProgressSummary.completed}` },
    { key: 'available', label: 'Доступно', value: `${routeProgressSummary.available}` },
    { key: 'weak', label: 'Повторить', value: `${routeProgressSummary.weak}` },
    { key: 'locked', label: 'Закрыто', value: `${routeProgressSummary.locked}` },
  ];
  const routeOverviewNodeClassName = (item: NonNullable<TodaySnapshot['route']>['items'][number], isFront: boolean, isFocused: boolean) =>
    [
      'navigation-route-overview__node',
      item.is_complete ? 'navigation-route-overview__node--complete' : '',
      item.is_actionable === false && !item.is_complete ? 'navigation-route-overview__node--locked' : '',
      item.weak_spot_reason ? 'navigation-route-overview__node--weak' : '',
      isFront ? 'navigation-route-overview__node--front' : '',
      isFocused ? 'navigation-route-overview__node--focused' : '',
    ]
      .filter(Boolean)
      .join(' ');
  const routeOverviewStages = useMemo(() => {
    const groups = new globalThis.Map<
      string,
      {
        key: string;
        label: string;
        items: NonNullable<TodaySnapshot['route']>['items'];
        completedCount: number;
        hasCurrentFront: boolean;
      }
    >();
    const currentFrontId = activeRouteTargetItem?.id ?? null;

    for (const item of routeItems) {
      const label = item.route_stage?.trim() || 'Unstaged';
      const key = label.toLowerCase();
      const group =
        groups.get(key) ??
        {
          key,
          label,
          items: [],
          completedCount: 0,
          hasCurrentFront: false,
        };

      group.items.push(item);
      if (item.is_complete) {
        group.completedCount += 1;
      }
      if (currentFrontId != null && item.id === currentFrontId) {
        group.hasCurrentFront = true;
      }

      groups.set(key, group);
    }

    return [...groups.values()].map((group) => {
      const frontIndex =
        currentFrontId != null ? group.items.findIndex((item) => item.id === currentFrontId) : -1;
      const firstOpenIndex = group.items.findIndex((item) => !item.is_complete);
      const anchorIndex = frontIndex >= 0 ? frontIndex : firstOpenIndex >= 0 ? firstOpenIndex : 0;
      const startIndex = Math.max(0, anchorIndex - 1);
      const visibleItems = group.items.slice(startIndex, startIndex + 4);

      return {
        ...group,
        visibleItems,
        hiddenCount: Math.max(0, group.items.length - visibleItems.length),
      };
    });
  }, [activeRouteTargetItem?.id, routeItems]);
  const focusChipScope = isRouteFilterActive
    ? `Маршрут: ${currentSpecialization?.name ?? 'текущий'}`
    : mapCanvasMode === 'layers'
      ? `Слой: ${layerParentEntry?.node.title ?? selectedSphere?.name ?? 'верхний уровень'}`
      : `Структура: ${selectedSphere?.name ?? 'карта'}`;
  const focusChipBranch = branchFilterSkill
    ? `Ветка: ${branchFilterSkill.direction.name} / ${branchFilterSkill.skill.name}`
    : focus?.node
      ? `Ветка: ${focus.node.direction_name} / ${focus.node.skill_name}`
      : selectedDirection && selectedSkill
        ? `Ветка: ${selectedDirection.name} / ${selectedSkill.name}`
        : null;
  const focusChipNode = focus?.node?.title ?? selectedSphere?.name ?? 'Выберите узел';
  const focusChipRoute = activeRouteTargetItem
    ? `Текущий шаг #${activeRouteTargetIndex + 1}: ${activeRouteTargetItem.title}`
    : focusedRouteItem
      ? `В маршруте #${focusedRouteIndex + 1}: ${focusedRouteItem.title}`
      : null;
  const layerChildIds = layerParentEntry?.childIds ?? structureHierarchy.roots;
  const layerNodeIds =
    mapCanvasMode === 'layers'
      ? [...(layerParentEntry ? [layerParentEntry.node.id] : []), ...layerChildIds]
      : null;
  const canvasRouteNodeIds = isRouteFilterActive && mapCanvasMode === 'free' ? [...routeNodeIds] : null;
  const canvasVisibleNodeIds = layerNodeIds ?? canvasRouteNodeIds;
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
  const visibleMapFitKey = [
    selectedSphereId ?? 'all',
    visibleSkillId ?? 'all',
    mapCanvasMode,
    isRouteFilterActive ? 'route' : 'map',
    canvasVisibleNodeIds?.join(',') ?? 'all',
  ].join(':');

  useEffect(() => {
    if (!hasMapNodes || handledVisibleMapFitKey.current === visibleMapFitKey) {
      return;
    }

    if (hasManualMapViewport) {
      return;
    }

    handledVisibleMapFitKey.current = visibleMapFitKey;
    runMapCommand(mapCanvasMode === 'free' ? 'fit-overview' : 'fit-graph');
  }, [hasManualMapViewport, hasMapNodes, mapCanvasMode, runMapCommand, visibleMapFitKey]);

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
  const getSkillForNode = (node: NavigationNodeSummary) =>
    spheres
      .flatMap((sphere) => sphere.directions)
      .flatMap((direction) => direction.skills)
      .find((skill) => skill.id === node.skill_id) ?? selectedSkill;
  const getLayerCreateParent = () =>
    mapCanvasMode === 'layers' ? layerParentEntry?.node ?? null : null;
  const cleanupMapCreateState = () => {
    clearMapTransientUi();
  };
  const createNodeFromCanvasPoint = async (
    input: { worldX: number; worldY: number },
    title: string | undefined,
    createMode: CanvasCreateMode,
    fallbackSkill = selectedSkill,
    sourceCanvasMode: MapCanvasMode = mapCanvasMode,
    layerParentNodeIdAtStart: number | null = getLayerCreateParent()?.id ?? null,
  ) => {
    if (isMapMutating) {
      return false;
    }

    const route = resolveCanvasCreateRoute({
      surface: sourceCanvasMode,
      createMode,
      layerParentNodeId: layerParentNodeIdAtStart,
    });
    const layerCreateParent =
      route.createMode === 'layer-child' && route.parentNodeId != null
        ? structureHierarchy.entries.get(route.parentNodeId)?.node ?? null
        : null;
    const layerParentSkill = layerCreateParent ? getSkillForNode(layerCreateParent) : null;
    const skill = layerParentSkill ?? fallbackSkill;
    if (!skill) {
      return false;
    }
    const persistedPosition = resolveCanvasCreatePosition({
      route,
      pointerPosition: { x: input.worldX, y: input.worldY },
      parentPosition: layerCreateParent
        ? {
            x: layerCreateParent.x ?? input.worldX,
            y: layerCreateParent.y ?? input.worldY,
          }
        : null,
      siblingCount: layerCreateParent
        ? structureHierarchy.entries.get(layerCreateParent.id)?.childIds.length ?? 0
        : 0,
      topLevelPositions: structureHierarchy.roots
        .map((nodeId) => structureHierarchy.entries.get(nodeId)?.node)
        .filter((node): node is NavigationNodeSummary => Boolean(node))
        .map((node) => ({
          x: node.x ?? input.worldX,
          y: node.y ?? input.worldY,
        })),
    });

    const created = layerCreateParent
      ? await onCreateChildNodeAt({
          parentNodeId: layerCreateParent.id,
          skillId: skill.id,
          existingNodeCount: skill.nodes.length,
          x: persistedPosition.x,
          y: persistedPosition.y,
          title,
        })
      : await onCreateNodeAt({
          skillId: skill.id,
          existingNodeCount: skill.nodes.length,
          x: persistedPosition.x,
          y: persistedPosition.y,
          title,
        });

    if (created) {
      cleanupMapCreateState();
      if (route.preserveLayerMode) {
        setMapCanvasMode('layers');
        setLayerParentNodeId(route.parentNodeId ?? 'top');
        runMapCommand('center-layer');
      } else {
        setMapCanvasMode('free');
      }
    }

    return created;
  };
  const handleCreateNodeFromContext = async () => {
    if (!canvasContextMenu || isMapMutating) {
      return;
    }

    await createNodeFromCanvasPoint(
      {
        worldX: canvasContextMenu.worldX,
        worldY: canvasContextMenu.worldY,
      },
      nodeCreateTitle.trim() || undefined,
      mapCanvasMode === 'layers' ? 'layer-child' : 'free-node',
      contextSkill,
    );
  };
  const handleCreateChildNodeFromContext = async () => {
    if (!canvasContextMenu || !contextNode || !contextSkill || isMapMutating) {
      return;
    }

    const createPosition = resolveCanvasCreatePosition({
      route: {
        createMode: 'layer-child',
        parentNodeId: contextNode.id,
        preserveLayerMode: true,
      },
      pointerPosition: { x: canvasContextMenu.worldX, y: canvasContextMenu.worldY },
      parentPosition: {
        x: contextNode.x ?? canvasContextMenu.worldX,
        y: contextNode.y ?? canvasContextMenu.worldY,
      },
      siblingCount: contextNodeHierarchy?.childIds.length ?? 0,
    });
    const created = await onCreateChildNodeAt({
      parentNodeId: contextNode.id,
      skillId: contextSkill.id,
      existingNodeCount: contextSkill.nodes.length,
      x: createPosition.x,
      y: createPosition.y,
      title: nodeCreateTitle.trim() || undefined,
    });

    if (created) {
      setCanvasContextMenu(null);
      setNodeCreateTitle('');
      setFloatingMapPanel(null);
      setSelectedEdgeId(null);
      if (mapCanvasMode === 'layers') {
        setLayerParentNodeId(contextNode.id);
        runMapCommand('center-layer');
      }
    }
  };
  const layerCreateParent = getLayerCreateParent();
  const selectedConnectSourceNode =
    connectSourceNodeId != null ? navigationNodeIndex.get(connectSourceNodeId) ?? null : null;
  const canUseVisibleCreateTool = Boolean(selectedSkill || layerCreateParent);
  const createToolLabel =
    mapCanvasMode === 'layers'
      ? layerCreateParent
        ? 'Добавить в слой'
        : 'Добавить раздел'
      : 'Создать узел';
  const createToolStatus =
    mapCanvasMode === 'layers'
      ? layerCreateParent
        ? `Новый узел попадет внутрь: ${layerCreateParent.title}.`
        : 'Новый узел станет разделом верхнего уровня.'
      : selectedSkill
        ? `Новый узел попадет в навык: ${selectedSkill.name}.`
        : 'Выберите структуру или навык перед созданием узла.';
  const selectMapTool = () => {
    setMapEditTool('select');
    setConnectSourceNodeId(null);
    setFloatingMapPanel(null);
    setCanvasContextMenu(null);
    setInlineNodeEditor(null);
  };
  const startCreateMapTool = () => {
    if (!canUseVisibleCreateTool || isMapMutating) {
      return;
    }

    setMapEditTool('create');
    setConnectSourceNodeId(null);
    setSelectedEdgeId(null);
    setFloatingMapPanel(null);
    setCanvasContextMenu(null);
    setInlineNodeEditor(null);
  };
  const startConnectMapTool = () => {
    setMapEditTool('connect');
    setConnectSourceNodeId(focus?.node?.id ?? null);
    setSelectedEdgeId(null);
    setFloatingMapPanel(null);
    setCanvasContextMenu(null);
    setInlineNodeEditor(null);
  };
  const createNodeFromVisibleTool = async () => {
    if (!canUseVisibleCreateTool || isMapMutating) {
      return;
    }

    const anchorNode = layerCreateParent ?? focus?.node ?? selectedSkill?.nodes[0] ?? null;
    await createNodeFromCanvasPoint(
      {
        worldX: (anchorNode?.x ?? 0) + 160,
        worldY: (anchorNode?.y ?? 0) + 80,
      },
      undefined,
      mapCanvasMode === 'layers' ? 'layer-child' : 'free-node',
      selectedSkill,
      mapCanvasMode,
      mapCanvasMode === 'layers' ? layerCreateParent?.id ?? null : null,
    );
  };
  const canCreateNodeFromContext = Boolean(
    contextSkill || (mapCanvasMode === 'layers' && layerCreateParent),
  );
  const contextCreateActionLabel =
    mapCanvasMode === 'layers'
      ? layerCreateParent
        ? contextNode
          ? 'Добавить рядом'
          : 'Добавить в этот слой'
        : 'Добавить раздел верхнего уровня'
      : 'Создать узел здесь';
  const openTopLayer = () => {
    setMapCanvasMode('layers');
    setLayerParentNodeId('top');
    clearMapTransientUi();
    runMapCommand('center-layer');
  };
  const openLayerAtNode = (nodeId: number) => {
    setMapCanvasMode('layers');
    setLayerParentNodeId(nodeId);
    clearMapTransientUi();
    runMapCommand('center-layer');
  };
  const toggleTreeNode = (nodeId: number) => {
    setExpandedTreeNodeIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };
  const renderStructureTreeNode = (nodeId: number): ReactNode => {
    const entry = structureHierarchy.entries.get(nodeId);
    if (!entry) {
      return null;
    }

    const isSelected = focus?.node?.id === nodeId;
    const hasChildren = entry.childIds.length > 0;
    const isExpanded = expandedTreeNodeIds.has(nodeId);
    const selectTreeNode = () => {
      if (mapCanvasMode === 'layers') {
        if (hasChildren) {
          openLayerAtNode(entry.node.id);
        } else {
          setLayerParentNodeId(entry.parentId ?? 'top');
          clearMapTransientUi();
          runMapCommand('center-layer');
        }
      }

      void handleCanvasNodeSelect(entry.node);
    };
    const rowClassName = `box-border w-full min-w-0 rounded border px-2 py-1.5 transition ${
      isSelected
        ? 'border-[var(--pixel-accent)] bg-[rgba(94,234,212,0.14)] text-[var(--pixel-text)]'
        : 'border-[var(--pixel-line-soft)] bg-[rgba(8,16,29,0.48)] text-[var(--pixel-text-muted)] hover:border-[var(--pixel-line)] hover:text-[var(--pixel-text)]'
    }`;
    const rowContent = (
      <>
        <span className="flex min-w-0 items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              aria-label={isExpanded ? 'Свернуть ветку' : 'Развернуть ветку'}
              aria-expanded={isExpanded}
              onClick={(event) => {
                event.stopPropagation();
                toggleTreeNode(nodeId);
              }}
              className="grid h-5 w-5 shrink-0 place-items-center rounded border border-[var(--pixel-line-soft)] bg-[rgba(2,6,14,0.45)] text-[var(--pixel-text-muted)] transition hover:border-[var(--pixel-accent)] hover:text-[var(--pixel-accent)]"
            >
              <ChevronRight
                size={13}
                className={`transition-transform ${isExpanded ? 'rotate-90 text-[var(--pixel-accent)]' : ''}`}
              />
            </button>
          ) : (
            <span className="h-5 w-5 shrink-0" />
          )}
          <button
            type="button"
            onClick={selectTreeNode}
            className="min-w-0 flex-1 truncate text-left"
            title={entry.node.title}
          >
            {entry.node.title}
          </button>
        </span>
        <span className="shrink-0 text-[10px] uppercase text-[var(--pixel-text-dim)]">
          {hasChildren ? `${entry.descendantCount} узл.` : statusLabel(entry.node.status)}
        </span>
      </>
    );
    const row = (
      <div
        className={`${rowClassName} flex items-center justify-between gap-2`}
        style={{ marginLeft: entry.depth * 12, width: `calc(100% - ${entry.depth * 12}px)` }}
      >
        {rowContent}
      </div>
    );

    if (!hasChildren) {
      return <div key={nodeId}>{row}</div>;
    }

    return (
      <div key={nodeId} className="min-w-0">
        {row}
        <div className={`mt-1 grid gap-1 ${isExpanded ? '' : 'hidden'}`} aria-hidden={!isExpanded}>
          {entry.childIds.map((childId) => renderStructureTreeNode(childId))}
        </div>
      </div>
    );
  };

  const showFocusedLearnerCheckFlow = shouldUseFocusedLearnerLessonScreen({
    canUseAuthorTools,
    inspectorMode,
    hasFocusedNode: Boolean(focus?.node),
  });
  const mapShellClassName = getNavigationMapShellClassName({
    isFocusedLearnerLessonScreen: showFocusedLearnerCheckFlow,
    isInspectorCollapsed,
  });
  const showNavigationInspectorRail = shouldShowNavigationInspectorRail({
    isFocusedLearnerLessonScreen: showFocusedLearnerCheckFlow,
    isInspectorCollapsed,
  });
  const inspectorRailClassName =
    'navigation-inspector-rail min-w-0 max-w-full self-start xl:sticky xl:top-3 xl:justify-self-end xl:w-[380px] 2xl:w-[420px]';
  const mapCanvasClassName = `${
    focus?.node && !isInspectorCollapsed ? 'h-[340px]' : 'h-[420px]'
  } navigation-map-canvas min-w-0 max-w-full overflow-hidden rounded-md border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)] sm:h-[clamp(680px,calc(100dvh-220px),1040px)]`;

  return (
    <div className="space-y-3">
      {error ? (
        <PixelSurface frame="destructive" padding="md">
          <PixelText as="p" readable size="sm">
            {error}
          </PixelText>
        </PixelSurface>
      ) : null}

      <section className={mapShellClassName}>
        <div className="navigation-map-workspace min-w-0 space-y-4">
          {showFocusedLearnerCheckFlow && focus?.node ? (
            <div className="navigation-focused-lesson-screen">
              {renderLearnerFocusedCheckFlow(focus)}
            </div>
          ) : (
          <PixelSurface frame="secondary" padding="md" className="navigation-map-panel">
            <PixelPanelHeader
              eyebrow={canUseAuthorTools ? 'Граф' : 'Карта'}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <MapIcon size={20} className="text-[var(--pixel-accent)]" /> Карта задач
                </span>
              }
              description={`${mapFocusTitle} · ${mapFocusPath}`}
              aside={
                <div className="flex flex-wrap items-center gap-2">
                  <PixelButton
                    tone={isInspectorCollapsed ? 'accent' : 'ghost'}
                    onClick={() => setIsInspectorCollapsed((value) => !value)}
                    aria-expanded={!isInspectorCollapsed}
                    aria-controls="navigation-inspector-rail"
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                    <Eye size={16} />{' '}
                    {canUseAuthorTools
                      ? isInspectorCollapsed
                        ? 'Показать инспектор'
                        : 'Скрыть инспектор'
                      : isInspectorCollapsed
                        ? 'Показать детали'
                        : 'Скрыть детали'}
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

            <div
              className={`navigation-map-body mt-3 min-w-0 space-y-3${
                showFocusedLearnerCheckFlow ? ' navigation-map-body--focused-check' : ''
              }`}
            >
              {canUseAuthorTools || canEditGraph ? (
              <PixelSurface frame="secondary" padding="sm" className="navigation-map-controls navigation-map-structure-controls">
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
                </div>
              </PixelSurface>
              ) : null}

              <PixelSurface frame="secondary" padding="sm" className="navigation-map-controls navigation-map-view-controls">
                {canUseAuthorTools ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Вид карты
                    </PixelText>
                    <PixelButton
                      tone={mapCanvasMode === 'free' ? 'accent' : 'ghost'}
                      onClick={() => {
                        setHasManualMapViewport(false);
                        setMapCanvasMode('free');
                        clearMapTransientUi();
                      }}
                      disabled={!hasMapNodes}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <MapIcon size={14} /> Свободный канвас
                    </PixelButton>
                    <PixelButton
                      tone={mapCanvasMode === 'layers' ? 'accent' : 'ghost'}
                      onClick={() => {
                        setHasManualMapViewport(false);
                        setMapCanvasMode('layers');
                        setIsRouteFilterEnabled(false);
                        setLayerParentNodeId(fallbackLayerParentId);
                        clearMapTransientUi();
                      }}
                      disabled={!hasMapNodes}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <GitBranch size={14} /> Слои
                    </PixelButton>
                    <PixelButton
                      tone={isRouteFilterActive ? 'accent' : 'ghost'}
                      onClick={() => {
                        setHasManualMapViewport(false);
                        setIsRouteFilterEnabled((value) => {
                          const next = !value;
                          if (next) {
                            setMapCanvasMode('free');
                            setLayerParentNodeId(null);
                          }
                          return next;
                        });
                        clearMapTransientUi();
                      }}
                      disabled={routeNodeIds.size === 0}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                      title={routeNodeIds.size === 0 ? 'В текущем маршруте пока нет узлов карты' : undefined}
                    >
                      <Target size={14} /> Маршрут
                    </PixelButton>
                  </div>
                  {routeNodeIds.size > 0 ? (
                    <PixelText as="span" size="xs" color={isRouteFilterActive ? 'accent' : 'textMuted'} uppercase>
                      {isRouteFilterActive
                        ? `Фильтр: ${routeNodeIds.size} узл.`
                      : `В маршруте: ${routeNodeIds.size} узл.`}
                    </PixelText>
                  ) : null}
                </div>
                ) : (
                <div className="navigation-learner-map-overview">
                  <div className="navigation-learner-map-overview__main">
                    <PixelText as="span" size="xs" color="textDim" uppercase>
                      Обзор прогресса
                    </PixelText>
                    <PixelText as="span" readable size="sm">
                      {isRouteFilterActive
                        ? currentSpecialization?.name ?? 'Текущий маршрут'
                        : selectedSphere?.name ?? 'Вся карта'}
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted">
                      {isRouteFilterActive
                        ? 'Карта показывает порядок маршрута, текущий шаг, готовые и закрытые узлы.'
                        : 'Показана вся учебная карта без редакторских инструментов.'}
                    </PixelText>
                    <PixelText as="span" size="xs" color="accent">
                      Нажмите узел, чтобы открыть занятие или проверку.
                    </PixelText>
                  </div>
                  <div className="navigation-learner-map-overview__legend" aria-label="Состояния узлов маршрута">
                    {learnerRouteStatusItems.map((item) => (
                      <span key={item.key} className={`navigation-learner-map-overview__legend-item navigation-learner-map-overview__legend-item--${item.key}`}>
                        <strong>{item.value}</strong>
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <div className="navigation-learner-map-overview__actions">
                    <PixelButton
                      tone={isRouteFilterActive ? 'accent' : 'ghost'}
                      onClick={() => {
                        setHasManualMapViewport(false);
                        setMapCanvasMode('free');
                        setLayerParentNodeId(null);
                        setIsRouteFilterEnabled(true);
                        clearMapTransientUi();
                        runMapCommand('fit-overview');
                      }}
                      disabled={routeNodeIds.size === 0}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Target size={14} /> Маршрут
                    </PixelButton>
                    <PixelButton
                      tone={!isRouteFilterActive ? 'accent' : 'ghost'}
                      onClick={() => {
                        setHasManualMapViewport(false);
                        setIsRouteFilterEnabled(false);
                        clearMapTransientUi();
                        runMapCommand('fit-overview');
                      }}
                      disabled={!hasMapNodes}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <MapIcon size={14} /> Вся карта
                    </PixelButton>
                    <PixelButton
                      tone="ghost"
                      onClick={() => runMapCommand('focus-node')}
                      disabled={!focus?.node}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Compass size={14} /> К текущему
                    </PixelButton>
                  </div>
                </div>
                )}
              </PixelSurface>

              {isRouteFilterActive && routeOverviewStages.length > 0 ? (
                <PixelSurface frame="inset" padding="sm" className="navigation-route-overview">
                  <div className="navigation-route-overview__header">
                    <PixelText as="span" size="xs" color="accent" uppercase>
                      Обзор маршрута
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      {routeItems.length} узл. / {activeRouteTargetIndex >= 0 ? `шаг #${activeRouteTargetIndex + 1}` : 'нет текущего шага'}
                    </PixelText>
                  </div>
                  <div className="navigation-route-overview__stages">
                    {routeOverviewStages.map((stage) => {
                      const stageAsset = hasCoreCsAssets ? resolveRouteLandmarkAsset(stage.label) : null;
                      const stageProgressPercent =
                        stage.items.length > 0 ? Math.round((stage.completedCount / stage.items.length) * 100) : 0;

                      return (
                      <div
                        key={stage.key}
                        className={`navigation-route-overview__stage${stage.hasCurrentFront ? ' navigation-route-overview__stage--front' : ''}`}
                      >
                        <ReferenceAssetImage
                          asset={stageAsset}
                          decorative
                          className="navigation-route-overview__stage-thumb"
                          fallback={
                            <span className="navigation-route-overview__stage-thumb navigation-route-overview__stage-thumb--fallback" />
                          }
                        />
                        <div className="navigation-route-overview__stage-heading">
                          <PixelText as="span" readable size="sm">
                            {stage.label}
                          </PixelText>
                          <PixelText as="span" size="xs" color="textMuted" uppercase>
                            {stage.completedCount}/{stage.items.length}
                          </PixelText>
                        </div>
                        <span className="navigation-route-overview__stage-meter" aria-hidden="true">
                          <span style={{ width: `${stageProgressPercent}%` }} />
                        </span>
                        <div className="navigation-route-overview__nodes">
                          {stage.visibleItems.map((item) => {
                            const isFront = activeRouteTargetItem?.id === item.id;
                            const isFocused = focus?.node?.id != null && item.node_id === focus.node.id;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                className={routeOverviewNodeClassName(item, isFront, isFocused)}
                                onClick={() => selectRouteItemOnMap(item)}
                              >
                                <span>#{item.route_order ?? item.id}</span>
                                <strong>{item.title}</strong>
                              </button>
                            );
                          })}
                          {stage.hiddenCount > 0 ? (
                            <span className="navigation-route-overview__more">+{stage.hiddenCount} еще</span>
                          ) : null}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </PixelSurface>
              ) : null}

              {mapCanvasMode === 'layers' ? (
                <PixelSurface frame="inset" padding="sm" className="navigation-map-layer-panel" style={{ order: 2 }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Слой
                    </PixelText>
                    <PixelText as="span" readable size="sm">
                      {layerParentEntry?.node.title ?? selectedSphere?.name ?? 'Корень структуры'}
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted">
                      {layerParentEntry
                        ? 'Новые пункты добавляются сюда'
                        : 'Новые пункты станут разделами верхнего уровня'}
                    </PixelText>
                    <PixelButton
                      tone="ghost"
                      onClick={() => {
                        setLayerParentNodeId(layerParentParentId ?? 'top');
                        clearMapTransientUi();
                        runMapCommand('center-layer');
                      }}
                      disabled={!layerParentEntry}
                      style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
                    >
                      <Target size={13} /> Уровень выше
                    </PixelButton>
                    <PixelButton
                      tone={isTopLayerOpen ? 'accent' : 'ghost'}
                      onClick={openTopLayer}
                      disabled={!structureHierarchy.roots.length}
                      style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
                    >
                      <MapIcon size={13} /> Все разделы
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
                                if (child.childIds.length) {
                                  openLayerAtNode(child.node.id);
                                }

                                void handleCanvasNodeSelect(child.node);
                              }}
                              style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
                            >
                              {child.node.title}
                            </PixelButton>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </PixelSurface>
              ) : null}

              {canUseAuthorTools ? (
              <PixelSurface frame="secondary" padding="sm" className="navigation-map-controls navigation-map-tool-controls">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Инструменты
                    </PixelText>
                    <PixelButton
                      tone={mapEditTool === 'select' ? 'accent' : 'ghost'}
                      onClick={selectMapTool}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <MapIcon size={14} /> Выбор
                    </PixelButton>
                    <PixelButton
                      tone={mapEditTool === 'create' ? 'accent' : 'ghost'}
                      onClick={startCreateMapTool}
                      disabled={!canCreateNodes || !canUseVisibleCreateTool || isMapMutating}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <Plus size={14} /> {createToolLabel}
                    </PixelButton>
                    <PixelButton
                      tone={mapEditTool === 'connect' ? 'accent' : 'ghost'}
                      onClick={startConnectMapTool}
                      disabled={!canCreateEdges || !focus?.node || isMapMutating}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <GitBranch size={14} /> Соединить
                    </PixelButton>
                    <PixelButton
                      tone="danger"
                      onClick={async () => {
                        if (!selectedEdge || isMapMutating) {
                          return;
                        }

                        if (!confirmAuthorAction('delete-edge', 'Удалить выбранную связь с карты?')) {
                          return;
                        }

                        const deleted = await onDeleteEdge(selectedEdge.id);
                        if (deleted) {
                          setSelectedEdgeId(null);
                          setFloatingMapPanel(null);
                        }
                      }}
                      disabled={!canDeleteEdges || !selectedEdge || isMapMutating}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <X size={14} /> Удалить связь
                    </PixelButton>
                    <PixelButton
                      tone="danger"
                      onClick={() => requestFocusedNodeArchive('map')}
                      disabled={!canArchiveNodes || !focus?.node || isMapMutating || isEditorArchived}
                      className="inspector-danger-button"
                      style={{
                        minHeight: 30,
                        padding: '6px 10px',
                        gap: 6,
                      }}
                    >
                      <Archive size={14} /> Архивировать узел
                    </PixelButton>
                  </div>
                  {mapEditTool !== 'select' ? (
                    <PixelButton
                      tone="ghost"
                      onClick={selectMapTool}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <X size={14} /> Отмена
                    </PixelButton>
                  ) : null}
                </div>

                {mapEditTool !== 'select' || selectedEdge ? (
                  <PixelSurface frame="inset" padding="sm" className="mt-3">
                    {mapEditTool === 'create' ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <PixelText as="span" readable size="sm" color="textMuted">
                          {createToolStatus} Кликните по свободному месту на карте.
                        </PixelText>
                        <PixelButton
                          tone="accent"
                          onClick={() => {
                            void createNodeFromVisibleTool();
                          }}
                          disabled={!canCreateNodes || !canUseVisibleCreateTool || isMapMutating}
                          style={{ minHeight: 28, padding: '5px 8px', gap: 6 }}
                        >
                          <Plus size={13} /> {mapCanvasMode === 'layers' ? 'Создать в слое' : 'Создать рядом'}
                        </PixelButton>
                      </div>
                    ) : null}
                    {mapEditTool === 'connect' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <PixelText as="span" readable size="sm" color="textMuted">
                          {selectedConnectSourceNode
                            ? `Источник: ${selectedConnectSourceNode.title}. Выберите целевой узел.`
                            : 'Выберите узел-источник.'}
                        </PixelText>
                        {(['supports', 'requires', 'relates_to'] as GraphEdgeType[]).map((edgeType) => {
                          const semantics = getGraphEdgeSemantics(edgeType);
                          return (
                            <PixelButton
                              key={edgeType}
                              tone={connectEdgeType === edgeType ? 'accent' : 'ghost'}
                              onClick={() => setConnectEdgeType(edgeType)}
                              style={{ minHeight: 26, padding: '4px 8px', gap: 5 }}
                            >
                              {semantics.label}
                            </PixelButton>
                          );
                        })}
                      </div>
                    ) : null}
                    {selectedEdge && selectedEdgeSemantics ? (
                      <PixelText as="p" readable size="sm" color="textMuted" style={{ margin: mapEditTool === 'select' ? 0 : '8px 0 0' }}>
                        Выбрана связь: {selectedEdgeSemantics.label}: {selectedEdgeSourceNode?.title ?? 'Источник'} {'->'}{' '}
                        {selectedEdgeTargetNode?.title ?? 'Цель'}.
                      </PixelText>
                    ) : null}
                  </PixelSurface>
                ) : null}
              </PixelSurface>
              ) : null}

              {canUseAuthorTools && (editorNotice || canUndoMapMutation) ? (
                <PixelSurface frame="inset" padding="sm" className="navigation-map-archive-panel" style={{ order: 6 }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <PixelText as="p" readable size="sm" color="textMuted" style={{ margin: 0 }}>
                      {editorNotice ?? 'Последнее действие можно отменить.'}
                    </PixelText>
                    <PixelButton
                      tone="ghost"
                      onClick={() => void onUndoMapMutation()}
                      disabled={!canUndoMapMutation || isMapMutating}
                      style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    >
                      <RotateCcw size={14} /> Отменить
                    </PixelButton>
                  </div>
                </PixelSurface>
              ) : null}

              {canUseAuthorTools && selectedStructureArchivedNodes.length > 0 ? (
                <PixelSurface frame="inset" padding="sm">
                  <PixelStack gap="xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                        Архив структуры
                      </PixelText>
                      <PixelText as="span" size="xs" color="textMuted" uppercase>
                        {selectedStructureArchivedNodes.length} узл.
                      </PixelText>
                    </div>
                    <div className="grid gap-2">
                      {selectedStructureArchivedNodes.slice(0, 5).map((node) => (
                        <div
                          key={node.id}
                          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                        >
                          <div className="min-w-0">
                            <PixelText as="p" readable size="sm" style={{ margin: 0 }}>
                              {node.title}
                            </PixelText>
                            <PixelText as="p" size="xs" color="textMuted" style={{ marginTop: 2 }}>
                              {node.direction_name} / {node.skill_name}
                            </PixelText>
                          </div>
                          <PixelButton
                            tone="ghost"
                            onClick={() => void onRestoreNode({ nodeId: node.id })}
                            disabled={isMapMutating}
                            style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                          >
                            <RotateCcw size={14} /> Восстановить
                          </PixelButton>
                        </div>
                      ))}
                    </div>
                  </PixelStack>
                </PixelSurface>
              ) : null}

              <div className="navigation-map-focus-strip flex flex-wrap items-center gap-2">
                <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                  <div className="flex max-w-full flex-wrap items-center gap-2">
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      {canUseAuthorTools ? 'Фокус' : 'Текущий шаг'}
                    </PixelText>
                    <PixelText as="span" readable size="sm">
                      {focusChipNode}
                    </PixelText>
                    <PixelText as="span" size="xs" color="textMuted">
                      {focusChipScope}
                    </PixelText>
                    {focusChipBranch ? (
                      <PixelText as="span" size="xs" color="textMuted">
                        {focusChipBranch}
                      </PixelText>
                    ) : null}
                    {focusChipRoute ? (
                      <PixelText as="span" size="xs" color="accent" uppercase>
                        {focusChipRoute}
                      </PixelText>
                    ) : null}
                  </div>
                </PixelSurface>
                <PixelButton
                  tone="ghost"
                  onClick={() => runMapCommand('fit-overview')}
                  disabled={!hasMapNodes}
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  title="Вернуть карту к общему виду"
                >
                  <Compass size={14} /> Обзор
                </PixelButton>
                {focus?.node ? (
                  <PixelButton
                    tone="ghost"
                    onClick={() => runMapCommand('focus-node')}
                    disabled={!hasMapNodes}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                    title="Показать текущий узел без смены масштаба"
                  >
                    <Target size={14} /> {canUseAuthorTools ? 'Фокус' : 'К текущему'}
                  </PixelButton>
                ) : null}
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
                {mapMutationPendingAction === 'restore-node' ? (
                  <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
                    <PixelText as="span" size="xs" color="textMuted" uppercase>
                      Восстанавливаю узел...
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

              {showFocusedLearnerCheckFlow && focus?.node ? (
                renderLearnerFocusedCheckFlow(focus)
              ) : (
              <PixelSurface frame="selected" padding="xxs" className="navigation-map-canvas-frame min-w-0 overflow-hidden">
                  <GameMapCanvas
                    snapshot={snapshot}
                    focus={focus}
                    visibleSphereId={isRouteFilterActive && mapCanvasMode === 'free' ? null : selectedSphereId}
                    visibleSkillId={isRouteFilterActive && mapCanvasMode === 'free' ? null : visibleSkillId}
                    canvasMode={mapCanvasMode}
                    visibleNodeIds={canvasVisibleNodeIds}
                    routeNodeMetadata={routeNodeMetadata}
                    onSelectNode={handleCanvasNodeSelect}
                    onFocusChange={setIsMapFocused}
                    onUserCameraControl={() => setHasManualMapViewport(true)}
                    onSelectEdge={canEditGraph ? (edgeId) => {
                      setSelectedEdgeId(edgeId);
                      setMapEditTool('select');
                      setConnectSourceNodeId(null);
                      setCanvasContextMenu(null);
                      setInlineNodeEditor(null);
                    } : undefined}
                    onCreateNodeAt={canCreateNodes ? async (input) =>
                      createNodeFromCanvasPoint(
                        { worldX: input.x, worldY: input.y },
                        undefined,
                        mapCanvasMode === 'layers' ? 'layer-child' : 'free-node',
                        selectedSkill,
                        mapCanvasMode,
                        mapCanvasMode === 'layers' ? layerParentEntry?.node.id ?? null : null,
                      )
                    : undefined}
                    onCreateChildNodeAt={canCreateNodes ? async (input) => {
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

                      const createPosition =
                        mapCanvasMode === 'layers'
                          ? resolveCanvasCreatePosition({
                              route: {
                                createMode: 'layer-child',
                                parentNodeId: input.parentNodeId,
                                preserveLayerMode: true,
                              },
                              pointerPosition: { x: input.x, y: input.y },
                              parentPosition: {
                                x: parentNode.x ?? input.x,
                                y: parentNode.y ?? input.y,
                              },
                              siblingCount:
                                structureHierarchy.entries.get(input.parentNodeId)?.childIds.length ?? 0,
                            })
                          : { x: input.x, y: input.y };
                      const created = await onCreateChildNodeAt({
                        parentNodeId: input.parentNodeId,
                        skillId: parentSkill.id,
                        existingNodeCount: parentSkill.nodes.length,
                        x: createPosition.x,
                        y: createPosition.y,
                        title: undefined,
                      });
                      if (created) {
                        setCanvasContextMenu(null);
                        setInlineNodeEditor(null);
                        setFloatingMapPanel(null);
                        setSelectedEdgeId(null);
                        if (mapCanvasMode === 'layers') {
                          setLayerParentNodeId(input.parentNodeId);
                          runMapCommand('center-layer');
                        }
                      }
                      return created;
                    } : undefined}
                    onCreateEdge={canCreateEdges ? async (input) => {
                      if (isMapMutating) {
                        return false;
                      }

                      setPendingEdgeSelection(input);
                      const created = await onCreateEdge(input);
                      if (created) {
                        setCanvasContextMenu(null);
                        if (typeof created === 'number') {
                          setSelectedEdgeId(created);
                          setPendingEdgeSelection(null);
                        }
                        setMapEditTool('select');
                        setConnectSourceNodeId(null);
                      } else {
                        setPendingEdgeSelection(null);
                      }
                      return created;
                    } : undefined}
                    mapCommand={mapCommand}
                    previewNodePositions={layerPreviewPositions}
                    interactionMode={canUseAuthorTools ? (mapCanvasMode === 'free' ? 'free-edit' : 'layer-edit') : 'readonly'}
                    createMode={canCreateNodes && mapEditTool === 'create'}
                    snapToGrid={false}
                    selectedEdgeId={selectedEdgeId}
                    connectSourceNodeId={canCreateEdges && mapEditTool === 'connect' ? connectSourceNodeId : null}
                    connectEdgeType={canCreateEdges && mapEditTool === 'connect' ? connectEdgeType : null}
                    onCanvasContextMenu={canUseAuthorTools ? (menu) => {
                      setCanvasContextMenu(menu);
                      setNodeCreateTitle('');
                      setInlineNodeEditor(null);
                      setFloatingMapPanel(null);
                    } : undefined}
                    onCanvasDoubleClick={canCreateNodes ? (input) => {
                      startInlineCreate(input);
                    } : undefined}
                    onNodeDoubleClick={canUseAuthorTools ? (input) => {
                      void handleCanvasNodeSelect(input.node);
                      startInlineRename(input.node, input);
                    } : undefined}
                    onCanvasPointerDown={(hit) => {
                      if (hit.button === 0 && hit.nodeId == null && hit.edgeId == null) {
                        setCanvasContextMenu(null);
                        setNodeCreateTitle('');
                        setInlineNodeEditor(null);
                        setFloatingMapPanel(null);
                      } else if (hit.button === 0 && hit.nodeId != null) {
                        setCanvasContextMenu(null);
                        setInlineNodeEditor(null);
                        setFloatingMapPanel(null);
                      } else if (hit.button === 0 && hit.edgeId != null) {
                        setFloatingMapPanel({
                          edgeId: hit.edgeId,
                          screenX: hit.screenX,
                          screenY: hit.screenY,
                        });
                      }
                    }}
                    onMoveNode={canMoveNodes && mapCanvasMode === 'free' ? onMoveNode : undefined}
                  className={mapCanvasClassName}
                />
              </PixelSurface>
              )}

              {canUseAuthorTools && inlineNodeEditor ? (
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
                  <PixelSurface frame="secondary" padding="xs">
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

              {canUseAuthorTools && floatingMapPanel && floatingPanelEdge && !inlineNodeEditor && !canvasContextMenu ? (
                <div
                  className="fixed z-40"
                  style={{
                    left: Math.min(floatingMapPanel.screenX + 24, window.innerWidth - 280),
                    top: Math.max(8, Math.min(floatingMapPanel.screenY - 54, window.innerHeight - 120)),
                  }}
                >
                  <PixelSurface frame="destructive" padding="xxs" fullWidth={false}>
                    <div className="flex items-center gap-1">
                      <PixelButton
                        tone="danger"
                        onClick={async () => {
                          if (!confirmAuthorAction('delete-edge', 'Удалить эту связь с карты?')) {
                            return;
                          }

                          const deleted = await onDeleteEdge(floatingPanelEdge.id);
                          if (deleted) {
                            setSelectedEdgeId(null);
                            setFloatingMapPanel(null);
                          }
                        }}
                        disabled={isMapMutating}
                        style={{ minHeight: 28, padding: '5px 7px' }}
                        title="Удалить связь"
                      >
                        <X size={13} /> Удалить связь
                      </PixelButton>
                    </div>
                  </PixelSurface>
                </div>
              ) : null}

              {canUseAuthorTools && canvasContextMenu ? (
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
                            tone="danger"
                            onClick={async () => {
                              if (!confirmAuthorAction('delete-edge', 'Удалить эту связь с карты?')) {
                                return;
                              }

                              const deleted = await onDeleteEdge(contextEdge.id);
                              if (deleted) {
                                setSelectedEdgeId(null);
                                setCanvasContextMenu(null);
                              }
                            }}
                            disabled={isMapMutating || !canDeleteEdges}
                            style={{
                              justifyContent: 'flex-start',
                              minHeight: 30,
                              padding: '6px 8px',
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
                          <PixelButton
                            tone="danger"
                            onClick={() =>
                              requestNodeArchive({
                                nodeId: contextNode.id,
                                title: contextNode.title,
                                source: 'context-menu',
                              })
                            }
                            disabled={isMapMutating || contextNode.status === 'archived'}
                            style={{
                              justifyContent: 'flex-start',
                              minHeight: 30,
                              padding: '6px 8px',
                            }}
                          >
                            Архивировать узел
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
                            disabled={!canCreateNodeFromContext || isMapMutating}
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
                              {mapCanvasMode === 'layers' ? 'Добавить внутрь' : 'Создать дочерний узел'}
                            </PixelButton>
                          ) : null}
                          {contextNode && mapCanvasMode === 'layers' ? (
                            <PixelText as="span" size="xs" color="textMuted" style={{ margin: '2px 4px' }}>
                              Или добавить рядом, в открытый слой
                            </PixelText>
                          ) : null}
                          <PixelButton
                            tone="accent"
                          onClick={() => {
                            void handleCreateNodeFromContext();
                          }}
                          disabled={!canCreateNodeFromContext || isMapMutating}
                          style={{ justifyContent: 'flex-start', minHeight: 30, padding: '6px 8px' }}
                        >
                          {contextCreateActionLabel}
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

            </div>
          </PixelSurface>
          )}

        </div>

        {showNavigationInspectorRail ? (
        <div id="navigation-inspector-rail" className={inspectorRailClassName}>
          <PixelStack gap="md">
            <PixelSurface frame="secondary" padding="md" className="navigation-inspector-panel">
              {isFocusLoading && !focus?.node ? (
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
                    Выберите узел на карте.
                  </PixelText>
                </PixelSurface>
              ) : null}

              {focus?.node && editorDraft ? (
                <PixelStack gap="md">
                  <PixelPanelHeader
                    eyebrow={
                      <span className="inline-flex items-center gap-2">
                        {canUseAuthorTools ? 'Инспектор' : 'Занятие'}
                        {isFocusLoading ? (
                          <span className="text-[10px] uppercase text-[var(--pixel-text-dim)]">обновляю</span>
                        ) : null}
                      </span>
                    }
                    title={editorDraft.title}
                    description={editorDraft.theme}
                  />

                  <PixelSurface frame="inset" padding="sm" className="navigation-node-summary">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <PixelText
                          as="span"
                          size="xs"
                          color={canUseAuthorTools && isEditorDirty ? 'accent' : 'textDim'}
                          uppercase
                          className={canUseAuthorTools && isEditorDirty ? 'draft-status draft-status--dirty' : 'draft-status'}
                        >
                          {canUseAuthorTools ? (isEditorDirty ? 'Есть правки' : 'Сохранено') : 'Режим ученика'}
                        </PixelText>
                        {canUseAuthorTools ? (
                        <details className="inspector-compact-details">
                          <summary>Детали</summary>
                          <div className="inspector-compact-details__body">
                            <span>ID {focus.node.id}</span>
                            <span>Тип: {typeLabel(editorDraft.type)}</span>
                            <span>Статус: {statusLabel(editorDraft.status)}</span>
                            <span>
                              Обновлено: {focus.node.updated_at?.slice(0, 16).replace('T', ' ') ?? 'нет даты'}
                            </span>
                            <span>Проверка: {getCheckMetadataPreview(editorDraft.checkMetadata)}</span>
                          </div>
                        </details>
                        ) : null}
                      </div>
                      {(editorDraft.summary || focus.node.summary) ? (
                        <PixelText as="p" readable size="sm" color="textMuted">
                          {editorDraft.summary || focus.node.summary}
                        </PixelText>
                      ) : null}
                    </div>
                  </PixelSurface>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={canUseAuthorTools ? 'Режим инспектора' : 'Разделы занятия'}>
                    {([
                      { id: 'overview', label: 'Обзор' },
                      { id: 'route', label: 'Маршрут' },
                      { id: 'assessment', label: 'Проверка' },
                      { id: 'graph', label: 'Граф' },
                    ] as Array<{ id: InspectorMode; label: string }>)
                      .filter((item) => {
                        if (item.id === 'route') {
                          return canEditRoutes;
                        }
                        if (item.id === 'graph') {
                          return canEditGraph;
                        }
                        return item.id === 'overview' || item.id === 'assessment';
                      })
                      .map((item) => (
                      <PixelButton
                        key={item.id}
                        type="button"
                        tone={inspectorMode === item.id ? 'accent' : 'ghost'}
                        onClick={() => handleInspectorModeChange(item.id)}
                        aria-pressed={inspectorMode === item.id}
                        style={{ justifyContent: 'center', minHeight: 30, padding: '6px 8px' }}
                      >
                        {item.label}
                      </PixelButton>
                    ))}
                  </div>

                  {inspectorMode === 'overview' && canUseAuthorTools ? (
                    <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
                      <div className="grid gap-2">
                        <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                          Основное действие
                        </PixelText>
                        <PixelButton
                          tone="accent"
                          onClick={() => setIsEditorExpanded(true)}
                          disabled={isEditorBusy}
                          fullWidth
                          style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                        >
                          <PencilLine size={15} /> Редактировать узел
                        </PixelButton>
                        <div className="grid grid-cols-2 gap-2">
                          <PixelButton
                            tone="ghost"
                            onClick={async () => {
                              const duplicated = await onDuplicateNode({
                                nodeId: focus.node.id,
                                x: (focus.node.x ?? 0) + 40,
                                y: (focus.node.y ?? 0) + 40,
                              });
                              if (duplicated) {
                                setFloatingMapPanel(null);
                                setSelectedEdgeId(null);
                              }
                            }}
                            disabled={isMapMutating}
                            style={{ justifyContent: 'center', minHeight: 30, padding: '6px 8px', gap: 6 }}
                          >
                            <Copy size={14} /> Дубль
                          </PixelButton>
                          {focusHierarchyEntry?.childIds.length ? (
                            <PixelButton
                              tone="ghost"
                              onClick={() => openLayerAtNode(focus.node.id)}
                              style={{ justifyContent: 'center', minHeight: 30, padding: '6px 8px', gap: 6 }}
                            >
                              <GitBranch size={14} /> Слой
                            </PixelButton>
                          ) : null}
                          <PixelButton
                            tone="danger"
                            onClick={() => requestFocusedNodeArchive('inspector')}
                            disabled={isMapMutating || isEditorArchived}
                            className="inspector-danger-button"
                            style={{
                              justifyContent: 'center',
                              minHeight: 30,
                              padding: '6px 8px',
                              gap: 6,
                            }}
                          >
                            <Archive size={14} /> Архивировать
                          </PixelButton>
                        </div>
                      </div>
                    </PixelSurface>
                  ) : null}

                  {inspectorMode === 'overview' ? (
                    <>
                      <PixelMeter
                        value={completionValue}
                        max={100}
                        label="Прогресс узла"
                        tone={focus.session?.status === 'active' ? 'success' : 'accent'}
                        showValue
                      />

                      {renderLearnerLessonPanel(focus)}

                      {renderMasteryPanel(focus, 'overview')}

                      <div className="grid gap-2 grid-cols-2">
                        <PixelStatCard label="Открыто" value={focus.progress.openActions} tone="inset" compact />
                        <PixelStatCard
                          label="Риск"
                          value={riskLabel(focus.reviewState?.current_risk ?? 'none')}
                          tone="inset"
                          compact
                        />
                      </div>
                    </>
                  ) : null}

                  {canEditRoutes && inspectorMode === 'route' ? renderMasteryPanel(focus, 'route') : null}
                  {inspectorMode === 'assessment'
                    ? showFocusedLearnerCheckFlow
                      ? renderLearnerFocusedCheckRailSummary(focus)
                      : renderMasteryPanel(focus, 'assessment')
                    : null}

                  {canEditGraph && inspectorMode === 'graph' ? (
                  <PixelSurface frame="inset" padding="sm" className="inspector-graph-panel">
                    <PixelStack gap="xs">
                      <PixelSurface frame="ghost" padding="sm" className="inspector-primary-action">
                        <PixelStack gap="xs">
                          <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                            Основное действие
                          </PixelText>
                          <PixelButton
                            tone="accent"
                            onClick={startConnectMapTool}
                            disabled={!focus?.node || isMapMutating}
                            fullWidth
                            style={{ minHeight: 36, padding: '8px 10px', gap: 6 }}
                          >
                            <GitBranch size={15} /> Соединить с другим узлом
                          </PixelButton>
                        </PixelStack>
                      </PixelSurface>
                      <div className="grid gap-2 grid-cols-3">
                        <PixelStatCard label="Связи" value={incomingGraphEdges.length + outgoingGraphEdges.length} tone="inset" compact />
                        <PixelStatCard label="Исход." value={outgoingGraphEdges.length} tone="inset" compact />
                        <PixelStatCard label="Вход." value={incomingGraphEdges.length} tone="inset" compact />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
                          Граф
                        </PixelText>
                        <PixelText as="span" size="xs" color="textMuted" uppercase>
                          {outgoingGraphEdges.length} исход. / {incomingGraphEdges.length} вход.
                        </PixelText>
                      </div>

                      {selectedEdge && selectedEdgeSemantics ? (
                        <PixelSurface frame="ghost" padding="xs">
                          <div className="flex items-start justify-between gap-2">
                            <PixelText as="p" readable size="xs">
                              {selectedEdgeSemantics.label}: {selectedEdgeSourceNode?.title ?? 'Источник'} {'->'}{' '}
                              {selectedEdgeTargetNode?.title ?? 'Цель'}
                            </PixelText>
                            <PixelButton
                              tone="danger"
                              onClick={async () => {
                                if (!confirmAuthorAction('delete-edge', 'Удалить выбранную связь с карты?')) {
                                  return;
                                }

                                const deleted = await onDeleteEdge(selectedEdge.id);
                                if (deleted) {
                                  setSelectedEdgeId(null);
                                }
                              }}
                              disabled={isMapMutating || !canDeleteEdges}
                              style={{ minHeight: 26, padding: '4px 8px', gap: 6 }}
                            >
                              <X size={12} /> Убрать
                            </PixelButton>
                          </div>
                        </PixelSurface>
                      ) : null}
                    </PixelStack>
                  </PixelSurface>
                  ) : null}

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

                      {renderCheckMetadataEditor(editorDraft)}

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
                      tone="danger"
                      onClick={() => {
                        if (editorDraft) {
                          requestNodeArchive({
                            nodeId: editorDraft.nodeId,
                            title: editorDraft.title,
                            source: 'editor',
                            draft: editorDraft,
                          });
                        }
                      }}
                      disabled={!editorDraft || isEditorBusy || isEditorArchived}
                      className="inspector-danger-button"
                      style={{
                        minHeight: 30,
                        padding: '6px 10px',
                        gap: 6,
                      }}
                    >
                      <Archive size={16} /> {editorPendingAction === 'archive' ? 'Архивирую…' : 'Архивировать'}
                    </PixelButton>
                  </div>
                  ) : null}
                </PixelStack>
              ) : null}
            </PixelSurface>

            {canEditRoutes && (!focus?.node || inspectorMode === 'route') ? renderRouteAuthoringPanel() : null}

            {canEditGraph && (!focus?.node || inspectorMode === 'graph') ? (
            <PixelSurface frame="secondary" padding="sm" className="min-w-0">
              <PixelPanelHeader
                eyebrow={
                  <span className="flex items-center gap-2">
                    <GitBranch size={14} className="text-[var(--pixel-accent)]" /> Дерево структуры
                  </span>
                }
                title={selectedSphere?.name ?? 'Структура'}
                description={
                  selectedSphere
                    ? 'Быстрая навигация по текущей структуре.'
                    : 'Сначала выберите или создайте структуру.'
                }
              />

              {!selectedSphere ? (
                <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 12 }}>
                  Пока пусто.
                </PixelText>
              ) : structureHierarchy.roots.length > 0 ? (
                <div
                  className="mt-3 grid max-h-[42dvh] min-w-0 gap-1 overflow-y-auto overflow-x-hidden pr-1"
                  style={{ scrollbarGutter: 'stable' }}
                >
                  {structureHierarchy.roots.map((nodeId) => renderStructureTreeNode(nodeId))}
                </div>
              ) : (
                <PixelText as="p" readable color="textMuted" size="sm" style={{ marginTop: 12 }}>
                  В этой структуре пока нет узлов.
                </PixelText>
              )}
            </PixelSurface>
            ) : null}
          </PixelStack>
        </div>
        ) : null}
      </section>

      {canArchiveNodes && pendingNodeArchive ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={cancelPendingNodeArchive} aria-hidden="true" />
          <PixelSurface
            frame="destructive"
            padding="lg"
            role="dialog"
            aria-modal="true"
            aria-label={`Подтвердить архивирование: ${pendingNodeArchive.title}`}
            className="relative w-full max-w-[520px]"
          >
            <PixelStack gap="md">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="mt-1 flex-shrink-0 text-[var(--pixel-danger)]" />
                <div className="min-w-0">
                  <PixelText as="p" size="xs" color="textDim" uppercase>
                    Архивировать узел
                  </PixelText>
                  <PixelText as="h2" readable size="lg" style={{ marginTop: 4, fontWeight: 800 }}>
                    {pendingNodeArchive.title}
                  </PixelText>
                </div>
              </div>
              <PixelText as="p" readable size="sm" color="textMuted">
                Узел исчезнет с карты и из инспектора. Связи и маршрутные данные останутся в базе, а восстановление будет доступно через архив структуры.
              </PixelText>
              {isSystemCampaign ? (
                <PixelSurface frame="warning" padding="xs">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    Это системная кампания. Проверьте название узла перед подтверждением.
                  </PixelText>
                </PixelSurface>
              ) : null}
              {error ? (
                <PixelSurface frame="destructive" padding="xs">
                  <PixelText as="p" readable size="sm" color="textMuted">
                    {error}
                  </PixelText>
                </PixelSurface>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <PixelButton
                  tone="ghost"
                  onClick={cancelPendingNodeArchive}
                  disabled={isMapMutating || isEditorBusy}
                  style={{ minHeight: 34, padding: '7px 12px', gap: 6 }}
                >
                  <X size={15} /> Отмена
                </PixelButton>
                <PixelButton
                  tone="danger"
                  onClick={() => void confirmPendingNodeArchive()}
                  disabled={isMapMutating || isEditorBusy}
                  style={{
                    minHeight: 34,
                    padding: '7px 12px',
                    gap: 6,
                  }}
                >
                  <Archive size={15} /> Подтвердить архив
                </PixelButton>
              </div>
            </PixelStack>
          </PixelSurface>
        </div>
      ) : null}

      {modalEditorDraft && focus?.node ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-200/10 p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-white/10" onClick={() => setIsEditorExpanded(false)} aria-hidden="true" />
          <PixelSurface
            frame="secondary"
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
                  <PixelText as="p" size="xs" color="textDim" uppercase className="debug-label" style={{ marginTop: 4 }}>
                    ID {focus.node.id}
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

              {renderCheckMetadataEditor(modalEditorDraft)}

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
                  tone="danger"
                  onClick={() =>
                    requestNodeArchive({
                      nodeId: modalEditorDraft.nodeId,
                      title: modalEditorDraft.title,
                      source: 'editor',
                      draft: modalEditorDraft,
                    })
                  }
                  disabled={isEditorBusy || isEditorArchived}
                  className="inspector-danger-button"
                  style={{
                    minHeight: 30,
                    padding: '6px 10px',
                    gap: 6,
                  }}
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

              {renderMasteryPanel(modalSummaryFocus, 'overview', true)}

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
                    Узел в архиве. Восстановите его для действий.
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
                      Нет открытых шагов. Создайте шаг в режиме «Настраиваю».
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
                      Ничего не блокирует следующий шаг.
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
