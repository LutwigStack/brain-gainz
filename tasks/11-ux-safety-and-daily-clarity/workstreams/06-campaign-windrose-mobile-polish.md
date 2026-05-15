# 06 Campaign Wind Rose Mobile Polish

## Status

`planned`

## Goal

Clean up remaining visual hierarchy issues after the safety and daily-work fixes.

## Scope

- improve Campaign Menu hierarchy between personal campaigns and system/developer campaign
- reduce repeated badges, frames, and meters where they do not help selection
- make campaign creation compact and secondary
- remove duplicate Wind Rose branch CTAs with identical accessible labels
- make selected Wind Rose branch state more visual and less table-like
- localize or clarify branch states such as `next` and `active`
- improve mobile header/nav density and map working area

## UX Direction

This is a polish pass, not a redesign.

Prioritize:
- clearer hierarchy
- fewer equal-weight frames
- one primary CTA per selected object
- compact mobile navigation
- working area above decorative/status panels

## Done When

- Campaign Menu reads first as personal campaign selection
- system/developer campaign is visually secondary and clearly distinct
- campaign creation does not dominate the first screen
- Wind Rose has one unambiguous selected-branch action
- branch cards show progress/next/blocked state without looking like a dry table
- mobile `390x844` keeps navigation readable and map canvas visible sooner

## High-Risk Scenarios

- only system campaign exists
- multiple personal campaigns exist
- archived campaign is present
- Wind Rose selected branch has both card action and bottom CTA
- mobile has long campaign name in header

## Suggested Tests

- browser QA for Campaign Menu desktop/mobile
- accessibility locator check for duplicate branch CTA labels
- browser QA for Wind Rose stat -> branch -> map
- mobile screenshot QA for Campaign, Today, Map, and Wind Rose
