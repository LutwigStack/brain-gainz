import { Container, FederatedPointerEvent, Graphics, Rectangle, Text } from 'pixi.js';

import { getGraphEdgeSemantics } from '../../application/graph-edge-semantics';
import type { GameNode, GamePoint, GameSceneModel } from '../types';
import type { ViewportCamera } from '../viewport';

const statePalette = {
  locked: { fill: 0x111827, stroke: 0x475569, text: 0xcbd5e1, alpha: 0.55 },
  available: { fill: 0x123f43, stroke: 0x5eead4, text: 0xe6fffb, alpha: 0.9 },
  active: { fill: 0x1d4ed8, stroke: 0x93c5fd, text: 0xf8fbff, alpha: 1 },
  completed: { fill: 0x365314, stroke: 0xb9fbc0, text: 0xf7fee7, alpha: 0.92 },
  paused: { fill: 0x7c2d12, stroke: 0xfdba74, text: 0xffedd5, alpha: 0.84 },
} as const;

const NODE_BOX = {
  minWidth: 150,
  maxWidth: 320,
  height: 42,
  maxHeight: 82,
  radius: 8,
};

const OVERVIEW_NODE_BOX = {
  minWidth: 300,
  maxWidth: 460,
  height: 64,
  maxHeight: 104,
  radius: 8,
};

const NODE_GATE = {
  radius: 5.5,
  overviewRadius: 7,
  rim: 2,
  inset: 1,
};
const NODE_HIT_PADDING = 16;

interface MapLayerHandlers {
  onNodePointerDown?: (nodeId: number, event: FederatedPointerEvent) => void;
  onNodeGatePointerDown?: (nodeId: number, gate: NodeGate, event: FederatedPointerEvent) => void;
  onEdgePointerDown?: (edgeId: number, event: FederatedPointerEvent) => void;
  selectedEdgeId?: number | null;
  connectSourceNodeId?: number | null;
  connectSourceGate?: NodeGate;
  connectPreviewTarget?: GamePoint | null;
  connectEdgeType?: 'requires' | 'supports' | 'relates_to' | null;
  overviewMode?: boolean;
}

export type NodeGate = 'input' | 'output';

const createQuadraticRoute = (
  from: GamePoint,
  to: GamePoint,
  bendDirection: number,
  bendStrength: number,
) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const midpoint = { x: from.x + dx / 2, y: from.y + dy / 2 };
  const perpendicular = { x: -dy / distance, y: dx / distance };
  const clampedBend = Math.min(42, Math.max(12, distance * bendStrength)) * bendDirection;
  const control = {
    x: midpoint.x + perpendicular.x * clampedBend,
    y: midpoint.y + perpendicular.y * clampedBend,
  };

  return Array.from({ length: 15 }, (_, index) => {
    const t = index / 14;
    const inverse = 1 - t;
    return {
      x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
      y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
    };
  });
};

const drawPolyline = (graphic: Graphics, points: GamePoint[]) => {
  if (points.length === 0) {
    return;
  }

  graphic.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => {
    graphic.lineTo(point.x, point.y);
  });
};

const drawDottedPolyline = (
  graphic: Graphics,
  points: GamePoint[],
  color: number,
  alpha: number,
  dotRadius: number,
  spacing: number,
) => {
  if (points.length === 0) {
    return;
  }

  let previous = points[0];
  let carry = 0;

  graphic.circle(previous.x, previous.y, dotRadius);
  graphic.fill({ color, alpha });

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const segmentLength = Math.hypot(dx, dy);

    if (segmentLength === 0) {
      previous = current;
      continue;
    }

    let distance = carry === 0 ? spacing : spacing - carry;

    while (distance <= segmentLength) {
      const ratio = distance / segmentLength;
      graphic.circle(previous.x + dx * ratio, previous.y + dy * ratio, dotRadius);
      graphic.fill({ color, alpha });
      distance += spacing;
    }

    carry = (segmentLength + carry) % spacing;
    previous = current;
  }
};

