# 04 Daily Queue Action Model

## Status

`done`

## Goal

Make Daily Run actions trustworthy and unambiguous.

## Problems

- `Готово` can look like verified mastery without a check.
- `Еще раз` sounds like repeat now, but can move the task into repeat-later state.
- Many actions compete on one card.

## Scope

- define allowed actions for the default learner path
- rename actions by real outcome
- ensure verified mastery/XP only comes from verified checks
- move queue management actions into menu or expanded detail
- clarify finish/close day summary

## Suggested Direction

- primary path: `Открыть занятие`
- secondary: `Отложить`, `Повторить позже`, `Убрать из набора`
- avoid `Готово` unless it truly means verified completion

## Done When

- learner cannot mistake queue management for verified learning
- each card has one primary action
- Daily Run finish summary has one clear status

## Implementation Notes

- Current Daily Run task cards now expose one primary action: `Открыть занятие`.
- Queue management actions moved behind `Действия набора`: `Повторить позже`, `Отложить`, `Убрать из набора`.
- Manual `Готово`/`Еще раз` controls are no longer shown in the Daily Run queue.
- Resolved task labels and finish summary use queue language, not verified mastery language.

## Verification

- `node --test tests/today-priority-layout.test.js tests/today-dashboard-model.test.js tests/now-service.test.js tests/mode-boundary.test.js`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser smoke: active Daily Run shows `Открыть занятие` as the one primary card action; queue actions are under `Действия набора`; no visible `Готово`, `Еще раз`, or `Завершить`.
- Screenshots:
  - [../qa/04-daily-queue-actions-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/qa/04-daily-queue-actions-desktop.png)
  - [../qa/04-daily-queue-actions-mobile.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/qa/04-daily-queue-actions-mobile.png)
