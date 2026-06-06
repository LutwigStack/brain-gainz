# 03 Verify

## Status

`planned`

## Goal

Confirm that the documentation is consistent with the cosmic direction and that a new contributor can pick up the project without reading the legacy terms.

## Inputs

- a fresh clone of the project (the verifier uses `git clone` or the equivalent);
- a fresh checkout of the `README.md` and the `docs/` directory.

## Scenarios

- a verifier with no prior context reads the root `README.md` and writes a one-paragraph description of the project;
- the verifier then opens `docs/ux-review-prompt.md` and confirms that the language matches the cosmic direction;
- the verifier then opens an older task (e.g. `tasks/29-knowledge-city-control-mvp/README.md`) and confirms the `Legacy naming` section explains the migration.

## Checks

- the `Концепция` section exists in the `README.md` and is under 30 lines;
- the section links to epics 40, 47, and 48;
- `rg -i "atlas|city|poe" docs/` returns 0 hits except in the documented sections;
- `rg -i "Ат|Город" tasks/01-39` (legacy epics only; the new epics 40-48 are excluded because they necessarily contain these terms outside a formal `Legacy naming` section) returns 0 hits except in the documented sections;
- the `knowledge-city-control` module has the deprecation note;
- the new contributor's one-paragraph description mentions the galaxy metaphor and the `Карта знаний`.

## Done When

- QA artifact under `qa/` with the new contributor's one-paragraph description and the verifier's notes.
- The documentation is consistent with the cosmic direction.
- `npm run lint`, `npm run test`, and `npm run build` still pass (no code changes in this epic, but the build verifies the deprecation note did not break anything).
