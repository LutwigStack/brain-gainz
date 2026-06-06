# 01 Hero Replace With Step Indicator

## Status

`planned`

## Goal

Remove the floating `HeroLayer` from the atlas and replace it with a compact step indicator in the bottom‑left of the canvas.

## Why This Matters

`hero-layer.ts` draws a 12‑pixel circle head and a `20x24` rounded body above the focused node, with a `Math.sin` bob and a glow. On a `1280x900` atlas the character is barely visible, but it covers the very node it is meant to mark. The current step emphasis now lives in the pulse rings and checkpoint marker (epic 36), so the hero is redundant.

## Scope

- `HeroLayer` class in `src/game/layers/hero-layer.ts` — keep the file but stop using it from `BrainGainzScene`;
- `BrainGainzScene` constructor and `render` calls that reference `this.heroLayer` in `src/game/brain-gainz-scene.ts:101, 161, 347, 371-374`;
- a new `StepIndicator` component under `src/components/` (e.g. `AtlasStepIndicator.tsx`);
- integration with `GameMapCanvas` to position the indicator over the canvas.

## Requirements

### Hero removal

- stop adding `heroLayer` to the `root` container;
- stop calling `this.heroLayer.render(model)` and `this.heroLayer.tick(...)`;
- keep the `HeroLayer` class file in place (do not delete) so the import path remains valid for any other code that might still reference it; alternatively, if the project is confident nothing else uses it, delete the file in a separate commit.

### Step indicator

- a fixed bottom‑left overlay inside `GameMapCanvas`, above the canvas but below the route strip;
- content: `Шаг N/M · <title>` where `N` is `routeSequenceIndex` and `M` is the total route length;
- if there is no current route, show `Атлас` only;
- on hover, expand to show the full title and the `nextActionTitle`;
- on click, no action (the route strip already handles navigation);
- use existing `PixelSurface` and `PixelText` components;
- color follows the existing `accent` palette.

## Out Of Scope

- Removing the `heroLayer` import from `GameMapCanvas.tsx` if it is not there (it should not be).
- Re‑using the `HeroLayer` for the city presentation (out of scope here).

## Implementation Hints

- In `brain-gainz-scene.ts`, comment out the `this.heroLayer.render(model)` and `this.heroLayer.tick(...)` calls rather than deleting them, so a future revert is easy.
- For the step indicator, derive `N/M` from the `routeNodeMetadata` prop already passed to `GameMapCanvas` (see `GameMapCanvas.tsx:40`).
- The indicator should be `pointer-events: auto` for hover, but should not capture clicks away from the canvas.

## Done When

- The atlas canvas no longer shows the floating character.
- The step indicator is visible in the bottom‑left, updates when the current step changes, and expands on hover.
- No console errors from removed `heroLayer` references.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
