# 15 Russian Interface Pass

## Status

`done`

## Goal

Make BrainGainz Russian-first on every user-facing surface.

The application can keep internal code names, filenames, ids, and developer-only metadata in English where that is practical. The user interface itself should read as one Russian product, not as a mix of Russian labels and English system terms.

## Why Now

The main loop is becoming usable: campaign, Today, Daily Run, route overview, map, assets, mastery, XP, and checks now have enough shape. Mixed language is now one of the biggest things making the product feel unfinished and harder to understand.

## Scope

Includes user-facing text in:
- campaign menu
- top context bar
- left navigation
- Today / daily tasks
- Daily Run task states and actions
- map modes and route overview
- node inspector
- mastery / XP labels
- Wind Rose / statistics
- knowledge checks
- empty states, loading states, disabled reasons, and errors
- QA screenshots and leftover text report

Excludes:
- database field names
- route ids, slugs, keys, and file names
- package names and technical build output
- generated asset filenames
- developer-only comments unless visible in UI

## Copy Rules

- Prefer short Russian labels over long explanations.
- Do not fix unclear UI by adding paragraphs.
- Replace English state words with compact Russian states.
- Keep terms consistent across screens.
- Keep action verbs direct: `Начать`, `Проверить`, `Повторить`, `Завершить`, `Отложить`.
- Avoid exposing internal terms like `verifier`, `metadata`, `strict`, `fallback`, `Daily Run`, `route overview`.

## Suggested Term Map

| Current | Russian |
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
| ready to finish | можно завершить |
| current | сейчас |
| recovery | повторение |
| deferred | отложено |
| route overview | обзор маршрута |
| weak spot | слабое место |
| verified mastery | подтвержденное освоение |
| self-marked | отмечено вручную |
| learner view | режим ученика |
| author view | режим автора |

## Success Criteria

- Main screens no longer show obvious English interface labels.
- Russian terms are consistent across Today, map, checks, and inspector.
- Button text fits at desktop `1280x900` and mobile `390x844`.
- Disabled states explain themselves in short Russian labels.
- Browser QA produces a leftover-English report.
- Tests, lint, and build pass.

## Workstreams

- `done` - [workstreams/01-text-inventory-and-term-map.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/15-russian-interface-pass/workstreams/01-text-inventory-and-term-map.md)
- `done` - [workstreams/02-shell-today-and-daily-tasks.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/15-russian-interface-pass/workstreams/02-shell-today-and-daily-tasks.md)
- `done` - [workstreams/03-map-inspector-and-route.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/15-russian-interface-pass/workstreams/03-map-inspector-and-route.md)
- `done` - [workstreams/04-knowledge-checks-russian-copy.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/15-russian-interface-pass/workstreams/04-knowledge-checks-russian-copy.md)
- `done` - [workstreams/05-russian-ui-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/15-russian-interface-pass/workstreams/05-russian-ui-qa.md)
