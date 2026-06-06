# 02 Progress Arc

## Status

`planned`

## Goal

Build a thin progress arc component that shows the share of completed nodes in a sphere. The arc is rendered around the mini-preview circle and starts at the top (12 o'clock), going clockwise.

## Why This Matters

The mini-preview (workstream 01) shows the sphere's identity; the arc shows the learner's progress in that sphere. Together they answer the question "what is this and how far am I" in one glance.

## Scope

- a new file `src/components/galaxy/ProgressArc.tsx`;
- the data flow that feeds `completedCount` and `totalCount` into the card;
- a small label inside the card that shows the percentage.

## Requirements

### Arc

- a 3px stroke ring around the 96px mini-preview;
- starts at 12 o'clock and goes clockwise;
- the filled portion uses `--sphere-{slug}-default` (or `strong` when the sphere is focused);
- the unfilled portion uses a 1px stroke in `--sphere-{slug}-soft` (lower contrast, so the progress stands out);
- if `total` is 0, the entire arc is hidden, not just the filled portion;
- the arc caps at 100% even if `completed > total` (defensive against bad data).

### Label

- a small text near the button: `N%` (no decimals, rounded to nearest integer);
- the label color is `--sphere-{slug}-strong` when the sphere is focused, otherwise `--text-muted`;
- if `total` is 0, the label reads `—` (em dash) instead of `0%`, to avoid the false impression of 0% progress on a sphere that has no nodes yet.

### Data

- the card receives `completedCount` and `totalCount` as props;
- the parent (the `Сектора` grid in `NavigationView.tsx`) is updated to derive these counts from the navigation snapshot;
- if the data is missing, the parent passes `0 / 0` and the arc is hidden (see above).

## Out Of Scope

- Animating the arc as the count changes (out of scope; the arc snaps to the new value, no transition);
- Showing absolute counts next to the percentage (out of scope; the card already shows `N узл.`);
- Linking the arc to a course catalog (out of scope; the catalog is the source of `total`).

## Implementation Hints

- Use an SVG `<circle>` with `strokeDasharray` and `strokeDashoffset` to draw the arc; this is the standard way and avoids trigonometry.
- Center the label vertically with the button using `align-items: center`; no absolute positioning.
- If the project uses Tailwind, prefer a small `class` over a `style` prop so the value can be themed later.

## Done When

- `ProgressArc` renders for 8 different slugs with synthetic counts.
- The unit test asserts that 0/0 hides the arc, 0/12 shows the empty stroke only, 6/12 fills half the ring, 12/12 fills the full ring.
- The `NavigationView.tsx` grid passes real `completed / total` counts to the card.
- No regression: the button is still clickable and opens the canvas.
