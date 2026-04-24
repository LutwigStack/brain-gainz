import { Container, Graphics } from 'pixi.js';

import type { GameSceneModel } from '../types';
import type { ViewportCamera } from '../viewport';

export class HeroLayer extends Container {
  private readonly body = new Graphics();
  private readonly glow = new Graphics();
  private currentNodeId: number | null = null;
  private bobTime = 0;
  private baseX = 0;
  private baseY = 0;

  constructor() {
    super();
    this.eventMode = 'none';
    this.addChild(this.glow, this.body);
  }

  render(model: GameSceneModel) {
    this.currentNodeId = model.hero.nodeId;

    const heroNode = model.nodes.find((node) => node.id === model.hero.nodeId);
    if (!heroNode) {
      this.visible = false;
      return;
    }

    this.visible = true;
    this.baseX = heroNode.position.x;
    this.baseY = heroNode.position.y - 52;
    this.position.set(this.baseX, this.baseY);

    const energy = model.hero.energy;
    const glowRadius = 18 + energy * 14;

    this.glow.clear();
    this.glow.circle(0, 0, glowRadius);
    this.glow.fill({ color: 0xfef08a, alpha: 0.18 + energy * 0.14 });

    this.body.clear();
    this.body.circle(0, -8, 12);
    this.body.fill({ color: 0xf8fafc, alpha: 0.98 });
    this.body.roundRect(-10, 2, 20, 24, 10);
    this.body.fill({ color: 0x38bdf8, alpha: 0.95 });
    this.body.roundRect(-18, 20, 12, 6, 6);
    this.body.roundRect(6, 20, 12, 6, 6);
    this.body.fill({ color: 0x1d4ed8, alpha: 0.95 });
  }

  tick(deltaTime: number) {
    if (!this.visible) {
      return;
    }

    this.bobTime += deltaTime * 0.06;
    this.position.set(this.baseX, this.baseY + Math.sin(this.bobTime) * 4);
    this.glow.alpha = 0.16 + (Math.sin(this.bobTime) + 1) * 0.05;
  }

  setViewport(camera: ViewportCamera) {
    this.scale.set(camera.zoom);
    this.position.set(
      this.baseX * camera.zoom + camera.x,
      (this.baseY + Math.sin(this.bobTime) * 4) * camera.zoom + camera.y,
    );
  }
}
