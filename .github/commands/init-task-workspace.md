# Command: /init-task-workspace <epic_name>

Purpose: create a lightweight epic workspace under `tasks/brain-gainz`.

## Input

- `epic_name` (required; kebab-case)
- `epic_number` (optional but preferred)
- `date` (optional; `YYYY-MM-DD`)

## Process

1. Create `tasks/brain-gainz/<NN-epic-name>/`
2. Create:
   - `README.md`
   - `plan.md`
   - `workstreams/`
   - optional `design/`
3. Update `tasks/README.md`
4. Return the created paths

## Hard Stop

- Do not generate implementation artifacts.
- Do not create workstream files unless explicitly asked.

## Checklist Requirements

- `plan.md` must contain:
  - `Project Goal`
  - `Task Goal`
  - `Implementation Checklist`
  - `Validation Checklist`
  - `Rollout/Rollback Checklist` when applicable
