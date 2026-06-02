import type {
  NavigationSnapshot,
  NavigationNodeSummary,
  ProgramHierarchyEntry,
  ProgramMapLayerFallbackReason,
  ProgramMapLayerState,
  TodaySnapshot,
} from '../types/app-shell';
import { isCourseCatalogNodeMetadata } from './course-catalog-metadata.ts';

type RouteItem = NonNullable<TodaySnapshot['route']>['items'][number];

interface ProgramHierarchyInput {
  snapshot: NavigationSnapshot | null | undefined;
  campaign?: { id?: number | string | null; name?: string | null } | null;
  routeItems?: RouteItem[] | null;
}

export interface InfrastructureObjectViewModel {
  key: string;
  entryStableId: string;
  title: string;
  sourceTitle: string;
  description: string;
  atomicNodeCount: number;
  routeNodeCount: number;
  completedRouteNodeCount: number;
  progressPercent: number;
  controlLabel: string;
  controlTone: 'secure' | 'developing' | 'weakening' | 'contested';
  pressureLabel: string;
  isRouteFocus: boolean;
  nodeIds: number[];
}

const MIN_OBJECT_ATOMIC_DESCENDANTS = 5;

const stableId = (sourceKind: ProgramHierarchyEntry['sourceKind'], sourceId: number | string) =>
  `${sourceKind}:${String(sourceId)}`;

const normalizeTitle = (value: string | null | undefined) =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('ru-RU');

const objectSlug = (value: string) =>
  normalizeTitle(value)
    .replace(/[^a-zа-яё0-9]+/giu, '-')
    .replace(/^-+|-+$/g, '') || 'object';

const objectDisplayName = (sourceTitle: string) => {
  const text = normalizeTitle(sourceTitle);
  if (text.includes('основ') && text.includes('программ')) return 'Мастерская кода';
  if (text.includes('дискрет')) return 'Башня логики';
  if (text.includes('структур') && text.includes('данн')) return 'Архив структур';
  if (text.includes('алгорит')) return 'Навигационный центр';
  if (text.includes('баз') && text.includes('данн')) return 'Городское хранилище';
  if (text.includes('отлад') || text.includes('тест')) return 'Ремонтный док';
  if (text.includes('математ') && text.includes('запис')) return 'Зал доказательств';
  if (text.includes('памят')) return 'Механический цех';
  return sourceTitle;
};

const hasKnownInfrastructureObjectMapping = (sourceTitle: string) => objectDisplayName(sourceTitle) !== sourceTitle;

const objectDescription = (sourceTitle: string, fallback: string | null | undefined) => {
  const text = normalizeTitle(sourceTitle);
  if (text.includes('основ') && text.includes('программ')) return 'Практика базового кода, функций, данных и первых проверок.';
  if (text.includes('дискрет')) return 'Логика, множества, доказательства, подсчет и язык графов.';
  if (text.includes('структур') && text.includes('данн')) return 'Массивы, стек, очередь, деревья, хеш-таблицы, графы и компромиссы.';
  if (text.includes('алгорит')) return 'Поиск, сортировка, рекурсия, жадные решения, динамика и сложность.';
  if (text.includes('баз') && text.includes('данн')) return 'Модели данных, SQL, связи, ограничения, индексы и транзакции.';
  if (text.includes('отлад') || text.includes('тест')) return 'Поиск ошибок, воспроизведение, проверки и восстановление после сбоев.';
  if (text.includes('математ') && text.includes('запис')) return 'Обозначения, формальные утверждения и каркасы доказательств.';
  if (text.includes('памят')) return 'Значения, ссылки, стек, куча, псевдонимы и стоимость изменений.';
  return fallback ?? 'Учебный объект программы с темами, практикой и проверками.';
};

const routeByNodeId = (routeItems: RouteItem[] = []) => {
  const map = new Map<number, RouteItem>();
  for (const item of routeItems) {
    if (item.node_id != null) {
      map.set(item.node_id, item);
    }
  }
  return map;
};

const isCourseNode = (node: NavigationNodeSummary | null | undefined) => {
  if (!node) {
    return false;
  }

  return isCourseCatalogNodeMetadata(node.links);
};

const isSyntheticCourseDirection = (direction: NavigationDirection) =>
  normalizeTitle(direction.name) === 'курсы' &&
  direction.skills.length > 0 &&
  direction.skills.every((skill) => skill.nodes.length === 1 && isCourseNode(skill.nodes[0]));

