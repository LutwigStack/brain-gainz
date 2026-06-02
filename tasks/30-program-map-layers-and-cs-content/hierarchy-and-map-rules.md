# Hierarchy And Map Rules

## 1. Content First

The campaign content graph is the source of truth.

Do not design the game city as a separate disconnected structure. The city, mind-map, and folders are views over the same program graph.

Correct order:

1. Program content.
2. Hierarchy roles.
3. Infrastructure object mapping.
4. Map views.

## 2. Flexible Hierarchy

The middle layer can be arbitrarily nested.

Do not assume:

- `sphere` always means program;
- `direction` always means semester;
- `skill` always means course;
- `node` always means atomic concept.

Those can be useful defaults, but the app needs role classification.

## 2.1. Projection Contract

Before building UI layers, implement one typed projection from the current app tables into a program hierarchy.

All map layers must consume this projection instead of independently interpreting `sphere`, `direction`, `skill`, `node`, route rows, or graph edges.

Required shape:

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

Rules:

- `stableId` must be deterministic across reloads and independent from array order.
- `sourceKind + sourceId` must point back to the current app data.
- `parentStableId` defines the tree used by folders and breadcrumbs.
- `objectKey` links entries that represent the same infrastructure object across city, mind-map, folders, Today, and Wind Rose.
- Route and graph data may enrich entries, but must not create a second conflicting hierarchy.
- If a legacy structure cannot express a needed grouping, use `sourceKind: 'virtual'` with a deterministic `sourceId`.

Required tests:

- adapter from current tables to `ProgramHierarchyEntry[]`;
- stable IDs across repeated calls;
- parent/child correctness;
- route focus maps to one object when possible;
- graph node maps to its object or gets a safe fallback;
- deep middle nesting still produces folders and object candidates.

## 3. Roles

### `program_root`

The full campaign or program.

Examples:

- `Бакалавриат по информатике`
- `Бакалавриат по биологии`
- `NLH cash`

### `domain`

A large area inside a program.

Examples:

- `Математика`
- `Программирование`
- `Системы`
- `ИИ и данные`

### `module`

A course or coherent learning block.

Examples:

- `Линейная алгебра`
- `Дискретная математика`
- `Структуры данных`
- `Алгоритмы`

### `infrastructure_object`

A selected container shown on the city/game layer.

Examples:

- `Структуры данных` as `Архив структур`
- `Алгоритмы` as `Навигационный центр`
- `Базы данных` as `Городское хранилище`

### `atomic_node`

The lowest useful learning/check unit.

Examples:

- definition;
- concept;
- theorem;
- phenomenon;
- formula;
- operation;
- practice task;
- checkable skill.

## 4. Infrastructure Object Selection

An infrastructure object is a selected container, not a leaf.

Automatic MVP heuristic:

1. A candidate must have child content.
2. A candidate should have at least `5` atomic descendants.
3. A candidate should be educationally coherent.
4. If a candidate has too many direct child modules, use its children as objects and keep it as a domain.
5. If a candidate is too small, group it under its parent.

Manual override should be possible later, but is not required in the first implementation.

## 5. Map Layer Responsibilities

### City

Input:

- infrastructure objects.

Output:

- object cards/islands;
- control state;
- opponent pressure;
- progress;
- CTA to object mind-map.

### Mind-map

Input:

- one selected infrastructure object and descendants.

Output:

- topics and atomic nodes;
- relationships;
- route/current focus;
- mastery/control states.

### Folders

Input:

- current container and child containers.

Output:

- visual folder cards;
- icons;
- descriptions;
- counts;
- control/progress;
- open action.

## 6. CS Bachelor Calibration

Recommended first CS object set:

- `Основы программирования` -> `Мастерская кода`
- `Дискретная математика` -> `Башня логики`
- `Структуры данных` -> `Архив структур`
- `Алгоритмы` -> `Навигационный центр`
- `Базы данных` -> `Городское хранилище`
- `Отладка и тестирование` -> `Ремонтный док`
- `Математическая запись` -> `Зал доказательств`
- `Модель памяти` -> `Механический цех`

This can change after content audit, but agents should start here.

## 7. UX Rule

Never show the same content as three unrelated worlds.

The user path must be:

> city object -> object mind-map -> atomic node/check

Folders are a navigation alternative for the same structure, not a fourth competing map.

## 8. Map Layer State Contract

The three layers must share one state contract before individual views are implemented.

Required shape:

```ts
type MapLayerId = 'city' | 'knowledge_map' | 'folders';

interface ProgramMapLayerState {
  layer: MapLayerId;
  selectedObjectKey: string | null;
  selectedFolderStableId: string | null;
  selectedEntryStableId: string | null;
  selectedNodeId: number | null;
  routeFocusNodeId: number | null;
  fallbackReason: string | null;
}
```

Rules:

- Switching layers must preserve `selectedObjectKey` when possible.
- If a route/current focus is outside the selected object, the app must either switch selected object or show a clear fallback reason.
- City layer can have no selected object.
- Knowledge-map layer should select the route/current object by default.
- Folders layer should open at selected object or nearest parent container.
- Author mode may expose old editor powers, but learner mode must not show old technical canvas/layer controls as primary navigation.
