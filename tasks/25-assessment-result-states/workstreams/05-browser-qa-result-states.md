# 05 Browser QA Result States

## Status

`done`

## Goal

Verify post-check states in real browser use.

## Scope

- run or reuse dev server
- do not kill unrelated processes
- test desktop and 390px mobile
- open first CS lesson
- save failed attempt
- verify retry state
- pass the check
- verify success state and next step
- inspect console warnings/errors

## Output

Create:

`tasks/25-assessment-result-states/result-states-qa.md`

## Done When

- QA states whether result states are immediately understandable
- screenshots cover desktop/mobile failed and passed results
- tests, lint, and build pass

## Notes

- QA report: `tasks/25-assessment-result-states/result-states-qa.md`.
- Screenshots: `tasks/25-assessment-result-states/qa/05-desktop-failed-result.png`, `tasks/25-assessment-result-states/qa/05-desktop-passed-result.png`, `tasks/25-assessment-result-states/qa/05-mobile-390-failed-result.png`, `tasks/25-assessment-result-states/qa/05-mobile-390-passed-result.png`.
- Desktop and 390px mobile both pass fail -> retry -> pass -> next-step flow with empty console warnings/errors.
