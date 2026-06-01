# 03 Today One Next Lesson

## Status

`done`

## Goal

Make Today stay simple after several lessons.

## Problem

After 2-3 steps, Today shows the next lesson plus a large Daily Run control surface. The user starts managing status buttons instead of continuing to study.

## Scope

- keep one next lesson as the main hero
- keep one primary CTA
- collapse task list by default after lesson results
- show compact daily progress such as `2 из 4` without exposing every action
- keep weak spots visible only when they are the intended next step

## Done When

- Today after each `Следующий шаг` still has one obvious next lesson
- queue details are available but secondary
- screenshots show less visual noise on desktop and mobile

## Implementation Notes

- Active Daily Run details stay open before the first result, then collapse after progress is recorded.
- The collapsed Today summary now shows compact neutral progress such as `1/4 разобрано`.
- The main Today hero remains the single visible next lesson and primary CTA after `Следующий шаг`.

## Verification

- `node --test tests/today-priority-layout.test.js tests/today-dashboard-model.test.js tests/mode-boundary.test.js tests/assessment-copy.test.js`
- Browser smoke: pass first CS lesson, click `Следующий шаг`, verify Today shows one hero CTA and Daily Run details are collapsed.
- Screenshots:
  - [../qa/03-today-one-next-lesson-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/qa/03-today-one-next-lesson-desktop.png)
  - [../qa/03-today-one-next-lesson-mobile.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/qa/03-today-one-next-lesson-mobile.png)
