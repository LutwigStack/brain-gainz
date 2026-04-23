# 01 TypeScript Foundation

## Status

`active`

## Goal

Перевести frontend surface на `TypeScript`, не ломая текущий web app.

## Why

`TypeScript` нужен как база перед выделением `src/game/` и дальнейшей multiplatform-адаптацией:
- безопаснее контракты между app shell и game shell;
- понятнее platform adapters;
- меньше хаоса при росте модели узлов, квестов и состояний карты.

## Scope

- `tsconfig`;
- миграция ключевых frontend entry points;
- базовые shared types;
- постепенный перенос React surface на `.ts/.tsx`.

## Done When

- проект собирается на `TypeScript`;
- основные app-shell контракты типизированы;
- дальнейший вынос `src/game/` можно делать без слепого рефакторинга.
