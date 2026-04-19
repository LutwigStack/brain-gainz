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
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name IN (?, ?, ?)",
    [
      'idx_node_dependencies_blocked',
      'idx_daily_session_events_session_id',
      'idx_legacy_card_mappings_node_id',
    ],
  );
  assert.equal(criticalIndexRows.length, 3);
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
