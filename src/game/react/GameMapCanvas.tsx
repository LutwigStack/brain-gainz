import { Application } from 'pixi.js';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import { PixelButton, PixelSurface, PixelText } from '../../components/pixel';
import type { NavigationNodeSummary, NavigationSnapshot, NodeFocusSnapshot } from '../../types/app-shell';
import { BrainGainzScene } from '../brain-gainz-scene';
import { createGameViewModel } from '../create-game-view-model';
import type { GamePoint, GameSceneModel } from '../types';
import { getViewportWorldBounds, type ViewportCamera } from '../viewport';

interface GameMapCanvasProps {
  snapshot: NavigationSnapshot | null;
  focus: NodeFocusSnapshot | null;
  onSelectNode: (node: NavigationNodeSummary) => void;
  onSelectEdge?: (edgeId: number) => void;
  onCreateNodeAt?: (input: { x: number; y: number }) => Promise<boolean> | boolean;
  onMoveNode?: (input: { nodeId: number; x: number; y: number }) => Promise<void> | void;
  canDragNodes?: boolean;
  previewNodePositions?: Record<number, GamePoint> | null;
  onToggleSnapToGrid?: () => void;
  createMode?: boolean;
  snapToGrid?: boolean;
  selectedEdgeId?: number | null;
  connectSourceNodeId?: number | null;
  connectEdgeType?: 'requires' | 'supports' | 'relates_to' | null;
  mapCommand?: { id: number; type: 'focus-node' | 'fit-graph' | 'reset-camera' } | null;
  onFocusChange?: (focused: boolean) => void;
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

const formatZoomPercent = (camera: ViewportCamera | null) =>
  `${Math.round((camera?.zoom ?? 1) * 100)}%`;

const MINIMAP_SIZE = {
  width: 220,
  height: 156,
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
  const minX = Math.min(...anchorPoints.map((point) => point.x));
  const minY = Math.min(...anchorPoints.map((point) => point.y));
  const maxX = Math.max(...anchorPoints.map((point) => point.x));
  const maxY = Math.max(...anchorPoints.map((point) => point.y));

  return {
    ...model,
    nodes,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
      center: {
        x: minX + (maxX - minX) / 2,
        y: minY + (maxY - minY) / 2,
      },
    },
  };
};

