# 03 Verify

## Status

`planned`

## Goal

Confirm the mini-preview and the progress arc on every card across both campaigns and both viewports.

## Viewports

- desktop `1280x900`
- mobile `390x844`

## Scenarios

- open `Обзор карты` → `Сектора` for `Бакалавриат по информатике`;
- confirm 8 cards, each with a mini-preview and a progress arc;
- complete one node in one sphere, refresh, and confirm the arc updates;
- repeat for `NLH cash`.

## Checks

- the mini-preview pattern is recognisably different per sphere;
- the focused sphere's mini-preview and label use the `strong` token;
- the percentage label matches the data shown in the right `Занятие` panel for the same sphere;
- the card height does not change after this epic (no layout shift);
- the button is still the only clickable target on the card (the mini-preview is not clickable in this epic).

## Snapshot tests

- the mini-preview snapshot is stable across runs;
- the progress arc snapshot for `0/0`, `6/12`, `12/12` matches the expected SVG.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the grid before and after the epic.
- The percentage labels match the data model.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
