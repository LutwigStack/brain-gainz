# BrainGainz Task System

Тематическая task-система для локальных задач проекта.

## Shared Files

- `context.md`
- `architecture.md`

## Default Topology

- epic: `tasks/brain-gainz/<NN-epic-name>/`
- executable subtask: `tasks/brain-gainz/<NN-epic-name>/subtasks/<NN-subtask-name>/`

## Registry

| Дата | Элемент | Статус | Что сделано |
|------|---------|--------|-------------|
| 2026-04-19 | `00-task-system-bootstrap` | done | Создан локальный task root, перепривязаны `.github` contracts на repo-local paths и включён repo-local task workflow. |
| 2026-04-20 | `01-development-os-adaptation` epic | active | После retro-closeout прошлых волн открыт новый design lane `08-skill-map-constructor-design` для переосмысления `Map` как skill-tree и конструктора системы обучения. |