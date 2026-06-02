# 30 Program Map Layers And CS Content

## Status

`done`

## Goal

Rebuild the map concept around a full content-first program structure.

The first real target is `Бакалавриат по информатике`. We should write and organize the campaign as a program graph first, then build map views over that graph.

Core idea:

> Content graph first. Game map second. Mind-map and folders are views over the same content.

## Why This Epic Exists

The current map feels strange because it tries to be too many things at once:

- game surface;
- knowledge graph;
- editor canvas;
- layer browser;
- route overlay;
- node inspector.

This epic separates those responsibilities into three user-facing layers:

1. `Город` - placeholder game surface for infrastructure objects.
2. `Карта знаний` - mind-map inside one selected object/course.
3. `Папки` - visual folder containers with icons, descriptions, progress, and actions.

## Product Rule

Do not draw the final game city before the course content exists.

First define:

- program;
- domains;
- modules/courses;
- infrastructure objects;
- atomic knowledge nodes;
- checks/practice items;
- prerequisite relationships.

Then render:

- city placeholder;
- object-level game surface;
- object mind-map;
- visual folders.

## Target Campaign

Use `Бакалавриат по информатике` as the calibration campaign.

The epic should make the CS bachelor structure usable enough to test:

- major domains;
- nested middle layers;
- course/object boundaries;
- atomic nodes;
- map navigation between layers;
- city-control MVP hooks.

## Layer Model

### 1. Город

The game surface.

MVP is a placeholder, not a final illustrated world map.

Shows:

- 6-12 infrastructure objects;
- object title;
- short description;
- control state;
- opponent pressure;
- progress;
- CTA `Открыть карту знаний`.

Does not show:

- all atomic nodes;
- author-only editing controls;
- deep prerequisite graph.

### 2. Карта знаний

The mind-map for one selected infrastructure object.

Shows:

- topics and atomic nodes inside the selected object;
- prerequisite relations;
- route/current focus;
- mastery/control state;
- weak/contested states;
- selected node inspector.

This is close to the current mind-map architecture, but scoped to one object instead of trying to show the whole program at once.

### 3. Папки

Visual folder containers, not text lists.

Shows:

- folder/object cards;
- icon or crest;
- title;
- object role;
- short description;
- node count;
- check count;
- progress/control state;
- CTA `Открыть`.

Lists are allowed only as a minor fallback, not as the main UX.

## Hierarchy Roles

The middle hierarchy can be arbitrarily nested. Do not hard-code one database table as one fixed educational level.

Before any layer UI is built, the app must expose one typed projection over the current tables:

```ts
interface ProgramHierarchyEntry {
  stableId: string;
  sourceKind: 'campaign' | 'sphere' | 'direction' | 'skill' | 'node' | 'virtual';
  sourceId: number | string;
  parentStableId: string | null;
  role: 'program_root' | 'domain' | 'module' | 'infrastructure_object' | 'atomic_node';
  depth: number;
  atomicDescendantCount: number;
  objectKey: string | null;
}
```

This projection is the source of truth for parent/child structure, object selection, folders, breadcrumbs, route focus, and city objects. Route rows and graph edges can enrich the projection, but they must not create a second conflicting hierarchy.

Use roles:

- `program_root` - the full campaign/program.
- `domain` - large area, such as mathematics or systems.
- `module` - course/block inside a domain.
- `infrastructure_object` - selected module/domain shown on the city layer.
- `atomic_node` - definition, concept, phenomenon, formula, practice unit, or checkable knowledge piece.

Current data can map approximately:

- campaign -> `program_root`
- high-level containers -> `domain`
- mid-level containers -> `module`
- selected containers -> `infrastructure_object`
- nodes / leaf concepts -> `atomic_node`

## Infrastructure Object Rule

An infrastructure object is a selected container, not a leaf node.

Examples:

