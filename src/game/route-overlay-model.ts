import type { GameSceneModel } from './types';

export interface RouteNodeCanvasMetadata {
  nodeId: number;
  routeNodeId?: number;
  isComplete?: boolean;
  isCurrentTarget?: boolean;
  routeOrder?: number | null;
  routeStage?: string | null;
  requiredMasteryLevel?: string | null;
  currentMasteryRank?: number;
}

export const applyRouteOverlayToModel = (
  model: GameSceneModel,
  routeNodeMetadata: RouteNodeCanvasMetadata[] | null | undefined,
): GameSceneModel => {
  if (!routeNodeMetadata?.length) {
    return model;
  }

  const routeByNodeId = new Map(
    [...routeNodeMetadata]
      .sort((left, right) => {
        const leftOrder = left.routeOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.routeOrder ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder || left.nodeId - right.nodeId;
      })
      .map((item, index) => [item.nodeId, { ...item, routeSequenceIndex: index + 1 }]),
  );

  return {
    ...model,
    nodes: model.nodes.map((node) => {
      const route = routeByNodeId.get(node.id);
      return route
        ? {
            ...node,
            isRouteNode: true,
            isRouteComplete: Boolean(route.isComplete),
            isCurrentRouteTarget: Boolean(route.isCurrentTarget),
            routeNodeId: route.routeNodeId,
            routeSequenceIndex: route.routeSequenceIndex,
            routeOrder: route.routeOrder ?? null,
            routeStage: route.routeStage ?? null,
            routeRequiredMasteryLevel: route.requiredMasteryLevel ?? null,
            routeCurrentMasteryRank: route.currentMasteryRank ?? 0,
          }
        : node;
    }),
  };
};
