# 08 Atlas Integration Contract

## Status

`done`

## Goal

Define how the `NLH cash` course catalog feeds city/map/atlas views.

## Scope

- region to atlas sector mapping;
- course to hub mapping;
- course to `ProgramHierarchyEntry` mapping;
- prerequisite edge export;
- route/current focus compatibility.

## Requirements

- Courses should become `module` or `infrastructure_object` entries.
- Regions should become `domain` entries.
- Atomic spots are not required in this epic.
- The atlas can render course hubs before lower spots are generated.
- Risk guardrails should be visible in route/current focus where relevant.

## Done When

- The atlas has enough course-level structure to render regions and hubs.
- Later spot/check generation has clear parent course keys.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