const drawArrowHead = (
  graphic: Graphics,
  from: GamePoint,
  to: GamePoint,
  color: number,
  alpha: number,
  size: number,
) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / distance, y: dy / distance };
  const perpendicular = { x: -unit.y, y: unit.x };
  const base = {
    x: to.x - unit.x * size,
    y: to.y - unit.y * size,
  };

  graphic.poly([
    to.x,
    to.y,
    base.x + perpendicular.x * (size * 0.45),
    base.y + perpendicular.y * (size * 0.45),
    base.x - perpendicular.x * (size * 0.45),
    base.y - perpendicular.y * (size * 0.45),
  ]);
  graphic.fill({ color, alpha });
};

export const resolveNodeBox = (node: GameNode, overviewMode = false) => {
  const box = overviewMode ? OVERVIEW_NODE_BOX : NODE_BOX;
  const charWidth = overviewMode ? 8.2 : 6.2;
  const lineLength = overviewMode ? 34 : 30;
  const lineHeight = overviewMode ? 18 : 14;
  const width = Math.min(
    box.maxWidth,
    Math.max(box.minWidth, 74 + node.title.length * charWidth),
  );
  const estimatedLines = Math.ceil(node.title.length / lineLength) + (overviewMode && (node.descendantCount ?? 0) > 0 ? 1 : 0);
  const height = Math.min(box.maxHeight, Math.max(box.height, 28 + estimatedLines * lineHeight));

  return { width, height };
};

export const getNodeGateAnchor = (
  node: GameNode,
  gate: NodeGate,
  overviewMode = false,
): GamePoint => {
  const box = resolveNodeBox(node, overviewMode);
  const radius = overviewMode ? NODE_GATE.overviewRadius : NODE_GATE.radius;
  const offset = box.width / 2 + radius - NODE_GATE.inset;

  return {
    x: node.position.x + (gate === 'output' ? offset : -offset),
    y: node.position.y,
  };
};

export class MapLayer extends Container {
  private readonly world = new Container();
  private readonly edgeGraphics = new Graphics();
  private readonly edgeHitContainer = new Container();
  private readonly edgePreviewGraphics = new Graphics();
  private readonly legendGraphics = new Graphics();
  private readonly legendLabels = new Container();
  private readonly nodeContainer = new Container();
  private readonly pulses = new Map<number, Graphics>();
  private readonly nodeShells = new Map<number, Graphics>();
  private readonly nodeLabels = new Map<number, Text>();
  private readonly edgeHits = new Map<number, Graphics>();
  private readonly legendTexts = new Map<string, Text>();
  private readonly previewNodePositions = new Map<number, GamePoint>();
  private currentModel: GameSceneModel | null = null;
  private currentZoom = 1;
  private highlightedNodeId: number | null = null;
  private connectSourceNodeId: number | null = null;
  private connectSourceGate: NodeGate = 'output';
  private connectPreviewTarget: GamePoint | null = null;
  private connectEdgeType: 'requires' | 'supports' | 'relates_to' | null = null;
  private overviewMode = false;
  private lastHandlers: MapLayerHandlers = {};
  private pulseTime = 0;

  constructor() {
    super();
    this.world.addChild(
      this.edgeGraphics,
      this.edgeHitContainer,
      this.edgePreviewGraphics,
      this.nodeContainer,
    );
    this.addChild(this.world, this.legendGraphics, this.legendLabels);
  }

