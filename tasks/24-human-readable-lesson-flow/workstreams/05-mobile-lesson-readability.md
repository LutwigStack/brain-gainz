# 05 Mobile Lesson Readability

## Status

`done`

## Goal

Make the lesson easy to read on 390px mobile.

## Scope

- inspect header height
- inspect task and criteria wrapping
- keep the main action reachable
- reduce stacked metadata blocks
- verify failed and passed result states
- avoid horizontal overflow

## Done When

- mobile lesson shows task and criteria without excessive scrolling
- action and result are readable
- no document-level horizontal overflow

## QA Notes

- checked the focused lesson at 390x844
- task, criteria, main action, and secondary actions fit without document-level horizontal overflow
- failed attempt state is reachable from the learner UI and shows the result in the lesson flow
- passed checklist state shows the result and keeps the next-step button readable
- screenshot: `tasks/24-human-readable-lesson-flow/qa/05-mobile-lesson-pass-390.png`
