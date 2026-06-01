# 06 Mobile And Browser QA

## Status

`completed`

## Goal

Verify that the visual parity pass works as a real user screen, not only as a desktop screenshot.

## Scope

- Browser QA for Campaign Menu only
- desktop and mobile viewports
- console warnings/errors
- basic interaction checks

## QA Matrix

Viewports:

- desktop `1280x900`
- wide desktop if available
- mobile `390x844`

States:

- no personal campaigns
- one active personal campaign
- multiple personal programs collapsed under `Другие программы`
- all six ready templates visible
- one template hidden by active personal copy
- archived personal copy offers restore
- all ready templates already added

Interactions:

- `Продолжить` opens selected campaign
- `...` menu does not expose archive as a primary action
- `Начать программу` forks a template
- forked template card disappears from ready grid
- archived copy shows `Восстановить`
- preset fills custom campaign name
- mobile has no horizontal document overflow

Checks:

- console warnings/errors: `0`
- campaign-card images load quickly
- no broken image fallback for accepted campaign-card assets
- text remains Russian on the primary UI surface

## Done When

- QA artifact is written under this epic.
- Screenshots are saved under `tasks/28-campaign-menu-visual-parity/qa/`.
- Any remaining findings are listed with severity and next action.

## Results

- QA artifact: `tasks/28-campaign-menu-visual-parity/campaign-menu-visual-parity-qa.md`
- Raw browser result JSON: `tasks/28-campaign-menu-visual-parity/qa/06-browser-qa-results.json`
- Result: pass, no open findings.
