import { Application } from 'pixi.js';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type MouseEvent } from 'react';

import { getGraphEdgeSemantics } from '../../application/graph-edge-semantics';
import { PixelSurface, PixelText } from '../../components/pixel';
import type { NavigationNodeSummary, NavigationSnapshot, NodeFocusSnapshot } from '../../types/app-shell';
import { BrainGainzScene } from '../brain-gainz-scene';
import { createGameViewModel } from '../create-game-view-model';
import { createQuadraticRoute, getPointToPolylineDistance } from '../edge-geometry';
import { getNodeGateAnchor, resolveNodeBox } from '../layers/map-layer';
import { applyRouteOverlayToModel, type RouteNodeCanvasMetadata } from '../route-overlay-model';
import type { CanvasInteractionMode, GameBounds, GamePoint, GameSceneModel } from '../types';
import { getViewportWorldBounds, screenToWorld, worldToScreen, type ViewportCamera } from '../viewport';

interface GameMapCanvasProps {
  snapshot: NavigationSnapshot | null;
  focus: NodeFocusSnapshot | null;
  onSelectNode: (node: NavigationNodeSummary, input?: { screenX: number; screenY: number }) => void;
  onSelectEdge?: (edgeId: number) => void;
  onCreateNodeAt?: (input: { x: number; y: number }) => Promise<boolean> | boolean;
  onCreateChildNodeAt?: (input: { parentNodeId: number; x: number; y: number }) => Promise<boolean> | boolean;
  onMoveNode?: (input: { nodeId: number; x: number; y: number }) => Promise<void> | void;
  interactionMode?: CanvasInteractionMode;
  previewNodePositions?: Record<number, GamePoint> | null;
  createMode?: boolean;
  snapToGrid?: boolean;
  selectedEdgeId?: number | null;
  connectSourceNodeId?: number | null;
  connectEdgeType?: 'requires' | 'supports' | 'relates_to' | null;
  visibleSphereId?: number | null;
  visibleSkillId?: number | null;
  canvasMode?: 'free' | 'layers';
  visibleNodeIds?: number[] | null;
  routeNodeMetadata?: RouteNodeCanvasMetadata[] | null;
  mapCommand?: { id: number; type: 'focus-node' | 'fit-graph' | 'fit-overview' | 'center-layer' | 'reset-camera' } | null;
  onCreateEdge?: (input: {
    sourceNodeId: number;
    targetNodeId: number;
    edgeType: 'requires' | 'supports' | 'relates_to';
  }) => Promise<boolean | number> | boolean | number;
  onCanvasContextMenu?: (input: {
    screenX: number;
    screenY: number;
    worldX: number;
    worldY: number;
    nodeId: number | null;
    edgeId: number | null;
  }) => void;
  onCanvasDoubleClick?: (input: {
    screenX: number;
    screenY: number;
    worldX: number;
    worldY: number;
  }) => void;
  onNodeDoubleClick?: (input: {
    node: NavigationNodeSummary;
    screenX: number;
    screenY: number;
    worldX: number;
    worldY: number;
  }) => void;
  onCanvasPointerDown?: (input: {
    screenX: number;
    screenY: number;
    worldX: number;
    worldY: number;
    nodeId: number | null;
    edgeId: number | null;
    button: number;
  }) => void;
  onFocusChange?: (focused: boolean) => void;
  onUserCameraControl?: () => void;
  className?: string;
}

const findNodeById = (snapshot: NavigationSnapshot | null, nodeId: number): NavigationNodeSummary | null => {
  if (!snapshot) {
    return null;
  }

  for (const sphere of snapshot.spheres) {
    for (const direction of sphere.directions) {
      for (const skill of direction.skills) {
        const matched = skill.nodes.find((node) => node.id === nodeId);
        if (matched) {
          return matched;
        }
      }
    }
  }

  return null;
};

const MINIMAP_SIZE = {
  width: 220,
  height: 156,
};

const createBounds = (points: GamePoint[]): GameBounds => {
  const safePoints = points.length > 0 ? points : [{ x: 0, y: 0 }];
  const minX = Math.min(...safePoints.map((point) => point.x));
  const minY = Math.min(...safePoints.map((point) => point.y));
  const maxX = Math.max(...safePoints.map((point) => point.x));
  const maxY = Math.max(...safePoints.map((point) => point.y));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    center: {
      x: minX + width / 2,
      y: minY + height / 2,
    },
  };
};

