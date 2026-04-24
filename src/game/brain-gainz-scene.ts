import { Application, Container, FederatedPointerEvent, Graphics } from 'pixi.js';

import { snapPointToGrid } from './layout-helpers';
import { EffectsLayer } from './layers/effects-layer';
import { HeroLayer } from './layers/hero-layer';
import { MapLayer } from './layers/map-layer';
import type { GamePoint, GameSceneModel } from './types';
import {
  centerCameraOnPoint,
  DEFAULT_ZOOM,
  fitCameraToBounds,
  panCameraByScreenDelta,
  screenToWorld,
  zoomCameraAtScreenPoint,
  type ViewportCamera,
} from './viewport';

const PAN_CURSOR = 'grab';
const PANNING_CURSOR = 'grabbing';
const CREATE_CURSOR = 'crosshair';
const CONNECT_NODE_HIT_RADIUS = 46;
const POINTER_THRESHOLD = 8;

interface SceneInteractionState {
  pointerId: number;
  startScreen: GamePoint;
  lastScreen: GamePoint;
  moved: boolean;
}

interface NodeDragState extends SceneInteractionState {
  nodeId: number;
  startWorld: GamePoint;
  nodeStartPosition: GamePoint;
}

interface SceneCallbacks {
  onNodeSelect: (nodeId: number) => void;
  onEdgeSelect?: (edgeId: number) => void;
  onNodeMove?: (nodeId: number, position: GamePoint) => void | Promise<void>;
  onCreateNodeAt?: (position: GamePoint) => void | Promise<boolean>;
  canDragNodes?: boolean;
  createMode?: boolean;
  snapToGrid?: boolean;
  selectedEdgeId?: number | null;
  connectSourceNodeId?: number | null;
  connectEdgeType?: 'requires' | 'supports' | 'relates_to' | null;
  overviewMode?: boolean;
}

export class BrainGainzScene {
  private readonly root = new Container();
  private readonly backdrop = new Graphics();
  private readonly mapLayer = new MapLayer();
  private readonly effectsLayer = new EffectsLayer();
  private readonly heroLayer = new HeroLayer();
  private currentModel: GameSceneModel | null = null;
  private currentCallbacks: SceneCallbacks | null = null;
  private currentCamera: ViewportCamera | null = null;
  private backgroundInteraction: SceneInteractionState | null = null;
  private nodeDragInteraction: NodeDragState | null = null;
  private connectPreviewTarget: GamePoint | null = null;
  private onViewportChange: ((camera: ViewportCamera) => void) | null = null;

  constructor(private readonly app: Application) {
    this.app.stage.eventMode = 'static';

    this.backdrop.eventMode = 'static';

    this.app.stage.on('pointerdown', this.handleBackdropPointerDown);
    this.backdrop.on('pointerdown', this.handleBackdropPointerDown);
    this.app.stage.on('pointermove', this.handlePointerMove);
    this.app.stage.on('pointerup', this.handlePointerUp);
    this.app.stage.on('pointerupoutside', this.handlePointerUp);
    this.app.stage.on('pointerleave', this.handlePointerCancel);

    this.root.addChild(this.backdrop, this.mapLayer, this.effectsLayer, this.heroLayer);
    this.app.stage.addChild(this.root);
    this.app.ticker.add(this.handleTick);
  }

  render(
    model: GameSceneModel,
    callbacks: SceneCallbacks,
    options?: { preserveViewport?: boolean; onViewportChange?: (camera: ViewportCamera) => void },
  ) {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    this.currentModel = model;
    this.currentCallbacks = callbacks;
    this.onViewportChange = options?.onViewportChange ?? this.onViewportChange;
    if (!callbacks.connectSourceNodeId) {
      this.connectPreviewTarget = null;
    }

    this.backdrop.clear();
    this.backdrop.rect(0, 0, width, height);
    this.backdrop.fill({ color: 0x08101d, alpha: 1 });

    if (!options?.preserveViewport || !this.currentCamera) {
      this.currentCamera = fitCameraToBounds(
        model.isLargeGraph && model.overviewBounds ? model.overviewBounds : model.bounds,
        { width, height },
      );
    }

    this.mapLayer.render(model, {
      onNodePointerDown: this.handleNodePointerDown,
      onEdgePointerDown: this.handleEdgePointerDown,
      selectedEdgeId: callbacks.selectedEdgeId ?? null,
      connectSourceNodeId: callbacks.connectSourceNodeId ?? null,
      connectPreviewTarget: this.connectPreviewTarget,
      connectEdgeType: callbacks.connectEdgeType ?? null,
      overviewMode: callbacks.overviewMode ?? false,
    });
    this.effectsLayer.render(model, width, height);
    this.heroLayer.render(model);
    this.updateBackdropCursor();
    this.applyViewport();
  }

