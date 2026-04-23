import test from 'node:test';
import assert from 'node:assert/strict';

import { createNavigationFollowUpPayload } from '../src/application/navigation-follow-up.ts';

test('createNavigationFollowUpPayload preserves explicit title and barrier metadata while trimming note', () => {
  const payload = createNavigationFollowUpPayload({
    nodeId: 12,
    title: '  Разобрать барьер: слишком сложно  ',
    nodeTitle: 'Линейная алгебра',
    note: '   разбить на меньший шаг   ',
    barrierType: 'too complex',
  });

  assert.deepEqual(payload, {
    nodeId: 12,
    title: 'Разобрать барьер: слишком сложно',
    note: 'разбить на меньший шаг',
    barrierType: 'too complex',
  });
});

test('createNavigationFollowUpPayload falls back to node title when custom title is absent', () => {
  const payload = createNavigationFollowUpPayload({
    nodeId: 12,
    nodeTitle: 'Линейная алгебра',
    note: '   ',
  });

  assert.deepEqual(payload, {
    nodeId: 12,
    title: 'Следующий шаг: Линейная алгебра',
    note: undefined,
    barrierType: null,
  });
});
