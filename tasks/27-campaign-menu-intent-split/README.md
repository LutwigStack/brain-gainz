# 27 Campaign Menu Intent Split

## Status

`done`

QA result:

- Campaign Menu now follows the required order: `Продолжить обучение`, `Начать готовый курс`, `Создать свою кампанию`.
- Archive and system/developer content are secondary.
- Minimal-card pass removed the old explanatory headline/description and the single large wrapper surface.
- Visual hierarchy pass separates the three choices into distinct surfaces and keeps learner menu free of system/developer content.
- Ready courses are hidden when an active personal copy already exists; archived copies offer `Восстановить` instead of `Начать курс`.
- Desktop and 390px mobile QA are recorded in [campaign-menu-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/campaign-menu-qa.md).
- No open QA findings after the visual hierarchy pass.

## Goal

Make Campaign Menu understandable by separating the user's intent.

The screen should not mix continue, templates, custom creation, archive, and system/developer campaigns in one flat surface.

Target order:

1. `Продолжить обучение`
2. `Начать готовый курс`
3. `Создать свою кампанию`

## Problem

Current Campaign Menu looks like an admin panel:

- a custom campaign form is near the top before the user chooses what they want
- active personal campaign, archive, system template, and reusable course template appear together
- `Продолжить`, `Открыть шаблон`, `Взять шаблон`, `Посмотреть`, and archive actions compete
- developer/system content can confuse ordinary learners

## Scope

Includes:
- Campaign Menu layout hierarchy
- continue-learning section
- ready-course/template section
- custom campaign section
- archive/restore placement
- system/developer template visibility
- mobile layout
- browser QA

Excludes:
- changing campaign persistence model
- new campaign content
- course authoring redesign
- full settings redesign

## Success Criteria

- First viewport clearly answers: continue existing learning or start a ready course.
- `Продолжить обучение` is the strongest path when a personal campaign exists.
- `Начать готовый курс` exposes developer-provided courses without system jargon.
- `Создать свою кампанию` is available but not the first default learner path.
- Archive actions are secondary and clearly reversible.
- System/developer templates do not compete with learner templates.
- Mobile layout keeps the three sections understandable.

## Workstreams

- `done` - [workstreams/01-campaign-menu-intent-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/01-campaign-menu-intent-model.md)
- `done` - [workstreams/02-continue-learning-section.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/02-continue-learning-section.md)
- `done` - [workstreams/03-ready-course-section.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/03-ready-course-section.md)
- `done` - [workstreams/04-custom-campaign-section.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/04-custom-campaign-section.md)
- `done` - [workstreams/05-archive-and-system-content.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/05-archive-and-system-content.md)
- `done` - [workstreams/06-mobile-campaign-menu.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/06-mobile-campaign-menu.md)
- `done` - [workstreams/07-browser-qa-campaign-menu.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/27-campaign-menu-intent-split/workstreams/07-browser-qa-campaign-menu.md)
