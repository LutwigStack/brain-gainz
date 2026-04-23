import { getDatabase, resetDatabaseForTests } from './database/bootstrap.js';
import { createNowService } from './application/now-service.js';
import { createDailySessionStore } from './stores/daily-session-store.js';
import { createHierarchyStore } from './stores/hierarchy-store.js';
import { createLegacyCardStore } from './stores/legacy-card-store.js';
import { createLegacyMappingStore } from './stores/legacy-mapping-store.js';
import { createNodeNoteStore } from './stores/node-note-store.js';
import { createReviewStateStore } from './stores/review-state-store.js';
import type {
  DatabaseMutationResult,
  JournalFollowUpPayload,
  JournalSnapshot,
  LegacyCard,
  LegacyCardDraft,
  NodeArchivePayload,
  NavigationSnapshot,
  NodeCreatePayload,
  NodeDuplicatePayload,
  NodeEditorMutationResult,
  NodeFocusSnapshot,
  NodeUpdatePayload,
  NowDashboardSnapshot,
  PersistedNodeRecord,
  Subject,
} from './types/app-shell';

type StoresRegistry = {
  database: unknown;
  dailySessionStore: unknown;
  hierarchyStore: {
    getNodeById: (id: number) => Promise<PersistedNodeRecord | null>;
    createNode: (payload: NodeCreatePayload) => Promise<PersistedNodeRecord | null>;
    updateNode: (id: number, patch: NodeUpdatePayload) => Promise<PersistedNodeRecord | null>;
    archiveNode: (id: number) => Promise<PersistedNodeRecord | null>;
    duplicateNode: (id: number, payload?: NodeDuplicatePayload) => Promise<PersistedNodeRecord | null>;
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
    getDashboard: () => Promise<NowDashboardSnapshot>;
    createStarterWorkspace: () => Promise<NowDashboardSnapshot>;
    startTodaySessionFromPrimaryRecommendation: () => Promise<unknown>;
    startTodaySessionFromRecommendation: (actionId?: number | null) => Promise<unknown>;
    getNodeFocus: (nodeId: number, actionId?: number | null) => Promise<NodeFocusSnapshot | null>;
    getNavigationSnapshot: () => Promise<NavigationSnapshot>;
    getNodeEditorRecord: (nodeId: number) => Promise<PersistedNodeRecord | null>;
    createNodeEditor: (payload: NodeCreatePayload) => Promise<NodeEditorMutationResult | null>;
    updateNodeEditor: (nodeId: number, payload: NodeUpdatePayload) => Promise<NodeEditorMutationResult | null>;
    archiveNodeEditor: (nodeId: number, payload?: NodeArchivePayload) => Promise<NodeEditorMutationResult | null>;
    duplicateNodeEditor: (nodeId: number, payload?: NodeDuplicatePayload) => Promise<NodeEditorMutationResult | null>;
    getJournalSnapshot: () => Promise<JournalSnapshot>;
    createJournalFollowUpStep: (payload: JournalFollowUpPayload) => Promise<unknown>;
    completeActionInTodaySession: (actionId: number) => Promise<unknown>;
    deferActionInTodaySession: (actionId: number, note?: string) => Promise<unknown>;
    blockActionInTodaySession: (actionId: number, payload?: { barrierType?: string | null; note?: string }) => Promise<unknown>;
    shrinkActionInTodaySession: (actionId: number, payload?: { title?: string; note?: string }) => Promise<unknown>;
  };
};

let storesPromise: Promise<StoresRegistry> | null = null;

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
    nowService: null,
  };
};

const buildStoresWithServices = async () => {
  const stores = await buildStores();

  return {
    ...stores,
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
  return nowService.getNodeEditorRecord(id);
};

export const createNodeRecord = async (
  payload: NodeCreatePayload,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.createNodeEditor(payload);
};

export const updateNodeRecord = async (
  id: number,
  payload: NodeUpdatePayload,
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.updateNodeEditor(id, payload);
};

export const archiveNodeRecord = async (
  id: number,
  payload: NodeArchivePayload = {},
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.archiveNodeEditor(id, payload);
};

export const duplicateNodeRecord = async (
  id: number,
  payload: NodeDuplicatePayload = {},
): Promise<NodeEditorMutationResult | null> => {
  const { nowService } = await getStores();
  return nowService.duplicateNodeEditor(id, payload);
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

export const getNowDashboard = async (): Promise<NowDashboardSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getDashboard();
};

export const createStarterWorkspace = async (): Promise<NowDashboardSnapshot> => {
  const { nowService } = await getStores();
  return nowService.createStarterWorkspace();
};

export const startTodaySessionFromPrimaryRecommendation = async () => {
  const { nowService } = await getStores();
  return nowService.startTodaySessionFromPrimaryRecommendation();
};

export const startTodaySessionFromRecommendation = async (actionId: number | null = null) => {
  const { nowService } = await getStores();
  return nowService.startTodaySessionFromRecommendation(actionId);
};

export const getNowNodeFocus = async (nodeId: number, actionId: number | null = null): Promise<NodeFocusSnapshot | null> => {
  const { nowService } = await getStores();
  return nowService.getNodeFocus(nodeId, actionId);
};

export const getNavigationSnapshot = async (): Promise<NavigationSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getNavigationSnapshot();
};

export const getJournalSnapshot = async (): Promise<JournalSnapshot> => {
  const { nowService } = await getStores();
  return nowService.getJournalSnapshot();
};

export const createJournalFollowUpStep = async (payload: JournalFollowUpPayload) => {
  const { nowService } = await getStores();
  return nowService.createJournalFollowUpStep(payload);
};

export const completeNowActionInTodaySession = async (actionId: number) => {
  const { nowService } = await getStores();
  return nowService.completeActionInTodaySession(actionId);
};

export const deferNowActionInTodaySession = async (actionId: number, note = '') => {
  const { nowService } = await getStores();
  return nowService.deferActionInTodaySession(actionId, note);
};

export const blockNowActionInTodaySession = async (
  actionId: number,
  payload: { barrierType?: string | null; note?: string } = {},
) => {
  const { nowService } = await getStores();
  return nowService.blockActionInTodaySession(actionId, payload);
};

export const shrinkNowActionInTodaySession = async (
  actionId: number,
  payload: { title?: string; note?: string } = {},
) => {
  const { nowService } = await getStores();
  return nowService.shrinkActionInTodaySession(actionId, payload);
};

export const __resetDbForTests = () => {
  storesPromise = null;
  resetDatabaseForTests();
};
