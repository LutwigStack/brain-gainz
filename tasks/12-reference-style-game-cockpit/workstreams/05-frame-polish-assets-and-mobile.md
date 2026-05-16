# 05 Frame Polish Assets And Mobile

## Status

`planned`

## Goal

Polish the cockpit after the structure works: reduce frame noise, add coherent visual assets/placeholders, and adapt the layout for mobile.

## Scope

- reduce identical heavy frames across unrelated surfaces
- define visual weights for primary, secondary, warning, selected, disabled, and destructive panels
- add or wire placeholder assets for campaign, specialization, race, city, opponent, and task families
- improve icon consistency
- tune spacing and typography for `1280x900`
- adapt shell, Today dashboard, right rail, and mini map for `390x844`
- keep text from overflowing buttons/cards

## UX Direction

The reference works because not every box has equal weight.

Use:
- heavy glow/frame for active or primary
- lighter surfaces for secondary content
- warning color for weak spots
- destructive color only for destructive actions
- image/asset areas where identity matters

## Done When

- primary daily goal is visually stronger than secondary panels
- right rail cards feel like game cards, not forms
- weak spots read as warning/recovery, not app errors
- destructive actions remain visually separate
- mobile keeps navigation usable and content readable
- no obvious text overlap or clipped buttons at target viewports

## High-Risk Scenarios

- one-note color palette
- too many glowing borders
- mobile nav consuming too much vertical space
- placeholder art confusing users about real data
- contrast/readability regressions

## Suggested Tests

- screenshot QA desktop and mobile
- manual scan for repeated badge/frame overload
- accessibility check for button names after visual changes
