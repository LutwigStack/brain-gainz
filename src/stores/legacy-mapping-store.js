import { createUtcTimestamp, insertAndFetch } from './store-helpers.js';

export const createLegacyMappingStore = (database) => ({
  createSubjectMapping(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO legacy_subject_mappings (
          legacy_subject_id,
          sphere_id,
          direction_id,
          skill_id,
          mapping_status,
          mapping_decider,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.legacy_subject_id,
        input.sphere_id ?? null,
        input.direction_id ?? null,
        input.skill_id ?? null,
        input.mapping_status ?? 'pending',
        input.mapping_decider ?? 'assisted',
        createdAt,
        updatedAt,
      ],
      'legacy_subject_mappings',
    );
  },

  createCardMapping(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO legacy_card_mappings (
          legacy_card_id,
          node_id,
          mapping_status,
          mapping_decider,
          link_role,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.legacy_card_id,
        input.node_id ?? null,
        input.mapping_status ?? 'pending',
        input.mapping_decider ?? 'assisted',
        input.link_role ?? null,
        createdAt,
        updatedAt,
      ],
      'legacy_card_mappings',
    );
  },

  getSubjectMappingByLegacySubjectId(legacySubjectId) {
    return database
      .select('SELECT * FROM legacy_subject_mappings WHERE legacy_subject_id = ?', [legacySubjectId])
      .then((rows) => rows[0] ?? null);
  },

  getCardMappingByLegacyCardId(legacyCardId) {
    return database
      .select('SELECT * FROM legacy_card_mappings WHERE legacy_card_id = ?', [legacyCardId])
      .then((rows) => rows[0] ?? null);
  },
});
