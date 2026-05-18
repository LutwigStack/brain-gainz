# 06 Browser QA Human Readable Lesson

## Status

`done`

## Goal

Verify that the lesson now reads like a learner-facing screen.

## Scope

- run or reuse dev server
- do not kill unrelated processes
- test desktop and 390px mobile
- start from CS campaign Today
- open first lesson
- save failed attempt
- pass the check
- follow next step
- inspect console warnings/errors
- capture screenshots where useful

## Output

Create:

`tasks/24-human-readable-lesson-flow/human-readable-lesson-qa.md`

## Done When

- QA states whether the lesson copy and layout are understandable
- remaining technical terms are listed
- screenshots cover desktop and mobile lesson states
- tests, lint, and build pass

## QA Notes

- report: `tasks/24-human-readable-lesson-flow/human-readable-lesson-qa.md`
- desktop and 390px mobile both pass the open -> failed attempt -> passed attempt -> next step loop
- console warning/error check was clean in both viewports
