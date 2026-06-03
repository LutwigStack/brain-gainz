import type {
  GraphEdgeType,
  NavigationDirection,
  NavigationNodeSummary,
  NavigationSkill,
  NavigationSnapshot,
  NavigationSphere,
} from '../types/app-shell';
import { parseCourseCatalogNodeMetadata } from '../application/course-catalog-metadata.ts';
import type {
  GameBiome,
  GameEdge,
  GameNode,
  GameNodeState,
  GameSceneModel,
  SkillAtlasNodeType,
} from './types';

export type SkillAtlasSourceKind = 'program' | 'sphere' | 'direction' | 'skill' | 'node';

export type SkillAtlasNodeVisualType =
  | 'root'
  | 'domain_hub'
  | 'course_hub'
  | 'topic_node'
  | 'atomic_node'
  | 'practice_node'
  | 'review_node'
  | 'boss_node';

export type SkillAtlasNodeState =
  | 'locked'
  | 'available'
  | 'current'
  | 'in_progress'
  | 'verified'
  | 'self_marked'
  | 'weak'
  | 'contested'
  | 'boss';

export type SkillAtlasLayoutEdgeRole =
  | 'structure_root'
  | 'structure_branch'
  | 'local_cluster'
  | 'graph'
  | 'route_overlay';

export interface SkillAtlasPoint {
  x: number;
  y: number;
}

export interface SkillAtlasRouteOverlayNode {
  nodeId: number;
  routeOrder?: number | null;
  routeStage?: string | null;
  isCurrent?: boolean;
  isComplete?: boolean;
  isWeak?: boolean;
  isContested?: boolean;
  isLocked?: boolean;
  isBoss?: boolean;
}

export interface SkillAtlasLayoutOptions {
  visibleSphereId?: number | null;
  visibleSkillId?: number | null;
  visibleNodeIds?: Set<number> | number[] | null;
  weakNodeIds?: Set<number> | number[] | null;
  contestedNodeIds?: Set<number> | number[] | null;
  bossNodeIds?: Set<number> | number[] | null;
  routeOverlay?: SkillAtlasRouteOverlayNode[] | null;
  programTitle?: string | null;
}

export interface SkillAtlasFocusLike {
  node?: { id: number } | null;
}

export interface SkillAtlasNodeStateFlags {
  focused: boolean;
  focusedDescendant: boolean;
  routeCurrent: boolean;
  routeComplete: boolean;
  routeLocked: boolean;
  boss: boolean;
  contested: boolean;
  weak: boolean;
  verified: boolean;
  selfMarked: boolean;
  inProgress: boolean;
  available: boolean;
  locked: boolean;
}

export interface SkillAtlasLayoutNode {
  stableId: string;
  sourceKind: SkillAtlasSourceKind;
  sourceId: number | string;
  navigationNodeId: number | null;
  title: string;
  path: string;
  x: number;
  y: number;
  radius: number;
  angle: number;
  ring: number;
  sectorKey: string;
  visualType: SkillAtlasNodeVisualType;
  state: SkillAtlasNodeState;
  stateFlags: SkillAtlasNodeStateFlags;
  size: number;
  iconKey: string;
  routeOrder: number | null;
  routeStage: string | null;
  childNodeCount: number;
}

export interface SkillAtlasLayoutEdge {
  id: string;
  fromStableId: string;
  toStableId: string;
  edgeType: 'structure' | GraphEdgeType | 'route';
  edgeRole: SkillAtlasLayoutEdgeRole;
  isOverlay: boolean;
  points?: SkillAtlasPoint[];
}

export interface SkillAtlasLayoutBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  center: SkillAtlasPoint;
}

export interface SkillAtlasSector {
  key: string;
  title: string;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  nodeCount: number;
}

export interface SkillAtlasLayoutModel {
  nodes: SkillAtlasLayoutNode[];
  edges: SkillAtlasLayoutEdge[];
  baseEdges: SkillAtlasLayoutEdge[];
  routeEdges: SkillAtlasLayoutEdge[];
  sectors: SkillAtlasSector[];
  bounds: SkillAtlasLayoutBounds;
  rootStableId: string;
  focusedStableId: string | null;
}

interface NavigationNodeContext {
  sphere: NavigationSphere;
  direction: NavigationDirection;
  skill: NavigationSkill;
  node: NavigationNodeSummary;
}

