import type { NavigationSnapshot, NodeFocusSnapshot } from '../types/app-shell';
import type {
  GameBiome,
  GameBounds,
  GameEdge,
  GameLegendItem,
  GameNode,
  GameNodeState,
  GamePoint,
  GameSceneModel,
} from './types';

const HUB_POSITION = { x: 0, y: 0 };
const BIOME_RING_RADIUS = 360;
const BIOME_RADIUS = 164;
const DIRECTION_RING_STEP = 48;
const NODE_STEP = 72;

const biomePalette = [
  { color: 0x17335f, accent: 0x60a5fa },
  { color: 0x32204f, accent: 0xe879f9 },
  { color: 0x153d3f, accent: 0x5eead4 },
  { color: 0x3f3116, accent: 0xfbbf24 },
  { color: 0x3a1f26, accent: 0xfb7185 },
  { color: 0x25381b, accent: 0xa3e635 },
] as const;

const legendLabels: Record<GameNodeState, string> = {
  locked: 'Закрыт',
  available: 'Доступен',
  active: 'Активен',
  completed: 'Завершён',
  paused: 'На паузе',
};

const legendColors: Record<GameNodeState, number> = {
  locked: 0x64748b,
  available: 0x5eead4,
  active: 0x93c5fd,
  completed: 0xb9fbc0,
  paused: 0xfdba74,
};

const resolveNodeState = (
  node: {
    id: number;
    status: string;
    open_action_count: number;
  },
  focus: NodeFocusSnapshot | null,
): GameNodeState => {
  if (focus?.node?.id === node.id) {
    return 'active';
  }

  if (node.status === 'done') {
    return 'completed';
  }

  if (node.status === 'paused') {
    return 'paused';
  }

  if (node.open_action_count > 0) {
    return 'available';
  }

  return 'locked';
};

const resolveHeroEnergy = (focus: NodeFocusSnapshot | null) => {
  if (!focus?.progress) {
    return 0.35;
  }

  const progressEnergy = focus.progress.completionPercent / 100;
  const normalizedEnergy = Number.isFinite(progressEnergy)
    ? progressEnergy
    : focus.progress.openActions > 0
      ? 0.45
      : 0.3;

  return Math.min(1, Math.max(0.2, normalizedEnergy));
};

const createBiome = (sphereName: string, index: number, total: number, nodeCount: number): GameBiome => {
  const angle = -Math.PI / 2 + (index / Math.max(total, 1)) * Math.PI * 2;
  const palette = biomePalette[index % biomePalette.length];

  return {
    id: index + 1,
    name: sphereName,
    center: {
      x: HUB_POSITION.x + Math.cos(angle) * BIOME_RING_RADIUS,
      y: HUB_POSITION.y + Math.sin(angle) * BIOME_RING_RADIUS,
    },
    radius: BIOME_RADIUS + nodeCount * 4,
    color: palette.color,
    accent: palette.accent,
    nodeCount,
  };
};

const createLegend = (nodes: GameNode[]): GameLegendItem[] =>
  (Object.keys(legendLabels) as GameNodeState[]).map((state) => ({
    state,
    label: legendLabels[state],
    count: nodes.filter((node) => node.state === state).length,
    color: legendColors[state],
  }));

const createFallbackNodePosition = (
  biome: GameBiome,
  directionIndex: number,
  totalDirections: number,
  skillIndex: number,
  nodeIndex: number,
): GamePoint => {
  const directionAngle = -Math.PI / 2 + (directionIndex / totalDirections) * Math.PI * 2;
  const skillRadius = 56 + directionIndex * DIRECTION_RING_STEP + skillIndex * 28;
  const nodeRadius = skillRadius + 38 + nodeIndex * NODE_STEP;

  if (nodeIndex === 0) {
    return {
      x: biome.center.x + Math.cos(directionAngle) * skillRadius,
      y: biome.center.y + Math.sin(directionAngle) * skillRadius,
    };
  }

  return {
    x: biome.center.x + Math.cos(directionAngle) * nodeRadius,
    y: biome.center.y + Math.sin(directionAngle) * nodeRadius,
  };
};

