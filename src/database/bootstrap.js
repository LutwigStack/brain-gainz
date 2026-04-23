import { ensureLegacySchema, seedLegacyDefaults } from './legacy-schema.js';
import { runPr1Migrations } from './pr1-migrations.js';
import { getRuntimeProfile } from '../platform/runtime.js';

const DEFAULT_DATABASE_URL = 'sqlite:braingainz.db';

let databasePromise = null;

const loadTauriDatabase = async () => {
  const { default: Database } = await import('@tauri-apps/plugin-sql');
  return Database.load(DEFAULT_DATABASE_URL);
};

const loadWebDatabase = async () => {
  const { loadWebDatabase } = await import('./web-sqlite.js');
  return loadWebDatabase();
};

const loadDefaultDatabase = async () => {
  const runtime = getRuntimeProfile();

  if (runtime.kind === 'tauri-desktop') {
    return loadTauriDatabase();
  }

  if (runtime.kind === 'web' || runtime.kind === 'capacitor-native') {
    return loadWebDatabase();
  }

  throw new Error('No default database runtime is available outside the browser or Tauri.');
};

export const bootstrapDatabase = async (database) => {
  await database.execute('PRAGMA foreign_keys = ON');
  await ensureLegacySchema(database);
  await runPr1Migrations(database);
  await seedLegacyDefaults(database);
  return database;
};

export const getDatabase = async ({ loadDatabase = loadDefaultDatabase } = {}) => {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await loadDatabase();
      return bootstrapDatabase(database);
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
};

export const resetDatabaseForTests = () => {
  databasePromise = null;
};
