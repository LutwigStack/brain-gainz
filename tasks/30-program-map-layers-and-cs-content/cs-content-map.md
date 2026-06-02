# CS Content Map

## Status

`done`

## Scope

Calibration target: `Бакалавриат по информатике`.

This audit keeps the current seed content intact and defines the first map projection over it. The goal is not to rewrite the whole program, but to make the hierarchy readable enough for:

- city object -> object mind-map -> atomic node;
- visual folders over the same structure;
- current route focus opening the right object.

## Current Structure Summary

The current CS bachelor seed is sufficient for the MVP:

- 1 program sphere;
- 1 major direction;
- 8 coherent skill containers;
- 86 atomic learning nodes;
- route stages already cover the first part of the program.

The app should treat the route as progress/focus metadata, not as the hierarchy source. Folder structure and city objects come from the program projection.

## Proposed Domains

The first CS seed has one broad domain: core computer science foundations.

For future expansion this can split into:

- programming and software practice;
- discrete mathematics and formal reasoning;
- data structures and algorithms;
- systems and memory;
- databases and data handling;
- testing and debugging.

The current MVP can keep the broad domain and expose the 8 skill containers as infrastructure objects.

## Infrastructure Objects

The deterministic MVP object mapping is:

| Source container | City object | Role |
| --- | --- | --- |
| Основы программирования | Мастерская кода | infrastructure object |
| Дискретная математика | Башня логики | infrastructure object |
| Структуры данных | Архив структур | infrastructure object |
| Алгоритмы | Навигационный центр | infrastructure object |
| Базы данных | Городское хранилище | infrastructure object |
| Отладка и тестирование | Ремонтный док | infrastructure object |
| Математическая запись | Зал доказательств | infrastructure object |
| Модель памяти | Механический цех | infrastructure object |

Each object is a selected container, not a leaf node. Its child nodes remain topics/atomic nodes inside the object mind-map and folders layer.

## Example Atomic Nodes

The projection should preserve atomic descendants under their source object. Examples by object:

- Мастерская кода: variables, expressions, branches, loops, functions, simple practice checks.
- Башня логики: propositions, sets, relations, proof steps, graph basics.
- Архив структур: arrays, stack, queue, tree, hash table, graph tradeoffs.
- Навигационный центр: search, sorting, complexity, greedy choices, dynamic programming basics.
- Городское хранилище: tables, keys, queries, indexes, transactions.
- Ремонтный док: debugging loop, tests, failing cases, regression checks.
- Зал доказательств: notation, quantifiers, induction, invariants.
- Механический цех: values, references, allocation, lifetime, mutation.

## Gaps

- Route stages currently exercise only part of the 8-object structure.
- There is no manual override table for object naming or object inclusion yet.
- City art is intentionally a placeholder. The projection must be stable before final illustrated city work.
- Folder icons are visual placeholders; they should later reuse program/card asset identity.

## Implementation Recommendation

Use `ProgramHierarchyEntry[]` as the shared source of truth for:

- parent/child folder navigation;
- selected infrastructure object;
- object-scoped mind-map filtering;
- city object cards;
- Today/current-route object focus.

Keep graph edges as enrichment for mind-map layout and prerequisites only. They should not redefine folder parentage or object ownership.