const ROOT_STABLE_ID = 'program:root';
const DEFAULT_PROGRAM_TITLE = 'Программа';
const FULL_CIRCLE = Math.PI * 2;
const START_ANGLE = -Math.PI / 2;
const ROOT_SIZE = 42;
const DOMAIN_RING_RADIUS = 260;
const COURSE_RING_RADIUS = 500;
const TOPIC_RING_RADIUS = 720;
const COURSE_DENSE_MIN_ANGLE_STEP = 0.12;
const COURSE_DENSE_MAX_SPAN = Math.PI * 0.68;
const COURSE_NODE_RADIAL_STAGGER = 58;
const COURSE_NODE_OUTER_STEP = 86;
const ATOMIC_CLUSTER_RADIUS = 150;
const ATOMIC_CLUSTER_RING_STEP = 78;
const ATOMIC_CLUSTER_CAPACITY = 8;
const ATOMIC_CLUSTER_ALT_RADIUS = 24;
const ATOMIC_CLUSTER_SPREAD = Math.PI * 1.62;
const NODE_POSITION_PRECISION = 1000;
const SECTOR_GUTTER = 0.035;

const visualSizes: Record<SkillAtlasNodeVisualType, number> = {
  root: ROOT_SIZE,
  domain_hub: 34,
  course_hub: 28,
  topic_node: 22,
  atomic_node: 14,
  practice_node: 15,
  review_node: 15,
  boss_node: 30,
};

const emptyFlags = (): SkillAtlasNodeStateFlags => ({
  focused: false,
  focusedDescendant: false,
  routeCurrent: false,
  routeComplete: false,
  routeLocked: false,
  boss: false,
  contested: false,
  weak: false,
  verified: false,
  selfMarked: false,
  inProgress: false,
  available: false,
  locked: false,
});

const toIdSet = (ids?: Set<number> | number[] | null): Set<number> | null => {
  if (ids == null) {
    return null;
  }

  return ids instanceof Set ? ids : new Set(ids);
};

const roundPosition = (value: number) => Math.round(value * NODE_POSITION_PRECISION) / NODE_POSITION_PRECISION;

const polarPoint = (radius: number, angle: number): SkillAtlasPoint => ({
  x: roundPosition(Math.cos(angle) * radius),
  y: roundPosition(Math.sin(angle) * radius),
});

const offsetPoint = (origin: SkillAtlasPoint, radius: number, angle: number): SkillAtlasPoint => ({
  x: roundPosition(origin.x + Math.cos(angle) * radius),
  y: roundPosition(origin.y + Math.sin(angle) * radius),
});

const pointRadius = (point: SkillAtlasPoint) => roundPosition(Math.hypot(point.x, point.y));

const distributeAngle = (startAngle: number, endAngle: number, index: number, total: number) => {
  if (total <= 1) {
    return startAngle + (endAngle - startAngle) / 2;
  }

  const padding = Math.min((endAngle - startAngle) * 0.18, 0.22);
  return startAngle + padding + ((endAngle - startAngle - padding * 2) * index) / (total - 1);
};

const createSector = (sphere: NavigationSphere, index: number, total: number): SkillAtlasSector => {
  const sectorWidth = FULL_CIRCLE / Math.max(total, 1);
  const startAngle = START_ANGLE + index * sectorWidth + SECTOR_GUTTER;
  const endAngle = START_ANGLE + (index + 1) * sectorWidth - SECTOR_GUTTER;

  return {
    key: `sphere:${sphere.id}`,
    title: sphere.name,
    startAngle,
    endAngle,
    centerAngle: startAngle + (endAngle - startAngle) / 2,
    nodeCount: sphere.node_count,
  };
};

const normalizeNodeType = (node: NavigationNodeSummary): SkillAtlasNodeVisualType => {
  const rawType = node.type.toLowerCase();
  const title = node.title.toLowerCase();

  const courseMetadata = parseCourseCatalogNodeMetadata(node.links);
  if (courseMetadata) {
    return courseMetadata.atlasHubType === 'project_hub' ? 'boss_node' : 'course_hub';
  }

  if (rawType.includes('boss') || rawType.includes('exam') || rawType.includes('checkpoint') || title.includes('checkpoint')) {
    return 'boss_node';
  }

  if (rawType.includes('practice') || rawType.includes('exercise') || rawType.includes('drill')) {
    return 'practice_node';
  }

  if (rawType.includes('review') || rawType.includes('spaced')) {
    return 'review_node';
  }

  return 'atomic_node';
};

const deriveIconKey = (visualType: SkillAtlasNodeVisualType, nodeType?: string) => {
  if (visualType === 'practice_node') {
    return 'practice';
  }

  if (visualType === 'review_node') {
    return 'review';
  }

  if (visualType === 'boss_node') {
    return 'boss';
  }

  if (visualType === 'domain_hub') {
    return 'domain';
  }

  if (visualType === 'course_hub') {
    return 'course';
  }

  if (visualType === 'topic_node') {
    return 'topic';
  }

  if (visualType === 'root') {
    return 'program';
  }

  return nodeType || 'knowledge';
};

