import { getDatabase, resetDatabaseForTests } from './database/bootstrap.js';
import { createNowService } from './application/now-service.js';
import { createDailySessionStore } from './stores/daily-session-store.js';
import { createCampaignStore } from './stores/campaign-store.js';
import { createHierarchyStore } from './stores/hierarchy-store.js';
import { createLegacyCardStore } from './stores/legacy-card-store.js';
import { createLegacyMappingStore } from './stores/legacy-mapping-store.js';
import { createNodeNoteStore } from './stores/node-note-store.js';
import { createReviewStateStore } from './stores/review-state-store.js';
import type {
  DatabaseMutationResult,
  CareerSnapshot,
  GraphEdgeCreatePayload,
  GraphEdgeMutationResult,
  GraphEdgeUpdatePayload,
  JournalFollowUpPayload,
  JournalSnapshot,
  LegacyCard,
  LegacyCardDraft,
  NodeArchivePayload,
  NodeLayoutPositionInput,
  NavigationSnapshot,
  NodeCreatePayload,
  NodeDuplicatePayload,
  NodeEditorMutationResult,
  NodeFocusSnapshot,
  NodeUpdatePayload,
  NowDashboardSnapshot,
  PersistedNodeRecord,
  PersistedGraphEdgeRecord,
  Subject,
} from './types/app-shell';

