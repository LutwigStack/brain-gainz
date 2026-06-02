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
