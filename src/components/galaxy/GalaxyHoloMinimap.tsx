/**
 * Galaxy holo minimap — Epic 46.
 *
 * SVG minimap rendered in the bottom-right of `GameMapCanvas`. The
 * component is a thin React wrapper over the pure layout logic in
 * `./galaxy-holo-minimap.ts` — it computes the layout, renders the
 * background / projected atlas / viewport rectangle, and owns the click
 * handler that asks the parent to recenter the canvas.
 *
 * The click handler is debounced (`GALAXY_HOLO_DEBOUNCE_MS`) to prevent
 * scroll-wheel-spam from translating into a teleport. The screen
 * reader announcement lives in a single `aria-live="polite"` region
 * mounted once at the root of the component — visually hidden, but
 * picked up by assistive tech.
 *
 * Token resolution: the cluster colors come from the
 * `--sphere-{key}-{stop}` CSS variables emitted by
 * `theme/pixel/tokens.ts` (epic 41). The component never inlines a
 * hex; the mapping is `tokenKey → CSS var`, and the CSS variables
 * are the single source of truth (shared with the legend, the
 * mini-preview and the cosmic canvas).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';

import type { GameBiome, GameBounds, GameEdge, GameNode, GamePoint } from '../../game/types.ts';
import type { ViewportCamera } from '../../game/viewport.ts';
import { sphereDisplayNames } from '../../theme/galaxy/sphere-tokens.ts';
import {
  buildGalaxyHoloMinimapLayout,
  findClusterAtMinimapPoint,
  GALAXY_HOLO_DEBOUNCE_MS,
  GALAXY_HOLO_MINIMAP_HEIGHT,
  GALAXY_HOLO_MINIMAP_WIDTH,
  GALAXY_HOLO_VIEWPORT_RECT_ALPHA,
  type GalaxyHoloLayout,
} from './galaxy-holo-minimap.ts';

export interface GalaxyHoloMinimapProps {
  /** Biome list — the source of the cluster centroids. */
  biomes: GameBiome[];
  /** Atlas nodes projected into the visible minimap. */
  nodes: GameNode[];
  /** Atlas edges projected into the visible minimap. */
  edges: GameEdge[];
  /** Model bounds — merged with the viewport bounds in the layout. */
  modelBounds: GameBounds;
  /** Current viewport camera (drives the viewport rect). */
  viewportCamera: ViewportCamera;
  /** Current canvas size — used to compute the viewport bounds. */
  canvasSize: { width: number; height: number };
  /**
   * Catalog slug of the currently focused sphere (e.g. `programming`).
   * When present, the matching cluster gets the `strong` outline.
   */
  currentSphereSlug?: string | null;
  /**
   * Click handler — the parent converts the world point into a
   * `MapCameraCommand` of type `'center-on-point'`. The component
   * itself does not touch the scene; it only translates minimap
   * coordinates into world coordinates.
   */
  onJumpToWorldPoint?: (worldPoint: GamePoint) => void;
  /** Optional width override (defaults to 220). */
  width?: number;
  /** Optional height override (defaults to 156). */
  height?: number;
  /** Extra className for the outer wrapper (test / snapshot hook). */
  className?: string;
  /** Inline style merged on top of the default size. */
  style?: CSSProperties;
}

const HIDDEN_LIVE_REGION_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const resolveClusterLabel = (tokenKey: keyof typeof sphereDisplayNames): string =>
  sphereDisplayNames[tokenKey] ?? tokenKey;

