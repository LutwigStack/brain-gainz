import type { GameBounds, GameEdge, GameNode, SkillAtlasNodeType } from './types';

export type AtlasLabelBand = 'overview' | 'mid' | 'detail';
export type AtlasLabelTier = 'primary' | 'child';

export interface AtlasLabelSelection {
  nodeId: number;
  tier: AtlasLabelTier;
  band: AtlasLabelBand;
}

export interface AtlasLabelOptions {
  viewportBounds: GameBounds;
  zoom?: number;
  previousBand?: AtlasLabelBand | null;
  highlightedNodeId?: number | null;
  nodeMargin?: number;
}

const LABELABLE_TYPES: ReadonlySet<SkillAtlasNodeType> = new Set([
  'root',
  'domain_hub',
  'course_hub',
  'topic_node',
]);

const ATLAS_TYPE_RANK: Record<SkillAtlasNodeType, number> = {
  root: 0,
  domain_hub: 1,
  course_hub: 2,
  topic_node: 3,
  atomic_node: 4,
  practice_node: 4,
  review_node: 4,
  boss_node: 4,
};

const BAND_LABEL_TYPES: Record<AtlasLabelBand, ReadonlySet<SkillAtlasNodeType>> = {
  overview: new Set(['root', 'domain_hub']),
  mid: new Set(['root', 'domain_hub', 'course_hub']),
  detail: new Set(['root', 'domain_hub', 'course_hub', 'topic_node']),
};

const BAND_CAPS: Record<AtlasLabelBand, number> = {
  overview: 9,
  mid: 24,
  detail: 40,
};

const BAND_CHILD_RANK: Record<AtlasLabelBand, number> = {
  overview: ATLAS_TYPE_RANK.domain_hub,
  mid: ATLAS_TYPE_RANK.course_hub,
  detail: ATLAS_TYPE_RANK.topic_node,
};

const DEFAULT_NODE_MARGIN = 30;
const MID_ENTER_ZOOM = 0.72;
const MID_EXIT_ZOOM = 0.54;
const DETAIL_ENTER_ZOOM = 1.16;
const DETAIL_EXIT_ZOOM = 0.98;

export const resolveAtlasLabelBand = (zoom = 1, previousBand: AtlasLabelBand | null = null): AtlasLabelBand => {
  if (previousBand === 'detail') {
    return zoom <= DETAIL_EXIT_ZOOM ? 'mid' : 'detail';
  }

  if (previousBand === 'mid') {
    if (zoom >= DETAIL_ENTER_ZOOM) {
      return 'detail';
    }
    if (zoom <= MID_EXIT_ZOOM) {
      return 'overview';
    }
    return 'mid';
  }

  if (zoom >= DETAIL_ENTER_ZOOM) {
    return 'detail';
  }
  if (zoom >= MID_ENTER_ZOOM) {
    return 'mid';
  }
  return 'overview';
};

const isLabelableAtlasNode = (node: GameNode): boolean =>
  Boolean(node.atlasNodeType && LABELABLE_TYPES.has(node.atlasNodeType));

const isNodeFullyInBounds = (node: GameNode, bounds: GameBounds, margin: number): boolean =>
  node.position.x - margin >= bounds.minX &&
  node.position.x + margin <= bounds.maxX &&
  node.position.y - margin >= bounds.minY &&
  node.position.y + margin <= bounds.maxY;

const compareByAtlasPriority =
  (bounds: GameBounds, highlightedNodeId: number | null | undefined) =>
  (left: GameNode, right: GameNode): number => {
    const leftHighlighted = highlightedNodeId != null && left.id === highlightedNodeId ? 0 : 1;
    const rightHighlighted = highlightedNodeId != null && right.id === highlightedNodeId ? 0 : 1;
    if (leftHighlighted !== rightHighlighted) {
      return leftHighlighted - rightHighlighted;
    }

    const leftRank = ATLAS_TYPE_RANK[left.atlasNodeType ?? 'atomic_node'];
    const rightRank = ATLAS_TYPE_RANK[right.atlasNodeType ?? 'atomic_node'];
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    const leftDistance = Math.hypot(left.position.x - bounds.center.x, left.position.y - bounds.center.y);
    const rightDistance = Math.hypot(right.position.x - bounds.center.x, right.position.y - bounds.center.y);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.id - right.id;
  };

export const selectAtlasContextLabels = (
  nodes: GameNode[],
  _edges: GameEdge[],
  options: AtlasLabelOptions,
): AtlasLabelSelection[] => {
  const nodeMargin = options.nodeMargin ?? DEFAULT_NODE_MARGIN;
  const band = resolveAtlasLabelBand(options.zoom, options.previousBand);
  const labelTypes = BAND_LABEL_TYPES[band];
  const caps = BAND_CAPS[band];
  const prioritySort = compareByAtlasPriority(options.viewportBounds, options.highlightedNodeId);
  const visibleLabelableNodes = nodes
    .filter((node) =>
      isLabelableAtlasNode(node) &&
      node.atlasNodeType != null &&
      labelTypes.has(node.atlasNodeType) &&
      isNodeFullyInBounds(node, options.viewportBounds, nodeMargin))
    .sort(prioritySort);

  if (visibleLabelableNodes.length === 0) {
    return [];
  }

  const childRank = BAND_CHILD_RANK[band];
  return visibleLabelableNodes.slice(0, caps).map((node) => ({
    nodeId: node.id,
    tier: ATLAS_TYPE_RANK[node.atlasNodeType ?? 'atomic_node'] >= childRank ? 'child' as const : 'primary' as const,
    band,
  }));
};
