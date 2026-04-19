import { createUtcTimestamp, insertAndFetch, updateAndFetchById } from './store-helpers.js';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export const createReviewStateStore = (database) => ({
  getByNodeId(nodeId) {
    return database.select('SELECT * FROM review_states WHERE node_id = ?', [nodeId]).then((rows) => rows[0] ?? null);
  },

  async save(input) {
    const existing = await this.getByNodeId(input.node_id);
    const updatedAt = input.updated_at ?? createUtcTimestamp();

    if (existing) {
      return updateAndFetchById(
        database,
        `
          UPDATE review_states
          SET review_profile = ?, next_due_at = ?, last_reviewed_at = ?, current_risk = ?, updated_at = ?
          WHERE id = ?
        `,
        [
          input.review_profile ?? existing.review_profile,
          hasOwn(input, 'next_due_at') ? input.next_due_at ?? null : existing.next_due_at,
          hasOwn(input, 'last_reviewed_at') ? input.last_reviewed_at ?? null : existing.last_reviewed_at,
          hasOwn(input, 'current_risk') ? input.current_risk ?? null : existing.current_risk,
          updatedAt,
          existing.id,
        ],
        'review_states',
        existing.id,
      );
    }

    return insertAndFetch(
      database,
      `
        INSERT INTO review_states (
          node_id,
          review_profile,
          next_due_at,
          last_reviewed_at,
          current_risk,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.node_id,
        input.review_profile ?? 'learning',
        input.next_due_at ?? null,
        input.last_reviewed_at ?? null,
        input.current_risk ?? null,
        updatedAt,
      ],
      'review_states',
    );
  },
});
