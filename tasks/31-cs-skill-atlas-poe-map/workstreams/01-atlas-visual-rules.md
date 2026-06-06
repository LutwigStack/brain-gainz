# 01 Atlas Visual Rules

## Status

`done`

## Goal

Define the visual rules for a Path-of-Exile-like CS skill atlas without copying Path of Exile assets.

## Scope

- circular atlas composition
- zoom level expectations
- node scale hierarchy
- link style hierarchy
- text/tooltip rules
- learner vs author visual boundary

## Requirements

- Use [skill-atlas-rules.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/31-cs-skill-atlas-poe-map/skill-atlas-rules.md) as source of truth.
- No long labels inside normal nodes.
- Domain and course hubs remain recognizable from far/mid zoom.
- Atomic nodes can be tiny but must have clear state.
- The map should feel dense and intentional, not scattered.
- Keep style compatible with current dark RPG shell.

## Deliverables

- visual rule document updates if needed;
- rough wireframe or screenshot mock if useful;
- CSS/token notes for node sizes, states, links, and tooltip.

## Done When

- Agents have enough visual rules to implement without inventing a new style.
- The target is clearly "large circular skill atlas", not "linear route map".



## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
