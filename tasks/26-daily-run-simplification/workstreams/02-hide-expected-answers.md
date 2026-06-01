# 02 Hide Expected Answers

## Status

`planned`

## Goal

Stop learner UI from revealing correct answers.

## Problem

Exact checks can show copy like:

`Введите ответ, который должен совпасть: 5`

This breaks the learning value of the check.

## Scope

- inspect exact/number/contains/checklist/manual/AI learner copy
- remove expected answers from learner-facing prompts
- keep expected answers available in author/debug surfaces
- show only answer format, not the solution
- add regression tests for learner copy

## Done When

- exact checks do not reveal the correct answer in learner mode
- author mode still exposes enough information to edit the check
- browser QA verifies the second CS lesson
