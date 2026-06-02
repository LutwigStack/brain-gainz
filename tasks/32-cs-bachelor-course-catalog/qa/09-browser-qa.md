# Browser QA: CS Bachelor Course Catalog

## Status

`pass`

## Scope

- Fresh browser origin: `http://127.0.0.1:5178/`.
- Campaign menu.
- Start/open `Бакалавриат по информатике`.
- Today first course focus.
- Program map city layer.
- Knowledge atlas header/canvas.
- Mobile `390x844`.
- Console warnings/errors.

## Results

- Campaign menu shows the CS bachelor template with `54 узл.`.
- Starting the program creates a personal campaign and opens Today.
- Today first focus is course-level: `Введение в программирование`.
- Route count is `0/54 обязательных`.
- Program map city layer shows `54 учебных объектов`.
- Knowledge atlas header shows `Бакалавриат по информатике` and `54 узл.`.
- Old low-level starter nodes such as `pf-*`, `ds-*`, `db-*` are not visible on the main learner surface.
- Fresh-origin console warnings/errors: `0`.

## Screenshots

- `qa/09-catalog-atlas-desktop.png`
- `qa/09-catalog-mobile-map.png`
- `qa/09-catalog-mobile-atlas-ready.png`

## Notes

- The stale `86`-node assertions in `tests/campaigns-stats-xp.test.js` were updated to the 54-course catalog model.
- Old localStorage on the previous `5176` origin can still contain an older personal copy with 86 nodes; fresh campaigns and fresh origins seed the new 54-course catalog.
