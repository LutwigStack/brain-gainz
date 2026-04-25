import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveMapShortcutIntent } from '../src/application/map-shortcuts.ts';

const baseContext = {
  isMapFocused: true,
  hasTextInputFocus: false,
  hasOverlayOpen: false,
  hasFocusNode: true,
  hasSelectedEdge: true,
  hasSelectedNode: true,
  canUndo: true,
};

test('map shortcuts resolve common map intents when map owns focus', () => {
  assert.equal(resolveMapShortcutIntent({ key: 'f' }, baseContext), 'focus-node');
  assert.equal(resolveMapShortcutIntent({ key: 'F', shiftKey: true }, baseContext), null);
  assert.equal(resolveMapShortcutIntent({ key: '0' }, baseContext), 'reset-camera');
  assert.equal(resolveMapShortcutIntent({ key: 'r' }, baseContext), 'refresh-map');
  assert.equal(resolveMapShortcutIntent({ key: 'Escape' }, baseContext), 'cancel-transients');
  assert.equal(resolveMapShortcutIntent({ key: 'Delete' }, baseContext), 'delete-selected-edge');
  assert.equal(
    resolveMapShortcutIntent({ key: 'Delete' }, { ...baseContext, hasSelectedEdge: false }),
    'archive-selected-node',
  );
  assert.equal(resolveMapShortcutIntent({ key: 'd', ctrlKey: true }, baseContext), 'duplicate-selected-node');
  assert.equal(resolveMapShortcutIntent({ key: 'z', ctrlKey: true }, baseContext), 'undo-map-mutation');
});

test('map shortcuts are ignored outside map focus or text-editing contexts', () => {
  assert.equal(
    resolveMapShortcutIntent({ key: 'n' }, { ...baseContext, isMapFocused: false }),
    null,
  );
  assert.equal(
    resolveMapShortcutIntent({ key: 'n' }, { ...baseContext, hasTextInputFocus: true }),
    null,
  );
  assert.equal(
    resolveMapShortcutIntent({ key: 'n' }, { ...baseContext, hasOverlayOpen: true }),
    null,
  );
  assert.equal(
    resolveMapShortcutIntent({ key: 'Delete' }, { ...baseContext, hasSelectedEdge: false, hasSelectedNode: false }),
    null,
  );
  assert.equal(
    resolveMapShortcutIntent({ key: 'f' }, { ...baseContext, hasFocusNode: false }),
    null,
  );
});

test('map shortcuts ignore modified key chords reserved for browser or OS behavior', () => {
  assert.equal(resolveMapShortcutIntent({ key: 'r', ctrlKey: true }, baseContext), null);
  assert.equal(resolveMapShortcutIntent({ key: 'g', metaKey: true }, baseContext), null);
  assert.equal(resolveMapShortcutIntent({ key: 'l', altKey: true }, baseContext), null);
  assert.equal(resolveMapShortcutIntent({ key: 'z', ctrlKey: true }, { ...baseContext, canUndo: false }), null);
  assert.equal(
    resolveMapShortcutIntent({ key: 'd', ctrlKey: true }, { ...baseContext, hasSelectedNode: false }),
    null,
  );
});

test('map shortcuts do not expose editing modes', () => {
  assert.equal(resolveMapShortcutIntent({ key: 'n' }, baseContext), null);
  assert.equal(resolveMapShortcutIntent({ key: 'l' }, baseContext), null);
  assert.equal(resolveMapShortcutIntent({ key: 'g' }, baseContext), null);
});
