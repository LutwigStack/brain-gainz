# 09 Browser QA

## Status

`done`

## Goal

Verify that `NLH cash` appears as a serious course-level campaign.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open campaign menu;
- start/open `NLH cash`;
- inspect campaign/course structure;
- verify regions are readable;
- verify risk/bankroll is visible before advanced strategy;
- verify course hubs/cards are visible;
- verify no atomic hand spot spam was added;
- verify no gambling-promo copy appears.

## Checks

- `NLH cash` feels like an educational strategy campaign;
- course names are Russian where practical;
- poker terms are used consistently;
- course count and keys are stable;
- no duplicate courses after reload/bootstrap;
- no real-money tracking UI appears;
- mobile has no horizontal overflow;
- console warnings/errors: `0`.

## Done When

- QA artifact exists under this epic.
- Findings are severity-ranked with fix recommendations.
