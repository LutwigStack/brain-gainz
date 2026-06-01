# Campaign Menu Visual Parity QA

## Status

`pass`

## Scope

Browser QA for epic 28 after the frame/badge noise pass.

## Coverage

- Desktop `1280x900`: fresh menu, active personal copy, multiple personal copies, archive menu, restore card, all ready programs added, preset fill.
- Wide desktop `1440x960`: fresh menu.
- Mobile `390x844`: final menu state with no horizontal overflow.

## Key Results

- Fresh state: 6 ready program cards, no placeholder.
- One active copy: active save slot visible, 5 ready cards, 1 quiet placeholder.
- Multiple active copies: active save slot visible, `Другие программы` panel present.
- Archive action: hidden behind `...`, not exposed as a primary action.
- Archived copy: ready grid shows 1 `Восстановить` card, not a dead map action.
- All ready programs added: ready grid shows no fake placeholder or disabled card.
- Preset click fills custom program name and enables `Создать`.
- Mobile: `scrollWidth === clientWidth` at `390px`.
- Console warnings/errors: 0.
- Broken campaign-card images: 0.
- Stale visible `курс` / `кампания` wording in Campaign Menu: 0.

## Screenshots

- `qa/06-empty-desktop.png`
- `qa/06-empty-wide.png`
- `qa/06-one-active-desktop.png`
- `qa/06-multiple-active-desktop.png`
- `qa/06-other-programs-expanded.png`
- `qa/06-archive-menu-open.png`
- `qa/06-archived-restore-desktop.png`
- `qa/06-restored-copy-desktop.png`
- `qa/06-all-ready-added-desktop.png`
- `qa/06-preset-filled-desktop.png`
- `qa/06-mobile-final.png`

## Remaining Findings

None.
