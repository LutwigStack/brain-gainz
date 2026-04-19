# PR1 Data Contract

## Goal

Define the additive persistence contract for PR1 so implementation can introduce the new hierarchy backbone, review/session support, and legacy migration seams without changing product behavior yet.

## PR1 Scope Boundary

### Included In PR1

- hierarchy backbone for `sphere -> direction -> skill -> node -> action`;
- dependency links between nodes;
- lightweight review/risk state;
- durable daily session header plus minimal outcome events;
- explicit mapping seams from legacy `subjects` and `cards` into the new model;
- repository/store boundaries that keep new work out of the current monolith shape.

### Explicitly Deferred Beyond PR1

- prioritization formulas and recommendation scoring;
- barrier records and error journal tables;
- dedicated project view models;
- destructive migration or automatic card cutover;
- full audit/event sourcing.

## Storage Conventions

- New PR1 tables use `INTEGER PRIMARY KEY AUTOINCREMENT` to stay consistent with the current SQLite baseline.
- Timestamps are stored as ISO-8601 `TEXT` in UTC.
- Boolean flags are stored as `INTEGER` with `0/1` semantics.
- Enums are stored as constrained `TEXT` values.
- Legacy tables `subjects` and `cards` are unchanged in PR1.

## Entity Inventory

| Concept | Table | Purpose |
|---|---|---|
| Sphere | `spheres` | Top-level area of growth |
| Direction | `directions` | Strategic track under a sphere |
| Skill | `skills` | Capability under a direction |
| Node | `nodes` | Main working unit |
| Action | `node_actions` | Smallest executable step on a node |
| Dependency | `node_dependencies` | Blocking/supporting relation between nodes |
| Review state | `review_states` | Lightweight risk/due support before PR2 ranking |
| Daily session | `daily_sessions` | Durable session header |
| Session event | `daily_session_events` | Minimal session outcome log |
| Legacy subject mapping | `legacy_subject_mappings` | Assisted migration seam for subjects |
| Legacy card mapping | `legacy_card_mappings` | Assisted migration seam for cards |

## Enums

### `node_type`

- `theory`
- `task`
- `project`
- `habit`
- `maintenance`
- `org_tail`
- `research`

### `node_status`

- `active`
- `paused`
- `done`
- `archived`

### `action_status`

- `todo`
- `ready`
- `doing`
- `done`
- `cancelled`

### `dependency_type`

- `requires`
- `supports`

### `risk_level`

- `low`
- `medium`
- `high`

### `session_status`

- `planned`
- `active`
- `completed`
- `abandoned`

### `session_event_type`

- `selected`
- `completed`
- `deferred`
- `blocked`
- `shrunk`

### `mapping_status`

- `pending`
- `suggested`
- `accepted`
- `archived`

### `mapping_decider`

- `manual`
- `automatic`
- `assisted`

### `card_link_role`

- `reference`
- `review_material`
- `practice_seed`

## Tables

### `spheres`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `name` | TEXT | not null |
| `slug` | TEXT | not null, unique |
| `description` | TEXT | nullable |
| `sort_order` | INTEGER | not null, default `0` |
| `is_archived` | INTEGER | not null, default `0` |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

### `directions`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `sphere_id` | INTEGER | not null, FK -> `spheres.id` |
| `name` | TEXT | not null |
| `slug` | TEXT | not null |
| `description` | TEXT | nullable |
| `sort_order` | INTEGER | not null, default `0` |
| `is_archived` | INTEGER | not null, default `0` |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

Constraints:

- unique on `sphere_id, slug`

### `skills`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `direction_id` | INTEGER | not null, FK -> `directions.id` |
| `name` | TEXT | not null |
| `slug` | TEXT | not null |
| `description` | TEXT | nullable |
| `sort_order` | INTEGER | not null, default `0` |
| `is_archived` | INTEGER | not null, default `0` |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

Constraints:

- unique on `direction_id, slug`

### `nodes`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `skill_id` | INTEGER | not null, FK -> `skills.id` |
| `type` | TEXT | not null, `node_type` |
| `status` | TEXT | not null, default `active`, `node_status` |
| `title` | TEXT | not null |
| `slug` | TEXT | not null |
| `summary` | TEXT | nullable |
| `importance` | TEXT | not null, `low|medium|high` |
| `target_date` | TEXT | nullable |
| `last_touched_at` | TEXT | nullable |
| `is_archived` | INTEGER | not null, default `0` |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

Constraints:

- unique on `skill_id, slug`
- `type` must use `node_type`
- `importance` must use `risk_level` values for MVP simplicity

### `node_actions`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `node_id` | INTEGER | not null, FK -> `nodes.id` |
| `title` | TEXT | not null |
| `details` | TEXT | nullable |
| `status` | TEXT | not null, default `todo`, `action_status` |
| `size_hint` | TEXT | nullable, e.g. `tiny|small|medium` kept unconstrained in PR1 |
| `sort_order` | INTEGER | not null, default `0` |
| `is_minimum_step` | INTEGER | not null, default `0` |
| `is_repeatable` | INTEGER | not null, default `0` |
| `due_at` | TEXT | nullable |
| `completed_at` | TEXT | nullable |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

