# 03 Today Primary Work Loop

## Status

`planned`

## Goal

Turn `Today` from a dense status dashboard into the primary daily work surface.

## Scope

- promote current specialization / mode and next node
- show one primary next action above secondary game/status panels
- make `Проверить`, `На карту`, `В маршрут`, and `Завершить` mutually clear
- prevent dangerous route CTAs for empty or incomplete routes
- make weak spots and queued actions visible after the primary action
- differentiate self-marked progress from verified mastery / XP
- compact race/city/opponent/pressure into support status

## UX Direction

The top of `Today` should answer:
- what should I do next?
- why this item?
- what button should I press?
- what progress will count as verified?

The race/city/opponent layer should support motivation without crowding the primary work item.

## Done When

- next node / task is visible without scrolling on desktop
- empty route state does not show a misleading primary route CTA
- verified progress is visually distinct from self-marked progress
- weak spots and queued actions are visible but secondary
- race/city/opponent panels no longer read like a dry table
- empty state leads to a concrete next action

## High-Risk Scenarios

- campaign has no specialization
- campaign has specialization but no route nodes
- campaign has route nodes but no valid next item
- user is in Free Mode
- user has self-marked progress but no verified XP



## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
