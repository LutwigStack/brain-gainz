# 04 Daily Run Session Loop

## Status

`planned`

## Goal

Create a daily session loop that turns campaign state into a short actionable run of 3-5 tasks.

## Scope

- define Daily Run session states: not started, active, completed, abandoned
- choose tasks from route, weak spots, due checks, and current front
- show start/run/finish surfaces in Today
- record task outcomes
- connect completed tasks to mastery/XP where existing rules allow
- show end-of-run summary
- support failure/skip/defer without treating it as app error

## UX Direction

Daily Run should answer:
- what am I doing in this session?
- how many tasks are in the run?
- what is current, next, locked, or optional?
- what changed when I finished?

## Done When

- user can start a Daily Run from Today
- Daily Run produces 3-5 concrete tasks when enough campaign content exists
- user can complete at least one task
- user can fail/skip/defer at least one task
- finish summary shows progress, XP/mastery effects, and recovery implications
- state survives refresh where appropriate

## High-Risk Scenarios

- not enough tasks available
- no active route
- only weak spots available
- assessment failure during run
- route completion overlaps with run completion

## Suggested Tests

- Daily Run task selection tests
- session state persistence tests
- Today browser smoke for start/complete/finish