  resize() {
    if (this.currentModel && this.currentCallbacks) {
      this.render(this.currentModel, this.currentCallbacks, {
        preserveViewport: true,
        onViewportChange: this.onViewportChange ?? undefined,
      });
    }
  }

  fitToGraph() {
    if (!this.currentModel) {
      return null;
    }

    const bounds =
      this.currentModel.isLargeGraph && this.currentModel.overviewBounds
        ? this.currentModel.overviewBounds
        : this.currentModel.bounds;

    this.currentCamera = fitCameraToBounds(bounds, {
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    });
    this.applyViewport();
    return this.currentCamera;
  }

  fitToOverview() {
    if (!this.currentModel) {
      return null;
    }

    this.currentCamera = fitCameraToBounds(this.currentModel.overviewBounds ?? this.currentModel.bounds, {
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    });
    this.applyViewport();
    return this.currentCamera;
  }

  resetCamera() {
    if (!this.currentModel) {
      return null;
    }

    this.currentCamera = centerCameraOnPoint(
      this.currentModel.hub.position,
      {
        width: this.app.renderer.width,
        height: this.app.renderer.height,
      },
      DEFAULT_ZOOM,
    );
    this.applyViewport();
    return this.currentCamera;
  }

  centerOnPoint(point: GamePoint, zoom = this.currentCamera?.zoom ?? DEFAULT_ZOOM) {
    this.currentCamera = centerCameraOnPoint(
      point,
      {
        width: this.app.renderer.width,
        height: this.app.renderer.height,
      },
      zoom,
      { clamp: false },
    );
    this.applyViewport();
    return this.currentCamera;
  }

  zoomAtScreenPoint(screenPoint: GamePoint, scaleDelta: number) {
    if (!this.currentCamera) {
      return null;
    }

    const nextCamera = zoomCameraAtScreenPoint(this.currentCamera, screenPoint, scaleDelta);
    if (nextCamera.zoom === this.currentCamera.zoom) {
      return this.currentCamera;
    }

    this.currentCamera = nextCamera;
    this.applyViewport();
    return this.currentCamera;
  }

  panByScreenDelta(delta: GamePoint) {
    if (!this.currentCamera) {
      return null;
    }

    this.currentCamera = panCameraByScreenDelta(this.currentCamera, delta);
    this.applyViewport();
    return this.currentCamera;
  }

  getViewportCamera() {
    return this.currentCamera;
  }

  destroy() {
    this.app.ticker.remove(this.handleTick);
    this.app.stage.off('pointerdown', this.handleBackdropPointerDown);
    this.backdrop.off('pointerdown', this.handleBackdropPointerDown);
    this.app.stage.off('pointermove', this.handlePointerMove);
    this.app.stage.off('pointerup', this.handlePointerUp);
    this.app.stage.off('pointerupoutside', this.handlePointerUp);
    this.app.stage.off('pointerleave', this.handlePointerCancel);
    this.root.destroy({ children: true });
  }

  private applyViewport() {
    if (!this.currentCamera) {
      return;
    }

    this.mapLayer.setViewport(this.currentCamera);
    this.effectsLayer.setViewport(this.currentCamera);
    this.heroLayer.setViewport(this.currentCamera);
    this.onViewportChange?.(this.currentCamera);
  }

  private updateBackdropCursor() {
    if (this.nodeDragInteraction || this.backgroundInteraction?.moved) {
      this.backdrop.cursor = PANNING_CURSOR;
      return;
    }

    this.backdrop.cursor = this.currentCallbacks?.createMode ? CREATE_CURSOR : PAN_CURSOR;
  }

  private resetNodePreview(nodeId: number) {
    if (!this.currentModel) {
      return;
    }

    this.mapLayer.clearNodePreview(nodeId);
    this.mapLayer.restoreNodeFromModel(nodeId);
  }

  private handleTick = (ticker: { deltaTime: number }) => {
    this.mapLayer.tick(ticker.deltaTime);
    this.heroLayer.tick(ticker.deltaTime);
    if (this.currentCamera) {
      this.heroLayer.setViewport(this.currentCamera);
    }
  };