const chooseState = (flags: SkillAtlasNodeStateFlags): SkillAtlasNodeState => {
  if (flags.focused || flags.routeCurrent) return 'current';
  if (flags.boss) return 'boss';
  if (flags.contested) return 'contested';
  if (flags.weak) return 'weak';
  if (flags.verified || flags.routeComplete) return 'verified';
  if (flags.inProgress) return 'in_progress';
  if (flags.available) return 'available';
  if (flags.locked || flags.routeLocked) return 'locked';
  if (flags.selfMarked) return 'self_marked';

  return 'locked';
};

const resolveNodeFlags = (
  node: NavigationNodeSummary,
  visualType: SkillAtlasNodeVisualType,
  focusedNodeId: number | null,
  routeMetadata: Map<number, SkillAtlasRouteOverlayNode>,
  weakNodeIds: Set<number> | null,
  contestedNodeIds: Set<number> | null,
  bossNodeIds: Set<number> | null,
): SkillAtlasNodeStateFlags => {
  const flags = emptyFlags();
  const route = routeMetadata.get(node.id);
  const status = node.status.toLowerCase();

  flags.focused = focusedNodeId === node.id;
  flags.routeCurrent = route?.isCurrent === true;
  flags.routeComplete = route?.isComplete === true;
  flags.routeLocked = route?.isLocked === true;
  flags.boss = visualType === 'boss_node' || route?.isBoss === true || bossNodeIds?.has(node.id) === true;
  flags.contested = route?.isContested === true || contestedNodeIds?.has(node.id) === true;
  flags.weak = route?.isWeak === true || weakNodeIds?.has(node.id) === true || visualType === 'review_node';
  flags.verified = route?.isComplete === true || status === 'done' || status === 'verified' || status === 'completed';
  flags.selfMarked = status === 'self_marked' || status === 'familiar' || status === 'seen';
  flags.inProgress = status === 'active' || status === 'paused' || status === 'in_progress';
  flags.available = node.open_action_count > 0 || status === 'ready' || status === 'available';
  flags.locked =
    !flags.verified &&
    !flags.selfMarked &&
    !flags.inProgress &&
    !flags.available &&
    !flags.routeComplete &&
    !flags.routeCurrent;

  return flags;
};

const combineFlags = (children: SkillAtlasNodeStateFlags[], focusedDescendant: boolean): SkillAtlasNodeStateFlags => {
  const flags = emptyFlags();

  flags.focusedDescendant = focusedDescendant;
  flags.routeCurrent = children.some((child) => child.routeCurrent || child.focused);
  flags.routeComplete = children.length > 0 && children.every((child) => child.routeComplete || child.verified);
  flags.routeLocked = children.length > 0 && children.every((child) => child.routeLocked || child.locked);
  flags.boss = children.some((child) => child.boss);
  flags.contested = children.some((child) => child.contested);
  flags.weak = children.some((child) => child.weak);
  flags.verified = children.length > 0 && children.every((child) => child.verified || child.routeComplete);
  flags.selfMarked = children.length > 0 && children.every((child) => child.selfMarked);
  flags.inProgress = children.some((child) => child.inProgress);
  flags.available = children.some((child) => child.available);
  flags.locked = children.length > 0 && children.every((child) => child.locked || child.routeLocked);

  return flags;
};

const createLayoutNode = (input: {
  stableId: string;
  sourceKind: SkillAtlasSourceKind;
  sourceId: number | string;
  navigationNodeId?: number | null;
  title: string;
  path: string;
  point: SkillAtlasPoint;
  radius: number;
  angle: number;
  ring: number;
  sectorKey: string;
  visualType: SkillAtlasNodeVisualType;
  stateFlags: SkillAtlasNodeStateFlags;
  routeOrder?: number | null;
  routeStage?: string | null;
  childNodeCount?: number;
  nodeType?: string;
}): SkillAtlasLayoutNode => ({
  stableId: input.stableId,
  sourceKind: input.sourceKind,
  sourceId: input.sourceId,
  navigationNodeId: input.navigationNodeId ?? null,
  title: input.title,
  path: input.path,
  x: input.point.x,
  y: input.point.y,
  radius: input.radius,
  angle: roundPosition(input.angle),
  ring: input.ring,
  sectorKey: input.sectorKey,
  visualType: input.visualType,
  state: chooseState(input.stateFlags),
  stateFlags: input.stateFlags,
  size: visualSizes[input.visualType],
  iconKey: deriveIconKey(input.visualType, input.nodeType),
  routeOrder: input.routeOrder ?? null,
  routeStage: input.routeStage ?? null,
  childNodeCount: input.childNodeCount ?? 0,
});

