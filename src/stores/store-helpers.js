export const createUtcTimestamp = () => new Date().toISOString();

export const insertAndFetch = async (database, statement, params, tableName) => {
  const result = await database.execute(statement, params);

  if (result?.lastInsertId == null) {
    return result;
  }

  const rows = await database.select(`SELECT * FROM ${tableName} WHERE id = ?`, [result.lastInsertId]);
  return rows[0] ?? null;
};

export const updateAndFetchById = async (database, statement, params, tableName, id) => {
  await database.execute(statement, params);
  const rows = await database.select(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
  return rows[0] ?? null;
};
