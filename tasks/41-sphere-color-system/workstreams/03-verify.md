# 03 Verify

## Status

`planned`

## Goal

Confirm that the WindRose and the legend use the new token palette and that no sphere color is inlined in the source.

## Viewports

- desktop `1280x900`
- wide desktop `1680x1050`

## Scenarios

- open `Прогресс` for `Бакалавриат по информатике`;
- confirm the radar shows 8 colored vertices, each in a distinct hue;
- confirm the legend lists all 8 spheres with a swatch;
- click a legend row and confirm the radar highlights it;
- open `Прогресс` for `NLH cash` and repeat.

## Checks

- the swatch color matches the radar vertex color for the same sphere;
- the focused row is visually distinct (left border + text color);
- no `console.warn` from missing tokens;
- the order on the radar matches the order in the legend.

## Grep

- `rg "#[0-9A-Fa-f]{6}" src/components/WindRoseView.tsx` → 0 hits for sphere colors;
- `rg "sphere-" src/` → ≥ 1 hit in the new token file and in the radar JSX;
- the `windrose` snapshot test (if any) is updated to the new palette and passes.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the radar and the legend.
- The legend passes contrast checks for `textOnStrong` on each row (epic 45 will sweep the rest of the app).
- `npm run lint`, `npm run test`, and `npm run build` all pass.
