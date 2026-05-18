# First Five Minutes QA

Date: 2026-05-18

## Summary

Status: pass. The P2 checklist failed-attempt finding was fixed and rechecked.

The first learner loop is understandable: choose CS campaign template, land on Today, start the first lesson, complete the checklist check, and follow "Следующий шаг" to the next lesson. Desktop and 390px mobile both keep author mode out of the first path, and no document-level horizontal overflow was observed.

## Flow Covered

- Opened a clean browser origin on a local Vite dev server.
- Chose "Бакалавриат по информатике" template.
- Started the first lesson from Today.
- Saved an incomplete checklist as a failed attempt with "Не получилось" and verified it recorded "Не зачтено" without XP/progress.
- Passed the checklist check by marking all 3 required items.
- Clicked "Следующий шаг" and verified Today moved to "Значения, переменные и типы".
- Opened map overview as a secondary action.
- Rechecked the post-pass Today state at 390px.

## Findings

No open findings after the fix.

Resolved during follow-up: the first strict checklist now exposes "Не получилось" even when no checklist items are selected. Clicking it saves a failed attempt, shows "Не зачтено", and leaves progress/XP unchanged. After that, marking all required checklist items still passes the check and "Следующий шаг" advances to "Значения, переменные и типы".

## Verification Notes

- Desktop Today: main CTA visible, no "Настраиваю" or author wording in the first path.
- Desktop check: checklist is readable, failed attempt records "Не зачтено", pass path records "Зачтено" and shows "Следующий шаг".
- Desktop next step: Today moves to the next lesson after pass.
- Desktop map overview: reachable as secondary action; no create/edit/inspector controls visible.
- Mobile 390px: header height measured at about 82px, main CTA top about 353px after first pass, no horizontal overflow.
- Console warnings/errors: none captured during desktop or mobile QA.

## Screenshots

- `qa/desktop-01-campaigns.png`
- `qa/desktop-02-today.png`
- `qa/desktop-03-check-initial.png`
- `qa/desktop-04-check-ready.png`
- `qa/desktop-05-check-passed.png`
- `qa/desktop-06-next-step.png`
- `qa/desktop-07-map-overview.png`
- `qa/mobile-01-campaigns.png`
- `qa/mobile-02-today-next.png`
