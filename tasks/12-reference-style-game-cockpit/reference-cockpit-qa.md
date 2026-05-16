# Reference Cockpit QA

Date: 2026-05-16

## Verified Build

- Verified commit: `097335c008dda1db63087a3f1fcba736ce5f5d68`
- Dev server: reused existing Vite server, `http://127.0.0.1:5173`
- Viewports:
  - Desktop: `1280x900`
  - Mobile: `390x844`
- Reference image: `C:/Users/Andr3y/Downloads/ChatGPT Image 5 мая 2026 г., 13_40_35 (1).png`

## Command Results

- `npm run test`: pass, `166` tests passed, `0` failed. Node emitted expected experimental SQLite warnings during test execution.
- `npm run lint`: pass.
- `npm run build`: pass, Vite production build completed.

## Browser Console

- Console warnings: `0`
- Console errors: `0`
- Info messages: React DevTools development hint only.
- Logs:
  - `output/playwright/reference-cockpit-qa/reference-cockpit-qa-console-warning-plus.log`
  - `output/playwright/reference-cockpit-qa/reference-cockpit-qa-console-errors.log`
  - `output/playwright/reference-cockpit-qa/reference-cockpit-qa-console-all-info-plus.log`

## Screenshots

- Campaign Menu desktop: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-campaign-menu-desktop-1280x900.png`
- Today desktop viewport: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-today-desktop-viewport-1280x900.png`
- Today desktop full page: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-today-desktop-1280x900.png`
- Map desktop viewport: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-map-desktop-viewport-1280x900.png`
- Inspector / Assessment desktop viewport: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-inspector-assessment-desktop-viewport-1280x900.png`
- Wind Rose desktop viewport: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-wind-rose-desktop-viewport-1280x900.png`
- Today mobile viewport: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-today-mobile-viewport-390x844.png`
- Today mobile full page: `output/playwright/reference-cockpit-qa/reference-cockpit-qa-today-mobile-full-390x844.png`

## Findings

### Critical

- None.

### High

- None.

### Medium

- None.

### Low

- Mobile top context cards are readable but compressed at `390x844`; campaign, specialization, and persona labels truncate in the first viewport. The hierarchy still works, but the reference has clearer persistent context.
- Race, city, and opponent cards are structurally present and visual, but still use stable placeholder-style art rather than the richer portrait/banner/city artwork shown in the reference.

## Acceptance Checks

- Left nav and active state: pass. Active state is clear on Campaign Menu, Today, Map, Inspector/Assessment, and Wind Rose.
- Top context campaign/specialization/race/mode: pass. Desktop shows campaign `BrainGainz`, specialization `Свободный режим`, race/persona `Архитектор`, and mode `Free mode`.
- Today main goal: pass. Primary goal card is the largest daily object.
- Today task cards: pass. Cards show current, future, and locked task states.
- Today mastery row: pass. Mastery levels render as a visual ladder/row on desktop and stacked cards on mobile.
- Today weak spots: pass. Weak spot panel is visible and warning-colored.
- Today mini map: pass. Mini map is a preview surface and does not expose destructive editor tools.
- Today right rail: pass. Race, city/civilization, opponent, and route status cards are present.
- Full Map editor separately available: pass. Map screen exposes editor tools intentionally, including create/connect/archive/delete actions.
- Race/city/opponent visual cards: pass with low visual-art delta noted above.
- Campaign Menu: pass. Campaign menu loads, system template can be opened.
- Wind Rose: pass. Stats/radar view and branch panel remain reachable and coherent.
- Inspector/Assessment: pass. Map inspector opens and the Assessment/Проверка tab renders without console errors.
- Mobile readability: pass with low compression finding noted above.

## Reference Comparison Notes

- The current Today screen follows the reference information architecture: left navigation, top campaign context, primary goal, daily tasks, mastery row, weak spots, mini map, and right race/city/opponent rail are all visible in one product surface on desktop.
- The current version is darker and more wireframe/pixel-panel oriented than the reference. It reads as a game cockpit, but the reference has richer asset weight, larger character/city art, and stronger campaign/opponent identity.
- The mini map correctly differs from the full Map editor: Today shows only a preview plus navigation to the map, while destructive/editing tools remain on the dedicated Map screen.
- Current data is in free mode with a sparse route, so the mini map shows `Маршрут еще не собран` instead of the populated giant knowledge map shown in the reference. This is a data-state delta, not a broken layout.
- Mobile preserves the Today hierarchy through vertical stacking. The first viewport prioritizes context and the main goal; lower sections are reachable by scroll.
