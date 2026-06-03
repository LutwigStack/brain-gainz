# 02 Minimap Cleanup

## Status

`planned`

## Goal

Hide the minimap in `skill-atlas` mode and make it dismissible in `graph` mode.

## Why This Matters

`GameMapCanvas.tsx:1111-1199` renders a `220x156` minimap in the bottom‑right of the canvas, conditioned on `!isEmptyMap && !shouldRenderOverview`. In `skill-atlas` mode, the minimap is a tiny duplicate of the atlas rings and consumes canvas space. In `graph` mode it is sometimes useful for orientation, but it competes with the route strip and the step indicator for the same corner.

## Scope

- the minimap block in `GameMapCanvas.tsx:1111-1199`;
- the `minimap` memo computation in `GameMapCanvas.tsx:618-663`;
- a new `localStorage` key for the dismiss preference (e.g. `bg.map.minimapDismissed`).

## Requirements

### Atlas mode

- in `presentation === 'skill-atlas'`, do not render the minimap;
- the `minimap` memo can still compute (cheap), but the JSX block must be hidden.

### Graph mode

- keep the minimap visible by default;
- add a small `×` button in the top‑right of the minimap surface;
- clicking the `×` hides the minimap and writes `bg.map.minimapDismissed = "1"` to `localStorage`;
- on next mount, if the flag is set, do not render the minimap;
- the dismiss state is per‑browser, not per‑campaign.

## Out Of Scope

- Adding a "show minimap" command elsewhere (the dismiss is one‑way in this epic).
- Re‑positioning the minimap to a different corner.
- Replacing the minimap with a different overview tool.

## Implementation Hints

- The `minimap` memo is a `useMemo` that depends on `hostSize`, `model`, `viewportCamera`. It is fine to keep computing it; gate the JSX only.
- Use `useState` for the dismiss state, initialized from `localStorage` on mount.
- The `×` button should be a small `PixelButton` with `padding="xs"` and an `aria-label="Скрыть миникарту"`.

## Done When

- The minimap is hidden in `skill-atlas` mode on both `NLH cash` and `Бакалавриат по информатике`.
- In `graph` mode, the minimap is visible by default and can be dismissed with the `×` button.
- After dismiss, the minimap stays hidden across reloads for that browser.
- Visual test screenshot stored under `qa/`.
