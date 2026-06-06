# 03 Infrastructure Object Mapping

## Status

`done`

## Goal

Map selected CS bachelor containers to infrastructure objects.

## Scope

- object display model
- object names and descriptions
- control/progress summary hooks
- route/map transition target

## Requirements

- Infrastructure object = course / large module container.
- Atomic mind-map nodes stay inside the object.
- Use CS bachelor as first calibration set.
- Object names should be user-facing and game-readable, but not lore-heavy.
- Descriptions should explain educational meaning, not just fantasy flavor.

## Initial CS Mapping

- `Основы программирования` -> `Мастерская кода`
- `Дискретная математика` -> `Башня логики`
- `Структуры данных` -> `Архив структур`
- `Алгоритмы` -> `Навигационный центр`
- `Базы данных` -> `Городское хранилище`
- `Отладка и тестирование` -> `Ремонтный док`
- `Математическая запись` -> `Зал доказательств`
- `Модель памяти` -> `Механический цех`

## Done When

- City placeholder can render infrastructure objects from real CS content.
- Mind-map can open the selected object.
- Folder layer can show the same object identity.
- Naming is consistent across layers.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
