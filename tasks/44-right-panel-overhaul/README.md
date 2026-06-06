# 44 Right Panel Overhaul

## Status

`planned`

## Goal

Reduce the right `Занятие` panel to the three blocks the learner actually needs: a compact status header, the action the panel exists to drive (`Начать занятие` / `Продолжить`), and the mastery self-report. Drop the redundant blocks. Add visible labels to the six mastery steps (Понял / Запомнил / Применил / Закрепил / Связал / Освоил).

## Why This Epic Exists

The right panel currently carries six blocks in one column (visible on `output/current-02-map-overview.png`):

- `Режим ученика` with a one-line description;
- the `Обзор / Изучать` tab switch;
- a `Прогресс узла` row that duplicates information already shown in the canvas;
- a `Учебный путь` block that duplicates the breadcrumb at the top of the canvas;
- a giant `Начать занятие` button;
- an `Освоение` block with six numeric chips (`1 2 3 4 5 6`) and no labels.

The panel takes 28% of the horizontal space and is hard to scan. Three blocks would do, and the chips need labels so the learner can pick a mastery level without guessing.

## Product Direction

- the panel has three blocks, top to bottom: `status`, `action`, `mastery`;
- the `status` block shows the current node title, its sphere tag, and a single status word (`Старт` / `В работе` / `Готово`);
- the `action` block is one primary button and one secondary button. The primary is `Начать занятие` (or `Продолжить` if the lesson is in progress). The secondary is `К следующему узлу`, hidden if there is no next node;
- the `mastery` block is the six self-report steps with visible labels and a one-line helper that explains what each step means;
- the panel is collapsible on mobile (epic 38 territory, but the epic leaves the data hooks ready).

## Visual Targets

### Status block

- node title in the existing `text-emphasis` style, 16px;
- sphere tag below, in the sphere's `default` token color, 12px;
- status word on the right, in the existing `accent` color, 12px uppercase;
- total height ~64px.

### Action block

- primary button: full width of the panel, 40px tall, in the existing `accent` style;
- secondary button: full width below the primary, 32px tall, in the existing `secondary` style;
- the two buttons are 8px apart.

### Mastery block

- a single row of six chips, each chip is 56px wide, 56px tall, with the label inside;
- the chip's background is the existing `surface-muted`; the active chip uses the sphere's `strong` token;
- a small helper line under the row: `Отметь шаг, который точно отражает твоё состояние. Менять можно в любой момент.`;
- the helper uses the secondary text style (epic 45 will sweep contrast).

## Scope

Includes:

- the right `Занятие` panel inside `NavigationView.tsx` (the block that lives next to the canvas);
- the `masterySteps` data source (a new constant under `src/components/galaxy/mastery-steps.ts`);
- the panel collapse hook on mobile (state only, no UI yet - epic 38 picks up the UI).

Excludes:

- The `Настройки` modal (out of scope);
- The `Прогресс` view's right column (out of scope; that view is a different panel);
- Changing the labels of the six steps (the labels are fixed by this epic, see below).

## Mastery Step Labels

The six steps are: `Понял`, `Запомнил`, `Применил`, `Закрепил`, `Связал`, `Освоил`. This is the order, fixed in this epic.

| Step | Label | One-line meaning |
|---|---|---|
| 1 | `Понял` | Я прочитал и могу пересказать тему. |
| 2 | `Запомнил` | Я помню ключевые определения без подсказки. |
| 3 | `Применил` | Я решил задачу на эту тему. |
| 4 | `Закрепил` | Я решил ещё одну задачу через неделю. |
| 5 | `Связал` | Я вижу, как тема стыкуется с соседними. |
| 6 | `Освоил` | Я могу объяснить тему другому. |

## Success Criteria

- The right panel has exactly three blocks.
- Each mastery step has a visible label, a one-line meaning, and a chip.
- The labels match the table above.
- The panel is the same width as today; the height is shorter because two blocks are gone.
- No regression in the existing actions (`Начать занятие`, `К текущему`, `К следующему`).

## Workstreams

- `planned` - [workstreams/01-panel-cleanup.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/44-right-panel-overhaul/workstreams/01-panel-cleanup.md)
- `planned` - [workstreams/02-mastery-labels.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/44-right-panel-overhaul/workstreams/02-mastery-labels.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/44-right-panel-overhaul/workstreams/03-verify.md)

## Suggested Sequence

1. Drop the redundant blocks and re-shape the panel to three sections.
2. Add the six mastery steps with labels and helper text.
3. Verify the panel and the actions.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900` and mobile `390x844`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - confirm the panel has three blocks;
  - click each mastery step and confirm the chip highlights;
  - click `Начать занятие` and confirm it still triggers the daily-run flow;
  - console warnings/errors: `0`.
- Snapshot tests:
  - the mastery steps data source matches the table in this epic;
  - the panel snapshot shows the three blocks.
