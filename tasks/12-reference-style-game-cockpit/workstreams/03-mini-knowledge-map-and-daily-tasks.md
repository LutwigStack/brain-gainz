# 03 Mini Knowledge Map And Daily Tasks

## Status

`planned`

## Goal

Replace text-heavy queue presentation with compact daily task cards and a mini knowledge map preview.

## Scope

- design daily task cards with order, title, status, progress, and action
- represent locked/future/additional tasks without making them look broken
- embed a mini knowledge map preview in Today
- show current front / selected route / weak spot relation in the mini map
- keep the mini map non-destructive: no archive/connect/create toolbar inside Today
- provide a clear path from mini map to full map
- keep full map editor behavior unchanged

## UX Direction

Daily tasks should scan like the reference row:
- numbered order
- task name
- visual cue or icon
- progress meter or result
- locked/future state when applicable

Mini map should answer:
- where is today's work in the graph?
- what is my front?
- how do I open the full map?

## Done When

- Today queue is no longer primarily text paragraphs
- task cards show at least current/next/locked states
- mini map preview renders without editor controls
- mini map has a clear `Open map` action
- mini map remains readable at `1280x900`
- mobile either hides/collapses preview or presents it without breaking the page

## High-Risk Scenarios

- only one task exists
- many route items exist
- locked additional task
- large graph source
- full map editor state changes after opening from preview

## Suggested Tests

- unit tests for daily card view model
- browser QA for Today daily task cards
- browser QA for mini map -> full map navigation
- screenshot QA for non-destructive mini map state
