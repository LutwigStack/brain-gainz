# 31 CS Skill Atlas POE Map

## Status

`done`

## Goal

Build a large circular skill atlas for `Бакалавриат по информатике`, visually inspired by Path of Exile's passive skill tree.

This replaces the current object mind-map line with a real learning atlas:

> A four-year CS bachelor program as a giant circular skill tree with domains, courses, atomic knowledge nodes, checks, route overlay, mastery, decay, and opponent pressure.

## Why This Epic Exists

The current mind-map still reads as a horizontal route/debug canvas:

- nodes are tiny;
- most of the canvas is empty;
- the structure is linear;
- labels are unreadable;
- user cannot see branches, domains, or strategic choices;
- route and knowledge structure are mixed into one line.

For a full bachelor program, the map needs to feel like a large skill system:

- circular;
- branching;
- dense but readable through zoom;
- icon-first;
- text shown in tooltip/details, not inside every node;
- regions/domains visible from far zoom;
- route/current focus shown as an overlay;
- mastery and opponent pressure visible as states.

## Product Thesis

`Карта знаний` should become the primary long-term learning surface.

The user should feel:

- "I am capturing a huge map of knowledge";
- "I can see the shape of the whole program";
- "I understand my current path";
- "I know which regions are weak or contested";
- "Every completed check unlocks or stabilizes a real node".

## Visual Direction

Reference principle:

- Path of Exile passive tree scale and circular structure.

Do not copy:

- exact art;
- icons;
- UI layout;
- naming;
- copyrighted assets.

Use the principle:

- circular/radial atlas;
- dense connected nodes;
- major hubs and small passives;
- colored regions;
- minimal icon nodes;
- hover/selection tooltip;
- route and mastery overlays;
- zoomable navigation.

## Core UX Rules

1. Node cards must not contain long text.
2. Node name, description, criteria, XP, route step, and check details open in tooltip/inspector.
3. Default node surface is icon + state only.
4. The whole atlas is readable at far zoom as domains/regions.
5. Mid zoom shows course/object clusters.
6. Close zoom shows atomic nodes and links.
7. Route is an overlay, not the map structure itself.
8. Learner view hides author handles/free-canvas controls.
9. Author/debug view can still edit structure through a secondary mode.
10. The first implementation must scale to hundreds of nodes without layout collapse.

## Information Architecture

Depends on epic `30 Program Map Layers And CS Content`.

Use `ProgramHierarchyEntry[]` as source of truth:

- `program_root` = full bachelor atlas center/root.
- `domain` = large region around the circle.
- `module` / `infrastructure_object` = large hubs inside regions.
- `atomic_node` = small skill nodes.

Recommended CS regions:

- `Программирование`
- `Математика`
- `Алгоритмы и структуры`
- `Компьютерные системы`
- `Данные и ИИ`
- `Теория информатики`
- `Инженерия ПО`
- `Проекты и практика`

## Node Types

- `root` - central program node.
- `domain_hub` - large region hub.
- `course_hub` - course/infrastructure object.
- `topic_node` - topic cluster node.
- `atomic_node` - checkable knowledge unit.
- `practice_node` - exercise/practice node.
- `review_node` - spaced repetition/weak spot node.
- `boss_node` - exam/project/checkpoint.

## Node States

- `locked` - not reachable yet.
- `available` - can start.
- `current` - current route focus.
- `in_progress` - started, not verified.
- `verified` - verified mastery/XP counted.
- `self_marked` - user marked familiar, no verified XP.
- `weak` - decay/needs review.
- `contested` - opponent pressure on this node/region.
- `boss` - major check.

## Route Overlay

The atlas exists independently from the route.

Route overlay shows:

- current node;
- next 3-5 route nodes;
- completed route nodes;
- blocked route branches;
- boss/checkpoint targets.

It must not flatten the atlas into a line.

## Tooltip / Inspector Rule

Hover/focus tooltip:

- title;
- short description;
- status;
- why this node matters;
- prerequisite summary;
- mastery/XP;
- current action.

Selected node inspector:

- full task/check;
- answer UI;
- evidence/result if needed;
- route actions;
- author details only in author mode.

## Scope

Includes:

- CS skill atlas visual rules
- radial layout model
- node type/state model
- icon language
- tooltip/inspector interaction
- route/mastery/opponent overlays
- performance budget
- MVP prototype for one deep CS region
- browser QA against current linear map

Excludes:

- complete 1000+ node hand-authored bachelor content
- final city art
- multiple opponents
- boss battle gameplay beyond checkpoint node states
- replacing all existing graph editor powers

## MVP Slice

Build the first realistic slice on:

- `Программирование`
- `Основы программирования`
- `Мастерская кода`

Target density:

- 80-150 nodes in the prototype data/view;
- 5-8 branches;
- 8-16 course/topic hubs;
- 8-12 boss/checkpoint nodes;
- enough locked/available/current/verified/weak/contested states to test visual language.

The prototype should prove scale and interaction. It does not need final full bachelor content.

## Success Criteria

- The map looks like a game skill atlas, not a route line.
- At far zoom, user sees the shape of the bachelor program.
- At mid zoom, user sees domains and course hubs.
- At close zoom, user sees atomic nodes.
- Node labels do not clutter the map.
- Tooltip/inspector makes selected node understandable.
- Route overlay is visible but does not dominate.
- Weak/contested states are visible without turning the map into noise.
- Learner mode feels like progression, not editing.
- Mobile has a usable fallback/overview, even if the full atlas is desktop-first.

## Workstreams

- `done` - [workstreams/01-atlas-visual-rules.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/01-atlas-visual-rules.md)
- `done` - [workstreams/02-radial-layout-engine.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/02-radial-layout-engine.md)
- `done` - [workstreams/03-node-types-and-states.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/03-node-types-and-states.md)
- `done` - [workstreams/04-minimal-icon-system.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/04-minimal-icon-system.md)
- `done` - [workstreams/05-tooltip-and-inspector.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/05-tooltip-and-inspector.md)
- `done` - [workstreams/06-route-mastery-opponent-overlays.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/06-route-mastery-opponent-overlays.md)
- `done` - [workstreams/07-cs-programming-slice-prototype.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/07-cs-programming-slice-prototype.md)
- `done` - [workstreams/08-performance-and-zoom.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/08-performance-and-zoom.md)
- `done` - [workstreams/09-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/workstreams/09-browser-qa.md)

## Suggested Sequence

1. Define visual rules and node scale language.
2. Define radial layout engine and zoom levels.
3. Define node types/states and icon language.
4. Implement tooltip/inspector behavior.
5. Add route/mastery/opponent overlays.
6. Build one deep CS programming slice.
7. Validate performance/zoom with hundreds of nodes.
8. Browser QA against current mind-map problems.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`
  - wide desktop
  - mobile `390x844`
  - far/mid/close zoom
  - hover/focus tooltip
  - keyboard focus tooltip
  - selected node inspector
  - route overlay on/off
  - weak/contested state visibility
  - learner mode no author handles
  - author mode can still open edit powers
  - console warnings/errors: `0`

