# 24 Human Readable Lesson Flow

## Status

`planned`

## Goal

Make the lesson screen read like a lesson, not like a verification form.

Epic 23 made the lesson the main screen. This epic cleans the remaining technical language and compresses the lesson layout so the learner sees:

`Задание -> Критерии -> Действие -> Результат`

## Problem

The first lesson path works, but the screen still exposes technical or author-like wording:

- `checklist`
- `Нет · нет проверки`
- `способ проверки`
- `строгая`
- `задан в критериях`
- dense metadata rows before the learner reaches the action

These are not blockers, but they make the app feel like a tool for checking data instead of a learning product.

## Scope

Includes:
- learner-facing lesson copy
- lesson header structure
- task and criteria emphasis
- hiding or compressing check metadata
- failed and passed result copy
- mobile lesson readability
- browser QA on desktop and mobile

Excludes:
- adding new check types
- changing check correctness logic
- new course content
- new image assets
- full redesign of Today or Map

## Success Criteria

- Lesson top reads as `Задание -> Критерии -> Действие`.
- Technical terms are removed from learner-primary copy.
- Check type and verification details are hidden, softened, or shown as secondary detail.
- The task prompt is visually stronger than metadata.
- Failed and passed results read like learning outcomes.
- Mobile lesson screen is readable without excessive cognitive load.
- Tests, lint, build, and browser QA pass.

## Workstreams

- `done` - [workstreams/01-lesson-copy-humanization.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/24-human-readable-lesson-flow/workstreams/01-lesson-copy-humanization.md)
- `done` - [workstreams/02-lesson-header-compression.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/24-human-readable-lesson-flow/workstreams/02-lesson-header-compression.md)
- `planned` - [workstreams/03-task-and-criteria-emphasis.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/24-human-readable-lesson-flow/workstreams/03-task-and-criteria-emphasis.md)
- `planned` - [workstreams/04-metadata-disclosure-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/24-human-readable-lesson-flow/workstreams/04-metadata-disclosure-pass.md)
- `planned` - [workstreams/05-mobile-lesson-readability.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/24-human-readable-lesson-flow/workstreams/05-mobile-lesson-readability.md)
- `planned` - [workstreams/06-browser-qa-human-readable-lesson.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/24-human-readable-lesson-flow/workstreams/06-browser-qa-human-readable-lesson.md)
