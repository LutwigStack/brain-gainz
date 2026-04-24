import { createUtcTimestamp, insertAndFetch, updateAndFetchById } from './store-helpers.js';

const buildDuplicateSlugCandidate = (baseSlug, attempt) => {
  if (attempt === 0) {
    return `${baseSlug}-copy`;
  }

  return `${baseSlug}-copy-${attempt + 1}`;
};

const isNodeSlugConflict = (error) =>
  /UNIQUE constraint failed:\s*nodes\.skill_id,\s*nodes\.slug/i.test(error?.message ?? '');

const isAssociativeDependencyType = (dependencyType) => dependencyType === 'relates_to';

const normalizeNodeDependencyInput = (input) => {
  const dependencyType = input.dependency_type ?? 'requires';

  if (
    !isAssociativeDependencyType(dependencyType) ||
    input.blocked_node_id <= input.blocking_node_id
  ) {
    return {
      ...input,
      dependency_type: dependencyType,
    };
  }

  return {
    ...input,
    blocked_node_id: input.blocking_node_id,
    blocking_node_id: input.blocked_node_id,
    dependency_type: dependencyType,
  };
};

const findAssociativeNodeDependency = async (
  database,
  input,
  options = {},
) => {
  const rows = await database.select(
    `
      SELECT *
      FROM node_dependencies
      WHERE dependency_type = 'relates_to'
        AND (
          (blocked_node_id = ? AND blocking_node_id = ?)
          OR
          (blocked_node_id = ? AND blocking_node_id = ?)
        )
        AND (? IS NULL OR id != ?)
      LIMIT 1
    `,
    [
      input.blocked_node_id,
      input.blocking_node_id,
      input.blocking_node_id,
      input.blocked_node_id,
      options.excludeId ?? null,
      options.excludeId ?? null,
    ],
  );

  return rows[0] ?? null;
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
          completion_criteria,
          links,
          reward,
          x,
          y,
          importance,
          target_date,
          last_touched_at,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.skill_id,
        input.type,
        input.status ?? 'active',
        input.title,
        input.slug,
        input.summary ?? null,
        input.completion_criteria ?? null,
        input.links ?? null,
        input.reward ?? null,
        input.x ?? null,
        input.y ?? null,
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

  async addNodeDependency(input) {
    const next = normalizeNodeDependencyInput(input);

    if (isAssociativeDependencyType(next.dependency_type)) {
      const existing = await findAssociativeNodeDependency(database, next);

      if (existing) {
        return existing;
      }
    }

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
        next.blocked_node_id,
        next.blocking_node_id,
        next.dependency_type,
        next.created_at ?? createUtcTimestamp(),
      ],
      'node_dependencies',
    );
  },

  getNodeDependencyById(id) {
    return database.select('SELECT * FROM node_dependencies WHERE id = ?', [id]).then((rows) => rows[0] ?? null);
  },

  async updateNodeDependency(id, patch) {
    const current = await this.getNodeDependencyById(id);

    if (!current) {
      return null;
    }

    const next = normalizeNodeDependencyInput({
      ...current,
      ...patch,
    });

    if (isAssociativeDependencyType(next.dependency_type)) {
      const existing = await findAssociativeNodeDependency(database, next, { excludeId: id });

      if (existing) {
        throw new Error('Associative relation already exists between these nodes.');
      }
    }

    return updateAndFetchById(
      database,
      `
        UPDATE node_dependencies
        SET blocked_node_id = ?, blocking_node_id = ?, dependency_type = ?
        WHERE id = ?
      `,
      [next.blocked_node_id, next.blocking_node_id, next.dependency_type, id],
      'node_dependencies',
      id,
    );
  },

  async deleteNodeDependency(id) {
    const current = await this.getNodeDependencyById(id);

    if (!current) {
      return null;
    }

    await database.execute('DELETE FROM node_dependencies WHERE id = ?', [id]);
    return current;
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
          completion_criteria = ?,
          links = ?,
          reward = ?,
          x = ?,
          y = ?,
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
        next.completion_criteria,
        next.links,
        next.reward,
        next.x,
        next.y,
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

  async updateNodePositionsBatch(positions) {
    const entries = (positions ?? []).filter(
      (entry) =>
        entry &&
        Number.isInteger(entry.nodeId) &&
        Number.isFinite(entry.x) &&
        Number.isFinite(entry.y),
    );

    if (entries.length === 0) {
      return [];
    }

    const nodeIds = [...new Set(entries.map((entry) => entry.nodeId))];
    const placeholders = nodeIds.map(() => '?').join(', ');
    const currentRows = await database.select(
      `SELECT * FROM nodes WHERE id IN (${placeholders})`,
      nodeIds,
    );

    if (currentRows.length !== nodeIds.length) {
      throw new Error('Cannot apply layout: one or more target nodes are missing.');
    }

    const currentById = new Map(currentRows.map((row) => [row.id, row]));
    const updatedAt = createUtcTimestamp();

    await database.execute('BEGIN');

    try {
      for (const entry of entries) {
        const current = currentById.get(entry.nodeId);

        if (!current) {
          throw new Error(`Cannot apply layout: node ${entry.nodeId} is missing.`);
        }

        const result = await database.execute(
          `
            UPDATE nodes
            SET x = ?, y = ?, updated_at = ?
            WHERE id = ?
          `,
          [entry.x, entry.y, updatedAt, entry.nodeId],
        );

        if (result.rowsAffected !== 1) {
          throw new Error(`Cannot apply layout: failed to update node ${entry.nodeId}.`);
        }
      }

      await database.execute('COMMIT');
    } catch (error) {
      await database.execute('ROLLBACK');
      throw error;
    }

    return database.select(
      `SELECT * FROM nodes WHERE id IN (${placeholders})`,
      nodeIds,
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

    const buildDuplicatePayload = (slug) => ({
      skill_id: nextSkillId,
      type: current.type,
      status: current.status === 'archived' ? 'active' : current.status,
      title: patch.title ?? `${current.title} (copy)`,
      slug,
      summary: patch.summary ?? current.summary,
      completion_criteria: patch.completion_criteria ?? current.completion_criteria,
      links: patch.links ?? current.links,
      reward: patch.reward ?? current.reward,
      x: patch.x ?? current.x,
      y: patch.y ?? current.y,
      importance: current.importance,
      target_date: current.target_date,
      last_touched_at: null,
      is_archived: 0,
      created_at: createdAt,
      updated_at: patch.updated_at ?? createdAt,
    });

    if (patch.slug) {
      return this.createNode(buildDuplicatePayload(patch.slug));
    }

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const nextSlug = buildDuplicateSlugCandidate(current.slug, attempt);

      try {
        return await this.createNode(buildDuplicatePayload(nextSlug));
      } catch (error) {
        if (!isNodeSlugConflict(error)) {
          throw error;
        }
      }
    }

    throw new Error(`Unable to allocate duplicate slug for "${current.slug}"`);
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
