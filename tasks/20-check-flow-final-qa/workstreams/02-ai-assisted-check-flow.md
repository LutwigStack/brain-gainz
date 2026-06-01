# 02 AI Assisted Check Flow

## Status

`done`

## Goal

Make AI-assisted checks understandable without exposing raw internal terms.

## Scope

- review AI-assisted check labels and helper text
- clarify what result or proof must be pasted/entered
- keep technical IDs behind details when needed
- verify passed and failed outcomes
- make sure failed AI-assisted attempt is not styled as an app error

## Done When

- the AI-assisted path is browser-tested
- disabled and result states are clear
- no raw internal label dominates the main UI

## Result

- AI-assisted checks explain that the learner must add an AI result or a short verification note before confirmed progress can be saved.
- Failed AI-assisted attempts are saved as learning attempts without XP.
- The selected AI-assisted method now persists after saving a failed or passed attempt.
