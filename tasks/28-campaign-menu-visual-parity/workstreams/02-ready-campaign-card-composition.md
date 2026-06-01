# 02 Ready Campaign Card Composition

## Status

`done`

## Goal

Make ready campaign cards read visually as separate large campaigns.

The user should distinguish `Бакалавриат по материаловедению`, `NLH cash`, `Биология`, and other templates by card mood and title without parsing long text.

## Problem

The current cards have generated backgrounds, but they still feel text-first:

- images are too dark and hidden
- title/description dominate the card
- CTA and secondary `Карта` compete visually
- all metric badges have similar weight
- the card border is as loud as the content

## Scope

- `CampaignCourseCard` composition
- campaign-card background usage
- card CSS and responsive behavior
- no new data model work
- no baked text inside images

## Requirements

- Make the visual asset more legible:
  - keep the dark area for text
  - allow the campaign emblem/scene to remain visible
  - avoid over-darkening the whole image
- Use a consistent card structure:
  - short type label
  - title
  - one-line description or no description when space is tight
  - 1-2 metrics
  - primary CTA pinned to bottom
- Make `Начать программу` the only strong action.
- Make `Карта` secondary and smaller, or move it into a secondary affordance if it keeps competing.
- Cards should stay stable with long Russian titles.
- Cards should not jump when labels wrap.

## Done When

- Cards feel like campaign covers, not text panels.
- The user can scan available campaigns quickly.
- `NLH cash` remains educational in copy and visual tone, not casino-like.
- HTML renders all text; generated images remain text-free.

## QA

- Desktop: 3-4 cards per row depending width, no clipped CTA text.
- Mobile: one card per row, title and CTA remain readable.
- Check all six template campaigns.

## Implementation Notes

- Ready campaign cards now use the accepted campaign-card art as a visible cover layer instead of a mostly hidden texture.
- `Карта` moved into a compact top-right secondary affordance so it no longer competes with the primary action.
- `Начать программу`/`Восстановить` is the only strong action and stays pinned to the card bottom.
- Title, short description, and metrics use stable heights so long Russian titles do not resize the card.
- QA screenshots:
  - `tasks/28-campaign-menu-visual-parity/qa/02-ready-cards-desktop.png`
  - `tasks/28-campaign-menu-visual-parity/qa/02-ready-cards-mobile.png`

## Verification

- `node --test tests/campaign-menu-model.test.js tests/mode-boundary.test.js` passed, 11 tests.
- `npm run lint` passed.
- `npm run build` passed.
- Browser smoke passed on desktop and 390px mobile: no horizontal overflow, mobile card width stable, primary CTA full-width, secondary map action compact.
