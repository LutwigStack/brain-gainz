# Workstream 07: Race City And Opponent Progression

## Goal

Make verified learning visibly grow the user's race, city, and strategic position.

## Scope

Includes:
- race profile display
- city progression surface
- specialization-linked district growth
- simple AI opponent progress
- victory / pressure indicators

Excludes:
- direct combat
- deep race balance
- city building management
- multiplayer

## Race Rules V1

Race is visual identity only in v1:
- portrait
- emblem
- color accents
- city visual theme

Examples:
- crow
- octopus
- human
- elephant
- dolphin
- parrot
- ant colony

Avoid heavy balance. V1 race differences should not dominate learning progress.

Do not implement race bonuses in v1.

## City Direction

City is a read-only visual reward projection:
- stats and specializations unlock or upgrade districts
- mastery increases district strength
- retention keeps districts lit / stable
- weakening can show dimmed districts or warning markers

Do not implement city-builder resources or city management actions in v1.

## Opponent Direction

AI opponent creates deterministic pressure:
- progress bar against current specialization
- score / knowledge points
- city level
- short event updates

V1 should be deterministic and simple enough to test. Do not implement combat simulation.

Continuation rule:
- opponent progress is scoped to the current specialization
- starting a new specialization resets opponent progress for that specialization
- completed specialization opponent history can remain as cosmetic campaign history
- campaign-level opponent history must not change scoring or pressure in the new specialization

## Done When

- Campaign screen can show race identity.
- City progress responds to verified learning.
- Opponent pressure is visible without a complex battle system.
- Opponent progress resets per new specialization.
- No race bonuses, city-builder resources, or combat simulation are required in v1.
- Race and city presentation uses visual assets, not text-heavy stats panels.
