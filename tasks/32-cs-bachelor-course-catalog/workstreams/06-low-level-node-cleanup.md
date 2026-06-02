# 06 Low Level Node Cleanup

## Status

`done`

## Goal

Remove or isolate current low-level CS template nodes before the top-level course catalog becomes the main learner structure.

## Why

The current `Бакалавриат по информатике` template contains low-level starter nodes that were useful for earlier lesson/check UX work.

After this epic, the main learner surface should show:

> regions -> courses / course hubs

not:

> a few old atomic programming lesson nodes mixed with the new bachelor catalog.

If old nodes remain on the main map/catalog, they will make the new structure look noisy and inconsistent.

## Scope

- identify existing low-level CS template nodes;
- decide whether to delete, archive, or move them to an author/debug fixture;
- keep user-owned personal progress safe;
- update seed/bootstrap behavior so old template nodes do not reappear;
- update tests to prove the CS template has course-level structure only.

## Requirements

- Main CS template must not show old atomic starter nodes as learner content.
- Do not delete personal campaign progress without an explicit migration policy.
- If old nodes are still needed for lesson/check QA, move them to a separate fixture/template or author-only test campaign.
- Keep `Бакалавриат по информатике` focused on the 8-region / 54-course catalog.
- Do not generate new lower nodes in this workstream.
- Re-running bootstrap must not resurrect removed template nodes.

## Cleanup Options

Preferred:

1. Remove low-level placeholder nodes from the CS bachelor template seed.
2. Preserve lesson/check QA examples in a separate fixture campaign if still needed.

Allowed:

- Archive old template nodes if the data model needs a reversible path.
- Hide old nodes behind author/debug mode if removal would break existing tests.

Not allowed:

- Leave old atomic nodes visible beside the new course catalog.
- Convert old nodes into courses just because they already exist.
- Delete user-owned personal campaign progress silently.

## Done When

- Fresh `Бакалавриат по информатике` template shows regions/courses, not old atomic lesson nodes.
- Existing personal campaign behavior is documented and safe.
- Tests verify old low-level template nodes are not reseeded.
- QA can confirm there is no low-level node noise on the main learner surface.
