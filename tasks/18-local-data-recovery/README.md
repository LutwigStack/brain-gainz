# 18 Local Data Recovery

## Status

`done`

## Goal

Make old local data safe.

BrainGainz is a local-first app. A real user will keep browser data between builds. If an older local database blocks startup, the app feels broken even when a clean profile works.

This epic fixes the current old-storage failure and adds a recovery path for future schema problems.

## Current Problem

Recent QA had to use a clean browser profile because the existing in-app browser storage failed schema verification around:

`node_barrier_notes.source_event_id`

Clean profiles pass, but that is not enough for a local-first product.

## Scope

Includes:
- reproducing the old local storage failure
- adding a migration or repair path
- adding a user-facing recovery screen when repair is not possible
- preserving user data when possible
- adding tests for old schema/state
- browser QA on dirty and clean profiles

Excludes:
- cloud sync
- account login
- full backup system
- changing the whole storage engine

## Success Criteria

- App starts with the currently failing old local state.
- If repair succeeds, the user lands in the app without data loss.
- If repair cannot be done safely, the user sees clear recovery actions.
- No SQL or schema error is shown as the main user message.
- There is a regression test or fixture for the old broken state.
- QA proves both clean profile and existing local profile.

## Workstreams

- `done` - [workstreams/01-reproduce-old-storage-failure.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/18-local-data-recovery/workstreams/01-reproduce-old-storage-failure.md)
- `done` - [workstreams/02-repair-migration-path.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/18-local-data-recovery/workstreams/02-repair-migration-path.md)
- `done` - [workstreams/03-user-recovery-screen.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/18-local-data-recovery/workstreams/03-user-recovery-screen.md)
- `done` - [workstreams/04-regression-tests.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/18-local-data-recovery/workstreams/04-regression-tests.md)
- `done` - [workstreams/05-browser-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/18-local-data-recovery/workstreams/05-browser-qa.md)
