import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  shouldOpenQuietDailyTasks,
  shouldShowQuietWeakPanel,
} from '../src/components/today-priority-layout.ts';

test('quiet Today keeps task details open only when they are immediately relevant', () => {
  assert.equal(
    shouldOpenQuietDailyTasks({
      isDailyRunActive: true,
      isDailyRunFinished: false,
      dailyTaskCount: 5,
    }),
    true,
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
