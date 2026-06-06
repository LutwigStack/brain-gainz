# 03 Nebulae Anchored

## Status

`planned`

## Goal

Anchor the eight cosmic nebulae to their sphere centroids. Each nebula is a soft tinted radial gradient positioned at the centroid of its sphere's nodes in canvas space, with a diameter that scales with the sphere's node count. No stray soft circles in the background that do not belong to a sphere.

## Why This Matters

The first cut rendered two large soft circles (one upper-left, one orange upper-right) that look like random bokeh, not the eight tinted nebulae the spec describes. The screenshot proves the issue: the background reads as "some glow somewhere" instead of "eight sectors of the galaxy, each with its own atmosphere". The fix is to bind each nebula to a sphere and to its centroid.

## Scope

- `src/game/layers/cosmic-background.ts` (where the first cut put the nebulae) — bind positions and colours to sphere centroids.
- The data flow that supplies the centroid for each sphere. If the centroids are computed in another file (e.g. `skill-atlas-layout.ts` from workstream 01), read them from there. If they are not yet exposed, compute them in this workstream from `navigationSnapshot.nodes`.

Excludes:

- The star field (the small dots across the background) — unchanged.
- The deep-space base colour (`--cosmic-base`) — unchanged.
- The edge / node / marker rendering — separate workstreams.

## Requirements

### Count and colour

- Exactly eight nebulae, one per sphere, in the same clockwise order as the radar in `WindRoseView`:
  1. `Программирование` → `sphere-code`
  2. `Математика` → `sphere-math`
  3. `Навигационный центр` → `sphere-navigation`
  4. `Компьютерные системы` → `sphere-systems`
  5. `Данные и ИИ` → `sphere-data`
  6. `Инженерия ПО и продукт` → `sphere-engineering`
  7. `Общество, этика, право` → `sphere-society`
  8. `Проекты` → `sphere-projects`
- Each nebula is filled with `--sphere-{slug}-soft` at 15-20% alpha, drawn as a radial gradient that fades to transparent at the outer edge.

### Position

- Each nebula is positioned at the centroid of its sphere's nodes in canvas space. Centroid = arithmetic mean of the node positions.
- If a sphere has zero nodes (early-campaign state, possible in a fresh `NLH cash` campaign), the nebula is hidden, not placed at 0,0. A `console.debug` is logged once per sphere per session so the developer can see why a nebula is missing.
- After workstream 01 (focal spiral) lands, the centroids are read from the layout function, not recomputed here. The dependency is: workstream 01 must land first, or this workstream reads node positions from a fallback (sum of x / count, etc.).

### Size

- Diameter 240-320px. Linear in the sphere's node count: `diameter = 240 + 80 * (nodeCount / maxNodeCountAcrossSpheres)`. The sphere with the most nodes gets 320px, the sphere with the fewest gets 240px.
- If a sphere has zero nodes, its nebula is hidden (per the position rule above).

### Z-order and blending

- Nebulae are drawn before the edges, after the star field.
- Two nebulae may overlap. The renderer draws them in catalog order, so the later sphere is on top of the earlier one. The blend mode is the existing one (likely `normal` or `add` — leave as it is unless the verifier flags it as a fail).

## Out Of Scope

- Animating the nebulae (twinkling, breathing). The spec calls them static. Out of scope.
- Adding more than eight nebulae.
- Recomputing the star field.

## Implementation Hints

- The first cut probably rendered the nebulae in a fixed order, possibly with hard-coded positions. Replace those with the per-sphere data flow.
- A nebula is drawn as a single radial gradient on a circle of the chosen diameter. The gradient: 0% alpha at the edge, 15-20% alpha at the centre.
- If the file currently has a "leftover halo" effect from the pre-cosmic era, remove it.

## Done When

- The background shows eight tinted nebulae, one per sphere, each positioned at the centroid of its sphere's nodes. There are no stray soft circles.
- A worker (or the user) takes a screenshot of `Обзор карты` → `Карта знаний`. The screenshot is described in `qa/notes.md` as showing eight tinted nebulae in the eight sphere colours.
- `rg "nebula" src/game/layers/` returns exactly eight hit-groups, one per sphere token key.
- `npm run lint`, `npm run test`, `npm run build` are all green.
