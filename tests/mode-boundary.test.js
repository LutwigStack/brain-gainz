import test from 'node:test';
import assert from 'node:assert/strict';

import {
  authorEntryPoints,
  canShowAuthorSurface,
  learnerEntryPoints,
  workspaceModeLabels,
} from '../src/components/mode-boundary.ts';

test('workspace modes define learner and author entry points explicitly', () => {
  assert.deepEqual([...learnerEntryPoints], [
    'today',
    'daily-run',
    'assessment-attempts',
    'progress',
    'map-overview',
  ]);
  assert.deepEqual([...authorEntryPoints], [
    'node-editing',
    'check-metadata',
    'route-authoring',
    'graph-editing',
    'template-maintenance',
  ]);
});

test('learner mode hides author-only surfaces while author mode keeps editing power', () => {
  assert.equal(workspaceModeLabels.learner.title, 'Режим ученика');
  assert.equal(workspaceModeLabels.author.title, 'Инструменты автора');
  assert.equal(canShowAuthorSurface('learner', 'check-metadata'), false);
  assert.equal(canShowAuthorSurface('learner', 'route-authoring'), false);
  assert.equal(canShowAuthorSurface('author', 'check-metadata'), true);
  assert.equal(canShowAuthorSurface('author', 'graph-editing'), true);
});
