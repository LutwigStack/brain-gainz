# 09 Browser QA

## Status

`done`

## Scope

NLH cash course catalog implementation smoke:

- campaign menu visibility;
- template seed shape;
- fork behavior;
- course-level structure only;
- responsible copy guardrails;
- browser smoke on the current local dev server.
- shared skill atlas path for the NLH catalog knowledge map.

## Result

Pass.

## Findings

No severity-ranked findings in the implemented scope.

## Residual Risk

Mobile `390x844` was not re-run in this pass because the in-app browser does not expose viewport control and this repo runtime does not have a local Playwright package installed. Desktop/fresh-origin smoke passed.

## Notes

- `template-nlh-cash` now seeds as a dedicated course catalog with 10 regions and 72 course hubs.
- The previous 5-node demo structure is archived on reseed and no longer competes with the catalog.
- Course metadata uses `kind: "nlh_cash_course"` and maps to `course_hub` in folders/atlas.
- The NLH knowledge map uses the shared `skill-atlas` presentation instead of the legacy task-map canvas.
- Risk courses include explicit risk notes. The catalog validator rejects missing risk notes and common promotional claims.
- The seed creates no hand spots, no strict checks, no real-money tracking, and no lower atomic poker nodes.

## Verification

- `node --test tests/skill-atlas-layout.test.js tests/nlh-cash-course-catalog.test.js tests/program-hierarchy.test.js tests/campaigns-stats-xp.test.js` - 45 passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- `git diff --check` - passed, only regular CRLF warnings.
- Browser smoke on fresh local origin confirmed `NLH cash` is visible and course count is `72`.
- Browser smoke on the knowledge-map path confirmed `АТЛАС / Атлас знаний`, `NLH cash`, `72 УЗЛ.`, and no legacy `Карта задач` title.
- Screenshot: `09-nlh-campaign-menu-desktop.png`.
- Screenshot: `09-nlh-shared-skill-atlas-desktop.png`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