const GalaxyHoloMinimapBase = ({
  biomes,
  nodes,
  edges,
  modelBounds,
  viewportCamera,
  canvasSize,
  currentSphereSlug = null,
  onJumpToWorldPoint,
  width = GALAXY_HOLO_MINIMAP_WIDTH,
  height = GALAXY_HOLO_MINIMAP_HEIGHT,
  className,
  style,
}: GalaxyHoloMinimapProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  const layout = useMemo<GalaxyHoloLayout | null>(
    () =>
      buildGalaxyHoloMinimapLayout({
        biomes,
        nodes,
        edges,
        modelBounds,
        canvasSize,
        viewportCamera,
        currentSphereSlug,
        minimapWidth: width,
        minimapHeight: height,
      }),
    [biomes, canvasSize, currentSphereSlug, edges, height, modelBounds, nodes, viewportCamera, width],
  );

  // Clear any pending debounce timer on unmount so an in-flight click
  // does not fire after the minimap is dismissed.
  useEffect(
    () => () => {
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (!onJumpToWorldPoint || !layout) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const minimapPoint: GamePoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      const worldPoint = layout.fromMini(minimapPoint.x, minimapPoint.y);
      const hitCluster = findClusterAtMinimapPoint(layout, minimapPoint);
      const label = hitCluster ? resolveClusterLabel(hitCluster.tokenKey) : null;

      // Debounce: drop the click if the user is mid-spam (e.g. a
      // double-tap or a pointermove chain). The 80ms window is
      // short enough that a deliberate click always lands, but long
      // enough to swallow a 2-finger scroll or a trackpad inertia.
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onJumpToWorldPoint(worldPoint);
        setAnnouncement(
          label ? `Вид карты перемещён в сектор ${label}` : 'Вид карты перемещён',
        );
      }, GALAXY_HOLO_DEBOUNCE_MS);
    },
    [layout, onJumpToWorldPoint],
  );

  if (!layout) {
    return null;
  }

  const wrapperStyle: CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      data-galaxy-holo-minimap="true"
      data-galaxy-holo-minimap-current-slug={currentSphereSlug ?? ''}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Голографическая миникарта"
        data-galaxy-holo-minimap-svg="true"
        onPointerDown={handlePointerDown}
        style={{ cursor: onJumpToWorldPoint ? 'pointer' : 'default', display: 'block' }}
      >
        {/* Background — `--cosmic-base` (epic 47). Flat fill, no
            gradient (workstream 01 §Background). */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="var(--cosmic-base)"
          data-galaxy-holo-minimap-bg="true"
        />

        {/* Real atlas projection: same nodes and edges as the large map. */}
        <g data-galaxy-holo-minimap-edges="true">
          {layout.edges.map((edge) => (
            <line
              key={`edge-${edge.id}`}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke={`var(--sphere-${edge.tokenKey}-default)`}
              strokeOpacity={edge.isRouteOverlay ? 0.36 : 0.14}
              strokeWidth={edge.isRouteOverlay ? 1.05 : 0.7}
              data-galaxy-holo-minimap-edge="true"
            />
          ))}
        </g>
        <g data-galaxy-holo-minimap-nodes="true">
          {layout.nodes.map((node) => (
            <circle
              key={`node-${node.id}`}
              cx={node.position.x}
              cy={node.position.y}
              r={node.radius}
              fill={`var(--sphere-${node.tokenKey}-default)`}
              fillOpacity={node.isHub ? 0.95 : 0.88}
              stroke={node.isCurrent ? 'var(--pixel-text)' : `var(--sphere-${node.tokenKey}-strong)`}
              strokeOpacity={node.isCurrent ? 0.95 : node.isHub ? 0.58 : 0.18}
              strokeWidth={node.isCurrent ? 1.5 : node.isHub ? 0.9 : 0.45}
              data-galaxy-holo-minimap-node="true"
              data-galaxy-holo-minimap-node-current={node.isCurrent ? 'true' : 'false'}
            />
          ))}
        </g>

        {/* Viewport rectangle — 1px in `text-default` at 60% alpha. */}
        <rect
          x={layout.viewportRect.x}
          y={layout.viewportRect.y}
          width={layout.viewportRect.width}
          height={layout.viewportRect.height}
          fill="rgba(244, 241, 222, 0.06)"
          stroke="var(--pixel-text)"
          strokeOpacity={GALAXY_HOLO_VIEWPORT_RECT_ALPHA}
          strokeWidth={1}
          rx={2}
          data-galaxy-holo-minimap-viewport="true"
        />
      </svg>
      <div
        aria-live="polite"
        aria-atomic="true"
        style={HIDDEN_LIVE_REGION_STYLE}
        data-galaxy-holo-minimap-live="true"
      >
        {announcement}
      </div>
    </div>
  );
};

export const GalaxyHoloMinimap = GalaxyHoloMinimapBase;
