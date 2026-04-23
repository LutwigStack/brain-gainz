import { createUtcTimestamp, insertAndFetch, updateAndFetchById } from './store-helpers.js';

const buildDuplicateSlugCandidate = (baseSlug, attempt) => {
  if (attempt === 0) {
    return `${baseSlug}-copy`;
  }

  return `${baseSlug}-copy-${attempt + 1}`;
};

const findAvailableDuplicateSlug = async (database, skillId, baseSlug) => {
  let attempt = 0;

  while (attempt < 1000) {
    const slug = buildDuplicateSlugCandidate(baseSlug, attempt);
    const rows = await database.select('SELECT id FROM nodes WHERE skill_id = ? AND slug = ?', [skillId, slug]);

    if (rows.length === 0) {
      return slug;
    }

    attempt += 1;
  }

  throw new Error(`Unable to allocate duplicate slug for "${baseSlug}"`);
};

const normalizeNodeArchiveState = (current, patch) => {
  const next = {
    ...current,
    ...patch,
  };

  if (patch.status !== undefined) {
    next.is_archived = patch.status === 'archived' ? 1 : 0;
    return next;
  }

  if (patch.is_archived !== undefined) {
    next.status = patch.is_archived ? 'archived' : current.status === 'archived' ? 'active' : current.status;
    return next;
  }

  if (next.status === 'archived' || next.is_archived === 1) {
    next.status = 'archived';
    next.is_archived = 1;
    return next;
  }

  next.is_archived = 0;
  return next;
};

export const createHierarchyStore = (database) => ({
  createSphere(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO spheres (name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.name,
        input.slug,
        input.description ?? null,
        input.sort_order ?? 0,
        input.is_archived ?? 0,
        createdAt,
        updatedAt,
      ],
      'spheres',
    );
  },

  createDirection(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO directions (sphere_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.sphere_id,
        input.name,
        input.slug,
        input.description ?? null,
        input.sort_order ?? 0,
        input.is_archived ?? 0,
        createdAt,
        updatedAt,
      ],
      'directions',
    );
  },

  createSkill(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO skills (direction_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.direction_id,
        input.name,
        input.slug,
        input.description ?? null,
        input.sort_order ?? 0,
        input.is_archived ?? 0,
        createdAt,
        updatedAt,
      ],
      'skills',
    );
  },

  createNode(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO nodes (
          skill_id,
          type,
          status,
          title,
          slug,
          summary,
          importance,
          target_date,
          last_touched_at,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.skill_id,
        input.type,
        input.status ?? 'active',
        input.title,
        input.slug,
        input.summary ?? null,
        input.importance ?? 'medium',
        input.target_date ?? null,
        input.last_touched_at ?? null,
        input.is_archived ?? 0,
        createdAt,
        updatedAt,
      ],
      'nodes',
    );
  },

  createNodeAction(input) {
    const createdAt = input.created_at ?? createUtcTimestamp();
    const updatedAt = input.updated_at ?? createdAt;

    return insertAndFetch(
      database,
      `
        INSERT INTO node_actions (
          node_id,
          title,
          details,
          status,
          size_hint,
          sort_order,
          is_minimum_step,
          is_repeatable,
          due_at,
          completed_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.node_id,
        input.title,
        input.details ?? null,
        input.status ?? 'todo',
        input.size_hint ?? null,
        input.sort_order ?? 0,
        input.is_minimum_step ?? 0,
        input.is_repeatable ?? 0,
        input.due_at ?? null,
        input.completed_at ?? null,
        createdAt,
        updatedAt,
      ],
      'node_actions',
    );
  },

  addNodeDependency(input) {
    return insertAndFetch(
      database,
      `
        INSERT INTO node_dependencies (
          blocked_node_id,
          blocking_node_id,
          dependency_type,
          created_at
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        input.blocked_node_id,
        input.blocking_node_id,
        input.dependency_type ?? 'requires',
        input.created_at ?? createUtcTimestamp(),
      ],
      'node_dependencies',
    );
  },

  getNodeById(id) {
    return database.select('SELECT * FROM nodes WHERE id = ?', [id]).then((rows) => rows[0] ?? null);
  },

  getNodeActionById(id) {
    return database.select('SELECT * FROM node_actions WHERE id = ?', [id]).then((rows) => rows[0] ?? null);
  },

  async updateNode(id, patch) {
    const current = await this.getNodeById(id);

    if (!current) {
      return null;
    }

    const next = {
      ...normalizeNodeArchiveState(current, patch),
      updated_at: patch.updated_at ?? createUtcTimestamp(),
    };

    return updateAndFetchById(
      database,
      `
        UPDATE nodes
        SET
          type = ?,
          status = ?,
          title = ?,
          slug = ?,
          summary = ?,
          importance = ?,
          target_date = ?,
          last_touched_at = ?,
          is_archived = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [
        next.type,
        next.status,
        next.title,
        next.slug,
        next.summary,
        next.importance,
        next.target_date,
        next.last_touched_at,
        next.is_archived,
        next.updated_at,
        id,
      ],
      'nodes',
      id,
    );
  },

  async archiveNode(id, patch = {}) {
    return this.updateNode(id, {
      ...patch,
      status: 'archived',
      is_archived: 1,
      last_touched_at: patch.last_touched_at ?? createUtcTimestamp(),
    });
  },

  async duplicateNode(id, patch = {}) {
    const current = await this.getNodeById(id);

    if (!current) {
      return null;
    }

    const createdAt = patch.created_at ?? createUtcTimestamp();
    const nextSkillId = patch.skill_id ?? current.skill_id;
    const nextSlug = patch.slug ?? (await findAvailableDuplicateSlug(database, nextSkillId, current.slug));

    return this.createNode({
      skill_id: nextSkillId,
      type: current.type,
      status: current.status === 'archived' ? 'active' : current.status,
      title: patch.title ?? `${current.title} (copy)`,
      slug: nextSlug,
      summary: patch.summary ?? current.summary,
      importance: current.importance,
      target_date: current.target_date,
      last_touched_at: null,
      is_archived: 0,
      created_at: createdAt,
      updated_at: patch.updated_at ?? createdAt,
    });
  },

  async updateNodeAction(id, patch) {
    const current = await this.getNodeActionById(id);

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
        UPDATE node_actions
        SET status = ?, completed_at = ?, updated_at = ?
        WHERE id = ?
      `,
      [next.status, next.completed_at, next.updated_at, id],
      'node_actions',
      id,
    );
  },
});
