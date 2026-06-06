# 38 Atlas Mobile And Touch

## Status

`planned`

## Goal

Make the atlas the primary surface on mobile and touch devices, and make every interactive node reachable with a finger.

`mobile-atlas-workspace.png` shows that the atlas canvas on `390x844` is reduced to an empty dark frame: the canvas exists but no sphere, node, or ring is visible. Three issues compound:

- the mobile layout stacks the top app context, the section tabs (`Город/Карта знаний/Папки`), the action row (`Маневр/Вся карта/К текущему/Детали/Фокус`) above the canvas, leaving almost no vertical space;
- the `GameMapCanvas` container has a fixed min height (`h-[clamp(620px,...)]` in `GameMapCanvas.tsx:250`) that does not adapt to mobile;
- the touch hit area for `atomic_node` (24px) is too small for fingers.

This epic rebalances the mobile layout, makes the canvas a true full‑bleed surface, and expands the touch hit area for atlas nodes.

## Why This Epic Exists

The `layout-rules.md` from epic 34 already calls for "mobile uses bottom sheets, not permanent side rails". The mobile QA report notes that the canvas is visible on the first screen, but the actual visual content is missing because the view is too zoomed‑out and the chrome above steals vertical space. The atlas should still be readable on a phone.

## Product Direction

- on mobile, the section tabs and action row collapse into a bottom navigation strip and a floating action cluster;
- the canvas goes full‑bleed between the top app context and the bottom navigation;
- the canvas auto‑fits to the current step on mobile, so the learner always sees the current step without manual zoom;
- the touch hit area for atlas nodes expands to a minimum of `32px` regardless of `size`.

## Visual Targets

### Mobile layout

- top app context: one compact row (`BrainGainz` + program chip + strategy chip);
- section tabs: bottom navigation (`КАРТА/СЕГОДНЯ/ПРОВЕРКА/...ЕЩЁ`);
- sub‑tabs (`Город/Карта знаний/Папки`): collapsed into a single chip above the canvas;
- action row: floating cluster anchored to the bottom‑right of the canvas (only the most useful 2‑3 actions: `Вся карта`, `К текущему`, `Фокус`);
- node details: bottom sheet (handled by epic 34 workstream 04, but verified here).

### Touch hit area

- `atomic_node`: `size 24` -> hit area `radius 16` (effective 32px diameter);
- `topic_node`: `size 38` -> hit area `radius 22`;
- `course_hub`: `size 52` -> hit area `radius 30`;
- `domain_hub`: `size 64` -> hit area `radius 36`;
- `root`: `size 76` -> hit area `radius 42`.

### Mobile fit

- on first mount on mobile, the canvas auto‑fits to the current step + the next 1‑2 steps in the route, not the full atlas;
- the auto‑fit margin is `~120px`;
- the learner can still pinch‑zoom out to see the full atlas.

## Scope

Includes:

- mobile layout for the atlas workspace in `NavigationView.tsx` and related components;
- floating action cluster for mobile;
- `GameMapCanvas` min height / fit logic for mobile;
- touch hit area expansion in `map-layer.ts:drawAtlasNode` and `BrainGainzScene.findNodeHitAtScreenPoint`;
- auto‑fit to current step on mobile in `BrainGainzScene.render`.

Excludes:

- bottom sheet for node details (handled by epic 34 workstream 04);
- general mobile redesign of the rest of the app (out of scope).

## Success Criteria

- On `mobile 390x844`, the atlas canvas shows at least one full sphere sector and the current step node without manual zoom.
- The mobile section tabs are reachable in one tap from the bottom.
- The action cluster does not cover more than `~25%` of the canvas height.
- Touch hit areas meet the minimums above; verified by tap‑testing in browser QA.
- No horizontal overflow on `mobile 390x844` or `mobile 414x896`.

## Workstreams

- `planned` - [workstreams/01-touch-hit-areas.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/38-atlas-mobile-and-touch/workstreams/01-touch-hit-areas.md)
- `planned` - [workstreams/02-atlas-mode-grid-disable.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/38-atlas-mobile-and-touch/workstreams/02-atlas-mode-grid-disable.md)
- `planned` - [workstreams/03-mobile-bottom-nav-and-fit.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/38-atlas-mobile-and-touch/workstreams/03-mobile-bottom-nav-and-fit.md)
- `planned` - [workstreams/04-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/38-atlas-mobile-and-touch/workstreams/04-browser-qa.md)

## Suggested Sequence

1. Expand touch hit areas in `map-layer.ts`.
2. Disable or align the default grid in atlas mode (or move to epic 35 workstream 06 — coordinate, do not duplicate).
3. Rebuild the mobile atlas layout: bottom nav, floating actions, full‑bleed canvas, auto‑fit to current step.
4. Browser QA across mobile viewports and both atlases.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - mobile `390x844`;
  - mobile `414x896`;
  - tablet `768x1024`;
  - `NLH cash` atlas (mobile);
  - `Бакалавриат по информатике` atlas (mobile);
  - tap each node type (`atomic_node`, `topic_node`, `course_hub`, `domain_hub`, `root`) and confirm selection;
  - pinch‑zoom out to confirm full atlas is reachable;
  - confirm bottom nav is reachable in one tap;
  - confirm no horizontal overflow;
  - console warnings/errors: `0`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