type StoresRegistry = {
  database: unknown;
  dailySessionStore: unknown;
  hierarchyStore: {
    getNodeById: (id: number) => Promise<PersistedNodeRecord | null>;
    createNode: (payload: NodeCreatePayload) => Promise<PersistedNodeRecord | null>;
    updateNode: (id: number, patch: NodeUpdatePayload) => Promise<PersistedNodeRecord | null>;
    updateNodePositionsBatch: (positions: NodeLayoutPositionInput[]) => Promise<PersistedNodeRecord[]>;
    archiveNode: (id: number, payload?: NodeArchivePayload) => Promise<PersistedNodeRecord | null>;
    duplicateNode: (id: number, payload?: NodeDuplicatePayload) => Promise<PersistedNodeRecord | null>;
    getNodeDependencyById: (id: number) => Promise<PersistedGraphEdgeRecord | null>;
    addNodeDependency: (payload: GraphEdgeCreatePayload) => Promise<PersistedGraphEdgeRecord | null>;
    updateNodeDependency: (id: number, patch: GraphEdgeUpdatePayload) => Promise<PersistedGraphEdgeRecord | null>;
    deleteNodeDependency: (id: number) => Promise<PersistedGraphEdgeRecord | null>;
  };
  legacyCardStore: {
    getSubjects: () => Promise<Subject[]>;
    addSubject: (name: string, icon: string) => Promise<DatabaseMutationResult>;
    deleteSubject: (id: number) => Promise<DatabaseMutationResult>;
    getCards: (subjectId: number) => Promise<LegacyCard[]>;
    addCard: (card: LegacyCardDraft) => Promise<DatabaseMutationResult>;
    updateCard: (id: number, card: Partial<LegacyCard>) => Promise<DatabaseMutationResult>;
    deleteCard: (id: number) => Promise<DatabaseMutationResult>;
  };
  legacyMappingStore: unknown;
  nodeNoteStore: unknown;
  reviewStateStore: unknown;
  nowService: {
    getDashboard: (campaignId?: number | null) => Promise<NowDashboardSnapshot>;
    createStarterWorkspace: (campaignId?: number | null) => Promise<NowDashboardSnapshot>;
    createStructureWorkspace: (campaignId: number | null, input: { name: string }) => Promise<NowDashboardSnapshot>;
    createLinearAlgebraGraphWorkspace: (campaignId?: number | null) => Promise<NowDashboardSnapshot>;
    startTodaySessionFromPrimaryRecommendation: (campaignId?: number | null) => Promise<unknown>;
    startTodaySessionFromRecommendation: (campaignId?: number | null, actionId?: number | null) => Promise<unknown>;
    getNodeFocus: (campaignId: number | null, nodeId: number, actionId?: number | null) => Promise<NodeFocusSnapshot | null>;
    getNavigationSnapshot: (campaignId?: number | null) => Promise<NavigationSnapshot>;
    getNodeEditorRecord: (campaignId: number | null, nodeId: number) => Promise<PersistedNodeRecord | null>;
    createNodeEditor: (campaignId: number | null, payload: NodeCreatePayload) => Promise<NodeEditorMutationResult | null>;
    updateNodeEditor: (campaignId: number | null, nodeId: number, payload: NodeUpdatePayload) => Promise<NodeEditorMutationResult | null>;
    archiveNodeEditor: (campaignId: number | null, nodeId: number, payload?: NodeArchivePayload) => Promise<NodeEditorMutationResult | null>;
    restoreNodeEditor: (campaignId: number | null, nodeId: number) => Promise<NodeEditorMutationResult | null>;
    duplicateNodeEditor: (campaignId: number | null, nodeId: number, payload?: NodeDuplicatePayload) => Promise<NodeEditorMutationResult | null>;
    createGraphEdge: (campaignId: number | null, payload: GraphEdgeCreatePayload) => Promise<GraphEdgeMutationResult | null>;
    updateGraphEdge: (campaignId: number | null, edgeId: number, payload: GraphEdgeUpdatePayload) => Promise<GraphEdgeMutationResult | null>;
    deleteGraphEdge: (campaignId: number | null, edgeId: number) => Promise<GraphEdgeMutationResult | null>;
    getJournalSnapshot: (campaignId?: number | null) => Promise<JournalSnapshot>;
    createJournalFollowUpStep: (campaignId: number | null, payload: JournalFollowUpPayload) => Promise<unknown>;
    completeActionInTodaySession: (campaignId: number | null, actionId: number) => Promise<unknown>;
    deferActionInTodaySession: (campaignId: number | null, actionId: number, note?: string) => Promise<unknown>;
    blockActionInTodaySession: (campaignId: number | null, actionId: number, payload?: { barrierType?: string | null; note?: string }) => Promise<unknown>;
    shrinkActionInTodaySession: (campaignId: number | null, actionId: number, payload?: { title?: string; note?: string }) => Promise<unknown>;
    getWindRoseSnapshot: (campaignId?: number | null) => Promise<unknown>;
    getCareerSnapshot: (campaignId?: number | null) => Promise<CareerSnapshot>;
    createSpecialization: (campaignId: number | null, input: unknown) => Promise<unknown>;
    continueWithSpecialization: (campaignId: number | null, input: unknown) => Promise<unknown>;
    completeSpecialization: (campaignId: number | null, specializationId?: number | null, options?: unknown) => Promise<unknown>;
    archiveSpecialization: (campaignId: number | null, specializationId: number) => Promise<unknown>;
    getRouteCompletion: (campaignId: number | null, specializationId?: number | null) => Promise<unknown>;
    upsertKnowledgeNode: (input: unknown) => Promise<unknown>;
    addSpecializationRouteNode: (campaignId: number | null, specializationId: number, input: unknown) => Promise<unknown>;
    updateSpecializationRouteNode: (campaignId: number | null, routeNodeId: number, input: unknown) => Promise<unknown>;
    reorderSpecializationRouteNodes: (campaignId: number | null, firstRouteNodeId: number, secondRouteNodeId: number) => Promise<unknown>;
    removeSpecializationRouteNode: (campaignId: number | null, routeNodeId: number) => Promise<unknown>;
    submitAssessmentAttempt: (campaignId: number | null, input: unknown) => Promise<unknown>;
    markSelfMastery: (campaignId: number | null, nodeId: number, masteryLevel?: string) => Promise<unknown>;
  };
  campaignStore: {
    listCampaigns: () => Promise<unknown>;
    openCampaign: (id: number) => Promise<unknown>;
    createUserCampaign: (input: { name: string }) => Promise<unknown>;
    archiveCampaign: (id: number) => Promise<unknown>;
    restoreCampaign: (id: number) => Promise<unknown>;
  };
};

let storesPromise: Promise<StoresRegistry> | null = null;

const requireCampaignId = (campaignId: number | null | undefined): number => {
  if (!Number.isInteger(campaignId)) {
    throw new Error('Campaign-scoped operation requires an active campaign.');
  }

  return campaignId as number;
};

const buildStores = async () => {
  const database = await getDatabase();

  return {
    database,
    dailySessionStore: createDailySessionStore(database),
    hierarchyStore: createHierarchyStore(database),
    legacyCardStore: createLegacyCardStore(database),
    legacyMappingStore: createLegacyMappingStore(database),
    nodeNoteStore: createNodeNoteStore(database),
    reviewStateStore: createReviewStateStore(database),
    campaignStore: null,
    nowService: null,
  };
};

const buildStoresWithServices = async () => {
  const stores = await buildStores();

  return {
    ...stores,
    campaignStore: createCampaignStore(stores.database, stores.hierarchyStore),
    nowService: createNowService(stores),
  } as StoresRegistry;
};

const getStores = async () => {
  if (!storesPromise) {
    storesPromise = buildStoresWithServices().catch((error) => {
      storesPromise = null;
      throw error;
    });
  }

  return storesPromise;
};

