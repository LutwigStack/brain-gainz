# 41 Sphere Color System

## Status

`planned`

## Goal

Define one canonical color per sphere (sector of the galaxy) and apply it everywhere a sphere is represented: the `Прогресс` (WindRose) radar, the `Сектора` grid cards, the `Карта знаний` canvas, the right `Занятие` panel, and the legend. One sphere = one color across the whole product.

## Why This Epic Exists

The 8 spheres (Программирование, Математика, Навигационный центр, Компьютерные системы, Данные и ИИ, Инженерия ПО и продукт, Общество, этика, право, Проекты) are the primary organising unit of the map. The current code already assigns 8 distinct colors on the WindRose radar (visible in `output/current-04-progress.png`), but those colors are inlined in the WindRose component and not exposed as design tokens. Other surfaces either pick a generic accent or no color at all. This epic makes the sphere palette the single source of truth.

## Product Direction

- 8 tokens: `sphere-code`, `sphere-math`, `sphere-navigation`, `sphere-systems`, `sphere-data`, `sphere-engineering`, `sphere-society`, `sphere-projects`.
- Each token has three stops: `default` (used on idle surfaces), `strong` (used for the current / focused sphere), `soft` (used for backgrounds and the minimap dots).
- The colors are tuned to be visible on a deep-space background (the canvas is being moved to a dark cosmic palette in epic 47), so they are slightly desaturated compared to the current WindRose palette.
- Each color has a matching `text-on-strong` token so that text on a sphere card is always readable.

## Visual Targets

### Token map (initial proposal)

| Sphere | Token | Default hex | Strong hex | Soft hex |
|---|---|---|---|---|
| Программирование | `sphere-code` | `#5AC8FA` | `#7ED8FF` | `#1F3A4A` |
| Математика | `sphere-math` | `#C792EA` | `#D8A6F5` | `#3A2A4A` |
| Навигационный центр | `sphere-navigation` | `#82E0AA` | `#9FE8BC` | `#1F3A2A` |
| Компьютерные системы | `sphere-systems` | `#F5B041` | `#F8C56C` | `#3A2E1A` |
| Данные и ИИ | `sphere-data` | `#4DD0E1` | `#7BE0EC` | `#1A323A` |
| Инженерия ПО и продукт | `sphere-engineering` | `#E57373` | `#F09A9A` | `#3A1F1F` |
| Общество, этика, право | `sphere-society` | `#F06292` | `#F58FB1` | `#3A1F2A` |
| Проекты | `sphere-projects` | `#FFD54F` | `#FFE082` | `#3A321A` |

The exact hex values are reviewed in the workstream; the goal of this table is to show that the palette is balanced (no two spheres share a hue) and to fix the assignment of sphere → token in one place.

## Scope

Includes:

- the new tokens under `src/theme/pixel/tokens.ts` (or a new `src/theme/galaxy/tokens.ts` if a separate `galaxy` theme module is created in epic 47);
- the CSS custom properties emitted by `applyPixelThemeCssVariables` in `src/theme/pixel/`;
- the radar component in `src/components/WindRoseView.tsx`;
- the sphere grid in `NavigationView.tsx` (the cards that open from the `Сектора` tab);
- the right `Занятие` panel in `NavigationView.tsx` (the progress chip per sphere);
- the legend component (added if missing, otherwise updated to read the new tokens).

Excludes:

- recoloring the canvas itself (epic 47);
- the `sphere-projects` text-on-strong contrast (verified in epic 45);
- introducing a 9th color (the project is fixed at 8 spheres for now).

## Success Criteria

- A new file `src/theme/galaxy/sphere-tokens.ts` (or the equivalent extension to the existing `pixel/tokens.ts`) exports the 8 sphere palettes.
- The WindRose radar reads the same colors as the `Сектора` cards, which read the same colors as the canvas nodes (verified visually after epic 47).
- The legend lists all 8 spheres with their token color, in the same order as in the `Сектора` tab.
- The current sphere is highlighted with its `strong` stop on every surface (WindRose, sector card, canvas, panel).
- No surface uses an inlined hex value for a sphere color; all sphere colors come from the token map.

## Workstreams

- `planned` - [workstreams/01-token-definition.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/41-sphere-color-system/workstreams/01-token-definition.md)
- `planned` - [workstreams/02-windrose-and-legend.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/41-sphere-color-system/workstreams/02-windrose-and-legend.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/41-sphere-color-system/workstreams/03-verify.md)

## Suggested Sequence

1. Define the tokens and the sphere → token mapping.
2. Apply the tokens in the WindRose and the legend.
3. Verify visually and via grep that no inlined sphere color remains.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - open `Прогресс` and confirm the radar uses the new palette;
  - open `Обзор карты` → `Сектора` and confirm the card accent stripe uses the new palette (epic 42 finishes the rest of the card);
  - console warnings/errors: `0`.
- Grep:
  - `rg "#[0-9A-Fa-f]{6}" src/components/WindRoseView.tsx` returns 0 hits for sphere colors (infrastructure colors like `#000` and `#FFFFFF` are allowed).
