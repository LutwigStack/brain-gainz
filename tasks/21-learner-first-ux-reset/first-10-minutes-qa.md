# First 10 Minutes Browser QA

## Result

A new learner can complete the first learning loop:

`Campaign Menu -> choose CS campaign -> Today -> lesson -> check -> fail -> retry -> pass -> result`

The first loop is usable on desktop and mobile. Follow-up fixes now make the successful check complete the matching Daily Run task, start the Today primary lesson/check directly when possible, and remove author-mode wording from the learner map overview.

## Environment

- Desktop viewport: `1280x900`
- Mobile viewport: `390x844`
- Clean browser origins:
  - desktop: `http://127.0.0.1:5199`
  - mobile: `http://127.0.0.1:5200`
- Dev servers were started on separate ports; no unrelated processes were killed.
- Browser console warnings/errors: none captured.

## Findings

Follow-up status: the P2 and both P3 findings below were fixed after this QA pass.

### [P2] "Следующий шаг" returns to Today, but Today still leads with the completed lesson

After passing the first check, the result panel shows "Зачтено" and offers "Следующий шаг". Clicking it returns to Today. Today does show the route front has advanced to "Значения, переменные и типы", but the hero still says:

`Потренировать: Среда программирования`

It also shows the existing session as still running. For a new learner this weakens the promised handoff from result to next step: the user just passed "Среда программирования", clicks "Следующий шаг", and sees the same lesson as the main goal again.

Expected: after a passed check, the next-step handoff should make the next node/action the obvious primary action, or clearly explain that the learner must finish/close the current session before moving on.

### [P3] Today primary action opens the lesson on the map before the focused check

From Today, "Начать занятие" opens the learner map/lesson inspector first. The focused check starts after clicking a second "Начать занятие" inside the inspector.

This still completes the intended path, but it adds one extra transition between Today and the check flow. If the product rule is "one obvious primary action", the copy and handoff should make it clear that the first click opens the lesson, and the second starts the check.

### [P3] Learner map hides authoring tools, but still names author mode

No learner-visible editor controls were found in map/check QA:

- no "Свободный канвас"
- no "Слои"
- no "Инструменты"
- no "Создать рядом"
- no destructive node controls

The global "Настраиваю" mode switch and helper copy about editing are still visible in learner mode. That is not the same as exposing author tools, but it is still author-facing language during the first learner path.

## Passed Checks

- Campaign Menu clean state has a clear template path for "Бакалавриат по информатике".
- Taking the CS template lands on Today in learner mode.
- Today has a clear primary "Начать занятие" action.
- The first lesson opens from Today and has a learner-facing inspector.
- Focused check opens with checklist criteria and one primary "Проверить ответ" action.
- Failing with an incomplete checklist saves the attempt, shows "Не зачтено", and does not award XP.
- Passing with all checklist items selected shows "Зачтено", updates verified mastery to "Подтвердил", and awards XP.
- Map overview opens as a progress overview and does not expose editor/destructive tools.
- Mobile 390x844 can take the template, open Today, open map overview, and open the focused check.

## Screenshots

- `tasks/21-learner-first-ux-reset/qa/07-desktop-01-campaign-menu.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-02-today.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-03-lesson-map.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-04-check-ready.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-05-check-fail.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-06-check-pass.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-07-next-step.png`
- `tasks/21-learner-first-ux-reset/qa/07-desktop-08-map-overview.png`
- `tasks/21-learner-first-ux-reset/qa/07-mobile-01-campaign-menu.png`
- `tasks/21-learner-first-ux-reset/qa/07-mobile-02-today.png`
- `tasks/21-learner-first-ux-reset/qa/07-mobile-03-map.png`
- `tasks/21-learner-first-ux-reset/qa/07-mobile-04-check.png`
