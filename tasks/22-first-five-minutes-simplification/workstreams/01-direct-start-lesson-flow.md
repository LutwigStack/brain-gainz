# 01 Direct Start Lesson Flow

## Status

`done`

## Goal

Make `Начать занятие` open the focused lesson/check path directly when possible.

The current flow can still go:

`Today -> map/lesson panel -> check`

The target flow is:

`Today -> focused lesson/check`

## Scope

- inspect Today primary action routing
- detect when the next lesson has an available check
- open the focused learner check directly
- keep map as a secondary overview action
- keep safe fallback when no check is available
- preserve Daily Run task selection and completion behavior

## Done When

- first CS lesson starts from Today with one click
- no map detour is needed for the first check
- result still updates Daily Run, mastery, and XP
- tests cover the direct handoff
