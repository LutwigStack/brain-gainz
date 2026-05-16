# 02 Today Reference Dashboard

## Status

`planned`

## Goal

Rebuild `Today` as a reference-style daily dashboard with a clear goal, daily tasks, mastery row, weak spots, mini map area, and right meta rail.

## Scope

- convert Today from stacked text panels into a dashboard grid
- create a main goal card with current target, progress, and primary CTA
- create a daily tasks section with compact task cards
- create a mastery levels row with visual progress for each level
- create weak spots section with repeat/recover actions
- reserve a mini knowledge map section for workstream 03
- reserve a right meta rail for race/city/opponent from workstream 04
- keep empty/free/no-route states understandable inside the new layout

## UX Direction

Today should be the first real screen of play.

The first scan should show:
- main goal
- progress
- continue/check CTA
- today's tasks
- mastery ladder
- weakening topics
- map front
- race/city/opponent status

## Done When

- `Today` visually resembles the reference information architecture
- main goal card dominates the top center
- daily tasks are cards, not paragraph rows
- mastery row is a clear visual ladder
- weak spots are visible without reading a long summary paragraph
- empty states still point to a safe next action
- right rail and mini map slots exist even if later workstreams fill them fully

## High-Risk Scenarios

- no daily tasks
- one recommendation only
- active route with several items
- no active route
- weak spots present
- verified and self-marked progress both present

## Suggested Tests

- projection/model tests for dashboard sections
- browser screenshot QA for Today with system template
- browser screenshot QA for a personal populated campaign if available
