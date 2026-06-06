/**
 * Sphere mini-preview — Epic 42.
 *
 * Pure (non-React) logic for the static SVG mini-preview that lives
 * inside the `Сектора` card. Lives in a `.ts` file (not `.tsx`) so
 * the node test runner can import it without a TSX loader — the
 * `SphereMiniPreview.tsx` component is a thin wrapper over the
 * functions exported from here.
 *
 * The dot positions are derived from a tiny `mulberry32` PRNG seeded
 * by a hash of the slug. The result is memoised in a module-level
 * `Map<slug, Dot[]>` so the generator only runs once per slug.
 *
 * Determinism contract: for any given slug, the function returns the
 * same dot list and the same `currentIndex` across calls (and across
 * resets of the memoisation cache, as the unit test pins).
 */

import { tryGetSphereTokenKey } from '../../theme/galaxy/sphere-id-to-token.ts';

const VIEWBOX_SIZE = 96;
const CENTER = VIEWBOX_SIZE / 2;
const RADIUS = VIEWBOX_SIZE / 2;
const INNER_RADIUS = (VIEWBOX_SIZE / 2) * 0.78;
const MIN_DOTS = 6;
const MAX_DOTS = 12;
const CURRENT_DOT_RADIUS = 3.4;
const REGULAR_DOT_RADIUS = 2.2;
const CURRENT_DOT_RADIUS_FACTOR = 1.5;

export interface MiniPreviewDot {
  /** Center X (0..96) in the SVG viewBox. */
  x: number;
  /** Center Y (0..96) in the SVG viewBox. */
  y: number;
  /** Dot radius (2 to 3 for regular dots, 1.5x of the regular dot for the current). */
  r: number;
}

export interface ResolvedPattern {
  dots: MiniPreviewDot[];
  currentIndex: number;
}

/**
 * Module-level memoisation cache. The map is keyed by the raw slug
 * (not the token key) so that the same input always produces the same
 * output across renders, even if `tryGetSphereTokenKey` is later
 * updated to return a different token for the same slug.
 */
const patternCache = new Map<string, ResolvedPattern>();

/**
 * Deterministic 32-bit FNV-1a hash. Used to seed the PRNG; the hash
 * itself is fast (a few string walks) and stable across runs.
 */
export const hashSlug = (slug: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i += 1) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/**
 * Type guard used by callers that want to restrict slugs to the
 * known catalog vocabulary. The runtime does not require the slug
 * to be a known one — `tryGetSphereTokenKey` is the soft fallback
 * for the renderer.
 */
export const isKnownSphereSlug = (slug: string): boolean =>
  tryGetSphereTokenKey(slug) != null;

/**
 * Tiny seeded PRNG. mulberry32 is the standard for "good enough
 * non-crypto randomness" — uniform, fast, no dependencies.
 */
export const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const clampCoord = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

const clampRadius = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

/**
 * Compute the dot pattern for a slug. Exported so that the unit test
 * (tests/sphere-mini-preview.test.js) can lock the determinism
 * contract.
 *
 * The result includes the "current" dot's index in the array (so the
 * renderer can pick the right color without re-computing the index).
 * The current dot is just a regular dot, sized 1.5x.
 */
export const computeSphereMiniPreviewDots = (slug: string): ResolvedPattern => {
  const cached = patternCache.get(slug);
  if (cached) {
    return cached;
  }

  const seed = hashSlug(slug);
  const rand = mulberry32(seed);
  // Mix the seed into the count range so each slug gets a stable
  // (and distinct) number of dots between MIN_DOTS and MAX_DOTS.
  const dotCount = MIN_DOTS + Math.floor(rand() * (MAX_DOTS - MIN_DOTS + 1));
  const currentIndex = Math.floor(rand() * dotCount);

  const dots: MiniPreviewDot[] = [];
  // Use a small spiral layout to avoid overlap and keep the
  // "constellation" silhouette coherent. The PRNG nudges each dot
  // away from its base position so the pattern looks irregular but
  // stays reproducible.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < dotCount; i += 1) {
    const t = (i + 0.5) / dotCount;
    const baseRadius = INNER_RADIUS * Math.sqrt(t);
    const baseAngle = i * goldenAngle;
    const jitterRadius = baseRadius * 0.18 * (rand() * 2 - 1);
    const jitterAngle = 0.22 * (rand() * 2 - 1);
    const radius = clampRadius(baseRadius + jitterRadius, 0, INNER_RADIUS);
    const angle = baseAngle + jitterAngle;
    const x = clampCoord(CENTER + Math.cos(angle) * radius, 4, VIEWBOX_SIZE - 4);
    const y = clampCoord(CENTER + Math.sin(angle) * radius, 4, VIEWBOX_SIZE - 4);
    const sizeJitter = 0.85 + rand() * 0.3; // 0.85..1.15 of the base radius
    const isCurrent = i === currentIndex;
    const baseR = isCurrent ? CURRENT_DOT_RADIUS : REGULAR_DOT_RADIUS;
    dots.push({ x, y, r: baseR * sizeJitter });
  }

  const pattern: ResolvedPattern = { dots, currentIndex };
  patternCache.set(slug, pattern);
  return pattern;
};

/**
 * Reset the memoisation cache. The unit test uses this to assert
 * that the same slug always produces the same pattern after a fresh
 * compute. The component itself never needs to call this.
 */
export const __resetSphereMiniPreviewCacheForTests = (): void => {
  patternCache.clear();
};

export const SPHERE_MINI_PREVIEW_DOT_RADIUS_FACTOR = CURRENT_DOT_RADIUS_FACTOR;
export const SPHERE_MINI_PREVIEW_SIZE = VIEWBOX_SIZE;
export const SPHERE_MINI_PREVIEW_CENTER = CENTER;
export const SPHERE_MINI_PREVIEW_RADIUS = RADIUS;
export const SPHERE_MINI_PREVIEW_INNER_RADIUS = INNER_RADIUS;
export const SPHERE_MINI_PREVIEW_DOT_RADIUS = REGULAR_DOT_RADIUS;
export const SPHERE_MINI_PREVIEW_CURRENT_DOT_RADIUS = CURRENT_DOT_RADIUS;
export const SPHERE_MINI_PREVIEW_INNER_RADIUS_RATIO = INNER_RADIUS / RADIUS;
export const SPHERE_MINI_PREVIEW_MIN_DOTS = MIN_DOTS;
export const SPHERE_MINI_PREVIEW_MAX_DOTS = MAX_DOTS;
