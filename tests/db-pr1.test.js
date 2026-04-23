import test from 'node:test';
import assert from 'node:assert/strict';

import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { ensureLegacySchema } from '../src/database/legacy-schema.js';
import {
  REQUIRED_PR1_TABLES,
  verifyPr1Schema,
} from '../src/database/pr1-migrations.js';
import { createDailySessionStore } from '../src/stores/daily-session-store.js';
import { createHierarchyStore } from '../src/stores/hierarchy-store.js';
import { createLegacyCardStore } from '../src/stores/legacy-card-store.js';
import { createLegacyMappingStore } from '../src/stores/legacy-mapping-store.js';
import { createNodeNoteStore } from '../src/stores/node-note-store.js';
import { createReviewStateStore } from '../src/stores/review-state-store.js';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const setupBootstrappedDatabase = async () => {
  const database = createSqliteTestDatabase();
  await bootstrapDatabase(database);
  return database;
};

test('bootstrap is idempotent and ensures all PR1 tables', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  await bootstrapDatabase(database);
  await bootstrapDatabase(database);

  const subjects = await database.select('SELECT * FROM subjects');
  assert.equal(subjects.length, 1);
  assert.equal(subjects[0].name, 'English');

  for (const tableName of REQUIRED_PR1_TABLES) {
    const rows = await database.select(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      [tableName],
    );
    assert.equal(rows.length, 1, `expected table ${tableName} to exist`);
  }

  const criticalIndexRows = await database.select(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name IN (?, ?, ?, ?, ?)",
    [
      'idx_node_dependencies_blocked',
      'idx_daily_session_events_session_id',
      'idx_legacy_card_mappings_node_id',
      'idx_node_barrier_notes_node_id',
      'idx_node_error_notes_node_id',
    ],
  );
  assert.equal(criticalIndexRows.length, 5);
});

test('node note store persists barrier and error notes against PR1 bootstrap schema', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);
  const nodeNoteStore = createNodeNoteStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Notes', slug: 'notes' });
  const direction = await hierarchyStore.createDirection({ sphere_id: sphere.id, name: 'Recovery', slug: 'recovery' });
  const skill = await hierarchyStore.createSkill({ direction_id: direction.id, name: 'Debugging', slug: 'debugging' });
  const node = await hierarchyStore.createNode({ skill_id: skill.id, type: 'task', title: 'Investigate issue', slug: 'investigate-issue' });
  const action = await hierarchyStore.createNodeAction({ node_id: node.id, title: 'Reproduce bug', status: 'ready' });

  await nodeNoteStore.createBarrierNote({
    node_id: node.id,
    action_id: action.id,
    barrier_type: 'too complex',
    note: 'Need a smaller reproduction path.',
  });
  await nodeNoteStore.createErrorNote({
    node_id: node.id,
    action_id: action.id,
    note_kind: 'shrink',
    note: 'Create a smaller failing step.',
  });

  const barrierNotes = await nodeNoteStore.listBarrierNotesForNode(node.id);
  const errorNotes = await nodeNoteStore.listErrorNotesForNode(node.id);

  assert.equal(barrierNotes.length, 1);
  assert.equal(barrierNotes[0].barrier_type, 'too complex');
  assert.equal(errorNotes.length, 1);
  assert.equal(errorNotes[0].note_kind, 'shrink');
});

