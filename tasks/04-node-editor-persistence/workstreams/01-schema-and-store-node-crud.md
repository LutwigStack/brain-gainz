# 01 Schema And Store Node CRUD

## Status

`done`

## Goal

Добавить в data layer реальные persisted операции для узлов:
- create
- update
- archive
- duplicate

## Scope

- schema changes, если текущих полей недостаточно
- store methods для CRUD по узлу
- duplicate flow с копированием нужных editor полей
- archive semantics на уровне storage
- тесты на store и schema invariants

## Done When

- store умеет читать и писать editor поля узла
- duplicate и archive работают без UI слоя
- tests подтверждают schema contract и mutation behavior
