import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNodeEditorDuplicatePayload,
  buildNodeEditorUpdatePayload,
  canDuplicateNodeEditorDraft,
  createNodeEditorDraft,
  emptyCheckMetadataDraft,
  getCheckMetadataCriterionHint,
  getCheckMetadataCriterionLabel,
  getCheckMetadataPreview,
  getCheckMetadataValidationMessage,
  getNodeEditorCompletionCriteriaPreview,
  getNodeEditorLinksPreview,
  getNodeEditorRewardPreview,
  hasNodeEditorPersistedChanges,
  parseCheckMetadataDraft,
  serializeCheckMetadataDraft,
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
    check_metadata: null,
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
    checkMetadata: {
      ...emptyCheckMetadataDraft('action:70'),
      kind: 'exact',
      prompt: 'Type the term',
      expectedAnswer: 'linear map',
    },
  };

  assert.equal(hasNodeEditorPersistedChanges(focusSnapshot, draft), true);
  assert.deepEqual(buildNodeEditorUpdatePayload(focusSnapshot, draft), {
    title: 'Linear Algebra Core',
    summary: 'Refined matrix summary.',
    completion_criteria: 'Manual completion criteria',
    links: 'Depends on: Algebra Fundamentals',
    reward: 'Another manual note',
    check_metadata: JSON.stringify({
      tasks: {
        'action:70': {
          strict_check_type: 'exact',
          prompt: 'Type the term',
          expected_answer: 'linear map',
        },
      },
    }),
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
    check_metadata: null,
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
    checkMetadata: {
      ...emptyCheckMetadataDraft('action:70'),
      kind: 'llm_assisted',
      prompt: 'Explain the result',
      rubric: 'Must mention basis and dimension.',
    },
  };

  assert.deepEqual(buildNodeEditorDuplicatePayload(draft), {
    title: 'Linear Algebra Core (copy)',
    summary: 'Refined matrix summary.',
    completion_criteria: 'Finish the theorem summary and all open problems.',
    links: 'Depends on: Algebra Fundamentals\nUnlocks: Eigenvalues',
    reward: 'Unlocks the next theory block.',
    check_metadata: JSON.stringify({
      tasks: {
        'action:70': {
          check_method: 'llm_assisted',
          prompt: 'Explain the result',
          rubric: 'Must mention basis and dimension.',
        },
      },
    }),
  });
});