export const buildProgramHierarchy = ({
  snapshot,
  campaign = null,
  routeItems = [],
}: ProgramHierarchyInput): ProgramHierarchyEntry[] => {
  const entries: ProgramHierarchyEntry[] = [];
  const routeItemsByNodeId = routeByNodeId(routeItems ?? []);
  const campaignId = campaign?.id ?? 'current';
  const rootStableId = stableId(campaign?.id == null ? 'virtual' : 'campaign', campaignId);

  entries.push({
    stableId: rootStableId,
    sourceKind: campaign?.id == null ? 'virtual' : 'campaign',
    sourceId: campaignId,
    parentStableId: null,
    role: 'program_root',
    depth: 0,
    title: campaign?.name ?? 'Программа',
    description: null,
    atomicDescendantCount: 0,
    childContainerCount: snapshot?.spheres.length ?? 0,
    objectKey: null,
    isInfrastructureObjectCandidate: false,
    routeNodeIds: [],
    graphNodeIds: [],
    reason: campaign?.id == null ? 'virtual current program root' : 'campaign root',
  });

  const descendantNodeIdsByEntry = new Map<string, Set<number>>();
  const childContainerCountByEntry = new Map<string, number>();
  const routeNodeIdsByEntry = new Map<string, Set<number>>();
  const registerDescendant = (entryStableId: string, node: NavigationNodeSummary) => {
    const bucket = descendantNodeIdsByEntry.get(entryStableId) ?? new Set<number>();
    bucket.add(node.id);
    descendantNodeIdsByEntry.set(entryStableId, bucket);
    const routeItem = routeItemsByNodeId.get(node.id);
    if (routeItem) {
      const routeBucket = routeNodeIdsByEntry.get(entryStableId) ?? new Set<number>();
      routeBucket.add(routeItem.id);
      routeNodeIdsByEntry.set(entryStableId, routeBucket);
    }
  };

  for (const sphere of snapshot?.spheres ?? []) {
    const sphereStableId = stableId('sphere', sphere.id);
    const isCourseCatalogSphere = sphere.directions.some((direction) => isSyntheticCourseDirection(direction));
    const sphereObjectKey = isCourseCatalogSphere ? `${sphereStableId}:${objectSlug(sphere.name)}` : null;
    entries.push({
      stableId: sphereStableId,
      sourceKind: 'sphere',
      sourceId: sphere.id,
      parentStableId: rootStableId,
      role: 'domain',
      depth: 1,
      title: sphere.name,
      description: null,
      atomicDescendantCount: 0,
      childContainerCount: sphere.directions.length,
      objectKey: sphereObjectKey,
      isInfrastructureObjectCandidate: isCourseCatalogSphere,
      routeNodeIds: [],
      graphNodeIds: [],
      reason: isCourseCatalogSphere ? 'course catalog city region' : 'top-level content container',
    });
    childContainerCountByEntry.set(rootStableId, (childContainerCountByEntry.get(rootStableId) ?? 0) + 1);

    for (const direction of sphere.directions) {
      const directionStableId = stableId('direction', direction.id);
      const collapseCourseDirection = isSyntheticCourseDirection(direction);
      if (!collapseCourseDirection) {
        entries.push({
          stableId: directionStableId,
          sourceKind: 'direction',
          sourceId: direction.id,
          parentStableId: sphereStableId,
          role: direction.skills.length > 1 ? 'domain' : 'module',
          depth: 2,
          title: direction.name,
          description: null,
          atomicDescendantCount: 0,
          childContainerCount: direction.skills.length,
          objectKey: null,
          isInfrastructureObjectCandidate: false,
          routeNodeIds: [],
          graphNodeIds: [],
          reason: direction.skills.length > 1 ? 'groups multiple modules' : 'single module branch',
        });
        childContainerCountByEntry.set(sphereStableId, (childContainerCountByEntry.get(sphereStableId) ?? 0) + 1);
      }

      for (const skill of direction.skills) {
        const skillStableId = stableId('skill', skill.id);
        const isCourseHubSkill = skill.nodes.length === 1 && isCourseNode(skill.nodes[0]);
        const hideCourseWrapper = collapseCourseDirection && isCourseHubSkill;
        const isLargeObjectCandidate = skill.nodes.length >= MIN_OBJECT_ATOMIC_DESCENDANTS;
        const hasKnownObjectMapping = hasKnownInfrastructureObjectMapping(skill.name);
        const isObjectCandidate = !isCourseHubSkill && (isLargeObjectCandidate || (skill.nodes.length > 0 && hasKnownObjectMapping));
        const objectKey = isObjectCandidate ? `skill:${skill.id}:${objectSlug(skill.name)}` : null;
        entries.push({
          stableId: skillStableId,
          sourceKind: 'skill',
          sourceId: skill.id,
          parentStableId: hideCourseWrapper ? null : directionStableId,
          role: isObjectCandidate ? 'infrastructure_object' : 'module',
          depth: hideCourseWrapper ? 2 : 3,
          title: skill.name,
          description: null,
          atomicDescendantCount: skill.nodes.length,
          childContainerCount: 0,
          objectKey,
          isInfrastructureObjectCandidate: isObjectCandidate,
          routeNodeIds: [],
          graphNodeIds: skill.nodes.map((node) => node.id),
          reason: isLargeObjectCandidate
            ? 'skill has enough atomic descendants for a city object'
            : hasKnownObjectMapping
              ? 'calibrated program object mapping'
              : skill.nodes.length > 0
                ? 'small module grouped under parent'
                : 'empty module',
        });
        if (!hideCourseWrapper) {
          childContainerCountByEntry.set(directionStableId, (childContainerCountByEntry.get(directionStableId) ?? 0) + 1);
        }

        for (const node of skill.nodes) {
          const nodeStableId = stableId('node', node.id);
          const routeItem = routeItemsByNodeId.get(node.id);
          const courseNode = isCourseNode(node);
          const nodeObjectKey = courseNode && sphereObjectKey ? sphereObjectKey : objectKey;
          entries.push({
            stableId: nodeStableId,
            sourceKind: 'node',
            sourceId: node.id,
            parentStableId: hideCourseWrapper ? sphereStableId : skillStableId,
            role: courseNode ? 'course_hub' : 'atomic_node',
            depth: hideCourseWrapper ? 2 : 4,
            title: node.title,
            description: null,
            atomicDescendantCount: 1,
            childContainerCount: 0,
            objectKey: nodeObjectKey,
            isInfrastructureObjectCandidate: false,
            routeNodeIds: routeItem ? [routeItem.id] : [],
            graphNodeIds: [node.id],
            reason: courseNode ? 'course-level catalog hub' : 'leaf learning/check unit',
          });

          if (hideCourseWrapper) {
            childContainerCountByEntry.set(sphereStableId, (childContainerCountByEntry.get(sphereStableId) ?? 0) + 1);
          }

          for (const ancestorId of collapseCourseDirection ? [rootStableId, sphereStableId, skillStableId] : [rootStableId, sphereStableId, directionStableId, skillStableId]) {
            registerDescendant(ancestorId, node);
          }
        }
      }
    }
  }

  return entries.map((entry) => {
    const descendants = descendantNodeIdsByEntry.get(entry.stableId);
    const routeIds = routeNodeIdsByEntry.get(entry.stableId);
    return {
      ...entry,
      atomicDescendantCount:
        entry.role === 'atomic_node' || entry.role === 'course_hub' ? 1 : descendants?.size ?? entry.atomicDescendantCount,
      childContainerCount: childContainerCountByEntry.get(entry.stableId) ?? entry.childContainerCount,
      routeNodeIds: entry.routeNodeIds.length ? entry.routeNodeIds : [...(routeIds ?? [])],
      graphNodeIds: entry.graphNodeIds.length ? entry.graphNodeIds : [...(descendants ?? [])],
    };
  });
};

