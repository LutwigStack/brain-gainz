# 03 Opponent XP And Pressure

## Status

`done`

## Goal

Implement one understandable opponent XP system.

Opponent XP should make pressure visible, but it must not feel like arbitrary punishment.

## Scope

- daily opponent turn resolution
- immediate XP events from failed/ignored defense
- current pressure/momentum state
- reason strings for UI
- XP caps and missed-day caps

## Rules

Use [mechanics.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/29-knowledge-city-control-mvp/mechanics.md) as the source of truth.

Minimum rules:

- base daily pressure is small;
- weak/contested nodes add pressure;
- failed assessment gives immediate opponent XP;
- recovery pass reduces current pressure;
- opponent XP is cumulative;
- current object pressure is reducible;
- max missed-day simulation is capped at 7 days.

## Done When

- Opponent XP has a visible reason trail.
- Player can push back pressure in one session.
- A week of ignored weak spots creates visible pressure.
- One missed day does not create panic.
- Tests cover daily caps, archived campaigns, templates, failed assessment XP, and recovery pressure reduction.
