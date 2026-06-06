# 01 Holo Redraw

## Status

`planned`

## Goal

Redraw the atlas minimap as a holographic galaxy projection. No interaction in this workstream; the click handler is added in workstream 02.

## Why This Matters

The current minimap duplicates the canvas at a smaller scale; it does not earn its space. A galaxy holo with one tinted cluster per sphere reads as a map of the program at a glance, not as a tiny copy of the canvas.

## Scope

- the minimap block in `src/game/react/GameMapCanvas.tsx:1111-1199`;
- the `minimap` memo computation in `GameMapCanvas.tsx:618-663`;
- the new `GalaxyHoloMinimap.tsx` component;
- the layout coordinate transform from canvas space to minimap space.

## Requirements

### Background

- the minimap background uses `--cosmic-base` (the new deep-space token from epic 47; if epic 47 has not landed yet, fall back to the current `--surface-base` with a comment that says `// epic 46 placeholder, replaced by epic 47`);
- the background is a flat color, not a gradient (gradients on small surfaces shimmer on low-end devices).

### Clusters

- one cluster per sphere, positioned at the centroid of the sphere's nodes in canvas space;
- cluster bounding box: roughly 40px × 24px on the minimap, scaled to the minimap's coordinate system;
- cluster fill: `--sphere-{slug}-soft` at 80% alpha;
- cluster dots: 6-10 dots of radius 1.5px in `--sphere-{slug}-default`, deterministically placed (the same algorithm as the sphere card mini-preview, epic 42);
- the current sphere's cluster has a 1px outline in `--sphere-{slug}-strong`;
- the cluster does not have a text label (the legend is the right place for labels).

### Viewport rectangle

- a 1px rectangle in `text-default` at 60% alpha, sized and positioned to match the current canvas viewport;
- the rectangle updates on every `viewportCamera` change;
- on a tap inside the minimap, the rectangle is the new viewport (wired in workstream 02).

## Out Of Scope

- A click handler (workstream 02);
- Tooltips on the cluster (out of scope; the legend already names the spheres);
- Animating the cluster on focus change (out of scope; the cluster snaps to the new color, no transition).

## Implementation Hints

- The minimap is a small canvas / SVG; prefer SVG for this epic because the cluster dot pattern is the same algorithm as the sphere card mini-preview (epic 42) and we want a single source of truth.
- The `minimap` memo can stay; the new component just reads from the same memo.
- Coordinate transform: `minimapX = canvasX * minimap.width / canvas.width`. The same transform is used in workstream 02 for the click handler.

## Done When

- The minimap renders as a galaxy holo with 8 tinted clusters, the current sphere highlighted, and a viewport rectangle.
- The `minimap` memo still computes correctly.
- No console warning from the placeholder background.
- Snapshot test of the SVG matches the expected layout for a fixed node set.
