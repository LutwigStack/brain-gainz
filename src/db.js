import { getDatabase, resetDatabaseForTests } from './database/bootstrap.js';
import { createDailySessionStore } from './stores/daily-session-store.js';
import { createHierarchyStore } from './stores/hierarchy-store.js';
import { createLegacyCardStore } from './stores/legacy-card-store.js';
import { createLegacyMappingStore } from './stores/legacy-mapping-store.js';
import { createReviewStateStore } from './stores/review-state-store.js';

let storesPromise = null;

const buildStores = async () => {
  const database = await getDatabase();

  return {
    database,
    dailySessionStore: createDailySessionStore(database),
    hierarchyStore: createHierarchyStore(database),
    legacyCardStore: createLegacyCardStore(database),
    legacyMappingStore: createLegacyMappingStore(database),
    reviewStateStore: createReviewStateStore(database),
  };
};

const getStores = async () => {
  if (!storesPromise) {
    storesPromise = buildStores().catch((error) => {
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

export const getSubjects = async () => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.getSubjects();
};

export const addSubject = async (name, icon) => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.addSubject(name, icon);
};

export const deleteSubject = async (id) => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.deleteSubject(id);
};

export const getCards = async (subjectId) => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.getCards(subjectId);
};

export const addCard = async (card) => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.addCard(card);
};

export const updateCard = async (id, card) => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.updateCard(id, card);
};

export const deleteCard = async (id) => {
  const { legacyCardStore } = await getStores();
  return legacyCardStore.deleteCard(id);
};

export const getHierarchyStore = async () => {
  const { hierarchyStore } = await getStores();
  return hierarchyStore;
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

export const __resetDbForTests = () => {
  storesPromise = null;
  resetDatabaseForTests();
};
