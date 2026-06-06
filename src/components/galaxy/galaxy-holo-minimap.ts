/**
 * Galaxy holo minimap — Epic 46.
 *
 * Pure (non-React) layout logic for the holo minimap rendered in the
 * bottom-right of the canvas. The minimap uses the same world-space
 * nodes and edges as the large atlas, projected through a single
 * `toMini` / `fromMini` transform. Cluster metadata is still kept for
 * click announcements, but the visible surface is now a real miniature
 * of the current map instead of a decorative sphere legend.
 *
 * Coordinate system: a single `toMini` / `fromMini` pair is the bridge
 * between world space (the layout produced by `create-game-view-model`
 * / `skill-atlas-layout`) and minimap screen space (a `220x156` SVG
 * viewport). The same pair is used to position clusters and to convert
 * click coordinates back into world space.
 *
 * Determinism: the dot positions come from `computeSphereMiniPreviewDots`,
 * which is seeded by a FNV-1a hash of the sphere's catalog slug and
 * memoised. The result is stable across calls and across reloads.
 *
 * Pure: no DOM, no React, no `Date.now()`, no `Math.random()` outside
 * the memoised PRNG. Safe to import from the React component and from
 * the node test runner (the `.ts` extension keeps the test loader
 * TSX-free).
 */
import {
  sphereIdToToken,
  SPHERE_CATALOG_SLUG_ORDER,
  tryGetSphereTokenKey,
} from '../../theme/galaxy/sphere-id-to-token.ts';
import { SPHERE_TOKEN_ORDER, type SphereTokenKey } from '../../theme/galaxy/sphere-tokens.ts';
import type { GameBiome, GameBounds, GameEdge, GameNode, GamePoint } from '../../game/types.ts';
import { getViewportWorldBounds, type ViewportCamera } from '../../game/viewport.ts';
import {
  computeSphereMiniPreviewDots,
  SPHERE_MINI_PREVIEW_CENTER,
  SPHERE_MINI_PREVIEW_SIZE,
} from './sphere-mini-preview.ts';

export const GALAXY_HOLO_MINIMAP_WIDTH = 220;
export const GALAXY_HOLO_MINIMAP_HEIGHT = 156;
export const GALAXY_HOLO_CLUSTER_BOX_WIDTH = 40;
export const GALAXY_HOLO_CLUSTER_BOX_HEIGHT = 24;
export const GALAXY_HOLO_CLUSTER_DOT_RADIUS = 1.5;
export const GALAXY_HOLO_CLUSTER_FILL_ALPHA = 0.8;
export const GALAXY_HOLO_VIEWPORT_RECT_ALPHA = 0.6;
export const GALAXY_HOLO_VIEWPORT_RECT_MIN_SIZE = 12;
export const GALAXY_HOLO_MERGED_BOUNDS_PADDING = 48;
export const GALAXY_HOLO_DEBOUNCE_MS = 80;
export const GALAXY_HOLO_MINIMAP_MAX_CLUSTERS = 8;
export const GALAXY_HOLO_CLUSTER_MIN_DOTS = 6;
export const GALAXY_HOLO_CLUSTER_MAX_DOTS = 10;

export interface GalaxyHoloCluster {
  /** Index of the biome in the source `biomes` array. */
  index: number;
  /** Sphere token key (`code`, `math`, …) — drives the fill / dot colors. */
  tokenKey: SphereTokenKey;
  /** Catalog slug that matches the token key. Falls back to the token key. */
  catalogSlug: string;
  /** Cluster center in minimap space (the centroid of the sphere, transformed). */
  center: GamePoint;
  /** Dots in minimap space (6-10 per cluster, `1.5`px radius each). */
  dots: GalaxyHoloDot[];
  /** Whether this cluster is the currently focused sphere. */
  isCurrent: boolean;
}

export interface GalaxyHoloDot {
  x: number;
  y: number;
  r: number;
}

