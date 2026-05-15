import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  Brain,
  Compass,
  Download,
  Globe2,
  Map,
  Radar,
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
import { CampaignMenu } from './components/CampaignMenu';
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
const WindRoseView = lazy(() =>
  import('./components/WindRoseView').then((module) => ({ default: module.WindRoseView })),
);

const domainErrorMessages = new globalThis.Map([
  ['Passed assessment requires evidence payload.', 'Зачет требует результата проверки. Заполните evidence и повторите попытку.'],
  ['Assessment submit requires an idempotency key.', 'Не удалось подготовить попытку проверки. Повторите действие.'],
  ['Specialization route is not complete.', 'Маршрут пока нельзя завершить: сначала закройте обязательные узлы.'],
  ['No current specialization to complete.', 'Нет активного маршрута для завершения.'],
  ['Only an active specialization can be completed.', 'Завершить можно только активный маршрут.'],
  ['Campaign already has an active specialization.', 'В кампании уже есть активный маршрут.'],
]);

const userActionErrorMessage = (error, fallback) => {
  const message = String(error?.message ?? error ?? '').trim();
  return domainErrorMessages.get(message) ?? fallback;
};

const isExpectedActionError = (error) => {
  const message = String(error?.message ?? error ?? '').trim();
  return domainErrorMessages.has(message);
};

const logUnexpectedActionError = (label, error) => {
  if (!isExpectedActionError(error)) {
    console.error(label, error);
  }
};

