import { Container, Graphics } from 'pixi.js';

import type { GameSceneModel } from '../types';

export class EffectsLayer extends Container {
  private readonly fog = new Graphics();
  private readonly stars = new Graphics();
  private readonly aura = new Graphics();

  constructor() {
    super();
    this.addChild(this.stars, this.aura, this.fog);
  }

  render(model: GameSceneModel, width: number, height: number) {
    this.stars.clear();
    for (let index = 0; index < 56; index += 1) {
      const x = (index * 137) % width;
      const y = (index * 83) % height;
      const radius = index % 5 === 0 ? 2 : 1;
      this.stars.circle(x, y, radius);
      this.stars.fill({ color: 0x93c5fd, alpha: index % 3 === 0 ? 0.28 : 0.14 });
    }

    this.aura.clear();
    model.biomes.forEach((biome) => {
      this.aura.circle(biome.center.x, biome.center.y, biome.radius + 28);
      this.aura.fill({ color: biome.accent, alpha: 0.08 });
    });

    this.aura.circle(model.hub.position.x, model.hub.position.y, 74);
    this.aura.fill({ color: 0xfbbf24, alpha: 0.12 });

    this.fog.clear();
    this.fog.rect(0, 0, width, height);
    this.fog.fill({ color: 0x020617, alpha: 0.18 });

    model.nodes
      .filter((node) => node.state !== 'locked')
      .forEach((node) => {
        this.fog.circle(node.position.x, node.position.y, 72);
        this.fog.cut();
      });

    this.fog.circle(model.hub.position.x, model.hub.position.y, 96);
    this.fog.cut();
  }
}
