# Copilot Instructions for BrainGainz

These are repo-local rules for BrainGainz.

## Repo Scope

- Code and docs live only in this repository.
- Local task root: `tasks/`.
- Use `tasks/README.md` as the only task-status registry.
- Default epic path: `tasks/brain-gainz/<NN-epic-name>/`.
- Default work item path: `tasks/brain-gainz/<NN-epic-name>/workstreams/<NN-name>.md`.
- Design-only items belong in `design/`.

## Startup Brief

Before non-trivial work, read:

1. `README.md`
2. `package.json`
3. `src-tauri/Cargo.toml`
4. `tasks/README.md`
5. the active epic `plan.md`
6. the active work item markdown file

## Human In The Loop

After preparing the main `plan.md`, request one explicit user confirmation before implementation.

## Task System

Epic workspace:

- `README.md`
- `plan.md`
- `workstreams/`
- optional `design/`

Work item:

- one markdown file per item

Update in the same pass:

- `tasks/README.md`
- the relevant epic-local files

## Validation

Use fresh checks relevant to the change:

- `npm run lint`
- `npm run build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` when available
