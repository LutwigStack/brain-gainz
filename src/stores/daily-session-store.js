import { createUtcTimestamp, insertAndFetch, updateAndFetchById } from './store-helpers.js';

export const createDailySessionStore = (database) => ({
  createSession(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO daily_sessions (
          session_date,
          status,
          primary_node_id,
          primary_action_id,
          started_at,
          ended_at,
          summary_note,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.session_date,
        input.status ?? 'planned',
        input.primary_node_id ?? null,
        input.primary_action_id ?? null,
        input.started_at ?? null,
        input.ended_at ?? null,
        input.summary_note ?? null,
        createdAt,
        updatedAt,
      ],
      'daily_sessions',
    );
  },

  addSessionEvent(input) {
    return insertAndFetch(
      database,
      `
        INSERT INTO daily_session_events (
          session_id,
          event_type,
          node_id,
          action_id,
          note,
          occurred_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.session_id,
        input.event_type,
        input.node_id ?? null,
        input.action_id ?? null,
        input.note ?? null,
        input.occurred_at ?? createUtcTimestamp(),
      ],
      'daily_session_events',
    );
  },

  getSessionById(id) {
    return database.select('SELECT * FROM daily_sessions WHERE id = ?', [id]).then((rows) => rows[0] ?? null);
  },

  getEventsForSession(sessionId) {
    return database.select('SELECT * FROM daily_session_events WHERE session_id = ? ORDER BY id ASC', [sessionId]);
  },

  async updateSession(id, patch) {
    const current = await this.getSessionById(id);

    if (!current) {
      return null;
    }

    const next = {
      ...current,
      ...patch,
      updated_at: patch.updated_at ?? createUtcTimestamp(),
    };

    return updateAndFetchById(
      database,
      `
        UPDATE daily_sessions
        SET status = ?, started_at = ?, ended_at = ?, summary_note = ?, updated_at = ?
        WHERE id = ?
      `,
      [next.status, next.started_at, next.ended_at, next.summary_note, next.updated_at, id],
      'daily_sessions',
      id,
    );
  },
});
