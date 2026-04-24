import type { GamePoint } from '../game/types';
import type { NavigationSnapshot, NodeFocusSnapshot } from '../types/app-shell';

export type BulkLayoutScope = 'region' | 'focus-neighborhood';
export type BulkLayoutStrategy = 'tidy' | 'spread' | 'radial';
export type BulkLayoutPreviewPositions = Record<number, GamePoint>;

export interface BulkLayoutPreview {
  scope: BulkLayoutScope;
  strategy: BulkLayoutStrategy;
  nodeIds: number[];
  positions: BulkLayoutPreviewPositions;
}

interface LayoutNode {
  id: number;
  sphereId: number;
  position: GamePoint;
}

const REGION_SPACING_X = 132;
const REGION_SPACING_Y = 120;
const RING_RADIUS_BASE = 180;
const RING_RADIUS_STEP = 92;

const getAllNodes = (snapshot: NavigationSnapshot, positionIndex: Map<number, GamePoint>): LayoutNode[] => {
  const nodes: LayoutNode[] = [];

  snapshot.spheres.forEach((sphere) => {
    sphere.directions.forEach((direction) => {
      direction.skills.forEach((skill) => {
        skill.nodes.forEach((node) => {
          const position = positionIndex.get(node.id);
          if (!position) {
            return;
          }

          nodes.push({
            id: node.id,
            sphereId: sphere.id,
            position,
          });
        });
      });
    });
  });

  return nodes;
};

const computeCentroid = (positions: GamePoint[]): GamePoint => {
  if (positions.length === 0) {
    return { x: 0, y: 0 };
  }

  const total = positions.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / positions.length,
    y: total.y / positions.length,
  };
};

const sortBySpatialOrder = (a: LayoutNode, b: LayoutNode) => {
  if (a.position.y !== b.position.y) {
    return a.position.y - b.position.y;
  }

  if (a.position.x !== b.position.x) {
    return a.position.x - b.position.x;
  }

  return a.id - b.id;
};

const buildTidyPositions = (nodes: LayoutNode[]): BulkLayoutPreviewPositions => {
  const sortedNodes = [...nodes].sort(sortBySpatialOrder);
  const centroid = computeCentroid(sortedNodes.map((node) => node.position));
  const columns = Math.max(1, Math.ceil(Math.sqrt(sortedNodes.length)));
  const rows = Math.max(1, Math.ceil(sortedNodes.length / columns));
  const startX = centroid.x - ((columns - 1) * REGION_SPACING_X) / 2;
  const startY = centroid.y - ((rows - 1) * REGION_SPACING_Y) / 2;

  return Object.fromEntries(
    sortedNodes.map((node, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);

      return [
        node.id,
        {
          x: Math.round(startX + column * REGION_SPACING_X),
          y: Math.round(startY + row * REGION_SPACING_Y),
        },
      ];
    }),
  );
};

const buildSpreadPositions = (nodes: LayoutNode[]): BulkLayoutPreviewPositions => {
  const centroid = computeCentroid(nodes.map((node) => node.position));
  const sortedNodes = [...nodes].sort((left, right) => {
    const leftAngle = Math.atan2(left.position.y - centroid.y, left.position.x - centroid.x);
    const rightAngle = Math.atan2(right.position.y - centroid.y, right.position.x - centroid.x);
    return leftAngle - rightAngle;
  });

  return Object.fromEntries(
    sortedNodes.map((node, index) => {
      const angle = (-Math.PI / 2) + (index / Math.max(sortedNodes.length, 1)) * Math.PI * 2;
      const ring = Math.floor(index / 8);
      const radius = RING_RADIUS_BASE + ring * RING_RADIUS_STEP;

      return [
        node.id,
        {
          x: Math.round(centroid.x + Math.cos(angle) * radius),
          y: Math.round(centroid.y + Math.sin(angle) * radius),
        },
      ];
    }),
  );
};

const buildRadialPositions = (nodes: LayoutNode[], focusNodeId: number | null): BulkLayoutPreviewPositions => {
  const focusNode = focusNodeId != null ? nodes.find((node) => node.id === focusNodeId) ?? null : null;
  const center = focusNode?.position ?? computeCentroid(nodes.map((node) => node.position));
  const orbitNodes = nodes.filter((node) => node.id !== focusNode?.id);
  const positions: BulkLayoutPreviewPositions = {};

  if (focusNode) {
    positions[focusNode.id] = {
      x: Math.round(center.x),
      y: Math.round(center.y),
    };
  }

  orbitNodes.forEach((node, index) => {
    const angle = (-Math.PI / 2) + (index / Math.max(orbitNodes.length, 1)) * Math.PI * 2;
    const ring = Math.floor(index / 6);
    const radius = 150 + ring * RING_RADIUS_STEP;

    positions[node.id] = {
      x: Math.round(center.x + Math.cos(angle) * radius),
      y: Math.round(center.y + Math.sin(angle) * radius),
    };
  });

  return positions;
};

export const resolveBulkLayoutTargetIds = (
  snapshot: NavigationSnapshot | null,
  focus: NodeFocusSnapshot | null,
  scope: BulkLayoutScope,
  selectedSphereId: number | null,
): number[] => {
  if (!snapshot) {
    return [];
  }

  if (scope === 'region') {
    if (selectedSphereId == null) {
      return [];
    }

    const sphere = snapshot.spheres.find((item) => item.id === selectedSphereId);
    if (!sphere) {
      return [];
    }

    return sphere.directions.flatMap((direction) =>
      direction.skills.flatMap((skill) => skill.nodes.map((node) => node.id)),
    );
  }

  if (!focus?.node) {
    return [];
  }

  const connectedIds = snapshot.edges.flatMap((edge) => {
    if (edge.source_node_id === focus.node.id) {
      return [edge.target_node_id];
    }

    if (edge.target_node_id === focus.node.id) {
      return [edge.source_node_id];
    }

    return [];
  });

  return [...new Set([focus.node.id, ...connectedIds])];
};

export const buildBulkLayoutPreview = ({
  snapshot,
  focus,
  scope,
  strategy,
  selectedSphereId,
  positionIndex,
}: {
  snapshot: NavigationSnapshot | null;
  focus: NodeFocusSnapshot | null;
  scope: BulkLayoutScope;
  strategy: BulkLayoutStrategy;
  selectedSphereId: number | null;
  positionIndex: Map<number, GamePoint>;
}): BulkLayoutPreview | null => {
  if (!snapshot) {
    return null;
  }

  const targetIds = resolveBulkLayoutTargetIds(snapshot, focus, scope, selectedSphereId);
  if (targetIds.length === 0) {
    return null;
  }

  const nodeIndex = new Map(getAllNodes(snapshot, positionIndex).map((node) => [node.id, node]));
  const targetNodes = targetIds
    .map((nodeId) => nodeIndex.get(nodeId) ?? null)
    .filter((node): node is LayoutNode => node != null);

  if (targetNodes.length === 0) {
    return null;
  }

  const positions =
    strategy === 'tidy'
      ? buildTidyPositions(targetNodes)
      : strategy === 'spread'
        ? buildSpreadPositions(targetNodes)
        : buildRadialPositions(targetNodes, focus?.node?.id ?? null);

  return {
    scope,
    strategy,
    nodeIds: targetNodes.map((node) => node.id),
    positions,
  };
};
