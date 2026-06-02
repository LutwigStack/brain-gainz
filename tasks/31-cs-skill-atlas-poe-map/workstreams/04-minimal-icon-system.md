# 04 Minimal Icon System

## Status

`done`

## Goal

Create a minimal icon language for the skill atlas nodes.

## Scope

- reusable node icons
- domain icons
- course hub icons
- boss/check icons
- fallback icon rules

## Requirements

- Icons must be simple enough to read at small sizes.
- Icons must not include text.
- Prefer existing icon libraries or lightweight generated SVG/CSS icons first.
- Generate bitmap assets only if icons materially improve readability.
- Keep icons visually consistent with existing dark RPG interface.
- Every node must have an accessible name through tooltip/ARIA, not through visible text.

## Suggested First Icon Families

- programming/code
- data/structures
- algorithms/path
- math/proof
- systems/hardware
- database/storage
- AI/model
- project/build
- review/decay
- boss/checkpoint

## Done When

- Prototype nodes are icon-first and readable.
- Missing icon fallback does not break the map.
- No node needs visible title text to be understandable after hover/focus.

