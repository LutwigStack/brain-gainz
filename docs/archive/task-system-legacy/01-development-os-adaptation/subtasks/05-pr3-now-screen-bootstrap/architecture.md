# Subtask Architecture Notes: PR3 Now Screen Bootstrap

## Responsibility

- Introduce the first visible product UI for the node-centered system.
- Keep recommendation shaping in an application-layer service rather than pushing it into stores.
- Preserve coexistence with the legacy card UI.

## Layer Classification

- `domain`: lightweight recommendation heuristics expressed over PR1 node/action state
- `application`: now dashboard assembly, starter workspace bootstrap, daily-session start action
- `infrastructure`: reuse existing PR1 stores and database facade
- `transport`: none
- `presentation`: `Now` tab and recommendation/session cards
- `validation`: starter workspace guards and session-start preconditions
- `tests`: application/service regression tests over the new dashboard flow

## Design Boundaries

- No default-route cutover.
- No deletion or hiding of Library/Study.
- No full recommendation engine yet; heuristics remain thin and explainable.
- No map/tree/node-detail surfaces yet.

## Output Surface

- Visible `Now` tab as the default first screen for the first node-centered workflow.
- Application service over PR1 stores, not store inflation.
- Focused node detail, session progress, and a minimal completion loop over the active recommendation.