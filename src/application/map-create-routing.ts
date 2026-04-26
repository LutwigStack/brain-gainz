export type CanvasCreateMode = 'free-node' | 'layer-child';
export type MapCanvasCreateSurface = 'free' | 'layers';

export interface CanvasCreateRoute {
  createMode: CanvasCreateMode;
  parentNodeId: number | null;
  preserveLayerMode: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export const resolveCanvasCreateRoute = (input: {
  surface: MapCanvasCreateSurface;
  createMode?: CanvasCreateMode;
  layerParentNodeId?: number | null;
}): CanvasCreateRoute => {
  const shouldUseLayer = input.surface === 'layers' || input.createMode === 'layer-child';

  if (!shouldUseLayer) {
    return {
      createMode: 'free-node',
      parentNodeId: null,
      preserveLayerMode: false,
    };
  }

  return {
    createMode: 'layer-child',
    parentNodeId: input.layerParentNodeId ?? null,
    preserveLayerMode: true,
  };
};

export const resolveCanvasCreatePosition = (input: {
  route: CanvasCreateRoute;
  pointerPosition: Point;
  parentPosition?: Point | null;
  siblingCount?: number;
  topLevelPositions?: Point[];
}): Point => {
  if (input.route.preserveLayerMode && input.route.parentNodeId != null && input.parentPosition) {
    return {
      x: Math.round(input.parentPosition.x + 320),
      y: Math.round(input.parentPosition.y + Math.max(0, input.siblingCount ?? 0) * 120),
    };
  }

  if (input.route.preserveLayerMode && input.route.parentNodeId == null && input.topLevelPositions?.length) {
    const maxX = Math.max(...input.topLevelPositions.map((position) => position.x));
    const averageY =
      input.topLevelPositions.reduce((sum, position) => sum + position.y, 0) / input.topLevelPositions.length;
    return {
      x: Math.round(maxX + 360),
      y: Math.round(averageY),
    };
  }

  return {
    x: Math.round(input.pointerPosition.x),
    y: Math.round(input.pointerPosition.y),
  };
};
