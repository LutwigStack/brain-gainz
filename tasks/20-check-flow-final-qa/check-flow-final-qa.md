# Check Flow Final QA

## Summary

Status: `done`

Browser target: `http://127.0.0.1:5174/`

Viewport coverage:
- Desktop: 1674x1225.
- Mobile: 390x844.

Console coverage:
- Browser console only showed the standard React DevTools development info message during reload.

## Code Fixes From QA

- Local strict feedback summaries are now Russian for exact, number, contains, and checklist checks.
- Nodes without authored criteria now default to manual strict checks instead of AI-assisted checks.
- Manual and AI-assisted selections now persist after saving a failed or passed attempt.

## Browser Matrix

| Path | Node | Browser result | Evidence |
| --- | --- | --- | --- |
| checklist strict | Среда программирования | Disabled state explains that at least one checklist item is needed. Failed attempt says progress and XP did not change and lists missing checklist items in Russian. | `output/playwright/task-20-check-flow-final-qa/checklist-failed-russian.png`, `output/playwright/task-20-check-flow-final-qa/mobile-checklist-disabled-failed.png` |
| exact strict | Значения, переменные и типы | Empty answer disables the action. Wrong answer saves a failed attempt without XP. Correct answer saves confirmed progress. | `output/playwright/task-20-check-flow-final-qa/exact-ready-desktop.png`, `output/playwright/task-20-check-flow-final-qa/exact-failed-desktop.png`, `output/playwright/task-20-check-flow-final-qa/exact-passed-progress.png` |
| number strict | Выражения и операторы | Correct numeric answer saves confirmed progress and shows the Russian range success summary. | `output/playwright/task-20-check-flow-final-qa/number-passed-desktop.png` |
| contains strict | Ветвления и условия | Empty answer disables the action. Answer with required terms saves confirmed progress and shows the Russian required-elements success summary. | `output/playwright/task-20-check-flow-final-qa/contains-passed-desktop.png` |
| manual strict | Высказывания и логика | Missing evidence disables confirmed progress. Failed attempt can be saved without XP. Adding verification evidence enables and saves confirmed progress. | `output/playwright/task-20-check-flow-final-qa/manual-disabled-fixed.png`, `output/playwright/task-20-check-flow-final-qa/manual-failed-attempt.png`, `output/playwright/task-20-check-flow-final-qa/manual-passed-progress.png` |
| AI-assisted | Кванторы | Missing answer/evidence disables both saved outcomes. Answer-only saves a failed AI attempt without XP. Adding an AI verification note saves confirmed progress. | `output/playwright/task-20-check-flow-final-qa/ai-disabled-desktop.png`, `output/playwright/task-20-check-flow-final-qa/ai-failed-attempt.png`, `output/playwright/task-20-check-flow-final-qa/ai-passed-progress.png`, `output/playwright/task-20-check-flow-final-qa/mobile-ai-check-flow.png` |

## Mobile Notes

- `document.documentElement.scrollWidth` was `375` at a `390` px viewport, so there was no document-level horizontal overflow.
- The AI-assisted full-page mobile screenshot kept inputs, helper text, result copy, and action buttons inside the viewport.
- The checklist mobile screenshot kept the failed attempt result readable and kept the primary action in the same check panel.

## Remaining Issues

None found in this QA pass.

## Verification

- `npm run test`: pass, 191/191.
- `npm run lint`: pass.
- `npm run build`: pass.
