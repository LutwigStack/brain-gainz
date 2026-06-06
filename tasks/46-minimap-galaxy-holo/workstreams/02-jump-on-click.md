# 02 Jump On Click

## Status

`planned`

## Goal

Make the galaxy holo minimap clickable: clicking anywhere on the minimap centers the canvas viewport on that point. The click is debounced and announced to screen readers.

## Why This Matters

A clickable minimap turns a passive overview into a navigation tool. The user explicitly asked for `клик = прыжок вьюпорта` in the original review (item 13). The screen reader announcement keeps the action accessible to learners who do not see the canvas jump.

## Scope

- the `onClick` handler on the `GalaxyHoloMinimap` component (added in workstream 01);
- the debounce wrapper (80ms);
- the screen reader live region;
- the dispatch of the existing `MapCameraCommand`.

## Requirements

### Click

- clicking anywhere on the minimap dispatches a `MapCameraCommand` of the existing "center on point" type (the same command used by the breadcrumb in epic 36);
- the click coordinate is converted from minimap space to canvas space using the inverse of the transform from workstream 01;
- the click is debounced to one jump per 80ms (`setTimeout` clear / reset pattern is fine);
- the click target is the whole minimap surface, not just the clusters.

### Screen reader

- a hidden `aria-live="polite"` region announces the result of the click;
- if the click landed inside a cluster, the announcement reads `Вид карты перемещён в сектор {sphere-name}`;
- otherwise the announcement reads `Вид карты перемещён`;
- the region is `position: absolute; clip: rect(0 0 0 0)` so it is not visible but is read by assistive tech.

### No regression

- the dismissible behavior from epic 37 still works in `graph` mode (the `×` button is unchanged);
- the focus state of the canvas (the current sphere) is unchanged when the user clicks inside the current cluster;
- the keyboard shortcut that opens the minimap (if any) is unchanged.

## Out Of Scope

- A pan gesture on the minimap (out of scope; the user only asked for click-to-jump);
- A right-click context menu (out of scope);
- A "fit to view" command on the minimap (out of scope; the existing `К текущему` button does that for the current node, and epic 47 will revisit the canvas controls).

## Implementation Hints

- Reuse the existing `MapCameraCommand` enum (don't introduce a new variant unless the existing one does not fit; the workstream assumes `centerOn` exists).
- The debounce can be a `useRef<NodeJS.Timeout | null>` cleared on every click.
- The screen reader region is a single `<div>` mounted once at the root of the minimap component.

## Done When

- Clicking anywhere on the minimap centers the canvas viewport on that point.
- The click is debounced to one jump per 80ms.
- The screen reader announces the sphere name when the click lands in a cluster.
- No regression in the dismissible behavior or the focus state.
- The `aria-live` region is in the accessibility tree and is not visible.
