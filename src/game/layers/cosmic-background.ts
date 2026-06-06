/**
 * Cosmic background — Epic 47 workstream 01.
 *
 * Renders a deep-space field under the rest of the canvas:
 *   - a 200-300 dot star field, deterministic per program slug
 *
 * The layer is intentionally cheap: every draw call is a single
 * Graphics batch (no per-dot sprites), and the star field is memoised
 * per program slug in a module-level Map. The layer does not animate
 * (the brief is explicit that the background is static; twinkling
 * stars are out of scope).
 *
 * Public surface (the rest of the canvas does not need anything
 * more than `mount` + `render(model)` + `unmount`):
 *   - `new CosmicBackgroundLayer()`
 *   - `layer.render(model)`  — pure redraw, no side effects
 *   - `layer.setViewport(camera)` — applies world position + zoom
 *   - `layer.destroy()`  — frees the Graphics
 *
 * Sector color fields belong to the atlas foreground layer. Keeping
 * this layer to stars prevents residual circular nebula contours from
 * competing with the sector layout.
 */
import { Container, Graphics } from 'pixi.js';

import type { GameSceneModel } from '../types';
import type { ViewportCamera } from '../viewport';

const STAR_COUNT_MIN = 200;
const STAR_COUNT_MAX = 300;
const STAR_RADIUS_MIN = 1;
const STAR_RADIUS_MAX = 2;
const STAR_SUBTLE_ALPHA = 0.5;

interface CosmicDot {
  x: number;
  y: number;
  radius: number;
}

const cosmicStarCache = new Map<string, CosmicDot[]>();

/**
 * Tiny stable hash (32-bit FNV-1a). Used to derive deterministic
 * per-program seeds without pulling in a 200-line hash dependency.
 * Same input → same output, fast enough for 300 dots.
 */
const hashString = (input: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

/**
 * Mulberry32 — a small, fast 32-bit PRNG. We need deterministic
 * per-program randomness (the spec: "the same program always
 * produces the same star field"), and Mulberry32 is the canonical
 * choice for seeded 2D positions. The seed comes from the slug
 * hash, so any change in the program topology is observable.
 */
const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Builds the star field for a given program. The field is keyed by
 * a stable slug so reloads (and the epic 47 layout re-render) keep
 * the same dot positions. The width / height come from the model
 * bounds with extra padding so the field covers the camera even
 * after panning.
 */
const buildStarField = (slug: string, width: number, height: number): CosmicDot[] => {
  const cached = cosmicStarCache.get(slug);
  if (cached && cached.length > 0) {
    return cached;
  }

  const seed = hashString(slug);
  const random = mulberry32(seed);
  const spanX = width * 1.4;
  const spanY = height * 1.4;
  const offsetX = -spanX * 0.2;
  const offsetY = -spanY * 0.2;
  const count = STAR_COUNT_MIN + Math.floor(random() * (STAR_COUNT_MAX - STAR_COUNT_MIN + 1));
  const dots: CosmicDot[] = [];
  for (let index = 0; index < count; index += 1) {
    dots.push({
      x: offsetX + random() * spanX,
      y: offsetY + random() * spanY,
      // 1px for ~80% of dots, 2px for the rest, with ±1 jitter on
      // the rare outliers. The radius is used in the Graphics call.
      radius: random() < 0.8 ? STAR_RADIUS_MIN : STAR_RADIUS_MAX,
    });
  }
  cosmicStarCache.set(slug, dots);
  return dots;
};

/**
 * Derives a stable per-program slug. We hash the sorted node IDs
 * (and, when present, the program title) so two snapshots that
 * share the same program produce the same slug. The model is the
 * only thing we have at render time.
 */
const deriveProgramSlug = (model: GameSceneModel): string => {
  const ids = model.nodes
    .map((node) => node.id)
    .sort((left, right) => left - right)
    .join('-');
  const title = model.nodes[0]?.subtitle?.split(' / ')[0] ?? 'atlas';
  return `${title}::${ids}`;
};

export class CosmicBackgroundLayer extends Container {
  private readonly world = new Container();
  private readonly starGraphics = new Graphics();

  constructor() {
    super();
    this.eventMode = 'none';
    this.world.addChild(this.starGraphics);
    this.addChild(this.world);
  }

  render(model: GameSceneModel) {
    const slug = deriveProgramSlug(model);
    const width = Math.max(1, model.bounds.width);
    const height = Math.max(1, model.bounds.height);

    // Resize-aware cache: the star field is computed once per
    // (slug, width, height) tuple so a wider canvas at the same
    // program still gets a freshly distributed field.
    const cacheKey = `${slug}::${Math.round(width)}::${Math.round(height)}`;
    this.starGraphics.clear();
    const stars = buildStarField(cacheKey, width, height);
    for (const dot of stars) {
      this.starGraphics.circle(dot.x, dot.y, dot.radius);
      this.starGraphics.fill({ color: 0x7e8a99, alpha: STAR_SUBTLE_ALPHA });
    }
  }

  setViewport(camera: ViewportCamera) {
    this.world.position.set(camera.x, camera.y);
    this.world.scale.set(camera.zoom);
  }

  destroy() {
    this.starGraphics.destroy();
    super.destroy();
  }
}
