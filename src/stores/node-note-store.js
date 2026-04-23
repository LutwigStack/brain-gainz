import { createUtcTimestamp, insertAndFetch } from './store-helpers.js';

export const createNodeNoteStore = (database) => ({
  createBarrierNote(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO node_barrier_notes (
          node_id,
          action_id,
          barrier_type,
          note,
          source_event_id,
          is_open,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.node_id,
        input.action_id ?? null,
        input.barrier_type,
        input.note ?? '',
        input.source_event_id ?? null,
        input.is_open ?? 1,
        createdAt,
        updatedAt,
      ],
      'node_barrier_notes',
    );
  },

  createErrorNote(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO node_error_notes (
          node_id,
          action_id,
          note_kind,
          note,
          source_event_id,
          is_open,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.node_id,
        input.action_id ?? null,
        input.note_kind,
        input.note ?? '',
        input.source_event_id ?? null,
        input.is_open ?? 1,
        createdAt,
        updatedAt,
      ],
      'node_error_notes',
    );
  },

  listBarrierNotesForNode(nodeId, { openOnly = false } = {}) {
    const predicate = openOnly ? 'AND is_open = 1' : '';
    return database.select(
      `
        SELECT *
        FROM node_barrier_notes
        WHERE node_id = ?
          ${predicate}
        ORDER BY updated_at DESC, id DESC
      `,
      [nodeId],
    );
  },

  listErrorNotesForNode(nodeId, { openOnly = false } = {}) {
    const predicate = openOnly ? 'AND is_open = 1' : '';
    return database.select(
      `
        SELECT *
        FROM node_error_notes
        WHERE node_id = ?
          ${predicate}
        ORDER BY updated_at DESC, id DESC
      `,
      [nodeId],
    );
  },

  listRecentBarrierNotes(limit = 40) {
    return database.select(
      `
        SELECT *
        FROM node_barrier_notes
        ORDER BY updated_at DESC, id DESC
        LIMIT ?
      `,
      [limit],
    );
  },

  listRecentErrorNotes(limit = 40) {
    return database.select(
      `
        SELECT *
        FROM node_error_notes
        ORDER BY updated_at DESC, id DESC
        LIMIT ?
      `,
      [limit],
    );
  },
});