# 49 Cosmic Canvas Polish

## Status

`planned`

## Goal

Fix three cosmetic issues on the cosmic canvas that the first cut of epic 47 left rough, using the live-screenshot feedback as the source of truth. After this epic, the canvas should look like a deliberate cosmic scene with a real focal point, a real star marker, and nebulae that belong to spheres — not a generic dot-graph.

## Why This Epic Exists

The cosmic canvas (epic 47) shipped the structural pieces — deep-space background, sphere colour palette, jump-route edges, focal spiral, star marker, minimap. The structure is in place and 337/337 tests pass. But the live screenshot `C:\Users\Andr3y\.mavis\uploads\1780747710966-image.png` exposes three cosmetic problems that the spec and the structural tests do not catch:

1. **Focal spiral does not read as a spiral.** The current node (large yellow planet) is in the upper-left corner, not the spec's 35% from left, 40% from top. The other planets are scattered in a way that crosses edges and packs them too tight, especially in the upper half. The viewer sees a tangle, not a focal anchor.
2. **Star marker is a circle.** The "current node marker" in the upper-left is a thick yellow circle with a double outline. The spec asks for a 4-point star + soft corona, with a slow 0.96→1.04 pulse on the corona. The current implementation likely regressed to a filled circle in the workstream-02 pass, or the star was drawn but the corona covered the points.
3. **Nebulae float, do not belong to spheres.** Two big soft circles (one upper-left, one orange upper-right) are visible but not anchored to any sphere centroid. They look like random bokeh, not the eight tinted nebulae the spec describes.

There is also a minor localisation issue ("Майнкарпа" instead of "Мини-карта", "пер..." instead of "Перейти к...") that the user noticed and that is bundled into the fix because it lives in the same surface.

## Product Direction

The fix is visual, not structural. The data model, the colour tokens, the camera commands, the keyboard navigation, the minimap interaction, the breadcrumb, and the right `Занятие` panel stay unchanged. Only three render passes and a few i18n strings move.

The reference for the new look is `output/cosmic-references/style-5-cosmic.png` — the cosmic style concept the user picked at the start of the package. The after-fix screenshot must read as "the same data, but it finally looks cosmic" — not "we added more particles".

## Visual Targets

### Focal spiral (workstream 01)

- The current node is at exactly 35% of the canvas width from the left, 40% of the canvas height from the top, in canvas coordinates (not screen coordinates).
- The remaining 60+ nodes are placed on a logarithmic spiral r = a * e^(0.2 * theta) with angle jitter ±15%, seeded by a stable hash of the program slug so the layout is deterministic across reloads.
- The spiral direction is consistent per program — clockwise for `Бакалавриат по информатике`, counter-clockwise for `NLH cash`. This is a design call recorded here, not a runtime parameter.
- Direct neighbours of the current node sit on the inner ring (theta = 0). Neighbours of the inner-ring nodes sit on the next ring. Etc. The graph topology from `skill-atlas-layout.ts` is the source of truth — this epic only changes the polar-coordinate → canvas-coordinate mapping, not the edges.
- No two nodes may render within 18px of each other. If a placement would overlap, the node is bumped outward along the spiral by half a turn (theta += π).
- The current node is the only one rendered with the star marker (workstream 02). The inner ring uses planets at 14px (large). The next two rings use 10px (medium). The outer rings use 6px (small).
- Edges (jump routes, workstream 03 of epic 47) stay Bezier-curve. They are re-laid-out to follow the new positions automatically because they are computed from node coordinates at draw time.

### Star marker (workstream 02)

- The marker is a 4-point star: vertices at 0°, 90°, 180°, 270° on the outer radius (14px), and at 45°, 135°, 225°, 315° on the inner radius (6px).
- The star body is filled with `--sphere-{slug}-strong` of the current sphere, with a 1px inner stroke of `#FFFFFF` at 60% alpha. The stroke is drawn on the inside of the path so the points stay sharp.
- A corona is a radial gradient: 0% alpha at the outer edge (42px diameter), 30% alpha at the star edge, colour `--sphere-{slug}-strong`. The corona is drawn behind the star.
- The corona scale animates 0.96 → 1.04 over 2.4s, ease-in-out, looped. The animation is driven by `performance.now()`, paused when `document.hidden`, resumed on `visibilitychange` from the current `performance.now()` (not the paused frame, which would skip a half-cycle).
- The alpha of the corona breathes 0.20 → 0.30 in sync with the scale. The star body itself does not animate.
- The marker is a 4-point star, not a circle. If the verifier reads the rendered shape and finds a `circle()` call for the marker, that is a fail.

### Nebulae (workstream 03)

- Exactly eight nebulae, one per sphere, in the same clockwise order as the radar in `WindRoseView` (`Программирование` → `Математика` → `Навигационный центр` → `Компьютерные системы` → `Данные и ИИ` → `Инженерия ПО и продукт` → `Общество, этика, право` → `Проекты`).
- Each nebula is positioned at the centroid of its sphere's nodes in canvas space, then mapped to a position on the canvas. If the sphere has no nodes (possible in an early-campaign state), the nebula is hidden, not placed at 0,0.
- Each nebula is a radial gradient: 0% alpha at the outer edge, 15-20% alpha at the centre, colour `--sphere-{slug}-soft`. Diameter 240-320px (smaller for spheres with few nodes, larger for spheres with many).
- Z-order: nebula is drawn before the edges, after the star field. Two nebulae may overlap; the renderer just draws them in catalog order.
- No nebula exists outside this list. If a render pass adds a stray soft circle (e.g. a leftover "halo" effect from the pre-cosmic era), remove it.

