# 03 Ready Grid Empty Slot

## Status

`completed`

## Goal

Keep the ready campaign showcase looking intentional when some templates are hidden.

If a user already has a personal copy of `Бакалавриат по информатике`, that template is correctly hidden. The remaining grid should not look like a broken layout.

## Problem

Current behavior is logically correct but visually awkward:

- hidden templates can leave an uneven grid
- five cards can look like one card fell to a new row by accident
- the mockup uses a calm placeholder card to explain that more programs will appear

## Scope

- Campaign Menu ready campaign grid only
- no change to template hiding rules
- no new persistence behavior

## Requirements

- Add a lightweight placeholder/empty slot when useful:
  - `Больше программ скоро появится`
  - no CTA unless there is a real action
  - visually quieter than real campaign cards
- Do not show placeholder if it creates clutter on mobile.
- Preserve restore behavior:
  - archived personal copy still shows restore instead of new fork
- Keep accessibility labels distinct.

## Done When

- Grid looks complete with 6, 5, 4, or fewer visible campaign cards.
- Placeholder cannot be mistaken for a real program.
- Template-copy hiding remains unchanged.

## QA

- Fresh state with all templates visible.
- State with one active personal copy hiding one template.
- State with archived personal copy showing restore.
- Mobile does not waste the first screen with a decorative placeholder.

## Implementation Notes

- Added an inert ready-program placeholder only when active personal copies hide template slots.
- Restore slots still count as real grid items, so archived personal copies keep the restore behavior.
- CSS hides the decorative placeholder on mobile.
