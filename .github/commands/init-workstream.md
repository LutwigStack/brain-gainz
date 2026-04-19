# Command: /init-workstream <epic_name> <item_name>

Purpose: create one lightweight work item inside an existing epic.

## Input

- `epic_name` (required)
- `item_name` (required; kebab-case)
- `item_number` (optional but preferred)
- `track` (optional; `workstreams` by default, `design` when needed)

## Process

1. Ensure the epic path exists
2. Create `tasks/brain-gainz/<NN-epic-name>/<track>/<NN-item-name>.md`
3. Add a concise template with status, goal, and exit criteria
4. Update `tasks/README.md` if the active item changes

## Hard Stop

- Do not create nested folders for a single work item
- Do not create `review/` unless the user explicitly asks for archived review artifacts
