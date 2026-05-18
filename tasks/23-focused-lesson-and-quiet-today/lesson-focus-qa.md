# Lesson Focus QA

Date: 2026-05-18

## Summary

Status: pass.

The first learner loop is understandable and visually focused on the lesson: choose the CS campaign template, land on Today, start the first lesson, save a failed checklist attempt, pass the checklist, follow "Следующий шаг", and open the map as a secondary path. Desktop and 390px mobile both keep the lesson/check as the main screen during the attempt and result states.

## Flow Covered

- Desktop viewport: 1280x720 on a clean local browser origin.
- Mobile viewport: 390x844 on a clean local browser origin.
- Chose "Бакалавриат по информатике" from templates.
- Opened Today and started "Среда программирования".
- Saved "Не получилось" with no checklist items selected.
- Verified "Не зачтено" records a failed attempt without progress.
- Marked all 3 checklist items and clicked "Проверить ответ".
- Verified "Зачтено", XP/progress update, and "Следующий шаг".
- Clicked "Следующий шаг" and verified Today advances to "Значения, переменные и типы".
- Opened "Обзор карты" only after the core loop as a secondary path.
- Checked console warnings/errors: none captured.

## Findings

No open findings after the follow-up fix.

Resolved during follow-up: after passing "Среда программирования" and advancing Today to "Значения, переменные и типы", opening "Обзор карты" now selects "Значения, переменные и типы" in the detail panel instead of keeping the completed lesson selected.

## Verification Notes

- Today: main lesson and CTA are first, secondary blocks do not compete with the current action.
- Lesson/check: the map is not the dominant neighbor; the check owns the main screen.
- Failed attempt: "Не получилось" is available with an empty checklist and records "Не зачтено".
- Success result: "Зачтено" and "Следующий шаг" are visible after all required checklist items are selected.
- Next step: Today advances to the next lesson instead of returning to the completed lesson.
- Map secondary path: route overview and detail panel both point at the new current lesson after "Следующий шаг".
- Mobile: compact top navigation has readable labels and the current CTA remains reachable without horizontal overflow.

## Screenshots

- `qa/05-desktop-01-today.png`
- `qa/05-desktop-02-lesson.png`
- `qa/05-desktop-03-failed-result.png`
- `qa/05-desktop-04-success-result.png`
- `qa/05-desktop-05-next-step-today.png`
- `qa/05-desktop-06-map-secondary.png`
- `qa/05-mobile-01-today.png`
- `qa/05-mobile-02-lesson.png`
- `qa/05-mobile-03-failed-result.png`
- `qa/05-mobile-04-success-result.png`
- `qa/05-mobile-05-next-step-today.png`
- `qa/05-mobile-06-map-secondary.png`

## Checks

- `node --test` - 209 passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- `git diff --check` - passed with CRLF warnings only.
- Follow-up browser recheck: desktop Today -> lesson -> fail -> pass -> next step -> map selected "Значения, переменные и типы"; console warnings/errors empty.
