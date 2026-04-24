# 02 Bulk Layout Actions

## Status

`done`

## Goal

Speed up graph cleanup when one-by-one dragging becomes too slow.

## Scope

- explicit layout actions on a clearly defined v1 target boundary
- v1 target boundary is limited to:
  - current biome / region from the rail context
  - explicitly requested one-hop neighborhood around the focused node
- v1 does not depend on multi-select or freeform region lasso
- simple helpers such as spread, tidy, radialize, or align by relation
- confirmation and preview rules before writing persisted coordinates
- clear boundary between helper-generated positions and ordinary manual editing

## Done When

- the user can reorganize a region faster than dragging every node manually
- layout actions stay explicit and previewable before persistence
- preview can be cancelled before writing coordinates
- helpers never run silently on refresh or selection change
- resulting coordinates persist through the normal graph model
