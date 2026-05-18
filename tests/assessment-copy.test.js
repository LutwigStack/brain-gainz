import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAssessmentAnswerInputCopy,
  getAssessmentAttemptResultCopy,
  getAssessmentCheckTypeLabel,
  getAssessmentEvidenceHint,
  getAssessmentFailedAttemptState,
  getAssessmentExpectedInputText,
  getAssessmentPrimaryActionLabel,
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
    'Список условий',
  );
  assert.equal(
    getAssessmentCheckTypeLabel({ strictCheckType: 'manual_strict', resolvedCheckMethod: 'strict' }),
    'Подтверждение результата',
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
    'Отметьте, что уже выполнено: обязательно 1/2.',
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
      message: 'Введите ответ: точный ответ.',
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
    'Добавьте подтверждение, чтобы засчитать.',
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
      message: 'Готово. Можно засчитать.',
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

test('assessment answer input copy explains what learners should enter', () => {
  assert.deepEqual(
    getAssessmentAnswerInputCopy({ strictCheckType: 'number', resolvedCheckMethod: 'strict' }),
    {
      label: 'Число для проверки',
      placeholder: 'Введите число без лишнего текста',
      helperText: 'Проверка учтет допустимую погрешность, если она задана.',
    },
  );

  assert.deepEqual(
    getAssessmentAnswerInputCopy({ strictCheckType: null, resolvedCheckMethod: 'llm_assisted' }),
    {
      label: 'Ответ или объяснение',
      placeholder: 'Коротко: ответ, ход решения или ссылка на работу',
      helperText: 'Зачет появится после вывода ИИ-проверки или вашего подтверждения.',
    },
  );
});

test('assessment attempt result copy separates confirmed progress from failed attempts', () => {
  assert.deepEqual(
    getAssessmentAttemptResultCopy({ passed: true, targetMasteryLabel: 'Применил' }),
    {
      status: 'Зачтено',
      message: 'Прогресс обновлен до «Применил».',
    },
  );
  assert.deepEqual(
    getAssessmentAttemptResultCopy({ passed: false, targetMasteryLabel: 'Применил' }),
    {
      status: 'Не зачтено',
      message: 'Попытка сохранена. Прогресс и XP не изменились.',
    },
  );
});

test('assessment primary and failed-attempt actions describe the real outcome', () => {
  assert.equal(
    getAssessmentPrimaryActionLabel({ pendingAssessment: false, isAutoStrictCheck: true }),
    'Проверить ответ',
  );
  assert.equal(
    getAssessmentPrimaryActionLabel({ pendingAssessment: false, isAutoStrictCheck: false }),
    'Засчитать прогресс',
  );
  assert.equal(
    getAssessmentPrimaryActionLabel({ pendingAssessment: true, isAutoStrictCheck: true }),
    'Проверяю…',
  );

  assert.deepEqual(
    getAssessmentFailedAttemptState({
      isAutoStrictCheck: true,
      pendingAssessment: false,
      hasAnswer: true,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'strict',
    }),
    {
      visible: false,
      disabled: true,
      message: 'Неверный ответ сохранится после проверки.',
    },
  );

  assert.deepEqual(
    getAssessmentFailedAttemptState({
      isAutoStrictCheck: true,
      isChecklistCheck: true,
      hasChecklistSelection: false,
      pendingAssessment: false,
      hasAnswer: false,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'strict',
    }),
    {
      visible: true,
      disabled: false,
      message: 'Сохранить как не зачтено. Отмеченных условий нет, XP не изменится.',
    },
  );

  assert.deepEqual(
    getAssessmentFailedAttemptState({
      isAutoStrictCheck: true,
      isChecklistCheck: true,
      hasChecklistSelection: true,
      pendingAssessment: false,
      hasAnswer: false,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'strict',
    }),
    {
      visible: true,
      disabled: false,
      message: 'Сохранить как не зачтено. Отмеченные условия останутся в попытке, XP не изменится.',
    },
  );

  assert.deepEqual(
    getAssessmentFailedAttemptState({
      isAutoStrictCheck: false,
      pendingAssessment: false,
      hasAnswer: false,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'llm_assisted',
    }),
    {
      visible: true,
      disabled: true,
      message: 'Добавьте ответ или вывод ИИ-проверки.',
    },
  );

  assert.deepEqual(
    getAssessmentFailedAttemptState({
      isAutoStrictCheck: false,
      pendingAssessment: false,
      hasAnswer: true,
      hasVerifierEvidence: false,
      resolvedCheckMethod: 'strict',
    }),
    {
      visible: true,
      disabled: false,
      message: 'Сохранить без зачета. XP не изменится.',
    },
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
