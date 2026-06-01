import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  dailyRunQueueManagementActions,
  getDailyRunOutcomeLabel,
  getDailyRunRetryActionLabel,
  getDailyRunSummaryStatus,
  getQuietDailyTaskSummary,
  shouldOpenQuietDailyTasks,
  shouldShowQuietWeakPanel,
} from '../src/components/today-priority-layout.ts';

test('quiet Today keeps task details open only when they are immediately relevant', () => {
  assert.equal(
    shouldOpenQuietDailyTasks({
      isDailyRunActive: true,
      isDailyRunFinished: false,
      dailyTaskCount: 5,
      resolvedRunTaskCount: 0,
    }),
    true,
  );
  assert.equal(
    shouldOpenQuietDailyTasks({
      isDailyRunActive: true,
      isDailyRunFinished: false,
      dailyTaskCount: 5,
      resolvedRunTaskCount: 1,
    }),
    false,
  );
  assert.equal(
    shouldOpenQuietDailyTasks({
      isDailyRunActive: false,
      isDailyRunFinished: true,
      dailyTaskCount: 5,
    }),
    true,
  );
  assert.equal(
    shouldOpenQuietDailyTasks({
      isDailyRunActive: false,
      isDailyRunFinished: false,
      dailyTaskCount: 0,
    }),
    true,
  );
  assert.equal(
    shouldOpenQuietDailyTasks({
      isDailyRunActive: false,
      isDailyRunFinished: false,
      dailyTaskCount: 5,
    }),
    false,
  );
});

test('quiet Today summarizes daily run progress without opening the queue', () => {
  assert.equal(
    getQuietDailyTaskSummary({
      isDailyRunActive: true,
      isDailyRunFinished: false,
      dailyTaskCount: 4,
      activeDailyTaskCount: 4,
      resolvedRunTaskCount: 1,
      canFinishDailyRun: false,
    }),
    '1/4 разобрано',
  );

  assert.equal(
    getQuietDailyTaskSummary({
      isDailyRunActive: true,
      isDailyRunFinished: false,
      dailyTaskCount: 4,
      activeDailyTaskCount: 4,
      resolvedRunTaskCount: 4,
      canFinishDailyRun: true,
    }),
    'можно завершить',
  );

  assert.equal(
    getQuietDailyTaskSummary({
      isDailyRunActive: false,
      isDailyRunFinished: false,
      dailyTaskCount: 0,
      activeDailyTaskCount: 2,
      resolvedRunTaskCount: 0,
      canFinishDailyRun: false,
    }),
    '2 активных',
  );
});

test('quiet Today shows weak spots only when recovery is the best next action', () => {
  assert.equal(
    shouldShowQuietWeakPanel({
      recoveryIsBestNextAction: true,
      weakItemCount: 1,
    }),
    true,
  );
  assert.equal(
    shouldShowQuietWeakPanel({
      recoveryIsBestNextAction: false,
      weakItemCount: 2,
    }),
    false,
  );
  assert.equal(
    shouldShowQuietWeakPanel({
      recoveryIsBestNextAction: true,
      weakItemCount: 0,
    }),
    false,
  );
});

test('daily run queue actions avoid verified mastery wording', () => {
  assert.deepEqual(
    dailyRunQueueManagementActions.map((action) => action.label),
    ['Повторить позже', 'Отложить', 'Убрать из набора'],
  );
  assert.equal(dailyRunQueueManagementActions.some((action) => /Готово|Еще раз|Ещё раз/.test(action.label)), false);

  assert.equal(getDailyRunOutcomeLabel('completed'), 'занятие закрыто');
  assert.equal(getDailyRunOutcomeLabel('failed'), 'повторить позже');
  assert.equal(getDailyRunOutcomeLabel('skipped'), 'убрано из набора');
  assert.equal(getDailyRunOutcomeLabel('deferred'), 'отложено');
  assert.equal(getDailyRunRetryActionLabel('completed'), 'Добавить снова');
  assert.equal(getDailyRunRetryActionLabel('failed'), 'Вернуть в набор');
});

test('daily run summary has one clear status', () => {
  assert.deepEqual(
    getDailyRunSummaryStatus({
      state: 'completed',
      completedCount: 4,
      totalTaskCount: 4,
    }),
    { label: 'Все занятия закрыты', tone: 'success' },
  );

  assert.deepEqual(
    getDailyRunSummaryStatus({
      state: 'completed',
      completedCount: 1,
      totalTaskCount: 4,
    }),
    { label: 'Есть закрытые занятия', tone: 'success' },
  );

  assert.deepEqual(
    getDailyRunSummaryStatus({
      state: 'completed',
      completedCount: 0,
      totalTaskCount: 4,
    }),
    { label: 'Нужно повторить', tone: 'warning' },
  );

  assert.deepEqual(
    getDailyRunSummaryStatus({
      state: 'abandoned',
      completedCount: 2,
      totalTaskCount: 4,
    }),
    { label: 'Набор сброшен', tone: 'warning' },
  );
});
