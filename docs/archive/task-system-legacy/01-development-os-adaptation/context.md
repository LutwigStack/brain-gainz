# Epic Context: Development OS Adaptation

## Request Summary

- Adapt BrainGainz from a card-centric repetition app into a personal development operating system.
- Do not implement code yet.
- Produce a reusable audit, gap analysis, target model, phased migration plan, MVP scope, backlog, risks, work order, and open questions.

## Product Direction

- Core domain shifts from `subject -> card` to `sphere -> direction -> skill -> node -> action`.
- Main user promise: always answer what to do now, why now, and what decays if delayed.
- MVP must remain actionable and avoid becoming an overbuilt life-management suite.

## Current Repo Facts

- Frontend is a single React component centered around subjects, cards, import, and study mode.
- Persistence is local SQLite via `@tauri-apps/plugin-sql` with `subjects` and `cards` tables.
- Rust/Tauri layer is minimal runtime/bootstrap without domain commands.
- README is still the default Vite template and does not document current product behavior.

## Audit Summary

### Useful As-Is

- Tauri shell and local-first desktop runtime.
- SQLite plugin and the existing persistence bootstrap.
- Basic local settings storage via localStorage.
- Async import/progress pattern, which can later be reused for batch actions and migrations.
- Card/review concept as a seed for one node capability.

### Can Stay With Minimal Change

- The overall stack: React + Vite + Tauri + SQLite.
- Rust bootstrap and plugin wiring unless future phases move orchestration behind Tauri commands.
- Desktop-first and local database assumptions.

### Needs Expansion

- SQLite schema: hierarchy, node metadata, actions, sessions, review signals, barriers, errors.
- App navigation: it currently supports only library/study-style behavior.
- State organization: product logic, UI state, and persistence need clear separation.
- Import flow: imported knowledge must attach to nodes, not remain the top-level abstraction.

### Must Be Reworked

- Core mental model from `subject/archive` to `development graph`.
- Main screen from library-first to `Now`/priority-first.
- Study mode from random queue to meaningful review inside node workflows.
- Monolithic `src/App.jsx` structure.

### Technical Debt / Architecture Traps

- UI, IO, and product logic are mixed in one component.
- DB helper exposes raw subject/card operations directly to the UI.
- Current review flow stores almost no useful signal; `Good` and `Again` behave the same.
- Product naming and data model are strongly card-centric.
- Repo documentation does not reflect the actual app behavior.

## Gap Analysis

### What The Project Does Now

- Stores subjects and cards locally.
- Imports terms in bulk and enriches them through external APIs.
- Displays cards in a grouped library view.
- Runs a simple study queue.
- Exports subject data to JSON.

### What The New Product Must Do

- Maintain a hierarchy: sphere -> direction -> skill -> node -> action.
- Recommend what to do now, why, and what degrades if skipped.
- Track progress, review needs, errors, and barriers.
- Run short daily sessions around meaningful next actions.
- Support theory, tasks, projects, habits, maintenance, org-tails, and research as node variations.

### Key Gaps

- No hierarchy or node-type domain model.
- No recommendation logic or explanation layer.
- No action entity or short-session execution model.
- No barrier handling or error journal.
- No meaningful mastery/decay model beyond a placeholder field.
- No screen architecture for `Now`, hierarchy, node, and session flows.
- No defined mapping yet from cards to nodes.

## Constraints

- Reuse existing project where useful; do not assume rewrite-from-scratch.
- Keep planning grounded in current Tauri + React + SQLite architecture.
- Human approval on the produced plan is required before any implementation wave.
- Migration should stay additive-first so the current card workflow is not broken too early.

## Epic Execution Topology

- Epic root stores shared product and migration decisions.
- Concrete execution is split into numbered subtask lanes under `subtasks/`.
- Current completed lanes:
	- `01-mvp-baseline-and-adr`
	- `02-pr1-foundation-contract`

## Approved MVP Product Decisions

- Knowledge decay uses `due-date + risk(low|medium|high)` and differs by node type.
- Learning nodes use time, errors, and node importance as the main decay signals.
- Cards keep their own review logic during migration and become node-attached artifacts in the new system.
- Habit nodes track streak break / stability weakening rather than knowledge decay.
- Project nodes track context loss / freeze risk rather than pure forgetting.
- Daily session uses a durable session header plus minimal outcome events: `selected`, `completed`, `deferred`, `blocked`, `shrunk`.
- Card migration is assisted-first, keeps a legacy archive, and only allows automatic mapping for the most obvious cases.
- Projects stay as `project` nodes in MVP; a dedicated project surface is deferred.
- Barrier capture uses a small typed taxonomy plus optional note.
- Error records must affect recommendations, action sizing, and dependency surfacing.
- Recommendation UI must always explain why a step is currently important.
- A meaningful day is explicitly defined for rhythm/gamification purposes.