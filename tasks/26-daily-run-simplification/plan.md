# Daily Run Simplification Plan

## Order

1. Fix trust blockers: retry state and leaked expected answers.
2. Simplify Today to one next lesson and one primary CTA.
3. Rework Daily Run queue actions so they do not look like verified mastery.
4. Fix next-step focus/scroll and daily summary clarity.
5. Simplify mobile navigation and map overview.
6. Run browser QA across 3 consecutive lessons.

## Main Risk

Do not remove power-user queue control. Move it out of the default learner path.

## UX Rule

Default daily mode should answer:

- what is my next lesson?
- what do I press?
- what changed after the last result?

Everything else is detail.

## QA Targets

- first lesson fail -> retry -> pass
- second lesson exact check without answer leak
- 3 lesson transitions through `Следующий шаг`
- Today after each transition
- Daily Run queue collapsed and expanded
- `Готово` / repeat semantics
- Daily Run finish summary
- mobile 390px Today, lesson, map overview
- console warnings/errors
