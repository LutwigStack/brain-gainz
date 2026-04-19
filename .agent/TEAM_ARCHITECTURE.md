# TEAM_ARCHITECTURE

Local pipeline for BrainGainz:

1. Triage
2. Research
3. Design
4. Planning
5. Implementation
6. Review
7. Verify
8. Archive

## Local Sources Of Truth

- `.github/agents/`
- `.github/commands/`
- `.github/skills/`
- `tasks/`
- `docs/`

## Task Root

Use:

- `tasks/README.md` as the only status registry
- `tasks/brain-gainz/<NN-epic-name>/` for each epic

Each epic workspace should contain:

- `README.md`
- `plan.md`
- `workstreams/`
- optional `design/`

Each work item should be a single markdown file:

- `workstreams/<NN-name>.md`
- or `design/<NN-name>.md`

## Approval Rule

After the main `plan.md` is prepared, require one explicit user confirmation before implementation starts.

## WIP Rule

- one active epic
- one active item inside that epic

## Verification Rule

Do not close work without fresh evidence.

Default local checks:

- `npm run lint`
- `npm run build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` when available

## Documentation Rule

If process, CI, or task governance changes, update the relevant `.github/`, `tasks/`, and `docs/` surfaces in the same pass.
