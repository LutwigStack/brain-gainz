# 02 Today State And Next Step Clarity

## Status

`planned`

## Goal

Make `Today` explain the real campaign state and expose one safe next action, especially when the campaign has content but no active daily work item.

## Scope

- audit the projection path behind `Today` empty/free-mode states
- distinguish truly empty campaign, content-without-day-plan, free mode, route unavailable, active route, and completed route states
- make the top of `Today` task-first
- keep race/city/opponent/pressure as secondary status
- explain why the day is empty without implying data loss
- make the primary CTA safe and specific for each state
- ensure campaign card counts and `Today` state do not contradict each other

## UX Direction

The first screen of `Today` should answer:
- what can I do now?
- why is this the right next action?
- what happens if I press the main button?

If the campaign has nodes/XP but no daily task, the UI should say that the workday is not assembled yet and offer a safe action such as choosing a route, opening the map, or starting from a recommendation.

## Done When

- a campaign with nodes/XP does not show a vague `empty` state
- `Today` displays one dominant next-step block above game/status meters
- no invalid route completion/start CTA is shown as primary
- empty/free-mode/no-route states each have distinct compact UI states
- weak spots and queued actions are secondary but discoverable
- verified mastery and self-marked progress remain visually distinct

## High-Risk Scenarios

- campaign has nodes but no current specialization
- campaign has current specialization but no route nodes
- campaign has route nodes but no valid next item
- campaign has self-marked progress but no verified XP
- campaign card count and `Today` projection disagree

## Suggested Tests

- service tests for each `Today` state projection
- snapshot/model test that campaign counts and `Today` empty reason are compatible
- browser QA for `English foundation` or equivalent non-empty campaign with no route
- browser QA for route active and route incomplete states
