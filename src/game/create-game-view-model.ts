import type { NavigationSnapshot, NodeFocusSnapshot } from '../types/app-shell';
import type {
  GameBiome,
  GameEdge,
  GameLegendItem,
  GameNode,
  GameNodeState,
  GameSceneModel,
} from './types';

const HUB_POSITION = { x: 460, y: 300 };
const BIOME_RING_RADIUS = 205;
const BIOME_RADIUS = 126;
const DIRECTION_RING_STEP = 34;
const NODE_STEP = 34;

const biomePalette = [
  { color: 0x17335f, accent: 0x60a5fa },
  { color: 0x32204f, accent: 0xe879f9 },
  { color: 0x153d3f, accent: 0x5eead4 },
  { color: 0x3f3116, accent: 0xfbbf24 },
  { color: 0x3a1f26, accent: 0xfb7185 },
  { color: 0x25381b, accent: 0xa3e635 },
];

const legendLabels: Record<GameNodeState, string> = {
  locked: 'Locked',
  available: 'Available',
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
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
    radius: BIOME_RADIUS + nodeCount * 2,
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

export const createGameViewModel = (
  snapshot: NavigationSnapshot | null,
  focus: NodeFocusSnapshot | null,
): GameSceneModel => {
  if (!snapshot) {
    return {
      biomes: [],
      nodes: [],
      edges: [],
      hub: { position: HUB_POSITION, label: 'Hub' },
      legend: [],
      hero: { nodeId: null, energy: 0 },
      highlightedNodeId: null,
    };
  }

  const nodes: GameNode[] = [];
  const edges: GameEdge[] = [];
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
      const directionAngle = -Math.PI / 2 + (directionIndex / totalDirections) * Math.PI * 2;

      direction.skills.forEach((skill, skillIndex) => {
        const skillRadius = 42 + directionIndex * DIRECTION_RING_STEP + skillIndex * 18;
        const skillX = biome.center.x + Math.cos(directionAngle) * skillRadius;
        const skillY = biome.center.y + Math.sin(directionAngle) * skillRadius;

        skill.nodes.forEach((node, nodeIndex) => {
          const nodeRadius = skillRadius + 26 + nodeIndex * NODE_STEP;
          const x = biome.center.x + Math.cos(directionAngle) * nodeRadius;
          const y = biome.center.y + Math.sin(directionAngle) * nodeRadius;

          nodes.push({
            id: node.id,
            title: node.title,
            subtitle: `${sphere.name} / ${direction.name} / ${skill.name}`,
            state: resolveNodeState(node, focus),
            position: {
              x: nodeIndex === 0 ? skillX : x,
              y: nodeIndex === 0 ? skillY : y,
            },
            biomeId: biome.id,
            nextActionTitle: node.next_action_title ?? null,
          });

          if (nodeIndex > 0) {
            edges.push({
              fromNodeId: skill.nodes[nodeIndex - 1].id,
              toNodeId: node.id,
            });
          }
        });
      });
    });
  });

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
  };
};
