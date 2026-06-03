# 35 Atlas Visual Foundations

## Status

`planned`

## Goal

Make the knowledge atlas the most readable object on the `Обзор карты` workspace.

The atlas already has the right skeleton (PoE‑style radial rings, typed nodes, route overlay), but several visual layer choices hide its structure from the learner:

- biome sectors are drawn with `alpha: 0` and never appear on screen;
- course/topic nodes collapse to half‑moons instead of filling their rings;
- `local_cluster` graph edges are nearly invisible, so the atlas reads as a tree rather than a knowledge graph;
- node labels are forced off in `skill-atlas` mode even at usable zoom;
- status badges share a single 4‑pixel circle and rely on hue alone;
- the starfield backdrop and the radial grid layer stack on top of the atlas rings.

This epic fixes the foundational readability of the atlas canvas itself, without changing the data model or the surrounding layout chrome.

## Why This Epic Exists

The current `desktop-atlas-workspace.png` shows that learners see:

- colored nodes without color sectors;
- half‑filled rings per sphere;
- thin straight lines that disappear against the dark background;
- tooltips that only the focused node triggers;
- status badges that are hard to distinguish at any zoom.

Before adding more navigation, route, or layout work (epics 36‑39), the atlas itself has to read as a knowledge graph at first glance.

## Product Direction

Atlas must read as a knowledge graph, not a dashboard widget:

- every sphere has a visible sector wedge;
- every sphere fills its ring with nodes;
- selected path and route edges glow over the baseline graph;
- hovered/zoomed nodes can show a short title;
- status is communicated by both shape and color;
- backdrop stars and grid do not compete with the atlas rings.

## Visual Targets

### 1. Sectors

- visible `biome.color` wedge per sphere;
- `alpha` between `0.06` and `0.10`;
- `accent` stroke at `alpha 0.18-0.22`;
- optional double‑stroke glow on the outer rim.

### 2. Node distribution

- `padding` inside a sphere ring reduced from `0.22` to `0.05`;
- `courseDenseMaxSpan` raised from `Math.PI * 0.68` to `Math.PI * 1.4`;
- nodes spread on full ring instead of an arc;
- topic cluster keeps a tighter inner cluster only for branches with `>= 6` children.

### 3. Edges

- `local_cluster` `atlasAlpha` raised from `0.08` to `0.16-0.22`;
- `local_cluster` `atlasWidth` raised from `0.55` to `0.85`;
- `structure_root/branch` get an additional low‑alpha `glow` stroke;
- `isOnSelectedPath` edges get a `selectedAlpha` boost.

### 4. Labels

- short `title` labels visible for `topic_node` and above when `zoom >= 0.6`;
- `forceNodeLabels` honored for the focused branch at any zoom;
- `routeOrder` shown as a small `#n` chip when the node is a route member.

### 5. Status shape

- `weak` -> triangle;
- `contested` / `lost` -> diamond;
- `verified` / `completed` -> check mark;
- `locked` -> square;
- `current` keeps the round pulse.

### 6. Backdrop

- starfield generated deterministically per `biome.id`, not per frame;
- default `effects-layer` grid disabled in `presentation === 'skill-atlas'`;
- if a grid is kept, radii must match `180/260/500/720/900`.

## Scope

Includes:

- sector visibility tuning in `map-layer.ts`;
- angle distribution tuning in `skill-atlas-layout.ts`;
- edge alpha/width tuning in `map-layer.ts`;
- label visibility rules in `map-layer.ts`;
- status badge shape variants in `map-layer.ts`;
- starfield regeneration in `effects-layer.ts`;
- optional grid disable in `effects-layer.ts`;
- tooltip enrichment (mastery bar, `routeOrder`);
- sector label text rendering in `map-layer.ts`.

Excludes:

- HUD or top layout changes (epic 39);
- mobile/touch hit area changes (epic 38);
- route strip / current step emphasis (epic 36);
- hero / minimap rework (epic 37);
- changes to the data model or `NavigationSnapshot`.

## Success Criteria

- A learner can identify all sphere sectors on a fresh `1280x900` desktop view.
- A learner can see at least one labeled topic on a hovered/zoomed branch.
- A learner can distinguish `weak`, `contested`, `verified`, `locked` by shape alone at `zoom 1.0`.
- The atlas reads as a knowledge graph: selected path is visually highlighted, baseline edges are visible.
- Starfield and grid do not compete with atlas rings on the same view.
- Tooltip for a route node shows mastery progress and `routeOrder`.

## Workstreams

- `planned` - [workstreams/01-atlas-biome-sectors-visible.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/01-atlas-biome-sectors-visible.md)
- `planned` - [workstreams/02-full-ring-node-distribution.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/02-full-ring-node-distribution.md)
- `planned` - [workstreams/03-knowledge-graph-edge-contrast.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/03-knowledge-graph-edge-contrast.md)
- `planned` - [workstreams/04-node-labels-on-zoom.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/04-node-labels-on-zoom.md)
- `planned` - [workstreams/05-status-shape-differentiation.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/05-status-shape-differentiation.md)
- `planned` - [workstreams/06-constellation-backdrop-polish.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/06-constellation-backdrop-polish.md)
- `planned` - [workstreams/07-tooltip-and-sector-labels.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/07-tooltip-and-sector-labels.md)
- `planned` - [workstreams/08-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/35-atlas-visual-foundations/workstreams/08-browser-qa.md)

## Suggested Sequence

1. Make biome sectors visible and tuned.
2. Spread nodes over full rings.
3. Lift graph edge contrast and add a glow to selected path.
4. Allow short labels on zoomed/focused branches.
5. Differentiate status by shape.
6. Polish the starfield and align or disable the grid.
7. Enrich tooltips and add sphere sector labels.
8. Browser QA across `NLH cash` and `Бакалавриат по информатике`.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - wide desktop;
  - mobile `390x844` (atlas visible, no overflow);
  - `NLH cash` atlas;
  - `Бакалавриат по информатике` atlas;
  - hover a topic node at `zoom 0.6+` to confirm label;
  - confirm `weak`/`contested`/`verified`/`locked` are distinguishable by shape;
  - confirm selected‑path edges glow on top of baseline edges;
  - confirm starfield and grid do not conflict with atlas rings;
  - console warnings/errors: `0`.
