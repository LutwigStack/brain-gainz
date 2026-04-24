import { Container, FederatedPointerEvent, Graphics, Text } from 'pixi.js';

import { getGraphEdgeSemantics } from '../../application/graph-edge-semantics';
import type { GameBiome, GameNode, GamePoint, GameSceneModel } from '../types';
import type { ViewportCamera } from '../viewport';

const statePalette = {
  locked: { fill: 0x111827, stroke: 0x475569, text: 0xcbd5e1, alpha: 0.55 },
  available: { fill: 0x123f43, stroke: 0x5eead4, text: 0xe6fffb, alpha: 0.9 },
  active: { fill: 0x1d4ed8, stroke: 0x93c5fd, text: 0xf8fbff, alpha: 1 },
  completed: { fill: 0x365314, stroke: 0xb9fbc0, text: 0xf7fee7, alpha: 0.92 },
  paused: { fill: 0x7c2d12, stroke: 0xfdba74, text: 0xffedd5, alpha: 0.84 },
} as const;

interface MapLayerHandlers {
  onNodePointerDown?: (nodeId: number, event: FederatedPointerEvent) => void;
  onEdgePointerDown?: (edgeId: number) => void;
  selectedEdgeId?: number | null;
  connectSourceNodeId?: number | null;
  connectPreviewTarget?: GamePoint | null;
  connectEdgeType?: 'requires' | 'supports' | 'relates_to' | null;
}

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

export class MapLayer extends Container {
  private readonly world = new Container();
  private readonly biomeGraphics = new Graphics();
  private readonly linkGraphics = new Graphics();
  private readonly edgeGraphics = new Graphics();
  private readonly edgeHitContainer = new Container();
  private readonly edgePreviewGraphics = new Graphics();
  private readonly hubGraphics = new Graphics();
  private readonly legendGraphics = new Graphics();
  private readonly legendLabels = new Container();
  private readonly biomeLabels = new Container();
  private readonly nodeContainer = new Container();
  private readonly pulses = new Map<number, Graphics>();
  private readonly nodeShells = new Map<number, Graphics>();
  private readonly nodeLabels = new Map<number, Text>();
  private readonly edgeHits = new Map<number, Graphics>();
  private readonly biomeTexts = new Map<number, Text>();
  private readonly legendTexts = new Map<string, Text>();
  private readonly previewNodePositions = new Map<number, GamePoint>();
  private currentModel: GameSceneModel | null = null;
  private currentZoom = 1;
  private highlightedNodeId: number | null = null;
  private connectSourceNodeId: number | null = null;
  private connectPreviewTarget: GamePoint | null = null;
  private connectEdgeType: 'requires' | 'supports' | 'relates_to' | null = null;
  private lastHandlers: MapLayerHandlers = {};
  private pulseTime = 0;

