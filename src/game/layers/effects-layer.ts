import { Container, Graphics } from 'pixi.js';

import { expandBoundsForGrid, GRID_MAJOR_STEP, GRID_SIZE } from '../layout-helpers';
import type { GameSceneModel } from '../types';
import type { ViewportCamera } from '../viewport';

export class EffectsLayer extends Container {
  private readonly world = new Container();
  private readonly grid = new Graphics();
  private readonly stars = new Graphics();

  constructor() {
    super();
    this.eventMode = 'none';
    this.world.addChild(this.grid);
    this.addChild(this.stars, this.world);
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

    const gridBounds = expandBoundsForGrid(model.bounds);
    this.grid.clear();

    for (
      let x = Math.floor(gridBounds.minX / GRID_SIZE) * GRID_SIZE;
      x <= gridBounds.maxX;
      x += GRID_SIZE
    ) {
      const isMajor = x % GRID_MAJOR_STEP === 0;
      this.grid.moveTo(x, gridBounds.minY);
      this.grid.lineTo(x, gridBounds.maxY);
      this.grid.stroke({
        width: isMajor ? 1.5 : 1,
        color: isMajor ? 0x243449 : 0x1a2638,
        alpha: isMajor ? 0.34 : 0.18,
      });
    }

    for (
      let y = Math.floor(gridBounds.minY / GRID_SIZE) * GRID_SIZE;
      y <= gridBounds.maxY;
      y += GRID_SIZE
    ) {
      const isMajor = y % GRID_MAJOR_STEP === 0;
      this.grid.moveTo(gridBounds.minX, y);
      this.grid.lineTo(gridBounds.maxX, y);
      this.grid.stroke({
        width: isMajor ? 1.5 : 1,
        color: isMajor ? 0x243449 : 0x1a2638,
        alpha: isMajor ? 0.34 : 0.18,
      });
    }

  }

  setViewport(camera: ViewportCamera) {
    this.world.position.set(camera.x, camera.y);
    this.world.scale.set(camera.zoom);
  }
}