  render(model: GameSceneModel, handlers: MapLayerHandlers = {}) {
    this.previewNodePositions.clear();
    this.currentModel = model;
    this.lastHandlers = handlers;
    this.highlightedNodeId = model.highlightedNodeId;
    this.connectSourceNodeId = handlers.connectSourceNodeId ?? null;
    this.connectSourceGate = handlers.connectSourceGate ?? 'output';
    this.connectPreviewTarget = handlers.connectPreviewTarget ?? null;
    this.connectEdgeType = handlers.connectEdgeType ?? null;
    this.overviewMode = handlers.overviewMode ?? false;
    this.drawEdges(model, handlers);
    this.drawConnectPreview();
    this.drawLegend();

    const activeIds = new Set(
      model.nodes
        .filter((node) => this.shouldRenderNode(node))
        .map((node) => node.id),
    );

    model.nodes.filter((node) => this.shouldRenderNode(node)).forEach((node) => {
      const shell = this.nodeShells.get(node.id) ?? new Graphics();
      const pulse = this.pulses.get(node.id) ?? new Graphics();
      const label =
        this.nodeLabels.get(node.id) ??
        new Text({
          text: '',
          style: {
            fontFamily: 'Trebuchet MS',
            fontSize: 11,
            fontWeight: '700',
            fill: 0xffffff,
          },
        });

      if (!this.nodeShells.has(node.id)) {
        this.nodeShells.set(node.id, shell);
        this.pulses.set(node.id, pulse);
        this.nodeLabels.set(node.id, label);
        this.nodeContainer.addChild(pulse, shell, label);
      }

      pulse.eventMode = 'none';
      label.eventMode = 'none';
      shell.eventMode = 'static';
      shell.cursor = 'pointer';
      shell.removeAllListeners();
      shell.on('pointerdown', (event) => {
        const gate = this.resolvePointerGate(this.withRenderPosition(node), event);
        if (gate) {
          event.stopPropagation();
          handlers.onNodeGatePointerDown?.(node.id, gate, event);
          return;
        }

        event.stopPropagation();
        handlers.onNodePointerDown?.(node.id, event);
      });

      this.drawNode(this.withRenderPosition(node), shell, pulse, label, model);
    });

    [...this.nodeShells.keys()].forEach((nodeId) => {
      if (activeIds.has(nodeId)) {
        return;
      }

      this.nodeShells.get(nodeId)?.destroy();
      this.pulses.get(nodeId)?.destroy();
      this.nodeLabels.get(nodeId)?.destroy();
      this.nodeShells.delete(nodeId);
      this.pulses.delete(nodeId);
      this.nodeLabels.delete(nodeId);
    });

    this.refreshLabelVisibility();
  }

  previewNodePosition(nodeId: number, position: GamePoint, model: GameSceneModel) {
    const node = model.nodes.find((item) => item.id === nodeId);
    const shell = this.nodeShells.get(nodeId);
    const pulse = this.pulses.get(nodeId);
    const label = this.nodeLabels.get(nodeId);

    if (!node || !shell || !pulse || !label) {
      return;
    }

    this.previewNodePositions.set(nodeId, position);
    this.drawEdges(model, this.lastHandlers);
    this.drawConnectPreview();

    this.drawNode(
      {
        ...node,
        position,
      },
      shell,
      pulse,
      label,
      model,
    );
  }

  tick(deltaTime: number) {
    this.pulseTime += deltaTime * 0.025;

    this.pulses.forEach((pulse, nodeId) => {
      pulse.visible = nodeId === this.highlightedNodeId;
      if (!pulse.visible) {
        return;
      }

      const scale = 1 + Math.sin(this.pulseTime) * 0.1;
      pulse.scale.set(scale);
      pulse.alpha = 0.24 + (Math.sin(this.pulseTime) + 1) * 0.08;
    });
  }

  setViewport(camera: ViewportCamera) {
    this.currentZoom = camera.zoom;
    this.world.position.set(camera.x, camera.y);
    this.world.scale.set(camera.zoom);
    this.refreshLabelVisibility();
  }

  setConnectPreview(
    sourceNodeId: number | null,
    sourceGate: NodeGate,
    target: GamePoint | null,
    edgeType: 'requires' | 'supports' | 'relates_to' | null,
  ) {
    this.connectSourceNodeId = sourceNodeId;
    this.connectSourceGate = sourceGate;
    this.connectPreviewTarget = target;
    this.connectEdgeType = edgeType;
    this.drawConnectPreview();
  }

  clearNodePreview(nodeId: number) {
    if (!this.previewNodePositions.delete(nodeId) || !this.currentModel) {
      return;
    }

    this.drawEdges(this.currentModel, this.lastHandlers);
    this.drawConnectPreview();
  }

  restoreNodeFromModel(nodeId: number) {
    if (!this.currentModel) {
      return;
    }

    const node = this.currentModel.nodes.find((item) => item.id === nodeId);
    const shell = this.nodeShells.get(nodeId);
    const pulse = this.pulses.get(nodeId);
    const label = this.nodeLabels.get(nodeId);

    if (!node || !shell || !pulse || !label) {
      return;
    }

    this.drawNode(this.withRenderPosition(node), shell, pulse, label, this.currentModel);
  }

