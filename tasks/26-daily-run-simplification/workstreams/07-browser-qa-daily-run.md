# 07 Browser QA Daily Run

## Status

`done`

## Goal

Verify daily use after the first lesson.

## Scope

- run or reuse dev server
- do not kill unrelated processes
- test desktop and 390px mobile
- create/use CS learner campaign
- complete at least 3 lesson/result/next transitions
- test failed retry state
- test exact check without answer leak
- test Daily Run queue collapsed and expanded
- test map overview on mobile
- inspect console warnings/errors

## Output

Create:

`tasks/26-daily-run-simplification/daily-run-simplification-qa.md`

## Done When

- QA states whether daily use feels fast, obvious, and minimal
- open findings are listed by severity
- screenshots cover desktop and mobile
- tests, lint, and build pass

## QA Result

Pass. Daily use is fast enough for the simplified loop: Today keeps one main CTA, queue controls stay secondary, retry resets to a new attempt, and mobile map starts with current/next orientation before the canvas.

Open findings: none.

See `tasks/26-daily-run-simplification/daily-run-simplification-qa.md`.
