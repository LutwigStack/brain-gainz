# 03 User Recovery Screen

## Status

`done`

## Goal

Give the user a safe path when local data cannot be repaired automatically.

## Scope

- replace raw schema/SQL failure with a user-facing recovery state
- show short explanation in Russian
- offer safe actions such as retry, export/debug copy, rebuild local data
- do not hide destructive reset behind a primary button
- keep developer details behind a disclosure

## Done When

- unrecoverable storage failure does not look like an app crash
- destructive reset requires confirmation
- the screen is usable on desktop and mobile

## Result

App bootstrap failures now show a Russian recovery screen with retry, backup download, explicit reset with confirmation, and technical details behind a disclosure.
