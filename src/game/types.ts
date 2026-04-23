export type GameNodeState = 'locked' | 'available' | 'active' | 'completed' | 'paused';

export interface GamePoint {
  x: number;
  y: number;
}

export interface GameNode {
  id: number;
  title: string;
  subtitle: string;
  state: GameNodeState;
  position: GamePoint;
  biomeId: number;
  nextActionTitle?: string | null;
}

export interface GameEdge {
  fromNodeId: number;
  toNodeId: number;
}

export interface GameHero {
  nodeId: number | null;
  energy: number;
}

export interface GameBiome {
  id: number;
  name: string;
  center: GamePoint;
  radius: number;
  color: number;
  accent: number;
  nodeCount: number;
}

export interface GameHub {
  position: GamePoint;
  label: string;
}

export interface GameLegendItem {
  state: GameNodeState;
  label: string;
  count: number;
  color: number;
}

export interface GameSceneModel {
  biomes: GameBiome[];
  nodes: GameNode[];
  edges: GameEdge[];
  hub: GameHub;
  legend: GameLegendItem[];
  hero: GameHero;
  highlightedNodeId: number | null;
}
