import { Application, Container, FederatedPointerEvent, Graphics } from 'pixi.js';

import { resolveInteractionCapabilities } from './interaction-capabilities';
import { snapPointToGrid } from './layout-helpers';
import { EffectsLayer } from './layers/effects-layer';
import { HeroLayer } from './layers/hero-layer';
import { getNodeGateAnchor, MapLayer, resolveNodeBox, type ConnectPreviewState, type NodeGate } from './layers/map-layer';
import type { CanvasInteractionMode, GamePoint, GameSceneModel } from './types';
import {
  centerCameraOnPoint,
  DEFAULT_ZOOM,
  panCameraByScreenDelta,
  screenToWorld,
  zoomCameraAtScreenPoint,
  type ViewportCamera,
} from './viewport';

const PAN_CURSOR = 'grab';
const PANNING_CURSOR = 'grabbing';
const CREATE_CURSOR = 'crosshair';
const CONNECT_GATE_HIT_RADIUS = 28;
const POINTER_THRESHOLD = 8;
const NODE_FALLBACK_HIT_PADDING = 16;
const NODE_FALLBACK_GATE_HIT_RADIUS = 10.5;
const MIN_GATE_INTERACTION_ZOOM = 0.24;

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

interface GateDragState extends SceneInteractionState {
  nodeId: number;
  gate: NodeGate;
}

