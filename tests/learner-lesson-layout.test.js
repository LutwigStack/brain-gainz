import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getFailedAssessmentResultState,
  getNavigationMapShellClassName,
  getPassedAssessmentResultState,
  getSelfMarkedAssessmentCopy,
  shouldShowNavigationInspectorRail,
  shouldUseCompactAssessmentResultLayout,
  shouldUseFocusedLearnerLessonScreen,
} from '../src/components/learner-lesson-layout.ts';

test('learner assessment mode uses a focused lesson screen', () => {
  assert.equal(
    shouldUseFocusedLearnerLessonScreen({
      canUseAuthorTools: false,
      inspectorMode: 'assessment',
      hasFocusedNode: true,
    }),
    true,
  );
  assert.equal(
    shouldUseFocusedLearnerLessonScreen({
      canUseAuthorTools: false,
      inspectorMode: 'overview',
      hasFocusedNode: true,
    }),
    false,
  );
  assert.equal(
    shouldUseFocusedLearnerLessonScreen({
      canUseAuthorTools: true,
      inspectorMode: 'assessment',
      hasFocusedNode: true,
    }),
    false,
  );
  assert.equal(
    shouldUseFocusedLearnerLessonScreen({
      canUseAuthorTools: false,
      inspectorMode: 'assessment',
      hasFocusedNode: false,
    }),
    false,
  );
});

test('focused lesson layout removes the competing inspector rail', () => {
  assert.equal(
    shouldShowNavigationInspectorRail({
      isFocusedLearnerLessonScreen: true,
      isInspectorCollapsed: false,
    }),
    false,
  );
  assert.equal(
    shouldShowNavigationInspectorRail({
      isFocusedLearnerLessonScreen: false,
      isInspectorCollapsed: false,
    }),
    true,
  );
  assert.equal(
    shouldShowNavigationInspectorRail({
      isFocusedLearnerLessonScreen: false,
      isInspectorCollapsed: true,
    }),
    false,
  );
});

test('focused lesson layout keeps the map shell single-column', () => {
  assert.match(
    getNavigationMapShellClassName({
      isFocusedLearnerLessonScreen: true,
      isInspectorCollapsed: false,
    }),
    /xl:grid-cols-1/,
  );
  assert.doesNotMatch(
    getNavigationMapShellClassName({
      isFocusedLearnerLessonScreen: true,
      isInspectorCollapsed: false,
    }),
    /380px/,
  );
  assert.match(
    getNavigationMapShellClassName({
      isFocusedLearnerLessonScreen: false,
      isInspectorCollapsed: false,
    }),
    /380px/,
  );
});

test('passed assessment result puts progress XP and next step first', () => {
  assert.deepEqual(
    getPassedAssessmentResultState({
      targetMasteryLabel: 'Подтвердил',
    }),
    {
      statusLabel: 'Зачтено',
      progressLabel: 'Прогресс обновлен',
      progressValue: 'Подтвердил',
      xpLabel: 'XP обновлены',
      xpValue: 'XP обновлены',
      primaryActionLabel: 'Следующий шаг',
    },
  );
});

test('failed assessment result puts reason and retry first', () => {
  assert.deepEqual(
    getFailedAssessmentResultState({
      feedbackSummary: 'Не отмечены пункты: Файл сохранен.',
    }),
    {
      statusLabel: 'Не зачтено',
      message: 'Прогресс и XP не изменились.',
      reasonLabel: 'Что осталось',
      reasonValue: 'Не отмечены пункты: Файл сохранен.',
      primaryActionLabel: 'Попробовать еще раз',
      secondaryActionLabel: 'Отметить для себя',
    },
  );
});

test('self mark copy stays human and secondary', () => {
  assert.deepEqual(getSelfMarkedAssessmentCopy(), {
    primaryActionLabel: 'Отметить для себя',
    helperText: 'Без зачета и XP.',
    resultMessage: 'Сохранено как личная отметка.',
    noticeText: 'Сохранено как личная отметка. Без зачета и XP.',
  });
});

test('compact result layout turns off while retrying a failed attempt', () => {
  assert.equal(
    shouldUseCompactAssessmentResultLayout({
      hasPassedAttempt: true,
      hasFailedAttempt: false,
      isRetryingFailedAttempt: false,
    }),
    true,
  );
  assert.equal(
    shouldUseCompactAssessmentResultLayout({
      hasPassedAttempt: false,
      hasFailedAttempt: true,
      isRetryingFailedAttempt: false,
    }),
    true,
  );
  assert.equal(
    shouldUseCompactAssessmentResultLayout({
      hasPassedAttempt: false,
      hasFailedAttempt: true,
      isRetryingFailedAttempt: true,
    }),
    false,
  );
});
