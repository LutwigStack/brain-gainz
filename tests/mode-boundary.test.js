import test from 'node:test';
import assert from 'node:assert/strict';

import {
  authorEntryPoints,
  canRunAuthorAction,
  canShowAuthorSurface,
  isAuthorDestructiveAction,
  learnerEntryPoints,
  requiresAuthorConfirmation,
  shouldShowPrimaryModeSwitch,
  shouldShowPriorityShellContextCard,
  shouldShowShellNavDescriptions,
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
  assert.equal(workspaceModeLabels.learner.switchLabel, 'Учусь');
  assert.equal(workspaceModeLabels.author.switchLabel, 'Настраиваю');
  assert.equal(workspaceModeLabels.learner.mapLabel, 'Обзор карты');
  assert.equal(workspaceModeLabels.learner.assessmentLabel, 'Проверка');
  assert.equal(workspaceModeLabels.author.mapLabel, 'Карта автора');
  assert.equal(canShowAuthorSurface('learner', 'check-metadata'), false);
  assert.equal(canShowAuthorSurface('learner', 'route-authoring'), false);
  assert.equal(canShowAuthorSurface('author', 'check-metadata'), true);
  assert.equal(canShowAuthorSurface('author', 'graph-editing'), true);
});

test('author mode entry is not a primary learner-path switch', () => {
  assert.equal(shouldShowPrimaryModeSwitch('learner'), false);
  assert.equal(shouldShowPrimaryModeSwitch('author'), true);
});

test('learner priority shell keeps only action-relevant top context', () => {
  assert.equal(shouldShowPriorityShellContextCard('learner', 'campaign'), true);
  assert.equal(shouldShowPriorityShellContextCard('learner', 'specialization'), true);
  assert.equal(shouldShowPriorityShellContextCard('learner', 'race'), false);
  assert.equal(shouldShowPriorityShellContextCard('learner', 'mode'), false);
  assert.equal(shouldShowPriorityShellContextCard('author', 'race'), true);
  assert.equal(shouldShowPriorityShellContextCard('author', 'mode'), true);
});

test('learner shell navigation avoids duplicate descriptions', () => {
  assert.equal(shouldShowShellNavDescriptions('learner'), false);
  assert.equal(shouldShowShellNavDescriptions('author'), true);
});

test('learner mode copy avoids internal authoring terms', () => {
  const learnerCopy = Object.values(workspaceModeLabels.learner).join(' ').toLowerCase();

  assert.equal(learnerCopy.includes('инспектор'), false);
  assert.equal(learnerCopy.includes('фокус'), false);
  assert.equal(learnerCopy.includes('фронт'), false);
  assert.equal(learnerCopy.includes('попытки'), false);
});

test('author action policies keep learner mode read-only for editing and destructive operations', () => {
  assert.equal(canRunAuthorAction('learner', 'create-node'), false);
  assert.equal(canRunAuthorAction('learner', 'edit-check'), false);
  assert.equal(canRunAuthorAction('learner', 'delete-edge'), false);
  assert.equal(canRunAuthorAction('learner', 'archive-node'), false);
  assert.equal(canRunAuthorAction('author', 'create-node'), true);
  assert.equal(canRunAuthorAction('author', 'edit-check'), true);
  assert.equal(canRunAuthorAction('author', 'delete-edge'), true);
  assert.equal(canRunAuthorAction('author', 'archive-node'), true);
});

test('destructive author actions require confirmation', () => {
  assert.equal(isAuthorDestructiveAction('archive-node'), true);
  assert.equal(isAuthorDestructiveAction('delete-edge'), true);
  assert.equal(isAuthorDestructiveAction('archive-campaign'), true);
  assert.equal(requiresAuthorConfirmation('archive-node'), true);
  assert.equal(requiresAuthorConfirmation('delete-edge'), true);
  assert.equal(requiresAuthorConfirmation('archive-campaign'), true);
  assert.equal(isAuthorDestructiveAction('create-node'), false);
  assert.equal(requiresAuthorConfirmation('create-node'), false);
});
