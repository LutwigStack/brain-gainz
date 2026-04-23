const STORAGE_KEY = 'braingainz.web.sqlite.v1';

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
  const persistedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!persistedValue) {
    return null;
  }

  try {
    return decodeBase64(persistedValue);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const loadWebDatabase = async () => {
  const SQL = await getSqlJs();
  const database = new SQL.Database(loadPersistedBytes());

  const persist = () => {
    const exportedBytes = database.export();
    window.localStorage.setItem(STORAGE_KEY, encodeBase64(exportedBytes));
  };

  return {
    async execute(sql, params = []) {
      database.run(sql, params);
      const rowsAffected = database.getRowsModified();
      const lastInsertRow = database.exec('SELECT last_insert_rowid() AS id');
      const lastInsertId = Number(lastInsertRow[0]?.values?.[0]?.[0] ?? 0);

      persist();

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
      database.close();
    },
  };
};