import { DatabaseSync } from 'node:sqlite';

const cloneRow = (row) => ({ ...row });

// This adapter intentionally mimics the small execute/select surface that the
// Tauri SQL plugin exposes to the stores, so bootstrap tests can run under
// Node without a desktop runtime.
const usesExec = (sql, params) => params.length === 0 && /^(CREATE|PRAGMA)/i.test(sql.trim());

export const createSqliteTestDatabase = () => {
  const database = new DatabaseSync(':memory:');

  return {
    async execute(sql, params = []) {
      if (usesExec(sql, params)) {
        database.exec(sql);
        return { rowsAffected: 0 };
      }

      const result = database.prepare(sql).run(...params);
      return {
        lastInsertId: Number(result.lastInsertRowid),
        rowsAffected: result.changes,
      };
    },

    async select(sql, params = []) {
      return database.prepare(sql).all(...params).map(cloneRow);
    },

    close() {
      database.close();
    },
  };
};
