# 04 Custom Campaign Workshop

## Status

`completed`

## Goal

Make `Создать свою программу` feel like a compact workshop, not a generic form.

This section is important, but it should stay secondary to continuing and starting ready campaigns.

## Problem

Current state works functionally, but visually it is still form-like:

- the intro copy is longer than needed
- presets and input feel disconnected
- `Создать` and `Настроить` do not form a clear small workflow
- the block has similar visual weight to more important sections

## Scope

- `CampaignCreateWorkshop`
- CSS for presets/input/actions
- no changes to campaign creation API

## Requirements

- Shorten the section:
  - icon
  - input
  - quick presets
  - `Создать`
  - secondary `Настроить`
- Presets should feel like quick setup choices, not random chips.
- `Создать` is primary only when input is valid.
- `Настроить` remains secondary and should not pull more attention than `Создать`.
- Avoid adding explanatory paragraphs.

## Done When

- The user understands they can create a custom program quickly.
- The section is compact enough to sit below ready campaigns.
- It does not compete visually with the active campaign hero.

## QA

- Empty input disabled state is understandable.
- Preset click fills the input.
- Enter key still creates campaign.
- Mobile layout keeps controls readable without horizontal overflow.

## Implementation Notes

- Removed the explanatory paragraph from the custom program workshop.
- Grouped icon, input, quick presets, and actions into one compact workflow.
- Kept `Создать` as the only primary action once the name is valid; `Настроить` stays secondary.
