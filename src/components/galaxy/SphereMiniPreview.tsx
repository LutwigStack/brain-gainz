/**
 * Sphere mini-preview — Epic 42.
 *
 * A small, deterministic SVG that mirrors the silhouette of a sphere's
 * knowledge map inside the `Сектора` card. It is NOT a live render of
 * the canvas; it is a static stylised hint that gives each sphere a
 * recognisable identity across reloads.
 *
 * The dot generation lives in `sphere-mini-preview.ts` (a `.ts` file
 * so the node test runner can import it without a TSX loader). This
 * file is the React wrapper that turns the dot list into a `<svg>`.
 *
 * Token resolution: the component receives a catalog slug (e.g.
 * `programming`, `algorithms-theory`). The slug is mapped to a sphere
 * token key via `sphere-id-to-token.ts`; the actual color comes from
 * the `--sphere-{key}-{stop}` CSS variables emitted by
 * `theme/pixel/tokens.ts` (epic 41). This keeps the component
 * theme-driven: it never inlines a hex.
 */
import { memo } from 'react';
import type { CSSProperties } from 'react';

import { tryGetSphereTokenKey } from '../../theme/galaxy/sphere-id-to-token.ts';
import {
  SPHERE_MINI_PREVIEW_CENTER,
  SPHERE_MINI_PREVIEW_RADIUS,
  SPHERE_MINI_PREVIEW_SIZE,
  __resetSphereMiniPreviewCacheForTests,
  computeSphereMiniPreviewDots,
} from './sphere-mini-preview.ts';

// The pure helpers (`computeSphereMiniPreviewDots`,
// `__resetSphereMiniPreviewCacheForTests`, the size/dot constants,
// the `MiniPreviewDot` / `ResolvedPattern` types) live in
// `./sphere-mini-preview.ts` so the node test runner can import them
// directly without a TSX loader. Re-exporting them from this file
// would defeat the `react-refresh/only-export-components` rule and
// break fast refresh during dev; consumers (the test, the cosmic
// canvas) import them from `sphere-mini-preview.ts` (or from the
// index barrel once we add one).

export interface SphereMiniPreviewProps {
  /** Catalog slug (e.g. `programming`, `algorithms-theory`). */
  slug: string;
  /** When true, the current dot is rendered in the `strong` token. */
  focused?: boolean;
  /** Optional size override in pixels. Defaults to 96. */
  size?: number;
  /** Extra className for the outer SVG (test/snapshot hook). */
  className?: string;
  /** Inline style merged on top of the default size. */
  style?: CSSProperties;
  /** Test-only escape hatch: skip the memoisation cache. */
  bypassCache?: boolean;
}

const resolveTokenKey = (slug: string): string => {
  const key = tryGetSphereTokenKey(slug);
  return key ?? 'unknown';
};

const SphereMiniPreviewBase = ({
  slug,
  focused = false,
  size = SPHERE_MINI_PREVIEW_SIZE,
  className,
  style,
  bypassCache = false,
}: SphereMiniPreviewProps) => {
  if (bypassCache) {
    __resetSphereMiniPreviewCacheForTests();
  }
  const pattern = computeSphereMiniPreviewDots(slug);
  // Leave 1px on each side for the soft outline so the stroke is
  // not clipped when the preview is rendered at a different size.
  const outerRadius = (size - 2) / 2;
  const mergedStyle: CSSProperties = {
    width: size,
    height: size,
    ...style,
  };

  return (
    <svg
      viewBox={`0 0 ${SPHERE_MINI_PREVIEW_SIZE} ${SPHERE_MINI_PREVIEW_SIZE}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Мини-превью сферы ${slug}`}
      data-sphere-mini-preview="true"
      data-sphere-mini-preview-slug={slug}
      data-sphere-mini-preview-focused={focused ? 'true' : 'false'}
      className={className}
      style={mergedStyle}
    >
      <circle
        cx={SPHERE_MINI_PREVIEW_CENTER}
        cy={SPHERE_MINI_PREVIEW_CENTER}
        r={SPHERE_MINI_PREVIEW_RADIUS}
        fill="var(--sphere-unknown-soft, rgba(20, 27, 38, 0.6))"
        data-sphere-mini-preview-bg="true"
        data-sphere-mini-preview-slug={slug}
        style={{
          fill: `var(--sphere-${resolveTokenKey(slug)}-soft, rgba(20, 27, 38, 0.6))`,
        }}
      />
      <g
        data-sphere-mini-preview-dots="true"
        style={{ transformOrigin: `${SPHERE_MINI_PREVIEW_CENTER}px ${SPHERE_MINI_PREVIEW_CENTER}px` }}
      >
        {pattern.dots.map((dot, index) => {
          const isCurrent = index === pattern.currentIndex;
          const tokenStop = isCurrent ? 'strong' : 'default';
          return (
            <circle
              key={index}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              data-sphere-mini-preview-dot="true"
              data-sphere-mini-preview-dot-current={isCurrent ? 'true' : 'false'}
              style={{
                fill: `var(--sphere-${resolveTokenKey(slug)}-${tokenStop}, ${
                  isCurrent ? 'rgba(255, 255, 255, 0.92)' : 'rgba(180, 196, 220, 0.7)'
                })`,
              }}
            />
          );
        })}
      </g>
      <circle
        cx={SPHERE_MINI_PREVIEW_CENTER}
        cy={SPHERE_MINI_PREVIEW_CENTER}
        r={outerRadius}
        fill="none"
        stroke="rgba(0, 0, 0, 0.18)"
        strokeWidth={0.5}
        pointerEvents="none"
      />
    </svg>
  );
};

export const SphereMiniPreview = memo(SphereMiniPreviewBase);
