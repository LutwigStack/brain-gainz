# 28 Campaign Menu Visual Parity

## Status

`completed`

## Goal

Bring the Campaign Menu from "correct structure" to "clear RPG campaign board".

The user should understand the screen by looking first, not by reading every small label. The target is parity with the approved mockup direction: one strong active campaign save slot, a readable showcase of separate campaign templates, and a compact custom campaign workshop.

## Reference

Use the approved Campaign Menu mockup as the composition reference:

- dark RPG dashboard shell
- strong left navigation and top context remain unchanged in this epic
- main content has three numbered zones
- active campaign is a wide hero slot
- ready campaigns are visual cards, not text blocks
- custom creation is a small workshop, not a form page

## Current Gap

The current implementation already has the right order and data model, but still feels flatter than the mockup:

- the `Продолжить обучение` block does not yet feel like the primary save slot
- course cards use generated backgrounds, but the image is too hidden behind text and borders
- the course grid can look unfinished when one template is hidden by an active personal copy
- `Создать свою программу` still reads like a form row
- there are too many similar small frames, badges, and bordered elements
- the screen is understandable, but not yet visually self-explanatory

## Scope

Includes:

- Campaign Menu visual hierarchy
- active campaign hero/save slot
- ready campaign card composition
- placeholder/empty slot behavior in the ready campaign grid
- custom campaign workshop layout
- border/badge/noise reduction on this screen
- desktop and mobile Campaign Menu QA

Excludes:

- changing campaign persistence model
- changing fork/archive business logic
- adding full course content
- redesigning Today, Map, Wind Rose, or the global shell
- generating large new runtime assets unless the current accepted assets cannot support the composition

## Success Criteria

- First viewport clearly answers: continue, start a ready campaign, or create your own.
- `Продолжить обучение` is visually dominant when a personal campaign exists.
- The active campaign hero shows identity, progress, route status, node count, XP, and one primary `Продолжить` action.
- Archive/duplicate/export stay inside secondary `...` actions and never compete with `Продолжить`.
- Ready campaign cards read as separate big campaigns through imagery, title, short type, 1-2 metrics, and a stable CTA.
- Cards do not require reading a paragraph to distinguish campaign types.
- The ready campaign grid does not look broken when some templates are hidden because personal copies exist.
- Custom campaign creation is compact, clearly secondary, and still easy to use.
- Mobile `390x844` has no horizontal overflow and preserves the three-zone story.
- Browser console has no warnings/errors caused by the screen.

## Workstreams

- `done` - [workstreams/01-active-campaign-hero-slot.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/28-campaign-menu-visual-parity/workstreams/01-active-campaign-hero-slot.md)
- `done` - [workstreams/02-ready-campaign-card-composition.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/28-campaign-menu-visual-parity/workstreams/02-ready-campaign-card-composition.md)
- `done` - [workstreams/03-ready-grid-empty-slot.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/28-campaign-menu-visual-parity/workstreams/03-ready-grid-empty-slot.md)
- `done` - [workstreams/04-custom-campaign-workshop.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/28-campaign-menu-visual-parity/workstreams/04-custom-campaign-workshop.md)
- `done` - [workstreams/05-frame-and-badge-noise-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/28-campaign-menu-visual-parity/workstreams/05-frame-and-badge-noise-pass.md)
- `done` - [workstreams/06-mobile-and-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/28-campaign-menu-visual-parity/workstreams/06-mobile-and-browser-qa.md)

## Suggested Sequence

1. Hero slot first. It carries the screen.
2. Ready campaign cards second. They need to read visually, not as text cards.
3. Grid empty/placeholder behavior third. This prevents the showcase from looking broken after fork.
4. Custom workshop fourth. Keep it compact and secondary.
5. Noise pass fifth. Remove extra borders and repeated badges after the layout is stable.
6. Browser QA last on desktop and mobile.

## Test Plan

- `npm run lint`
- `npm run test -- tests/campaign-menu-model.test.js tests/game-asset-manifest.test.js tests/campaigns-stats-xp.test.js`
- `npm run build`
- Browser QA on `http://localhost:5173/`:
  - desktop `1280x900`
  - mobile `390x844`
  - active personal campaign exists
  - no personal campaigns
  - one or more templates hidden by personal copies
  - archived personal copy offers restore
  - console warnings/errors: `0`
