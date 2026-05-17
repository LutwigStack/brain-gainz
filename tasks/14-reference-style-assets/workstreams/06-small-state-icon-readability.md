# 06 Small State Icon Readability

## Status

`planned`

## Goal

Make Daily Run task icons and mastery icons read as state language at their actual UI sizes, not just as nice art.

## Problem

Asset QA found that task and mastery icons are visually coherent but under-sized for state comprehension:

- Daily Run task icons render around `22x22`
- mastery icons render around `24x24`
- practice/recovery/deferred and mastery states require careful looking

## Scope

- audit current display sizes in Today, Daily Run cards, mastery ladder, and node badges
- decide whether to improve via larger display, simplified derivatives, stronger frames, or a combination
- create small-size derivatives only if layout alone is not enough
- preserve text labels and accessible names in HTML
- keep lucide action icons for actions

## UX Direction

State should be recognized by a combination of:

- icon silhouette
- color accent
- frame treatment
- placement
- label

Do not rely on generated art alone for a critical state.

## Done When

- practice, assessment, recovery, and deferred are distinguishable at real Daily Run card size
- mastery levels are distinguishable at the real mastery ladder size
- icons do not crowd card titles or primary actions
- mobile `390x844` remains usable without horizontal overflow
- screenshots show the state difference without zooming

## High-Risk Scenarios

- making icons bigger but reducing task title readability
- creating overly detailed second-generation icons that repeat the same problem
- using the same glow/frame for all states
- confusing action icons with state icons

## Suggested Tests

- browser QA on Today active Daily Run
- browser QA on completed Daily Run outcomes
- mobile `390x844`
- screenshot comparison against `asset-qa-02-desktop-today-daily-run.png`
- `npm run test`
- `npm run lint`
- `npm run build`
