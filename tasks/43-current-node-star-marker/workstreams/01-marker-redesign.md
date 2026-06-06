# 01 Marker Redesign

## Status

`planned`

## Goal

Replace the existing circular marker on the `Карта знаний` canvas with a 4-point star + corona, using the current sphere's `strong` token for the fill.

## Why This Matters

A flat circle reads as "a node is selected" but does not match the cosmic metaphor. A star with a corona reads as "this is the active star system" and ties the marker visually to the rest of the cosmic canvas (epic 47).

## Scope

- the marker geometry in `src/game/layers/map-layer.ts` (around the `drawCurrentMarker` or equivalent function);
- the color binding to the sphere tokens defined in epic 41;
- the z-order so that the marker sits above the edges but below the node label.

## Requirements

### Geometry

- 4-point star, 14px outer radius, 6px inner radius;
- 1px inner stroke in white at 60% alpha;
- corona: 42px diameter, radial gradient, 0% alpha at the edge, 30% alpha at the star edge, color from the sphere `strong` token;
- the marker is centred on the node's centre point.

### Color

- the fill is `--sphere-{slug}-strong`, where `{slug}` is the current sphere's slug;
- the inner stroke is `#FFFFFF` at 60% alpha (a fixed white; the contrast holds for any sphere color);
- the corona inherits the same `strong` color, with the alpha mask described above.

### Z-order

- the marker is drawn after the edges and after the node fill, but before the node label and the breadcrumb;
- the existing render order is preserved otherwise.

## Out Of Scope

- Animating the marker (epic 43 workstream 02);
- Replacing the marker with a 3D shape (out of scope; SVG / canvas 2D is the brief);
- A clickable marker (out of scope; the marker is informational).

## Implementation Hints

- If the existing marker is a single `circle` call, replace it with two calls: a `radialGradient` for the corona and a `path` for the star body. The `path` is a 4-point star whose vertices are at 0°, 90°, 180°, 270° on the outer radius and at 45°, 135°, 225°, 315° on the inner radius.
- Pass the sphere slug into the render function from the existing `MapCameraCommand` flow; if the slug is not available, fall back to a neutral white (and log a `console.warn` so the missing binding is visible).
- Keep the marker file under 100 lines.

## Done When

- The marker is a star + corona on the canvas.
- The color matches the current sphere's `strong` token.
- The marker is not occluded by the node label or the breadcrumb.
- No regression in the rest of the canvas.