const collectNodeContexts = (snapshot: NavigationSnapshot): Map<number, NavigationNodeContext> => {
  const contexts = new Map<number, NavigationNodeContext>();

  snapshot.spheres.forEach((sphere) => {
    sphere.directions.forEach((direction) => {
      direction.skills.forEach((skill) => {
        skill.nodes.forEach((node) => {
          contexts.set(node.id, { sphere, direction, skill, node });
        });
      });
    });
  });

  return contexts;
};

const shouldIncludeNode = (
  node: NavigationNodeSummary,
  skill: NavigationSkill,
  options: SkillAtlasLayoutOptions,
  visibleNodeIds: Set<number> | null,
  focusedNodeId: number | null,
) => {
  if (options.visibleSkillId != null && skill.id !== options.visibleSkillId) {
    return false;
  }

  if (visibleNodeIds == null) {
    return true;
  }

  return visibleNodeIds.has(node.id) || focusedNodeId === node.id;
};

const isCourseCatalogNode = (node: NavigationNodeSummary | null | undefined) =>
  node != null && parseCourseCatalogNodeMetadata(node.links) !== null;

const computeBounds = (nodes: SkillAtlasLayoutNode[]): SkillAtlasLayoutBounds => {
  if (nodes.length === 0) {
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

  const padding = 96;
  const minX = Math.min(...nodes.map((node) => node.x - node.size)) - padding;
  const minY = Math.min(...nodes.map((node) => node.y - node.size)) - padding;
  const maxX = Math.max(...nodes.map((node) => node.x + node.size)) + padding;
  const maxY = Math.max(...nodes.map((node) => node.y + node.size)) + padding;

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

const createRouteEdges = (routeOverlay: SkillAtlasRouteOverlayNode[] | null | undefined): SkillAtlasLayoutEdge[] => {
  if (!routeOverlay?.length) {
    return [];
  }

  const ordered = routeOverlay
    .filter((node) => node.routeOrder != null)
    .slice()
    .sort((left, right) => Number(left.routeOrder) - Number(right.routeOrder));

  return ordered.slice(1).map((node, index) => ({
    id: `route:${ordered[index].nodeId}->${node.nodeId}`,
    fromStableId: `node:${ordered[index].nodeId}`,
    toStableId: `node:${node.nodeId}`,
    edgeType: 'route',
    edgeRole: 'route_overlay',
    isOverlay: true,
  }));
};

export const createSkillAtlasLayout = (
  snapshot: NavigationSnapshot,
  focus: SkillAtlasFocusLike | null = null,
  options: SkillAtlasLayoutOptions = {},
): SkillAtlasLayoutModel => {
  const programTitle = options.programTitle?.trim() || DEFAULT_PROGRAM_TITLE;
  const focusedNodeId = focus?.node?.id ?? snapshot.defaultSelection?.nodeId ?? null;
  const visibleNodeIds = toIdSet(options.visibleNodeIds);
  const weakNodeIds = toIdSet(options.weakNodeIds);
  const contestedNodeIds = toIdSet(options.contestedNodeIds);
  const bossNodeIds = toIdSet(options.bossNodeIds);
  const routeMetadata = new Map((options.routeOverlay ?? []).map((node) => [node.nodeId, node]));
  const allNodeContexts = collectNodeContexts(snapshot);
  const includedNodeContexts = new Map<number, NavigationNodeContext>();

  allNodeContexts.forEach((context, nodeId) => {
    if (options.visibleSphereId != null && context.sphere.id !== options.visibleSphereId) {
      return;
    }

    if (!shouldIncludeNode(context.node, context.skill, options, visibleNodeIds, focusedNodeId)) {
      return;
    }

    includedNodeContexts.set(nodeId, context);
  });

  const visibleSpheres = snapshot.spheres.filter((sphere) => {
    if (options.visibleSphereId != null && sphere.id !== options.visibleSphereId) {
      return false;
    }

    return Array.from(includedNodeContexts.values()).some((context) => context.sphere.id === sphere.id);
  });
  const sectors = visibleSpheres.map((sphere, index) => createSector(sphere, index, visibleSpheres.length));
  const sectorBySphereId = new Map(visibleSpheres.map((sphere, index) => [sphere.id, sectors[index]]));
  const nodes: SkillAtlasLayoutNode[] = [];
  const baseEdges: SkillAtlasLayoutEdge[] = [];
  const nodeFlagsByStableId = new Map<string, SkillAtlasNodeStateFlags>();
  const focusedStableId = focusedNodeId != null && includedNodeContexts.has(focusedNodeId) ? `node:${focusedNodeId}` : null;

  const rootFlags = emptyFlags();
  rootFlags.focusedDescendant = focusedStableId != null;
  nodes.push(
    createLayoutNode({
      stableId: ROOT_STABLE_ID,
      sourceKind: 'program',
      sourceId: 'root',
      title: programTitle,
      path: programTitle,
      point: { x: 0, y: 0 },
      radius: 0,
      angle: 0,
      ring: 0,
      sectorKey: 'program',
      visualType: 'root',
      stateFlags: rootFlags,
      childNodeCount: includedNodeContexts.size,
    }),
  );

  visibleSpheres.forEach((sphere) => {
    const sector = sectorBySphereId.get(sphere.id);
    if (!sector) {
      return;
    }

    const visibleDirections = sphere.directions.filter((direction) =>
      Array.from(includedNodeContexts.values()).some((context) => context.direction.id === direction.id),
    );
    const directionFlagGroups: SkillAtlasNodeStateFlags[] = [];
    const sphereStableId = `sphere:${sphere.id}`;

    baseEdges.push({
      id: `structure:${ROOT_STABLE_ID}->${sphereStableId}`,
      fromStableId: ROOT_STABLE_ID,
      toStableId: sphereStableId,
      edgeType: 'structure',
      edgeRole: 'structure_root',
      isOverlay: false,
    });

    visibleDirections.forEach((direction, directionIndex) => {
      const directionAngle = distributeAngle(sector.startAngle, sector.endAngle, directionIndex, visibleDirections.length);
      const directionSpan = Math.max((sector.endAngle - sector.startAngle) / Math.max(visibleDirections.length, 1), 0.32);
      const directionStartAngle = directionAngle - directionSpan / 2;
      const directionEndAngle = directionAngle + directionSpan / 2;
      const visibleSkills = direction.skills.filter((skill) =>
        skill.nodes.some((node) => includedNodeContexts.has(node.id)),
      );
      const skillFlagGroups: SkillAtlasNodeStateFlags[] = [];
      const directionStableId = `direction:${direction.id}`;

      const isSyntheticCourseSkill = (skill: NavigationSkill) => {
        const visibleNodes = skill.nodes.filter((node) => includedNodeContexts.has(node.id));
        return visibleNodes.length === 1 && isCourseCatalogNode(visibleNodes[0]);
      };
      const collapseSyntheticCourseDirection =
        visibleSkills.length > 0 && visibleSkills.every((skill) => isSyntheticCourseSkill(skill));
      const branchParentStableId = collapseSyntheticCourseDirection ? sphereStableId : directionStableId;
      const denseCourseSpan = collapseSyntheticCourseDirection
        ? Math.min(
            COURSE_DENSE_MAX_SPAN,
            Math.max(directionSpan, COURSE_DENSE_MIN_ANGLE_STEP * Math.max(visibleSkills.length - 1, 1) + 0.22),
          )
        : directionSpan;
      const skillStartAngle = collapseSyntheticCourseDirection ? directionAngle - denseCourseSpan / 2 : directionStartAngle;
      const skillEndAngle = collapseSyntheticCourseDirection ? directionAngle + denseCourseSpan / 2 : directionEndAngle;

      if (!collapseSyntheticCourseDirection) {
        baseEdges.push({
          id: `structure:${sphereStableId}->${directionStableId}`,
          fromStableId: sphereStableId,
          toStableId: directionStableId,
          edgeType: 'structure',
          edgeRole: 'structure_branch',
          isOverlay: false,
        });
      }

      visibleSkills.forEach((skill, skillIndex) => {
        const skillAngle = distributeAngle(skillStartAngle, skillEndAngle, skillIndex, visibleSkills.length);
        const visibleNodes = skill.nodes.filter((node) => includedNodeContexts.has(node.id));
        const childFlags: SkillAtlasNodeStateFlags[] = [];
        const skillStableId = `skill:${skill.id}`;
        const courseOnlySkill = isSyntheticCourseSkill(skill);
        const courseDenseRadiusOffset =
          collapseSyntheticCourseDirection && courseOnlySkill
            ? (skillIndex % 2) * COURSE_NODE_RADIAL_STAGGER + Math.floor(skillIndex / 12) * COURSE_NODE_OUTER_STEP
            : 0;
        const skillPoint = polarPoint(
          collapseSyntheticCourseDirection && courseOnlySkill ? COURSE_RING_RADIUS + courseDenseRadiusOffset : TOPIC_RING_RADIUS,
          skillAngle,
        );
        const isCourseOnlySkill = courseOnlySkill;

        if (!isCourseOnlySkill) {
          baseEdges.push({
            id: `structure:${branchParentStableId}->${skillStableId}`,
            fromStableId: branchParentStableId,
            toStableId: skillStableId,
            edgeType: 'structure',
            edgeRole: 'structure_branch',
            isOverlay: false,
          });
        }

        visibleNodes.forEach((node, nodeIndex) => {
          const layer = isCourseOnlySkill ? 0 : Math.floor(nodeIndex / ATOMIC_CLUSTER_CAPACITY);
          const layerStartIndex = layer * ATOMIC_CLUSTER_CAPACITY;
          const layerCount = Math.min(ATOMIC_CLUSTER_CAPACITY, visibleNodes.length - layerStartIndex);
          const indexInLayer = nodeIndex - layerStartIndex;
          const layerStartAngle = skillAngle - ATOMIC_CLUSTER_SPREAD / 2;
          const layerEndAngle = skillAngle + ATOMIC_CLUSTER_SPREAD / 2;
          const clusterAngle = distributeAngle(layerStartAngle, layerEndAngle, indexInLayer, layerCount);
          const clusterRadius =
            ATOMIC_CLUSTER_RADIUS + layer * ATOMIC_CLUSTER_RING_STEP + (indexInLayer % 2) * ATOMIC_CLUSTER_ALT_RADIUS;
          const point = isCourseOnlySkill ? skillPoint : offsetPoint(skillPoint, clusterRadius, clusterAngle);
          const nodeAngle = Math.atan2(point.y, point.x);
          const nodeRadius = pointRadius(point);
          const visualType = normalizeNodeType(node);
          const flags = resolveNodeFlags(
            node,
            visualType,
            focusedNodeId,
            routeMetadata,
            weakNodeIds,
            contestedNodeIds,
            bossNodeIds,
          );
          const route = routeMetadata.get(node.id);
          const stableId = `node:${node.id}`;

          childFlags.push(flags);
          nodeFlagsByStableId.set(stableId, flags);
          nodes.push(
            createLayoutNode({
              stableId,
              sourceKind: 'node',
              sourceId: node.id,
              navigationNodeId: node.id,
              title: node.title,
              path: collapseSyntheticCourseDirection ? `${sphere.name} / ${skill.name}` : `${sphere.name} / ${direction.name} / ${skill.name}`,
              point,
              radius: nodeRadius,
              angle: nodeAngle,
              ring: collapseSyntheticCourseDirection && isCourseOnlySkill ? 2 : isCourseOnlySkill ? 3 : 4 + layer,
              sectorKey: sector.key,
              visualType,
              stateFlags: flags,
              routeOrder: route?.routeOrder ?? null,
              routeStage: route?.routeStage ?? null,
              childNodeCount: 0,
              nodeType: node.type,
            }),
          );

          baseEdges.push({
            id: isCourseOnlySkill
              ? `structure:${branchParentStableId}->${stableId}`
              : `structure:${skillStableId}->${stableId}`,
            fromStableId: isCourseOnlySkill ? branchParentStableId : skillStableId,
            toStableId: stableId,
            edgeType: 'structure',
            edgeRole: isCourseOnlySkill ? 'structure_branch' : 'local_cluster',
            isOverlay: false,
          });
        });

        const skillFlags = combineFlags(
          childFlags,
          visibleNodes.some((node) => focusedNodeId === node.id),
        );
        skillFlagGroups.push(skillFlags);
        nodeFlagsByStableId.set(skillStableId, skillFlags);
        if (isCourseOnlySkill) {
          return;
        }
        nodes.push(
          createLayoutNode({
            stableId: skillStableId,
            sourceKind: 'skill',
            sourceId: skill.id,
            title: skill.name,
            path: `${sphere.name} / ${direction.name}`,
            point: skillPoint,
            radius: TOPIC_RING_RADIUS,
            angle: skillAngle,
            ring: 3,
            sectorKey: sector.key,
            visualType: 'topic_node',
            stateFlags: skillFlags,
            childNodeCount: visibleNodes.length,
          }),
        );
      });

      const directionFlags = combineFlags(
        skillFlagGroups,
        visibleSkills.some((skill) => skill.nodes.some((node) => focusedNodeId === node.id)),
      );
      directionFlagGroups.push(directionFlags);
      nodeFlagsByStableId.set(directionStableId, directionFlags);
      if (collapseSyntheticCourseDirection) {
        return;
      }
      nodes.push(
        createLayoutNode({
          stableId: directionStableId,
          sourceKind: 'direction',
          sourceId: direction.id,
          title: direction.name,
          path: sphere.name,
          point: polarPoint(COURSE_RING_RADIUS, directionAngle),
          radius: COURSE_RING_RADIUS,
          angle: directionAngle,
          ring: 2,
          sectorKey: sector.key,
          visualType: 'course_hub',
          stateFlags: directionFlags,
          childNodeCount: visibleSkills.reduce((sum, skill) => sum + skill.nodes.filter((node) => includedNodeContexts.has(node.id)).length, 0),
        }),
      );
    });

    const sphereFlags = combineFlags(
      directionFlagGroups,
      visibleDirections.some((direction) =>
        direction.skills.some((skill) => skill.nodes.some((node) => focusedNodeId === node.id)),
      ),
    );
    nodeFlagsByStableId.set(sphereStableId, sphereFlags);
    nodes.push(
      createLayoutNode({
        stableId: sphereStableId,
        sourceKind: 'sphere',
        sourceId: sphere.id,
        title: sphere.name,
        path: programTitle,
        point: polarPoint(DOMAIN_RING_RADIUS, sector.centerAngle),
        radius: DOMAIN_RING_RADIUS,
        angle: sector.centerAngle,
        ring: 1,
        sectorKey: sector.key,
        visualType: 'domain_hub',
        stateFlags: sphereFlags,
        childNodeCount: Array.from(includedNodeContexts.values()).filter((context) => context.sphere.id === sphere.id).length,
      }),
    );
  });

  const activeStableIds = new Set(nodes.map((node) => node.stableId));
  snapshot.edges.forEach((edge) => {
    const fromStableId = `node:${edge.source_node_id}`;
    const toStableId = `node:${edge.target_node_id}`;

    if (!activeStableIds.has(fromStableId) || !activeStableIds.has(toStableId)) {
      return;
    }

    baseEdges.push({
      id: `graph:${edge.id}`,
      fromStableId,
      toStableId,
      edgeType: edge.edge_type,
      edgeRole: 'graph',
      isOverlay: false,
    });
  });

  const routeEdges = createRouteEdges(options.routeOverlay).filter(
    (edge) => activeStableIds.has(edge.fromStableId) && activeStableIds.has(edge.toStableId),
  );
  const edges = [...baseEdges, ...routeEdges];

  return {
    nodes: nodes.sort((left, right) => left.ring - right.ring || left.stableId.localeCompare(right.stableId)),
    edges,
    baseEdges,
    routeEdges,
    sectors,
    bounds: computeBounds(nodes),
    rootStableId: ROOT_STABLE_ID,
    focusedStableId,
  };
};

const atlasPalette = [
  { color: 0x0b3550, accent: 0x58d6ff },
  { color: 0x4a3511, accent: 0xffd166 },
  { color: 0x123d32, accent: 0x5ee6b5 },
  { color: 0x4c1e2a, accent: 0xfb7185 },
  { color: 0x12344d, accent: 0x38bdf8 },
  { color: 0x372152, accent: 0xc084fc },
  { color: 0x4a2a12, accent: 0xf97316 },
  { color: 0x24401a, accent: 0xa3e635 },
] as const;

const stableNumericId = (stableId: string) => {
  let hash = 0;
  for (let index = 0; index < stableId.length; index += 1) {
    hash = (hash * 31 + stableId.charCodeAt(index)) >>> 0;
  }
  return -1_000_000 - (hash % 900_000_000);
};

const mapAtlasState = (state: SkillAtlasNodeState): GameNodeState => {
  if (state === 'verified') return 'completed';
  if (state === 'current' || state === 'in_progress') return 'active';
  if (state === 'available') return 'available';
  if (state === 'weak' || state === 'contested' || state === 'boss') return 'paused';
  return 'locked';
};

const mapAtlasIcon = (iconKey: string) => {
  if (iconKey === 'boss') return 'build';
  if (iconKey === 'course' || iconKey === 'domain' || iconKey === 'topic') return 'code';
  if (iconKey === 'practice') return 'build';
  if (iconKey === 'review') return 'debug';
  if (iconKey.includes('database')) return 'database';
  if (iconKey.includes('algorithm')) return 'algorithm';
  if (iconKey.includes('math')) return 'math';
  return iconKey || 'code';
};

export const applySkillAtlasLayoutToModel = (
  snapshot: NavigationSnapshot,
  model: GameSceneModel,
  options: Pick<SkillAtlasLayoutOptions, 'programTitle'> = {},
): GameSceneModel => {
  const focus = model.highlightedNodeId != null ? { node: { id: model.highlightedNodeId } } : null;
  const layout = createSkillAtlasLayout(snapshot, focus, { programTitle: options.programTitle });
  const baseNodeById = new Map(model.nodes.map((node) => [node.id, node]));
  const stableIdToNumericId = new Map<string, number>();
  const sectorIndexByKey = new Map(layout.sectors.map((sector, index) => [sector.key, index]));

  layout.nodes.forEach((node) => {
    stableIdToNumericId.set(node.stableId, node.navigationNodeId ?? stableNumericId(node.stableId));
  });

  const biomes: GameBiome[] = layout.sectors.map((sector, index) => {
    const palette = atlasPalette[index % atlasPalette.length];
    const radius = Math.max(260, Math.min(520, 180 + sector.nodeCount * 5));
    return {
      id: index + 1,
      name: sector.title,
      center: polarPoint(600, sector.centerAngle),
      radius,
      color: palette.color,
      accent: palette.accent,
      nodeCount: sector.nodeCount,
    };
  });

  const nodes: GameNode[] = layout.nodes.map((atlasNode) => {
    const id = stableIdToNumericId.get(atlasNode.stableId) ?? stableNumericId(atlasNode.stableId);
    const baseNode = atlasNode.navigationNodeId != null ? baseNodeById.get(atlasNode.navigationNodeId) : null;
    const sectorIndex = sectorIndexByKey.get(atlasNode.sectorKey) ?? 0;
    const biome = biomes[sectorIndex] ?? biomes[0];

    return {
      id,
      title: atlasNode.title,
      subtitle: atlasNode.path,
      state: baseNode?.state ?? mapAtlasState(atlasNode.state),
      position: { x: atlasNode.x, y: atlasNode.y },
      overviewPosition: { x: atlasNode.x, y: atlasNode.y },
      biomeId: biome?.id ?? 1,
      nextActionTitle: baseNode?.nextActionTitle ?? null,
      hierarchyDepth: atlasNode.ring,
      descendantCount: atlasNode.childNodeCount,
      isOverviewVisible: true,
      isOnSelectedPath: atlasNode.stateFlags.focused || atlasNode.stateFlags.focusedDescendant,
      controlState: baseNode?.controlState ?? (atlasNode.state === 'contested' ? 'contested' : atlasNode.state === 'weak' ? 'weakened' : null),
      atlasNodeType: atlasNode.visualType as SkillAtlasNodeType,
      atlasStableId: atlasNode.stableId,
      atlasSourceKind: atlasNode.sourceKind,
      atlasSourceId: atlasNode.sourceId,
      atlasIconKey: mapAtlasIcon(atlasNode.iconKey),
      atlasGroupKey: atlasNode.sectorKey,
      atlasRing: atlasNode.ring,
      atlasAngle: atlasNode.angle,
      atlasSectorColor: biome?.accent,
    };
  });

  const activeNodeIds = new Set(nodes.map((node) => node.id));
  const edges: GameEdge[] = layout.edges
    .filter(
      (edge) =>
        edge.edgeRole !== 'graph' &&
        !edge.id.startsWith('graph:'),
    )
    .map((edge) => {
      const fromNodeId = stableIdToNumericId.get(edge.fromStableId);
      const toNodeId = stableIdToNumericId.get(edge.toStableId);
      if (fromNodeId == null || toNodeId == null || !activeNodeIds.has(fromNodeId) || !activeNodeIds.has(toNodeId)) {
        return null;
      }

      return {
        id: stableNumericId(edge.id),
        fromNodeId,
        toNodeId,
        type: edge.edgeType === 'requires' || edge.edgeType === 'relates_to' ? edge.edgeType : 'supports',
        atlasEdgeRole: edge.edgeRole,
      } satisfies GameEdge;
    })
    .filter((edge): edge is GameEdge => edge != null);

  return {
    ...model,
    biomes,
    nodes,
    edges,
    hub: { position: { x: 0, y: 0 }, label: 'CS Atlas' },
    highlightedNodeId:
      model.highlightedNodeId != null && activeNodeIds.has(model.highlightedNodeId)
        ? model.highlightedNodeId
        : stableIdToNumericId.get(layout.focusedStableId ?? layout.rootStableId) ?? null,
    hero: {
      ...model.hero,
      nodeId: model.hero.nodeId != null && activeNodeIds.has(model.hero.nodeId) ? model.hero.nodeId : null,
    },
    bounds: layout.bounds,
    overviewBounds: layout.bounds,
    isLargeGraph: false,
  };
};
