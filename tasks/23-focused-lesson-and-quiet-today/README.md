# 23 Focused Lesson And Quiet Today

## Status

`planned`

## Goal

Make the first learning loop visually calm.

Epic 22 made the path understandable. This epic removes the remaining visual competition:

- the check should feel like a lesson screen, not a side panel near the map
- Today should not bury the main action under small systems
- mobile navigation should be understandable before the user knows the app
- task documentation should match completed work

## Target Experience

The learner path should feel like:

`Today -> Lesson -> Result -> Next`

The map, route overview, daily task list, mastery levels, race/city cards, and detailed progress are useful, but they should not compete with the current lesson.

## Product Rule

During a lesson, the lesson owns the screen.

Everything else is secondary:
- map: available by button
- task list: available after or below the lesson
- progress: visible as result feedback
- author tools: hidden from the learner path

## Scope

Includes:
- focused lesson/check screen layout
- Today visual priority pass
- mobile navigation clarity
- documentation status cleanup for packages 21/22/23 where needed
- browser QA on desktop and mobile

Excludes:
- new course content
- new assets
- new check types
- redesigning the whole app shell
- removing map or Today features

## Success Criteria

- Starting a lesson opens a screen where the check/lesson is the main visual object.
- The map does not appear as the dominant neighbor during the check.
- Today first viewport clearly emphasizes the current lesson and one main action.
- Secondary Today blocks are quieter or collapsed enough not to compete.
- Mobile first path shows understandable labels, not only icons, before the user learns the app.
- Task README/status files match the actual completed work.
- Browser QA verifies the path on desktop and 390px mobile.

## Workstreams

- `done` - [workstreams/01-focused-lesson-screen.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/23-focused-lesson-and-quiet-today/workstreams/01-focused-lesson-screen.md)
- `done` - [workstreams/02-quiet-today-priority-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/23-focused-lesson-and-quiet-today/workstreams/02-quiet-today-priority-pass.md)
- `planned` - [workstreams/03-mobile-navigation-clarity.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/23-focused-lesson-and-quiet-today/workstreams/03-mobile-navigation-clarity.md)
- `planned` - [workstreams/04-documentation-status-cleanup.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/23-focused-lesson-and-quiet-today/workstreams/04-documentation-status-cleanup.md)
- `planned` - [workstreams/05-browser-qa-lesson-focus.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/23-focused-lesson-and-quiet-today/workstreams/05-browser-qa-lesson-focus.md)
