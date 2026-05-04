# 04 Campaign Stats Model

## Status

`planned`

## Goal

Give each campaign its own specialized stats and connect branches to those stats.

## Scope

- campaign-owned stats
- stat title, key, color, icon, sort order
- seeded stats for developer main campaign
- minimal default stat set for new user campaigns
- primary stat assignment for branches
- compact stat marker on branch / map surfaces
- no weighted multi-stat branch UI or XP in v1

## Branch Definition V1

- Branch means a campaign-scoped `skill`.
- `branch_id` is `skill.id`.
- A branch owns the nodes already assigned to that skill.
- A branch may have one `primary_stat_id`.
- If a branch has no `primary_stat_id`, completed nodes in that branch create no XP grant in v1.
- Branches without a stat must show a compact visual warning wherever completion / XP context is relevant.
- The branch map opens the existing map focused / filtered to that skill.
- Cross-branch edges are still graph edges in the campaign; branch focus must not create a second edge model.

## Initial Stat Sets V1

- Developer main campaign is seeded with project-authored stats.
- New user campaigns start with a minimal default stat set so the wind rose is usable immediately.
- Statless campaign is allowed only as a controlled empty state during setup, not as the normal created-campaign result.
- Empty wind rose must show a visual setup affordance, not a broken blank chart or long explanatory text.
- Stat delete / merge is out of scope for v1.

## Examples

Math campaign:
- algebra
- geometry
- analysis
- proofs
- discrete math

Language campaign:
- vocabulary
- grammar
- listening
- speaking
- reading
- writing

Programming campaign:
- algorithms
- architecture
- debugging
- databases
- interfaces

## Done When

- campaign can define its own stat set
- developer main campaign has seeded stats
- new user campaign gets a usable stat path immediately
- a branch can assign a primary stat
- branch without primary stat behaves explicitly and shows a compact warning
- branch stat identity is visible without large text blocks
- stats are available for XP and wind rose rendering
- weighted stats are not implemented in schema, UI, or XP logic for v1
