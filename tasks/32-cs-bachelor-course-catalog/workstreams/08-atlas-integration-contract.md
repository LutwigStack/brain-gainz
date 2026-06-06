# 08 Atlas Integration Contract

## Status

`done`

## Goal

Define how the course catalog feeds the future skill atlas.

## Scope

- course to `ProgramHierarchyEntry` mapping;
- region to atlas sector mapping;
- course to hub mapping;
- prerequisite edge export;
- route/current focus compatibility.

## Requirements

- Courses should become `module` or `infrastructure_object` entries.
- Regions should become `domain` entries.
- Atomic nodes are not required in this epic.
- The atlas can render course hubs even before lower nodes are generated.
- Route overlay should still work with existing lower content.

## Done When

- The atlas has enough course-level structure to render sectors and hubs.
- Later atomic node generation has clear parent course keys.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
