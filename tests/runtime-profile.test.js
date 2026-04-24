import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveRuntimeProfile } from '../src/platform/runtime.js';

test('runtime profile resolves Tauri as desktop local-first shell', () => {
  const runtime = resolveRuntimeProfile({ capacitorNative: false, tauriInvoke: true });

  assert.equal(runtime.kind, 'tauri-desktop');
  assert.equal(runtime.isLocalFirst, true);
  assert.equal(runtime.usesNativeSql, true);
  assert.equal(runtime.storageLabel, 'Локальная SQLite');
});

test('runtime profile resolves Capacitor as mobile shell ahead of Tauri-like globals', () => {
  const runtime = resolveRuntimeProfile({ capacitorNative: true, tauriInvoke: true });

  assert.equal(runtime.kind, 'capacitor-native');
  assert.equal(runtime.usesSafeAreaInsets, true);
  assert.equal(runtime.usesNativeSql, false);
});

test('runtime profile resolves plain browser as web-first shell', () => {
  const runtime = resolveRuntimeProfile({ capacitorNative: false, tauriInvoke: false });

  assert.equal(runtime.kind, 'web');
  assert.equal(runtime.shellLabel, 'Веб');
  assert.equal(runtime.isLocalFirst, false);
});
