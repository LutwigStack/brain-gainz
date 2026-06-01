import { WEB_SQLITE_STORAGE_KEY } from './web-sqlite-storage-key.js';

export { WEB_SQLITE_STORAGE_KEY };

let sqlJsPromise = null;

const decodeBase64 = (value) => {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const encodeBase64 = (bytes) => {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return window.btoa(binary);
};

const getSqlJs = async () => {
  if (!sqlJsPromise) {
    sqlJsPromise = (async () => {
      const [{ default: initSqlJs }, { default: wasmUrl }] = await Promise.all([
        import('sql.js'),
        import('sql.js/dist/sql-wasm.wasm?url'),
      ]);

      return initSqlJs({
        locateFile: () => wasmUrl,
      });
    })().catch((error) => {
      sqlJsPromise = null;
      throw error;
    });
  }

  return sqlJsPromise;
};

const loadPersistedBytes = () => {
  const persistedValue = window.localStorage.getItem(WEB_SQLITE_STORAGE_KEY);

  if (!persistedValue) {
    return null;
  }

  try {
    return decodeBase64(persistedValue);
  } catch (error) {
    throw new Error('Failed to decode persisted local database.', { cause: error });
  }
};

export const loadWebDatabase = async () => {
  const SQL = await getSqlJs();
  const database = new SQL.Database(loadPersistedBytes());
  let transactionDepth = 0;
  let persistTimer = null;
  let isClosed = false;

  const persist = () => {
    if (isClosed) {
      return;
    }
    const exportedBytes = database.export();
    window.localStorage.setItem(WEB_SQLITE_STORAGE_KEY, encodeBase64(exportedBytes));
  };

  const flushPersist = () => {
    if (persistTimer != null) {
      window.clearTimeout(persistTimer);
      persistTimer = null;
    }
    persist();
  };

  const schedulePersist = () => {
    if (persistTimer != null) {
      window.clearTimeout(persistTimer);
    }
    persistTimer = window.setTimeout(() => {
      persistTimer = null;
      persist();
    }, 250);
  };

  const handlePageHidden = () => {
    if (document.visibilityState === 'hidden') {
      flushPersist();
    }
  };

  window.addEventListener('pagehide', flushPersist);
  document.addEventListener('visibilitychange', handlePageHidden);

  return {
    async execute(sql, params = []) {
      const normalizedSql = String(sql ?? '').trim().toUpperCase();
      const isBegin = normalizedSql === 'BEGIN' || normalizedSql.startsWith('BEGIN ');
      const isCommit = normalizedSql === 'COMMIT' || normalizedSql.startsWith('COMMIT ');
      const isRollback = normalizedSql === 'ROLLBACK' || normalizedSql.startsWith('ROLLBACK ');

      database.run(sql, params);
      const rowsAffected = database.getRowsModified();
      const lastInsertRow = database.exec('SELECT last_insert_rowid() AS id');
      const lastInsertId = Number(lastInsertRow[0]?.values?.[0]?.[0] ?? 0);

      if (isBegin) {
        transactionDepth += 1;
      } else if (isCommit || isRollback) {
        transactionDepth = Math.max(0, transactionDepth - 1);
      }

      if (transactionDepth === 0 && !isBegin && !isRollback) {
        schedulePersist();
      }

      return {
        lastInsertId,
        rowsAffected,
      };
    },

    async select(sql, params = []) {
      const statement = database.prepare(sql, params);
      const rows = [];

      while (statement.step()) {
        rows.push(statement.getAsObject());
      }

      statement.free();
      return rows;
    },

    close() {
      flushPersist();
      window.removeEventListener('pagehide', flushPersist);
      document.removeEventListener('visibilitychange', handlePageHidden);
      isClosed = true;
      database.close();
    },
  };
};