export interface GalaxyHoloNodeDot {
  id: number;
  tokenKey: SphereTokenKey;
  position: GamePoint;
  radius: number;
  isCurrent: boolean;
  isHub: boolean;
}

export interface GalaxyHoloEdgeLine {
  id: number;
  tokenKey: SphereTokenKey;
  from: GamePoint;
  to: GamePoint;
  isRouteOverlay: boolean;
}

export interface GalaxyHoloLayout {
  width: number;
  height: number;
  scale: number;
  offset: GamePoint;
  worldBounds: GameBounds;
  /** World-to-minimap transform. Used to position clusters and the viewport rect. */
  toMini: (x: number, y: number) => GamePoint;
  /** Minimap-to-world transform. Used by the click handler in workstream 02. */
  fromMini: (x: number, y: number) => GamePoint;
  viewportRect: { x: number; y: number; width: number; height: number };
  nodes: GalaxyHoloNodeDot[];
  edges: GalaxyHoloEdgeLine[];
  clusters: GalaxyHoloCluster[];
  currentCluster: GalaxyHoloCluster | null;
}

/**
 * Resolve the sphere token key for a biome at the given index. The
 * epic-47 cosmic background uses `SPHERE_TOKEN_ORDER[index]` for the
 * i-th biome, so we mirror that mapping. The lookup is tolerant of
 * campaigns with fewer than 8 biomes (NLH cash has 11 regions in the
 * raw catalog, but the canvas may still expose 8 biomes after
 * filtering — the brief says "8 nebula clusters, один на сферу", so
 * the token order is the source of truth for the colors).
 */
export const resolveTokenKeyForBiomeIndex = (index: number): SphereTokenKey => {
  const safeIndex = Math.max(0, Math.min(index, SPHERE_TOKEN_ORDER.length - 1));
  return SPHERE_TOKEN_ORDER[safeIndex];
};

const isSphereTokenKey = (value: string | undefined): value is SphereTokenKey =>
  Boolean(value && (SPHERE_TOKEN_ORDER as readonly string[]).includes(value));

const resolveTokenKeyForNode = (node: GameNode): SphereTokenKey => {
  if (isSphereTokenKey(node.atlasSphereTokenKey)) {
    return node.atlasSphereTokenKey;
  }
  return resolveTokenKeyForBiomeIndex((node.biomeId ?? 1) - 1);
};

const resolveMinimapNodeRadius = (node: GameNode): number => {
  switch (node.atlasNodeType) {
    case 'root':
      return 3.2;
    case 'domain_hub':
    case 'course_hub':
      return 3;
    case 'topic_node':
      return 2.5;
    case 'practice_node':
    case 'review_node':
    case 'boss_node':
      return 2.25;
    default:
      return 1.9;
  }
};

/**
 * Resolve the catalog slug for a sphere token key. The token key
 * `code` maps back to the catalog slug `programming`, and so on. If
 * the mapping is missing (e.g. a future token without a slug), the
 * token key itself is returned so the cluster still has a stable
 * identity for the dot seed.
 */
export const resolveCatalogSlugForTokenKey = (tokenKey: SphereTokenKey): string => {
  for (const [slug, key] of Object.entries(sphereIdToToken) as Array<
    [string, SphereTokenKey]
  >) {
    if (key === tokenKey) {
      return slug;
    }
  }
  return tokenKey;
};

/**
 * Build the holo-minimap layout from the scene model, current viewport
 * camera and the slug of the currently focused sphere.
 *
 * The function is the single source of truth for the canvas↔minimap
 * coordinate transform. The same transform is used:
 *   - in the SVG (to position clusters, dots, and the viewport rect)
 *   - in the click handler (to convert a click into a world point)
 *
 * The transform intentionally matches the legacy minimap memo in
 * `GameMapCanvas.tsx:631-676` — the merged bounds, scale, and offset
 * are identical so a click on a cluster sits on the same world point
 * it would in the legacy minimap.
 */
