# 02 Sphere Nav Pad

## Status

`planned`

## Goal>

Add a circular sphere navigator in the top‑right of the atlas canvas, so the learner can switch sphere focus without leaving the map.

## Why This Matters

Currently the sphere selector is a horizontal chip row inside the top context (visible on `10-readability-atlas-desktop.png` from epic 31). It duplicates data already on the atlas and consumes horizontal space that could be used for the HUD. A circular pad in the corner is more compact and matches the radial metaphor of the atlas.

## Scope

- a new `SphereNavPad` component under `src/components/`;
- integration with `GameMapCanvas` so the pad sits over the canvas top‑right corner;
- the existing `visibleSphereId` prop on `GameMapCanvas` (read only — confirm it is wired).

## Requirements

### Visual

- a circular pad, `~96px` diameter, anchored to the top‑right of the canvas, with a `~16px` margin;
- background: a `PixelSurface` with `frame="ghost"`, `alpha 0.9`;
- one dot per sphere, arranged in a circle around the center;
- the current sphere dot is highlighted (`accent` color, `radius 6`);
- other dots: `radius 4`, `alpha 0.7`;
- the pad collapses to a single sphere chip when there is only one sphere.

### Interaction

- clicking a sphere dot dispatches a sphere filter that mirrors the existing `onSelectStat` flow on the map workspace (or the equivalent for the atlas workspace);
- the dot updates its highlight immediately;
- on hover, the sphere name appears as a small tooltip (`<title>` attribute is enough for desktop; for mobile, a tap on the dot expands a tiny label);
- on mobile (`< 768px`), the pad is hidden; the sphere filter is exposed via the bottom HUD (handled by epic 38 workstream 03).

### State

- the active sphere is driven by the same state that drives `visibleSphereId` on `GameMapCanvas`;
- no new global state is introduced.

## Out Of Scope

- Replacing the existing horizontal sphere chip row in other workspaces (this epic is atlas‑only).
- Adding a "show all spheres" command.
- Animating the dot transition (the current sphere is the only one that should change in normal use).

## Implementation Hints

- Use the existing `PixelSurface` and `PixelText` components for the pad background and labels.
- The dots can be small `<div>` elements with `border-radius: 50%` and absolute positioning.
- Reuse the existing sphere palette (`biomePalette` in `create-game-view-model.ts:23-30`) for the dot colors.
- Position the pad with `position: absolute; top: 16px; right: 16px;` inside the `GameMapCanvas` container.

## Done When

- The sphere nav pad is visible in the top‑right of the atlas canvas on desktop.
- Clicking a sphere dot filters the atlas to that sphere.
- The pad is hidden on mobile.
- The current sphere is visually highlighted.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
