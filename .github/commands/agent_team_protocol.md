# Agent Team Protocol

Source of truth:

- `.agent/TEAM_ARCHITECTURE.md`

## Task Registry

If an agent creates, updates, closes, or archives an epic or work item, update:

- `tasks/README.md`

and the relevant epic-local files in the same pass.

## Task Topology

Default structure:

- `tasks/brain-gainz/<NN-epic-name>/`

Epic structure:

- `README.md`
- `plan.md`
- `workstreams/`
- optional `design/`

Work item structure:

- one markdown file per item

Examples:

- `workstreams/01-pr1-storage-foundation.md`
- `design/08-skill-map-constructor.md`

## Task Continuity

One user approval on the main `plan.md` authorizes the approved wave unless scope materially changes.

## Startup Brief

Before non-trivial work, read:

- `README.md`
- `package.json`
- `src-tauri/Cargo.toml`
- `tasks/README.md`
- the active epic `plan.md`, if it exists
- the active work item markdown file, if it exists

## Closeout Rules

- Do not close work if `tasks/README.md` is stale.
- Keep unverified ideas in `Deferred Ideas / Not Tested Here`.
