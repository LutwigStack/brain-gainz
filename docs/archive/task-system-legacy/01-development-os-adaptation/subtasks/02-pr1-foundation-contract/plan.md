# Plan: PR1 Foundation Contract

## Project Goal

Transform BrainGainz into a local-first development OS with a trustworthy migration path from legacy cards into a node-centered model.

## Task Goal

Produce a PR1-ready additive data contract covering tables, enums, relationships, invariants, and legacy migration seams.

## Implementation Checklist

- [x] Define PR1 scope boundary.
- [x] Define entity inventory and enum set.
- [x] Define physical tables and key constraints.
- [x] Define migration seams for legacy `subjects` and `cards`.
- [x] Define repository/store split for PR1.

## Validation Checklist

- [x] Contract stays additive-first.
- [x] Legacy tables remain untouched in PR1.
- [x] PR1 contract does not leak PR2 recommendation formulas into schema shape.

## Rollout/Rollback Checklist

- [x] Documentation-only subtask; no runtime rollout needed.
- [x] If contract changes later, epic plan and subtask docs must be updated together.

## Deferred Ideas / Not Tested Here

- SQL migration text and repository implementation are deferred to implementation subtasks.
- Review profile strictness and action size enum strictness remain follow-up design questions.