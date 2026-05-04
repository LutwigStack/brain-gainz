# 07 Stat To Branch Navigation

## Status

`planned`

## Goal

Make the wind rose a fast route into the map.

## Scope

- click stat
- show branches that train it
- show branch progress visually
- open selected branch map
- preserve selected campaign context

## Branch Definition V1

- Branch means campaign-scoped `skill`.
- Branch selection opens the existing map with that skill as the active focus/filter.
- Branch selection does not create a new graph model.
- Free canvas and layers mode continue to work inside the selected campaign.
- Branch focus may narrow what is initially visible, but node/edge truth stays campaign graph truth.

## UX Direction

- Branch choices should be compact cards or chips.
- Use visual progress, stat color, and active-node count.
- Avoid long branch descriptions.
- The main action is opening the branch map.

## Done When

- user can enter campaign
- open wind rose
- click a stat
- choose a branch
- land on the map for that branch
- no unrelated campaign data appears during this flow
- creating, editing, archiving, undoing, and connecting nodes still works in both free canvas and layers inside the selected campaign
