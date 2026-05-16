# Plan

## Intent

Stop testing BrainGainz only on tiny demo states. Build a realistic but bounded `Computer Science Bachelor` campaign and use it as the main product testbed for Daily Run, map, mastery, assessment, recovery, and authoring surfaces.

## Delivery Order

1. Curriculum scope and campaign shape
2. Campaign template seed and fork flow
3. First playable CS slice
4. Daily Run session loop
5. Weak spot recovery loop
6. Learner vs author mode boundary
7. CS campaign QA and balance

## First Usable Slice

The first usable slice is not the full bachelor curriculum.

It is:
- a `Computer Science Bachelor` template visible in Campaign Menu
- a fork/open path into a personal campaign
- 30-60 meaningful nodes across 4-6 branches
- one main specialization route
- several checks using existing assessment types
- enough data for Today, Map, Wind Rose, and Daily Run to feel real

## Curriculum Fidelity Rule

The campaign should be plausible, not exhaustive.

Use common CS bachelor concepts:
- programming fundamentals
- discrete math
- data structures
- algorithms
- computer systems
- databases
- software engineering
- networks
- operating systems
- AI/ML intro
- security
- capstone

Avoid pretending that the first slice is a complete accredited degree.

## Technical Direction

- Prefer a seed/import fixture that can be rerun idempotently.
- Keep template data separate from personal campaign progress.
- Preserve campaign scope boundaries.
- Use existing node/check/mastery/route schemas where possible.
- Add schema only if the daily/session mechanics genuinely need it.
- Make QA reset/recreate the CS campaign without manual database surgery.

## Product Direction

The CS campaign should reveal product problems quickly:
- if Today is unclear, the Daily Run should expose it
- if the map overview is weak, a 50-node graph should show it
- if assessment copy is too technical, CS checks should make that obvious
- if author fields leak into learner mode, the course authoring path should catch it

## Risks

- overbuilding curriculum content instead of product mechanics
- seeding too many nodes before the UI can handle them
- mixing template progress with personal campaign progress
- making Daily Run a static checklist instead of a stateful session
- hiding authoring fields so deeply that campaign authors cannot work

## QA Gate

Before closing:
- create/open/fork CS campaign
- start Daily Run
- complete one task
- fail one assessment attempt
- trigger weak spot/recovery
- open full map overview
- inspect check authoring in author mode
- verify learner mode hides technical authoring details
- run `npm run test`, `npm run lint`, `npm run build`
- document screenshots and balance notes
