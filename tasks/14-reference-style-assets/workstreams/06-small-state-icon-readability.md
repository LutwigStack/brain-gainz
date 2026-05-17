# 06 Small State Icon Readability

## Status

`done`

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

## Implementation Notes

- Daily Run and Today task icon slots now use explicit state modifiers: `practice`, `assessment`, `recovery`, and `deferred`.
- Task icons render in larger fixed slots with distinct frame color, border style, and small geometric markers, while keeping action icons as lucide controls.
- Mastery ladder icons render larger and each level gets a distinct frame accent, with completion/required state layered on top.
- No generated derivative assets were needed; layout and frame language were enough.

## QA

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA desktop: `tasks/14-reference-style-assets/qa/small-state-icons-desktop.png`
- Browser QA mobile `390x844`: `tasks/14-reference-style-assets/qa/small-state-icons-mobile-390.png`
- Browser metrics: desktop and mobile horizontal overflow `0`; Daily Run state icon slots `40x40`; mastery icons `32x32` desktop and `30x30` mobile.
