# 39 Atlas Top Layout Cleanup

## Status

`planned`

## Goal

Make the atlas the largest object on the desktop workspace by removing the top context cards and replacing them with a compact sphere navigator.

`desktop-atlas-workspace.png` shows that the area above the atlas canvas is occupied by:

- the top program / specialization cards (visible on `10-readability-atlas-desktop.png` from epic 31);
- the `Карта задач` header with description and `Скрыть детали / Обновить` actions;
- a row of three context chips (`Сейчас`, `Дальше`, `Этап`);
- a second row of action buttons (`Обзор / К текущему`);
- the section tabs (`Город / Карта знаний / Папки`);
- the action row (`Маневт / Вся карта / К текущему / Детали / Фокус`).

Together that chrome consumes `~30%` of the vertical space and the atlas is reduced to `~50%`. The `layout-rules.md` from epic 34 already says: "atlas should be the largest object", "HUD should be one compact row", "no permanent full right rail in learner map view". This epic makes that rule true.

## Why This Epic Exists

The learner opens the map to see the map. The top program card is the same data as the app shell header, the right inspector repeats what the route strip shows, and the action row duplicates the bottom of the canvas. None of this earns its vertical space.

## Product Direction

- top context: one compact HUD row carrying only the program/sphere label, the current object label, and the most useful actions;
- sphere selection: a circular nav pad in the top‑right of the canvas (not a horizontal chip row);
- right inspector: only opens on demand (already implemented in epic 34 workstream 04, but the default state is verified here).

## Visual Targets

### Top HUD

- single row, `~56px` tall;
- content (left to right): `Программа` chip, `·`, current sphere label, `·`, current step label, then on the right: `Вся карта`, `К текущему`, `Фокус`;
- no description copy in the default state;
- "details" expands inline below the row only when the learner requests it.

### Sphere nav pad

- a small circular pad in the top‑right of the canvas, `~96px` diameter;
- shows the current sphere highlighted;
- clicking a sphere dispatches the same `MapCameraCommand` used for the existing sphere filter;
- on hover, the sphere name appears as a tooltip;
- on mobile, the nav pad is hidden (replaced by a sphere chip in the bottom HUD).

## Scope

Includes:

- the atlas workspace layout in `NavigationView.tsx:4765+`;
- the top context block in the atlas workspace (program / specialization cards, `Карта задач` header, context chips, action row);
- a new `SphereNavPad` component under `src/components/`;
- integration with `GameMapCanvas` so the nav pad sits over the canvas.

Excludes:

- changes to the app shell header (out of scope);
- changes to the right inspector (handled by epic 34 workstream 04);
- changes to the mobile layout (handled by epic 38 workstream 03).

## Success Criteria

- On `desktop 1280x900`, the atlas canvas is the largest object on the workspace (>= `70%` of the usable area).
- The top HUD fits in one row.
- The sphere nav pad is reachable from the top‑right and shows the current sphere.
- Clicking a sphere in the nav pad filters the atlas to that sphere.
- No regression in the data shown by the right inspector (verified by epic 34 QA).

## Workstreams

- `planned` - [workstreams/01-top-cards-removal.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/39-atlas-top-layout-cleanup/workstreams/01-top-cards-removal.md)
- `planned` - [workstreams/02-sphere-nav-pad.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/39-atlas-top-layout-cleanup/workstreams/02-sphere-nav-pad.md)
- `planned` - [workstreams/03-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/39-atlas-top-layout-cleanup/workstreams/03-browser-qa.md)

## Suggested Sequence

1. Collapse the top context into a single HUD row.
2. Add the sphere nav pad over the canvas.
3. Browser QA across both atlases and viewports.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - wide desktop;
  - mobile `390x844` (no nav pad, sphere nav lives in bottom HUD);
  - `NLH cash` atlas;
  - `Бакалавриат по информатике` atlas;
  - confirm atlas is the largest object on the workspace;
  - confirm top HUD fits in one row;
  - confirm sphere nav pad is reachable and shows the current sphere;
  - click a sphere in the nav pad and confirm filter applies;
  - console warnings/errors: `0`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
