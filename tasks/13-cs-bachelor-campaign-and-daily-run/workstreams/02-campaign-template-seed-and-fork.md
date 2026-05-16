# 02 Campaign Template Seed And Fork

## Status

`planned`

## Goal

Make `Computer Science Bachelor` available as a reusable campaign template that can be opened or forked into a personal campaign.

## Scope

- inspect existing campaign seed/template infrastructure
- add an idempotent CS bachelor campaign template or fixture
- keep template data separate from personal campaign progress
- expose the template in Campaign Menu with clear template/user distinction
- support fork/copy into a user campaign if the app already has the required model
- document how to reset/recreate the fixture for QA

## UX Direction

The user should understand:
- this is a template
- opening it is safe for inspection
- forking/copying creates a personal learning campaign
- progress belongs to the personal campaign, not the template

## Done When

- CS bachelor template appears in Campaign Menu
- seeding is idempotent
- template campaign has no accidental learner progress
- personal fork/open path is clear
- campaign counts are stable after reload
- QA can recreate the template without manual DB edits

## High-Risk Scenarios

- duplicate template on repeated seed
- progress written into template instead of personal campaign
- archived/restored campaign confusion
- Campaign Menu becomes noisy with system templates

## Suggested Tests

- seed idempotency test
- template vs personal campaign scope test
- Campaign Menu browser smoke

## QA Reset / Recreate Path

The `Computer Science Bachelor` template is seeded by the normal database bootstrap. It is keyed by campaign slug `template-cs-bachelor`, so rerunning bootstrap or restarting the app after migrations re-upserts the same template instead of creating a duplicate.

For a clean QA recreate without manual row-by-row edits:

1. Delete the local app database (`braingainz.db`) or reset the test database.
2. Start the app or run the test bootstrap path.
3. Open Campaign Menu and verify one `Computer Science Bachelor` entry under reusable templates.
4. Click `Use template` to create a personal user campaign. Progress, sessions, attempts, XP, and mastery rows should be created only against the personal campaign.

Do not QA by editing progress rows on `template-cs-bachelor`; template campaigns are read-only in learner/progress flows and should be inspected or forked.
