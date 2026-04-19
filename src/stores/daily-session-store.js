import { createUtcTimestamp, insertAndFetch } from './store-helpers.js';

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
});
