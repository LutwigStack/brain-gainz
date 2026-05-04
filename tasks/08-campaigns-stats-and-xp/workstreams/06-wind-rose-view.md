# 06 Wind Rose View

## Status

`planned`

## Goal

Create a visual stat overview for the selected campaign.

## Scope

- radial wind rose for campaign stats
- ray length represents level / XP progress
- color and icon identify each stat
- weak and strong stats are visually clear
- stat click opens a compact detail panel

## UX Direction

- visual first
- no large text explanation
- labels are short
- details appear only after selecting a stat
- the rose must support navigation, not only show a chart

## Detail Panel V1

- stat name
- level
- progress to next level
- related branches
- next useful branch / step when available
- action to open branch map

## Empty State V1

- Normal new campaigns should not start statless.
- If a campaign has no stats because of setup or migration edge cases, the wind rose shows one compact visual setup affordance.
- Do not render a blank broken chart.
- Do not explain the whole system with paragraphs.

## Done When

- wind rose shows every campaign stat
- stat progress is readable at a glance
- clicking a stat opens related branches
- the view does not become a table or text-heavy dashboard
- empty/statless state is visually clear and offers setup without heavy text