export const GameMapCanvas = ({
  snapshot,
  focus,
  onSelectNode,
  onSelectEdge,
  onCreateNodeAt,
  onMoveNode,
  canDragNodes = true,
  previewNodePositions = null,
  onToggleSnapToGrid,
  createMode = false,
  snapToGrid = true,
  selectedEdgeId = null,
  connectSourceNodeId = null,
  connectEdgeType = null,
  mapCommand = null,
  onFocusChange,
  className = 'h-[clamp(620px,calc(100dvh-180px),1080px)] w-full overflow-hidden rounded-[1rem] border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)]',
}: GameMapCanvasProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const sceneRef = useRef<BrainGainzScene | null>(null);
  const modelRef = useRef(createGameViewModel(snapshot, focus));
  const canDragNodesRef = useRef(canDragNodes);
  const createModeRef = useRef(createMode);
  const snapToGridRef = useRef(snapToGrid);
  const selectedEdgeIdRef = useRef(selectedEdgeId);
  const connectSourceNodeIdRef = useRef(connectSourceNodeId);
  const connectEdgeTypeRef = useRef(connectEdgeType);
  const [viewportCamera, setViewportCamera] = useState<ViewportCamera | null>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const onSelectNodeEvent = useEffectEvent((nodeId: number) => {
    const node = findNodeById(snapshot, nodeId);
    if (node) {
      onSelectNode(node);
    }
  });
  const onCreateNodeAtEvent = useEffectEvent(async (position: { x: number; y: number }) => {
    if (!onCreateNodeAt) {
      return false;
    }

    return onCreateNodeAt(position);
  });
  const onMoveNodeEvent = useEffectEvent((nodeId: number, position: { x: number; y: number }) =>
    onMoveNode?.({ nodeId, x: position.x, y: position.y }),
  );
  const onSelectEdgeEvent = useEffectEvent((edgeId: number) => {
    onSelectEdge?.(edgeId);
  });

  const model = useMemo(
    () => applyPreviewToModel(createGameViewModel(snapshot, focus), previewNodePositions),
    [focus, previewNodePositions, snapshot],
  );

  useEffect(() => {
    canDragNodesRef.current = canDragNodes;
  }, [canDragNodes]);

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
            onEdgeSelect: onSelectEdgeEvent,
            canDragNodes: canDragNodesRef.current,
            createMode: createModeRef.current,
            snapToGrid: snapToGridRef.current,
            selectedEdgeId: selectedEdgeIdRef.current,
            connectSourceNodeId: connectSourceNodeIdRef.current,
            connectEdgeType: connectEdgeTypeRef.current,
        },
        {
          preserveViewport: false,
          onViewportChange: setViewportCamera,
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

        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const scaleDelta = event.deltaY > 0 ? 0.92 : 1.08;
          sceneRef.current.zoomAtScreenPoint(screenPoint, scaleDelta);
          return;
        }

        if (event.deltaX !== 0 || event.deltaY !== 0) {
          event.preventDefault();
          sceneRef.current.panByScreenDelta({
            x: -event.deltaX,
            y: -event.deltaY,
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
    modelRef.current = model;
    sceneRef.current?.render(
      model,
        {
          onNodeSelect: onSelectNodeEvent,
          onNodeMove: onMoveNodeEvent,
          onCreateNodeAt: onCreateNodeAtEvent,
          onEdgeSelect: onSelectEdgeEvent,
          canDragNodes,
          createMode,
          snapToGrid,
          selectedEdgeId,
          connectSourceNodeId,
          connectEdgeType,
      },
      {
        preserveViewport: true,
        onViewportChange: setViewportCamera,
      },
    );
  }, [canDragNodes, connectEdgeType, connectSourceNodeId, createMode, model, selectedEdgeId, snapToGrid]);

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
  const isEmptyMap = model.nodes.length === 0;

  useEffect(() => {
    if (!sceneRef.current || !mapCommand) {
      return;
    }

    switch (mapCommand.type) {
      case 'focus-node':
        if (highlightedNode && viewportCamera) {
          sceneRef.current.centerOnPoint(highlightedNode.position, viewportCamera.zoom);
        }
        break;
      case 'fit-graph':
        sceneRef.current.fitToGraph();
        break;
      case 'reset-camera':
        sceneRef.current.resetCamera();
        break;
      default:
        break;
    }
  }, [highlightedNode, mapCommand, viewportCamera]);

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
  };

  return (
    <div
      ref={rootRef}
      className={`relative outline-none ${className}`}
      tabIndex={0}
      role="application"
      aria-label="Карта узлов BrainGainz"
      onPointerDownCapture={() => rootRef.current?.focus({ preventScroll: true })}
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
              Создайте стартовый набор на вкладке «Сейчас» или включите режим нового узла и поставьте
              точку прямо на карте.
            </PixelText>
          </PixelSurface>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
        <PixelSurface frame="ghost" padding="xs" fullWidth={false} className="pointer-events-auto">
          <div className="flex flex-wrap items-center gap-2">
            <PixelButton
              tone="ghost"
              onClick={() => sceneRef.current?.fitToGraph()}
              style={{ minHeight: 28, padding: '4px 8px' }}
            >
              Вписать
            </PixelButton>
            <PixelButton
              tone="ghost"
              onClick={() => sceneRef.current?.resetCamera()}
              style={{ minHeight: 28, padding: '4px 8px' }}
            >
              Сброс
            </PixelButton>
            <PixelButton
              tone="ghost"
              onClick={() => {
                if (highlightedNode && viewportCamera) {
                  sceneRef.current?.centerOnPoint(highlightedNode.position, viewportCamera.zoom);
                }
              }}
              disabled={!highlightedNode}
              style={{ minHeight: 28, padding: '4px 8px' }}
            >
              К фокусу
            </PixelButton>
            <PixelButton
              tone={snapToGrid ? 'accent' : 'ghost'}
              onClick={onToggleSnapToGrid}
              style={{ minHeight: 28, padding: '4px 8px' }}
            >
              Сетка {snapToGrid ? 'вкл' : 'выкл'}
            </PixelButton>
            <PixelText as="span" size="xs" color="textMuted" uppercase>
              {formatZoomPercent(viewportCamera)}
            </PixelText>
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
            <PixelText as="span" size="xs" color="textMuted" uppercase className="hidden lg:inline">
              N узел · L связь · G сетка · F фокус · Shift+F обзор · Esc отмена
            </PixelText>
          </div>
        </PixelSurface>
      </div>

      {minimap && !isEmptyMap ? (
        <div className="pointer-events-none absolute bottom-3 right-3 z-10">
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
                    node.state === 'active'
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
