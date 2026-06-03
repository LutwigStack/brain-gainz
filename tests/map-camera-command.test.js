import test from 'node:test';
import assert from 'node:assert/strict';

import { isUnhandledMapCameraCommand } from '../src/game/map-camera-command.ts';

test('map camera commands are handled once by id', () => {
  const command = { id: 42, type: 'focus-node' };

  assert.equal(isUnhandledMapCameraCommand(command, null), true);
  assert.equal(isUnhandledMapCameraCommand(command, 41), true);
  assert.equal(isUnhandledMapCameraCommand(command, 42), false);
  assert.equal(isUnhandledMapCameraCommand({ ...command, id: 43 }, 42), true);
});

test('missing map camera command does not request viewport work', () => {
  assert.equal(isUnhandledMapCameraCommand(null, null), false);
  assert.equal(isUnhandledMapCameraCommand(undefined, 42), false);
});