  private handleBackdropPointerDown = (event: FederatedPointerEvent) => {
    if (event.button !== 0 || this.nodeDragInteraction) {
      return;
    }

    const point = { x: event.global.x, y: event.global.y };
    if (this.backgroundInteraction?.pointerId === event.pointerId) {
      return;
    }

    this.backgroundInteraction = {
      pointerId: event.pointerId,
      startScreen: point,
      lastScreen: point,
      moved: false,
    };
    this.updateBackdropCursor();
  };

  private handleNodePointerDown = (nodeId: number, event: FederatedPointerEvent) => {
    if (
      event.button !== 0 ||
      !this.currentCamera ||
      !this.currentModel ||
      this.currentCallbacks?.canDragNodes === false
    ) {
      return;
    }

    const node = this.currentModel.nodes.find((item) => item.id === nodeId);
    if (!node) {
      return;
    }

    const point = { x: event.global.x, y: event.global.y };
    const worldPoint = screenToWorld(point, this.currentCamera);
    this.nodeDragInteraction = {
      nodeId,
      pointerId: event.pointerId,
      startScreen: point,
      lastScreen: point,
      moved: false,
      startWorld: worldPoint,
      nodeStartPosition: { ...node.position },
    };
    this.updateBackdropCursor();
  };

  private handleEdgePointerDown = (edgeId: number) => {
    this.currentCallbacks?.onEdgeSelect?.(edgeId);
  };

  private handlePointerMove = (event: FederatedPointerEvent) => {
    this.updateConnectPreview({ x: event.global.x, y: event.global.y });

    if (this.nodeDragInteraction && event.pointerId === this.nodeDragInteraction.pointerId) {
      this.handleNodeDragMove(event);
      return;
    }

    if (this.backgroundInteraction && event.pointerId === this.backgroundInteraction.pointerId) {
      this.handleBackgroundMove(event);
    }
  };

  private handleNodeDragMove(event: FederatedPointerEvent) {
    if (!this.nodeDragInteraction || !this.currentCamera || !this.currentModel) {
      return;
    }

    const nextPoint = { x: event.global.x, y: event.global.y };
    const distance = Math.hypot(
      nextPoint.x - this.nodeDragInteraction.startScreen.x,
      nextPoint.y - this.nodeDragInteraction.startScreen.y,
    );

    if (!this.nodeDragInteraction.moved && distance >= POINTER_THRESHOLD) {
      this.nodeDragInteraction.moved = true;
    }

    this.nodeDragInteraction.lastScreen = nextPoint;

    if (!this.nodeDragInteraction.moved) {
      return;
    }

    const worldPoint = screenToWorld(nextPoint, this.currentCamera);
    const previewPosition = {
      x: this.nodeDragInteraction.nodeStartPosition.x + (worldPoint.x - this.nodeDragInteraction.startWorld.x),
      y: this.nodeDragInteraction.nodeStartPosition.y + (worldPoint.y - this.nodeDragInteraction.startWorld.y),
    };
    this.mapLayer.previewNodePosition(
      this.nodeDragInteraction.nodeId,
      snapPointToGrid(previewPosition, this.currentCallbacks?.snapToGrid ?? false),
      this.currentModel,
    );
    this.updateBackdropCursor();
  }

  private handleBackgroundMove(event: FederatedPointerEvent) {
    if (!this.backgroundInteraction) {
      return;
    }

    const nextPoint = { x: event.global.x, y: event.global.y };
    const distance = Math.hypot(
      nextPoint.x - this.backgroundInteraction.startScreen.x,
      nextPoint.y - this.backgroundInteraction.startScreen.y,
    );

    if (!this.backgroundInteraction.moved && distance >= POINTER_THRESHOLD) {
      this.backgroundInteraction.moved = true;
    }

    if (this.backgroundInteraction.moved) {
      const delta = {
        x: nextPoint.x - this.backgroundInteraction.lastScreen.x,
        y: nextPoint.y - this.backgroundInteraction.lastScreen.y,
      };
      this.panByScreenDelta(delta);
      this.updateBackdropCursor();
    }

    this.backgroundInteraction.lastScreen = nextPoint;
  }

