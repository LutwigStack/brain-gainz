# 34 Map First Atlas Workspace

## Status

`planned`

## Goal

Make the knowledge atlas the main workspace.

The current atlas is visually promising, but the page still treats it like one dashboard widget surrounded by permanent cards.

Target rule:

> Map first. Everything else is a collapsible layout overlay.

## Why This Epic Exists

The skill atlas needs space.

Current problems:

- top map header takes too much vertical space;
- right lesson/inspector rail is always present;
- map is framed as content inside a dashboard;
- current step chips compete with the atlas;
- user cannot quickly enter a clean map exploration mode;
- tooltip/card behavior is not yet the main way to inspect nodes.

The atlas should feel like the primary game/learning surface.

## Product Direction

Use the atlas as the first-class screen:

- large canvas;
- compact HUD;
- collapsible details;
- floating node card;
- right drawer only when needed;
- bottom route strip;
- clean focus mode.

The learner should be able to:

1. open map;
2. see the atlas immediately;
3. hover/select a node for a compact card;
4. open lesson/check only when ready;
5. hide all panels and explore.

## Layout Model

### Default Map Workspace

Visible:

- left app rail;
- compact map HUD;
- atlas canvas;
- small layer switcher;
- selected/current node chip;
- hidden/collapsed details drawer.

Hidden by default:

- full right inspector;
- long lesson copy;
- large context cards;
- author controls;
- repeated metadata blocks.

### Focus Mode

Visible:

- atlas canvas full width;
- tiny HUD;
- zoom/search/current buttons;
- exit focus button;
- tooltip/floating node card.

Hidden:

- left app rail;
- top app context cards;
- right inspector;
- route details;
- secondary controls.

### Learning Mode

Visible:

- atlas canvas;
- compact selected node card;
- primary CTA: `ÐÐ°Ñ‡Ð°Ñ‚ÑŒ Ð·Ð°Ð½ÑÑ‚Ð¸Ðµ`, `ÐŸÑ€Ð¾Ð²ÐµÑ€Ð¸Ñ‚ÑŒ`, `Ð¡Ð»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¹ ÑˆÐ°Ð³`;
- optional right drawer.

### Check Mode

Visible:

- check panel;
- selected node context;
- compact result state;
- map dimmed or kept behind.

### Author Mode

Visible:

- graph/editor controls;
- handles;
- structure tools;
- debug metadata.

Author mode can stay heavier. Learner mode should stay map-first.

## UX Rules

1. The atlas canvas should get the largest share of viewport space.
2. No permanent full right rail in learner map view.
3. The top HUD should be one compact row, not stacked cards.
4. Node details start as tooltip/floating card.
5. Lesson/check opens as drawer or focused panel.
6. Route/current focus lives in a bottom strip or compact overlay.
7. The map should have a single obvious `Ð Ð°Ð·Ð²ÐµÑ€Ð½ÑƒÑ‚ÑŒ ÐºÐ°Ñ€Ñ‚Ñƒ` / `Ð¡Ñ„Ð¾ÐºÑƒÑÐ¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒÑÑ` action.
8. `Esc` or visible close action exits focus/drawer states.
9. Mobile uses bottom sheets, not permanent side rails.
10. Author/debug controls must not appear in learner focus mode.

## Scope

Includes:

- map focus mode;
- compact atlas HUD;
- collapsible right drawer;
- floating node preview card;
- bottom route strip;
- layer switcher cleanup;
- desktop/wide/mobile layout QA.

Excludes:

- changing atlas data model;
- generating new course content;
- new PoE layout algorithm;
- final art pass;
- rewriting lesson/check logic;
- author graph editor redesign.

## Success Criteria

- Atlas is the dominant visual object on desktop.
- User can hide surrounding panels in one action.
- Node tooltip/card replaces constant right-rail reading for exploration.
- Lesson/check details are available but not always visible.
- Current route is easy to find without flattening the map.
- Mobile has a usable map-first flow through bottom sheets.
- Author tools remain available but are clearly separate from learner mode.

## Workstreams

- `planned` - [workstreams/01-layout-rules-and-state-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/01-layout-rules-and-state-model.md)
- `planned` - [workstreams/02-compact-map-hud.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/02-compact-map-hud.md)
- `planned` - [workstreams/03-map-focus-mode.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/03-map-focus-mode.md)
- `planned` - [workstreams/04-inspector-drawer.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/04-inspector-drawer.md)
- `planned` - [workstreams/05-floating-node-card.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/05-floating-node-card.md)
- `planned` - [workstreams/06-bottom-route-strip.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/06-bottom-route-strip.md)
- `planned` - [workstreams/07-mobile-map-first-flow.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/07-mobile-map-first-flow.md)
- `planned` - [workstreams/08-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/34-map-first-atlas-workspace/workstreams/08-browser-qa.md)

## Suggested Sequence

1. Define map workspace state model.
2. Replace stacked map header with compact HUD.
3. Add focus mode.
4. Convert right inspector to drawer/bottom sheet behavior.
5. Add floating node card.
6. Add bottom route strip.
7. Fix mobile map-first flow.
8. Browser QA on `NLH cash` and `Ð‘Ð°ÐºÐ°Ð»Ð°Ð²Ñ€Ð¸Ð°Ñ‚ Ð¿Ð¾ Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð¸ÐºÐµ`.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - wide desktop;
  - mobile `390x844`;
  - `NLH cash` atlas;
  - `Ð‘Ð°ÐºÐ°Ð»Ð°Ð²Ñ€Ð¸Ð°Ñ‚ Ð¿Ð¾ Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð¸ÐºÐµ` atlas;
  - focus mode enter/exit;
  - drawer open/close;
  - node hover/select card;
  - route strip current/next;
  - check flow still reachable;
  - author controls hidden in learner focus mode;
  - console warnings/errors: `0`.