export const buildGalaxyHoloMinimapLayout = (input: {
  biomes: GameBiome[];
  modelBounds: GameBounds;
  canvasSize: { width: number; height: number };
  viewportCamera: ViewportCamera;
  nodes?: GameNode[];
  edges?: GameEdge[];
  currentSphereSlug?: string | null;
  minimapWidth?: number;
  minimapHeight?: number;
}): GalaxyHoloLayout | null => {
  const { biomes, modelBounds, canvasSize, viewportCamera } = input;
  if (biomes.length === 0 || canvasSize.width <= 0 || canvasSize.height <= 0) {
    return null;
  }

  const minimapWidth = input.minimapWidth ?? GALAXY_HOLO_MINIMAP_WIDTH;
  const minimapHeight = input.minimapHeight ?? GALAXY_HOLO_MINIMAP_HEIGHT;
  const viewportBounds = getViewportWorldBounds(viewportCamera, canvasSize);

  const mergedBounds: GameBounds = {
    minX: Math.min(modelBounds.minX, viewportBounds.minX) - GALAXY_HOLO_MERGED_BOUNDS_PADDING,
    minY: Math.min(modelBounds.minY, viewportBounds.minY) - GALAXY_HOLO_MERGED_BOUNDS_PADDING,
    maxX: Math.max(modelBounds.maxX, viewportBounds.maxX) + GALAXY_HOLO_MERGED_BOUNDS_PADDING,
    maxY: Math.max(modelBounds.maxY, viewportBounds.maxY) + GALAXY_HOLO_MERGED_BOUNDS_PADDING,
    width: 0,
    height: 0,
    center: { x: 0, y: 0 },
  };
  mergedBounds.width = Math.max(1, mergedBounds.maxX - mergedBounds.minX);
  mergedBounds.height = Math.max(1, mergedBounds.maxY - mergedBounds.minY);
  mergedBounds.center = {
    x: mergedBounds.minX + mergedBounds.width / 2,
    y: mergedBounds.minY + mergedBounds.height / 2,
  };

  const scale = Math.min(
    minimapWidth / Math.max(mergedBounds.width, 1),
    minimapHeight / Math.max(mergedBounds.height, 1),
  );
  const offsetX = (minimapWidth - mergedBounds.width * scale) / 2;
  const offsetY = (minimapHeight - mergedBounds.height * scale) / 2;
  const toMini = (x: number, y: number): GamePoint => ({
    x: offsetX + (x - mergedBounds.minX) * scale,
    y: offsetY + (y - mergedBounds.minY) * scale,
  });
  const fromMini = (x: number, y: number): GamePoint => ({
    x: mergedBounds.minX + (x - offsetX) / scale,
    y: mergedBounds.minY + (y - offsetY) / scale,
  });

  const viewportTopLeft = toMini(viewportBounds.minX, viewportBounds.minY);
  const viewportBottomRight = toMini(viewportBounds.maxX, viewportBounds.maxY);
  const viewportRect = {
    x: Math.max(
      0,
      Math.min(minimapWidth - GALAXY_HOLO_VIEWPORT_RECT_MIN_SIZE, viewportTopLeft.x),
    ),
    y: Math.max(
      0,
      Math.min(minimapHeight - GALAXY_HOLO_VIEWPORT_RECT_MIN_SIZE, viewportTopLeft.y),
    ),
    width: Math.max(
      GALAXY_HOLO_VIEWPORT_RECT_MIN_SIZE,
      Math.min(
        minimapWidth - Math.max(0, viewportTopLeft.x),
        viewportBottomRight.x - viewportTopLeft.x,
      ),
    ),
    height: Math.max(
      GALAXY_HOLO_VIEWPORT_RECT_MIN_SIZE,
      Math.min(
        minimapHeight - Math.max(0, viewportTopLeft.y),
        viewportBottomRight.y - viewportTopLeft.y,
      ),
    ),
  };

  // Current-cluster detection: `currentSphereSlug` is a catalog slug
  // (e.g. `programming`). The biomes are in catalog order (the
  // `createBiome` helper in `create-game-view-model.ts` iterates
  // `visibleSpheres` in snapshot order), so a slug maps to a token
  // key, the token key maps to a position in `SPHERE_TOKEN_ORDER`,
  // and that position is the index of the matching cluster. We
  // short-circuit to `null` when the slug is missing or unknown so
  // the outline falls back to "no cluster highlighted" — the
  // legend is the right place to look up sphere names.
  const currentTokenKey = input.currentSphereSlug
    ? tryGetSphereTokenKey(input.currentSphereSlug)
    : null;
  const currentTokenIndex = currentTokenKey
    ? SPHERE_TOKEN_ORDER.indexOf(currentTokenKey)
    : -1;

  const clusters: GalaxyHoloCluster[] = [];
  const clusterCount = Math.min(biomes.length, GALAXY_HOLO_MINIMAP_MAX_CLUSTERS);
  for (let i = 0; i < clusterCount; i += 1) {
    const biome = biomes[i];
    if (!biome) {
      continue;
    }
    const tokenKey = resolveTokenKeyForBiomeIndex(i);
    const catalogSlug = resolveCatalogSlugForTokenKey(tokenKey);
    const center = toMini(biome.center.x, biome.center.y);
    const dots = scaleMiniPreviewDotsToClusterBox(catalogSlug, center);
    const isCurrent = currentTokenIndex === i;
    clusters.push({
      index: i,
      tokenKey,
      catalogSlug,
      center,
      dots,
      isCurrent,
    });
  }

  const currentCluster = clusters.find((cluster) => cluster.isCurrent) ?? null;
  const projectedNodes: GalaxyHoloNodeDot[] = (input.nodes ?? []).map((node) => ({
    id: node.id,
    tokenKey: resolveTokenKeyForNode(node),
    position: toMini(node.position.x, node.position.y),
    radius: node.isCurrentRouteTarget
      ? Math.max(3.4, resolveMinimapNodeRadius(node))
      : resolveMinimapNodeRadius(node),
    isCurrent: Boolean(node.isCurrentRouteTarget),
    isHub:
      node.atlasNodeType === 'root' ||
      node.atlasNodeType === 'domain_hub' ||
      node.atlasNodeType === 'course_hub' ||
      node.atlasNodeType === 'topic_node',
  }));
  const projectedNodeById = new Map(projectedNodes.map((node) => [node.id, node]));
  const projectedEdges: GalaxyHoloEdgeLine[] = (input.edges ?? [])
    .map((edge) => {
      const fromNode = projectedNodeById.get(edge.fromNodeId);
      const toNode = projectedNodeById.get(edge.toNodeId);
      if (!fromNode || !toNode) {
        return null;
      }
      return {
        id: edge.id,
        tokenKey: fromNode.tokenKey,
        from: fromNode.position,
        to: toNode.position,
        isRouteOverlay: edge.atlasEdgeRole === 'route_overlay',
      };
    })
    .filter((edge): edge is GalaxyHoloEdgeLine => edge != null);

  return {
    width: minimapWidth,
    height: minimapHeight,
    scale,
    offset: { x: offsetX, y: offsetY },
    worldBounds: mergedBounds,
    toMini,
    fromMini,
    viewportRect,
    nodes: projectedNodes,
    edges: projectedEdges,
    clusters,
    currentCluster,
  };
};

