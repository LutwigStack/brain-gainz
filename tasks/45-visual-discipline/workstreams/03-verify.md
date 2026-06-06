# 03 Verify

## Status

`planned`

## Goal

Confirm both rules (caps discipline and contrast discipline) on the live app and in the static analysis.

## Viewports

- desktop `1280x900`
- mobile `390x844`

## Scenarios

- walk through `Сегодня`, `Обзор карты`, `Изучать`, `Прогресс` for `Бакалавриат по информатике`;
- walk through the same for `NLH cash`;
- at every step, scan for any string that is yelling;
- at every step, look at the secondary text and confirm it is readable at 100% zoom.

## Checks

- no body copy is in ALL CAPS;
- the section headings that should be in caps are still in caps;
- `text-muted` is readable on `--surface-base` at 100% zoom;
- the dev tools report a contrast ratio ≥ 4.5 for the secondary text;
- no `console.warn` or `console.error` from any of the touched components.

## Grep

- `rg "text-subtle" src/components/` → 0 body-copy hits;
- `rg '"[А-ЯЁ]{2,}[А-ЯЁ ]*"' src/components/` → 0 hits except in documented exceptions;
- `rg '"[A-Z]{2,}[A-Z ]*"' src/components/` → 0 hits except in documented exceptions.

## Contrast

- axe or Lighthouse audit of the home page returns 0 AA violations related to text contrast.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the affected surfaces before and after the epic.
- The contrast test (added in workstream 02) passes.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
