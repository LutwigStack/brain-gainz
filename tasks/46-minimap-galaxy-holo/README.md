# 46 Minimap Galaxy Holo

## Status

`planned`

## Goal

Redraw the atlas minimap (the small `220x156` panel in the bottom-right of the canvas) as a holographic galaxy projection: deep-space background, each sphere rendered as a tinted cluster of stars, the current sphere highlighted, and clicking anywhere on the minimap jumps the canvas viewport to that point.

## Why This Epic Exists

The current minimap (visible on `output/current-05-skill-map-tab.png`) is a tiny rectangle with the same node geometry as the canvas. It duplicates information without adding meaning. As a galaxy holo, it becomes a low-cost overview of where the learner is in the program, and clicking it turns it into a real navigation tool rather than a decoration. The user explicitly asked for the minimap to be clickable in the original review (item 13).

## Product Direction

- the minimap background is the same deep-space background as the canvas (epic 47);
- each sphere is rendered as a soft tinted cluster (using the sphere's `soft` token, epic 41) with a small number of bright dots (using the sphere's `default` token) inside;
- the current sphere's cluster is rendered in the `strong` token and has a thin outline;
- the viewport rectangle is a thin 1px outline in `text-default`, semi-transparent so it does not fight the cluster colors;
- clicking anywhere on the minimap centers the canvas viewport on that point;
- the minimap keeps its current size (`220x156`); a future epic may revisit the size, but the user has confirmed `не трогаем` for the current pass.

## Visual Targets

### Static

- background: `--cosmic-base` (the new deep-space token from epic 47);
- cluster fill: `--sphere-{slug}-soft`;
- cluster dots: `--sphere-{slug}-default`, 6-10 per cluster, 1.5px radius;
- current cluster outline: `--sphere-{slug}-strong`, 1px;
- viewport rectangle: 1px in `text-default` at 60% alpha.

### Click

- a click anywhere on the minimap dispatches a `MapCameraCommand` that centers the canvas on the point under the cursor;
- the click is debounced (no more than one jump per 80ms) to prevent scroll-wheel-spam from translating into a teleport;
- the click is announced to screen readers via `aria-live="polite"` on a hidden region that says `Вид карты перемещён в сектор {sphere-name}` if the click landed in a cluster, or `Вид карты перемещён` otherwise.

## Scope

Includes:

- the minimap block in `src/game/react/GameMapCanvas.tsx:1111-1199` (per the comment in epic 37);
- the `minimap` memo computation in `GameMapCanvas.tsx:618-663`;
- the new `GalaxyHoloMinimap.tsx` component that replaces the existing minimap block;
- the click handler that dispatches a `MapCameraCommand`;
- the screen-reader live region.

Excludes:

- Resizing the minimap (out of scope; the user said `не трогаем`);
- Replacing the minimap with a different overview tool (out of scope);
- A "show minimap" command after dismissal (epic 37 already removed the minimap in `skill-atlas` mode; this epic re-enables it in `skill-atlas` mode but the dismissal from epic 37 still applies in `graph` mode).

## Success Criteria

- The minimap renders as a galaxy holo on the `Карта знаний` view in both campaigns.
- Clicking anywhere on the minimap centers the canvas viewport on that point.
- The current sphere is highlighted in the `strong` token.
- A screen reader announces the sphere name when the click lands in a cluster.
- No regression in the dismissible behavior added by epic 37 in `graph` mode.

## Workstreams

- `planned` - [workstreams/01-holo-redraw.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/46-minimap-galaxy-holo/workstreams/01-holo-redraw.md)
- `planned` - [workstreams/02-jump-on-click.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/46-minimap-galaxy-holo/workstreams/02-jump-on-click.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/46-minimap-galaxy-holo/workstreams/03-verify.md)

## Suggested Sequence

1. Redraw the minimap as a galaxy holo, keeping the click handler as a no-op for now.
2. Wire the click handler to the existing `MapCameraCommand` flow.
3. Verify visually and via a click test.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900` and mobile `390x844`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - open `Карта знаний` and confirm the minimap is a galaxy holo;
  - click the center of the minimap and confirm the canvas centers on the current node;
  - click a corner of the minimap and confirm the canvas jumps to that area;
  - confirm the screen reader announces the sphere name when a click lands in a cluster;
  - in `graph` mode, confirm the dismiss button from epic 37 still works;
  - console warnings/errors: `0`.
- Snapshot tests:
  - the galaxy holo minimap matches the expected SVG snapshot for a fixed sphere layout.
