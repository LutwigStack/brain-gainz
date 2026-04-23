import { Application, Container, Graphics } from 'pixi.js';

import { EffectsLayer } from './layers/effects-layer';
import { HeroLayer } from './layers/hero-layer';
import { MapLayer } from './layers/map-layer';
import type { GameSceneModel } from './types';

export class BrainGainzScene {
  private readonly root = new Container();
  private readonly backdrop = new Graphics();
  private readonly mapLayer = new MapLayer();
  private readonly effectsLayer = new EffectsLayer();
  private readonly heroLayer = new HeroLayer();

  constructor(private readonly app: Application) {
    this.root.addChild(this.backdrop, this.mapLayer, this.effectsLayer, this.heroLayer);
    this.app.stage.addChild(this.root);
    this.app.ticker.add(this.handleTick);
  }

  render(model: GameSceneModel, onNodeSelect: (nodeId: number) => void) {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;

    this.backdrop.clear();
    this.backdrop.rect(0, 0, width, height);
    this.backdrop.fill({ color: 0x08101d, alpha: 1 });

    model.biomes.forEach((biome) => {
      this.backdrop.circle(biome.center.x, biome.center.y, biome.radius + 42);
      this.backdrop.fill({ color: biome.color, alpha: 0.16 });
    });

    this.backdrop.circle(model.hub.position.x, model.hub.position.y, 124);
    this.backdrop.fill({ color: 0x1f2937, alpha: 0.45 });

    this.mapLayer.render(model, onNodeSelect);
    this.effectsLayer.render(model, width, height);
    this.heroLayer.render(model);
  }

  resize() {
    this.backdrop.clear();
  }

  destroy() {
    this.app.ticker.remove(this.handleTick);
    this.root.destroy({ children: true });
  }

  private handleTick = (ticker: { deltaTime: number }) => {
    this.mapLayer.tick(ticker.deltaTime);
    this.heroLayer.tick(ticker.deltaTime);
  };
}
