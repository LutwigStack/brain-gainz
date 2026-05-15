import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAssessmentCheckTypeLabel,
  getAssessmentEvidenceHint,
  getAssessmentExpectedInputText,
  getAssessmentValidationState,
} from '../src/components/assessment-copy.ts';

test('assessment check type labels stay user-facing across supported states', () => {
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: 'exact', resolvedCheckMethod: 'strict' }),
    'Точный ответ',
  );
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: 'number', resolvedCheckMethod: 'strict' }),
    'Число',
  );
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: 'contains', resolvedCheckMethod: 'strict' }),
    'Текст с обязательными терминами',
  );
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: 'checklist', resolvedCheckMethod: 'strict' }),
    'Чек-лист',
  );
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: 'manual_strict', resolvedCheckMethod: 'strict' }),
    'Ручная строгая проверка',
  );
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: null, resolvedCheckMethod: 'llm_assisted' }),
    'ИИ-проверка',
  );
});

test('assessment expectation copy describes criteria without raw verifier terms', () => {
  assert.equal(
    getAssessmentExpectedInputText({
      isChecklistCheck: true,
      checklistItems: [
        { id: 'a', label: 'A', required: true },
        { id: 'b', label: 'B', required: false },
      ],
      strictCheckType: 'checklist',
      resolvedCheckMethod: 'strict',
    }),
    'Отметьте выполненные пункты: обязательно 1/2.',
  );

  const manualCopy = getAssessmentExpectedInputText({
    isChecklistCheck: false,
    checklistItems: [],
    strictCheckType: 'manual_strict',
    resolvedCheckMethod: 'strict',
  });

  assert.match(manualCopy, /результат внешней проверки/);
  assert.doesNotMatch(manualCopy, /verifier|verdict|evidence/i);
});

test('assessment validation state gives one actionable reason near the action', () => {
  assert.deepEqual(
    getAssessmentValidationState({
      pendingAssessment: false,
      pendingSelfMark: false,
      isEditorArchived: false,
      isAutoStrictCheck: true,
      isChecklistCheck: false,
      canSubmitAssessmentPass: false,
      checkTypeLabel: 'Точный ответ',
      hasAnswer: false,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'strict',
    }),
    {
      tone: 'accent',
      ready: false,
      message: 'Заполните ответ для проверки: точный ответ.',
    },
  );

  assert.equal(
    getAssessmentValidationState({
      pendingAssessment: false,
      isAutoStrictCheck: false,
      isChecklistCheck: false,
      canSubmitAssessmentPass: false,
      checkTypeLabel: 'ИИ-проверка',
      hasAnswer: true,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'llm_assisted',
    }).message,
    'Ответ заполнен как контекст. Для проверенного прогресса добавьте подтверждение проверки.',
  );

  assert.deepEqual(
    getAssessmentValidationState({
      pendingAssessment: false,
      isAutoStrictCheck: false,
      isChecklistCheck: false,
      canSubmitAssessmentPass: true,
      checkTypeLabel: 'ИИ-проверка',
      hasAnswer: true,
      hasVerifierEvidence: true,
      resolvedCheckMethod: 'llm_assisted',
    }),
    {
      tone: 'success',
      ready: true,
      message: 'Готово: есть подтверждение проверки, можно сохранить проверенный прогресс.',
    },
  );

  assert.equal(
    getAssessmentValidationState({
      pendingAssessment: false,
      pendingSelfMark: false,
      isEditorArchived: true,
      isAutoStrictCheck: false,
      isChecklistCheck: false,
      canSubmitAssessmentPass: true,
      checkTypeLabel: 'ИИ-проверка',
      hasAnswer: true,
      hasVerifierEvidence: true,
      resolvedCheckMethod: 'llm_assisted',
    }).ready,
    false,
  );
});

test('assessment evidence hint distinguishes visible confirmation from technical details', () => {
  assert.equal(
    getAssessmentEvidenceHint({ hasVisibleEvidence: true, hasTechnicalResultId: false }),
    'Подтверждение заполнено. Попытку можно засчитать.',
  );
  assert.equal(
    getAssessmentEvidenceHint({ hasVisibleEvidence: false, hasTechnicalResultId: true }),
    'Технические детали заполнены. Попытку можно засчитать; видимое подтверждение можно оставить пустым.',
  );
  assert.equal(
    getAssessmentEvidenceHint({ hasVisibleEvidence: false, hasTechnicalResultId: false }),
    'Для зачета добавьте подтверждение проверки. Технические детали можно оставить пустыми.',
  );
  assert.doesNotMatch(
    getAssessmentEvidenceHint({ hasVisibleEvidence: false, hasTechnicalResultId: false }),
    /result ID/i,
  );
});
