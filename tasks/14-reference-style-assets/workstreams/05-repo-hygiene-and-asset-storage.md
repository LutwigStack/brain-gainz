# 05 Repo Hygiene And Asset Storage

## Status

`active`

## Goal

Keep the app repository lean while preserving generated asset evidence locally or in an external artifact store.

## Problem

The first asset integration commit accidentally included raw generated candidates and contact sheets under:

`output/generated-assets/reference-style-first-batch/`

That folder is useful for review, but it is not a runtime dependency and is much larger than the accepted app assets.

## Scope

- remove raw generated candidates from git history before pushing
- keep accepted runtime assets in `assets/game/reference-style-first-batch/`
- keep task QA screenshots in `tasks/14-reference-style-assets/qa/`
- preserve local raw candidates on disk when possible
- rely on `.gitignore` for `output/`
- document where raw candidates live if they need to be shared later

## Done When

- `git ls-tree -r HEAD output/generated-assets` returns no tracked raw candidates
- `git status --short --ignored output/generated-assets` confirms local artifacts are ignored
- the rewritten commit still contains accepted runtime assets, manifest, integration code, and QA docs
- app tests/build are not affected by removing raw candidates from git

## Risks

- deleting local candidate files instead of only removing them from git
- leaving manifest references that imply raw candidates are required at runtime
- making future agents regenerate assets unnecessarily because source candidates are not discoverable

## Suggested Verification

- `git status --short`
- `git ls-tree -r --long HEAD output/generated-assets`
- `git ls-tree -r --long HEAD assets/game/reference-style-first-batch`
- `npm run test`
- `npm run lint`
- `npm run build`
