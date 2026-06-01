# Daily Run Simplification QA

Date: 2026-06-01

## Result

Pass.

Daily use after the first lesson is understandable: Today keeps one main next action, the Daily Run queue stays secondary, retry starts a clean attempt, and the mobile map opens with current/next route orientation before the canvas.

## Coverage

- Desktop Daily Run after 3 lesson/result/next transitions.
- 390px Today navigation.
- 390px lesson/check screen.
- 390px learner map overview.
- Failed exact attempt -> retry -> passed exact attempt.
- Exact check copy did not show `должен совпасть`, `expected_answer`, or the expected answer as a verifier hint.
- Daily Run queue checked collapsed and expanded.
- Fresh console smoke after reload: no new warnings or errors.

## Flow Notes

1. Continued the personal CS bachelor learner campaign.
2. Completed exact check `Значения, переменные и типы`:
   - first submitted wrong answer `4`;
   - saw retry state;
   - clicked `Попробовать еще раз`;
   - submitted `5`;
   - clicked `Следующий шаг`.
3. Completed number check `Выражения и операторы` with `14`, then `Следующий шаг`.
4. Completed contains check `Ветвления и условия`:
   - first failed with wording missing the exact required term;
   - retried;
   - passed with text containing `условие` and `истина`;
   - clicked `Следующий шаг`.
5. Confirmed Today returned to one main state: `Набор готов` / `Закрыть набор`.
6. Closed the set and checked the next lesson plus mobile map overview.

## Screenshots

- `qa/07-desktop-after-3-transitions.png`
- `qa/06-mobile-today-nav.png`
- `qa/06-mobile-lesson.png`
- `qa/06-mobile-map-overview.png`
- `qa/07-mobile-map-overview.png`

## Findings

None.

## Checks

- `node --test tests/mobile-navigation-priority.test.js tests/today-priority-layout.test.js tests/today-dashboard-model.test.js tests/now-service.test.js tests/campaigns-stats-xp.test.js tests/mode-boundary.test.js tests/assessment-copy.test.js`
- `npm run lint`
- `npm run build`
- `git diff --check`
