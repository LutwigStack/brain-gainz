# Engineering Standards

## Delivery Rules

- Plan top-level work in `tasks/brain-gainz/<NN-epic-name>/plan.md`.
- Track implementation work in one-file work items under `workstreams/`.
- Track design-only exploration separately under `design/`.
- Keep one active epic and one active item.
- Do not expand scope silently.

## Validation Rules

- Frontend: `npm run lint`, `npm run build`
- Rust/Tauri: `cargo check --manifest-path src-tauri/Cargo.toml`, `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` when available

## Documentation Rules

- If CI, task governance, or local agent contracts change, sync `.github/`, `tasks/`, and `docs/` in the same pass.
- Put unverified ideas into `Deferred Ideas / Not Tested Here` or a follow-up work item.
