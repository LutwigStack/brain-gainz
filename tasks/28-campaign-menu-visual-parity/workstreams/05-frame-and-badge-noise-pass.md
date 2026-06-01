# 05 Frame And Badge Noise Pass

## Status

`completed`

## Goal

Reduce visual noise so different meanings do not use the same visual weight.

The screen should keep the pixel/RPG style, but stop treating every small label as equally important.

## Problem

Current screen has many similar framed elements:

- section frames
- card borders
- stat pills
- type labels
- action buttons
- progress strips
- details rows

This makes the page feel busy even when the information architecture is correct.

## Scope

- Campaign Menu CSS only unless component markup must change to remove duplicate wrappers
- no global design system rewrite
- no changes to Today/Map/Wind Rose

## Requirements

- Keep strong gold treatment for primary/active elements.
- Use calmer blue/gray treatment for secondary elements.
- Reduce or remove borders around low-value badges.
- Avoid nested card-in-card feeling.
- Make progress, active state, and destructive/secondary actions visually distinct.
- Keep text contrast accessible.

## Done When

- User eye lands on:
  1. active campaign hero
  2. ready campaign cards
  3. custom campaign workshop
- Small badges support scanning but do not dominate.
- The page no longer reads as a wall of bordered text.

## QA

- Compare against the mockup screenshot and current product screenshot.
- Check desktop and mobile screenshots side by side.
- No text overlaps, clipped buttons, or unreadable low-contrast labels.

## Implementation Notes

- Removed the generic board headline so the screen starts with the three working sections.
- Kept gold emphasis on the active save slot and primary CTAs.
- Softened secondary numbers, type labels, map buttons, empty slots, presets, archive panels, and low-value metric badges.
- Reduced nested-card feeling by replacing several small bordered badges with lighter text treatments.