  private handlePointerUp = (event: FederatedPointerEvent) => {
    if (this.nodeDragInteraction && event.pointerId === this.nodeDragInteraction.pointerId) {
      this.finishNodeInteraction(event);
      return;
    }

    if (this.backgroundInteraction && event.pointerId === this.backgroundInteraction.pointerId) {
      this.finishBackgroundInteraction(event);
    }
  };

  private handlePointerCancel = () => {
    if (this.nodeDragInteraction) {
      this.resetNodePreview(this.nodeDragInteraction.nodeId);
    }

    this.backgroundInteraction = null;
    this.nodeDragInteraction = null;
    this.connectPreviewTarget = null;
    this.updateBackdropCursor();
    this.mapLayer.setConnectPreview(
      this.currentCallbacks?.connectSourceNodeId ?? null,
      null,
      this.currentCallbacks?.connectEdgeType ?? null,
    );
  };

  private finishNodeInteraction(event: FederatedPointerEvent) {
    if (!this.nodeDragInteraction || !this.currentCallbacks) {
      return;
    }

    const interaction = this.nodeDragInteraction;
    this.nodeDragInteraction = null;

    if (!interaction.moved) {
      this.currentCallbacks.onNodeSelect(interaction.nodeId);
      this.updateBackdropCursor();
      return;
    }

    if (!this.currentCamera) {
      this.resetNodePreview(interaction.nodeId);
      this.updateBackdropCursor();
      return;
    }

    const worldPoint = screenToWorld({ x: event.global.x, y: event.global.y }, this.currentCamera);
    const nextPosition = {
      x: interaction.nodeStartPosition.x + (worldPoint.x - interaction.startWorld.x),
      y: interaction.nodeStartPosition.y + (worldPoint.y - interaction.startWorld.y),
    };
    this.currentCallbacks.onNodeMove?.(
      interaction.nodeId,
      snapPointToGrid(nextPosition, this.currentCallbacks.snapToGrid ?? false),
    );
    this.updateBackdropCursor();
  }

  private finishBackgroundInteraction(event: FederatedPointerEvent) {
    if (!this.backgroundInteraction) {
      return;
    }

    const interaction = this.backgroundInteraction;
    this.backgroundInteraction = null;

    if (
      !interaction.moved &&
      this.currentCallbacks?.connectSourceNodeId &&
      this.currentModel &&
      this.currentCamera
    ) {
      const worldPoint = screenToWorld({ x: event.global.x, y: event.global.y }, this.currentCamera);
      const nearestNode = this.currentModel.nodes
        .filter((node) => node.id !== this.currentCallbacks?.connectSourceNodeId)
        .map((node) => ({
          node,
          distance: Math.hypot(node.position.x - worldPoint.x, node.position.y - worldPoint.y),
        }))
        .sort((left, right) => left.distance - right.distance)[0];

      if (nearestNode && nearestNode.distance <= CONNECT_NODE_HIT_RADIUS) {
        this.currentCallbacks.onNodeSelect(nearestNode.node.id);
        this.updateBackdropCursor();
        return;
      }
    }

    if (
      !interaction.moved &&
      this.currentCallbacks?.createMode &&
      this.currentCallbacks.onCreateNodeAt &&
      this.currentCamera
    ) {
      const worldPoint = screenToWorld({ x: event.global.x, y: event.global.y }, this.currentCamera);
      this.currentCallbacks.onCreateNodeAt(
        snapPointToGrid(worldPoint, this.currentCallbacks.snapToGrid ?? false),
      );
    }

    this.updateBackdropCursor();
  }

  private updateConnectPreview(screenPoint: GamePoint) {
    if (
      !this.currentCamera ||
      !this.currentCallbacks?.connectSourceNodeId ||
      !this.currentCallbacks.connectEdgeType ||
      this.backgroundInteraction?.moved ||
      this.nodeDragInteraction
    ) {
      if (this.connectPreviewTarget != null) {
        this.connectPreviewTarget = null;
        this.mapLayer.setConnectPreview(
          this.currentCallbacks?.connectSourceNodeId ?? null,
          null,
          this.currentCallbacks?.connectEdgeType ?? null,
        );
      }
      return;
    }

    this.connectPreviewTarget = screenToWorld(screenPoint, this.currentCamera);
    this.mapLayer.setConnectPreview(
      this.currentCallbacks.connectSourceNodeId ?? null,
      this.connectPreviewTarget,
      this.currentCallbacks.connectEdgeType ?? null,
    );
  }
}
