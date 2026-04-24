import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNodeEditorDuplicatePayload,
  buildNodeEditorUpdatePayload,
  canDuplicateNodeEditorDraft,
  createNodeEditorDraft,
  getNodeEditorCompletionCriteriaPreview,
  getNodeEditorLinksPreview,
  getNodeEditorRewardPreview,
  hasNodeEditorPersistedChanges,
} from '../src/components/navigation-editor-draft.ts';

const focusSnapshot = {
  node: {
    id: 7,
    title: 'Linear Algebra',
    type: 'theory',
    status: 'doing',
    summary: 'Vector and matrix foundations.',
    completion_criteria: null,
    links: null,
    reward: null,
    sphere_id: 1,
    sphere_name: 'Mathematics',
    direction_id: 2,
    direction_name: 'Base',
    skill_id: 3,
    skill_name: 'Matrices',
  },
  selectedAction: {
    id: 70,
    node_id: 7,
    title: 'Complete lesson: matrices and their properties',
    details: 'Write down the core rules.',
    status: 'doing',
  },
  actions: [
    {
      id: 70,
      node_id: 7,
      title: 'Complete lesson: matrices and their properties',
      details: 'Write down the core rules.',
      status: 'doing',
    },
    {
      id: 71,
      node_id: 7,
      title: 'Solve 15 matrix problems',
      details: null,
      status: 'todo',
    },
  ],
  dependencies: [{ id: 1, title: 'Algebra Fundamentals', status: 'done' }],
  dependents: [{ id: 2, title: 'Eigenvalues', status: 'ready' }],
  reviewState: { current_risk: 'medium', next_due_at: '2026-04-24' },
  session: null,
  progress: {
    totalActions: 2,
    completedActions: 0,
    openActions: 2,
    completionPercent: 0,
    isCurrentSessionNode: false,
  },
  barrierNotes: [],
  errorNotes: [],
};

test('createNodeEditorDraft keeps persisted fields separate from derived previews', () => {
  const draft = createNodeEditorDraft(focusSnapshot);

  assert.equal(draft.nodeId, 7);
  assert.equal(draft.theme, 'Mathematics / Base / Matrices');
  assert.equal(draft.status, 'active');
  assert.equal(draft.nextStep, 'Complete lesson: matrices and their properties');
  assert.equal(draft.completionCriteria, '');
  assert.equal(draft.links, '');
  assert.equal(draft.reward, '');
  assert.match(getNodeEditorCompletionCriteriaPreview(focusSnapshot, draft), /Solve 15 matrix problems/);
  assert.match(getNodeEditorLinksPreview(focusSnapshot, draft), /Unlocks: Eigenvalues/);
  assert.match(getNodeEditorLinksPreview(focusSnapshot, draft), /Depends on: Algebra Fundamentals/);
  assert.match(getNodeEditorRewardPreview(focusSnapshot, draft), /Unlocks next: Eigenvalues/);
});

test('createNodeEditorDraft prefers persisted authored fields when they exist', () => {
  const authoredFocus = {
    ...focusSnapshot,
    node: {
      ...focusSnapshot.node,
      completion_criteria: 'Finish when the theorem summary and problem set are complete.',
      links: 'Depends on: matrix basics\nUnlocks: spectral theorem',
      reward: 'Unlocks advanced linear algebra.',
    },
  };
  const draft = createNodeEditorDraft(authoredFocus);

  assert.equal(draft.completionCriteria, 'Finish when the theorem summary and problem set are complete.');
  assert.equal(draft.links, 'Depends on: matrix basics\nUnlocks: spectral theorem');
  assert.equal(draft.reward, 'Unlocks advanced linear algebra.');
  assert.equal(getNodeEditorCompletionCriteriaPreview(authoredFocus, draft), draft.completionCriteria);
  assert.equal(getNodeEditorLinksPreview(authoredFocus, draft), draft.links);
  assert.equal(getNodeEditorRewardPreview(authoredFocus, draft), draft.reward);
});

test('persisted change detection stays quiet for untouched drafts', () => {
  const draft = createNodeEditorDraft(focusSnapshot);

  assert.equal(hasNodeEditorPersistedChanges(focusSnapshot, draft), false);
});

test('buildNodeEditorUpdatePayload keeps and writes expanded persisted fields', () => {
  const draft = {
    ...createNodeEditorDraft(focusSnapshot),
    title: 'Linear Algebra Core',
    summary: '  Refined matrix summary.  ',
    status: 'paused',
    completionCriteria: 'Manual completion criteria',
    links: 'Depends on: Algebra Fundamentals',
    reward: 'Another manual note',
  };

  assert.equal(hasNodeEditorPersistedChanges(focusSnapshot, draft), true);
  assert.deepEqual(buildNodeEditorUpdatePayload(focusSnapshot, draft), {
    title: 'Linear Algebra Core',
    summary: 'Refined matrix summary.',
    completion_criteria: 'Manual completion criteria',
    links: 'Depends on: Algebra Fundamentals',
    reward: 'Another manual note',
    type: 'theory',
    status: 'paused',
  });
});

test('buildNodeEditorUpdatePayload does not persist derived fallback values by default', () => {
  const draft = {
    ...createNodeEditorDraft(focusSnapshot),
    title: 'Linear Algebra Core',
    summary: '  Refined matrix summary.  ',
    status: 'paused',
  };

  assert.deepEqual(buildNodeEditorUpdatePayload(focusSnapshot, draft), {
    title: 'Linear Algebra Core',
    summary: 'Refined matrix summary.',
    completion_criteria: null,
    links: null,
    reward: null,
    type: 'theory',
    status: 'paused',
  });
});

test('buildNodeEditorDuplicatePayload uses the current authored fields', () => {
  const draft = {
    ...createNodeEditorDraft(focusSnapshot),
    title: '  Linear Algebra Core  ',
    summary: '  Refined matrix summary.  ',
    completionCriteria: '  Finish the theorem summary and all open problems.  ',
    links: '  Depends on: Algebra Fundamentals\nUnlocks: Eigenvalues  ',
    reward: '  Unlocks the next theory block.  ',
  };

  assert.deepEqual(buildNodeEditorDuplicatePayload(draft), {
    title: 'Linear Algebra Core (copy)',
    summary: 'Refined matrix summary.',
    completion_criteria: 'Finish the theorem summary and all open problems.',
    links: 'Depends on: Algebra Fundamentals\nUnlocks: Eigenvalues',
    reward: 'Unlocks the next theory block.',
  });
});

test('duplicate guard blocks unsupported unsaved type and status changes', () => {
  const draft = {
    ...createNodeEditorDraft(focusSnapshot),
    type: 'project',
    status: 'paused',
  };

  assert.equal(canDuplicateNodeEditorDraft(focusSnapshot, createNodeEditorDraft(focusSnapshot)), true);
  assert.equal(canDuplicateNodeEditorDraft(focusSnapshot, draft), false);
});
