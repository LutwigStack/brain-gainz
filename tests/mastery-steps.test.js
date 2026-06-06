import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getMasteryStepById,
  masteryHelperLine,
  masterySteps,
} from '../src/components/galaxy/mastery-steps.ts';

test('masterySteps has exactly six entries', () => {
  assert.equal(masterySteps.length, 6);
});

test('masterySteps ids are 1..6 in order', () => {
  assert.deepEqual(
    masterySteps.map((step) => step.id),
    [1, 2, 3, 4, 5, 6],
  );
});

test('masterySteps labels match the epic 44 table', () => {
  const expectedLabels = ['Понял', 'Запомнил', 'Применил', 'Закрепил', 'Связал', 'Освоил'];
  assert.deepEqual(
    masterySteps.map((step) => step.label),
    expectedLabels,
  );
});

test('masterySteps meanings match the epic 44 table', () => {
  const expectedMeanings = [
    'Я прочитал и могу пересказать тему.',
    'Я помню ключевые определения без подсказки.',
    'Я решил задачу на эту тему.',
    'Я решил ещё одну задачу через неделю.',
    'Я вижу, как тема стыкуется с соседними.',
    'Я могу объяснить тему другому.',
  ];
  assert.deepEqual(
    masterySteps.map((step) => step.meaning),
    expectedMeanings,
  );
});

test('masterySteps exposes the expected aria-label fragment pattern', () => {
  for (const step of masterySteps) {
    const ariaLabel = `${step.label} - ${step.meaning}`;
    assert.match(ariaLabel, new RegExp(`^${step.label} - `));
    assert.ok(ariaLabel.length > step.label.length + 3);
  }
});

test('getMasteryStepById returns the matching entry or null', () => {
  assert.equal(getMasteryStepById(1)?.label, 'Понял');
  assert.equal(getMasteryStepById(6)?.label, 'Освоил');
  assert.equal(getMasteryStepById(99), null);
  assert.equal(getMasteryStepById(0), null);
});

test('masteryHelperLine is the exact epic-44 wording', () => {
  assert.equal(
    masteryHelperLine,
    'Отметь шаг, который точно отражает твоё состояние. Менять можно в любой момент.',
  );
});