test('legacy rows are preserved across PR1 bootstrap migration', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());
  await ensureLegacySchema(database);

  const subjectInsert = await database.execute('INSERT INTO subjects (name, icon) VALUES (?, ?)', ['Physics', 'P']);
  await database.execute(
    `
      INSERT INTO cards (
        subject_id,
        word,
        transcription,
        translation,
        definition,
        example,
        category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [subjectInsert.lastInsertId, 'quark', 'kwark', 'кварк', 'particle', 'Quarks form hadrons.', 'science'],
  );

  await bootstrapDatabase(database);

  const subjects = await database.select('SELECT * FROM subjects');
  const cards = await database.select('SELECT * FROM cards WHERE subject_id = ? ORDER BY id DESC', [subjectInsert.lastInsertId]);

  assert.deepEqual(subjects, [{ id: 1, name: 'Physics', icon: 'P' }]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].word, 'quark');
  assert.equal(cards[0].subject_id, 1);
});

test('hierarchy store can create the PR1 ownership chain', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Career', slug: 'career' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Engineering',
    slug: 'engineering',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'JavaScript',
    slug: 'javascript',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'project',
    title: 'Persistence foundation',
    slug: 'persistence-foundation',
    importance: 'high',
  });
  const action = await hierarchyStore.createNodeAction({
    node_id: node.id,
    title: 'Ship migrations',
    status: 'ready',
  });

  assert.equal(direction.sphere_id, sphere.id);
  assert.equal(skill.direction_id, direction.id);
  assert.equal(node.skill_id, skill.id);
  assert.equal(action.node_id, node.id);
});

test('hierarchy store persists full node editor updates', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Career', slug: 'career-editor' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Writing',
    slug: 'writing-editor',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'Product Strategy',
    slug: 'product-strategy-editor',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Draft why-now copy',
    slug: 'draft-why-now-copy',
    summary: 'Initial framing',
    importance: 'medium',
  });

  const updated = await hierarchyStore.updateNode(node.id, {
    type: 'project',
    status: 'paused',
    title: 'Ship why-now pass',
    slug: 'ship-why-now-pass',
    summary: 'Sharper framing for the first pass.',
    importance: 'high',
    target_date: '2026-05-01',
    last_touched_at: '2026-04-23T10:00:00.000Z',
    is_archived: 0,
  });

  assert.equal(updated.type, 'project');
  assert.equal(updated.status, 'paused');
  assert.equal(updated.title, 'Ship why-now pass');
  assert.equal(updated.slug, 'ship-why-now-pass');
  assert.equal(updated.summary, 'Sharper framing for the first pass.');
  assert.equal(updated.importance, 'high');
  assert.equal(updated.target_date, '2026-05-01');
  assert.equal(updated.last_touched_at, '2026-04-23T10:00:00.000Z');
  assert.equal(updated.is_archived, 0);
});

test('hierarchy store can archive and duplicate nodes without mutating the source', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Ops', slug: 'ops-editor' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Delivery',
    slug: 'delivery-editor',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'Execution',
    slug: 'execution-editor',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Capture clear why-now language',
    slug: 'capture-clear-why-now-language',
    summary: 'First clean articulation.',
    importance: 'high',
  });
  await hierarchyStore.createNodeAction({
    node_id: node.id,
    title: 'Write first pass',
    status: 'ready',
  });

  const archived = await hierarchyStore.archiveNode(node.id);
  const duplicate = await hierarchyStore.duplicateNode(node.id);
  const duplicateActions = await database.select('SELECT * FROM node_actions WHERE node_id = ?', [duplicate.id]);
  const persistedSource = await hierarchyStore.getNodeById(node.id);

  assert.equal(archived.status, 'archived');
  assert.equal(archived.is_archived, 1);
  assert.equal(persistedSource.id, node.id);
  assert.equal(persistedSource.status, 'archived');
  assert.equal(duplicate.id !== node.id, true);
  assert.equal(duplicate.title, 'Capture clear why-now language (copy)');
  assert.equal(duplicate.slug, 'capture-clear-why-now-language-copy');
  assert.equal(duplicate.summary, 'First clean articulation.');
  assert.equal(duplicate.importance, 'high');
  assert.equal(duplicate.status, 'active');
  assert.equal(duplicate.is_archived, 0);
  assert.equal(duplicate.last_touched_at, null);
  assert.equal(duplicateActions.length, 0);

  const secondDuplicate = await hierarchyStore.duplicateNode(node.id);
  assert.equal(secondDuplicate.slug, 'capture-clear-why-now-language-copy-2');
});

test('hierarchy store keeps status and is_archived consistent during generic updates', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Archive', slug: 'archive-invariant' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'State',
    slug: 'state-invariant',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'Consistency',
    slug: 'consistency-invariant',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Keep archive invariant',
    slug: 'keep-archive-invariant',
  });

  const archived = await hierarchyStore.updateNode(node.id, {
    status: 'archived',
    is_archived: 0,
  });
  assert.equal(archived.status, 'archived');
  assert.equal(archived.is_archived, 1);

  const restored = await hierarchyStore.updateNode(node.id, {
    is_archived: 0,
  });
  assert.equal(restored.status, 'active');
  assert.equal(restored.is_archived, 0);
});

test('hierarchy store rejects self dependencies', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Health', slug: 'health' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Strength',
    slug: 'strength',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'Programming posture',
    slug: 'programming-posture',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    title: 'Fix desk setup',
    slug: 'fix-desk-setup',
  });

  await assert.rejects(
    () =>
      hierarchyStore.addNodeDependency({
        blocked_node_id: node.id,
        blocking_node_id: node.id,
      }),
    /CHECK constraint failed/,
  );
});

test('daily session store rejects events without node or action linkage', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const dailySessionStore = createDailySessionStore(database);

  const session = await dailySessionStore.createSession({
    session_date: '2026-04-19',
    status: 'planned',
  });

  await assert.rejects(
    () =>
      dailySessionStore.addSessionEvent({
        session_id: session.id,
        event_type: 'selected',
      }),
    /CHECK constraint failed/,
  );
});

test('legacy card store remains compatible after modular bootstrap', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const legacyCardStore = createLegacyCardStore(database);

  const subjectInsert = await legacyCardStore.addSubject('Spanish', 'ES');
  await legacyCardStore.addCard({
    subject_id: subjectInsert.lastInsertId,
    word: 'hola',
    transcription: 'ola',
    translation: 'привет',
    definition: 'greeting',
    example: 'Hola, amigo.',
    category: 'greetings',
  });

  let cards = await legacyCardStore.getCards(subjectInsert.lastInsertId);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].word, 'hola');

  await legacyCardStore.updateCard(cards[0].id, {
    ...cards[0],
    translation: 'здравствуйте',
    category: 'basics',
  });

  cards = await legacyCardStore.getCards(subjectInsert.lastInsertId);
  assert.equal(cards[0].translation, 'здравствуйте');
  assert.equal(cards[0].category, 'basics');

  await legacyCardStore.deleteCard(cards[0].id);
  cards = await legacyCardStore.getCards(subjectInsert.lastInsertId);
  assert.equal(cards.length, 0);
});

test('legacy delete flows stay compatible when mapping rows exist', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);
  const legacyCardStore = createLegacyCardStore(database);
  const legacyMappingStore = createLegacyMappingStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Learning', slug: 'learning' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Languages',
    slug: 'languages',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'English',
    slug: 'english',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'theory',
    title: 'Vocabulary',
    slug: 'vocabulary',
  });

  const subjectInsert = await legacyCardStore.addSubject('French', 'FR');
  const cardInsert = await legacyCardStore.addCard({
    subject_id: subjectInsert.lastInsertId,
    word: 'bonjour',
    translation: 'hello',
  });

  await legacyMappingStore.createSubjectMapping({
    legacy_subject_id: subjectInsert.lastInsertId,
    sphere_id: sphere.id,
    direction_id: direction.id,
    skill_id: skill.id,
  });
  await legacyMappingStore.createCardMapping({
    legacy_card_id: cardInsert.lastInsertId,
    node_id: node.id,
  });

  await legacyCardStore.deleteCard(cardInsert.lastInsertId);
  await legacyCardStore.deleteSubject(subjectInsert.lastInsertId);

  const subjectMappings = await database.select(
    'SELECT * FROM legacy_subject_mappings WHERE legacy_subject_id = ?',
    [subjectInsert.lastInsertId],
  );
  const cardMappings = await database.select(
    'SELECT * FROM legacy_card_mappings WHERE legacy_card_id = ?',
    [cardInsert.lastInsertId],
  );

  assert.equal(cardMappings.length, 0);
  assert.equal(subjectMappings.length, 0);
});

test('review state updates preserve omitted scheduling fields', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());
  const hierarchyStore = createHierarchyStore(database);
  const reviewStateStore = createReviewStateStore(database);

  const sphere = await hierarchyStore.createSphere({ name: 'Career', slug: 'career-review' });
  const direction = await hierarchyStore.createDirection({
    sphere_id: sphere.id,
    name: 'Engineering',
    slug: 'engineering-review',
  });
  const skill = await hierarchyStore.createSkill({
    direction_id: direction.id,
    name: 'JavaScript',
    slug: 'javascript-review',
  });
  const node = await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'theory',
    title: 'Closures',
    slug: 'closures',
  });

  await reviewStateStore.save({
    node_id: node.id,
    review_profile: 'learning',
    next_due_at: '2026-04-20T10:00:00.000Z',
    last_reviewed_at: '2026-04-19T10:00:00.000Z',
    current_risk: 'high',
  });

  const updated = await reviewStateStore.save({
    node_id: node.id,
    current_risk: 'medium',
  });

  assert.equal(updated.next_due_at, '2026-04-20T10:00:00.000Z');
  assert.equal(updated.last_reviewed_at, '2026-04-19T10:00:00.000Z');
  assert.equal(updated.current_risk, 'medium');
});

test('bootstrap rejects malformed pre-existing PR1 schema', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  await database.execute(`
    CREATE TABLE review_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL UNIQUE,
      updated_at TEXT NOT NULL
    )
  `);

  await assert.rejects(
    () => bootstrapDatabase(database),
    /missing column "review_profile"/,
  );
});

test('bootstrap rejects pre-existing PR1 tables that miss critical constraints', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  await ensureLegacySchema(database);
  await database.execute(`
    CREATE TABLE review_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL UNIQUE,
      review_profile TEXT NOT NULL DEFAULT 'learning',
      next_due_at TEXT,
      last_reviewed_at TEXT,
      current_risk TEXT,
      updated_at TEXT NOT NULL
    )
  `);

  await assert.rejects(
    () => bootstrapDatabase(database),
    /missing required constraint fragment/i,
  );
});

test('bootstrap rejects pre-existing PR1 tables that miss ownership foreign keys', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  await ensureLegacySchema(database);
  await database.execute(`
    CREATE TABLE spheres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await database.execute(`
    CREATE TABLE directions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sphere_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (sphere_id, slug)
    )
  `);

  await assert.rejects(
    () => bootstrapDatabase(database),
    /missing a foreign key for "sphere_id"/i,
  );
});