  private drawEdges(model: GameSceneModel, handlers: MapLayerHandlers) {
    this.edgeGraphics.clear();
    const nodeById = new Map(
      model.nodes
        .filter((node) => this.shouldRenderNode(node))
        .map((node) => [
          node.id,
          {
            ...node,
            position: this.getRenderPosition(node),
          },
        ]),
    );
    const activeEdgeIds = new Set<number>();
    const isLargeGraphDetail = !this.overviewMode && model.nodes.length >= 40;

    model.edges.forEach((edge) => {
      const fromNode = nodeById.get(edge.fromNodeId);
      const toNode = nodeById.get(edge.toNodeId);

      if (!fromNode || !toNode) {
        return;
      }

      activeEdgeIds.add(edge.id);
      const isSelected = edge.id === handlers.selectedEdgeId;
      const isSelectedPathEdge = Boolean(fromNode.isOnSelectedPath && toNode.isOnSelectedPath);
      const isOverviewPrimaryEdge =
        this.overviewMode &&
        edge.type !== 'relates_to' &&
        ((fromNode.hierarchyDepth === 0 && toNode.hierarchyDepth === 1) || isSelectedPathEdge);
      const isFocusEdge = !this.overviewMode && Boolean(handlers.selectedEdgeId) && isSelected;
      const semantics = getGraphEdgeSemantics(edge.type);
      const color = semantics.canvas.color;
      const baseEdgeAlpha =
        isLargeGraphDetail && !isFocusEdge ? Math.min(semantics.canvas.alpha, 0.18) : semantics.canvas.alpha;
      const baseEdgeWidth =
        isLargeGraphDetail && !isFocusEdge ? Math.min(semantics.canvas.width, 1.1) : semantics.canvas.width;
      const shouldDrawGlow = semantics.canvas.pattern === 'glow' && (!isLargeGraphDetail || isFocusEdge);
      const alpha = this.overviewMode
        ? isSelectedPathEdge
          ? 0.9
          : isOverviewPrimaryEdge
            ? 0.58
            : 0.18
        : isFocusEdge
          ? semantics.canvas.selectedAlpha
          : baseEdgeAlpha;
      const fromAnchor = getNodeGateAnchor(fromNode, 'output', this.overviewMode);
      const toAnchor = getNodeGateAnchor(toNode, 'input', this.overviewMode);
      const route = createQuadraticRoute(
        fromAnchor,
        toAnchor,
        edge.fromNodeId <= edge.toNodeId ? 1 : -1,
        semantics.canvas.bendStrength,
      );

      if (shouldDrawGlow) {
        this.edgeGraphics.setStrokeStyle({
          width:
            (isFocusEdge || (this.overviewMode && isSelectedPathEdge)
              ? semantics.canvas.selectedWidth
              : baseEdgeWidth) + 4,
          color,
          alpha: alpha * 0.18,
        });
        drawPolyline(this.edgeGraphics, route);
      }

      if (semantics.canvas.pattern === 'dotted') {
        drawDottedPolyline(
          this.edgeGraphics,
          route,
          color,
          alpha,
          isSelected ? 2.8 : 2.2,
          isSelected ? 12 : 14,
        );
      } else {
        this.edgeGraphics.setStrokeStyle({
          width: this.overviewMode
            ? isSelectedPathEdge
              ? 4
              : 2.4
            : isFocusEdge
              ? semantics.canvas.selectedWidth
              : baseEdgeWidth,
          color,
          alpha,
        });
        drawPolyline(this.edgeGraphics, route);
      }

      drawArrowHead(
        this.edgeGraphics,
        route[route.length - 2] ?? fromAnchor,
        route[route.length - 1] ?? toAnchor,
        color,
        this.overviewMode ? alpha : isFocusEdge ? 0.92 : isLargeGraphDetail ? 0.42 : 0.72,
        this.overviewMode ? 11 : isFocusEdge ? 14 : isLargeGraphDetail ? 7 : 12,
      );

      const hit =
        this.edgeHits.get(edge.id) ??
        (() => {
          const graphic = new Graphics();
          graphic.eventMode = 'static';
          graphic.cursor = 'pointer';
          this.edgeHits.set(edge.id, graphic);
          this.edgeHitContainer.addChild(graphic);
          return graphic;
        })();

      hit.removeAllListeners();
      hit.on('pointerdown', (event) => {
        event.stopPropagation();
        handlers.onEdgePointerDown?.(edge.id, event);
      });
      hit.clear();
      drawPolyline(hit, route);
      hit.stroke({ width: 14, color, alpha: 0.001 });
    });

    [...this.edgeHits.keys()].forEach((edgeId) => {
      if (activeEdgeIds.has(edgeId)) {
        return;
      }

      this.edgeHits.get(edgeId)?.destroy();
      this.edgeHits.delete(edgeId);
    });
  }

