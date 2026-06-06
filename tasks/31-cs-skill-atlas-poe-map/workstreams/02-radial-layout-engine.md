# 02 Radial Layout Engine

## Status

`done`

## Goal

Create a deterministic radial layout for `ProgramHierarchyEntry[]`.

## Scope

- program/domain/course/topic/atomic placement
- radial rings
- branch angle allocation
- local cluster layout
- cross-link routing
- stable positions across reloads

## Requirements

- Input is `ProgramHierarchyEntry[]` from epic 30.
- Do not depend on hand-dragged coordinates for learner map.
- Layout must be deterministic.
- Domains occupy stable angular sectors.
- Course/infrastructure hubs sit inside their domain sector.
- Atomic nodes form local branches around their topic/course hubs.
- Route overlay must not change base layout.
- New nodes should not reshuffle the whole atlas if avoidable.

## Proposed Output

```ts
interface SkillAtlasLayoutNode {
  stableId: string;
  x: number;
  y: number;
  radius: number;
  angle: number;
  ring: number;
  sectorKey: string;
  nodeVisualType: string;
}

interface SkillAtlasLayoutEdge {
  id: string;
  fromStableId: string;
  toStableId: string;
  edgeType: string;
  points?: Array<{ x: number; y: number }>;
}
```

## Done When

- Layout works for 80-150 node prototype.
- Layout has no single horizontal line failure.
- Repeated runs produce stable positions.
- Far zoom silhouette is circular.
- Mid zoom shows domains and hubs.



## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
