# Deterministic Action Commands

Goal: keep repo-local commands concrete and small.

## Intake

### `/idea-intake`

- Input: free-form idea or problem
- Output: `Problem Statement`, `Goal`, `Constraints`
- Hard Stop: no design or code

### `/init-task-workspace <epic_name>`

- Input: epic name and optional number
- Output: lightweight epic workspace with `README.md`, `plan.md`, and `workstreams/`
- Hard Stop: no implementation

### `/init-workstream <epic_name> <item_name>`

- Input: epic name, item name, optional number, optional track
- Output: one markdown work item under `workstreams/` or `design/`
- Hard Stop: no implementation

## Planning

### `/plan-prs`

- Input: approved design
- Output: reviewable delivery slices
- Hard Stop: one slice = one logical goal

## Implementation

### `/implement-backend <PRx>`

- Input: approved slice
- Output: changed files, rationale, local checks

### `/implement-frontend <PRx>`

- Input: approved slice
- Output: changed files, UI contract compliance, local checks

## Review And Verify

### `/review-pr <PRx>`

- Output: findings and decision

### `/verify-pr <PRx>`

- Output: check results and clean/not-clean decision

Default checks:

1. `npm run lint`
2. `npm run build`
3. `cargo check --manifest-path src-tauri/Cargo.toml`
4. `cargo test --manifest-path src-tauri/Cargo.toml`
5. `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` when available
