# Epic Architecture Notes: Development OS Adaptation

## Current Baseline

- `presentation`: one large React surface in `src/App.jsx` combines navigation, state, import flows, study flow, and CRUD.
- `persistence`: SQLite accessed directly from frontend helper `src/db.js`.
- `runtime`: Tauri shell with SQL and log plugins; no backend domain orchestration yet.

## Target Product Model

### Core Entities

- `Sphere`: top-level area of growth.
- `Direction`: strategic track within a sphere.
- `Skill`: capability being built or maintained.
- `Node`: main working unit; typed as theory, task, project, habit, maintenance, org-tail, or research.
- `Action`: smallest executable step attached to a node.

### Supporting Entities

- `NodeDependency`: prerequisite or supporting link between nodes.
- `ReviewState`: reinforcement/forgetting state for nodes that need repetition.
- `ErrorLogEntry`: mistake, root-cause hypothesis, corrective change.
- `BarrierEntry`: friction source that blocks or delays work.
- `DailySession`: snapshot of recommended and executed actions.
- `ProjectBridge`: project-oriented projection of project-type nodes.

## Core Versus Secondary Product Layers

### Core

- Hierarchy and typed nodes.
- Action recommendation with explanation.
- Node screen with next/minimum step, dependencies, status, criteria, notes, errors, and review cues.
- Daily session orchestration.
- Error and barrier tracking because they directly affect what should happen next.

### Secondary But Valuable

- Sphere map and skill tree overview.
- Dedicated repetition screen.
- Project view as a filtered projection of node data.
- Functional gamification: mastery levels, meaningful streaks, decay indicators, checkpoints.

### Out Of First Version

- Cloud sync or collaboration.
- Heavy analytics dashboards.
- Complex adaptive scoring models or ML ranking.
- Rich visual maps before the recommendation core is working.

## Accepted MVP Decisions

### Node-Type-Specific Decay / Drift Logic

- Decay is not one universal formula.
- Learning nodes use `due-date + risk(low|medium|high)` derived from elapsed time, repeated errors, and node importance.
- Cards may keep separate review mechanics during the migration period and later attach to nodes as learning artifacts.
- Habit nodes do not model forgetting; they model streak break and stability weakening.
- Project nodes do not model forgetting in the same way; they model context loss, freeze risk, and re-entry cost.

### Daily Session Contract

- `DailySession` is durable but lightweight.
- Session storage includes a durable session header and a minimal set of outcome events.
- Accepted MVP outcome events are: `selected`, `completed`, `deferred`, `blocked`, `shrunk`.
- Full event sourcing is explicitly out of MVP scope.

### Cards In The New Product

- Cards are not the center of the product anymore.
- Legacy cards remain accessible through a legacy archive during migration.
- Default migration strategy is assisted migration, not blind automatic mapping.
- Automatic forward mapping is allowed only for the most obvious low-risk cases.
- In the target model, cards become node-attached learning assets or review material.

### Projects In MVP

- Projects are represented as `project` nodes.
- Separate project surface is deferred until the core loop is proven.
- First-wave priority remains: `Now` screen, node screen, daily session, errors, and basic review.

### Barrier Taxonomy

- Barrier capture uses a small typed taxonomy plus optional free-text note.
- MVP barrier types are:
	- `too_complex`
	- `unclear_next_step`
	- `low_energy`
	- `aversive_or_scary`
	- `wrong_time_or_context`

### Error Feedback Loop

- Errors are not passive journal entries.
- Repeated errors raise node priority.
- Error patterns may trigger a smaller next action, dependency surfacing, or action splitting.
- Error signals feed recommendation logic and node operating behavior.

### Explainability Contract

- Recommendation layer must always expose an explanation for why a step is primary now.
- Minimum explanation reasons available to the UI are:
	- `long_time_no_touch`
	- `blocks_next_nodes`
	- `recent_errors_here`
	- `cheap_fast_progress`
	- `foundational_node`
	- `best_fit_for_current_load`

### Meaningful Day Definition

- A day counts as successful if at least one of the following is true:
	- one main step completed;
	- one maintenance step plus one closed error completed;
	- one short daily session completed end-to-end.
- This definition is part of the product contract for rhythm and lightweight gamification.

## Planning Hypothesis

- Preserve Tauri shell, local SQLite storage, and desktop-first usage.
- Introduce a new domain model without immediately deleting card/review capabilities.
- Split future implementation into domain/data, application logic, and UI surfaces to avoid extending the current monolith.

## Domain Contracts

- `Node` becomes the main product object. Cards are one possible learning capability inside a node, not the root abstraction.
- Every recommended `Action` must answer three questions: what to do, why now, what degrades if skipped.
- `ErrorLogEntry` is diagnostic and must influence future action selection or node adjustments.
- `BarrierEntry` is useful only if it can reduce friction for the next step.
- `ReviewState` belongs to nodes and competes with projects, practice, and maintenance inside one priority system.

## Layering Direction

- `domain`: hierarchy entities, node types, progress, decay, errors, barriers, dependencies.
- `application`: recommendation rules, daily session assembly, action completion rules, review prioritization, migration adapters.
- `persistence`: SQLite schema and repositories.
- `transport`: thin local interfaces between UI and application logic; later optionally Tauri commands.
- `presentation`: screens and user flows.
- `validation`: node invariants, allowed transitions, action completeness, dependency integrity.
- `tests`: recommendation rules, migration behavior, node lifecycle, session assembly, legacy regression checks.

## Architectural Pressure Points

- Current schema cannot represent hierarchy, dependencies, action queues, decay, barriers, or error journals.
- Current UI cannot scale because product state and screen logic live in one component.
- Direct DB calls from UI are acceptable for bootstrap but become brittle once prioritization logic appears.

## Expected Migration Direction

- Add normalized entities for hierarchy, node metadata, actions, review state, errors, and sessions.
- Introduce recommendation logic for `Now` screen as an application layer, separate from raw storage.
- Keep card/review mechanics as one node capability rather than the app's root abstraction.
- Migrate additive-first so legacy card flows continue until the node-centered loop is genuinely usable.

## PR1 Persistence And Migration Seams

- PR1 introduces the first storage seams rather than extending one shared `db.js` surface indefinitely.
- Minimum PR1 persistence groups are:
	- `HierarchyStore`: spheres, directions, skills, nodes, actions, dependencies;
	- `ReviewStateStore`: lightweight review/risk state needed before ranking;
	- `DailySessionStore`: session header and minimal outcome events;
	- `LegacyMappingStore`: explicit mapping tables linking legacy subjects/cards to the new model.
- Existing `subjects` and `cards` remain intact and usable as legacy sources of truth during PR1.
- Migration seams are forward-only in PR1: new tables may reference legacy rows through mapping tables, but legacy tables must not be structurally repurposed.
- Per-node-type drift behavior should not be encoded as one giant nullable table in PR1; the persistence contract should stay compact and let PR2 calculators interpret state by node type.