### Localisation tidy (workstream 04, bundling with the polish)

- "Майнкарпа" → "Мини-карта" (the existing key, currently truncated by the surface).
- "пер..." → either the full label or a shorter form that fits. The candidate is "Перейти" (no ellipsis) if the surface is narrow, or a full sentence on wider surfaces. Use the existing i18n key, do not invent a new one.
- No other string changes in this epic.

## Scope

Includes:

- `src/game/skill-atlas-layout.ts` (or wherever the polar→canvas mapping lives) — workstream 01.
- `src/game/layers/map-layer.ts` (or wherever the current-node marker is drawn) — workstream 02. If the marker is split across multiple files, edit all of them.
- `src/game/layers/effects-layer.ts` and `src/game/layers/cosmic-background.ts` (if the nebulae are there) — workstream 03.
- The i18n string(s) backing the minimap caption and the truncated `перейти` button — workstream 04. The string fix is one-line per string.
- A unit test for the focal spiral (deterministic per program, current node at the right place, no overlap) — workstream 01.
- A snapshot or unit test for the star marker (path has 4 outer + 4 inner vertices, fill is `--sphere-{slug}-strong`, no `circle()` call in the marker function) — workstream 02.

Excludes:

- Changing the data model (nodes, edges, sphere) — unchanged.
- Changing the colour tokens (epic 41) — unchanged.
- Changing the minimap (epic 46) — unchanged.
- Changing the right `Занятие` panel (epic 44) — unchanged.
- Changing the breadcrumb or the canvas chrome — unchanged.
- Renaming `skill-atlas-layout.ts` — parked, not part of this epic.

## Success Criteria

- On `desktop 1280x900`, the cosmic canvas shows the current node at roughly 35% from the left, 40% from the top of the canvas (not the screen). The current node is rendered as a 4-point star with a soft pulsing corona, not a circle. The remaining nodes fan out from the current node in a non-symmetric, non-overlapping pattern.
- The nebulae on the background are tinted with the eight sphere colours, one per sphere, positioned at the sphere centroid. There are no stray soft circles in the background that do not belong to a sphere.
- The minimap caption reads "Мини-карта" in full, not "Майнкарпа". The "Перейти" button is not truncated to "пер..." on `desktop 1280x900`.
- `npm run lint` and `npm run test` and `npm run build` all pass.
- A before/after pair of screenshots is stored under `qa/` — the "after" is taken after the fix on a fresh dev server. The user takes this screenshot themselves, the verifier confirms the description matches the actual rendered output via playwright MCP if a dev server is up, otherwise via the `qa/` artefacts only.
- A code-review verdict: no `circle()` call on the current-node marker, no `circle()` calls in the nebula render, no `console.warn` on missing sphere slug, no flicker on the pulse.

## Workstreams

- `planned` - [workstreams/01-focal-spiral.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/49-cosmic-canvas-polish/workstreams/01-focal-spiral.md)
- `planned` - [workstreams/02-star-marker.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/49-cosmic-canvas-polish/workstreams/02-star-marker.md)
- `planned` - [workstreams/03-nebulae-anchored.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/49-cosmic-canvas-polish/workstreams/03-nebulae-anchored.md)
- `planned` - [workstreams/04-i18n-tidy.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/49-cosmic-canvas-polish/workstreams/04-i18n-tidy.md)
- `planned` - [workstreams/05-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/49-cosmic-canvas-polish/workstreams/05-verify.md)

## Suggested Sequence

1. Focal spiral (workstream 01) — biggest visual win, biggest chance of regressing other surfaces.
2. Star marker (workstream 02) — independent of spiral, can be done in parallel by a separate worker, but doing it after the spiral keeps the worker context warm.
3. Nebulae (workstream 03) — independent of both, lowest risk.
4. i18n tidy (workstream 04) — independent, smallest.
5. Verify (workstream 05) — runs against the live dev server and the static checks.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA (the verifier takes the screenshot through playwright MCP if a dev server is up on port 5181 or any free port; if no dev server, the verifier takes the screenshot through a worker session that boots the dev server in the background with the `cmd.exe /c npm run dev` workaround):
  - desktop `1280x900`;
  - `Бакалавриат по информатике` campaign;
  - `Обзор карты` → `Карта знаний` tab;
  - take screenshot, save to `qa/after-fix-cs-bachelor.png`;
  - switch to `NLH cash` campaign, repeat, save to `qa/after-fix-nlh-cash.png`;
  - check the minimap caption is "Мини-карта" in full and the `Перейти` button is not truncated.
- Visual diff against the user-supplied reference image `C:\Users\Andr3y\.mavis\uploads\1780747710966-image.png`:
  - the current node is at roughly 35% from the left, 40% from the top;
  - the current node is a 4-point star with a corona, not a circle;
  - the background has eight tinted nebulae, not two stray soft circles;
  - the "Майнкарпа" and "пер..." strings are no longer visible.
- Code grep:
  - `rg "circle\(" src/game/layers/` should return no hits in the current-node marker function;
  - `rg "nebula" src/game/layers/` should return eight hit-groups, one per sphere token key;
  - `rg "Майнкарпа" src/` should return 0 hits;
  - `rg '"пер\.\.\."' src/` should return 0 hits.
- Console: no `console.warn` or `console.error` from the canvas layer, the layout, or the i18n module on a clean page load.
