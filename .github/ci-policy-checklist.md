# CI Policy Checklist

Goal: one set of merge checks before merge into `main` or `dev`.

## Required Checks

Rust:

- `cargo check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`

Frontend:

- `npm run lint`
- `npm run build`

Tooling:

- Keep `.github/` policy files in sync when CI changes.
- Keep `tasks/README.md` in sync when task governance changes.
