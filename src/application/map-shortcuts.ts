export type MapShortcutIntent =
  | 'focus-node'
  | 'fit-graph'
  | 'reset-camera'
  | 'refresh-map'
  | 'cancel-transients'
  | 'delete-selected-edge'
  | 'archive-selected-node'
  | 'duplicate-selected-node'
  | 'undo-map-mutation';

export interface MapShortcutContext {
  isMapFocused: boolean;
  hasTextInputFocus: boolean;
  hasOverlayOpen: boolean;
  hasFocusNode: boolean;
  hasSelectedEdge: boolean;
  hasSelectedNode: boolean;
  canUndo: boolean;
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

  const hasPrimaryModifier = input.metaKey || input.ctrlKey;

  if (hasPrimaryModifier && !input.altKey) {
    if (normalizeKey(input.key) === 'z' && context.canUndo) {
      return 'undo-map-mutation';
    }

    if (normalizeKey(input.key) === 'd' && context.hasSelectedNode) {
      return 'duplicate-selected-node';
    }
  }

  if (input.metaKey || input.ctrlKey || input.altKey) {
    return null;
  }

  const key = normalizeKey(input.key);

  if (key === 'escape') {
    return 'cancel-transients';
  }

  if (key === 'delete' || key === 'backspace') {
    if (context.hasSelectedEdge) {
      return 'delete-selected-edge';
    }

    return context.hasSelectedNode ? 'archive-selected-node' : null;
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