  constructor() {
    super();
    this.world.addChild(
      this.biomeGraphics,
      this.linkGraphics,
      this.edgeGraphics,
      this.edgeHitContainer,
      this.edgePreviewGraphics,
      this.hubGraphics,
      this.biomeLabels,
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
    this.connectPreviewTarget = handlers.connectPreviewTarget ?? null;
    this.connectEdgeType = handlers.connectEdgeType ?? null;
    this.drawBiomes(model.biomes);
    this.drawHub(model);
    this.drawEdges(model, handlers);
    this.drawConnectPreview();
    this.drawLegend(model);

    const activeIds = new Set(model.nodes.map((node) => node.id));

    model.nodes.forEach((node) => {
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

      shell.eventMode = 'static';
      shell.cursor = 'pointer';
      shell.removeAllListeners();
      shell.on('pointerdown', (event) => {
        event.stopPropagation();
        handlers.onNodePointerDown?.(node.id, event);
      });

      this.drawNode(node, shell, pulse, label, model);
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
    target: GamePoint | null,
    edgeType: 'requires' | 'supports' | 'relates_to' | null,
  ) {
    this.connectSourceNodeId = sourceNodeId;
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

    this.drawNode(node, shell, pulse, label, this.currentModel);
  }

  private drawBiomes(biomes: GameBiome[]) {
    this.biomeGraphics.clear();
    const activeBiomeIds = new Set(biomes.map((biome) => biome.id));

    biomes.forEach((biome) => {
      this.biomeGraphics.circle(biome.center.x, biome.center.y, biome.radius);
      this.biomeGraphics.fill({ color: biome.color, alpha: 0.34 });
      this.biomeGraphics.circle(biome.center.x, biome.center.y, biome.radius - 18);
      this.biomeGraphics.stroke({ color: biome.accent, alpha: 0.28, width: 2 });

      const label =
        this.biomeTexts.get(biome.id) ??
        new Text({
          text: '',
          style: {
            fontFamily: 'Trebuchet MS',
            fontSize: 14,
            fontWeight: '700',
            fill: biome.accent,
          },
        });

      if (!this.biomeTexts.has(biome.id)) {
        this.biomeTexts.set(biome.id, label);
        this.biomeLabels.addChild(label);
      }

      label.text = biome.name.toUpperCase();
      label.anchor.set(0.5);
      label.position.set(biome.center.x, biome.center.y - biome.radius + 20);
    });

    [...this.biomeTexts.keys()].forEach((id) => {
      if (activeBiomeIds.has(id)) {
        return;
      }
      this.biomeTexts.get(id)?.destroy();
      this.biomeTexts.delete(id);
    });
  }

  private drawHub(model: GameSceneModel) {
    this.linkGraphics.clear();
    this.linkGraphics.setStrokeStyle({ width: 3, color: 0xfbbf24, alpha: 0.35 });

    model.biomes.forEach((biome) => {
      this.linkGraphics.moveTo(model.hub.position.x, model.hub.position.y);
      this.linkGraphics.lineTo(biome.center.x, biome.center.y);
    });

    this.hubGraphics.clear();
    this.hubGraphics.star(model.hub.position.x, model.hub.position.y, 8, 34, 16, 0);
    this.hubGraphics.fill({ color: 0x3f2d0d, alpha: 0.96 });
    this.hubGraphics.star(model.hub.position.x, model.hub.position.y, 8, 22, 10, 0);
    this.hubGraphics.fill({ color: 0xfbbf24, alpha: 0.92 });
    this.hubGraphics.circle(model.hub.position.x, model.hub.position.y, 42);
    this.hubGraphics.stroke({ color: 0xfef3c7, alpha: 0.9, width: 3 });
  }

  private drawEdges(model: GameSceneModel, handlers: MapLayerHandlers) {
    this.edgeGraphics.clear();
    const nodePositions = new Map(
      model.nodes.map((node) => [node.id, this.previewNodePositions.get(node.id) ?? node.position]),
    );
    const activeEdgeIds = new Set<number>();

    model.edges.forEach((edge) => {
      const fromNode = nodePositions.get(edge.fromNodeId);
      const toNode = nodePositions.get(edge.toNodeId);

      if (!fromNode || !toNode) {
        return;
      }

      activeEdgeIds.add(edge.id);
      const isSelected = edge.id === handlers.selectedEdgeId;
      const semantics = getGraphEdgeSemantics(edge.type);
      const color = semantics.canvas.color;
      const alpha = isSelected ? semantics.canvas.selectedAlpha : semantics.canvas.alpha;
      const route = createQuadraticRoute(
        fromNode,
        toNode,
        edge.fromNodeId <= edge.toNodeId ? 1 : -1,
        semantics.canvas.bendStrength,
      );

      if (semantics.canvas.pattern === 'glow') {
        this.edgeGraphics.setStrokeStyle({
          width: (isSelected ? semantics.canvas.selectedWidth : semantics.canvas.width) + 4,
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
          width: isSelected ? semantics.canvas.selectedWidth : semantics.canvas.width,
          color,
          alpha,
        });
        drawPolyline(this.edgeGraphics, route);
      }

      drawArrowHead(
        this.edgeGraphics,
        route[route.length - 2] ?? fromNode,
        route[route.length - 1] ?? toNode,
        color,
        isSelected ? 0.92 : 0.72,
        isSelected ? 14 : 12,
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
        handlers.onEdgePointerDown?.(edge.id);
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
    const sourcePosition = this.previewNodePositions.get(source.id) ?? source.position;
    const route = createQuadraticRoute(
      sourcePosition,
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
      route[route.length - 2] ?? sourcePosition,
      route[route.length - 1] ?? this.connectPreviewTarget,
      color,
      0.9,
      14,
    );
  }

  private drawLegend(model: GameSceneModel) {
    this.legendGraphics.clear();
    this.legendGraphics.roundRect(20, 432, 210, 118, 12);
    this.legendGraphics.fill({ color: 0x0b1220, alpha: 0.78 });
    this.legendGraphics.stroke({ color: 0x344157, alpha: 0.9, width: 2 });

    const activeKeys = new Set(model.legend.map((item) => item.state));

    model.legend.forEach((item, index) => {
      this.legendGraphics.circle(42, 462 + index * 18, 5);
      this.legendGraphics.fill({ color: item.color, alpha: 0.95 });

      const label =
        this.legendTexts.get(item.state) ??
        new Text({
          text: '',
          style: {
            fontFamily: 'Trebuchet MS',
            fontSize: 11,
            fontWeight: '700',
            fill: 0xe2e8f0,
          },
        });

      if (!this.legendTexts.has(item.state)) {
        this.legendTexts.set(item.state, label);
        this.legendLabels.addChild(label);
      }

      label.text = `${item.label}  ${item.count}`;
      label.position.set(56, 454 + index * 18);
    });

    [...this.legendTexts.keys()].forEach((key) => {
      if (activeKeys.has(key as typeof model.legend[number]['state'])) {
        return;
      }
      this.legendTexts.get(key)?.destroy();
      this.legendTexts.delete(key);
    });
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
    const radius = node.id === this.highlightedNodeId ? 22 : 18;
    const isConnectSource = node.id === this.connectSourceNodeId;

    pulse.clear();
    pulse.circle(0, 0, radius + 12);
    pulse.fill({ color: biome?.accent ?? 0x60a5fa, alpha: 0.18 });
    pulse.position.set(node.position.x, node.position.y);

    shell.clear();
    shell.circle(0, 0, radius + 14);
    shell.fill({ color: palette.fill, alpha: 0.001 });
    shell.circle(0, 0, radius);
    shell.fill({ color: palette.fill, alpha: palette.alpha });
    shell.circle(0, 0, radius + 3);
    shell.stroke({
      color:
        node.id === this.highlightedNodeId
          ? biome?.accent ?? palette.stroke
          : isConnectSource
            ? 0xfbbf24
            : palette.stroke,
      width: node.id === this.highlightedNodeId ? 4 : isConnectSource ? 3 : 2,
      alpha: 0.96,
    });
    shell.position.set(node.position.x, node.position.y);

    label.text = node.title;
    label.style = {
      fontFamily: 'Trebuchet MS',
      fontSize: 10,
      fontWeight: '700',
      fill: palette.text,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 84,
    };
    label.anchor.set(0.5, 0);
    label.position.set(node.position.x, node.position.y + radius + 10);
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

  private shouldShowNodeLabel(nodeId: number) {
    return this.currentZoom >= 0.62 || nodeId === this.highlightedNodeId || nodeId === this.connectSourceNodeId;
  }
}