/**
 * Re-scale the dot pattern produced by `computeSphereMiniPreviewDots`
 * (a 96x96 viewBox) into a `GALAXY_HOLO_CLUSTER_BOX_WIDTH ×
 * GALAXY_HOLO_CLUSTER_BOX_HEIGHT` bounding box centered on the given
 * minimap-space cluster center. The radius is fixed at
 * `GALAXY_HOLO_CLUSTER_DOT_RADIUS` (1.5px) per the brief — the
 * mini-preview's per-dot radius jitter is dropped on the minimap so
 * every cluster has the same dot weight and the constellation reads
 * as a single visual unit.
 *
 * The dot count is capped at `GALAXY_HOLO_CLUSTER_MAX_DOTS` so the
 * brief's "6-10 dots per cluster" rule wins over the mini-preview's
 * "6-12 dots" range. The first N dots from the algorithm are
 * deterministic per slug, so the cap is a slice — the surviving
 * constellation stays stable across calls.
 */
export const scaleMiniPreviewDotsToClusterBox = (
  slug: string,
  clusterCenter: GamePoint,
): GalaxyHoloDot[] => {
  const pattern = computeSphereMiniPreviewDots(slug);
  const halfW = GALAXY_HOLO_CLUSTER_BOX_WIDTH / 2;
  const halfH = GALAXY_HOLO_CLUSTER_BOX_HEIGHT / 2;
  const scaleX = GALAXY_HOLO_CLUSTER_BOX_WIDTH / SPHERE_MINI_PREVIEW_SIZE;
  const scaleY = GALAXY_HOLO_CLUSTER_BOX_HEIGHT / SPHERE_MINI_PREVIEW_SIZE;
  const cappedDots = pattern.dots.slice(0, GALAXY_HOLO_CLUSTER_MAX_DOTS);
  return cappedDots.map((dot) => {
    const offsetX = (dot.x - SPHERE_MINI_PREVIEW_CENTER) * scaleX;
    const offsetY = (dot.y - SPHERE_MINI_PREVIEW_CENTER) * scaleY;
    return {
      x: clampTo(clusterCenter.x + offsetX, clusterCenter.x - halfW, clusterCenter.x + halfW),
      y: clampTo(clusterCenter.y + offsetY, clusterCenter.y - halfH, clusterCenter.y + halfH),
      r: GALAXY_HOLO_CLUSTER_DOT_RADIUS,
    };
  });
};

