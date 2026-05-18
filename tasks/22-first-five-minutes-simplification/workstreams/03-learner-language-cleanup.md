# 03 Learner Language Cleanup

## Status

`done`

## Goal

Remove internal terms from learner-facing surfaces.

## Words To Replace Or Hide

- `инспектор`
- `фокус`
- `фронт маршрута`
- `попытки` when it means an internal attempt log
- raw authoring/check metadata terms
- raw route/debug labels that do not help learning

## Scope

- scan learner mode UI text
- replace internal terms with compact learning terms
- keep technical detail behind author mode or details disclosure
- update tests that assert user-facing copy

## Suggested Replacements

- `инспектор` -> `Занятие` or `Детали`
- `фокус` -> `Текущий шаг`
- `фронт маршрута` -> `Следующий шаг`
- `попытки` -> `История проверки` or hide until needed

## Done When

- first learner path contains no internal primary labels
- map overview and check flow read like study UI, not editor UI
- copy still fits mobile
