# Subtask Architecture Notes: PR4 Navigation Bootstrap

## Responsibility

- Add the first hierarchy navigation layer beyond the recommendation queue.
- Reuse the same application/storage seams instead of creating a separate hierarchy runtime.
- Keep execution logic centered in `Now`; navigation remains browse-first in this bootstrap slice.

## Layer Classification

- `domain`: none
- `application`: hierarchy snapshot assembly for sphere map and skill tree
- `infrastructure`: reuse existing hierarchy and review/session stores
- `transport`: none
- `presentation`: `Map` tab, sphere map, skill tree, read-only node screen
- `validation`: safe empty-state handling when no hierarchy data exists
- `tests`: navigation snapshot regression coverage

## Design Boundaries

- No destructive route cutover.
- No second recommendation engine.
- No full node-operation rewrite inside the map surface yet.
- No project-specific or error-journal screens yet.

## Output Surface

- Browseable hierarchy surface for spheres, directions, skills, and nodes.
- Read-only node screen driven by the same data contract as `Now` focus.