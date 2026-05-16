# 05 Weak Spot Recovery Loop

## Status

`planned`

## Goal

Turn weak spots into a clear recovery loop that feeds Today and Daily Run.

## Scope

- define weak spot inputs from stale, failed, self-marked, or low-mastery nodes
- show weak spots as recoverable learning items, not errors
- generate recovery tasks for Daily Run
- allow repeat/retry actions
- show recovery effect after a successful attempt
- make retention/decay understandable without punishing language

## UX Direction

Weak spots should feel like:
- topics to reinforce
- opportunities for retention XP
- normal part of learning

They should not feel like app failures.

## Done When

- weak spots appear for realistic CS campaign states
- Today shows weak spots compactly
- Daily Run can include recovery tasks
- recovery completion updates visible state
- failed assessment can create or maintain a weak spot
- copy avoids blame/punishment language

## High-Risk Scenarios

- weak spot list is empty in all realistic test states
- weak spots duplicate regular route tasks confusingly
- failure looks like a technical error
- recovery has no visible payoff

## Suggested Tests

- weak spot selection tests
- failed assessment -> weak spot test
- recovery task completion test
- browser QA with CS campaign
