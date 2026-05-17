# 02 Campaign Route And Stage Text

## Status

`done`

## Goal

Translate the main CS campaign structure.

## Scope

- campaign title and subtitle
- specialization title
- route title
- route stage names
- stat and branch names
- Wind Rose branch summaries
- Today route labels

## Result

Translated the CS campaign structure in `src/database/cs-bachelor-template-seed.js`:

- campaign and sphere: "Бакалавриат по информатике"
- specialization: "Основы информатики"
- domain: "Информатика"
- stages: "Основы программирования", "Дискретная математика", "Структуры данных", "Алгоритмы", "Базы данных"
- Wind Rose stats and branch summaries

## Done When

- Campaign Menu, top context, Today, Wind Rose, and route overview no longer show English course structure text
- tests pass
