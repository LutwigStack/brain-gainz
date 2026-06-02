# 32 CS Bachelor Course Catalog

## Status

`done`

## Goal

Define the top-level course catalog for `Бакалавриат по информатике`.

This epic turns the proposed bachelor course list into a structured program plan for BrainGainz:

- regions;
- courses;
- course groups;
- prerequisite links between courses;
- suggested semester flow;
- infrastructure object candidates for the future skill atlas.

Lower atomic nodes are intentionally out of scope for this epic.

Existing low-level placeholder nodes in the CS bachelor template should be removed or isolated during this epic, otherwise they will visually compete with the course catalog and skill atlas hubs.

## Product Rule

Do not write the bottom skill nodes yet.

Also do not keep the current low-level CS seed nodes on the main learner surface after the new catalog lands. They should be deleted from the template, archived, or moved behind an author/debug fixture path.

This epic answers:

- what courses exist;
- where each course belongs;
- what depends on what;
- which courses become large atlas hubs/infrastructure objects;
- how the four-year program should roughly progress.

It does not answer:

- every lesson inside a course;
- every concept/check node;
- exact assessment prompts;
- final generated map coordinates.

## Why This Epic Exists

The future PoE-like skill atlas needs a solid program skeleton before node generation.

If we generate atomic nodes too early, the map will become a pile of disconnected content. First we need a stable upper structure:

> region -> course/hub -> later topic nodes -> later atomic nodes.

## Source Blend

The catalog is inspired by common patterns across strong CS programs and curriculum guidance:

- CS2023 ACM/IEEE/AAAI knowledge areas;
- Stanford-style CS core;
- Berkeley-style lower division foundation;
- CMU-style rigorous core;
- Waterloo-style first-year math and programming base;
- Oxford-style theory/practice/project balance.

This is not a copy of one university. It is a BrainGainz-optimized bachelor structure.

## Target Structure

Use 8 regions:

1. `Программирование`
2. `Математика`
3. `Алгоритмы и теория`
4. `Компьютерные системы`
5. `Данные и ИИ`
6. `Инженерия ПО и продукт`
7. `Общество, этика, право`
8. `Проекты`

Use the canonical course list from:

- [course-catalog.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/course-catalog.md)

## Integration With Existing Epics

Depends on:

- [30 Program Map Layers And CS Content](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/README.md)
- [31 CS Skill Atlas POE Map](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/README.md)

This epic should produce course-level data that can later feed:

- `ProgramHierarchyEntry[]`;
- city infrastructure objects;
- skill atlas course hubs;
- route generation;
- Today/current focus;
- Wind Rose region progress.

## Course Object Rules

Each course should have:

- stable key;
- Russian title;
- region;
- short learner-facing description;
- level: `pre-core`, `core`, `intermediate`, `advanced`, `project`;
- expected year/semester window;
- prerequisite course keys;
- recommended follow-up course keys;
- infrastructure object candidate flag;
- atlas hub type;
- rough size bucket: `small`, `medium`, `large`, `capstone`.

## Scope

Includes:

- canonical top-level course catalog;
- region grouping;
- course prerequisites;
- semester progression;
- course-to-infrastructure mapping;
- cleanup/isolation of existing low-level CS template nodes;
- seed/data implementation plan;
- QA rules for course catalog visibility.

Excludes:

- lower atomic nodes;
- detailed lesson plans;
- check metadata;
- final map layout;
- generated images/assets;
- full route authoring;
- pre-university bridge content, except optional references as prerequisites.

Special note:

- Removing noisy template seed nodes is in scope.
- Deleting user-owned progress from personal campaigns is not in scope.

## Success Criteria

- `Бакалавриат по информатике` has a clear 4-year course skeleton.
- The catalog is broad enough for a real CS bachelor, not a short bootcamp.
- The catalog is not overloaded with duplicate courses.
- Every course belongs to one main region.
- Core prerequisites are defensible.
- Future atlas hubs can be generated from the course catalog.
- Agents can later expand any course into topic/atomic nodes without guessing the top-level structure.
- Current low-level placeholder nodes no longer appear as noise in the main CS learner map/catalog.

## Workstreams

- `done` - [workstreams/01-catalog-source-review.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/01-catalog-source-review.md)
- `done` - [workstreams/02-region-and-course-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/02-region-and-course-model.md)
- `done` - [workstreams/03-prerequisite-course-graph.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/03-prerequisite-course-graph.md)
- `done` - [workstreams/04-semester-progression.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/04-semester-progression.md)
- `done` - [workstreams/05-infrastructure-object-mapping.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/05-infrastructure-object-mapping.md)
- `done` - [workstreams/06-low-level-node-cleanup.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/06-low-level-node-cleanup.md)
- `done` - [workstreams/07-seed-and-data-plan.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/07-seed-and-data-plan.md)
- `done` - [workstreams/08-atlas-integration-contract.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/08-atlas-integration-contract.md)
- `done` - [workstreams/09-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/32-cs-bachelor-course-catalog/workstreams/09-browser-qa.md)

## Suggested Sequence

1. Confirm the canonical course list.
2. Define course data model and stable keys.
3. Build prerequisite graph between courses.
4. Draft semester/year progression.
5. Map courses to infrastructure objects/atlas hubs.
6. Remove or isolate current low-level CS template noise.
7. Plan seed/data migration without atomic nodes.
8. Define atlas integration contract.
9. Browser QA after implementation.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - campaign menu still shows `Бакалавриат по информатике`;
  - course catalog is visible as program structure;
  - regions are readable;
  - course hubs/cards do not look like atomic lessons;
  - old low-level template nodes do not pollute the main learner surface;
  - no new lower-node spam is generated in this epic;
  - route/current focus still works on existing content;
  - mobile `390x844`;
  - console warnings/errors: `0`.
