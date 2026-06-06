/**
 * Sphere color tokens — Epic 41.
 *
 * One palette per sphere, four stops each:
 *   - `default`     surface fill when the sphere is idle
 *   - `strong`      surface fill when the sphere is current / focused
 *   - `soft`        low-saturation tint used for backgrounds, halos, and
 *                   the minimap dots (target ~15-20% perceived lightness
 *                   on the deep-space canvas introduced in epic 47)
 *   - `textOnStrong` foreground color that stays readable on `strong`
 *
 * The 8 spheres (Программирование, Математика, Навигационный центр,
 * Компьютерные системы, Данные и ИИ, Инженерия ПО и продукт,
 * Общество этика право, Проекты) are the primary organising unit of the
 * galaxy map. They are visible on the `Прогресс` (WindRose) radar today
 * and will be re-used by the `Сектора` cards (epic 42), the star marker
 * (epic 43), the cosmic canvas (epic 47) and the minimap (epic 46).
 *
 * Token keys are intentionally short (`code`, `math`, `navigation`,
 * `systems`, `data`, `engineering`, `society`, `projects`) so the CSS
 * custom properties stay readable on small surfaces.
 *
 * Mapping from the catalog `slug` to the token key lives in
 * `sphere-id-to-token.ts` — this file is the palette only.
 *
 * `textOnStrong` is hand-coded for the 8 `strong` stops:
 *   - cool strong stops (code, math, data, navigation) → #FFFFFF
 *   - warm strong stops (systems, engineering, society, projects) → #10131A
 * (the dark text on a warm stop keeps AA contrast on every strong fill
 * without depending on a per-stop luminance computation at this pass).
 *
 * The hex values are taken from tasks/41-sphere-color-system/README.md
 * "Token map (initial proposal)" — any future visual tuning is a
 * follow-up epic and must update this file together with the README.
 */
export interface SphereToken {
  default: string;
  strong: string;
  soft: string;
  textOnStrong: string;
}

export const sphereTokens = {
  code: {
    default: '#5AC8FA',
    strong: '#7ED8FF',
    soft: '#1F3A4A',
    textOnStrong: '#FFFFFF',
  },
  math: {
    default: '#C792EA',
    strong: '#D8A6F5',
    soft: '#3A2A4A',
    textOnStrong: '#FFFFFF',
  },
  navigation: {
    default: '#82E0AA',
    strong: '#9FE8BC',
    soft: '#1F3A2A',
    textOnStrong: '#FFFFFF',
  },
  systems: {
    default: '#F5B041',
    strong: '#F8C56C',
    soft: '#3A2E1A',
    textOnStrong: '#10131A',
  },
  data: {
    default: '#4DD0E1',
    strong: '#7BE0EC',
    soft: '#1A323A',
    textOnStrong: '#FFFFFF',
  },
  engineering: {
    default: '#E57373',
    strong: '#F09A9A',
    soft: '#3A1F1F',
    textOnStrong: '#10131A',
  },
  society: {
    default: '#F06292',
    strong: '#F58FB1',
    soft: '#3A1F2A',
    textOnStrong: '#10131A',
  },
  projects: {
    default: '#FFD54F',
    strong: '#FFE082',
    soft: '#3A321A',
    textOnStrong: '#10131A',
  },
} as const satisfies Record<string, SphereToken>;

export type SphereTokenKey = keyof typeof sphereTokens;

/**
 * Strict list of sphere token keys, in the order they should be emitted
 * to the DOM (and the order used by the legend, the WindRose and the
 * `Сектора` grid). The order matches the clockwise radar layout
 * documented in workstream 02.
 */
export const SPHERE_TOKEN_ORDER: readonly SphereTokenKey[] = [
  'code',
  'math',
  'navigation',
  'systems',
  'data',
  'engineering',
  'society',
  'projects',
] as const;

/**
 * The expected number of sphere tokens in the project (locked at 8
 * per the epic's `Excludes` clause). Tests pin this count.
 */
export const SPHERE_TOKEN_COUNT = SPHERE_TOKEN_ORDER.length;

/**
 * Display name for each sphere, used by the legend and the sector grid.
 * Keeping the human-readable name next to the palette avoids an extra
 * import from the course catalogs — the legend does not need the
 * catalog description, only the visible name.
 */
export const sphereDisplayNames: Record<SphereTokenKey, string> = {
  code: 'Программирование',
  math: 'Математика',
  navigation: 'Навигационный центр',
  systems: 'Компьютерные системы',
  data: 'Данные и ИИ',
  engineering: 'Инженерия ПО и продукт',
  society: 'Общество, этика, право',
  projects: 'Проекты',
};