### `node_dependencies`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `blocked_node_id` | INTEGER | not null, FK -> `nodes.id` |
| `blocking_node_id` | INTEGER | not null, FK -> `nodes.id` |
| `dependency_type` | TEXT | not null, default `requires`, `dependency_type` |
| `created_at` | TEXT | not null |

Constraints:

- unique on `blocked_node_id, blocking_node_id, dependency_type`
- check `blocked_node_id != blocking_node_id`

### `review_states`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `node_id` | INTEGER | not null, unique, FK -> `nodes.id` |
| `review_profile` | TEXT | not null, default `learning`; calculator hint for later layers |
| `next_due_at` | TEXT | nullable |
| `last_reviewed_at` | TEXT | nullable |
| `current_risk` | TEXT | nullable, `risk_level` |
| `updated_at` | TEXT | not null |

Notes:

- This table is intentionally compact.
- PR2 calculators interpret risk differently by node type instead of pushing many nullable columns into PR1 schema.

### `daily_sessions`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `session_date` | TEXT | not null, calendar date |
| `status` | TEXT | not null, `session_status` |
| `primary_node_id` | INTEGER | nullable, FK -> `nodes.id` |
| `primary_action_id` | INTEGER | nullable, FK -> `node_actions.id` |
| `started_at` | TEXT | nullable |
| `ended_at` | TEXT | nullable |
| `summary_note` | TEXT | nullable |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

### `daily_session_events`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `session_id` | INTEGER | not null, FK -> `daily_sessions.id` |
| `event_type` | TEXT | not null, `session_event_type` |
| `node_id` | INTEGER | nullable, FK -> `nodes.id` |
| `action_id` | INTEGER | nullable, FK -> `node_actions.id` |
| `note` | TEXT | nullable |
| `occurred_at` | TEXT | not null |

Constraints:

- at least one of `node_id` or `action_id` must be non-null

### `legacy_subject_mappings`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `legacy_subject_id` | INTEGER | not null, unique, FK -> `subjects.id` |
| `sphere_id` | INTEGER | nullable, FK -> `spheres.id` |
| `direction_id` | INTEGER | nullable, FK -> `directions.id` |
| `skill_id` | INTEGER | nullable, FK -> `skills.id` |
| `mapping_status` | TEXT | not null, default `pending`, `mapping_status` |
| `mapping_decider` | TEXT | not null, default `assisted`, `mapping_decider` |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

Notes:

- Subject mapping may stop at sphere, direction, or skill level.
- PR1 does not require automatic creation of hierarchy rows from legacy subjects.

### `legacy_card_mappings`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | INTEGER | PK autoincrement |
| `legacy_card_id` | INTEGER | not null, unique, FK -> `cards.id` |
| `node_id` | INTEGER | nullable, FK -> `nodes.id` |
| `mapping_status` | TEXT | not null, default `pending`, `mapping_status` |
| `mapping_decider` | TEXT | not null, default `assisted`, `mapping_decider` |
| `link_role` | TEXT | nullable, `card_link_role` |
| `created_at` | TEXT | not null |
| `updated_at` | TEXT | not null |

Notes:

- Card rows remain intact in legacy storage.
- Mapping records are the seam that later allows a card to attach to a node without immediate cutover.

## Relationship Rules

- `sphere -> direction -> skill -> node -> action` is the only valid ownership chain in PR1.
- Dependencies are node-to-node only in PR1.
- Daily sessions may point to a primary node and optionally a primary action.
- Session events may reference an action, a node, or both, but not neither.
- Legacy mappings are optional and additive.

## Migration Seams

### Legacy Preservation Rules

- `subjects` and `cards` stay readable and writable by the legacy flow.
- PR1 must not rename, drop, or repurpose legacy columns.
- New product flows must read new tables first and use mapping tables when referencing legacy material.

### Assisted Migration Rules

- Create mapping rows lazily when the user reviews or accepts a migration suggestion.
- Do not auto-create nodes from cards in PR1.
- Automatic migration may be added later only for obvious low-risk cases, using mapping rows as the audit seam.

### Rollback Posture

- If PR1 is reverted, legacy flows continue because all new tables are additive.
- The presence of mapping rows must never be required for the old subject/card workflow to run.

## Repository / Store Seams

- `HierarchyStore`
  - owns `spheres`, `directions`, `skills`, `nodes`, `node_actions`, `node_dependencies`
- `ReviewStateStore`
  - owns `review_states`
- `DailySessionStore`
  - owns `daily_sessions`, `daily_session_events`
- `LegacyMappingStore`
  - owns `legacy_subject_mappings`, `legacy_card_mappings`
- `LegacyCardStore`
  - existing `subjects`, `cards`; remains separate in PR1

## Key Invariants To Test In PR1

- invalid hierarchy ownership is rejected;
- self-dependency is rejected;
- session events cannot be stored without node or action linkage;
- legacy rows survive schema migration unchanged;
- mapping rows do not mutate legacy rows.

## Open Technical Decisions After This Contract

- Whether hierarchy slugs should be user-editable or generated-once in PR1.
- Whether `size_hint` should become a constrained enum in PR2.
- Whether `review_profile` should remain free-text or become a strict enum once type-specific calculators land.