  private drawConnectPreview() {
    this.edgePreviewGraphics.clear();

    if (
      !this.currentModel ||
      this.connectSourceNodeId == null ||
      this.connectPreviewTarget == null ||
      this.connectEdgeType == null
    ) {
      return;
    }

    const source = this.currentModel.nodes.find((node) => node.id === this.connectSourceNodeId);
    if (!source) {
      return;
    }

    const semantics = getGraphEdgeSemantics(this.connectEdgeType);
    const color = semantics.canvas.color;
    const sourcePosition = this.getRenderPosition(source);
    const sourceNode = { ...source, position: sourcePosition };
    const sourceAnchor = getNodeGateAnchor(sourceNode, this.connectSourceGate, this.overviewMode);
    const route = createQuadraticRoute(
      sourceAnchor,
      this.connectPreviewTarget,
      1,
      semantics.canvas.bendStrength,
    );

    if (semantics.canvas.pattern === 'glow') {
      this.edgePreviewGraphics.setStrokeStyle({ width: 7, color, alpha: 0.12 });
      drawPolyline(this.edgePreviewGraphics, route);
    }

    if (semantics.canvas.pattern === 'dotted') {
      drawDottedPolyline(this.edgePreviewGraphics, route, color, 0.72, 2.2, 12);
    } else {
      this.edgePreviewGraphics.setStrokeStyle({ width: 3, color, alpha: 0.68 });
      drawPolyline(this.edgePreviewGraphics, route);
    }
    drawArrowHead(
      this.edgePreviewGraphics,
      route[route.length - 2] ?? sourceAnchor,
      route[route.length - 1] ?? this.connectPreviewTarget,
      color,
      0.9,
      14,
    );
  }

  private drawLegend() {
    this.legendGraphics.clear();
    this.legendLabels.visible = false;
  }

  private drawNode(
    node: GameNode,
    shell: Graphics,
    pulse: Graphics,
    label: Text,
    model: GameSceneModel,
  ) {
    const palette = statePalette[node.state];
    const biome = model.biomes.find((item) => item.id === node.biomeId);
    const box = resolveNodeBox(node, this.overviewMode);
    const radius = this.overviewMode ? OVERVIEW_NODE_BOX.radius : NODE_BOX.radius;
    const isHighlighted = node.id === this.highlightedNodeId;
    const isConnectSource = node.id === this.connectSourceNodeId;
    const borderColor = isHighlighted
      ? biome?.accent ?? palette.stroke
      : isConnectSource
        ? 0xfbbf24
        : palette.stroke;

    pulse.clear();
    pulse.roundRect(
      -box.width / 2 - 10,
      -box.height / 2 - 10,
      box.width + 20,
      box.height + 20,
      radius + 6,
    );
    pulse.fill({ color: biome?.accent ?? 0x60a5fa, alpha: 0.18 });
    pulse.position.set(node.position.x, node.position.y);

    shell.clear();
    shell.hitArea = new Rectangle(
      -box.width / 2 - NODE_HIT_PADDING,
      -box.height / 2 - NODE_HIT_PADDING,
      box.width + NODE_HIT_PADDING * 2,
      box.height + NODE_HIT_PADDING * 2,
    );
    shell.roundRect(
      -box.width / 2 - 5,
      -box.height / 2 - 5,
      box.width + 10,
      box.height + 10,
      radius + 5,
    );
    shell.fill({ color: palette.fill, alpha: 0.001 });
    shell.roundRect(-box.width / 2, -box.height / 2, box.width, box.height, radius);
    shell.fill({ color: palette.fill, alpha: palette.alpha });
    shell.roundRect(
      -box.width / 2 - 1,
      -box.height / 2 - 1,
      box.width + 2,
      box.height + 2,
      radius + 1,
    );
    shell.stroke({
      color: borderColor,
      width: isHighlighted ? 3.5 : isConnectSource ? 3 : 2,
      alpha: 0.96,
    });
    this.drawNodeGate(shell, box, 'input', {
      fill: 0x0b1220,
      stroke: 0x94a3b8,
      alpha: node.state === 'locked' ? 0.56 : 0.9,
      overviewMode: this.overviewMode,
    });
    this.drawNodeGate(shell, box, 'output', {
      fill: borderColor,
      stroke: biome?.accent ?? palette.stroke,
      alpha: node.state === 'locked' ? 0.62 : 1,
      overviewMode: this.overviewMode,
    });
    shell.position.set(node.position.x, node.position.y);

    label.text =
      this.overviewMode && (node.descendantCount ?? 0) > 0
        ? `${node.title}\n${node.descendantCount} узл.`
        : node.title;
    label.style = {
      fontFamily: 'Trebuchet MS',
      fontSize: this.overviewMode ? 16 : node.title.length > 46 ? 9 : 10,
      fontWeight: '700',
      fill: palette.text,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: box.width - 20,
      lineHeight: this.overviewMode ? 19 : undefined,
    };
    label.anchor.set(0.5);
    label.position.set(node.position.x, node.position.y);
    label.alpha = node.state === 'locked' ? 0.72 : 1;
    label.visible = this.shouldShowNodeLabel(node.id);
  }

