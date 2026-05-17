# 04 Check Prompts And Answers

## Status

`done`

## Goal

Translate check prompts without breaking check logic.

## Scope

- exact prompt text and expected answers
- number prompt text and accepted values
- contains prompt text and accepted fragments
- checklist item text
- manual review prompt text
- AI-assisted prompt/rubric text
- answer hints where shown

## Result

Translated check prompts, checklist items, manual review prompts, AI-assisted prompts, rubrics, and expected summaries in `src/database/cs-bachelor-template-seed.js`.

Exact-answer checks that previously depended on English terms now accept Russian learner answers where appropriate, while still keeping canonical technical spellings for concepts such as Big-O, SQL, ACID, CRUD and NULL.

## Done When

- translated checks are still passable
- exact/contains checks do not accidentally require English unless the concept itself requires it
- tests cover changed checks
