/**
 * Progress arc — Epic 42.
 *
 * Pure (non-React) math for the progress ring that lives around the
 * sphere mini-preview in the `Сектора` card. The React component in
 * `ProgressArc.tsx` is a thin wrapper over the functions exported
 * from here.
 *
 * Implementation notes:
 *   - the ring uses `strokeDasharray` / `strokeDashoffset` to draw the
 *     filled portion, which is the standard SVG idiom and avoids any
 *     trigonometry;
 *   - the unfilled portion is a 1px stroke in `--sphere-{slug}-soft`
 *     so the progress stands out at a glance;
 *   - the entire ring is hidden when `total === 0` — there is no
 *     meaningful "0% complete" for a sphere with no nodes.
 */

const STROKE_WIDTH = 3;
export const RADIUS = (96 - STROKE_WIDTH) / 2;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
export const QUARTER_CIRCUMFERENCE = CIRCUMFERENCE / 4;

export interface ArcLengthResult {
  arcLength: number;
  gapLength: number;
  circumference: number;
  progress: number;
}

/**
 * Compute the dasharray + offset for a given completed/total pair.
 * The math:
 *
 *   progress = clamp01(completed / total)
 *   arcLength = progress * CIRCUMFERENCE
 *   gap = CIRCUMFERENCE - arcLength
 *
 * Exposed as a pure function for the unit test (and for any future
 * surface — e.g. the cosmic canvas (epic 47) — that wants to render
 * the same arc without re-deriving the math).
 */
export const computeProgressArcLength = (
  completedCount: number,
  totalCount: number,
): ArcLengthResult => {
  const safeTotal = Math.max(0, Math.floor(totalCount));
  const safeCompleted = Math.max(0, Math.floor(completedCount));
  const rawProgress = safeTotal === 0 ? 0 : safeCompleted / safeTotal;
  // Clamp to 100% even if `completed > total` (defensive against bad
  // data) — the workstream spec calls this out explicitly.
  const progress = Math.min(1, Math.max(0, rawProgress));
  const arcLength = progress * CIRCUMFERENCE;
  const gapLength = CIRCUMFERENCE - arcLength;
  return { arcLength, gapLength, circumference: CIRCUMFERENCE, progress };
};

/**
 * Human-readable percentage label, used by the `Сектора` card next to
 * the `Открыть карту знаний` button. Returns `—` (em dash) when
 * `total === 0` to avoid the false "0%" reading on a sphere that has
 * no nodes yet.
 */
export const formatProgressPercentLabel = (completedCount: number, totalCount: number): string => {
  if (totalCount <= 0) {
    return '—';
  }
  const { progress } = computeProgressArcLength(completedCount, totalCount);
  return `${Math.round(progress * 100)}%`;
};

export const PROGRESS_ARC_STROKE_WIDTH = STROKE_WIDTH;
export const PROGRESS_ARC_RADIUS = RADIUS;
export const PROGRESS_ARC_CIRCUMFERENCE = CIRCUMFERENCE;
