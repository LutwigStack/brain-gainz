# 06 UX Copy And Empty States

## Status

`done`

## Goal

Replace confusing empty states and button labels with short action-first Russian copy.

Do not fix unclear UI by adding paragraphs. Prefer clear layout, visible state, and one compact instruction.

## Scope

- Campaign Menu empty and selected states
- Today no route / no task / completed day states
- check disabled states
- check failed and passed states
- map no selection / locked node / completed node states
- author mode entry warnings
- destructive action confirmations

## Done When

- empty states say what to do next
- disabled actions say one clear reason
- failed checks do not look like app errors
- destructive actions are clearly named and confirmed
- Russian copy is short enough for mobile

## Implementation Notes

- Campaign cards now use action-first buttons like `Продолжить`, `Посмотреть`, and `Архивировать`.
- Today empty/completed/no-route states use short labels, one compact reason, and one clear CTA.
- Check validation, failed attempt, and result copy is shorter and separates `Не зачтено` from app errors.
- Learner map and inspector empty states now point to the next action instead of only saying what is missing.
