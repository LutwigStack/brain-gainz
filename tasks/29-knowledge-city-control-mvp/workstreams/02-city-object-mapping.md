# 02 City Object Mapping

## Status

`planned`

## Goal

Map existing campaign structures to city objects without redesigning the content model.

## Scope

- object mapping helpers
- object display names
- object summary data
- CS bachelor object labels as first reference

## Requirements

- Prefer `skill` as city object.
- Fall back to `direction` or `sphere` for small campaigns.
- Keep route stages usable as display grouping.
- Add user-facing object names where existing branch names are too dry.
- Avoid adding a new authoring UI in this epic.

## Example Mapping For CS Bachelor

- `Основы программирования` -> `Мастерская кода`
- `Дискретная математика` -> `Башня логики`
- `Структуры данных` -> `Архив структур`
- `Алгоритмы` -> `Навигационный центр`
- `Базы данных` -> `Городское хранилище`
- `Отладка и тестирование` -> `Ремонтный док`
- `Математическая запись` -> `Зал доказательств`
- `Модель памяти` -> `Механический цех`

## Done When

- Control snapshots expose object-level data.
- Today, Map, and Wind Rose can all refer to the same object identity.
- No screen invents a different label for the same branch.
