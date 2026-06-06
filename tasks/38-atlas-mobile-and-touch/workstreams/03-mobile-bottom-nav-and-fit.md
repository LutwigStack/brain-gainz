# 03 Mobile Bottom Nav And Fit

## Status

`planned`

## Goal

Rebuild the mobile atlas layout: bottom nav, floating actions, full‑bleed canvas, auto‑fit to current step.

## Why This Matters

`mobile-atlas-workspace.png` (from epic 34 QA) shows that on `390x844`:

- the top app context takes `~80px`;
- the section tabs (`КАРТА/СЕГОДНЯ/ПРОВЕРКА/...ЕЩЁ`) take `~52px`;
- the sub‑tabs (`Город/Карта знаний/Папки`) take `~52px`;
- the action row (`Маневр/Вся карта/К текущему/Детали/Фокус`) takes `~52px`;
- a divider takes `~20px`;
- leaving only `~140px` of vertical canvas.

`GameMapCanvas` has `className` defaulting to `h-[clamp(620px,calc(100dvh-180px),1080px)]` (`GameMapCanvas.tsx:250`), which on a `844dvh` mobile view collapses to `~664px`. The `min-height` of `620px` competes with the top chrome for the same pixels.

## Scope

- the mobile atlas layout in `NavigationView.tsx:4765+`;
- the `GameMapCanvas` `className` default in `GameMapCanvas.tsx:250`;
- `BrainGainzScene.render` initial fit logic in `brain-gainz-scene.ts:130-141`;
- a new `MobileAtlasActions` component (floating action cluster).

## Requirements

### Mobile layout

- on viewports `< 768px`:
  - top app context stays at the top, but in one compact row (`BrainGainz` + program chip + strategy chip collapsed into one chip);
  - the section tabs (`Город/Карта знаний/Папки`) collapse into a single chip above the canvas;
  - the section tabs (`КАРТА/СЕГОДНЯ/ПРОВЕРКА/...ЕЩЁ`) move to a fixed bottom navigation strip;
  - the action row is replaced by a floating action cluster anchored to the bottom‑right of the canvas, containing only `Вся карта`, `К текущему`, `Фокус`;
  - the canvas is `full‑bleed` between the top app context and the bottom navigation.

### Canvas sizing

- on mobile, the `GameMapCanvas` min height drops from `620px` to `360px` and grows with the viewport;
- the canvas should never be smaller than `~360px` tall to remain usable.

### Auto‑fit to current step

- on first mobile mount, the canvas fits to the current step + the next 1‑2 steps in the route, with `~120px` margin;
- the fit must be re‑applied on `routeNodeMetadata` change;
- the learner can still pinch‑zoom out to see the full atlas.

## Out Of Scope

- Tablet layout (`>= 768px`); keep the current desktop behavior.
- Bottom sheet for node details (epic 34 workstream 04).
- Pinch‑zoom gesture implementation (rely on the existing wheel handler and `pointerdown` + `pointermove`).

## Implementation Hints

- Use the existing `mode-boundary.ts` and `today-priority-layout.ts` to detect mobile viewport and apply a different className.
- The floating action cluster can be a small `PixelSurface` with absolute positioning inside the canvas container.
- For the auto‑fit, extend the `fitCameraToBounds` call in `brain-gainz-scene.ts:130-141` to accept a `focusRoute` option that uses the route's `currentTargetNodeId` and its next 1‑2 nodes as the bounds.

## Done When

- On `mobile 390x844`, the atlas canvas shows at least one full sphere sector and the current step node.
- The bottom nav is reachable in one tap from the bottom of the screen.
- The floating action cluster does not cover more than `~25%` of the canvas height.
- No horizontal overflow on `390x844` or `414x896`.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
