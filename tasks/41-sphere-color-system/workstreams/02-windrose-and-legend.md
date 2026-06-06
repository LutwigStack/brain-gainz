# 02 Windrose And Legend

## Status

`planned`

## Goal

Apply the new sphere tokens in `Прогресс` (WindRose) and add or refresh a legend that lists the 8 spheres with their token color. No canvas changes here; canvas is epic 47.

## Why This Matters

The WindRose radar is the surface that already uses 8 inlined colors. Converting it to tokens proves the new palette and gives the user a single place to read the mapping. The legend is the user-facing surface that teaches the palette; without it, the colors on the canvas (epic 47) would be opaque.

## Scope

- `src/components/WindRoseView.tsx` - replace every inlined hex color with a CSS variable or a token reference;
- the legend block inside `WindRoseView.tsx` (or a new `GalaxyLegend.tsx` if no legend exists);
- the list item component for each sphere row in the legend.

## Requirements

### Windrose

- each sphere on the radar is filled with `--sphere-{slug}-default`;
- the focused sphere is filled with `--sphere-{slug}-strong` and has a 1px outline in `--sphere-{slug}-strong`;
- the radar outline and the axis lines stay in the existing infrastructure tokens (no change);
- the order of spheres on the radar matches the order in the catalog (clockwise from the top: Программирование, Математика, Навигационный центр, Компьютерные системы, Данные и ИИ, Инженерия ПО и продукт, Общество этика право, Проекты);
- no `style={{ fill: '#xxxxxx' }}` inlined in the radar JSX.

### Legend

- the legend lists all 8 spheres in the same clockwise order as the radar;
- each row has a 12px square swatch on the left and the sphere name on the right;
- the swatch is filled with `--sphere-{slug}-default`;
- the focused row uses `--sphere-{slug}-strong` for the text color and a left border in the same color;
- on hover over a row, a soft halo appears using `--sphere-{slug}-soft`;
- on click, the row dispatches the same `MapCameraCommand` used by the existing sphere filter (so that the legend and the radar are linked).

## Out Of Scope

- Adding tooltips with the sphere description (out of scope; the right `Занятие` panel already shows the description when a sphere is selected);
- Animating the radar fill on hover (visual polish, deferred);
- Recoloring the canvas nodes (epic 47).

## Implementation Hints

- The radar uses an inline color today; a quick `rg "#[0-9A-Fa-f]{6}" src/components/WindRoseView.tsx` should return 0 hits for sphere colors after this workstream.
- If the legend does not exist, place it under the radar in the `Прогресс` view; do not promote it to the top.
- Use `clsx` (already in the project) to toggle the focused class without duplicating the row component.

## Done When

- The radar uses tokens, not inlined hex.
- The legend lists all 8 spheres, in the same order, with the correct swatch.
- Clicking a legend row filters the radar to that sphere (or scrolls the canvas to it, depending on the current surface).
- No regression in the existing `Прогресс` interactions: hover, focus, keyboard navigation all still work.
- `npm run lint`, `npm run test`, `npm run build` pass.
