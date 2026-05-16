# 12 Reference Style Game Cockpit

## Status

`planned`

## Goal

Move BrainGainz from a pixel-themed tool UI toward the reference-style RPG command center:
- persistent left navigation
- top campaign / specialization / race / mode context
- `Today` as a rich daily dashboard
- mini knowledge map in the daily surface
- visual race, city, and opponent cards
- reduced frame noise and better mobile adaptation after the desktop cockpit works

## Reference

Primary reference image:

`C:/Users/Andr3y/Downloads/ChatGPT Image 5 мая 2026 г., 13_40_35 (1).png`

Reference qualities to preserve:
- the app reads as a game cockpit, not a generic admin dashboard
- the user always knows current campaign, specialization, race, and mode
- `Today` contains goal, daily tasks, mastery levels, weak spots, map preview, and opponent/race status in one scan
- visual assets carry meaning: campaign icon, race portrait, city image, opponent banner, task/goal icons
- primary, secondary, warning, and destructive states have different visual weight

## Scope

Includes:
- shell layout changes for desktop: left nav, top context bar, right meta rail
- Today dashboard layout modeled after the reference
- daily task cards and mini knowledge map preview
- race/city/opponent visual cards and status model presentation
- visual density polish for frames, badges, meters, and panels
- mobile adaptation after desktop hierarchy is stable
- screenshot-based visual QA against the reference

Excludes:
- changing core mastery/XP economy
- replacing the full map editor
- adding cloud sync
- building a full city simulation
- making final production art for every asset family
- redesigning every secondary screen before Today is coherent

## Product Direction

The main screen should feel like a learning game command center.

Persistent shell answers:
- which campaign am I in?
- what specialization is active?
- what race/persona am I playing?
- am I in career mode or free mode?
- where do I go next?

Today answers:
- what is the main goal?
- what are today's tasks?
- what mastery level am I working toward?
- what is weakening?
- where is this on the knowledge map?
- how am I doing against the race/city/opponent layer?

## Success Criteria

- Desktop shell has a persistent left nav, top context bar, and right Today meta rail.
- `Today` matches the reference information architecture: main goal, daily task cards, mastery row, weak spots, mini knowledge map, race/city/opponent status.
- Daily task cards are scan-friendly and do not read as text rows.
- The mini knowledge map previews the current front without exposing the full editor toolbar.
- Race/city/opponent cards use meaningful visual assets or stable placeholders, not text-only tables.
- Pixel frames are reduced or weighted so primary content is obvious.
- Mobile keeps the same hierarchy in a compact form without sacrificing the working area.
- Browser QA captures reference comparison screenshots and console state.

## Workstreams

- `planned` - [workstreams/01-cockpit-shell-and-context.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/12-reference-style-game-cockpit/workstreams/01-cockpit-shell-and-context.md)
- `planned` - [workstreams/02-today-reference-dashboard.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/12-reference-style-game-cockpit/workstreams/02-today-reference-dashboard.md)
- `planned` - [workstreams/03-mini-knowledge-map-and-daily-tasks.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/12-reference-style-game-cockpit/workstreams/03-mini-knowledge-map-and-daily-tasks.md)
- `planned` - [workstreams/04-race-city-opponent-visual-cards.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/12-reference-style-game-cockpit/workstreams/04-race-city-opponent-visual-cards.md)
- `planned` - [workstreams/05-frame-polish-assets-and-mobile.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/12-reference-style-game-cockpit/workstreams/05-frame-polish-assets-and-mobile.md)
- `planned` - [workstreams/06-reference-cockpit-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/12-reference-style-game-cockpit/workstreams/06-reference-cockpit-qa.md)
