# 09 Browser QA

## Status

`done`

## Goal

Verify that the course catalog appears as a clear bachelor-level structure.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open campaign menu;
- start/open `Бакалавриат по информатике`;
- inspect program/course structure;
- verify regions are readable;
- verify course hubs/cards are visible;
- verify old low-level template nodes are not visible on the main learner surface;
- verify no new atomic node spam was added;
- verify existing route/current focus still works;
- verify existing lesson/check flow still works.

## Checks

- course catalog feels like a real CS bachelor;
- regions are not a flat text list if surfaced in UI;
- course names are Russian;
- course count and keys are stable;
- no duplicate courses after reload/bootstrap;
- old low-level CS template nodes do not reappear after reload/bootstrap;
- mobile has no horizontal overflow;
- console warnings/errors: `0`.

## Done When

- QA artifact exists under this epic.
- Findings are severity-ranked with fix recommendations.
