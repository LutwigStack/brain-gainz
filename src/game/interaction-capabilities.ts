import type { CanvasInteractionMode } from './types';

export const resolveInteractionCapabilities = (mode: CanvasInteractionMode = 'free-edit') => ({
  canDragNodes: mode === 'free-edit',
  canDragGates: mode === 'free-edit' || mode === 'layer-edit',
  canCreateEdges: mode === 'free-edit' || mode === 'layer-edit',
  canCreateChildFromOutput: mode === 'free-edit' || mode === 'layer-edit',
});