  private refreshLabelVisibility() {
    if (!this.currentModel) {
      return;
    }

    this.currentModel.nodes.forEach((node) => {
      const label = this.nodeLabels.get(node.id);
      if (!label) {
        return;
      }

      label.visible = this.shouldShowNodeLabel(node.id);
    });
  }

  private drawNodeGate(
    shell: Graphics,
    box: { width: number; height: number },
    gate: NodeGate,
    options: { fill: number; stroke: number; alpha: number; overviewMode: boolean },
  ) {
    const radius = options.overviewMode ? NODE_GATE.overviewRadius : NODE_GATE.radius;
    const x = (gate === 'output' ? 1 : -1) * (box.width / 2 + radius - NODE_GATE.inset);
    const y = 0;

    shell.circle(x, y, radius + NODE_GATE.rim);
    shell.fill({ color: 0x020617, alpha: Math.min(0.92, options.alpha + 0.08) });
    shell.circle(x, y, radius);
    shell.fill({ color: options.fill, alpha: options.alpha });
    shell.circle(x, y, radius);
    shell.stroke({
      color: options.stroke,
      width: options.overviewMode ? 2.5 : 2,
      alpha: options.alpha,
    });
  }

  private resolvePointerGate(node: GameNode, event: FederatedPointerEvent): NodeGate | null {
    const worldPoint = this.world.toLocal(event.global);
    const hitRadius = Math.max(18, 22 / Math.max(this.currentZoom, 0.2));
    const input = getNodeGateAnchor(node, 'input', this.overviewMode);
    const output = getNodeGateAnchor(node, 'output', this.overviewMode);
    const inputDistance = Math.hypot(worldPoint.x - input.x, worldPoint.y - input.y);
    const outputDistance = Math.hypot(worldPoint.x - output.x, worldPoint.y - output.y);
    const nearest = inputDistance <= outputDistance ? { gate: 'input' as const, distance: inputDistance } : { gate: 'output' as const, distance: outputDistance };

    return nearest.distance <= hitRadius ? nearest.gate : null;
  }

  private shouldShowNodeLabel(nodeId: number) {
    return this.overviewMode || this.currentZoom >= 0.34 || nodeId === this.highlightedNodeId || nodeId === this.connectSourceNodeId;
  }

  private shouldRenderNode(node: GameNode) {
    return !this.overviewMode || node.isOverviewVisible === true;
  }

  private getRenderPosition(node: GameNode): GamePoint {
    return (
      this.previewNodePositions.get(node.id) ??
      (this.overviewMode ? node.overviewPosition : null) ??
      node.position
    );
  }

  private withRenderPosition(node: GameNode): GameNode {
    return {
      ...node,
      position: this.getRenderPosition(node),
    };
  }
}
