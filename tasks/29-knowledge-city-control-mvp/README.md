# 29 Knowledge City Control MVP

## Status

`planned`

## Goal

Make one central game mechanic work across the app:

> The campaign is a knowledge city. The player captures and holds city objects through verified knowledge. One opponent tries to gain influence over weak and neglected parts of the map.

This epic should align Campaign Menu, Today, Map, Inspector, Assessment, and Wind Rose around one understandable loop before adding more mechanics such as bosses, seasons, economy, or multiple opponents.

## Core Mechanic

The first MVP is not a full strategy game. It is a control layer over the existing learning system.

- Campaign = city.
- Branch/course = infrastructure object.
- Knowledge node = controllable section of an object.
- Verified mastery = player control.
- Self-marked progress = scouting, not control.
- Stale mastery = weakened control.
- Weak spot / failed attempt = contested control.
- Recovery / review / assessment = action to restore or strengthen control.
- Opponent XP = opponent influence gained from unresolved weak zones, time pressure, and failed defenses.

## Why This Epic Exists

The app currently has many useful systems, but they can feel like separate screens:

- Campaign Menu chooses a course.
- Today shows daily work.
- Map shows graph structure.
- Assessment checks answers.
- Wind Rose shows stats.

This epic makes them speak one language:

- `Что я контролирую?`
- `Что ослабло?`
- `Где соперник давит?`
- `Что нужно сделать следующим ходом?`

## Single Opponent

MVP includes exactly one opponent per personal campaign.

Working name:

- `Corvus AI` for CS-style campaigns.
- Generic fallback: `Соперник`.

The opponent does not erase learning progress. It creates pressure and visible contested states:

- gains XP/influence from neglected weak zones;
- targets one object at a time;
- makes weak spots feel like map pressure;
- turns repeat checks into defense actions;
- can be pushed back through verified work.

## Scope

Includes:

- one campaign-scoped opponent model
- opponent XP / influence rules
- derived city object/control states
- Today command-center copy and layout hooks
- Map control overlay states
- Inspector control state summary
- Assessment/review outcome copy as defense/retention
- Wind Rose strategic control overview
- migration/test coverage
- browser QA for one real campaign

Excludes:

- multiple opponents
- full boss battle implementation
- city economy/buildings
- combat animations
- random events
- online/remote competition
- punishing offline loss of real progress
- large new asset generation unless a placeholder is unusable

## Success Criteria

- A user can explain the game in one sentence: `Я удерживаю город знаний, а соперник давит на слабые места`.
- Today shows one important object/front, one opponent pressure reason, and one next action.
- Map visually distinguishes controlled, weakened, contested, and unclaimed nodes.
- Assessment pass/fail explains control outcome, not technical verifier state.
- Wind Rose shows which objects are strong, weak, or under pressure.
- Opponent XP has clear reasons and does not feel arbitrary.
- Offline time cannot create a demotivating death spiral.
- Existing learning mechanics still work without extra clicks.

## Workstreams

- `planned` - [workstreams/01-control-and-opponent-domain.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/01-control-and-opponent-domain.md)
- `planned` - [workstreams/02-city-object-mapping.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/02-city-object-mapping.md)
- `planned` - [workstreams/03-opponent-xp-and-pressure.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/03-opponent-xp-and-pressure.md)
- `planned` - [workstreams/04-today-command-center.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/04-today-command-center.md)
- `planned` - [workstreams/05-map-control-overlay.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/05-map-control-overlay.md)
- `planned` - [workstreams/06-inspector-and-assessment-control-copy.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/06-inspector-and-assessment-control-copy.md)
- `planned` - [workstreams/07-wind-rose-strategy-view.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/07-wind-rose-strategy-view.md)
- `planned` - [workstreams/08-tuning-and-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/workstreams/08-tuning-and-browser-qa.md)

## Suggested Sequence

1. Domain rules and derived control states.
2. City object mapping for existing campaign structures.
3. Opponent XP/pressure resolution.
4. Today as the daily command center.
5. Map overlay states.
6. Inspector and assessment copy.
7. Wind Rose strategy overview.
8. Tuning and browser QA.

## Test Plan

- Unit tests for control state derivation.
- Unit tests for opponent daily turn resolution and XP caps.
- Store tests for migrations and persistence.
- Existing campaign tests must continue passing.
- Browser QA on `Бакалавриат по информатике`:
  - fresh route
  - verified node
  - stale/weak node
  - failed assessment
  - recovery pass
  - mobile `390x844`
  - console warnings/errors: `0`
