# 01 Active Campaign Hero Slot

## Status

`done`

## Goal

Make `Продолжить обучение` feel like the main save slot of the app.

The user should see the active campaign identity, progress, and primary continuation action before noticing secondary controls.

## Problem

Current state has the right data, but the block still reads like a bordered row:

- campaign identity is small
- progress is not visually meaningful
- metrics are small badge text
- the CTA is not dominant enough
- the hero has no strong background mood like the mockup

## Scope

- `CampaignSaveSlot` in `src/components/CampaignMenu.tsx`
- related styles in `src/index.css`
- use existing accepted CS/campaign assets where possible
- do not change archive/fork persistence logic

## Requirements

- Wide hero layout on desktop:
  - large crest or campaign emblem on the left
  - campaign title and state in the middle
  - large progress number or progress module on the right
  - one strong `Продолжить` CTA
  - `...` menu remains secondary
- Add a visual background layer:
  - for CS bachelor, reuse accepted city/campaign assets if suitable
  - for unknown campaigns, use CSS fallback, not a new asset requirement
- Show only high-signal metrics:
  - `узл.`
  - `XP`
  - route status
  - progress percent
- Reduce small badges; use grouped metric cells instead.
- Keep archive hidden behind `...`.

## Done When

- The active campaign block is the strongest element on the screen.
- `Продолжить` is visually impossible to miss.
- User can understand current campaign state without reading every badge.
- No destructive/archive action appears as a peer of `Продолжить`.

## QA

- Desktop `1280x900`: hero reads like the primary save slot.
- Mobile `390x844`: hero collapses cleanly, CTA remains visible without horizontal scroll.
- Existing no-personal-campaign empty state still works.

## Implementation Notes

- Active personal campaign now renders as a wide visual save-slot with campaign art, crest, route/state, node count, XP, progress module, and one primary continue action.
- Archive remains inside the secondary `...` menu.
- Review pass fixed mobile CTA width and changed the third grouped metric from type to campaign status.
- Non-CS campaign copies now reuse their source template campaign-card art for the save-slot backdrop and large identity image.
- Desktop and mobile QA screenshots:
  - `tasks/28-campaign-menu-visual-parity/qa/01-active-hero-desktop.png`
  - `tasks/28-campaign-menu-visual-parity/qa/01-active-hero-mobile.png`
  - `tasks/28-campaign-menu-visual-parity/qa/02-non-cs-active-hero-art.png`
