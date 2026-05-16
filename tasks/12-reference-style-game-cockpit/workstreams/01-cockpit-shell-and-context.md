# 01 Cockpit Shell And Context

## Status

`planned`

## Goal

Introduce the reference-style application shell: persistent left navigation, top campaign context, and a reserved right rail for Today meta panels.

## Scope

- add desktop left navigation for Today, Map, Campaigns, checks/assessment, Wind Rose/stats, and settings where available
- move campaign name out of tiny nav text into a top context area
- show current specialization, race/persona, and mode in the top context bar
- preserve existing routes/tabs and keyboard/accessibility behavior
- make the current screen visually obvious
- keep old functionality reachable while changing layout
- define responsive behavior for mobile before full mobile polish

## UX Direction

The shell should make BrainGainz feel like one cockpit, not separate pages.

The top area should answer:
- current campaign
- active specialization or free mode
- race/persona
- career mode vs free mode

The left nav should answer:
- where can I go?
- where am I now?

## Done When

- desktop has persistent left nav
- top context bar shows campaign, specialization, race/persona, and mode
- Campaign Menu, Today, Map, and Wind Rose remain reachable
- active screen state is visible
- shell does not consume excessive content width at `1280x900`
- mobile has a defined compact fallback even if later polish improves it

## High-Risk Scenarios

- no campaign selected
- only system template exists
- personal campaign selected
- active specialization missing
- free mode campaign
- mobile viewport

## Suggested Tests

- component tests for shell navigation state where practical
- browser QA for campaign selection -> Today -> Map -> Wind Rose
- screenshot QA at `1280x900` and `390x844`
