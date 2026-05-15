# 08 Wind Rose Branch Polish

## Status

`planned`

## Goal

Keep Wind Rose as a visual stat overview and improve the branch panel so it does not feel like a text table.

## Scope

- strengthen selected stat to branch relationship
- add compact branch state:
  - progress
  - blocked / next / active
  - primary target
- make `Открыть ветку` target clear before clicking
- reduce plain counter-row feel
- preserve stat -> branch -> map navigation

## UX Direction

Wind Rose should show:
- which stats are weak or strong
- which branches feed a stat
- which branch is the next useful target
- how clicking leads back to the map

The right panel should feel like branch navigation, not a settings table.

## Done When

- selected stat is visually tied to the branch list
- branch rows have more than a count; they show useful state
- primary branch action target is clear
- clicking a branch opens expected map focus
- Wind Rose remains visual-first with limited permanent prose

## High-Risk Scenarios

- stat with zero XP
- stat with many branches
- branch with no route / no open node
- completed branch
- mobile layout

