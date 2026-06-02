import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInfrastructureObjects,
  buildInitialProgramMapLayerState,
  buildProgramHierarchy,
  findObjectForNode,
  folderChildren,
  objectNodeIds,
} from '../src/application/program-hierarchy.ts';

const node = (id, title) => ({
  id,
  skill_id: 100,
  title,
  type: 'concept',
  status: 'active',
  open_action_count: 1,
  next_action_id: id + 1000,
  next_action_title: `Check ${title}`,
});

const skill = (id, name, nodes) => ({
  id,
  direction_id: 10,
  name,
  primary_stat_id: null,
  node_count: nodes.length,
  open_action_count: nodes.length,
  nodes,
});

const snapshot = {
  spheres: [
    {
      id: 1,
      name: 'Computer Science',
      node_count: 7,
      open_action_count: 7,
      directions: [
        {
          id: 10,
          sphere_id: 1,
          name: 'Core',
          node_count: 7,
          open_action_count: 7,
          skills: [
            skill(100, 'Data Structures', [
              node(1, 'Arrays'),
              node(2, 'Stack'),
              node(3, 'Queue'),
              node(4, 'Trees'),
              node(5, 'Hash tables'),
            ]),
            skill(101, 'Tiny Lab', [node(6, 'One'), node(7, 'Two')]),
          ],
        },
      ],
    },
  ],
  edges: [{ id: 1, source_node_id: 1, target_node_id: 2, edge_type: 'requires' }],
  archivedNodes: [],
  defaultSelection: { nodeId: 1, actionId: 1001 },
};

test('program hierarchy projects stable parent tree and roles from navigation snapshot', () => {
  const entries = buildProgramHierarchy({
    snapshot,
    campaign: { id: 42, name: 'CS Program' },
  });
  const repeated = buildProgramHierarchy({
    snapshot,
    campaign: { id: 42, name: 'CS Program' },
  });

  assert.deepEqual(
    entries.map((entry) => entry.stableId),
    repeated.map((entry) => entry.stableId),
  );
  assert.equal(entries[0].stableId, 'campaign:42');
  assert.equal(entries[0].role, 'program_root');

  const object = entries.find((entry) => entry.sourceKind === 'skill' && entry.sourceId === 100);
  assert.equal(object?.role, 'infrastructure_object');
  assert.equal(object?.isInfrastructureObjectCandidate, true);
  assert.equal(object?.atomicDescendantCount, 5);
  assert.equal(object?.parentStableId, 'direction:10');

  const smallModule = entries.find((entry) => entry.sourceKind === 'skill' && entry.sourceId === 101);
  assert.equal(smallModule?.role, 'module');
  assert.equal(smallModule?.isInfrastructureObjectCandidate, false);
  assert.equal(smallModule?.reason, 'small module grouped under parent');

  const atomic = entries.find((entry) => entry.sourceKind === 'node' && entry.sourceId === 1);
  assert.equal(atomic?.role, 'atomic_node');
  assert.equal(atomic?.parentStableId, 'skill:100');
});

test('program hierarchy maps route focus and object descendants through one object key', () => {
  const routeItems = [
    {
      id: 501,
      node_id: 2,
      title: 'Stack',
      is_complete: false,
      control_state: 'contested',
    },
    {
      id: 502,
      node_id: 3,
      title: 'Queue',
      is_complete: true,
      control_state: 'controlled',
    },
  ];
  const entries = buildProgramHierarchy({ snapshot, routeItems });
  const routeObject = findObjectForNode(entries, 2);
  assert.equal(routeObject?.sourceId, 100);

  const ids = objectNodeIds(entries, routeObject?.objectKey);
  assert.deepEqual([...ids].sort((left, right) => left - right), [1, 2, 3, 4, 5]);

  const state = buildInitialProgramMapLayerState({ entries, routeFocusNodeId: 2 });
  assert.equal(state.layer, 'city');
  assert.equal(state.selectedObjectKey, routeObject?.objectKey);
  assert.equal(state.selectedNodeId, 2);
  assert.equal(state.fallbackReason, null);

  const objects = buildInfrastructureObjects({ entries, routeItems, routeFocusNodeId: 2 });
  assert.equal(objects.length, 1);
  assert.equal(objects[0].sourceTitle, 'Data Structures');
  assert.equal(objects[0].routeNodeCount, 2);
  assert.equal(objects[0].completedRouteNodeCount, 1);
  assert.equal(objects[0].controlLabel, 'Оспаривается');
  assert.equal(objects[0].isRouteFocus, true);
});

test('folder children use projection parent ids, not graph edges', () => {
  const entries = buildProgramHierarchy({ snapshot });

  assert.deepEqual(
    folderChildren(entries, 'direction:10').map((entry) => entry.stableId),
    ['skill:100', 'skill:101'],
  );
  assert.deepEqual(
    folderChildren(entries, 'skill:100').map((entry) => entry.stableId),
    ['node:1', 'node:2', 'node:3', 'node:4', 'node:5'],
  );
});

test('course catalog folders collapse synthetic course directions and wrapper skills for any course kind', () => {
  const courseNode = {
    ...node(10, 'Введение в программирование'),
    type: 'theory',
    links: JSON.stringify({ kind: 'future_program_course', courseKey: 'programming-intro' }),
  };
  const catalogSnapshot = {
    spheres: [
      {
        id: 1,
        name: 'Программирование',
        node_count: 1,
        open_action_count: 1,
        directions: [
          {
            id: 10,
            sphere_id: 1,
            name: 'Курсы',
            node_count: 1,
            open_action_count: 1,
            skills: [skill(100, 'Введение в программирование', [courseNode])],
          },
        ],
      },
    ],
    edges: [],
    archivedNodes: [],
    defaultSelection: { nodeId: 10, actionId: 1010 },
  };

  const entries = buildProgramHierarchy({ snapshot: catalogSnapshot, campaign: { id: 42, name: 'CS Program' } });
  const rootChildren = folderChildren(entries, 'campaign:42');
  const regionChildren = folderChildren(entries, 'sphere:1');
  const hiddenWrapper = entries.find((entry) => entry.stableId === 'skill:100');
  const course = entries.find((entry) => entry.stableId === 'node:10');

  assert.deepEqual(rootChildren.map((entry) => entry.stableId), ['sphere:1']);
  assert.deepEqual(regionChildren.map((entry) => entry.stableId), ['node:10']);
  assert.equal(entries.some((entry) => entry.stableId === 'direction:10'), false);
  assert.equal(hiddenWrapper?.role, 'infrastructure_object');
  assert.equal(hiddenWrapper?.parentStableId, null);
  assert.equal(course?.role, 'course_hub');
  assert.equal(course?.parentStableId, 'sphere:1');

  const objects = buildInfrastructureObjects({ entries, routeItems: [] });
  assert.equal(objects.length, 1);
  assert.equal(objects[0].title, 'Введение в программирование');
});

test('empty hierarchy produces deterministic no-object layer state', () => {
  const entries = buildProgramHierarchy({ snapshot: { spheres: [], edges: [], archivedNodes: [], defaultSelection: null } });
  const state = buildInitialProgramMapLayerState({ entries });

  assert.equal(entries[0].stableId, 'virtual:current');
  assert.equal(state.selectedObjectKey, null);
  assert.equal(state.fallbackReason, 'no_objects');
});