const filterModelToVisibleNodes = (
  model: GameSceneModel,
  visibleNodeIds: number[] | null,
): GameSceneModel => {
  if (!visibleNodeIds || visibleNodeIds.length === 0) {
    return model;
  }

  const visible = new Set(visibleNodeIds);
  const nodes = model.nodes.filter((node) => visible.has(node.id));
  const edges = model.edges.filter((edge) => visible.has(edge.fromNodeId) && visible.has(edge.toNodeId));
  const bounds = createBounds(nodes.map((node) => node.position));

  return {
    ...model,
    nodes,
    edges,
    bounds,
    overviewBounds: bounds,
    isLargeGraph: false,
    highlightedNodeId:
      model.highlightedNodeId != null && visible.has(model.highlightedNodeId)
        ? model.highlightedNodeId
        : nodes[0]?.id ?? null,
    hub: {
      ...model.hub,
      position: bounds.center,
    },
    hero: {
      ...model.hero,
      nodeId: model.hero.nodeId != null && visible.has(model.hero.nodeId) ? model.hero.nodeId : null,
    },
  };
};

const applyPreviewToModel = (
  model: GameSceneModel,
  previewNodePositions: Record<number, GamePoint> | null,
): GameSceneModel => {
  if (!previewNodePositions || Object.keys(previewNodePositions).length === 0) {
    return model;
  }

  const nodes = model.nodes.map((node) =>
    previewNodePositions[node.id]
      ? {
          ...node,
          position: previewNodePositions[node.id],
        }
      : node,
  );

  const anchorPoints: GamePoint[] = [
    model.hub.position,
    ...nodes.map((node) => node.position),
    ...model.biomes.flatMap((biome) => [
      { x: biome.center.x - biome.radius - 24, y: biome.center.y - biome.radius - 24 },
      { x: biome.center.x + biome.radius + 24, y: biome.center.y + biome.radius + 24 },
    ]),
  ];
  const bounds = createBounds(anchorPoints);

  return {
    ...model,
    nodes,
    bounds,
  };
};

