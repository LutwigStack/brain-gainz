# 36 Atlas Route And Current Step

## Status

`planned`

## Goal

Make the current route and current step the single most readable thing on the atlas.

The atlas already has a route overlay (`map-layer.ts:673-700`) and a pulse on the current node (`map-layer.ts:391-401`), but three things fight the learner's eye:

- the current step is signaled by a single thin outer ring, easily lost among the rings of a `topic_node`;
- the route is only visible as a faint line on the canvas, with no compact textual reference;
- when the route advances, the visual transition is silent — there is no animation or directional cue from the previous step to the next.

This epic adds a bottom route strip, strengthens the current step visual, and animates the transition between route steps.

## Why This Epic Exists

The `layout-rules.md` from epic 34 already calls for a "compact route strip" with current, next 3‑5, weak, and boss items, but it has not been implemented yet. Meanwhile, the atlas is the learner's main reference for "where am I in the program". Without a strong current‑step signal and a glanceable route strip, the learner has to open the right inspector every time they want to know "what's next".

## Product Direction

The route becomes a compact bottom strip:

- a row of route chips: previous (faded), current (accent), next 3‑5, weak (warning), boss (highlight);
- clicking a chip navigates the camera to that node;
- the current step on the atlas gets a stronger visual: double pulse, "checkpoint" marker, and an animated pulse along the edge from the previous step.

## Visual Targets

### Current step

- double pulse: inner pulse (`radius + 6`) and outer pulse (`radius + 18`);
- small "checkpoint" marker above the node (a small triangle or flag);
- color: existing `0x38bdf8` (cyan) on the inner pulse, warm `0xfacc15` (yellow) on the outer pulse.

### Route strip

- a fixed bottom strip on desktop, collapsible on mobile (drawer‑style);
- chip layout: `◀ #1 ✓ #2 ⏵ #3 ⏳ #4 ⚠ #5 ▶` with at most `7` chips visible;
- current chip: `accent` background, bold text;
- weak chip: `warning` background;
- boss chip: `danger` or distinct accent.

### Route transition

- one‑shot pulse animation along the edge from previous to current when the route advances;
- duration: `~600ms`;
- color: cyan with `alpha 0.4-0.6` decay.

## Scope

Includes:

- current step visual upgrade in `map-layer.ts` (`drawAtlasNode` and `tick`);
- new bottom route strip component under `src/components/`;
- route transition animation in `map-layer.ts` or a new `effects-layer` pass;
- camera navigation from a route chip click;
- integration with `GameMapCanvas` props (no breaking changes).

Excludes:

- changes to the route data model;
- HUD/top layout changes (epic 39);
- mobile bottom nav (epic 38);
- tooltip content changes (epic 35).

## Success Criteria

- A learner can identify the current step within `0.5s` on a fresh `1280x900` view.
- The route strip shows current, next 3‑5, weak, and boss without scrolling.
- Clicking a route chip centers the camera on the corresponding node.
- When the route advances (e.g. after a check), the learner sees a one‑shot pulse on the new edge.

## Workstreams

- `planned` - [workstreams/01-current-target-emphasis.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/36-atlas-route-and-current-step/workstreams/01-current-target-emphasis.md)
- `planned` - [workstreams/02-bottom-route-strip.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/36-atlas-route-and-current-step/workstreams/02-bottom-route-strip.md)
- `planned` - [workstreams/03-route-transition-pulse.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/36-atlas-route-and-current-step/workstreams/03-route-transition-pulse.md)
- `planned` - [workstreams/04-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/36-atlas-route-and-current-step/workstreams/04-browser-qa.md)

## Suggested Sequence

1. Strengthen the current step visual on the atlas.
2. Build the bottom route strip component.
3. Add the route transition pulse.
4. Browser QA across both atlases and viewports.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - wide desktop;
  - mobile `390x844`;
  - `NLH cash` atlas;
  - `Бакалавриат по информатике` atlas;
  - confirm current step is visible at default zoom;
  - confirm route strip shows current/next/weak/boss;
  - click a route chip and confirm camera centers;
  - advance the route and confirm transition pulse;
  - console warnings/errors: `0`.
