# Russian UI QA

## Verdict

Passed. The UI shell reads as Russian-first on the checked desktop and mobile views.

## Screenshots

- `qa/russian-interface-campaign-menu-desktop.png`
- `qa/russian-interface-today-desktop.png`
- `qa/russian-interface-windrose-desktop.png`
- `qa/russian-interface-map-desktop.png`
- `qa/russian-interface-map-mobile.png`

## Browser Checks

- Desktop `1280x900`: Campaign Menu, Today, Wind Rose, and Map/Inspector opened successfully.
- Mobile `390x844`: Map/Inspector opened without horizontal document overflow.
- Console: no warning or error messages at warning level.

## Leftover English

Expected content leftovers:
- `BrainGainz`
- `Computer Science Bachelor`
- `Core CS Foundations`
- course branch/node/action text such as `Programming Environment`, `Set up an editor/run loop...`

Fixed during pass:
- raw mastery requirement `confirmed` is now shown as `подтвердить`.
- raw specialization length `long` is now shown as `длинный`.
- Wind Rose `lvl` is now shown as `ур.`.
- default meter label `Meter` is now shown as `Прогресс`.

## Verification

- `npm run lint`: pass
- `npm run test`: pass, 186/186
- `npm run build`: pass
