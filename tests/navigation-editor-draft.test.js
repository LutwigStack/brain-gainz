import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNodeEditorDuplicatePayload,
  buildNodeEditorUpdatePayload,
  canDuplicateNodeEditorDraft,
  createNodeEditorDraft,
  hasNodeEditorPersistedChanges,
} from '../src/components/navigation-editor-draft.ts';

const focusSnapshot = {
  node: {
    id: 7,
    title: 'Linear Algebra',
    type: 'theory',
    status: 'doing',
    summary: 'Vector and matrix foundations.',
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

test('createNodeEditorDraft derives editor fields from node focus', () => {
  const draft = createNodeEditorDraft(focusSnapshot);

  assert.equal(draft.nodeId, 7);
  assert.equal(draft.theme, 'Mathematics / Base / Matrices');
  assert.equal(draft.status, 'active');
  assert.equal(draft.nextStep, 'Complete lesson: matrices and their properties');
  assert.match(draft.completionCriteria, /Solve 15 matrix problems/);
  assert.match(draft.links, /Unlocks: Eigenvalues/);
  assert.match(draft.links, /Depends on: Algebra Fundamentals/);
});

test('persisted change detection stays quiet for untouched derived drafts', () => {
  const draft = createNodeEditorDraft(focusSnapshot);

  assert.equal(hasNodeEditorPersistedChanges(focusSnapshot, draft), false);
});

test('buildNodeEditorUpdatePayload keeps only persisted fields', () => {
  const draft = {
    ...createNodeEditorDraft(focusSnapshot),
    title: 'Linear Algebra Core',
    summary: '  Refined matrix summary.  ',
    status: 'paused',
    completionCriteria: 'Manual note that should not persist',
    reward: 'Another manual note',
  };

  assert.equal(hasNodeEditorPersistedChanges(focusSnapshot, draft), true);
  assert.deepEqual(buildNodeEditorUpdatePayload(focusSnapshot, draft), {
    title: 'Linear Algebra Core',
    summary: 'Refined matrix summary.',
    type: 'theory',
    status: 'paused',
  });
});

test('buildNodeEditorDuplicatePayload uses the current editor title and summary', () => {
  const draft = {
    ...createNodeEditorDraft(focusSnapshot),
    title: '  Linear Algebra Core  ',
    summary: '  Refined matrix summary.  ',
  };

  assert.deepEqual(buildNodeEditorDuplicatePayload(draft), {
    title: 'Linear Algebra Core (copy)',
    summary: 'Refined matrix summary.',
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
