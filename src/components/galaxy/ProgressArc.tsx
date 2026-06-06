/**
 * Progress arc — Epic 42.
 *
 * A thin SVG ring that shows `completed / total` as a percentage.
 * The arc starts at 12 o'clock and goes clockwise; it is the visual
 * answer to "how far am I in this sphere?" that pairs with the
 * `SphereMiniPreview` (epic 42, workstream 01) sitting in the same
 * card.
 *
 * The math (dasharray + offset, clamp rules, label formatter) lives
 * in `progress-arc.ts` (a `.ts` file so the node test runner can
 * import it without a TSX loader). This file is the React wrapper
 * that turns the numbers into a `<svg>`.
 */
import { memo } from 'react';
import type { CSSProperties } from 'react';

import {
  CIRCUMFERENCE,
  PROGRESS_ARC_RADIUS,
  PROGRESS_ARC_STROKE_WIDTH,
  QUARTER_CIRCUMFERENCE,
  computeProgressArcLength,
} from './progress-arc.ts';

// The pure helpers (`computeProgressArcLength`,
// `formatProgressPercentLabel`, the arc constants, the
// `ArcLengthResult` type) are exported from `./progress-arc.ts` so
// the node test runner can import them directly without a TSX
// loader. Re-exporting them from this file would defeat the
// `react-refresh/only-export-components` rule and break fast refresh
// during dev; consumers that need the pure functions import them
// from `progress-arc.ts` (or from the index barrel once we add
// one).

export interface ProgressArcProps {
  /** Catalog slug (e.g. `programming`, `algorithms-theory`). */
  slug: string;
  /** Number of completed nodes in the sphere. */
  completedCount: number;
  /** Total number of nodes in the sphere. */
  totalCount: number;
  /** When true, the filled stroke uses the `strong` token. */
  focused?: boolean;
  /** Optional size override in pixels. Defaults to 96. */
  size?: number;
  /** Hide the unfilled track even when total > 0. Defaults to false. */
  hideTrack?: boolean;
  className?: string;
  style?: CSSProperties;
  /**
   * Override the stroke colors. Mostly useful for tests and
   * for a future themed variant. Falls back to the sphere tokens.
   */
  fillOverride?: string;
  trackOverride?: string;
}

const ProgressArcBase = ({
  slug,
  completedCount,
  totalCount,
  focused = false,
  size = 96,
  hideTrack = false,
  className,
  style,
  fillOverride,
  trackOverride,
}: ProgressArcProps) => {
  const mergedStyle: CSSProperties = {
    width: size,
    height: size,
    pointerEvents: 'none',
    ...style,
  };

  if (totalCount <= 0) {
    // No nodes: hide the ring entirely. The label that lives next
    // to the card button shows "—" in this case (see workstream 02).
    return null;
  }

  const { arcLength, gapLength, progress } = computeProgressArcLength(
    completedCount,
    totalCount,
  );
  const filledToken = focused ? 'strong' : 'default';
  const fallbackFill = focused ? 'rgba(255, 255, 255, 0.92)' : 'rgba(180, 196, 220, 0.7)';
  const fallbackTrack = 'rgba(180, 196, 220, 0.18)';
  const fill = fillOverride ?? `var(--sphere-${slug}-${filledToken}, ${fallbackFill})`;
  const track = trackOverride ?? `var(--sphere-${slug}-soft, ${fallbackTrack})`;

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={`Прогресс по сфере ${slug}: ${Math.round(progress * 100)}%`}
      data-sphere-progress-arc="true"
      data-sphere-progress-arc-slug={slug}
      data-sphere-progress-arc-completed={String(completedCount)}
      data-sphere-progress-arc-total={String(totalCount)}
      data-sphere-progress-arc-progress={progress.toFixed(4)}
      data-sphere-progress-arc-focused={focused ? 'true' : 'false'}
      className={className}
      style={mergedStyle}
    >
      {!hideTrack ? (
        <circle
          cx={48}
          cy={48}
          r={PROGRESS_ARC_RADIUS}
          fill="none"
          stroke={track}
          strokeWidth={1}
          data-sphere-progress-arc-track="true"
        />
      ) : null}
      <circle
        cx={48}
        cy={48}
        r={PROGRESS_ARC_RADIUS}
        fill="none"
        stroke={fill}
        strokeWidth={PROGRESS_ARC_STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        // 0,0 is at 3 o'clock for a default SVG circle; rotating
        // by -90° (or pushing the dasharray by a quarter of the
        // circumference via dashoffset) moves the start to 12 o'clock.
        strokeDashoffset={QUARTER_CIRCUMFERENCE}
        data-sphere-progress-arc-fill="true"
        data-sphere-progress-arc-length={arcLength.toFixed(4)}
        // Keep the math constants visible to grep and to tests
        // without inflating the bundle: the attribute is unused at
        // render time but documents the geometry.
        data-sphere-progress-arc-circumference={CIRCUMFERENCE.toFixed(4)}
      />
    </svg>
  );
};

export const ProgressArc = memo(ProgressArcBase);