export const findObjectForNode = (entries: ProgramHierarchyEntry[], nodeId: number | null | undefined) => {
  if (nodeId == null) {
    return null;
  }
  const nodeEntry = entries.find((entry) => entry.sourceKind === 'node' && Number(entry.sourceId) === Number(nodeId));
  if (!nodeEntry?.objectKey) {
    return null;
  }
  return entries.find((entry) => entry.objectKey === nodeEntry.objectKey && entry.isInfrastructureObjectCandidate) ?? null;
};

const findEntryForNode = (entries: ProgramHierarchyEntry[], nodeId: number | null | undefined) => {
  if (nodeId == null) {
    return null;
  }
  return entries.find((entry) => entry.sourceKind === 'node' && Number(entry.sourceId) === Number(nodeId)) ?? null;
};

export const objectNodeIds = (entries: ProgramHierarchyEntry[], objectKey: string | null | undefined) =>
  new Set(
    entries
      .filter((entry) => (entry.role === 'atomic_node' || entry.role === 'course_hub') && entry.objectKey === objectKey)
      .map((entry) => Number(entry.sourceId))
      .filter((id) => Number.isFinite(id)),
  );

export const folderChildren = (entries: ProgramHierarchyEntry[], parentStableId: string | null) =>
  entries.filter((entry) => entry.parentStableId === parentStableId);

