# 09 Visual Density And Mobile Pass

## Status

`planned`

## Goal

Reduce visual noise and make the core screens usable at compact widths.

## Scope

- reduce repeated frames, nested borders, and identical badges
- differentiate:
  - system campaign
  - user campaign
  - active
  - disabled
  - verified
  - self-marked
  - draft / unsaved
- improve mobile nav wrapping
- keep button and card text inside containers
- make map and inspector order intentional on mobile
- hide or de-emphasize dev/debug metadata in normal view

## UX Direction

The UI can keep the pixel / command-interface identity, but repeated frames should not make every surface feel equally important.

Compact screens need fewer permanent panels, not smaller versions of every desktop box.

## Done When

- Campaign Menu, Today, and Map are usable at 390px width
- `English foundation` does not awkwardly break the navigation
- primary actions remain visible and readable
- different meanings do not share identical visual treatment
- internal IDs and debug-looking labels are secondary
- screenshots show improved scan hierarchy on desktop and mobile

## High-Risk Scenarios

- long campaign names
- long node titles
- right inspector on narrow desktop
- mobile map height versus inspector access
- disabled buttons with important reasons