const clampTo = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

/**
 * Resolve the cluster whose bounding box contains the given minimap
 * coordinate. Returns `null` if the point is outside every cluster.
 * Used by the click handler (workstream 02) to decide whether to
 * announce "сектор {sphere-name}" or just "Вид карты перемещён".
 *
 * The hit-test is a point-in-ellipse check on the same 40x24 box that
 * drew the cluster — slightly looser than the visible shape, so a
 * near-miss on the visible blob still counts as a hit and the screen
 * reader announces the correct sector.
 */
export const findClusterAtMinimapPoint = (
  layout: GalaxyHoloLayout,
  minimapPoint: GamePoint,
): GalaxyHoloCluster | null => {
  for (const cluster of layout.clusters) {
    const dx = (minimapPoint.x - cluster.center.x) / (GALAXY_HOLO_CLUSTER_BOX_WIDTH / 2);
    const dy = (minimapPoint.y - cluster.center.y) / (GALAXY_HOLO_CLUSTER_BOX_HEIGHT / 2);
    if (dx * dx + dy * dy <= 1) {
      return cluster;
    }
  }
  return null;
};

/**
 * Re-export the catalog slug list. The component uses it for the
 * `aria-label` fallback when a click misses every cluster, so the
 * screen reader still gets a useful announcement.
 */
export { SPHERE_CATALOG_SLUG_ORDER };

/**
 * Test-only escape hatch. The current implementation does not memoize
 * the layout (it runs a handful of arithmetic ops per cluster), but
 * the export is here so future memoization can be reset in tests
 * without a public-API churn. The test file imports it for
 * symmetry with `__resetSphereMiniPreviewCacheForTests`.
 */
export const __resetGalaxyHoloMinimapTestCaches = (): void => {
  // No-op for now — placeholder for future memoized lookups.
};
