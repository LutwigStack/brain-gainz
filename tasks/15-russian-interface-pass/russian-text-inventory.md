# Russian Text Inventory

## Verdict

Main product chrome, Today, Daily Run, route overview, map inspector, mastery/check labels, and runtime/status messages are Russian-first.

The remaining English visible in QA is course content or product naming, not interface control copy.

## Term Map

| Source term | Russian UI term |
| --- | --- |
| Today | Сегодня |
| Daily Run | Задачи дня |
| Start Run | Начать задачи |
| Start New Run | Начать заново |
| Complete | Готово |
| Another pass | Еще раз |
| Skip | Пропустить |
| Defer | Отложить |
| Finish | Завершить |
| Abandon | Сбросить |
| ready to finish | можно завершить |
| current | сейчас |
| recovery | повторение |
| deferred | отложено |
| route overview | обзор маршрута |
| weak spot | слабое место |
| learner view | режим ученика |
| author view/tools | режим автора / инструменты автора |
| verified mastery | подтвержденное освоение |
| self-marked | самооценка / сам отметил |
| evidence | подтверждение проверки / данные результата |
| strict result ID | ID результата проверки |
| LLM result ID | ID результата ИИ |

## Screen Inventory

Campaign Menu:
- menu, template, archive, create, open, and fork actions use Russian labels.
- Exempt: `BrainGainz`, campaign/course names such as `Computer Science Bachelor`.

Shell:
- left nav, mobile nav, top context cards, runtime label, workspace switch, and settings use Russian labels.
- Exempt: `XP`, `JSON`, brand names and external URLs.

Today and Daily Run:
- start, active progress, task states, outcome actions, finish/abandon, summaries, weak spots, mini-map chips, and empty states use Russian copy.
- Exempt: course/node titles and course paths.

Map and Inspector:
- route overview, node inspector status, author/learner labels, mastery panel, and check flow labels use Russian copy.
- Exempt: authored course content and technical IDs hidden under author technical details.

Knowledge Checks:
- learner-facing validation and evidence prompts avoid raw `verifier`, `strict`, `fallback`, `metadata`.
- Author technical detail placeholders remain technical where they refer to stored IDs.

Wind Rose / Statistics:
- stat level labels use `ур.` instead of `lvl`.
- default progress meter copy uses `Прогресс`.
- Exempt: stat names and branch titles from the course seed.

## Exclusions

- Internal enum values, route ids, slugs, filenames, package names, SQL fields, and test names.
- Course content seeded in English for the CS bachelor template: node titles, branch names, action titles, and authored completion criteria.
- Brand/product names: `BrainGainz`, `Groq`, `Computer Science Bachelor`.
- Accepted abbreviations: `XP`, `ИИ`, `JSON`, `ID`.
