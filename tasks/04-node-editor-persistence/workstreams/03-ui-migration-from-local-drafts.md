# 03 UI Migration From Local Drafts

## Status

`done`

## Goal

Move `Node Editor` from local drafts to persisted node data.

## Scope

- remove the main localStorage workflow
- wire save / duplicate / archive to real db mutations
- keep a clear optimistic/pending UX
- remove temporary draft helpers if they are no longer needed
- add UI/integration tests for the editor rail

## Done When

- `Node Editor` works from a persisted source of truth
- local draft fallback is removed or reduced to an emergency buffer
- the rail stays consistent after editor mutations
