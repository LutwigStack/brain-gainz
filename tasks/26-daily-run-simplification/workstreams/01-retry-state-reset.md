# 01 Retry State Reset

## Status

`done`

## Goal

Make retry feel like a new attempt, not a mixed old/new state.

## Problem

After `Попробовать еще раз`, the old `Не зачтено` result can remain visible beside the new editable attempt. Users see both states and cannot tell what is active.

## Scope

- clear primary result-state when retry starts
- show old failed result only as compact history/detail if needed
- show checklist readiness honestly, such as `Осталось отметить 2 условия`
- do not enable or highlight `Проверить ответ` as “ready” when criteria are incomplete unless the product intentionally allows saving another failed attempt

## Done When

- retry screen has one active state
- no old failed result competes with the new form
- mobile retry is clear and compact
- tests cover retry state where practical

## Notes

- `Попробовать еще раз` now clears the in-progress answer/checklist draft and starts a fresh retry surface.
- The old failed result card is not rendered while retrying; the header shows `Новая попытка`.
- Checklist readiness now reports how many required points remain and keeps `Проверить ответ` disabled until all required points are marked.
- Focused tests cover the retry history guard and checklist readiness copy.