const computeBounds = (nodes: GameNode[], biomes: GameBiome[]): GameBounds => {
  const anchorPoints: GamePoint[] = [
    HUB_POSITION,
    ...nodes.map((node) => node.position),
    ...biomes.flatMap((biome) => [
      { x: biome.center.x - biome.radius - 24, y: biome.center.y - biome.radius - 24 },
      { x: biome.center.x + biome.radius + 24, y: biome.center.y + biome.radius + 24 },
    ]),
  ];

  if (anchorPoints.length === 0) {
    return {
      minX: -240,
      minY: -180,
      maxX: 240,
      maxY: 180,
      width: 480,
      height: 360,
      center: { x: 0, y: 0 },
    };
  }

  const minX = Math.min(...anchorPoints.map((point) => point.x));
  const minY = Math.min(...anchorPoints.map((point) => point.y));
  const maxX = Math.max(...anchorPoints.map((point) => point.x));
  const maxY = Math.max(...anchorPoints.map((point) => point.y));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
    center: {
      x: minX + (maxX - minX) / 2,
      y: minY + (maxY - minY) / 2,
    },
  };
};

export const createGameViewModel = (
  snapshot: NavigationSnapshot | null,
  focus: NodeFocusSnapshot | null,
): GameSceneModel => {
  if (!snapshot) {
    return {
      biomes: [],
      nodes: [],
      edges: [],
      hub: { position: HUB_POSITION, label: 'Core' },
      legend: [],
      hero: { nodeId: null, energy: 0 },
      highlightedNodeId: null,
      bounds: {
        minX: -240,
        minY: -180,
        maxX: 240,
        maxY: 180,
        width: 480,
        height: 360,
        center: { x: 0, y: 0 },
      },
    };
  }

  const nodes: GameNode[] = [];
  const biomes = snapshot.spheres.map((sphere, index) =>
    createBiome(
      sphere.name,
      index,
      snapshot.spheres.length,
      sphere.directions.reduce((sum, direction) => sum + direction.node_count, 0),
    ),
  );

  snapshot.spheres.forEach((sphere, sphereIndex) => {
    const biome = biomes[sphereIndex];
    const totalDirections = Math.max(sphere.directions.length, 1);

    sphere.directions.forEach((direction, directionIndex) => {
      direction.skills.forEach((skill, skillIndex) => {
        skill.nodes.forEach((node, nodeIndex) => {
          const fallbackPosition = createFallbackNodePosition(
            biome,
            directionIndex,
            totalDirections,
            skillIndex,
            nodeIndex,
          );

          nodes.push({
            id: node.id,
            title: node.title,
            subtitle: `${sphere.name} / ${direction.name} / ${skill.name}`,
            state: resolveNodeState(node, focus),
            position: {
              x: node.x ?? fallbackPosition.x,
              y: node.y ?? fallbackPosition.y,
            },
            biomeId: biome.id,
            nextActionTitle: node.next_action_title ?? null,
          });
        });
      });
    });
  });

  const activeNodeIds = new Set(nodes.map((node) => node.id));
  const edges: GameEdge[] = snapshot.edges
    .filter(
      (edge, index, collection) =>
        activeNodeIds.has(edge.source_node_id) &&
        activeNodeIds.has(edge.target_node_id) &&
        collection.findIndex((candidate) => candidate.id === edge.id) === index,
    )
    .map((edge) => ({
      id: edge.id,
      fromNodeId: edge.source_node_id,
      toNodeId: edge.target_node_id,
      type: edge.edge_type,
    }));

  const selectedNodeId = focus?.node?.id ?? snapshot.defaultSelection?.nodeId ?? nodes[0]?.id ?? null;

  return {
    biomes,
    nodes,
    edges,
    hub: {
      position: HUB_POSITION,
      label: 'Core',
    },
    legend: createLegend(nodes),
    hero: {
      nodeId: selectedNodeId,
      energy: resolveHeroEnergy(focus),
    },
    highlightedNodeId: selectedNodeId,
    bounds: computeBounds(nodes, biomes),
  };
};
