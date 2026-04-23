import { Capacitor } from '@capacitor/core';

const createRuntimeProfile = ({ kind, shellLabel, storageLabel, isLocalFirst, usesNativeSql, usesSafeAreaInsets, desktopOnlyCapabilities }) => ({
  kind,
  shellLabel,
  storageLabel,
  isLocalFirst,
  usesNativeSql,
  usesSafeAreaInsets,
  desktopOnlyCapabilities,
});

export const hasBrowserWindow = (target = globalThis) => typeof target?.window !== 'undefined' || typeof target?.document !== 'undefined';

export const hasTauriInvoke = (target = globalThis) => typeof target?.__TAURI_INTERNALS__?.invoke === 'function';

export const resolveRuntimeProfile = ({
  capacitorNative = Capacitor.isNativePlatform(),
  tauriInvoke = hasTauriInvoke(typeof window !== 'undefined' ? window : globalThis),
} = {}) => {
  if (capacitorNative) {
    return createRuntimeProfile({
      kind: 'capacitor-native',
      shellLabel: 'Mobile shell',
      storageLabel: 'Web storage',
      isLocalFirst: false,
      usesNativeSql: false,
      usesSafeAreaInsets: true,
      desktopOnlyCapabilities: [],
    });
  }

  if (tauriInvoke) {
    return createRuntimeProfile({
      kind: 'tauri-desktop',
      shellLabel: 'Desktop local-first',
      storageLabel: 'Local SQLite',
      isLocalFirst: true,
      usesNativeSql: true,
      usesSafeAreaInsets: false,
      desktopOnlyCapabilities: ['local database', 'desktop window', 'tauri capabilities'],
    });
  }

  return createRuntimeProfile({
    kind: 'web',
    shellLabel: 'Web-first',
    storageLabel: 'Browser storage',
    isLocalFirst: false,
    usesNativeSql: false,
    usesSafeAreaInsets: false,
    desktopOnlyCapabilities: [],
  });
};

export const getRuntimeProfile = () => resolveRuntimeProfile();