export default function App() {
  const runtime = getRuntimeProfile();
  const [activeTab, setActiveTab] = useState('now');
  const normalizedActiveTab = activeTab === 'now' || activeTab === 'map' || activeTab === 'wind' ? activeTab : 'now';
  const [campaigns, setCampaigns] = useState(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignMutationPending, setCampaignMutationPending] = useState(false);
  const [campaignError, setCampaignError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);
  const [words, setWords] = useState([]);
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem('braingainz_groq_key') || '');
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('braingainz_target_lang') || 'Russian');
  const [sourceLanguage, setSourceLanguage] = useState(localStorage.getItem('braingainz_source_lang') || 'English');
  const [showSettings, setShowSettings] = useState(false);
  const [nowSnapshot, setNowSnapshot] = useState(null);
  const [nowLoading, setNowLoading] = useState(false);
  const [nowError, setNowError] = useState(null);
  const [nowNotice, setNowNotice] = useState(null);
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
  const [navigationBranchFilterId, setNavigationBranchFilterId] = useState(null);
  const [mapStartingSession, setMapStartingSession] = useState(false);
  const [mapCompletingAction, setMapCompletingAction] = useState(false);
  const [mapActiveOutcomeAction, setMapActiveOutcomeAction] = useState(null);
  const [mapOutcomeNote, setMapOutcomeNote] = useState('');
  const [mapBarrierType, setMapBarrierType] = useState('too complex');
  const [mapShrinkTitle, setMapShrinkTitle] = useState('');
  const [nodeEditorPendingAction, setNodeEditorPendingAction] = useState(null);
  const [nodeEditorNotice, setNodeEditorNotice] = useState(null);
  const [nodeMasteryPendingAction, setNodeMasteryPendingAction] = useState(null);
  const [routeMutationPending, setRouteMutationPending] = useState(false);
  const [mapRouteFilterRequestId, setMapRouteFilterRequestId] = useState(null);
  const [mapMutationPendingAction, setMapMutationPendingAction] = useState(null);
  const [mapUndoCount, setMapUndoCount] = useState(0);
  const [windRoseSnapshot, setWindRoseSnapshot] = useState(null);
  const [windRoseLoading, setWindRoseLoading] = useState(false);
  const [windRoseError, setWindRoseError] = useState(null);
  const [selectedWindStatId, setSelectedWindStatId] = useState(null);
  const mapUndoStackRef = useRef([]);
  const mapRouteFilterRequestCounterRef = useRef(0);
  const selectedCampaignId = selectedCampaign?.id ?? null;

  useEffect(() => {
    const init = async () => {
      try {
        await db.initDb();
        await loadCampaigns();
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

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    setCampaignError(null);

    try {
      const snapshot = await db.getCampaigns();
      setCampaigns(snapshot);
    } catch (error) {
      console.error('Failed to load campaigns', error);
      setCampaignError(error.message || 'Не удалось загрузить кампании.');
    } finally {
      setCampaignsLoading(false);
    }
  };

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
      const focus = await db.getNowNodeFocus(selection.nodeId, selection.actionId, selectedCampaignId);
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
      const focus = await db.getNowNodeFocus(selection.nodeId, selection.actionId ?? null, selectedCampaignId);
      setNavigationFocus(focus);
    } catch (error) {
      console.error('Failed to load navigation focus', error);
      setNavigationError(error.message || 'Не удалось загрузить выбранный узел.');
    } finally {
      setNavigationFocusLoading(false);
    }
  };

  const findFirstNodeSelectionInSkill = (snapshot, skillId) => {
    if (!snapshot || skillId == null) {
      return null;
    }

    for (const sphere of snapshot.spheres ?? []) {
      for (const direction of sphere.directions ?? []) {
        const skill = direction.skills?.find((entry) => entry.id === skillId);
        const node = skill?.nodes?.[0] ?? null;
        if (node) {
          return {
            nodeId: node.id,
            actionId: node.next_action_id ?? null,
          };
        }
      }
    }

    return null;
  };

  const loadNowDashboard = async (preferredSelection = nowSelection) => {
    setNowLoading(true);
    setNowError(null);
    setNowNotice(null);

    try {
      const snapshot = await db.getNowDashboard(selectedCampaignId);
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

  const loadNavigationSnapshot = async (preferredSelection = navigationSelection, options = {}) => {
    setNavigationLoading(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const snapshot = await db.getNavigationSnapshot(selectedCampaignId);
      setNavigationSnapshot(snapshot);
      const hasBranchFilterOverride = Object.prototype.hasOwnProperty.call(options, 'branchFilterId');
      const hasPreferredSkillFilter =
        preferredSelection && Object.prototype.hasOwnProperty.call(preferredSelection, 'skillId');
      const nextBranchFilterId = hasBranchFilterOverride
        ? options.branchFilterId ?? null
        : hasPreferredSkillFilter
          ? preferredSelection.skillId ?? null
          : navigationBranchFilterId ?? null;
      const nextSelection =
        preferredSelection?.nodeId
          ? preferredSelection
          : findFirstNodeSelectionInSkill(snapshot, nextBranchFilterId) ?? snapshot.defaultSelection ?? null;
      setNavigationBranchFilterId(nextBranchFilterId);
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

  const loadWindRose = async () => {
    setWindRoseLoading(true);
    setWindRoseError(null);

    try {
      const snapshot = await db.getWindRoseSnapshot(selectedCampaignId);
      setWindRoseSnapshot(snapshot);
      setSelectedWindStatId((current) => current ?? snapshot?.stats?.[0]?.id ?? null);
    } catch (error) {
      console.error('Failed to load wind rose', error);
      setWindRoseError(error.message || 'Не удалось загрузить розу ветров.');
    } finally {
      setWindRoseLoading(false);
    }
  };

  const resetCampaignWorkspaceState = () => {
    setNowSnapshot(null);
    setNowFocus(null);
    setNowSelection(null);
    setNowNotice(null);
    setNavigationSnapshot(null);
    setNavigationFocus(null);
    setNavigationSelection(null);
    setNavigationBranchFilterId(null);
    setRouteMutationPending(false);
    setMapRouteFilterRequestId(null);
    setWindRoseSnapshot(null);
    setSelectedWindStatId(null);
    mapUndoStackRef.current = [];
    setMapUndoCount(0);
  };

  const requestMapRouteFilter = () => {
    mapRouteFilterRequestCounterRef.current += 1;
    setMapRouteFilterRequestId(mapRouteFilterRequestCounterRef.current);
  };

  const handleOpenCampaign = async (campaign) => {
    setCampaignMutationPending(true);
    setCampaignError(null);

    try {
      const opened = await db.openCampaign(campaign.id);
      if (!opened) {
        await loadCampaigns();
        return;
      }

      setSelectedCampaign(opened);
      localStorage.setItem('braingainz_last_campaign_id', String(opened.id));
      resetCampaignWorkspaceState();
      setActiveTab('now');
      await loadCampaigns();
    } catch (error) {
      logUnexpectedActionError('Failed to open campaign', error);
      setCampaignError(userActionErrorMessage(error, 'Не удалось открыть кампанию.'));
    } finally {
      setCampaignMutationPending(false);
    }
  };

  const handleBackToCampaigns = () => {
    setSelectedCampaign(null);
    resetCampaignWorkspaceState();
    void loadCampaigns();
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      return;
    }

    setCampaignMutationPending(true);
    setCampaignError(null);

    try {
      const campaign = await db.createUserCampaign({ name: newCampaignName });
      setNewCampaignName('');
      await loadCampaigns();
      if (campaign) {
        await handleOpenCampaign(campaign);
      }
    } catch (error) {
      logUnexpectedActionError('Failed to create campaign', error);
      setCampaignError(userActionErrorMessage(error, 'Не удалось создать кампанию.'));
    } finally {
      setCampaignMutationPending(false);
    }
  };

  const handleArchiveCampaign = async (campaign) => {
    setCampaignMutationPending(true);
    setCampaignError(null);

    try {
      await db.archiveCampaign(campaign.id);
      if (selectedCampaign?.id === campaign.id) {
        handleBackToCampaigns();
      }
      await loadCampaigns();
    } catch (error) {
      logUnexpectedActionError('Failed to archive campaign', error);
      setCampaignError(userActionErrorMessage(error, 'Не удалось архивировать кампанию.'));
    } finally {
      setCampaignMutationPending(false);
    }
  };

  const handleRestoreCampaign = async (campaign) => {
    setCampaignMutationPending(true);
    setCampaignError(null);

    try {
      await db.restoreCampaign(campaign.id);
      await loadCampaigns();
    } catch (error) {
      logUnexpectedActionError('Failed to restore campaign', error);
      setCampaignError(userActionErrorMessage(error, 'Не удалось восстановить кампанию.'));
    } finally {
      setCampaignMutationPending(false);
    }
  };

  useEffect(() => {
    if (!selectedCampaignId) {
      return;
    }
    if (normalizedActiveTab === 'now') {
      void loadNowDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) {
      return;
    }
    if (normalizedActiveTab === 'map') {
      void loadNavigationSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) {
      return;
    }
    if (normalizedActiveTab === 'wind') {
      void loadWindRose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab, selectedCampaignId]);

  const handleCreateStarterWorkspace = async () => {
    setNowCreatingStarter(true);
    setNowError(null);
    setNavigationError(null);

    try {
      const snapshot = await db.createStarterWorkspace(selectedCampaignId);
      setNowSnapshot(snapshot);
      const nextSelection = chooseNowSelection(snapshot);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
      const navigation = await db.getNavigationSnapshot(selectedCampaignId);
      setNavigationSnapshot(navigation);
      setNavigationSelection(nextSelection);
      if (normalizedActiveTab === 'map') {
        await loadNavigationFocus(nextSelection);
      }
    } catch (error) {
      logUnexpectedActionError('Failed to create starter workspace', error);
      const message = userActionErrorMessage(error, 'Не удалось создать стартовый набор.');
      setNowError(message);
      setNavigationError(message);
    } finally {
      setNowCreatingStarter(false);
    }
  };

  const refreshCareerSurfaces = async () => {
    await Promise.all([
      loadCampaigns(),
      loadNowDashboard(),
      normalizedActiveTab === 'wind' ? loadWindRose() : Promise.resolve(),
    ]);
  };

  const handleCompleteSpecialization = async () => {
    if (!selectedCampaignId) {
      return;
    }

    setNowError(null);
    try {
      await db.completeSpecialization(null, {}, selectedCampaignId);
      await refreshCareerSurfaces();
    } catch (error) {
      logUnexpectedActionError('Specialization completion failed', error);
      setNowError(userActionErrorMessage(error, 'Маршрут пока нельзя завершить.'));
    }
  };

  const handleContinueSpecialization = async () => {
    if (!selectedCampaignId) {
      return;
    }

    setNowError(null);
    try {
      await db.continueWithSpecialization(
        {
          name: `Продолжение ${new Date().toLocaleDateString('ru-RU')}`,
          key: `route-${Date.now().toString(36)}`,
          domain: selectedCampaign?.name ?? 'BrainGainz',
          length: 'medium',
        },
        selectedCampaignId,
      );
      await refreshCareerSurfaces();
    } catch (error) {
      logUnexpectedActionError('Specialization continuation failed', error);
      setNowError(userActionErrorMessage(error, 'Не удалось выбрать новый маршрут.'));
    }
  };

  const handleCreateLinearAlgebraGraph = async () => {
    setNowCreatingStarter(true);
    setNowError(null);
    setNavigationError(null);

    try {
      const snapshot = await db.createLinearAlgebraGraphWorkspace(selectedCampaignId);
      setNowSnapshot(snapshot);
      const navigation = await db.getNavigationSnapshot(selectedCampaignId);
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
      logUnexpectedActionError('Failed to create linear algebra graph', error);
      const message = userActionErrorMessage(error, 'Не удалось создать граф алгебры.');
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
      const snapshot = await db.createStructureWorkspace({ name }, selectedCampaignId);
      setNowSnapshot(snapshot);
      const navigation = await db.getNavigationSnapshot(selectedCampaignId);
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
      logUnexpectedActionError('Failed to create structure', error);
      const message = userActionErrorMessage(error, 'Не удалось создать структуру.');
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
    const xpWarningMessage = result.xpWarning?.message ?? null;
    setNowNotice(xpWarningMessage);
    setNodeEditorNotice(xpWarningMessage);

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

  const handleOpenTodayRouteNode = async (nodeId) => {
    if (!nodeId) {
      return;
    }
    const selection = { nodeId, actionId: null, skillId: null };
    setNavigationBranchFilterId(null);
    setNavigationSelection(selection);
    requestMapRouteFilter();
    if (normalizedActiveTab === 'map') {
      await loadNavigationSnapshot(selection, { branchFilterId: null });
      return;
    }
    setActiveTab('map');
  };

  const handleOpenTodayRouteMap = async () => {
    setNavigationBranchFilterId(null);
    requestMapRouteFilter();
    if (normalizedActiveTab === 'map') {
      await loadNavigationSnapshot(navigationSelection, { branchFilterId: null });
      return;
    }
    setActiveTab('map');
  };

  const handleSelectNavigationNode = async (node) => {
    const selection = {
      nodeId: node.id,
      actionId: node.next_action_id ?? null,
    };

    setNavigationSelection(selection);
    if (navigationBranchFilterId != null) {
      setNavigationBranchFilterId(node.skill_id ?? null);
    }
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
    setMapUndoCount(mapUndoStackRef.current.length);
  };

  const persistNodeEditorDraft = async (draft) => {
    if (!navigationFocus?.node) {
      return null;
    }

    return db.updateNodeRecord(navigationFocus.node.id, buildNodeEditorUpdatePayload(navigationFocus, draft), selectedCampaignId);
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
      logUnexpectedActionError('Failed to save node editor state', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось сохранить узел.'));
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
        selectedCampaignId,
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
      logUnexpectedActionError('Failed to duplicate node editor state', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось создать дубль узла.'));
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleArchiveNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return false;
    }

    if (navigationFocus.node.id !== draft.nodeId) {
      await loadNavigationSnapshot(navigationSelection);
      setNavigationError('Фокус узла изменился. Откройте узел заново и повторите архивирование.');
      return false;
    }

    const archivedNodeId = draft.nodeId;
    const archivedNodeTitle = draft.title || navigationFocus.node.title;
    setNodeEditorPendingAction('archive');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.archiveNodeRecord(
        archivedNodeId,
        buildNodeEditorUpdatePayload(navigationFocus, draft),
        selectedCampaignId,
      );
      await applyNodeEditorMutationResult(
        result,
        (mutationResult) =>
          mutationResult.focus
            ? `Узел «${archivedNodeTitle}» отправлен в архив. Фокус перенесен на «${mutationResult.focus.node.title}».`
            : `Узел «${archivedNodeTitle}» отправлен в архив.`,
      );
      pushMapUndo({ type: 'restore-node', nodeId: archivedNodeId });
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to archive node editor state', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось архивировать узел.'));
      return false;
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
        selectedCampaignId,
      );
      if (result?.node?.id) {
        pushMapUndo({ type: 'archive-node', nodeId: result.node.id });
      }
      await applyNodeEditorMutationResult(result, 'Новый узел добавлен на карту.');
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to create node from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось создать узел на карте.'));
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
        selectedCampaignId,
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
        selectedCampaignId,
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
      logUnexpectedActionError('Failed to create linked child node from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось создать дочерний узел на карте.'));
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
      const result = await db.updateNodeRecord(nodeId, { x, y }, selectedCampaignId);
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
      logUnexpectedActionError('Failed to move node on map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось сохранить новую позицию узла.'));
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
        selectedCampaignId,
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
      logUnexpectedActionError('Failed to create edge from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось создать связь на карте.'));
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
      const result = await db.deleteGraphEdge(edgeId, selectedCampaignId);
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
      logUnexpectedActionError('Failed to delete edge from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось удалить связь.'));
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
      const result = await db.updateNodeRecord(nodeId, { title }, selectedCampaignId);
      if (previousNode) {
        pushMapUndo({ type: 'rename-node', nodeId, title: previousNode.title });
      }
      await applyNodeEditorMutationResult(result, 'Название узла обновлено.');
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to rename node from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось переименовать узел.'));
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

    const archivedNodeTitle = findNavigationNodeById(nodeId)?.title ?? 'узел';
    setMapMutationPendingAction('archive-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.archiveNodeRecord(nodeId, {}, selectedCampaignId);
      pushMapUndo({ type: 'restore-node', nodeId });
      await applyNodeEditorMutationResult(result, `Узел «${archivedNodeTitle}» отправлен в архив.`);
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to archive node from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось архивировать узел.'));
      await loadNavigationSnapshot(navigationSelection);
      return false;
    } finally {
      setMapMutationPendingAction(null);
    }
  };

  const handleRestoreMapNode = async ({ nodeId }) => {
    if (mapMutationPendingAction) {
      return false;
    }

    const archivedNodeTitle =
      navigationSnapshot?.archivedNodes?.find((node) => node.id === nodeId)?.title ?? 'узел';
    setMapMutationPendingAction('restore-node');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.restoreNodeRecord(nodeId, selectedCampaignId);
      pushMapUndo({ type: 'archive-node', nodeId });
      await applyNodeEditorMutationResult(result, `Узел «${archivedNodeTitle}» восстановлен из архива.`);
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to restore node from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось восстановить узел.'));
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
      const result = await db.duplicateNodeRecord(nodeId, { x, y }, selectedCampaignId);
      if (result?.node?.id) {
        pushMapUndo({ type: 'archive-node', nodeId: result.node.id });
      }
      await applyNodeEditorMutationResult(result, 'Дубль узла создан.');
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to duplicate node from map', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось дублировать узел.'));
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
    setMapUndoCount(mapUndoStackRef.current.length);
    setMapMutationPendingAction('undo');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      let result = null;
      let undoNotice = 'Последнее действие на карте отменено.';
      if (entry.type === 'archive-node') {
        result = await db.archiveNodeRecord(entry.nodeId, {}, selectedCampaignId);
        undoNotice = 'Восстановление отменено: узел снова в архиве.';
      } else if (entry.type === 'restore-node') {
        result = await db.restoreNodeRecord(entry.nodeId, selectedCampaignId);
        undoNotice = 'Архивация отменена: узел восстановлен.';
      } else if (entry.type === 'move-node') {
        await db.updateNodeRecord(entry.nodeId, { x: entry.x, y: entry.y }, selectedCampaignId);
      } else if (entry.type === 'rename-node') {
        await db.updateNodeRecord(entry.nodeId, { title: entry.title }, selectedCampaignId);
      } else if (entry.type === 'delete-edge' && entry.edgeId != null) {
        await db.deleteGraphEdge(entry.edgeId, selectedCampaignId);
      } else if (entry.type === 'create-edge') {
        await db.createGraphEdge(
          buildGraphEdgeCreatePayload({
            sourceNodeId: entry.sourceNodeId,
            targetNodeId: entry.targetNodeId,
            edgeType: entry.edgeType,
          }),
          selectedCampaignId,
        );
      } else if (entry.type === 'create-child') {
        if (entry.edgeId != null) {
          await db.deleteGraphEdge(entry.edgeId, selectedCampaignId);
        }
        await db.archiveNodeRecord(entry.nodeId, {}, selectedCampaignId);
      }

      if (result?.navigation) {
        await applyNodeEditorMutationResult(result, undoNotice);
      } else {
        await loadNowDashboard(nowSelection);
        await loadNavigationSnapshot(navigationSelection);
        setNodeEditorNotice(undoNotice);
      }
      setActiveTab('map');
      return true;
    } catch (error) {
      logUnexpectedActionError('Failed to undo map mutation', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось отменить последнее действие.'));
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
      await db.startTodaySessionFromRecommendation(navigationSelection.actionId, selectedCampaignId);
      await loadNowDashboard(navigationSelection);
      await loadNavigationSnapshot(navigationSelection);
    } catch (error) {
      logUnexpectedActionError('Failed to start navigation session', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось запустить сессию для узла.'));
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
      logUnexpectedActionError(`Failed to ${type} navigation action`, error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось изменить шаг узла.'));
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
      const result = await db.completeNowActionInTodaySession(navigationSelection.actionId, selectedCampaignId);
      await applyOutcomeResult(result);
    } catch (error) {
      logUnexpectedActionError('Failed to complete navigation action', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось завершить шаг узла.'));
    } finally {
      setMapCompletingAction(false);
    }
  };

  const handleDeferNavigationAction = async () => {
    await runNavigationOutcome('defer', () =>
      db.deferNowActionInTodaySession(navigationSelection.actionId, mapOutcomeNote, selectedCampaignId),
    );
  };

  const handleBlockNavigationAction = async () => {
    await runNavigationOutcome('block', () =>
      db.blockNowActionInTodaySession(navigationSelection.actionId, {
        barrierType: mapBarrierType,
        note: mapOutcomeNote,
      }, selectedCampaignId),
    );
  };

  const handleShrinkNavigationAction = async () => {
    await runNavigationOutcome('shrink', () =>
      db.shrinkNowActionInTodaySession(navigationSelection.actionId, {
        title: mapShrinkTitle,
        note: mapOutcomeNote,
      }, selectedCampaignId),
    );
  };

  const refreshNavigationMasterySurfaces = async (notice) => {
    await loadNowDashboard(nowSelection);
    await loadNavigationSnapshot(navigationSelection);
    setNavigationError(null);
    setNodeEditorNotice(notice);
  };

  const verifierEvidenceKeys = new Set([
    'checker_run_id',
    'checkerRunId',
    'llm_result_id',
    'llmResultId',
    'strict_result_id',
    'strictResultId',
    'result',
    'output',
    'verdict',
    'summary',
    'feedback',
    'reason',
    'assessment_result',
    'assessmentResult',
    'evidence',
    'artifact',
    'artifact_url',
    'artifactUrl',
  ]);

  const hasMeaningfulAssessmentEvidenceValue = (value) => {
    if (value == null) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.some(hasMeaningfulAssessmentEvidenceValue);
    }
    if (typeof value === 'object') {
      return Object.values(value).some(hasMeaningfulAssessmentEvidenceValue);
    }
    return true;
  };

  const hasVerifierAssessmentEvidence = (payload) => {
    if (!payload) {
      return false;
    }
    if (typeof payload === 'string') {
      return payload.trim().length > 0;
    }
    if (Array.isArray(payload)) {
      return payload.some(hasVerifierAssessmentEvidence);
    }
    if (typeof payload === 'object') {
      return Object.entries(payload).some(
        ([key, value]) => verifierEvidenceKeys.has(key) && hasMeaningfulAssessmentEvidenceValue(value),
      );
    }
    return false;
  };

  const handleMarkNavigationSelfMastery = async (masteryLevel = 'seen') => {
    if (!navigationFocus?.node?.id) {
      return;
    }

    setNodeMasteryPendingAction('self-mark');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      await db.markSelfMastery(navigationFocus.node.id, masteryLevel, selectedCampaignId);
      await refreshNavigationMasterySurfaces('Отмечено без проверки: XP и завершение маршрута не начислены.');
    } catch (error) {
      logUnexpectedActionError('Failed to mark self mastery', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось отметить прогресс узла.'));
    } finally {
      setNodeMasteryPendingAction(null);
    }
  };

  const handleSubmitNavigationAssessment = async ({
    targetMasteryLevel = 'understood',
    checkMethod = 'strict',
    passed = true,
    submittedAnswer = '',
    feedbackSummary = '',
    evidencePayload = null,
    checklistResults = null,
    usesAutomaticStrictCheck = false,
    } = {}) => {
    if (!navigationFocus?.node?.id) {
      return;
    }

    if (passed && !usesAutomaticStrictCheck && !hasVerifierAssessmentEvidence(evidencePayload)) {
      setNavigationError(null);
      setNodeEditorNotice('Зачет требует результата проверки. Заполните evidence, чтобы получить verified mastery и XP.');
      return;
    }

    const strictCheckType = navigationFocus.mastery?.check?.strictCheckType ?? null;
    const resolvedCheckMethod = strictCheckType ? 'strict' : checkMethod;
    const taskId = navigationFocus.mastery?.check?.taskId ?? `node:${navigationFocus.node.id}:assessment`;

    setNodeMasteryPendingAction('assessment');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.submitAssessmentAttempt(
        {
          node_id: navigationFocus.node.id,
          task_id: taskId,
          answer_type: resolvedCheckMethod === 'strict' ? 'manual_check' : 'explanation',
          submitted_answer:
            submittedAnswer?.trim() ||
            (passed ? 'passed from node inspector assessment form' : 'failed from node inspector assessment form'),
          check_method: resolvedCheckMethod,
          strict_check_type: strictCheckType,
          target_mastery_level: targetMasteryLevel,
          passed,
          feedback_summary: feedbackSummary?.trim() || (passed ? 'Проверка засчитана.' : 'Проверка не пройдена.'),
          evidence_payload: evidencePayload,
          checklist_results: checklistResults,
          idempotency_key: `ui-assessment:${selectedCampaignId}:${navigationFocus.node.id}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        },
        selectedCampaignId,
      );
      const xpStatus = result?.xpGrantResult?.status;
      const attemptPassed = Number(result?.attempt?.passed ?? (passed ? 1 : 0)) === 1;
      const notice =
        attemptPassed && xpStatus === 'missing-stat'
          ? 'Проверка засчитана, но XP не начислены: у ветки нет основной характеристики.'
          : attemptPassed
            ? 'Проверка засчитана: проверенный уровень обновлен.'
            : 'Попытка сохранена. Mastery и XP не изменены.';
      await refreshNavigationMasterySurfaces(notice);
    } catch (error) {
      logUnexpectedActionError('Assessment attempt submission failed', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось сохранить проверку узла.'));
    } finally {
      setNodeMasteryPendingAction(null);
    }
  };

  const handleAddNavigationNodeToRoute = async ({ nodeId, requiredMasteryLevel = 'confirmed' } = {}) => {
    const specializationId = nowSnapshot?.today?.currentSpecialization?.id ?? null;
    const specializationStatus = nowSnapshot?.today?.currentSpecialization?.status ?? null;

    if (!nodeId || !specializationId || specializationStatus !== 'active') {
      setNavigationError(null);
      setNodeEditorNotice('Сначала начните активный маршрут в Today.');
      return;
    }

    setRouteMutationPending(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      await db.addSpecializationRouteNode(
        specializationId,
        {
          node_id: nodeId,
          required_mastery_level: requiredMasteryLevel,
        },
        selectedCampaignId,
      );
      await loadNowDashboard(nowSelection);
      await loadNavigationSnapshot(navigationSelection);
      setNodeEditorNotice('Узел добавлен в текущий маршрут.');
    } catch (error) {
      logUnexpectedActionError('Failed to add node to specialization route', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось добавить узел в маршрут.'));
    } finally {
      setRouteMutationPending(false);
    }
  };

  const handleUpdateNavigationRouteNode = async ({
    routeNodeId,
    requiredMasteryLevel,
    routeOrder,
    routeStage,
    routeLabel,
    isRequired,
  } = {}) => {
    if (!routeNodeId) {
      return;
    }

    setRouteMutationPending(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const payload = {};
      if (requiredMasteryLevel != null) {
        payload.required_mastery_level = requiredMasteryLevel;
      }
      if (routeOrder != null) {
        payload.route_order = routeOrder;
      }
      if (routeStage !== undefined) {
        payload.route_stage = routeStage;
      }
      if (routeLabel !== undefined) {
        payload.route_label = routeLabel;
      }
      if (isRequired !== undefined) {
        payload.is_required = isRequired ? 1 : 0;
      }
      await db.updateSpecializationRouteNode(
        routeNodeId,
        payload,
        selectedCampaignId,
      );
      await loadNowDashboard(nowSelection);
      await loadNavigationSnapshot(navigationSelection);
      setNodeEditorNotice('Требование маршрута обновлено.');
    } catch (error) {
      logUnexpectedActionError('Failed to update specialization route node', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось обновить требование маршрута.'));
    } finally {
      setRouteMutationPending(false);
    }
  };

  const handleReorderNavigationRouteNodes = async ({ firstRouteNodeId, secondRouteNodeId } = {}) => {
    if (!firstRouteNodeId || !secondRouteNodeId) {
      return;
    }

    setRouteMutationPending(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      await db.reorderSpecializationRouteNodes(firstRouteNodeId, secondRouteNodeId, selectedCampaignId);
      await loadNowDashboard(nowSelection);
      await loadNavigationSnapshot(navigationSelection);
      setNodeEditorNotice('Порядок маршрута обновлен.');
    } catch (error) {
      logUnexpectedActionError('Failed to reorder specialization route nodes', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось изменить порядок маршрута.'));
    } finally {
      setRouteMutationPending(false);
    }
  };

  const handleRemoveNavigationRouteNode = async ({ routeNodeId } = {}) => {
    if (!routeNodeId) {
      return;
    }

    setRouteMutationPending(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      await db.removeSpecializationRouteNode(routeNodeId, selectedCampaignId);
      await loadNowDashboard(nowSelection);
      await loadNavigationSnapshot(navigationSelection);
      setNodeEditorNotice('Узел убран из текущего маршрута.');
    } catch (error) {
      logUnexpectedActionError('Failed to remove specialization route node', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось убрать узел из маршрута.'));
    } finally {
      setRouteMutationPending(false);
    }
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
        selectedCampaignId,
      );
      await applyOutcomeResult(result);
      setActiveTab('map');
    } catch (error) {
      logUnexpectedActionError('Failed to create journal follow-up', error);
      setNavigationError(userActionErrorMessage(error, 'Не удалось создать следующий шаг.'));
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
        className="app-shell-header sticky top-0 z-50 px-3 pb-2 pt-2 sm:px-4"
        style={{
          paddingTop: runtime.usesSafeAreaInsets ? 'max(0.5rem, env(safe-area-inset-top))' : undefined,
        }}
      >
        <div className="flex w-full flex-col gap-2">
          <PixelSurface frame="panel" padding="xs" className="app-topbar">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div className="app-top-main flex min-w-0 flex-wrap items-center gap-2">
                <div className="app-brand-block flex items-center gap-2">
                  <PixelSurface frame="accent" padding="xs" fullWidth={false} className="app-brand-mark">
                    <Brain size={20} className="text-[var(--pixel-accent-glow)]" />
                  </PixelSurface>
                  <div className="min-w-0">
                    <PixelText as="h1" readable size="lg" style={{ margin: 0, lineHeight: 1.1, fontWeight: 800 }}>
                      BrainGainz
                    </PixelText>
                    <PixelText as="p" readable size="xs" color="textDim" className="app-runtime-copy" style={{ marginTop: 2 }}>
                      {runtime.isLocalFirst ? 'Локальная база' : 'Браузерное хранилище'}
                    </PixelText>
                  </div>
                </div>

                <div
                  className="app-primary-nav hide-scrollbar ml-0 flex min-w-0 items-center gap-1 overflow-x-auto sm:ml-3"
                  role="navigation"
                  aria-label="Основные разделы BrainGainz"
                >
                  <PixelButton
                    tone={!selectedCampaign ? 'accent' : 'ghost'}
                    onClick={handleBackToCampaigns}
                    aria-pressed={!selectedCampaign}
                    aria-current={!selectedCampaign ? 'page' : undefined}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <Globe2 size={14} /> <span>Кампании</span>
                  </PixelButton>
                  {selectedCampaign ? (
                    <PixelSurface frame="ghost" padding="xs" fullWidth={false} className="app-campaign-chip hidden md:block">
                      <PixelText as="span" readable size="xs" color="textMuted">
                        {selectedCampaign.name}
                      </PixelText>
                    </PixelSurface>
                  ) : null}
                  {selectedCampaign ? (
                    <>
                  <PixelButton
                    tone={normalizedActiveTab === 'now' ? 'accent' : 'ghost'}
                    onClick={() => setActiveTab('now')}
                    aria-pressed={normalizedActiveTab === 'now'}
                    aria-current={normalizedActiveTab === 'now' ? 'page' : undefined}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <Compass size={14} /> <span>Сейчас</span>
                  </PixelButton>
                  <PixelButton
                    tone={normalizedActiveTab === 'map' ? 'accent' : 'ghost'}
                    onClick={() => setActiveTab('map')}
                    aria-pressed={normalizedActiveTab === 'map'}
                    aria-current={normalizedActiveTab === 'map' ? 'page' : undefined}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <Map size={14} /> <span>Карта</span>
                  </PixelButton>
                  <PixelButton
                    tone={normalizedActiveTab === 'wind' ? 'accent' : 'ghost'}
                    onClick={() => setActiveTab('wind')}
                    aria-pressed={normalizedActiveTab === 'wind'}
                    aria-current={normalizedActiveTab === 'wind' ? 'page' : undefined}
                    style={{ minHeight: 30, padding: '6px 10px', gap: 6 }}
                  >
                    <Radar size={14} /> <span>Роза</span>
                  </PixelButton>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="app-top-actions flex min-w-0 items-center gap-2">
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
                  className="app-settings-button"
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
        {!selectedCampaign && (
          <CampaignMenu
            campaigns={campaigns}
            isLoading={campaignsLoading}
            isMutating={campaignMutationPending}
            newCampaignName={newCampaignName}
            error={campaignError}
            onNewCampaignNameChange={setNewCampaignName}
            onOpenCampaign={handleOpenCampaign}
            onCreateCampaign={handleCreateCampaign}
            onArchiveCampaign={handleArchiveCampaign}
            onRestoreCampaign={handleRestoreCampaign}
          />
        )}

        {selectedCampaign && normalizedActiveTab === 'now' && (
          <NowView
            snapshot={nowSnapshot}
            focus={nowFocus}
            isLoading={nowLoading}
            isFocusLoading={nowFocusLoading}
            error={nowError}
            notice={nowNotice}
            isCreatingStarter={nowCreatingStarter}
            onCreateStarterWorkspace={handleCreateStarterWorkspace}
            onSelectRecommendation={handleSelectNowRecommendation}
            onOpenMap={async (recommendation) => {
              await handleSelectNowRecommendation(recommendation);
              setActiveTab('map');
            }}
            onOpenRouteNode={handleOpenTodayRouteNode}
            onOpenRouteMap={handleOpenTodayRouteMap}
            onRefresh={loadNowDashboard}
            onCompleteSpecialization={handleCompleteSpecialization}
            onContinueSpecialization={handleContinueSpecialization}
          />
        )}

        {selectedCampaign && normalizedActiveTab === 'map' && (
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
            onRestoreNode={handleRestoreMapNode}
            onDuplicateNode={handleDuplicateMapNode}
            onUndoMapMutation={handleUndoMapMutation}
            onMarkSelfMastery={handleMarkNavigationSelfMastery}
            onSubmitAssessment={handleSubmitNavigationAssessment}
            currentSpecialization={nowSnapshot?.today?.currentSpecialization ?? null}
            currentRoute={nowSnapshot?.today?.route ?? null}
            routeFilterRequestId={mapRouteFilterRequestId}
            onRouteFilterRequestHandled={() => setMapRouteFilterRequestId(null)}
            onAddNodeToRoute={handleAddNavigationNodeToRoute}
            onUpdateRouteNode={handleUpdateNavigationRouteNode}
            onReorderRouteNodes={handleReorderNavigationRouteNodes}
            onRemoveRouteNode={handleRemoveNavigationRouteNode}
            editorPendingAction={nodeEditorPendingAction}
            masteryPendingAction={nodeMasteryPendingAction}
            routeMutationPending={routeMutationPending}
            editorNotice={nodeEditorNotice}
            mapMutationPendingAction={mapMutationPendingAction}
            canUndoMapMutation={mapUndoCount > 0}
            isSystemCampaign={selectedCampaign?.type === 'developer_main'}
            branchFilterSkillId={navigationBranchFilterId}
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

        {selectedCampaign && normalizedActiveTab === 'wind' && (
          <WindRoseView
            snapshot={windRoseSnapshot}
            isLoading={windRoseLoading}
            error={windRoseError}
            selectedStatId={selectedWindStatId}
            onSelectStat={setSelectedWindStatId}
            onOpenBranch={async (branch) => {
              const selection = branch.focus_node_id
                ? { nodeId: branch.focus_node_id, actionId: branch.next_action_id ?? null, skillId: branch.id }
                : { skillId: branch.id };
              setNavigationBranchFilterId(branch.id);
              setActiveTab('map');
              await loadNavigationSnapshot(selection);
            }}
            onRefresh={loadWindRose}
          />
        )}
        </Suspense>
      </main>
    </div>
  );
}