test('check metadata draft parses and serializes supported check types', () => {
  const exact = parseCheckMetadataDraft(
    JSON.stringify({
      tasks: {
        'action:70': {
          strict_check_type: 'exact',
          prompt: 'Term?',
          expected_answer: 'linear map',
          case_sensitive: true,
        },
      },
    }),
    'action:70',
  );
  assert.equal(exact.kind, 'exact');
  assert.equal(exact.expectedAnswer, 'linear map');
  assert.equal(exact.caseSensitive, true);

  const multiTaskExact = parseCheckMetadataDraft(
    JSON.stringify({
      tasks: {
        'action:70': {
          strict_check_type: 'exact',
          prompt: 'Term?',
          expected_answer: 'linear map',
        },
        sibling: {
          strict_check_type: 'contains',
          required_terms: ['basis'],
        },
      },
    }),
    'action:70',
  );
  assert.deepEqual(JSON.parse(serializeCheckMetadataDraft({ ...multiTaskExact, expectedAnswer: 'basis' })), {
    tasks: {
      'action:70': {
        strict_check_type: 'exact',
        prompt: 'Term?',
        expected_answer: 'basis',
      },
      sibling: {
        strict_check_type: 'contains',
        required_terms: ['basis'],
      },
    },
  });

  const assessmentContainerExact = parseCheckMetadataDraft(
    JSON.stringify({
      version: 1,
      assessments: {
        'action:70': {
          strict_check_type: 'exact',
          prompt: 'Term?',
          expected_answer: 'linear map',
        },
        sibling: {
          strict_check_type: 'contains',
          required_terms: ['basis'],
        },
      },
    }),
    'action:70',
  );
  assert.deepEqual(JSON.parse(serializeCheckMetadataDraft({ ...assessmentContainerExact, expectedAnswer: 'basis' })), {
    version: 1,
    assessments: {
      'action:70': {
        strict_check_type: 'exact',
        prompt: 'Term?',
        expected_answer: 'basis',
      },
      sibling: {
        strict_check_type: 'contains',
        required_terms: ['basis'],
      },
    },
  });

  assert.equal(
    serializeCheckMetadataDraft({
      ...emptyCheckMetadataDraft('node:7:exact'),
      kind: 'exact',
      prompt: 'Type the answer',
      expectedAnswer: '',
    }),
    null,
  );
  assert.match(
    getCheckMetadataValidationMessage({
      ...emptyCheckMetadataDraft('node:7:exact'),
      kind: 'exact',
    }),
    /ожидаемый точный ответ/,
  );

  assert.equal(
    serializeCheckMetadataDraft({
      ...emptyCheckMetadataDraft('node:7:contains'),
      kind: 'contains',
      prompt: 'Use key terms',
      requiredTerms: '',
    }),
    null,
  );
  assert.match(
    getCheckMetadataValidationMessage({
      ...emptyCheckMetadataDraft('node:7:contains'),
      kind: 'contains',
    }),
    /обязательный термин/,
  );

  const blankNumber = {
    ...emptyCheckMetadataDraft('node:7:number'),
    kind: 'number',
    prompt: 'Enter the result',
    expectedNumber: '',
    tolerance: '',
  };
  assert.equal(serializeCheckMetadataDraft(blankNumber), null);

  const blankNumberWithSibling = parseCheckMetadataDraft(
    JSON.stringify({
      tasks: {
        'node:7:number': {
          strict_check_type: 'number',
          expected_number: 5,
        },
        sibling: {
          strict_check_type: 'exact',
          expected_answer: 'kept',
        },
      },
    }),
    'node:7:number',
  );
  assert.deepEqual(
    JSON.parse(serializeCheckMetadataDraft({ ...blankNumberWithSibling, expectedNumber: '' })),
    {
      tasks: {
        sibling: {
          strict_check_type: 'exact',
          expected_answer: 'kept',
        },
      },
    },
  );

  const validNumber = {
    ...blankNumber,
    expectedNumber: '12',
    tolerance: '',
  };
  assert.deepEqual(JSON.parse(serializeCheckMetadataDraft(validNumber)), {
    tasks: {
      'node:7:number': {
        strict_check_type: 'number',
        prompt: 'Enter the result',
        expected_number: 12,
      },
    },
  });

  const checklist = {
    ...emptyCheckMetadataDraft('node:7:assessment'),
    kind: 'checklist',
    prompt: 'Check proof',
    checklistItems: [
      { id: '', label: 'Definition written', required: true },
      { id: 'example', label: 'Example given', required: false },
    ],
  };
  assert.deepEqual(JSON.parse(serializeCheckMetadataDraft(checklist)), {
    tasks: {
      'node:7:assessment': {
        strict_check_type: 'checklist',
        prompt: 'Check proof',
        items: [
          { id: 'definition-written', label: 'Definition written', required: true },
          { id: 'example', label: 'Example given', required: false },
        ],
      },
    },
  });

  const emptyChecklist = {
    ...emptyCheckMetadataDraft('node:7:empty-checklist'),
    kind: 'checklist',
    prompt: 'Check proof',
    checklistItems: [],
  };
  assert.equal(serializeCheckMetadataDraft(emptyChecklist), null);
  assert.match(getCheckMetadataValidationMessage(emptyChecklist), /обязательный пункт/);
});

test('check metadata authoring copy keeps technical verifier terms out of primary labels', () => {
  const manualStrict = {
    ...emptyCheckMetadataDraft('node:7:manual'),
    kind: 'manual_strict',
    expectedSummary: 'External proof review passes',
  };
  const llmAssisted = {
    ...emptyCheckMetadataDraft('node:7:llm'),
    kind: 'llm_assisted',
    rubric: '',
  };

  assert.equal(getCheckMetadataCriterionLabel(manualStrict), 'Критерий внешней проверки');
  assert.doesNotMatch(getCheckMetadataCriterionHint(manualStrict), /verifier|verdict|evidence|raw ID/i);
  assert.equal(getCheckMetadataCriterionLabel(llmAssisted), 'Критерии для ИИ-проверки');
  assert.doesNotMatch(getCheckMetadataCriterionHint(llmAssisted), /verifier|verdict|evidence|raw ID/i);
  assert.equal(getCheckMetadataPreview(llmAssisted), 'ИИ-проверка: критерии не заданы');
});

test('invalid check metadata stays raw and is not lost', () => {
  const draft = parseCheckMetadataDraft('{not-json', 'action:70');
  assert.equal(draft.kind, 'raw');
  assert.equal(draft.invalidRaw, true);
  assert.equal(serializeCheckMetadataDraft(draft), '{not-json');
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