export const initDb = async () => {
  const { database } = await getStores();
  return database;
};

export const getSubjects = async (): Promise<Subject[]> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.getSubjects();
};

export const addSubject = async (name: string, icon: string): Promise<DatabaseMutationResult> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.addSubject(name, icon);
};

export const deleteSubject = async (id: number): Promise<DatabaseMutationResult> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.deleteSubject(id);
};

export const getCards = async (subjectId: number): Promise<LegacyCard[]> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.getCards(subjectId);
};

export const addCard = async (card: LegacyCardDraft): Promise<DatabaseMutationResult> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.addCard(card);
};

export const updateCard = async (id: number, card: Partial<LegacyCard>): Promise<DatabaseMutationResult> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.updateCard(id, card);
};

export const deleteCard = async (id: number): Promise<DatabaseMutationResult> => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.deleteCard(id);
};

export const getHierarchyStore = async () => {
  const { hierarchyStore } = await getStores();
  return hierarchyStore;
};

export const getNodeRecord = async (id: number): Promise<PersistedNodeRecord | null> => {
  const { nowService } = await getStores();
  return nowService.getNodeEditorRecord(null, id);
};

export const getCampaigns = async () => {
  const { campaignStore } = await getStores();
  return campaignStore.listCampaigns();
};

export const openCampaign = async (id: number) => {
  const { campaignStore } = await getStores();
  return campaignStore.openCampaign(id);
};

export const createUserCampaign = async (input: { name: string }) => {
  const { campaignStore } = await getStores();
  return campaignStore.createUserCampaign(input);
};

export const archiveCampaign = async (id: number) => {
  const { campaignStore } = await getStores();
  return campaignStore.archiveCampaign(id);
};

export const restoreCampaign = async (id: number) => {
  const { campaignStore } = await getStores();
  return campaignStore.restoreCampaign(id);
};

export const createNodeRecord = async (
  payload: NodeCreatePayload,
  campaignId: number | null = null,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.createNodeEditor(requireCampaignId(campaignId), payload);
};

export const updateNodeRecord = async (
  id: number,
  payload: NodeUpdatePayload,
  campaignId: number | null = null,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.updateNodeEditor(requireCampaignId(campaignId), id, payload);
};

export const applyNodeLayout = async (
  positions: NodeLayoutPositionInput[],
): Promise<PersistedNodeRecord[]> => {
  const { hierarchyStore } = await getStores();
  return hierarchyStore.updateNodePositionsBatch(positions);
};

export const archiveNodeRecord = async (
  id: number,
  payload: NodeArchivePayload = {},
  campaignId: number | null = null,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.archiveNodeEditor(requireCampaignId(campaignId), id, payload);
};

export const restoreNodeRecord = async (
  id: number,
  campaignId: number | null = null,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.restoreNodeEditor(requireCampaignId(campaignId), id);
};

export const duplicateNodeRecord = async (
  id: number,
  payload: NodeDuplicatePayload = {},
  campaignId: number | null = null,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.duplicateNodeEditor(requireCampaignId(campaignId), id, payload);
};

export const createGraphEdge = async (
  payload: GraphEdgeCreatePayload,
  campaignId: number | null = null,
): Promise<GraphEdgeMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.createGraphEdge(requireCampaignId(campaignId), payload);
};

export const updateGraphEdge = async (
  id: number,
  payload: GraphEdgeUpdatePayload,
  campaignId: number | null = null,
): Promise<GraphEdgeMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.updateGraphEdge(requireCampaignId(campaignId), id, payload);
};

export const deleteGraphEdge = async (id: number, campaignId: number | null = null): Promise<GraphEdgeMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.deleteGraphEdge(requireCampaignId(campaignId), id);
};

export const getReviewStateStore = async () => {
  const { reviewStateStore } = await getStores();
  return reviewStateStore;
};

export const getDailySessionStore = async () => {
  const { dailySessionStore } = await getStores();
  return dailySessionStore;
};

export const getLegacyMappingStore = async () => {
  const { legacyMappingStore } = await getStores();
  return legacyMappingStore;
};

export const getNodeNoteStore = async () => {
  const { nodeNoteStore } = await getStores();
  return nodeNoteStore;
};

export const getNowDashboard = async (campaignId: number | null = null): Promise<NowDashboardSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getDashboard(requireCampaignId(campaignId));
};

export const createStarterWorkspace = async (campaignId: number | null = null): Promise<NowDashboardSnapshot> => {
  const { nowService } = await getStores();
  return nowService.createStarterWorkspace(requireCampaignId(campaignId));
};

export const createStructureWorkspace = async (input: { name: string }, campaignId: number | null = null): Promise<NowDashboardSnapshot> => {
  const { nowService } = await getStores();
  return nowService.createStructureWorkspace(requireCampaignId(campaignId), input);
};

