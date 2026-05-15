# Workstream 05: Assessment And Validation Model

## Goal

Define how real learning checks produce mastery and XP.

## Scope

Includes:
- assessment task model
- strict check types
- LLM-assisted check types
- evidence records for submitted answers
- mastery update rules from checks

Excludes:
- full exercise authoring suite
- automatic textbook answer extraction
- online judge / code runner
- replacing strict checks with LLM checks

## Check Types

Strict checks:
- multiple choice
- exact text / formula
- numeric answer with tolerance
- multi-answer set
- known answer from exercise source

LLM-assisted checks:
- explain concept
- compare ideas
- short proof sketch
- interpretation
- "why does this work?"

Rule:
- If a task can be checked strictly, do not rely on LLM-only pass/fail.

## Evidence Model

Use explicit assessment attempts. Each submitted check should store:
- attempt id
- campaign id
- specialization id, if applicable
- node id
- task id
- answer type
- submitted answer
- check method
- pass/fail or score
- compact feedback
- idempotency key
- created_at

## Evidence To Mastery To XP Contract

Recommended concepts:
- `assessment_attempts`
- `mastery_events`
- task 08 XP ledger grants

Flow:
1. User submits an assessment attempt.
2. Attempt is checked strictly or with LLM assistance according to task type.
3. Passed attempt can create one mastery event for the target node and mastery level.
4. Mastery event can create or reactivate one XP grant when XP rules say it should.

Idempotency:
- repeated submit / retry of the same attempt must not create duplicate mastery or XP
- unique key should include campaign, node, task, target mastery level, and attempt/source id
- a new attempt can exist, but it should not duplicate an already active mastery event for the same node and level unless product explicitly supports improving score history

Progress gate:
- `seen` can be created from reading/inspect action
- mastery above `seen` requires passed evidence or explicit legacy migration
- strict-checkable tasks cannot pass through LLM-only checking
- arbitrary UI clicks must not grant mastery above `seen`

## Mastery Update Rules

Examples:
- reading action can advance to `seen`
- explanation pass can advance to `understood`
- recall pass can advance to `remembered`
- solved task can advance to `applied`
- mini-test can advance to `confirmed`
- later repetition can advance or preserve `retained`

## Done When

- Assessment records can be created.
- Strict checks and LLM-assisted checks are represented separately.
- Mastery updates come from assessment evidence, not arbitrary UI clicks.
- Mastery above `seen` requires passed evidence or legacy migration.
- Repeated submissions cannot create duplicate XP without a new valid mastery event.
