# 02 Hierarchy Role Classifier

## Status

`done`

## Goal

Create a deterministic role classifier for flexible nested program content.

## Scope

- `ProgramHierarchyEntry` projection adapter from current app tables
- derived hierarchy roles
- object candidate selection
- atomic descendant counting
- route/graph enrichment without changing tree parentage
- tests for projection and classifier behavior

## Requirements

- Use [hierarchy-and-map-rules.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/hierarchy-and-map-rules.md) as the source of truth.
- Do not hard-code `sphere/direction/skill/node` as fixed educational levels.
- Support arbitrary middle nesting.
- Use deterministic heuristics first.
- Leave room for future manual override.
- Treat the projection as the only source of truth for folder parentage, breadcrumbs, city objects, and object-scoped maps.
- Route rows and graph edges may annotate entries, but must not invent a conflicting parent/child tree.

## Required Projection

Implement a typed adapter that returns `ProgramHierarchyEntry[]`.

Required minimum shape:

```ts
type ProgramHierarchySourceKind =
  | 'campaign'
  | 'sphere'
  | 'direction'
  | 'skill'
  | 'node'
  | 'virtual';

type ProgramHierarchyRole =
  | 'program_root'
  | 'domain'
  | 'module'
  | 'infrastructure_object'
  | 'atomic_node';

interface ProgramHierarchyEntry {
  stableId: string;
  sourceKind: ProgramHierarchySourceKind;
  sourceId: number | string;
  parentStableId: string | null;
  role: ProgramHierarchyRole;
  depth: number;
  title: string;
  description: string | null;
  atomicDescendantCount: number;
  childContainerCount: number;
  objectKey: string | null;
  isInfrastructureObjectCandidate: boolean;
  routeNodeIds: number[];
  graphNodeIds: number[];
  reason: string;
}
```

Projection rules:

- `stableId` is deterministic across reloads and independent from array order.
- `sourceKind + sourceId` points back to the current app data.
- `parentStableId` defines the tree used by folders, breadcrumbs, and map focus.
- `objectKey` connects city card, object mind-map, folders, Today focus, and Wind Rose references to the same object.
- If current tables cannot represent a needed grouping, create a deterministic `virtual` entry.
- Graph edges remain relationships. They are not folder parentage.
- Route rows can define route order/current focus, but not the hierarchy tree.

## Classifier Output

Each projected entry should include:

- role;
- depth;
- atomic descendant count;
- child container count;
- infrastructure object candidate flag;
- reason string for tests/debug.

## Done When

- Tests cover the adapter from current tables to `ProgramHierarchyEntry[]`.
- Tests prove stable IDs across repeated calls and reordered inputs.
- Tests prove parent/child correctness for `campaign -> sphere -> direction -> skill -> node`.
- Tests prove route focus maps to one object when possible.
- Tests prove graph node maps to its object or gets a safe fallback.
- Tests cover deep middle nesting and `virtual` grouping fallback.
- Tests cover shallow campaign, deep campaign, small module, large domain, and leaf atomic nodes.
- CS bachelor object candidates match the audit recommendation.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
