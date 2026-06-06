/**
 * Star marker for the current node — Epic 43.
 *
 * The marker is layered:
 *   - `corona`  radial gradient circle, 42px diameter, pulses 0.96 → 1.04
 *   - `body`    4-point star, 14px outer radius, 6px inner radius,
 *               filled with the sphere's `strong` token, with a 1px
 *               white inner stroke at 60% alpha (the body never
 *               animates — the corona is the only animated layer)
 *
 * The Container is the public surface so the layer can scale or
 * re-tint the whole marker in one place if a future epic needs it.
 *
 * The colour binding is set via `setColor`; the geometry is drawn
 * once in the constructor because it never changes between frames
 * (only the corona's `scale` and `alpha` change in `applyPulse`).
 */
import { Container, FillGradient, Graphics } from 'pixi.js';

export const STAR_MARKER_OUTER_RADIUS = 14;
export const STAR_MARKER_INNER_RADIUS = 6;
export const STAR_MARKER_CORONA_RADIUS = 21;
export const STAR_MARKER_INNER_STROKE_COLOR = 0xffffff;
export const STAR_MARKER_INNER_STROKE_ALPHA = 0.6;
export const STAR_MARKER_INNER_STROKE_WIDTH = 1;

const buildStarPath = (): number[] => {
  // 4-point star. Vertices at 0°, 90°, 180°, 270° on the outer
  // radius and at 45°, 135°, 225°, 315° on the inner radius, traced
  // clockwise from the rightmost outer point. The result is a
  // symmetric 4-point star without a separate "rest" vertex.
  const outer = STAR_MARKER_OUTER_RADIUS;
  const inner = STAR_MARKER_INNER_RADIUS;
  const cos45 = Math.SQRT1_2; // cos(45°) and sin(45°) are the same value

  return [
    outer, 0,
    inner * cos45, inner * cos45,
    0, outer,
    -inner * cos45, inner * cos45,
    -outer, 0,
    -inner * cos45, -inner * cos45,
    0, -outer,
    inner * cos45, -inner * cos45,
  ];
};

const buildCoronaGradient = (color: string): FillGradient => {
  // Radial gradient: 30% alpha at the star edge (14/21 = 0.667)
  // fading to 0% alpha at the corona edge (1.0). Inside the star
  // edge the alpha is held at 30% so the body of the star is not
  // double-tinted.
  //
  // The inner circle is at the centre of the star with radius 0
  // (Pixiround interpolates colours from the inner circle outward).
  const colorWithAlpha = (alpha: number) => {
    const hex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0');
    return `${color}${hex}`;
  };

  return new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },
    innerRadius: 0,
    outerCenter: { x: 0.5, y: 0.5 },
    outerRadius: 0.5,
    textureSpace: 'local',
    colorStops: [
      { offset: 0, color: colorWithAlpha(0.3) },
      { offset: 0.6666, color: colorWithAlpha(0.3) },
      { offset: 1, color: colorWithAlpha(0) },
    ],
  });
};

export class StarMarker extends Container {
  public readonly corona: Graphics;
  public readonly body: Graphics;
  private gradient: FillGradient | null = null;
  private currentColor: string | null = null;

  constructor() {
    super();
    this.eventMode = 'none';
    this.corona = new Graphics();
    this.body = new Graphics();
    this.addChild(this.corona, this.body);
    this.drawCorona('#ffffff');
    this.drawBody('#ffffff');
  }

  setColor(color: string) {
    if (color === this.currentColor) {
      return;
    }
    this.currentColor = color;
    this.gradient = buildCoronaGradient(color);
    this.drawCorona(color);
    this.drawBody(color);
  }

  /**
   * Apply a pulse frame. `cyclePos` is in [0, 1) and represents the
   * 2.4s sine cycle. Scale stays at 1.0 on average and oscillates
   * between 0.96 and 1.04; alpha oscillates between 0.20 and 0.30
   * (both in sync with the same sine). The body is never scaled.
   */
  applyPulse(cyclePos: number) {
    const wave = Math.sin(cyclePos * Math.PI * 2);
    const scale = 1.0 + 0.04 * wave;
    const alpha = 0.25 + 0.05 * wave;
    this.corona.scale.set(scale);
    this.corona.alpha = alpha;
  }

  private drawCorona(color: string) {
    const graphics = this.corona;
    graphics.clear();
    graphics.circle(0, 0, STAR_MARKER_CORONA_RADIUS);
    graphics.fill({ fill: this.gradient ?? buildCoronaGradient(color) });
    // The corona sits behind the body so the star body reads on
    // top of the soft glow.
    this.corona.alpha = 0.25;
  }

  private drawBody(color: string) {
    const graphics = this.body;
    graphics.clear();
    graphics.poly(buildStarPath());
    graphics.fill({ color });
    graphics.stroke({
      color: STAR_MARKER_INNER_STROKE_COLOR,
      width: STAR_MARKER_INNER_STROKE_WIDTH,
      alpha: STAR_MARKER_INNER_STROKE_ALPHA,
    });
  }
}
