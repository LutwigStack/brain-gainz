# 04 Asset QA And Iteration

## Status

`done`

## Goal

Verify that generated assets improve comprehension in the current product UI.

## Scope

- run browser QA on the CS campaign
- compare before/after screenshots where possible
- test desktop `1280x900`
- test mobile `390x844`
- inspect console for broken asset warnings/errors
- check visual hierarchy against the reference
- record what to keep, revise, or remove

## QA Questions

- Does Today communicate the main goal faster?
- Are race/city/opponent cards more readable than text cards?
- Do Daily Run task icons help distinguish task types?
- Are mastery icons distinct without needing explanatory text?
- Does mini map/route overview gain identity without clutter?
- Are assets too large on mobile?
- Is any image misleading about actual progress state?

## Output

Create:

`tasks/14-reference-style-assets/asset-qa.md`

Include:
- commit hash
- dev server URL
- screenshots
- console warnings/errors
- pass/fail table
- top visual regressions
- keep/revise/remove list

## Done When

- QA artifact is current
- major issues are filed as follow-up task notes
- accepted assets are ready to become the baseline for future campaign asset packs
