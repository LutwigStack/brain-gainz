# 02 Mastery Labels

## Status

`planned`

## Goal

Add the six visible labels (`Понял`, `Запомнил`, `Применил`, `Закрепил`, `Связал`, `Освоил`) to the mastery self-report chips in the right `Занятие` panel, and add the helper line that explains the choice.

## Why This Matters

Today the panel shows six numeric chips (`1 2 3 4 5 6`) with no labels. The learner has to guess what each step means, which is the opposite of self-report. The labels and the helper turn the row into a usable instrument.

## Scope

- the new file `src/components/galaxy/mastery-steps.ts` exporting the `masterySteps` array;
- the `mastery` block inside the right `Занятие` panel in `NavigationView.tsx`;
- the helper text under the chips.

## Requirements

### Data

- `masterySteps` is a `readonly` array of six entries, in the order `Понял, Запомнил, Применил, Закрепил, Связал, Освоил`;
- each entry has `{ id: number; label: string; meaning: string }`;
- the `id` is the integer that the existing store already uses (so that the existing `setMastery(id)` call still works);
- the `meaning` is the one-line explanation from the epic README.

### UI

- each chip shows the `label` centered in the chip, in the existing 12px text style;
- the active chip is filled with the current sphere's `strong` token; the others use `surface-muted`;
- hovering a chip shows a small tooltip with the chip's `meaning`;
- the helper line under the row reads `Отметь шаг, который точно отражает твоё состояние. Менять можно в любой момент.` in the existing 12px secondary text style.

## Out Of Scope

- Adding more than six steps (out of scope);
- Letting the learner write a free-form note in addition to the chip (out of scope);
- Recoloring the chips per sphere (the active chip already uses the sphere color; the rest stay neutral).

## Implementation Hints

- The chip's `aria-label` should be `${label} - ${meaning}` for screen readers.
- The tooltip can be a small `title` attribute on the chip element; no tooltip library is needed.
- The active state should be computed from the existing `navigationFocus.mastery` field.

## Done When

- The six chips have visible labels matching the table in the epic README.
- The helper line is visible under the row.
- Clicking a chip still calls the existing `setMastery(id)` and the active state updates.
- Hovering a chip shows a tooltip with the `meaning`.
- The accessible name of each chip is `${label} - ${meaning}`.
