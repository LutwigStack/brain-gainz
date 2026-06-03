export type GameNodeState = 'locked' | 'available' | 'active' | 'completed' | 'paused';
export type GameNodeControlState = 'unclaimed' | 'scouted' | 'controlled' | 'fortified' | 'weakened' | 'contested' | 'lost';
export type CanvasInteractionMode = 'free-edit' | 'layer-edit' | 'readonly';
export type GameMapPresentation = 'graph' | 'skill-atlas';
export type SkillAtlasNodeType =
  | 'root'
  | 'domain_hub'
  | 'course_hub'
  | 'topic_node'
  | 'atomic_node'
  | 'practice_node'
  | 'review_node'
  | 'boss_node';
export type SkillAtlasEdgeRole =
  | 'structure_root'
  | 'structure_branch'
  | 'local_cluster'
  | 'graph'
  | 'route_overlay';
export type SkillAtlasSourceKind = 'program' | 'sphere' | 'direction' | 'skill' | 'node';

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
  overviewPosition?: GamePoint;
  biomeId: number;
  nextActionTitle?: string | null;
  hierarchyDepth?: number;
  parentNodeId?: number | null;
  descendantCount?: number;
  isOverviewVisible?: boolean;
  isOnSelectedPath?: boolean;
  isRouteNode?: boolean;
  isRouteComplete?: boolean;
  isCurrentRouteTarget?: boolean;
  isRouteLocked?: boolean;
  isWeakRouteNode?: boolean;
  controlState?: GameNodeControlState | null;
  routeNodeId?: number;
  routeSequenceIndex?: number;
  routeOrder?: number | null;
  routeStage?: string | null;
  routeRequiredMasteryLevel?: string | null;
  routeCurrentMasteryRank?: number;
  atlasNodeType?: SkillAtlasNodeType;
  atlasStableId?: string;
  atlasSourceKind?: SkillAtlasSourceKind;
  atlasSourceId?: number | string;
  atlasIconKey?: string;
  atlasGroupKey?: string;
  atlasRing?: number;
  atlasAngle?: number;
  atlasSectorColor?: number;
}

export interface GameEdge {
  id: number;
  fromNodeId: number;
  toNodeId: number;
  type: 'requires' | 'supports' | 'relates_to';
  atlasEdgeRole?: SkillAtlasEdgeRole;
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

export interface GameBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  center: GamePoint;
}

export interface GameSceneModel {
  biomes: GameBiome[];
  nodes: GameNode[];
  edges: GameEdge[];
  hub: GameHub;
  legend: GameLegendItem[];
  hero: GameHero;
  highlightedNodeId: number | null;
  bounds: GameBounds;
  overviewBounds?: GameBounds;
  isLargeGraph?: boolean;
}
