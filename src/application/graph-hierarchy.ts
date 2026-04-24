import type { NavigationNodeSummary, NavigationSnapshot } from '../types/app-shell';

export interface GraphHierarchyEntry {
  node: NavigationNodeSummary;
  parentId: number | null;
  childIds: number[];
  depth: number;
  descendantCount: number;
  isOnSelectedPath: boolean;
}

export interface GraphHierarchyIndex {
  entries: Map<number, GraphHierarchyEntry>;
  roots: number[];
  selectedPathIds: Set<number>;
}

const collectSphereNodes = (snapshot: NavigationSnapshot, visibleSphereId: number | null) => {
  const nodes: NavigationNodeSummary[] = [];

  snapshot.spheres
    .filter((sphere) => visibleSphereId == null || sphere.id === visibleSphereId)
    .forEach((sphere) => {
      sphere.directions.forEach((direction) => {
        direction.skills.forEach((skill) => {
          nodes.push(...skill.nodes);
        });
      });
    });

  return nodes;
};

export const buildGraphHierarchyIndex = (
  snapshot: NavigationSnapshot | null,
  visibleSphereId: number | null,
  selectedNodeId: number | null,
): GraphHierarchyIndex => {
  if (!snapshot) {
    return { entries: new Map(), roots: [], selectedPathIds: new Set() };
  }

  const nodes = collectSphereNodes(snapshot, visibleSphereId);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const order = new Map(nodes.map((node, index) => [node.id, index]));
  const parentByChild = new Map<number, number>();
  const childrenByParent = new Map<number, number[]>();

  snapshot.edges.forEach((edge) => {
    if (!nodeIds.has(edge.source_node_id) || !nodeIds.has(edge.target_node_id) || edge.edge_type === 'relates_to') {
      return;
    }

    const parentId = edge.edge_type === 'requires' ? edge.target_node_id : edge.source_node_id;
    const childId = edge.edge_type === 'requires' ? edge.source_node_id : edge.target_node_id;

    if (parentId === childId || parentByChild.has(childId)) {
      return;
    }

    parentByChild.set(childId, parentId);
    const children = childrenByParent.get(parentId) ?? [];
    if (!children.includes(childId)) {
      children.push(childId);
      childrenByParent.set(parentId, children);
    }
  });

  childrenByParent.forEach((children) => {
    children.sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));
  });

  const roots = nodes
    .map((node) => node.id)
    .filter((nodeId) => !parentByChild.has(nodeId))
    .sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));
  const entries = new Map<number, GraphHierarchyEntry>();
  const visited = new Set<number>();

  const assignDepth = (nodeId: number, depth: number) => {
    if (visited.has(nodeId)) {
      return;
    }

    const node = nodes.find((item) => item.id === nodeId);
    if (!node) {
      return;
    }

    visited.add(nodeId);
    const childIds = childrenByParent.get(nodeId) ?? [];
    entries.set(nodeId, {
      node,
      parentId: parentByChild.get(nodeId) ?? null,
      childIds,
      depth,
      descendantCount: 0,
      isOnSelectedPath: false,
    });
    childIds.forEach((childId) => assignDepth(childId, depth + 1));
  };

  roots.forEach((rootId) => assignDepth(rootId, 0));
  nodes.forEach((node) => assignDepth(node.id, 0));

  const countDescendants = (nodeId: number, stack = new Set<number>()): number => {
    if (stack.has(nodeId)) {
      return 0;
    }

    stack.add(nodeId);
    const entry = entries.get(nodeId);
    if (!entry) {
      return 0;
    }

    const count = entry.childIds.reduce((sum, childId) => sum + 1 + countDescendants(childId, stack), 0);
    entry.descendantCount = count;
    stack.delete(nodeId);
    return count;
  };

  entries.forEach((entry) => countDescendants(entry.node.id));

  const selectedPathIds = new Set<number>();
  let currentId = selectedNodeId != null && entries.has(selectedNodeId) ? selectedNodeId : null;
  while (currentId != null && !selectedPathIds.has(currentId)) {
    selectedPathIds.add(currentId);
    const entry = entries.get(currentId);
    currentId = entry?.parentId ?? null;
  }

  selectedPathIds.forEach((nodeId) => {
    const entry = entries.get(nodeId);
    if (entry) {
      entry.isOnSelectedPath = true;
    }
  });

  return { entries, roots, selectedPathIds };
};

export const isOverviewNodeVisible = (entry: GraphHierarchyEntry | undefined) =>
  entry != null && (entry.depth <= 1 || entry.isOnSelectedPath);