export const buildInitialProgramMapLayerState = ({
  entries,
  routeFocusNodeId = null,
}: {
  entries: ProgramHierarchyEntry[];
  routeFocusNodeId?: number | null;
}): ProgramMapLayerState => {
  const objects = entries.filter((entry) => entry.objectKey && entry.isInfrastructureObjectCandidate);
  const routeObject = findObjectForNode(entries, routeFocusNodeId);
  const routeNodeEntry = findEntryForNode(entries, routeFocusNodeId);
  const routeFolderEntry = routeNodeEntry?.parentStableId
    ? entries.find((entry) => entry.stableId === routeNodeEntry.parentStableId) ?? null
    : null;
  const fallbackReason: ProgramMapLayerFallbackReason = objects.length === 0 ? 'no_objects' : null;
  return {
    layer: 'city',
    selectedObjectKey: routeObject?.objectKey ?? objects[0]?.objectKey ?? null,
    selectedFolderStableId: routeFolderEntry?.stableId ?? routeObject?.stableId ?? objects[0]?.stableId ?? null,
    selectedEntryStableId: routeNodeEntry?.stableId ?? routeObject?.stableId ?? objects[0]?.stableId ?? null,
    selectedNodeId: routeFocusNodeId,
    routeFocusNodeId,
    fallbackReason,
  };
};

export const buildInfrastructureObjects = ({
  entries,
  routeItems = [],
  routeFocusNodeId = null,
}: {
  entries: ProgramHierarchyEntry[];
  routeItems?: RouteItem[] | null;
  routeFocusNodeId?: number | null;
}): InfrastructureObjectViewModel[] => {
  const routeItemsByNodeId = routeByNodeId(routeItems ?? []);
  return entries
    .filter((entry) => entry.objectKey && entry.isInfrastructureObjectCandidate)
    .map((entry) => {
      const nodeIds = [...objectNodeIds(entries, entry.objectKey)];
      const objectRouteItems = nodeIds.flatMap((nodeId) => {
        const item = routeItemsByNodeId.get(nodeId);
        return item ? [item] : [];
      });
      const completedRouteNodeCount = objectRouteItems.filter((item) => item.is_complete).length;
      const progressPercent =
        objectRouteItems.length > 0
          ? Math.round((completedRouteNodeCount / objectRouteItems.length) * 100)
          : 0;
      const contestedCount = objectRouteItems.filter((item) => item.control_state === 'contested' || item.control_state === 'lost').length;
      const weakCount = objectRouteItems.filter((item) => item.control_state === 'weakened').length;
      const controlTone =
        contestedCount > 0 ? 'contested' : weakCount > 0 ? 'weakening' : progressPercent >= 70 ? 'secure' : 'developing';
      const controlLabel =
        controlTone === 'contested'
          ? 'Оспаривается'
          : controlTone === 'weakening'
            ? 'Нужно повторить'
            : controlTone === 'secure'
              ? 'Под контролем'
              : 'Развивается';

      return {
        key: entry.objectKey as string,
        entryStableId: entry.stableId,
        title: objectDisplayName(entry.title),
        sourceTitle: entry.title,
        description: objectDescription(entry.title, entry.description),
        atomicNodeCount: entry.atomicDescendantCount,
        routeNodeCount: objectRouteItems.length,
        completedRouteNodeCount,
        progressPercent,
        controlLabel,
        controlTone,
        pressureLabel: contestedCount > 0 ? `${contestedCount} спорн.` : weakCount > 0 ? `${weakCount} повторить` : 'спокойно',
        isRouteFocus: routeFocusNodeId != null && nodeIds.includes(routeFocusNodeId),
        nodeIds,
      };
    });
};
