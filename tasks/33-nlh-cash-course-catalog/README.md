# 33 NLH Cash Course Catalog

## Status

`done`

## Goal

Define the top-level course catalog for the `NLH cash` campaign.

This campaign teaches No-Limit Hold'em cash games as a structured decision-making discipline:

- risk and bankroll;
- poker math;
- preflop ranges;
- postflop streets;
- 3-bet/4-bet pots;
- exploit adjustments;
- GTO/solver basics;
- hand review and study routine.

Lower atomic nodes are intentionally out of scope for this epic.

## Product Rule

`NLH cash` is an educational campaign, not gambling promotion.

Main surface copy should emphasize:

- risk control;
- disciplined study;
- bankroll safety;
- decision quality;
- review and learning;
- responsible play boundaries.

Do not frame the campaign as:

- guaranteed profit;
- easy money;
- casino excitement;
- "beat everyone fast";
- gambling encouragement.

## Why This Epic Exists

The first template for `NLH cash` should not be a flat list of poker tips.

It needs a course-level structure that can later become:

> region -> course/hub -> topic nodes -> atomic spots/checks.

This epic defines the upper structure only.

## Target Structure

Use 10 regions:

1. `Вход и безопасность`
2. `Базовая математика`
3. `Preflop-ядро`
4. `Flop: single-raised pots`
5. `Turn`
6. `River`
7. `3-bet / 4-bet pots`
8. `Exploit и игра против поля`
9. `GTO, солверы и упрощения`
10. `Профессиональная рутина`

Use the canonical course list from:

- [course-catalog.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/course-catalog.md)

## Campaign Identity

Suggested learner-facing framing:

- name: `NLH cash`
- subtitle: `Стратегия кэш-игры No-Limit Hold'em`
- tone: analytical, disciplined, risk-aware
- player fantasy: build a decision engine, not chase luck

## Course Object Rules

Each course should have:

- stable key;
- Russian title;
- region;
- short learner-facing description;
- level: `foundation`, `core`, `intermediate`, `advanced`, `routine`;
- recommended order;
- prerequisite course keys;
- infrastructure object candidate flag;
- atlas hub type;
- risk note when relevant;
- rough size bucket: `small`, `medium`, `large`, `capstone`.

## Safety / Risk Guardrails

The campaign should include explicit guardrails:

- bankroll management before strategy escalation;
- stop-loss/session boundaries before advanced exploit work;
- variance/sample-size education before result interpretation;
- tilt control before high-pressure review;
- no claims of guaranteed income.

If future UI shows progress/XP, it must not imply financial performance.

## Scope

Includes:

- canonical top-level course catalog;
- region grouping;
- course prerequisites;
- suggested learning sequence;
- infrastructure object mapping;
- risk/safety copy rules;
- seed/data implementation plan;
- QA rules for campaign visibility.

Excludes:

- hand-by-hand spot library;
- solver chart generation;
- downloadable ranges;
- atomic hand nodes;
- real-money tracking;
- casino or gambling integrations;
- bankroll accounting tool;
- personalized financial advice.

## Success Criteria

- `NLH cash` feels like a serious study campaign.
- The first visible structure is risk-aware and educational.
- Course hubs are clear and not mixed with random tips.
- Preflop/postflop/GTO/exploit/routine are separated cleanly.
- The course order prevents jumping straight into advanced plays without bankroll/math basics.
- Future agents can expand any course into spots/checks without guessing the top-level structure.

## Workstreams

- `done` - [workstreams/01-catalog-source-review.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/01-catalog-source-review.md)
- `done` - [workstreams/02-region-and-course-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/02-region-and-course-model.md)
- `done` - [workstreams/03-prerequisite-course-graph.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/03-prerequisite-course-graph.md)
- `done` - [workstreams/04-learning-sequence.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/04-learning-sequence.md)
- `done` - [workstreams/05-infrastructure-object-mapping.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/05-infrastructure-object-mapping.md)
- `done` - [workstreams/06-risk-and-copy-guardrails.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/06-risk-and-copy-guardrails.md)
- `done` - [workstreams/07-seed-and-data-plan.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/07-seed-and-data-plan.md)
- `done` - [workstreams/08-atlas-integration-contract.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/08-atlas-integration-contract.md)
- `done` - [workstreams/09-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/33-nlh-cash-course-catalog/workstreams/09-browser-qa.md)

## Suggested Sequence

1. Confirm the canonical course list and responsible framing.
2. Define course data model and stable keys.
3. Build prerequisite graph between courses.
4. Draft learning sequence.
5. Map courses to infrastructure objects/atlas hubs.
6. Add safety/copy guardrails.
7. Plan seed/data implementation without atomic spots.
8. Define atlas integration contract.
9. Browser QA after implementation.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - campaign menu shows `NLH cash`;
  - course catalog is visible as campaign structure;
  - risk/bankroll region appears before advanced strategy;
  - course hubs/cards do not look like atomic poker tips;
  - no real-money tracking or gambling-promo copy appears;
  - no lower spot spam is generated in this epic;
  - mobile `390x844`;
  - console warnings/errors: `0`.
