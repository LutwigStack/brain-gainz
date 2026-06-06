import { useCallback } from 'react';
import type { CSSProperties } from 'react';

import {
  SPHERE_TOKEN_COUNT,
  SPHERE_TOKEN_ORDER,
  sphereDisplayNames,
  type SphereTokenKey,
} from '../../theme/galaxy/sphere-tokens.ts';
import { sphereIdToToken } from '../../theme/galaxy/sphere-id-to-token.ts';

export interface GalaxyLegendEntry {
  /**
   * Catalog slug of the sphere (e.g. `programming`, `algorithms-theory`).
   * Used as the stable key for the row and as the value passed to
   * `onSelect` so that the parent can correlate the click with the
   * WindRose stat that owns the slug.
   */
  slug: string;
  /** Palette token used to paint the row; separate from the stat/catalog slug. */
  tokenKey?: SphereTokenKey | null;
  /** Optional override of the visible name (defaults to the catalog title). */
  label?: string;
}

export interface GalaxyLegendProps {
  /**
   * Optional list of slugs to render. When omitted, the legend renders
   * every sphere in `SPHERE_TOKEN_ORDER` (8 rows). The parent can
   * pass a subset when the active campaign only exposes a few of the
   * 8 sphere tokens (e.g. NLH cash, see epic 41 README).
   */
  entries?: readonly GalaxyLegendEntry[];
  /**
   * Slug of the currently focused sphere. The matching row gets the
   * `strong` text color and a left border in the same color, per
   * workstream 02 §Legend.
   */
  focusedSlug?: string | null;
  /**
   * Click handler. Receives the slug so the parent can call
   * `onSelectStat` (which is the WindRose's existing sphere filter).
   * Epic 41's spec phrases this as "dispatch MapCameraCommand for
   * filter" — in the WindRose surface the filter is `onSelectStat`,
   * not the canvas camera. The legend stays surface-agnostic and
   * just forwards the slug.
   */
  onSelect?: (slug: string) => void;
  className?: string;
  style?: CSSProperties;
}

interface ResolvedRow {
  tokenKey: SphereTokenKey;
  slug: string;
  label: string;
}

const resolveTokenKeyForSlug = (slug: string): SphereTokenKey | null => {
  for (const [mappedSlug, tokenKey] of Object.entries(sphereIdToToken) as Array<
    [string, SphereTokenKey]
  >) {
    if (mappedSlug === slug) {
      return tokenKey;
    }
  }
  return null;
};

const buildRows = (entries: readonly GalaxyLegendEntry[] | undefined): ResolvedRow[] => {
  const list = entries ?? [];
  if (list.length > 0) {
    const explicit = list.flatMap((entry, index) => {
      const tokenKey =
        entry.tokenKey ??
        resolveTokenKeyForSlug(entry.slug) ??
        SPHERE_TOKEN_ORDER[index % SPHERE_TOKEN_ORDER.length];
      if (tokenKey == null) {
        return [];
      }
      return [
        {
          tokenKey,
          slug: entry.slug,
          label: entry.label ?? sphereDisplayNames[tokenKey] ?? entry.slug,
        },
      ];
    });
    if (explicit.length > 0) {
      return explicit;
    }
  }
  // Default — 8 fixed rows in the canonical token order, regardless
  // of the active campaign. This is the user-facing legend the
  // spec calls for ("the legend lists all 8 spheres in the same
  // clockwise order as the radar"). The active campaign can
  // override the row labels via the `entries` prop, but the row
  // count stays at 8.
  return SPHERE_TOKEN_ORDER.map((tokenKey) => ({
    tokenKey,
    slug: tokenKey,
    label: sphereDisplayNames[tokenKey],
  }));
};

/**
 * 8-row legend that teaches the sphere palette to the learner. Each
 * row is a button so that keyboard users can also pick a sphere.
 *
 * Visual contract (per workstream 02 §Legend):
 *   - 12px square swatch in `--sphere-{key}-default`
 *   - label uses the catalog title (`sphereDisplayNames`)
 *   - focused row: text color in `--sphere-{key}-strong`, left border
 *     in the same color
 *   - hover: soft halo using `--sphere-{key}-soft`
 *   - click: dispatches the sphere filter via `onSelect(slug)`
 */
export const GalaxyLegend = ({
  entries,
  focusedSlug,
  onSelect,
  className,
  style,
}: GalaxyLegendProps) => {
  const rows = buildRows(entries);

  const handleClick = useCallback(
    (slug: string) => () => {
      onSelect?.(slug);
    },
    [onSelect],
  );

  return (
    <ul
      className={['galaxy-legend grid min-w-0 gap-1', className].filter(Boolean).join(' ')}
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        ...style,
      }}
      data-galaxy-legend="true"
      aria-label="Сферы галактики"
    >
      {rows.map((row) => {
        const focused = row.slug === focusedSlug;
        const swatchStyle: CSSProperties = {
          width: 12,
          height: 12,
          background: `var(--sphere-${row.tokenKey}-default)`,
          boxShadow: 'inset 1px 1px 0 rgba(255, 255, 255, 0.2)',
          flexShrink: 0,
        };
        const rowStyle: CSSProperties = focused
          ? {
              borderLeftColor: `var(--sphere-${row.tokenKey}-strong)`,
              borderLeftWidth: 3,
              paddingLeft: 6,
              color: `var(--sphere-${row.tokenKey}-strong)`,
            }
          : {
              borderLeftColor: 'transparent',
              borderLeftWidth: 3,
              paddingLeft: 6,
            };
        const buttonClassName = [
          'galaxy-legend__btn',
          'grid',
          'w-full',
          'min-w-0',
          'cursor-pointer',
          'grid-cols-[12px_minmax(0,1fr)]',
          'items-center',
          'gap-2',
          'border',
          'bg-[rgba(15,23,42,0.55)]',
          'px-2',
          'py-1.5',
          'text-left',
          'text-xs',
          focused ? 'galaxy-legend__btn--focused' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <li key={row.slug} className="galaxy-legend__row" style={{ display: 'flex' }}>
            <button
              type="button"
              onClick={handleClick(row.slug)}
              aria-pressed={focused}
              className={buttonClassName}
              style={rowStyle}
              data-galaxy-legend-slug={row.slug}
              data-galaxy-legend-token={row.tokenKey}
            >
              <span aria-hidden="true" style={swatchStyle} />
              <span
                className="truncate"
                style={{
                  color: focused ? `var(--sphere-${row.tokenKey}-strong)` : 'var(--pixel-text)',
                  fontWeight: focused ? 700 : 500,
                }}
              >
                {row.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export const GALAXY_LEGEND_ROW_COUNT = SPHERE_TOKEN_COUNT;