test('sqlite test adapter matches the execute/select contract used by stores', async (t) => {
  const database = createSqliteTestDatabase();
  t.after(() => database.close());

  const ddlResult = await database.execute(`
    CREATE TABLE adapter_contract (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);
  assert.equal(ddlResult.rowsAffected, 0);
  assert.equal(ddlResult.lastInsertId, undefined);

  await database.execute('PRAGMA foreign_keys = ON');
  const pragmaRows = await database.select('PRAGMA foreign_keys');
  assert.equal(pragmaRows[0].foreign_keys, 1);

  const insertResult = await database.execute(
    'INSERT INTO adapter_contract (name) VALUES (?)',
    ['parity'],
  );
  assert.equal(insertResult.rowsAffected, 1);
  assert.equal(insertResult.lastInsertId, 1);

  const rows = await database.select(
    'SELECT * FROM adapter_contract WHERE id = ?',
    [insertResult.lastInsertId],
  );
  assert.deepEqual(rows, [{ id: 1, name: 'parity' }]);

  rows[0].name = 'mutated';
  const freshRows = await database.select(
    'SELECT * FROM adapter_contract WHERE id = ?',
    [insertResult.lastInsertId],
  );
  assert.equal(freshRows[0].name, 'parity');
});

test('verifyPr1Schema accepts the fully bootstrapped schema contract', async (t) => {
  const database = await setupBootstrappedDatabase();
  t.after(() => database.close());

  await assert.doesNotReject(() => verifyPr1Schema(database));
});
