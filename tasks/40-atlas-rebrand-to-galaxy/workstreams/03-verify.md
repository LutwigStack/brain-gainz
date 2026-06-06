# 03 Verify

## Status

`planned`

## Goal

Confirm the rebrand in production-like conditions and produce a QA artifact that lists any residual hits and the fix for each.

## Viewports

- desktop `1280x900`
- wide desktop `1680x1050`
- mobile `390x844`

## Scenarios

- open `Программы`, start `Бакалавриат по информатике`, open `Обзор карты`;
- confirm the tab strip reads `Сектора / Карта знаний / Папки`;
- click `Сектора` and confirm the sphere grid still renders and the open button still reads `Открыть карту знаний`;
- open `Карта знаний` and confirm the canvas still renders;
- open `Папки` and confirm the folder grid still renders;
- repeat for `NLH cash`.

## Checks

- the workspace header reads `Карта знаний`, not `Карта задач` and not `Атлас знаний`;
- the tab strip is in the new order and does not wrap on the tested viewports;
- no `console.warn` or `console.error` from missing i18n keys;
- no `console.warn` or `console.error` from any of the touched components.

## Grep

- `rg "Атлас знаний" src/` → expected 0 user-facing hits, 1 allowed comment;
- `rg "Карта задач" src/` → expected 0 hits;
- `rg '"Город"' src/components/` → expected 0 hits;
- `rg '"Сектора"' src/components/` → expected ≥ 1 hit (the new tab label).

## Done When

- QA artifact exists under `qa/` with screenshots from both campaigns and all three viewports.
- Findings are severity-ranked with a fix recommendation for each.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