export const createLinearAlgebraGraphWorkspace = async (campaignId: number | null = null): Promise<NowDashboardSnapshot> => {
  const { nowService } = await getStores();
  return nowService.createLinearAlgebraGraphWorkspace(requireCampaignId(campaignId));
};

export const startTodaySessionFromPrimaryRecommendation = async (campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.startTodaySessionFromPrimaryRecommendation(requireCampaignId(campaignId));
};

export const startTodaySessionFromRecommendation = async (actionId: number | null = null, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.startTodaySessionFromRecommendation(requireCampaignId(campaignId), actionId);
};

export const getNowNodeFocus = async (nodeId: number, actionId: number | null = null, campaignId: number | null = null): Promise<NodeFocusSnapshot | null> => {
  const { nowService } = await getStores();
  return nowService.getNodeFocus(requireCampaignId(campaignId), nodeId, actionId);
};

export const getNavigationSnapshot = async (campaignId: number | null = null): Promise<NavigationSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getNavigationSnapshot(requireCampaignId(campaignId));
};

export const getJournalSnapshot = async (campaignId: number | null = null): Promise<JournalSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getJournalSnapshot(requireCampaignId(campaignId));
};

export const getWindRoseSnapshot = async (campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.getWindRoseSnapshot(requireCampaignId(campaignId));
};

export const getCareerSnapshot = async (campaignId: number | null = null): Promise<CareerSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getCareerSnapshot(requireCampaignId(campaignId));
};

export const createSpecialization = async (input: unknown, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.createSpecialization(requireCampaignId(campaignId), input);
};

export const continueWithSpecialization = async (input: unknown, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.continueWithSpecialization(requireCampaignId(campaignId), input);
};

export const completeSpecialization = async (
  specializationId: number | null = null,
  options: unknown = {},
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.completeSpecialization(requireCampaignId(campaignId), specializationId, options);
};

export const archiveSpecialization = async (specializationId: number, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.archiveSpecialization(requireCampaignId(campaignId), specializationId);
};

export const getRouteCompletion = async (specializationId: number | null = null, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.getRouteCompletion(requireCampaignId(campaignId), specializationId);
};

export const upsertKnowledgeNode = async (input: unknown) => {
  const { nowService } = await getStores();
  return nowService.upsertKnowledgeNode(input);
};

export const addSpecializationRouteNode = async (
  specializationId: number,
  input: unknown,
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.addSpecializationRouteNode(requireCampaignId(campaignId), specializationId, input);
};

export const updateSpecializationRouteNode = async (
  routeNodeId: number,
  input: unknown,
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.updateSpecializationRouteNode(requireCampaignId(campaignId), routeNodeId, input);
};

export const reorderSpecializationRouteNodes = async (
  firstRouteNodeId: number,
  secondRouteNodeId: number,
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.reorderSpecializationRouteNodes(
    requireCampaignId(campaignId),
    firstRouteNodeId,
    secondRouteNodeId,
  );
};

export const removeSpecializationRouteNode = async (routeNodeId: number, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.removeSpecializationRouteNode(requireCampaignId(campaignId), routeNodeId);
};

export const submitAssessmentAttempt = async (input: unknown, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.submitAssessmentAttempt(requireCampaignId(campaignId), input);
};

export const markSelfMastery = async (
  nodeId: number,
  masteryLevel: string = 'seen',
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.markSelfMastery(requireCampaignId(campaignId), nodeId, masteryLevel);
};

export const createJournalFollowUpStep = async (payload: JournalFollowUpPayload, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.createJournalFollowUpStep(requireCampaignId(campaignId), payload);
};

export const completeNowActionInTodaySession = async (actionId: number, campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.completeActionInTodaySession(requireCampaignId(campaignId), actionId);
};

export const deferNowActionInTodaySession = async (actionId: number, note = '', campaignId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.deferActionInTodaySession(requireCampaignId(campaignId), actionId, note);
};

export const blockNowActionInTodaySession = async (
  actionId: number,
  payload: { barrierType?: string | null; note?: string } = {},
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.blockActionInTodaySession(requireCampaignId(campaignId), actionId, payload);
};

export const shrinkNowActionInTodaySession = async (
  actionId: number,
  payload: { title?: string; note?: string } = {},
  campaignId: number | null = null,
) => {
  const { nowService } = await getStores();
  return nowService.shrinkActionInTodaySession(requireCampaignId(campaignId), actionId, payload);
};

export const __resetDbForTests = () => {
  storesPromise = null;
  resetDatabaseForTests();
};
