# 01 Campaign Menu And Shell

## Status

`planned`

## Goal

Make campaign selection the first user-facing step before entering the work area.

## Scope

- launch into campaign menu
- show developer main campaign
- show user-created campaigns
- create a new user campaign
- remember last opened campaign
- one-click continue for the last opened campaign
- archive campaigns from normal lists
- restore archived user campaigns from a compact manage / archived section
- campaign shell with tabs:
  - `Now`
  - `Map`
  - `Wind Rose`

## Campaign Model V1

- `id`
- `type`: `developer_main` or `user`
- `name`
- optional `icon`
- optional `color`
- `is_archived`
- `created_at`
- `updated_at`
- `last_opened_at`

Delete is out of scope for v1. Archive / hide is enough.

Campaign archive rules v1:
- user campaigns may be archived
- archived user campaigns are available in a compact manage / archived section
- archived user campaigns can be restored
- `developer_main` cannot be archived

## UX Direction

- Campaign menu is visual, not explanatory.
- Campaign cards show:
  - name
  - compact stat shape or progress indicator
  - last active branch
  - short progress signal
- Avoid permanent paragraphs explaining what campaigns are.
- Use one main action per card.
- The first screen may be the campaign menu, but it must not slow down return flow: the last campaign gets the most prominent continue action.
- Archived campaigns are not shown in the primary list and are never used for one-click continue.
- Developer main campaign always remains reachable from the primary campaign menu.

## Done When

- app launch shows campaign menu
- user can open the developer main campaign
- user can create and open a new campaign
- selected campaign opens into the campaign shell
- `Now`, `Map`, and `Wind Rose` tabs are scoped inside the selected campaign
- last opened campaign can be continued with one obvious click
- archived campaign does not appear as the continue target
- archived user campaign can be restored
- developer main campaign cannot become unreachable through archive
