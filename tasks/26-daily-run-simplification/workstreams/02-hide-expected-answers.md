# 02 Hide Expected Answers

## Status

`done`

## Goal

Stop learner UI from revealing correct answers.

## Problem

Exact checks can show copy like:

`Введите ответ, который должен совпасть: 5`

This breaks the learning value of the check.

## Scope

- inspect exact/number/contains/checklist/manual/AI learner copy
- remove expected answers from learner-facing prompts
- keep expected answers available in author/debug surfaces
- show only answer format, not the solution
- add regression tests for learner copy

## Done When

- exact checks do not reveal the correct answer in learner mode
- author mode still exposes enough information to edit the check
- browser QA verifies the second CS lesson

## Implementation Notes

- Learner lesson copy now shows only answer format for exact, number, and contains checks.
- Learner answer fields now use neutral labels and helper text instead of verification mechanics.
- Learner failed feedback for contains checks no longer reveals missing required terms.
- Author mode still shows expected values and required terms in the check details.
- The learner criteria disclosure no longer opens just because an expected answer exists.

## Verification

- `node --test tests/assessment-copy.test.js tests/mode-boundary.test.js tests/career-knowledge-graph.test.js`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser smoke: second CS lesson does not show `должен совпасть: 5` or `Ожидаемый результат: 5`; console has no warnings/errors.
- Screenshot: [../qa/02-second-cs-lesson-no-answer-leak-mobile.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/qa/02-second-cs-lesson-no-answer-leak-mobile.png)
