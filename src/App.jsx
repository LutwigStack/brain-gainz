import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  Brain,
  Compass,
  Download,
  Map,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

import * as db from './db';
import {
  PixelButton,
  PixelInput,
  PixelSelect,
  PixelStack,
  PixelSurface,
  PixelText,
} from './components/pixel';
import {
  canDuplicateNodeEditorDraft,
  buildNodeEditorDuplicatePayload,
  buildNodeEditorUpdatePayload,
} from './components/navigation-editor-draft.ts';
import { buildGraphEdgeCreatePayload } from './application/map-edge-payloads.ts';
import { createNavigationFollowUpPayload } from './application/navigation-follow-up.ts';
import { buildMapNodeCreatePayload } from './application/map-node-payloads.ts';
import { getRuntimeProfile } from './platform/runtime.js';

const NowView = lazy(() =>
  import('./components/NowView').then((module) => ({ default: module.NowView })),
);
const NavigationView = lazy(() =>
  import('./components/NavigationView').then((module) => ({ default: module.NavigationView })),
);

export default function App() {
  const runtime = getRuntimeProfile();
  const [activeTab, setActiveTab] = useState('now');
  const normalizedActiveTab = activeTab === 'now' || activeTab === 'map' ? activeTab : 'map';
  const [activeSubject, setActiveSubject] = useState(null);
  const [words, setWords] = useState([]);
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem('braingainz_groq_key') || '');
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('braingainz_target_lang') || 'Russian');
  const [sourceLanguage, setSourceLanguage] = useState(localStorage.getItem('braingainz_source_lang') || 'English');
  const [showSettings, setShowSettings] = useState(false);
  const [nowSnapshot, setNowSnapshot] = useState(null);
  const [nowLoading, setNowLoading] = useState(false);
  const [nowError, setNowError] = useState(null);
  const [nowCreatingStarter, setNowCreatingStarter] = useState(false);
  const [nowFocus, setNowFocus] = useState(null);
  const [nowFocusLoading, setNowFocusLoading] = useState(false);
  const [nowSelection, setNowSelection] = useState(null);
  const [navigationSnapshot, setNavigationSnapshot] = useState(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [navigationError, setNavigationError] = useState(null);
  const [navigationFocus, setNavigationFocus] = useState(null);
  const [navigationFocusLoading, setNavigationFocusLoading] = useState(false);
  const [navigationSelection, setNavigationSelection] = useState(null);
  const [mapStartingSession, setMapStartingSession] = useState(false);
  const [mapCompletingAction, setMapCompletingAction] = useState(false);
  const [mapActiveOutcomeAction, setMapActiveOutcomeAction] = useState(null);
  const [mapOutcomeNote, setMapOutcomeNote] = useState('');
  const [mapBarrierType, setMapBarrierType] = useState('too complex');
  const [mapShrinkTitle, setMapShrinkTitle] = useState('');
  const [nodeEditorPendingAction, setNodeEditorPendingAction] = useState(null);
  const [nodeEditorNotice, setNodeEditorNotice] = useState(null);
  const [mapMutationPendingAction, setMapMutationPendingAction] = useState(null);
  const mapUndoStackRef = useRef([]);

  useEffect(() => {
    const init = async () => {
      try {
        await db.initDb();
        const subjects = await db.getSubjects();

        if (subjects.length > 0) {
          const lastSubjectId = Number(localStorage.getItem('braingainz_last_subject_id'));
          const preferredSubject = subjects.find((subject) => subject.id === lastSubjectId) ?? subjects[0];
          setActiveSubject(preferredSubject);
        }
      } catch (error) {
        console.error('DB Initialization error', error);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!activeSubject) {
      setWords([]);
      return;
    }

    localStorage.setItem('braingainz_last_subject_id', String(activeSubject.id));
    void db.getCards(activeSubject.id).then(setWords);
  }, [activeSubject]);

  useEffect(() => {
    localStorage.setItem('braingainz_groq_key', groqApiKey);
  }, [groqApiKey]);

  useEffect(() => {
    localStorage.setItem('braingainz_target_lang', targetLanguage);
  }, [targetLanguage]);

  useEffect(() => {
    localStorage.setItem('braingainz_source_lang', sourceLanguage);
  }, [sourceLanguage]);

  const chooseNowSelection = (snapshot, preferredSelection = null) => {
    const candidates = [snapshot?.primaryRecommendation, ...(snapshot?.queue ?? [])].filter(Boolean);

    if (candidates.length === 0) {
      return null;
    }

    if (preferredSelection) {
      const matched = candidates.find((candidate) => candidate.actionId === preferredSelection.actionId);

      if (matched) {
        return { nodeId: matched.nodeId, actionId: matched.actionId };
      }
    }

    return {
      nodeId: candidates[0].nodeId,
      actionId: candidates[0].actionId,
    };
  };

  const loadNowFocus = async (selection) => {
    if (!selection) {
      setNowFocus(null);
      return;
    }

    setNowFocusLoading(true);

    try {
      const focus = await db.getNowNodeFocus(selection.nodeId, selection.actionId);
      setNowFocus(focus);
    } catch (error) {
      console.error('Failed to load Now focus', error);
      setNowError(error.message || 'Не удалось загрузить детали узла.');
    } finally {
      setNowFocusLoading(false);
    }
  };

  const loadNavigationFocus = async (selection) => {
    if (!selection?.nodeId) {
      setNavigationFocus(null);
      return;
    }

    setNavigationFocusLoading(true);

    try {
      const focus = await db.getNowNodeFocus(selection.nodeId, selection.actionId ?? null);
      setNavigationFocus(focus);
    } catch (error) {
      console.error('Failed to load navigation focus', error);
      setNavigationError(error.message || 'Не удалось загрузить выбранный узел.');
    } finally {
      setNavigationFocusLoading(false);
    }
  };

  const loadNowDashboard = async (preferredSelection = nowSelection) => {
    setNowLoading(true);
    setNowError(null);

    try {
      const snapshot = await db.getNowDashboard();
      setNowSnapshot(snapshot);
      const nextSelection = chooseNowSelection(snapshot, preferredSelection);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
    } catch (error) {
      console.error('Failed to load Now dashboard', error);
      setNowError(error.message || 'Не удалось загрузить экран «Сейчас».');
      setNowFocus(null);
    } finally {
      setNowLoading(false);
    }
  };

  const loadNavigationSnapshot = async (preferredSelection = navigationSelection) => {
    setNavigationLoading(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const snapshot = await db.getNavigationSnapshot();
      setNavigationSnapshot(snapshot);
      const nextSelection = preferredSelection ?? snapshot.defaultSelection ?? null;
      setNavigationSelection(nextSelection);
      await loadNavigationFocus(nextSelection);
    } catch (error) {
      console.error('Failed to load navigation snapshot', error);
      setNavigationError(error.message || 'Не удалось загрузить карту.');
      setNavigationFocus(null);
    } finally {
      setNavigationLoading(false);
    }
  };

  useEffect(() => {
    if (normalizedActiveTab === 'now') {
      void loadNowDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab]);

  useEffect(() => {
    if (normalizedActiveTab === 'map') {
      void loadNavigationSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab]);

  const handleCreateStarterWorkspace = async () => {
    setNowCreatingStarter(true);
    setNowError(null);
    setNavigationError(null);

    try {
      const snapshot = await db.createStarterWorkspace();
      setNowSnapshot(snapshot);
      const nextSelection = chooseNowSelection(snapshot);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
      const navigation = await db.getNavigationSnapshot();
      setNavigationSnapshot(navigation);
      setNavigationSelection(nextSelection);
      if (normalizedActiveTab === 'map') {
        await loadNavigationFocus(nextSelection);
      }
    } catch (error) {
      console.error('Failed to create starter workspace', error);
      const message = error.message || 'Не удалось создать стартовый набор.';
      setNowError(message);
      setNavigationError(message);
    } finally {
      setNowCreatingStarter(false);
    }
  };

  const handleCreateLinearAlgebraGraph = async () => {
    setNowCreatingStarter(true);
    setNowError(null);
    setNavigationError(null);

    try {
      const snapshot = await db.createLinearAlgebraGraphWorkspace();
      setNowSnapshot(snapshot);
      const navigation = await db.getNavigationSnapshot();
      const rootNode = navigation.spheres
        .flatMap((sphere) => sphere.directions)
        .flatMap((direction) => direction.skills)
        .flatMap((skill) => skill.nodes)
        .find((node) => node.title === 'Основные темы курса Алгебры I');
      const nextSelection = rootNode
        ? { nodeId: rootNode.id, actionId: rootNode.next_action_id ?? null }
        : chooseNowSelection(snapshot);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
      setNavigationSnapshot(navigation);
      setNavigationSelection(nextSelection);
      await loadNavigationFocus(nextSelection);
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to create linear algebra graph', error);
      const message = error.message || 'Не удалось создать граф алгебры.';
      setNowError(message);
      setNavigationError(message);
    } finally {
      setNowCreatingStarter(false);
    }
  };

  const handleCreateStructure = async (name) => {
    setNowCreatingStarter(true);
    setNowError(null);
    setNavigationError(null);

    try {
      const snapshot = await db.createStructureWorkspace({ name });
      setNowSnapshot(snapshot);
      const navigation = await db.getNavigationSnapshot();
      const createdSphere = navigation.spheres.find((sphere) => sphere.name === name) ?? null;
      const rootNode =
        createdSphere?.directions
          .flatMap((direction) => direction.skills)
          .flatMap((skill) => skill.nodes)
          .find((node) => node.type === 'project') ?? null;
      const nextSelection = rootNode
        ? { nodeId: rootNode.id, actionId: rootNode.next_action_id ?? null }
        : chooseNowSelection(snapshot);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
      setNavigationSnapshot(navigation);
      setNavigationSelection(nextSelection);
      await loadNavigationFocus(nextSelection);
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to create structure', error);
      const message = error.message || 'Не удалось создать структуру.';
      setNowError(message);
      setNavigationError(message);
    } finally {
      setNowCreatingStarter(false);
    }
  };

  const applyOutcomeResult = async (result) => {
    if (!result) {
      return;
    }

    setNowSnapshot(result.dashboard);
    setNowFocus(result.focus);

    const nextSelection = result.focus?.selectedAction
      ? { nodeId: result.focus.node.id, actionId: result.focus.selectedAction.id }
      : result.focus?.node
        ? { nodeId: result.focus.node.id, actionId: null }
        : null;

    setNowSelection(nextSelection);
    setNavigationSelection(nextSelection);
    await loadNavigationSnapshot(nextSelection);
    setMapOutcomeNote('');
    setMapShrinkTitle('');
  };

  const applyNodeEditorMutationResult = async (result, notice = null) => {
    if (!result) {
      return;
    }

    setNowSnapshot(result.dashboard);
    const nextNowSelection = chooseNowSelection(result.dashboard, result.selection);
    setNowSelection(nextNowSelection);
    await loadNowFocus(nextNowSelection);

    setNavigationSnapshot(result.navigation);
    setNavigationSelection(result.selection);
    setNavigationFocus(result.focus);
    setMapOutcomeNote('');
    setMapShrinkTitle('');
    setNodeEditorNotice(typeof notice === 'function' ? notice(result) : notice);
  };

  const handleSelectNowRecommendation = async (recommendation) => {
    const selection = {
      nodeId: recommendation.nodeId,
      actionId: recommendation.actionId,
    };

    setNowSelection(selection);
    setNavigationSelection(selection);
    setNowError(null);
    await loadNowFocus(selection);
  };

  const handleSelectNavigationNode = async (node) => {
    const selection = {
      nodeId: node.id,
      actionId: node.next_action_id ?? null,
    };

    setNavigationSelection(selection);
    setNavigationError(null);
    setNodeEditorNotice(null);
    await loadNavigationFocus(selection);
  };

  const handleSelectNavigationAction = async (action) => {
    if (!navigationFocus?.node) {
      return;
    }

    const selection = {
      nodeId: navigationFocus.node.id,
      actionId: action.id,
    };

    setNavigationSelection(selection);
    setNavigationError(null);
    setNodeEditorNotice(null);
    await loadNavigationFocus(selection);
  };

  const findNavigationNodeById = (nodeId) => {
    for (const sphere of navigationSnapshot?.spheres ?? []) {
      for (const direction of sphere.directions) {
        for (const skill of direction.skills) {
          const node = skill.nodes.find((item) => item.id === nodeId);
          if (node) {
            return node;
          }
        }
      }
    }

    return null;
  };

  const findNavigationEdgeById = (edgeId) =>
    navigationSnapshot?.edges?.find((edge) => edge.id === edgeId) ?? null;

  const pushMapUndo = (entry) => {
    mapUndoStackRef.current = [...mapUndoStackRef.current.slice(-49), entry];
  };

  const persistNodeEditorDraft = async (draft) => {
    if (!navigationFocus?.node) {
      return null;
    }

    return db.updateNodeRecord(navigationFocus.node.id, buildNodeEditorUpdatePayload(navigationFocus, draft));
  };

  const handleSaveNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return;
    }

    setNodeEditorPendingAction('save');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await persistNodeEditorDraft(draft);
      await applyNodeEditorMutationResult(result, 'Изменения узла сохранены в базе.');
    } catch (error) {
      console.error('Failed to save node editor state', error);
      setNavigationError(error.message || 'Не удалось сохранить узел.');
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleDuplicateNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return;
    }

    if (!canDuplicateNodeEditorDraft(navigationFocus, draft)) {
      setNavigationError('??????? ????????? type/status ????, ????? ??????????.');
      return;
    }

    setNodeEditorPendingAction('duplicate');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.duplicateNodeRecord(
        navigationFocus.node.id,
        buildNodeEditorDuplicatePayload(draft),
      );
      await applyNodeEditorMutationResult(
        result,
        (mutationResult) =>
          mutationResult.focus
            ? `Создан дубль. Фокус переведен на «${mutationResult.focus.node.title}».`
            : 'Создан persisted duplicate узла.',
      );
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to duplicate node editor state', error);
      setNavigationError(error.message || 'Не удалось создать дубль узла.');
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleArchiveNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return;
    }

    setNodeEditorPendingAction('archive');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.archiveNodeRecord(
        navigationFocus.node.id,
        buildNodeEditorUpdatePayload(navigationFocus, draft),
      );
      await applyNodeEditorMutationResult(
        result,
        (mutationResult) =>
          mutationResult.focus
            ? `Узел отправлен в архив. Фокус перенесен на «${mutationResult.focus.node.title}».`
            : 'Узел отправлен в архив.',
      );
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to archive node editor state', error);
      setNavigationError(error.message || 'Не удалось архивировать узел.');
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleCreateMapNode = async ({ skillId, existingNodeCount, x, y, title }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    setMapMutationPendingAction('create-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.createNodeRecord(
        buildMapNodeCreatePayload({
          skillId,
          existingNodeCount,
          position: { x, y },
          title,
        }),
      );
      if (result?.node?.id) {
        pushMapUndo({ type: 'archive-node', nodeId: result.node.id });
      }
      await applyNodeEditorMutationResult(result, 'Новый узел добавлен на карту.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to create node from map', error);
      setNavigationError(error.message || 'Не удалось создать узел на карте.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleCreateChildMapNode = async ({ parentNodeId, skillId, existingNodeCount, x, y, title }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    setMapMutationPendingAction('create-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const nodeResult = await db.createNodeRecord(
        buildMapNodeCreatePayload({
          skillId,
          existingNodeCount,
          position: { x, y },
          title,
        }),
      );
      const createdNodeId = nodeResult?.focus?.node?.id;

      if (!createdNodeId) {
        await applyNodeEditorMutationResult(nodeResult, 'Новый узел добавлен на карту.');
        setActiveTab('map');
        return true;
      }

      const edgeResult = await db.createGraphEdge(
        buildGraphEdgeCreatePayload({
          sourceNodeId: parentNodeId,
          targetNodeId: createdNodeId,
          edgeType: 'supports',
        }),
      );
      pushMapUndo({
        type: 'create-child',
        nodeId: createdNodeId,
        edgeId: edgeResult?.edge?.id ?? null,
      });

      const childSelection = {
        nodeId: createdNodeId,
        actionId: nodeResult?.focus?.selectedAction?.id ?? nodeResult?.focus?.node?.next_action_id ?? null,
      };
      await loadNowDashboard(nowSelection);
      setNavigationSnapshot(edgeResult?.navigation ?? nodeResult?.navigation ?? null);
      setNavigationSelection(childSelection);
      await loadNavigationFocus(childSelection);
      setNodeEditorNotice('Дочерний узел добавлен и связан с родителем.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to create linked child node from map', error);
      setNavigationError(error.message || 'Не удалось создать дочерний узел на карте.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleMoveMapNode = async ({ nodeId, x, y }) => {
    if (mapMutationPendingAction) {
      return;
    }

    const previousNode = findNavigationNodeById(nodeId);
    setMapMutationPendingAction('move-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.updateNodeRecord(nodeId, { x, y });
      if (previousNode) {
        pushMapUndo({
          type: 'move-node',
          nodeId,
          x: previousNode.x ?? 0,
          y: previousNode.y ?? 0,
        });
      }
      await applyNodeEditorMutationResult(result);
    } catch (error) {
      console.error('Failed to move node on map', error);
      setNavigationError(error.message || 'Не удалось сохранить новую позицию узла.');
      await loadNavigationSnapshot(navigationSelection);
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleCreateMapEdge = async ({ sourceNodeId, targetNodeId, edgeType }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    setMapMutationPendingAction('create-edge');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.createGraphEdge(
        buildGraphEdgeCreatePayload({
          sourceNodeId,
          targetNodeId,
          edgeType,
        }),
      );
      if (result?.edge?.id) {
        pushMapUndo({ type: 'delete-edge', edgeId: result.edge.id });
      }
      await loadNowDashboard(nowSelection);
      setNavigationSnapshot(result?.navigation ?? null);
      setNavigationSelection(result?.selection ?? null);
      setNavigationFocus(result?.focus ?? null);
      setNodeEditorNotice('Связь добавлена на карту.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to create edge from map', error);
      setNavigationError(error.message || 'Не удалось создать связь на карте.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleDeleteMapEdge = async (edgeId) => {
    if (mapMutationPendingAction) {
      return false;
    }

    const previousEdge = findNavigationEdgeById(edgeId);
    setMapMutationPendingAction('delete-edge');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.deleteGraphEdge(edgeId);
      if (previousEdge) {
        pushMapUndo({
          type: 'create-edge',
          sourceNodeId: previousEdge.source_node_id,
          targetNodeId: previousEdge.target_node_id,
          edgeType: previousEdge.edge_type,
        });
      }
      await loadNowDashboard(nowSelection);
      setNavigationSnapshot(result?.navigation ?? null);
      setNavigationSelection(result?.selection ?? null);
      setNavigationFocus(result?.focus ?? null);
      setNodeEditorNotice('Связь удалена.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to delete edge from map', error);
      setNavigationError(error.message || 'Не удалось удалить связь.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleRenameMapNode = async ({ nodeId, title }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    const previousNode = findNavigationNodeById(nodeId);
    setMapMutationPendingAction('rename-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.updateNodeRecord(nodeId, { title });
      if (previousNode) {
        pushMapUndo({ type: 'rename-node', nodeId, title: previousNode.title });
      }
      await applyNodeEditorMutationResult(result, 'Название узла обновлено.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to rename node from map', error);
      setNavigationError(error.message || 'Не удалось переименовать узел.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleArchiveMapNode = async ({ nodeId }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    setMapMutationPendingAction('archive-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.archiveNodeRecord(nodeId, {});
      pushMapUndo({ type: 'restore-node', nodeId });
      await applyNodeEditorMutationResult(result, 'Узел отправлен в архив.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to archive node from map', error);
      setNavigationError(error.message || 'Не удалось архивировать узел.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleDuplicateMapNode = async ({ nodeId, x, y }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    setMapMutationPendingAction('duplicate-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.duplicateNodeRecord(nodeId, { x, y });
      if (result?.node?.id) {
        pushMapUndo({ type: 'archive-node', nodeId: result.node.id });
      }
      await applyNodeEditorMutationResult(result, 'Дубль узла создан.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to duplicate node from map', error);
      setNavigationError(error.message || 'Не удалось дублировать узел.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleUndoMapMutation = async () => {
    if (mapMutationPendingAction) {
      return false;
    }

    const entry = mapUndoStackRef.current.at(-1);
    if (!entry) {
      setNodeEditorNotice('Нет действия для отмены.');
      return false;
    }

    mapUndoStackRef.current = mapUndoStackRef.current.slice(0, -1);
    setMapMutationPendingAction('undo');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      if (entry.type === 'archive-node') {
        await db.archiveNodeRecord(entry.nodeId, {});
      } else if (entry.type === 'restore-node') {
        await db.updateNodeRecord(entry.nodeId, { is_archived: 0 });
      } else if (entry.type === 'move-node') {
        await db.updateNodeRecord(entry.nodeId, { x: entry.x, y: entry.y });
      } else if (entry.type === 'rename-node') {
        await db.updateNodeRecord(entry.nodeId, { title: entry.title });
      } else if (entry.type === 'delete-edge' && entry.edgeId != null) {
        await db.deleteGraphEdge(entry.edgeId);
      } else if (entry.type === 'create-edge') {
        await db.createGraphEdge(
          buildGraphEdgeCreatePayload({
            sourceNodeId: entry.sourceNodeId,
            targetNodeId: entry.targetNodeId,
            edgeType: entry.edgeType,
          }),
        );
      } else if (entry.type === 'create-child') {
        if (entry.edgeId != null) {
          await db.deleteGraphEdge(entry.edgeId);
        }
        await db.archiveNodeRecord(entry.nodeId, {});
      }

      await loadNowDashboard(nowSelection);
      await loadNavigationSnapshot(navigationSelection);
      setNodeEditorNotice('Последнее действие на карте отменено.');
      setActiveTab('map');
      return true;
    } catch (error) {
      console.error('Failed to undo map mutation', error);
      setNavigationError(error.message || 'Не удалось отменить последнее действие.');
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleStartNavigationSession = async () => {
    if (!navigationSelection?.actionId) {
      return;
    }

    setMapStartingSession(true);
    setNavigationError(null);

    try {
      await db.startTodaySessionFromRecommendation(navigationSelection.actionId);
      await loadNowDashboard(navigationSelection);
      await loadNavigationSnapshot(navigationSelection);
    } catch (error) {
      console.error('Failed to start navigation session', error);
      setNavigationError(error.message || 'Не удалось запустить сессию для узла.');
    } finally {
      setMapStartingSession(false);
    }
  };

  const runNavigationOutcome = async (type, operation) => {
    if (!navigationSelection?.actionId) {
      return;
    }

    setMapActiveOutcomeAction(type);
    setNavigationError(null);

    try {
      const result = await operation();
      await applyOutcomeResult(result);
    } catch (error) {
      console.error(`Failed to ${type} navigation action`, error);
      setNavigationError(error.message || 'Не удалось изменить шаг узла.');
    } finally {
      setMapActiveOutcomeAction(null);
    }
  };

  const handleCompleteNavigationAction = async () => {
    if (!navigationSelection?.actionId) {
      return;
    }

    setMapCompletingAction(true);
    setNavigationError(null);

    try {
      const result = await db.completeNowActionInTodaySession(navigationSelection.actionId);
      await applyOutcomeResult(result);
    } catch (error) {
      console.error('Failed to complete navigation action', error);
      setNavigationError(error.message || 'Не удалось завершить шаг узла.');
    } finally {
      setMapCompletingAction(false);
    }
  };

  const handleDeferNavigationAction = async () => {
    await runNavigationOutcome('defer', () =>
      db.deferNowActionInTodaySession(navigationSelection.actionId, mapOutcomeNote),
    );
  };

  const handleBlockNavigationAction = async () => {
    await runNavigationOutcome('block', () =>
      db.blockNowActionInTodaySession(navigationSelection.actionId, {
        barrierType: mapBarrierType,
        note: mapOutcomeNote,
      }),
    );
  };

  const handleShrinkNavigationAction = async () => {
    await runNavigationOutcome('shrink', () =>
      db.shrinkNowActionInTodaySession(navigationSelection.actionId, {
        title: mapShrinkTitle,
        note: mapOutcomeNote,
      }),
    );
  };

  const handleCreateJournalFollowUp = async (payload) => {
    setNavigationError(null);

    try {
      const result = await db.createJournalFollowUpStep(
        createNavigationFollowUpPayload({
          nodeId: payload.nodeId,
          title: payload.title,
          nodeTitle: navigationFocus?.node?.title,
          note: payload.note,
          barrierType: payload.barrierType,
        }),
      );
      await applyOutcomeResult(result);
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to create journal follow-up', error);
      setNavigationError(error.message || 'Не удалось создать следующий шаг.');
    }
  };

  const screenFallback = (
    <PixelSurface frame="panel" padding="xxl">
      <PixelText as="p" readable color="textMuted" size="sm">
        Загружаю экран…
      </PixelText>
    </PixelSurface>
  );

  return (
    <div
      className="pixel-shell-grid flex min-h-[100dvh] flex-col text-[var(--pixel-text)]"
      style={{
        paddingBottom: runtime.usesSafeAreaInsets ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      <header
        inert={showSettings ? true : undefined}
        aria-hidden={showSettings ? true : undefined}
        className="sticky top-0 z-50 px-3 pb-2 pt-2 sm:px-4"
        style={{
          paddingTop: runtime.usesSafeAreaInsets ? 'max(0.5rem, env(safe-area-inset-top))' : undefined,
        }}
      >
        <div className="flex w-full flex-col gap-2">
          <PixelSurface frame="panel" padding="xs">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <PixelSurface frame="accent" padding="xs" fullWidth={false}>
                    <Brain size={20} className="text-[var(--pixel-accent-glow)]" />
                  </PixelSurface>
                  <div className="min-w-0">
                    <PixelText as="h1" readable size="lg" style={{ margin: 0, lineHeight: 1.1, fontWeight: 800 }}>
                      BrainGainz
                    </PixelText>
                    <PixelText as="p" readable size="xs" color="textDim" style={{ marginTop: 2 }}>
                      {runtime.isLocalFirst ? 'Локальная база' : 'Браузерное хранилище'}
                    </PixelText>
                  </div>
                </div>

                <div
                  className="hide-scrollbar ml-0 flex min-w-0 items-center gap-1 overflow-x-auto sm:ml-3"
                  role="navigation"
                  aria-label="Основные разделы BrainGainz"
                >
                  <PixelButton
                    tone={normalizedActiveTab === 'now' ? 'accent' : 'ghost'}
                    onClick={() => setActiveTab('now')}
                    aria-pressed={normalizedActiveTab === 'now'}
                    aria-current={normalizedActiveTab === 'now' ? 'page' : undefined}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <Compass size={14} /> Сейчас
                  </PixelButton>
                  <PixelButton
                    tone={normalizedActiveTab === 'map' ? 'accent' : 'ghost'}
                    onClick={() => setActiveTab('map')}
                    aria-pressed={normalizedActiveTab === 'map'}
                    aria-current={normalizedActiveTab === 'map' ? 'page' : undefined}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <Map size={14} /> Карта
                  </PixelButton>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <PixelSurface
                  frame="ghost"
                  padding="xs"
                  fullWidth={false}
                  className="hidden sm:block"
                  title={runtime.dataBoundaryLabel}
                >
                  <PixelText as="span" readable size="xs" color={runtime.isLocalFirst ? 'success' : 'info'}>
                    {runtime.shellLabel} / {runtime.storageLabel}
                  </PixelText>
                </PixelSurface>
                <PixelButton
                  tone={showSettings ? 'accent' : 'ghost'}
                  onClick={() => setShowSettings(!showSettings)}
                  aria-label="Настройки"
                  style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">Настройки</span>
                </PixelButton>
              </div>
            </div>
          </PixelSurface>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <PixelSurface
            frame="panel"
            padding="xl"
            role="dialog"
            aria-modal="true"
            aria-label="Настройки"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-[520px] overflow-auto"
          >
            <PixelStack gap="lg">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <PixelText as="p" size="xs" color="textMuted" uppercase>
                    Профиль
                  </PixelText>
                  <PixelText as="h2" readable size="xl" style={{ marginTop: 4, fontWeight: 800 }}>
                    Настройки
                  </PixelText>
                </div>
                <PixelButton
                  tone="ghost"
                  onClick={() => setShowSettings(false)}
                  aria-label="Закрыть настройки"
                  style={{ minHeight: 30, padding: '6px 8px' }}
                >
                  <X size={16} />
                </PixelButton>
              </div>

              <PixelInput
                id="groq-api-key"
                label="Ключ Groq"
                type="password"
                value={groqApiKey}
                onChange={(event) => setGroqApiKey(event.target.value)}
                placeholder="Bearer xxxxxxxxxxxxxxxxx..."
                hint="Хранится локально в браузере."
              />

              <PixelSurface frame="ghost" padding="sm">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-[var(--pixel-accent)]" />
                  <PixelText as="p" readable size="sm" color="textMuted">
                    AI помогает с переводом и примерами. Ключ можно взять на{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-[var(--pixel-accent)] underline">
                      console.groq.com
                    </a>
                    .
                  </PixelText>
                </div>
              </PixelSurface>

              <PixelSelect
                id="source-language"
                label="Я изучаю"
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
                hint="Язык карточек."
              >
                  <option value="English">Английский</option>
                  <option value="Russian">Русский</option>
                  <option value="Spanish">Испанский</option>
                  <option value="German">Немецкий</option>
                  <option value="French">Французский</option>
                  <option value="Chinese">Китайский</option>
                  <option value="Japanese">Японский</option>
                  <option value="Korean">Корейский</option>
                  <option value="Italian">Итальянский</option>
                  <option value="Portuguese">Португальский</option>
                  <option value="Turkish">Турецкий</option>
                  <option value="Ukrainian">Украинский</option>
              </PixelSelect>

              <PixelSelect
                id="target-language"
                label="Язык перевода"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
                hint="Куда переводить."
              >
                  <option value="Russian">Русский</option>
                  <option value="Spanish">Испанский</option>
                  <option value="German">Немецкий</option>
                  <option value="French">Французский</option>
                  <option value="Chinese">Китайский</option>
                  <option value="Japanese">Японский</option>
                  <option value="Korean">Корейский</option>
                  <option value="Italian">Итальянский</option>
                  <option value="Portuguese">Португальский</option>
                  <option value="Turkish">Турецкий</option>
                  <option value="Ukrainian">Украинский</option>
              </PixelSelect>

              <PixelStack gap="xs">
                <PixelText as="p" size="xs" color="textMuted" uppercase>
                  Данные
                </PixelText>
                <PixelButton
                  onClick={() => {
                    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(words))}`;
                    const link = document.createElement('a');
                    link.href = dataStr;
                    link.download = `backup_${activeSubject?.name || 'db'}.json`;
                    link.click();
                  }}
                  fullWidth
                >
                  <Download size={16} /> Экспорт {activeSubject?.name || 'данных'} в JSON
                </PixelButton>
              </PixelStack>

              <PixelButton tone="accent" onClick={() => setShowSettings(false)} fullWidth>
                Готово
              </PixelButton>
            </PixelStack>
          </PixelSurface>
        </div>
      )}

      <main
        inert={showSettings ? true : undefined}
        aria-hidden={showSettings ? true : undefined}
        className="w-full min-w-0 flex-grow px-3 pb-4 pt-1 sm:px-4 sm:pb-6 sm:pt-1"
      >
        <Suspense fallback={screenFallback}>
        {normalizedActiveTab === 'now' && (
          <NowView
            snapshot={nowSnapshot}
            focus={nowFocus}
            isLoading={nowLoading}
            isFocusLoading={nowFocusLoading}
            error={nowError}
            isCreatingStarter={nowCreatingStarter}
            onCreateStarterWorkspace={handleCreateStarterWorkspace}
            onSelectRecommendation={handleSelectNowRecommendation}
            onOpenMap={async (recommendation) => {
              await handleSelectNowRecommendation(recommendation);
              setActiveTab('map');
            }}
            onRefresh={loadNowDashboard}
          />
        )}

        {normalizedActiveTab === 'map' && (
          <NavigationView
            snapshot={navigationSnapshot}
            focus={navigationFocus}
            isLoading={navigationLoading}
            isFocusLoading={navigationFocusLoading}
            error={navigationError}
            isStartingSession={mapStartingSession}
            isCompletingAction={mapCompletingAction}
            activeOutcomeAction={mapActiveOutcomeAction}
            outcomeNote={mapOutcomeNote}
            barrierType={mapBarrierType}
            shrinkTitle={mapShrinkTitle}
            onRefresh={loadNavigationSnapshot}
            onCreateStructure={handleCreateStructure}
            onCreateLinearAlgebraGraph={handleCreateLinearAlgebraGraph}
            onSelectNode={handleSelectNavigationNode}
            onSelectAction={handleSelectNavigationAction}
            onStartSession={handleStartNavigationSession}
            onCompleteAction={handleCompleteNavigationAction}
            onDeferAction={handleDeferNavigationAction}
            onBlockAction={handleBlockNavigationAction}
            onShrinkAction={handleShrinkNavigationAction}
            onOutcomeNoteChange={setMapOutcomeNote}
            onBarrierTypeChange={setMapBarrierType}
            onShrinkTitleChange={setMapShrinkTitle}
            onSaveEditor={handleSaveNodeEditor}
            onDuplicateEditor={handleDuplicateNodeEditor}
            onArchiveEditor={handleArchiveNodeEditor}
            onCreateNodeAt={handleCreateMapNode}
            onCreateChildNodeAt={handleCreateChildMapNode}
            onMoveNode={handleMoveMapNode}
            onCreateEdge={handleCreateMapEdge}
            onDeleteEdge={handleDeleteMapEdge}
            onRenameNode={handleRenameMapNode}
            onArchiveNode={handleArchiveMapNode}
            onDuplicateNode={handleDuplicateMapNode}
            onUndoMapMutation={handleUndoMapMutation}
            editorPendingAction={nodeEditorPendingAction}
            editorNotice={nodeEditorNotice}
            mapMutationPendingAction={mapMutationPendingAction}
            onCreateFollowUp={() =>
              handleCreateJournalFollowUp({
                nodeId: navigationFocus?.node?.id,
                title: `Следующий шаг: ${navigationFocus?.node?.title ?? 'узел'}`,
                note: mapOutcomeNote,
                barrierType: mapBarrierType,
              })
            }
          />
        )}
        </Suspense>
      </main>
    </div>
  );
}
