# 01 Mini Preview Component

## Status

`planned`

## Goal

Build a small, deterministic SVG component that renders the silhouette of a sphere's knowledge map inside the card. No live data, no live render.

## Why This Matters

A static, deterministic mini-preview gives the card a recognisable identity (each sphere looks different) without the cost of rendering the actual canvas. It also lets us show a "current node" hint that is consistent with the canvas focus state.

## Scope

- a new file `src/components/galaxy/SphereMiniPreview.tsx`;
- the deterministic dot pattern generator (a small pure function);
- a unit test that locks the pattern for a fixed sphere slug.

## Requirements

### Shape

- a 96px × 96px SVG (viewBox `0 0 96 96`);
- a 96px diameter circle filled with `--sphere-{slug}-soft`;
- 6 to 12 small dots (radius 2 to 3) in `--sphere-{slug}-default`, scattered in the inner 80% of the circle;
- one "current" dot at 1.5x radius, filled with `--sphere-{slug}-strong`, positioned in the same place across renders for the same slug;
- the `current` dot position is derived from a stable hash of the slug, so that the pattern is reproducible without a random seed.

### Determinism

- the dot positions are computed once per slug and memoised in a module-level `Map<slug, Dot[]>`;
- the same slug always returns the same pattern;
- the function is exported so that the unit test can assert the pattern for a fixed slug.

### Performance

- the generator runs in `<1ms` per slug;
- the SVG re-renders only when the slug changes, not on every parent render.

## Out Of Scope

- Animating the dots (out of scope; static is the brief);
- Connecting the mini-preview to the actual canvas state (out of scope; the focused dot is a visual hint, not a live link);
- A 3D-rendered version (out of scope; SVG is the brief).

## Implementation Hints

- Use a tiny `mulberry32` PRNG seeded by a hash of the slug to lay out the dots. Keep the seed in the module so the test can pin it.
- Keep the file under 80 lines; the rest of the card lives in `NavigationView.tsx`.
- If a future epic wants to animate the dots, this component is the place to extend.

## Done When

- `SphereMiniPreview` renders for 8 different slugs without error.
- The unit test asserts the dot count and the `current` dot position for a fixed slug.
- The component does not trigger re-renders on parent state changes (covered by a small `React.memo`).
- The component is exported and is consumable by the sphere card.