export const GameMapCanvas = ({
  snapshot,
  focus,
  onSelectNode,
  onSelectEdge,
  onCreateNodeAt,
  onCreateChildNodeAt,
  onCreateEdge,
  onMoveNode,
  interactionMode = 'free-edit',
  previewNodePositions = null,
  createMode = false,
  snapToGrid = true,
  selectedEdgeId = null,
  connectSourceNodeId = null,
  connectEdgeType = null,
  visibleSphereId = null,
  visibleSkillId = null,
  canvasMode = 'free',
  visibleNodeIds = null,
  routeNodeMetadata = null,
  mapCommand = null,
  onCanvasContextMenu,
  onCanvasDoubleClick,
  onNodeDoubleClick,
  onCanvasPointerDown,
  onFocusChange,
  onUserCameraControl,
  className = 'h-[clamp(620px,calc(100dvh-180px),1080px)] w-full overflow-hidden rounded-[1rem] border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)]',
}: GameMapCanvasProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const sceneRef = useRef<BrainGainzScene | null>(null);
  const modelRef = useRef(createGameViewModel(snapshot, focus, { visibleSphereId, visibleSkillId }));
  const viewportModeKeyRef = useRef<string>('');
  const hasUserControlledViewportRef = useRef(false);
  const interactionModeRef = useRef(interactionMode);
  const createModeRef = useRef(createMode);
  const snapToGridRef = useRef(snapToGrid);
  const selectedEdgeIdRef = useRef(selectedEdgeId);
  const connectSourceNodeIdRef = useRef(connectSourceNodeId);
  const connectEdgeTypeRef = useRef(connectEdgeType);
  const lastConnectFallbackRef = useRef<{
    sourceNodeId: number;
    targetNodeId: number;
    edgeType: 'requires' | 'supports' | 'relates_to';
    at: number;
  } | null>(null);
  const viewportCameraRef = useRef<ViewportCamera | null>(null);
  const suppressNextContextMenuRef = useRef(false);
  const [viewportCamera, setViewportCamera] = useState<ViewportCamera | null>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const handleViewportChange = useEffectEvent((camera: ViewportCamera) => {
    viewportCameraRef.current = camera;
    setViewportCamera((current) =>
      current && current.x === camera.x && current.y === camera.y && current.zoom === camera.zoom ? current : camera,
    );
  });
  const handleUserViewportChange = useEffectEvent(() => {
    hasUserControlledViewportRef.current = true;
    onUserCameraControl?.();
  });
  const onCreateNodeAtEvent = useEffectEvent(async (position: { x: number; y: number }) => {
    if (!onCreateNodeAt) {
      return false;
    }

    return onCreateNodeAt(position);
  });
  const onCreateChildNodeAtEvent = useEffectEvent(async (input: { parentNodeId: number; position: GamePoint }) => {
    if (!onCreateChildNodeAt) {
      return false;
    }

    return onCreateChildNodeAt({
      parentNodeId: input.parentNodeId,
      x: input.position.x,
      y: input.position.y,
    });
  });
  const onMoveNodeEvent = useEffectEvent((nodeId: number, position: { x: number; y: number }) =>
    onMoveNode?.({ nodeId, x: position.x, y: position.y }),
  );
  const onSelectEdgeEvent = useEffectEvent((edgeId: number) => {
    onSelectEdge?.(edgeId);
  });
  const onCreateEdgeEvent = useEffectEvent((input: {
    sourceNodeId: number;
    targetNodeId: number;
    edgeType: 'requires' | 'supports' | 'relates_to';
  }) => onCreateEdge?.(input) ?? false);
  const onEdgeContextMenuEvent = useEffectEvent((input: { edgeId: number; screenX: number; screenY: number }) => {
    if (!hostRef.current || !viewportCameraRef.current) {
      return;
    }

    const rect = hostRef.current.getBoundingClientRect();
    const worldPoint = screenToWorld({ x: input.screenX, y: input.screenY }, viewportCameraRef.current);
    suppressNextContextMenuRef.current = true;
    window.setTimeout(() => {
      suppressNextContextMenuRef.current = false;
    }, 120);
    onCanvasContextMenu?.({
      screenX: rect.left + input.screenX,
      screenY: rect.top + input.screenY,
      worldX: worldPoint.x,
      worldY: worldPoint.y,
      nodeId: null,
      edgeId: input.edgeId,
    });
  });

  const model = useMemo(
    () =>
      filterModelToVisibleNodes(
        applyRouteOverlayToModel(
          applyPreviewToModel(createGameViewModel(snapshot, focus, { visibleSphereId, visibleSkillId }), previewNodePositions),
          routeNodeMetadata,
        ),
        visibleNodeIds,
      ),
    [focus, previewNodePositions, routeNodeMetadata, snapshot, visibleNodeIds, visibleSphereId, visibleSkillId],
  );
  const hasVisibleNodeFilter = Boolean(visibleNodeIds && visibleNodeIds.length > 0);
  const shouldRenderOverview = Boolean(
    model.isLargeGraph &&
      canvasMode === 'free' &&
      !hasVisibleNodeFilter &&
      !createMode &&
      connectSourceNodeId == null,
  );
  const shouldRenderOverviewRef = useRef(shouldRenderOverview);
  const viewportModeKey = `${visibleSphereId ?? 'all'}:${visibleSkillId ?? 'all'}:${canvasMode}:${shouldRenderOverview ? 'overview' : 'detail'}:${visibleNodeIds?.join(',') ?? 'all'}`;
  const getNodeRenderPosition = useCallback(
    (node: GameSceneModel['nodes'][number]) => (shouldRenderOverview ? node.overviewPosition : null) ?? node.position,
    [shouldRenderOverview],
  );
  const onSelectNodeEvent = useEffectEvent((nodeId: number, input?: { screenX: number; screenY: number }) => {
    const node = findNodeById(snapshot, nodeId);
    if (node) {
      const rect = hostRef.current?.getBoundingClientRect();
      onSelectNode(
        node,
        rect && input
          ? {
              screenX: rect.left + input.screenX,
              screenY: rect.top + input.screenY,
            }
          : undefined,
      );
    }
  });

  useEffect(() => {
    interactionModeRef.current = interactionMode;
  }, [interactionMode]);

  useEffect(() => {
    createModeRef.current = createMode;
  }, [createMode]);

  useEffect(() => {
    snapToGridRef.current = snapToGrid;
  }, [snapToGrid]);

  useEffect(() => {
    selectedEdgeIdRef.current = selectedEdgeId;
  }, [selectedEdgeId]);

  useEffect(() => {
    connectSourceNodeIdRef.current = connectSourceNodeId;
  }, [connectSourceNodeId]);

  useEffect(() => {
    connectEdgeTypeRef.current = connectEdgeType;
  }, [connectEdgeType]);

  useEffect(() => {
    shouldRenderOverviewRef.current = shouldRenderOverview;
  }, [shouldRenderOverview]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let removeWheelListener: (() => void) | null = null;

    const mount = async () => {
      if (!hostRef.current) {
        return;
      }

      const app = new Application();
      await app.init({
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        resizeTo: hostRef.current,
      });

      if (cancelled) {
        app.destroy(true);
        return;
      }

      app.canvas.style.display = 'block';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      hostRef.current.appendChild(app.canvas);
      appRef.current = app;
      sceneRef.current = new BrainGainzScene(app);
      sceneRef.current.render(
        modelRef.current,
          {
            onNodeSelect: onSelectNodeEvent,
            onNodeMove: onMoveNodeEvent,
            onCreateNodeAt: onCreateNodeAtEvent,
            onCreateChildNodeAt: onCreateChildNodeAtEvent,
            onCreateEdge: onCreateEdgeEvent,
            onEdgeSelect: onSelectEdgeEvent,
            onEdgeContextMenu: onEdgeContextMenuEvent,
            interactionMode: interactionModeRef.current,
            createMode: createModeRef.current,
            snapToGrid: snapToGridRef.current,
            selectedEdgeId: selectedEdgeIdRef.current,
            connectSourceNodeId: connectSourceNodeIdRef.current,
            connectEdgeType: connectEdgeTypeRef.current,
            overviewMode: shouldRenderOverviewRef.current,
        },
        {
          preserveViewport: false,
          onViewportChange: handleViewportChange,
          onUserViewportChange: handleUserViewportChange,
        },
      );

      resizeObserver = new ResizeObserver(() => {
        if (hostRef.current) {
          setHostSize({
            width: hostRef.current.clientWidth,
            height: hostRef.current.clientHeight,
          });
        }
        sceneRef.current?.resize();
      });
      resizeObserver.observe(hostRef.current);
      setHostSize({
        width: hostRef.current.clientWidth,
        height: hostRef.current.clientHeight,
      });

      const handleWheel = (event: WheelEvent) => {
        if (!sceneRef.current || !hostRef.current) {
          return;
        }

        const rect = hostRef.current.getBoundingClientRect();
        const screenPoint = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        const absDeltaX = Math.abs(event.deltaX);
        const absDeltaY = Math.abs(event.deltaY);
        const shouldPan = event.shiftKey || absDeltaX > absDeltaY;

        if (!shouldPan && event.deltaY !== 0) {
          event.preventDefault();
          const scaleDelta = event.deltaY > 0 ? 0.92 : 1.08;
          sceneRef.current.zoomAtScreenPoint(screenPoint, scaleDelta);
          return;
        }

        if (event.deltaX !== 0 || event.deltaY !== 0) {
          event.preventDefault();
          sceneRef.current.panByScreenDelta({
            x: event.shiftKey && event.deltaX === 0 ? -event.deltaY : -event.deltaX,
            y: event.shiftKey && event.deltaX === 0 ? 0 : -event.deltaY,
          });
        }
      };

      hostRef.current.addEventListener('wheel', handleWheel, { passive: false });
      removeWheelListener = () => hostRef.current?.removeEventListener('wheel', handleWheel);
    };

    void mount();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      removeWheelListener?.();
      sceneRef.current?.destroy();
      sceneRef.current = null;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    const shouldPreserveViewport = viewportModeKeyRef.current === viewportModeKey;
    viewportModeKeyRef.current = viewportModeKey;
    modelRef.current = model;
    sceneRef.current?.render(
      model,
        {
          onNodeSelect: onSelectNodeEvent,
          onNodeMove: onMoveNodeEvent,
          onCreateNodeAt: onCreateNodeAtEvent,
          onCreateChildNodeAt: onCreateChildNodeAtEvent,
          onCreateEdge: onCreateEdgeEvent,
          onEdgeSelect: onSelectEdgeEvent,
          onEdgeContextMenu: onEdgeContextMenuEvent,
          interactionMode,
          createMode,
          snapToGrid,
          selectedEdgeId,
          connectSourceNodeId,
          connectEdgeType,
          overviewMode: shouldRenderOverview,
      },
      {
        preserveViewport: shouldPreserveViewport || hasUserControlledViewportRef.current,
        onViewportChange: handleViewportChange,
        onUserViewportChange: handleUserViewportChange,
      },
    );
  }, [connectEdgeType, connectSourceNodeId, createMode, interactionMode, model, selectedEdgeId, shouldRenderOverview, snapToGrid, viewportModeKey]);

  const minimap = useMemo(() => {
    if (!viewportCamera || hostSize.width <= 0 || hostSize.height <= 0) {
      return null;
    }

    const viewportBounds = getViewportWorldBounds(viewportCamera, hostSize);
    const mergedBounds = {
      minX: Math.min(model.bounds.minX, viewportBounds.minX) - 48,
      minY: Math.min(model.bounds.minY, viewportBounds.minY) - 48,
      maxX: Math.max(model.bounds.maxX, viewportBounds.maxX) + 48,
      maxY: Math.max(model.bounds.maxY, viewportBounds.maxY) + 48,
      width: 0,
      height: 0,
      center: { x: 0, y: 0 },
    };
    mergedBounds.width = Math.max(1, mergedBounds.maxX - mergedBounds.minX);
    mergedBounds.height = Math.max(1, mergedBounds.maxY - mergedBounds.minY);
    mergedBounds.center = {
      x: mergedBounds.minX + mergedBounds.width / 2,
      y: mergedBounds.minY + mergedBounds.height / 2,
    };
    const scale = Math.min(
      MINIMAP_SIZE.width / Math.max(mergedBounds.width, 1),
      MINIMAP_SIZE.height / Math.max(mergedBounds.height, 1),
    );
    const offsetX = (MINIMAP_SIZE.width - mergedBounds.width * scale) / 2;
    const offsetY = (MINIMAP_SIZE.height - mergedBounds.height * scale) / 2;
    const toMini = (x: number, y: number) => ({
      x: offsetX + (x - mergedBounds.minX) * scale,
      y: offsetY + (y - mergedBounds.minY) * scale,
    });
    const viewportTopLeft = toMini(viewportBounds.minX, viewportBounds.minY);
    const viewportBottomRight = toMini(viewportBounds.maxX, viewportBounds.maxY);

    return {
      scale,
      worldBounds: mergedBounds,
      toMini,
      viewportRect: {
        x: Math.max(0, Math.min(MINIMAP_SIZE.width - 12, viewportTopLeft.x)),
        y: Math.max(0, Math.min(MINIMAP_SIZE.height - 12, viewportTopLeft.y)),
        width: Math.max(12, Math.min(MINIMAP_SIZE.width - Math.max(0, viewportTopLeft.x), viewportBottomRight.x - viewportTopLeft.x)),
        height: Math.max(12, Math.min(MINIMAP_SIZE.height - Math.max(0, viewportTopLeft.y), viewportBottomRight.y - viewportTopLeft.y)),
      },
    };
  }, [hostSize, model, viewportCamera]);

  const highlightedNode = model.nodes.find((node) => node.id === model.highlightedNodeId) ?? null;
  const highlightedRenderPosition =
    highlightedNode != null ? (shouldRenderOverview ? highlightedNode.overviewPosition : null) ?? highlightedNode.position : null;
  const isEmptyMap = model.nodes.length === 0;
  const shouldShowZoomEditHint = Boolean(model.isLargeGraph && viewportCamera && viewportCamera.zoom < 0.24);

  const resolveCanvasHit = useCallback((clientX: number, clientY: number) => {
    if (!hostRef.current || !viewportCameraRef.current) {
      return null;
    }

    const rect = hostRef.current.getBoundingClientRect();
    const screenPoint = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    if (screenPoint.x < 0 || screenPoint.y < 0 || screenPoint.x > rect.width || screenPoint.y > rect.height) {
      return null;
    }

    const worldPoint = screenToWorld(screenPoint, viewportCameraRef.current);
    const nodeById = new Map(model.nodes.map((node) => [node.id, node]));
    const nearestEdge = model.edges
      .map((edge) => {
        const source = nodeById.get(edge.fromNodeId);
        const target = nodeById.get(edge.toNodeId);
        if (!source || !target) {
          return null;
        }

        const semantics = getGraphEdgeSemantics(edge.type);
        const sourceAnchor = getNodeGateAnchor({ ...source, position: getNodeRenderPosition(source) }, 'output', shouldRenderOverview);
        const targetAnchor = getNodeGateAnchor({ ...target, position: getNodeRenderPosition(target) }, 'input', shouldRenderOverview);
        const route = createQuadraticRoute(
          sourceAnchor,
          targetAnchor,
          edge.fromNodeId <= edge.toNodeId ? 1 : -1,
          semantics.canvas.bendStrength,
        ).map((point) => worldToScreen(point, viewportCameraRef.current!));

        return {
          edge,
          distance: getPointToPolylineDistance(screenPoint, route),
        };
      })
      .filter((entry): entry is { edge: GameSceneModel['edges'][number]; distance: number } => entry != null)
      .sort((left, right) => left.distance - right.distance)[0];
    const isConnectTargetPick =
      connectSourceNodeIdRef.current != null && connectEdgeTypeRef.current != null;
    const nodeHitPadding = (isConnectTargetPick ? 36 : 10) / viewportCameraRef.current.zoom;
    const nodeHit = model.nodes
      .map((node) => {
        const box = resolveNodeBox(node, shouldRenderOverview);
        const position = getNodeRenderPosition(node);
        const dx = Math.abs(worldPoint.x - position.x);
        const dy = Math.abs(worldPoint.y - position.y);
        const hit =
          dx <= box.width / 2 + nodeHitPadding &&
          dy <= box.height / 2 + nodeHitPadding;

        return hit
          ? {
              node,
              distance: Math.hypot(dx, dy),
            }
          : null;
      })
      .filter((entry): entry is { node: GameSceneModel['nodes'][number]; distance: number } => entry != null)
      .sort((left, right) => left.distance - right.distance)[0] ?? null;
    const edgeHit = !nodeHit && nearestEdge && nearestEdge.distance <= 24 ? nearestEdge : null;

    return {
      screenX: clientX,
      screenY: clientY,
      worldX: worldPoint.x,
      worldY: worldPoint.y,
      nodeId: nodeHit ? nodeHit.node.id : null,
      edgeId: edgeHit ? edgeHit.edge.id : null,
    };
  }, [getNodeRenderPosition, model.edges, model.nodes, shouldRenderOverview]);

  const resolveConnectTargetNodeId = useCallback(
    (clientX: number, clientY: number) => {
      if (connectSourceNodeId == null || !hostRef.current || !viewportCameraRef.current) {
        return null;
      }

      const exactHit = resolveCanvasHit(clientX, clientY);
      if (exactHit?.nodeId != null) {
        return exactHit.nodeId === connectSourceNodeId ? null : exactHit.nodeId;
      }

      const sourceNode = model.nodes.find((node) => node.id === connectSourceNodeId);
      if (!sourceNode) {
        return null;
      }

      const rect = hostRef.current.getBoundingClientRect();
      const screenPoint = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      if (screenPoint.x < 0 || screenPoint.y < 0 || screenPoint.x > rect.width || screenPoint.y > rect.height) {
        return null;
      }

      const targetNodes = model.nodes.filter((node) => node.id !== connectSourceNodeId);
      if (targetNodes.length === 1) {
        return targetNodes[0].id;
      }

      const camera = viewportCameraRef.current;
      const sourcePosition = worldToScreen(getNodeRenderPosition(sourceNode), camera);
      const sourceBox = resolveNodeBox(sourceNode, shouldRenderOverview);
      const sourceGuardX = (sourceBox.width * camera.zoom) / 2 + 44;
      const sourceGuardY = (sourceBox.height * camera.zoom) / 2 + 44;
      if (
        Math.abs(screenPoint.x - sourcePosition.x) <= sourceGuardX &&
        Math.abs(screenPoint.y - sourcePosition.y) <= sourceGuardY
      ) {
        return null;
      }

      const nearestTarget = targetNodes
        .map((node) => {
          const position = worldToScreen(getNodeRenderPosition(node), camera);
          return {
            nodeId: node.id,
            distance: Math.hypot(screenPoint.x - position.x, screenPoint.y - position.y),
          };
        })
        .sort((left, right) => left.distance - right.distance)[0];

      return nearestTarget && nearestTarget.distance <= 180 ? nearestTarget.nodeId : null;
    },
    [connectSourceNodeId, getNodeRenderPosition, model.nodes, resolveCanvasHit, shouldRenderOverview],
  );

  const createConnectFallbackEdge = useCallback(
    (targetNodeId: number) => {
      if (connectSourceNodeId == null || connectEdgeType == null || targetNodeId === connectSourceNodeId) {
        return false;
      }

      const lastConnectFallback = lastConnectFallbackRef.current;
      const isDuplicateClickFallback =
        lastConnectFallback != null &&
        lastConnectFallback.sourceNodeId === connectSourceNodeId &&
        lastConnectFallback.targetNodeId === targetNodeId &&
        lastConnectFallback.edgeType === connectEdgeType &&
        Date.now() - lastConnectFallback.at < 1_000;

      if (isDuplicateClickFallback) {
        return true;
      }

      lastConnectFallbackRef.current = {
        sourceNodeId: connectSourceNodeId,
        targetNodeId,
        edgeType: connectEdgeType,
        at: Date.now(),
      };
      void onCreateEdge?.({
        sourceNodeId: connectSourceNodeId,
        targetNodeId,
        edgeType: connectEdgeType,
      });
      return true;
    },
    [connectEdgeType, connectSourceNodeId, onCreateEdge],
  );

  useEffect(() => {
    if (connectSourceNodeId == null || connectEdgeType == null) {
      return undefined;
    }

    const handleConnectPointerEnd = (event: globalThis.MouseEvent | PointerEvent) => {
      const targetNodeId = resolveConnectTargetNodeId(event.clientX, event.clientY);
      if (targetNodeId == null) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      createConnectFallbackEdge(targetNodeId);
    };

    window.addEventListener('pointerup', handleConnectPointerEnd, { capture: true });
    window.addEventListener('mouseup', handleConnectPointerEnd, { capture: true });
    return () => {
      window.removeEventListener('pointerup', handleConnectPointerEnd, { capture: true });
      window.removeEventListener('mouseup', handleConnectPointerEnd, { capture: true });
    };
  }, [connectEdgeType, connectSourceNodeId, createConnectFallbackEdge, resolveConnectTargetNodeId]);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (suppressNextContextMenuRef.current) {
      return;
    }
    rootRef.current?.focus({ preventScroll: true });

    const hit = resolveCanvasHit(event.clientX, event.clientY);
    if (!hit) {
      return;
    }

    onCanvasContextMenu?.({
      screenX: hit.screenX,
      screenY: hit.screenY,
      worldX: hit.worldX,
      worldY: hit.worldY,
      nodeId: hit.nodeId,
      edgeId: hit.edgeId,
    });
  };

  useEffect(() => {
    if (!sceneRef.current || !mapCommand) {
      return;
    }

    switch (mapCommand.type) {
      case 'focus-node':
        hasUserControlledViewportRef.current = false;
        if (highlightedRenderPosition) {
          sceneRef.current.ensurePointVisible(highlightedRenderPosition, 148);
        }
        break;
      case 'fit-graph':
        hasUserControlledViewportRef.current = false;
        sceneRef.current.fitToGraph();
        break;
      case 'fit-overview':
        hasUserControlledViewportRef.current = false;
        sceneRef.current.fitToOverview();
        break;
      case 'center-layer':
        hasUserControlledViewportRef.current = false;
        sceneRef.current.fitToGraph();
        break;
      case 'reset-camera':
        hasUserControlledViewportRef.current = false;
        if (model.isLargeGraph || shouldRenderOverview) {
          sceneRef.current.fitToOverview();
        } else {
          sceneRef.current.resetCamera();
        }
        break;
      default:
        break;
    }
  }, [highlightedRenderPosition, mapCommand, model.isLargeGraph, shouldRenderOverview, visibleSphereId]);

  const recenterFromMinimap = (clientX: number, clientY: number, element: HTMLDivElement) => {
    if (!minimap || !viewportCamera) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const worldX = minimap.worldBounds.minX + (localX - (MINIMAP_SIZE.width - minimap.worldBounds.width * minimap.scale) / 2) / minimap.scale;
    const worldY = minimap.worldBounds.minY + (localY - (MINIMAP_SIZE.height - minimap.worldBounds.height * minimap.scale) / 2) / minimap.scale;
    sceneRef.current?.centerOnPoint({ x: worldX, y: worldY }, viewportCamera.zoom);
    hasUserControlledViewportRef.current = true;
    onUserCameraControl?.();
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 max-w-full outline-none ${className}`}
      tabIndex={0}
      role="application"
      aria-label="Карта узлов BrainGainz"
      onPointerDownCapture={(event) => {
        rootRef.current?.focus({ preventScroll: true });
        const hit = resolveCanvasHit(event.clientX, event.clientY);
        if (
          event.button === 0 &&
          connectSourceNodeId != null &&
          connectEdgeType != null
        ) {
          const targetNodeId = resolveConnectTargetNodeId(event.clientX, event.clientY);
          if (targetNodeId != null) {
            event.preventDefault();
            event.stopPropagation();
            createConnectFallbackEdge(targetNodeId);
            return;
          }
        }

        if (hit) {
          onCanvasPointerDown?.({
            ...hit,
            button: event.button,
          });
        }
      }}
      onPointerUpCapture={(event) => {
        if (
          event.button !== 0 ||
          connectSourceNodeId == null ||
          connectEdgeType == null
        ) {
          return;
        }

        const targetNodeId = resolveConnectTargetNodeId(event.clientX, event.clientY);
        if (targetNodeId == null) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        createConnectFallbackEdge(targetNodeId);
      }}
      onDoubleClickCapture={(event) => {
        event.preventDefault();
        rootRef.current?.focus({ preventScroll: true });
        const hit = resolveCanvasHit(event.clientX, event.clientY);
        if (!hit) {
          return;
        }

        if (hit.nodeId != null) {
          const node = findNodeById(snapshot, hit.nodeId);
          if (node) {
            onNodeDoubleClick?.({
              node,
              screenX: hit.screenX,
              screenY: hit.screenY,
              worldX: hit.worldX,
              worldY: hit.worldY,
            });
          }
          return;
        }

        onCanvasDoubleClick?.({
          screenX: hit.screenX,
          screenY: hit.screenY,
          worldX: hit.worldX,
          worldY: hit.worldY,
        });
      }}
      onContextMenu={handleContextMenu}
      onFocusCapture={() => onFocusChange?.(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onFocusChange?.(false);
        }
      }}
    >
      <div ref={hostRef} className="h-full w-full overflow-hidden" />

      {isEmptyMap ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
          <PixelSurface frame="ghost" padding="xxl" className="max-w-[440px] text-center">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              Карта пуста
            </PixelText>
            <PixelText as="p" size="lg" style={{ marginTop: 10 }}>
              Нужен первый узел
            </PixelText>
            <PixelText as="p" readable size="sm" color="textMuted" style={{ marginTop: 10 }}>
              Используйте «Создать узел» в панели карты или стартовый набор на вкладке «Сейчас».
            </PixelText>
          </PixelSurface>
        </div>
      ) : null}

      {createMode || connectSourceNodeId != null ? (
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap gap-2 sm:left-3 sm:top-3 sm:max-w-[calc(100%-1.5rem)]">
          <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
            {createMode ? (
              <PixelText as="span" size="xs" color="accent" uppercase>
                {'\u0420\u0435\u0436\u0438\u043c: \u043d\u043e\u0432\u044b\u0439 \u0443\u0437\u0435\u043b'}
              </PixelText>
            ) : null}
            {connectSourceNodeId != null ? (
              <PixelText as="span" size="xs" color="accent" uppercase>
                {'\u0421\u0432\u044f\u0437\u044c: \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0446\u0435\u043b\u044c'}
              </PixelText>
            ) : null}
          </PixelSurface>
        </div>
      ) : null}

      {shouldShowZoomEditHint ? (
        <div className="pointer-events-none absolute left-2 top-2 z-10 sm:left-3 sm:top-3">
          <PixelSurface frame="ghost" padding="xs" fullWidth={false}>
            <PixelText as="span" size="xs" color="textMuted" uppercase>
              Приблизьте для редактирования
            </PixelText>
          </PixelSurface>
        </div>
      ) : null}

      {minimap && !isEmptyMap && !shouldRenderOverview ? (
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 hidden sm:block">
          <PixelSurface frame="ghost" padding="xs" fullWidth={false} className="pointer-events-auto">
            <div className="flex items-center justify-between gap-3 pb-2">
              <PixelText as="span" size="xs" color="textMuted" uppercase>
                Миникарта
              </PixelText>
              <PixelText as="span" size="xs" color="textMuted" uppercase>
                перейти
              </PixelText>
            </div>
            <div
              className="relative cursor-pointer overflow-hidden rounded-[0.65rem] border border-[var(--pixel-line-soft)] bg-[rgba(4,10,20,0.88)]"
              style={{ width: MINIMAP_SIZE.width, height: MINIMAP_SIZE.height }}
              onPointerDown={(event) => {
                const element = event.currentTarget;
                const move = (pointerEvent: PointerEvent) => recenterFromMinimap(pointerEvent.clientX, pointerEvent.clientY, element);
                recenterFromMinimap(event.clientX, event.clientY, element);
                const stop = () => {
                  window.removeEventListener('pointermove', move);
                  window.removeEventListener('pointerup', stop);
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', stop, { once: true });
              }}
            >
              <svg width={MINIMAP_SIZE.width} height={MINIMAP_SIZE.height} className="absolute inset-0">
                {model.edges.map((edge) => {
                  const fromNode = model.nodes.find((node) => node.id === edge.fromNodeId);
                  const toNode = model.nodes.find((node) => node.id === edge.toNodeId);
                  if (!fromNode || !toNode) {
                    return null;
                  }

                  const from = minimap.toMini(fromNode.position.x, fromNode.position.y);
                  const to = minimap.toMini(toNode.position.x, toNode.position.y);
                  const color =
                    edge.type === 'requires' ? '#94a3b8' : edge.type === 'supports' ? '#5eead4' : '#fbbf24';

                  return (
                    <line
                      key={edge.id}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={color}
                      strokeOpacity={0.42}
                      strokeWidth={edge.id === selectedEdgeId ? 2.5 : 1.25}
                    />
                  );
                })}
                {model.nodes.map((node) => {
                  const point = minimap.toMini(node.position.x, node.position.y);
                  const fill =
                    node.isRouteNode
                      ? node.isCurrentRouteTarget
                        ? '#38bdf8'
                        : node.isRouteComplete
                          ? '#6ee7b7'
                          : '#facc15'
                      : node.state === 'active'
                      ? '#60a5fa'
                      : node.state === 'available'
                        ? '#5eead4'
                        : node.state === 'completed'
                          ? '#b9fbc0'
                          : node.state === 'paused'
                            ? '#fdba74'
                            : '#64748b';
                  const radius = node.id === model.highlightedNodeId ? 4.5 : 3;

                  return <circle key={node.id} cx={point.x} cy={point.y} r={radius} fill={fill} fillOpacity={0.95} />;
                })}
                <rect
                  x={minimap.viewportRect.x}
                  y={minimap.viewportRect.y}
                  width={minimap.viewportRect.width}
                  height={minimap.viewportRect.height}
                  fill="rgba(96,165,250,0.12)"
                  stroke="#dbeafe"
                  strokeWidth={1.5}
                  rx={6}
                />
              </svg>
            </div>
          </PixelSurface>
        </div>
      ) : null}
    </div>
  );
};
