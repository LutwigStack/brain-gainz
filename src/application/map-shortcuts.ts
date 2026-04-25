export type MapShortcutIntent =
  | 'focus-node'
  | 'fit-graph'
  | 'reset-camera'
  | 'refresh-map'
  | 'cancel-transients'
  | 'delete-selected-edge';

export interface MapShortcutContext {
  isMapFocused: boolean;
  hasTextInputFocus: boolean;
  hasOverlayOpen: boolean;
  hasFocusNode: boolean;
  hasSelectedEdge: boolean;
}

export interface MapShortcutKeyInput {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

const normalizeKey = (key: string) => key.toLowerCase();

export const resolveMapShortcutIntent = (
  input: MapShortcutKeyInput,
  context: MapShortcutContext,
): MapShortcutIntent | null => {
  if (!context.isMapFocused || context.hasTextInputFocus || context.hasOverlayOpen) {
    return null;
  }

  if (input.metaKey || input.ctrlKey || input.altKey) {
    return null;
  }

  const key = normalizeKey(input.key);

  if (key === 'escape') {
    return 'cancel-transients';
  }

  if (key === 'delete' || key === 'backspace') {
    return context.hasSelectedEdge ? 'delete-selected-edge' : null;
  }

  switch (key) {
    case 'f':
      return context.hasFocusNode && !input.shiftKey ? 'focus-node' : null;
    case '0':
      return 'reset-camera';
    case 'r':
      return 'refresh-map';
    default:
      return null;
  }
};
