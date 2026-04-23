import { Container, Graphics, Text } from 'pixi.js';

import type { GameBiome, GameNode, GameSceneModel } from '../types';

const statePalette = {
  locked: { fill: 0x111827, stroke: 0x475569, text: 0xcbd5e1, alpha: 0.55 },
  available: { fill: 0x123f43, stroke: 0x5eead4, text: 0xe6fffb, alpha: 0.9 },
  active: { fill: 0x1d4ed8, stroke: 0x93c5fd, text: 0xf8fbff, alpha: 1 },
  completed: { fill: 0x365314, stroke: 0xb9fbc0, text: 0xf7fee7, alpha: 0.92 },
  paused: { fill: 0x7c2d12, stroke: 0xfdba74, text: 0xffedd5, alpha: 0.84 },
} as const;

export class MapLayer extends Container {
  private readonly biomeGraphics = new Graphics();
  private readonly linkGraphics = new Graphics();
  private readonly edgeGraphics = new Graphics();
  private readonly hubGraphics = new Graphics();
  private readonly legendGraphics = new Graphics();
  private readonly legendLabels = new Container();
  private readonly biomeLabels = new Container();
  private readonly nodeContainer = new Container();
  private readonly pulses = new Map<number, Graphics>();
  private readonly nodeShells = new Map<number, Graphics>();
  private readonly nodeLabels = new Map<number, Text>();
  private readonly biomeTexts = new Map<number, Text>();
  private readonly legendTexts = new Map<string, Text>();
  private highlightedNodeId: number | null = null;
  private pulseTime = 0;

  constructor() {
    super();
    this.addChild(
      this.biomeGraphics,
      this.linkGraphics,
      this.edgeGraphics,
      this.hubGraphics,
      this.biomeLabels,
      this.nodeContainer,
      this.legendGraphics,
      this.legendLabels,
    );
  }

  render(model: GameSceneModel, onNodeSelect: (nodeId: number) => void) {
    this.highlightedNodeId = model.highlightedNodeId;
    this.drawBiomes(model.biomes);
    this.drawHub(model);
    this.drawEdges(model);
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
        shell.eventMode = 'static';
        shell.cursor = 'pointer';
        shell.on('pointertap', () => onNodeSelect(node.id));
        this.nodeShells.set(node.id, shell);
        this.pulses.set(node.id, pulse);
        this.nodeLabels.set(node.id, label);
        this.nodeContainer.addChild(pulse, shell, label);
      }

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

  private drawEdges(model: GameSceneModel) {
    this.edgeGraphics.clear();
    this.edgeGraphics.setStrokeStyle({ width: 2, color: 0x94a3b8, alpha: 0.25 });

    model.edges.forEach((edge) => {
      const fromNode = model.nodes.find((node) => node.id === edge.fromNodeId);
      const toNode = model.nodes.find((node) => node.id === edge.toNodeId);

      if (!fromNode || !toNode) {
        return;
      }

      this.edgeGraphics.moveTo(fromNode.position.x, fromNode.position.y);
      this.edgeGraphics.lineTo(toNode.position.x, toNode.position.y);
    });
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

    pulse.clear();
    pulse.circle(0, 0, radius + 12);
    pulse.fill({ color: biome?.accent ?? 0x60a5fa, alpha: 0.18 });
    pulse.position.set(node.position.x, node.position.y);

    shell.clear();
    shell.circle(0, 0, radius);
    shell.fill({ color: palette.fill, alpha: palette.alpha });
    shell.circle(0, 0, radius + 3);
    shell.stroke({
      color: node.id === this.highlightedNodeId ? biome?.accent ?? palette.stroke : palette.stroke,
      width: node.id === this.highlightedNodeId ? 4 : 2,
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
  }
}
