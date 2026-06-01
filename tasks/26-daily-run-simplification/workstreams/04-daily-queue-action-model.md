# 04 Daily Queue Action Model

## Status

`planned`

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
