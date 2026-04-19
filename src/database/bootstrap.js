import { ensureLegacySchema, seedLegacyDefaults } from './legacy-schema.js';
import { runPr1Migrations } from './pr1-migrations.js';

const DEFAULT_DATABASE_URL = 'sqlite:braingainz.db';

let databasePromise = null;

const loadTauriDatabase = async () => {
  const { default: Database } = await import('@tauri-apps/plugin-sql');
  return Database.load(DEFAULT_DATABASE_URL);
};

export const bootstrapDatabase = async (database) => {
  await database.execute('PRAGMA foreign_keys = ON');
  await ensureLegacySchema(database);
  await runPr1Migrations(database);
  await seedLegacyDefaults(database);
  return database;
};

export const getDatabase = async ({ loadDatabase = loadTauriDatabase } = {}) => {
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
