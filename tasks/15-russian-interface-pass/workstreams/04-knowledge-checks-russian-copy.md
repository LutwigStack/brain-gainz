# 04 Knowledge Checks Russian Copy

## Status

`done`

## Goal

Translate the knowledge check flow while preserving precise meaning.

## Scope

- check type labels
- answer field labels
- validation messages
- attempt result states
- disabled button reasons
- evidence/result/verdict user-facing replacements
- check authoring labels in author mode

## Done When

- learner-facing check flow uses Russian labels
- technical terms do not leak into the main learner surface
- author mode can still distinguish exact answer, number, contains, checklist, manual review, and AI-assisted review
- tests covering check copy are updated

## Suggested Tests

- existing assessment copy tests
- browser QA check flow for at least three check types
- `npm run test`
- `npm run lint`
- `npm run build`