interface SceneCallbacks {
  onNodeSelect: (nodeId: number, input?: { screenX: number; screenY: number }) => void;
  onEdgeSelect?: (edgeId: number) => void;
  onNodeMove?: (nodeId: number, position: GamePoint) => void | Promise<void>;
  onCreateNodeAt?: (position: GamePoint) => void | Promise<boolean>;
  onCreateChildNodeAt?: (input: { parentNodeId: number; position: GamePoint }) => void | Promise<boolean>;
  onCreateEdge?: (input: {
    sourceNodeId: number;
    targetNodeId: number;
    edgeType: 'requires' | 'supports' | 'relates_to';
  }) => void | Promise<boolean>;
  onEdgeContextMenu?: (input: { edgeId: number; screenX: number; screenY: number }) => void;
  interactionMode?: CanvasInteractionMode;
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
  private gateDragInteraction: GateDragState | null = null;
  private connectPreviewTarget: GamePoint | null = null;
  private connectPreviewState: ConnectPreviewState = 'normal';
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
      this.connectPreviewState = 'normal';
    }

    this.backdrop.clear();
    this.backdrop.rect(0, 0, width, height);
    this.backdrop.fill({ color: 0x08101d, alpha: 1 });

    if (!options?.preserveViewport || !this.currentCamera) {
      const initialBounds = callbacks.overviewMode && model.overviewBounds ? model.overviewBounds : model.bounds;
      this.currentCamera = centerCameraOnPoint(initialBounds.center, { width, height }, this.currentCamera?.zoom ?? DEFAULT_ZOOM);
    }

    this.mapLayer.render(model, {
      onNodePointerDown: this.handleNodePointerDown,
      onNodeGatePointerDown: this.handleNodeGatePointerDown,
      onEdgePointerDown: this.handleEdgePointerDown,
      selectedEdgeId: callbacks.selectedEdgeId ?? null,
      connectSourceNodeId: callbacks.connectSourceNodeId ?? null,
      connectSourceGate: 'output',
      connectPreviewTarget: this.connectPreviewTarget,
      connectEdgeType: callbacks.connectEdgeType ?? null,
      connectPreviewState: this.connectPreviewState,
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

    return this.centerOnPoint(this.currentModel.bounds.center, this.currentCamera?.zoom ?? DEFAULT_ZOOM);
  }

  fitToOverview() {
    if (!this.currentModel) {
      return null;
    }

    return this.centerOnPoint(
      (this.currentModel.overviewBounds ?? this.currentModel.bounds).center,
      this.currentCamera?.zoom ?? DEFAULT_ZOOM,
    );
  }

  resetCamera() {
    if (!this.currentModel) {
      return null;
    }

    return this.centerOnPoint(this.currentModel.hub.position, this.currentCamera?.zoom ?? DEFAULT_ZOOM);
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

  ensurePointVisible(point: GamePoint, margin = 120) {
    if (!this.currentCamera) {
      return null;
    }

    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    const screenX = point.x * this.currentCamera.zoom + this.currentCamera.x;
    const screenY = point.y * this.currentCamera.zoom + this.currentCamera.y;
    let nextX = this.currentCamera.x;
    let nextY = this.currentCamera.y;

    if (screenX < margin) {
      nextX += margin - screenX;
    } else if (screenX > width - margin) {
      nextX -= screenX - (width - margin);
    }

    if (screenY < margin) {
      nextY += margin - screenY;
    } else if (screenY > height - margin) {
      nextY -= screenY - (height - margin);
    }

    if (nextX === this.currentCamera.x && nextY === this.currentCamera.y) {
      return this.currentCamera;
    }

    this.currentCamera = {
      ...this.currentCamera,
      x: nextX,
      y: nextY,
    };
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
    if (this.nodeDragInteraction || this.backgroundInteraction?.moved || this.gateDragInteraction) {
      this.backdrop.cursor = this.gateDragInteraction && this.connectPreviewState === 'forbidden' ? 'not-allowed' : PANNING_CURSOR;
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
    if (event.button !== 0 || this.nodeDragInteraction || this.gateDragInteraction) {
      return;
    }

    const point = { x: event.global.x, y: event.global.y };
    const nodeHit = this.findNodeHitAtScreenPoint(point);
    if (nodeHit) {
      event.stopPropagation();
      if (nodeHit.gate) {
        this.handleNodeGatePointerDown(nodeHit.nodeId, nodeHit.gate, event);
      } else {
        this.handleNodePointerDown(nodeHit.nodeId, event);
      }
      return;
    }

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
      !this.currentModel
    ) {
      return;
    }

    const node = this.currentModel.nodes.find((item) => item.id === nodeId);
    if (!node) {
      return;
    }

    const point = { x: event.global.x, y: event.global.y };
    if (!this.getInteractionCapabilities().canDragNodes) {
      this.currentCallbacks.onNodeSelect(nodeId, {
        screenX: point.x,
        screenY: point.y,
      });
      this.updateBackdropCursor();
      return;
    }

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

  private handleNodeGatePointerDown = (nodeId: number, gate: NodeGate, event: FederatedPointerEvent) => {
    if (event.button !== 0 || !this.currentCamera || !this.currentModel) {
      return;
    }

    if (!this.getInteractionCapabilities().canDragGates || !this.canInteractWithGatesAtCurrentZoom()) {
      this.currentCallbacks?.onNodeSelect(nodeId, {
        screenX: event.global.x,
        screenY: event.global.y,
      });
      this.updateBackdropCursor();
      return;
    }

    const point = { x: event.global.x, y: event.global.y };
    this.gateDragInteraction = {
      nodeId,
      gate,
      pointerId: event.pointerId,
      startScreen: point,
      lastScreen: point,
      moved: false,
    };
    this.connectPreviewTarget = screenToWorld(point, this.currentCamera);
    this.connectPreviewState = gate === 'input' ? 'forbidden' : 'normal';
    this.mapLayer.setConnectPreview(nodeId, gate, this.connectPreviewTarget, 'supports', this.connectPreviewState);
    this.updateBackdropCursor();
  };

  private handleEdgePointerDown = (edgeId: number, event: FederatedPointerEvent) => {
    if (event.button === 2) {
      this.currentCallbacks?.onEdgeContextMenu?.({
        edgeId,
        screenX: event.global.x,
        screenY: event.global.y,
      });
      return;
    }

    this.currentCallbacks?.onEdgeSelect?.(edgeId);
  };

  private handlePointerMove = (event: FederatedPointerEvent) => {
    this.updateConnectPreview({ x: event.global.x, y: event.global.y }, event.pointerId);

    if (this.gateDragInteraction && event.pointerId === this.gateDragInteraction.pointerId) {
      this.handleGateDragMove(event);
      return;
    }

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

  private handleGateDragMove(event: FederatedPointerEvent) {
    if (!this.gateDragInteraction) {
      return;
    }

    const nextPoint = { x: event.global.x, y: event.global.y };
    const distance = Math.hypot(
      nextPoint.x - this.gateDragInteraction.startScreen.x,
      nextPoint.y - this.gateDragInteraction.startScreen.y,
    );

    if (!this.gateDragInteraction.moved && distance >= POINTER_THRESHOLD) {
      this.gateDragInteraction.moved = true;
    }

    this.gateDragInteraction.lastScreen = nextPoint;
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
    if (this.gateDragInteraction && event.pointerId === this.gateDragInteraction.pointerId) {
      this.finishGateInteraction(event);
      return;
    }

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
    this.gateDragInteraction = null;
    this.connectPreviewTarget = null;
    this.connectPreviewState = 'normal';
    this.updateBackdropCursor();
    this.mapLayer.setConnectPreview(
      this.currentCallbacks?.connectSourceNodeId ?? null,
      'output',
      null,
      this.currentCallbacks?.connectEdgeType ?? null,
      'normal',
    );
  };

  private async finishGateInteraction(event: FederatedPointerEvent) {
    if (!this.gateDragInteraction || !this.currentCallbacks || !this.currentModel || !this.currentCamera) {
      this.gateDragInteraction = null;
      this.clearConnectPreview();
      this.updateBackdropCursor();
      return;
    }

    const interaction = this.gateDragInteraction;
    this.gateDragInteraction = null;

    if (!interaction.moved) {
      this.currentCallbacks.onNodeSelect(interaction.nodeId, {
        screenX: interaction.lastScreen.x,
        screenY: interaction.lastScreen.y,
      });
      this.clearConnectPreview();
      this.updateBackdropCursor();
      return;
    }

    const target = this.findNearestCompatibleGate(
      screenToWorld({ x: event.global.x, y: event.global.y }, this.currentCamera),
      interaction,
    );
    const capabilities = this.getInteractionCapabilities();

    if (target && capabilities.canCreateEdges && this.currentCallbacks.onCreateEdge) {
      const sourceNodeId = interaction.gate === 'output' ? interaction.nodeId : target.nodeId;
      const targetNodeId = interaction.gate === 'output' ? target.nodeId : interaction.nodeId;
      if (sourceNodeId !== targetNodeId) {
        await this.currentCallbacks.onCreateEdge({
          sourceNodeId,
          targetNodeId,
          edgeType: 'supports',
        });
      }
    } else if (
      interaction.gate === 'output' &&
      capabilities.canCreateChildFromOutput &&
      this.currentCallbacks.onCreateChildNodeAt
    ) {
      await this.currentCallbacks.onCreateChildNodeAt({
        parentNodeId: interaction.nodeId,
        position: screenToWorld({ x: event.global.x, y: event.global.y }, this.currentCamera),
      });
    }

    this.clearConnectPreview();
    this.updateBackdropCursor();
  }

  private finishNodeInteraction(event: FederatedPointerEvent) {
    if (!this.nodeDragInteraction || !this.currentCallbacks) {
      return;
    }

    const interaction = this.nodeDragInteraction;
    this.nodeDragInteraction = null;

    if (!interaction.moved) {
      this.currentCallbacks.onNodeSelect(interaction.nodeId, {
        screenX: interaction.lastScreen.x,
        screenY: interaction.lastScreen.y,
      });
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
    this.currentCallbacks.onNodeSelect(interaction.nodeId);
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
        this.currentCallbacks.onNodeSelect(nearestNode.node.id, {
          screenX: event.global.x,
          screenY: event.global.y,
        });
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

  private updateConnectPreview(screenPoint: GamePoint, pointerId?: number) {
    if (
      !this.currentCamera ||
      !this.gateDragInteraction ||
      (pointerId != null && pointerId !== this.gateDragInteraction.pointerId) ||
      this.backgroundInteraction?.moved ||
      this.nodeDragInteraction
    ) {
      if (this.connectPreviewTarget != null) {
        this.clearConnectPreview();
      }
      return;
    }

    this.connectPreviewTarget = screenToWorld(screenPoint, this.currentCamera);
    const target = this.findNearestCompatibleGate(this.connectPreviewTarget, this.gateDragInteraction);
    this.connectPreviewState =
      target != null ? 'compatible' : this.gateDragInteraction.gate === 'input' ? 'forbidden' : 'normal';
    this.mapLayer.setConnectPreview(
      this.gateDragInteraction.nodeId,
      this.gateDragInteraction.gate,
      this.connectPreviewTarget,
      'supports',
      this.connectPreviewState,
    );
    this.updateBackdropCursor();
  }

  private clearConnectPreview() {
    this.connectPreviewTarget = null;
    this.connectPreviewState = 'normal';
    this.mapLayer.setConnectPreview(null, 'output', null, null, 'normal');
  }

  private findNearestCompatibleGate(worldPoint: GamePoint, interaction: GateDragState) {
    if (!this.currentModel) {
      return null;
    }

    const targetGate: NodeGate = interaction.gate === 'output' ? 'input' : 'output';
    const hitRadius = CONNECT_GATE_HIT_RADIUS / Math.max(this.currentCamera?.zoom ?? 1, 0.2);
    const nearest = this.currentModel.nodes
      .filter((node) => node.id !== interaction.nodeId)
      .map((node) => {
        const anchor = getNodeGateAnchor(node, targetGate, this.currentCallbacks?.overviewMode ?? false);
        return {
          nodeId: node.id,
          gate: targetGate,
          distance: Math.hypot(anchor.x - worldPoint.x, anchor.y - worldPoint.y),
        };
      })
      .sort((left, right) => left.distance - right.distance)[0];

    return nearest && nearest.distance <= hitRadius ? nearest : null;
  }

  private getInteractionCapabilities() {
    return resolveInteractionCapabilities(this.currentCallbacks?.interactionMode);
  }

  private canInteractWithGatesAtCurrentZoom() {
    return (this.currentCallbacks?.overviewMode ?? false) || (this.currentCamera?.zoom ?? 1) >= MIN_GATE_INTERACTION_ZOOM;
  }

  private findNodeHitAtScreenPoint(screenPoint: GamePoint): { nodeId: number; gate: NodeGate | null } | null {
    if (!this.currentCamera || !this.currentModel) {
      return null;
    }

    const worldPoint = screenToWorld(screenPoint, this.currentCamera);
    const overviewMode = this.currentCallbacks?.overviewMode ?? false;
    const gateHitRadius = NODE_FALLBACK_GATE_HIT_RADIUS;
    const nodeHitPadding = Math.max(
      NODE_FALLBACK_HIT_PADDING,
      NODE_FALLBACK_HIT_PADDING / Math.max(this.currentCamera.zoom, 0.2),
    );

    const renderNodes = this.currentModel.nodes
      .filter((node) => !overviewMode || node.isOverviewVisible === true)
      .map((node) => ({
        ...node,
        position: (overviewMode ? node.overviewPosition : null) ?? node.position,
      }))
      .reverse();

    const nodeHit = renderNodes
      .map((node) => {
        const box = resolveNodeBox(node, overviewMode);
        const dx = Math.abs(worldPoint.x - node.position.x);
        const dy = Math.abs(worldPoint.y - node.position.y);
        const hit =
          dx <= box.width / 2 + nodeHitPadding &&
          dy <= box.height / 2 + nodeHitPadding;

        return hit
          ? {
              nodeId: node.id,
              distance: Math.hypot(dx, dy),
            }
          : null;
      })
      .filter((entry): entry is { nodeId: number; distance: number } => entry != null)
      .sort((left, right) => left.distance - right.distance)[0];

    const gateHit =
      this.getInteractionCapabilities().canDragGates && this.canInteractWithGatesAtCurrentZoom()
        ? renderNodes
            .map((node) => {
              const input = getNodeGateAnchor(node, 'input', overviewMode);
              const output = getNodeGateAnchor(node, 'output', overviewMode);
              const inputDistance = Math.hypot(worldPoint.x - input.x, worldPoint.y - input.y);
              const outputDistance = Math.hypot(worldPoint.x - output.x, worldPoint.y - output.y);
              const nearest =
                inputDistance <= outputDistance
                  ? { gate: 'input' as const, distance: inputDistance }
                  : { gate: 'output' as const, distance: outputDistance };

              return nearest.distance <= gateHitRadius
                ? {
                    nodeId: node.id,
                    gate: nearest.gate,
                    distance: nearest.distance,
                  }
                : null;
            })
            .filter((entry): entry is { nodeId: number; gate: NodeGate; distance: number } => entry != null)
            .sort((left, right) => left.distance - right.distance)[0]
        : null;

    if (gateHit) {
      return {
        nodeId: gateHit.nodeId,
        gate: gateHit.gate,
      };
    }

    return nodeHit
      ? {
          nodeId: nodeHit.nodeId,
          gate: null,
        }
      : null;
  }
}