- `Структуры данных` -> `Архив структур`
- `Дискретная математика` -> `Башня логики`
- `Алгоритмы` -> `Навигационный центр`
- `Базы данных` -> `Городское хранилище`
- `Основы программирования` -> `Мастерская кода`

Inside `Архив структур`:

- массивы;
- стек;
- очередь;
- деревья;
- хеш-таблицы;
- графы;
- tradeoffs.

These are mind-map nodes/topics, not city objects.

## Scope

Includes:

- CS bachelor content structure audit
- hierarchy role classifier
- map layer state/navigation contract
- infrastructure object mapping
- city placeholder layer
- object-scoped mind-map layer
- visual folder layer
- map navigation copy and tabs
- QA on CS bachelor

Excludes:

- final hand-drawn city map
- deep authoring workflow redesign
- full boss battle implementation
- multiple opponents
- replacing all campaign content
- large new asset generation unless placeholder quality blocks UX testing

## Success Criteria

- User can understand: `город -> объект -> карта знаний -> конкретный узел`.
- CS bachelor has clear domains, objects, and atomic node grouping.
- `Город` shows objects, not a giant cloud of nodes.
- `Карта знаний` stays focused on one object/course.
- `Папки` feel like visual containers, not a table/list.
- Infrastructure object mapping is deterministic but can be manually overridden later.
- Existing route, mastery, assessment, and control states still have a place.
- Mobile does not show a broken canvas-first experience.
- Learner mode and author/debug mode are clearly separated.
- Today/current route focus can open the right layer/object without guessing.

## Map Layer State Contract

Build the shared navigation state before city, mind-map, and folders views depend on it.

Minimum required shape:

```ts
interface ProgramMapLayerState {
  layer: 'city' | 'knowledge_map' | 'folders';
  selectedObjectKey: string | null;
  selectedFolderStableId: string | null;
  selectedEntryStableId: string | null;
  selectedNodeId: number | null;
  routeFocusNodeId: number | null;
  fallbackReason: string | null;
}
```

Rules:

- switching layers preserves `selectedObjectKey` when possible;
- Today/current route focus opens the object that contains the focused node;
- if route focus is outside the selected object, the app switches object or shows a compact fallback reason;
- learner navigation uses `Город`, `Карта знаний`, `Папки`;
- old author/free-canvas powers remain available only as author/debug controls.

## Workstreams

- `done` - [workstreams/01-cs-program-content-audit.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/01-cs-program-content-audit.md)
- `done` - [workstreams/02-hierarchy-role-classifier.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/02-hierarchy-role-classifier.md)
- `done` - [workstreams/07-map-layer-navigation-and-copy.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/07-map-layer-navigation-and-copy.md)
- `done` - [workstreams/03-infrastructure-object-mapping.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/03-infrastructure-object-mapping.md)
- `done` - [workstreams/04-city-placeholder-layer.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/04-city-placeholder-layer.md)
- `done` - [workstreams/05-object-mind-map-layer.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/05-object-mind-map-layer.md)
- `done` - [workstreams/06-visual-folder-containers.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/06-visual-folder-containers.md)
- `done` - [workstreams/08-cs-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/30-program-map-layers-and-cs-content/workstreams/08-cs-browser-qa.md)

## Suggested Sequence

1. Audit/write CS bachelor content structure.
2. Define hierarchy role classifier.
3. Define map layer state/navigation contract.
4. Map infrastructure objects.
5. Build city placeholder.
6. Scope mind-map to selected object.
7. Replace lists with visual folder containers.
8. Browser QA on CS bachelor.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - CS bachelor fresh personal copy
  - city placeholder with infrastructure objects
  - object -> mind-map transition
  - folders layer
  - selected object with nested middle layers
  - learner mode does not show editor/free-canvas controls as primary actions
  - author/debug mode can still access old editing powers
  - Today/current route focus opens the correct layer/object
  - node assessment/check flow still works after map redesign
  - mobile `390x844`
  - console warnings/errors: `0`
