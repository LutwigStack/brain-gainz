# 37 Atlas Hero And Minimap

## Status

`planned`

## Goal

Resolve the two decoration artifacts that compete with the atlas itself: the floating hero and the corner minimap.

`HeroLayer` in `hero-layer.ts` draws a small character (`circle(0, -8, 12)` plus a `roundRect` body) above the focused node. It bobs with a `Math.sin` animation and has a `glow`. On the atlas this character adds no information and frequently hides the very node it is meant to mark.

The minimap in `GameMapCanvas.tsx:1111-1199` is a `220x156` rectangle in the bottom‑right that mostly duplicates the atlas rings. It consumes canvas space and is rarely used because the atlas itself is already a good overview.

This epic replaces the hero with a HUD‑level step indicator and re‑evaluates the minimap.

## Why This Epic Exists

The atlas is the primary surface. Decoration that does not contribute information should be removed or relocated. The hero is a holdover from the city metaphor that the atlas has moved away from. The minimap was useful in the small graph presentation but is redundant in `skill-atlas` mode.

## Product Direction

- Remove the floating hero from the atlas canvas.
- Add a small "step" indicator in the bottom‑left of the atlas HUD, mirroring the bottom route strip (epic 36).
- Re‑evaluate the minimap: in `skill-atlas` mode, hide it; in `graph` mode, keep it but make it dismissible.

## Visual Targets

### Hero removal

- delete `HeroLayer` from `BrainGainzScene` and the `root.addChild(this.heroLayer)` call in `brain-gainz-scene.ts:101`;
- the visual cue "you are here" is now carried by:
  - the inner/outer pulse (epic 36 workstream 01);
  - the checkpoint marker (epic 36 workstream 01);
  - the bottom route strip current chip (epic 36 workstream 02).

### Step indicator

- a compact chip in the bottom‑left of the atlas HUD, on top of the canvas, but below the route strip if both are present;
- content: `Шаг N/M · <title truncated to 20 chars>`;
- on hover, expands to show the full title and `nextActionTitle`.

### Minimap

- in `skill-atlas` mode, do not render the minimap;
- in `graph` mode, keep the minimap but make it dismissible via a small "×" button in its top‑right;
- the dismiss state persists for the current session.

## Scope

Includes:

- remove `HeroLayer` from the scene and the `heroLayer` import in `brain-gainz-scene.ts`;
- new step indicator component under `src/components/`;
- minimap visibility logic in `GameMapCanvas.tsx:1111-1199`;
- minimap dismiss button and state.

Excludes:

- redesigning the city / "knowledge city" hero in other presentations (out of scope, this epic is atlas‑only);
- changes to the route strip (epic 36).

## Success Criteria

- The atlas canvas no longer shows the floating character.
- A small step indicator shows the current step in the bottom‑left.
- The minimap is hidden in `skill-atlas` mode and dismissible in `graph` mode.
- No regression in node highlight or current step emphasis (covered by epic 36).

## Workstreams

- `planned` - [workstreams/01-hero-replace-with-step-indicator.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/37-atlas-hero-and-minimap/workstreams/01-hero-replace-with-step-indicator.md)
- `planned` - [workstreams/02-minimap-cleanup.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/37-atlas-hero-and-minimap/workstreams/02-minimap-cleanup.md)
- `planned` - [workstreams/03-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/37-atlas-hero-and-minimap/workstreams/03-browser-qa.md)

## Suggested Sequence

1. Remove the floating hero and add a step indicator.
2. Hide the minimap in atlas mode and add a dismiss control for graph mode.
3. Browser QA across both atlases and viewports.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - wide desktop;
  - mobile `390x844`;
  - `NLH cash` atlas (no hero, no minimap, step indicator visible);
  - `Бакалавриат по информатике` atlas (same);
  - `graph` presentation (minimap visible, dismissible);
  - confirm no console errors from removed `HeroLayer` references;
  - console warnings/errors: `0`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
