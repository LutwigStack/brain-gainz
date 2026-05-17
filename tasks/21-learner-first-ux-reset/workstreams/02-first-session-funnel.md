# 02 First Session Funnel

## Status

`done`

## Goal

Make the first 10 minutes obvious.

The user path should be:

`Choose campaign -> Today -> Start lesson -> Answer -> Check -> Result -> Next step`

## Scope

- define the exact first-session path for the CS campaign
- make Campaign Menu lead into Today
- make Today show the first useful lesson
- make the lesson/check start with one primary action
- make result screen point to the next step
- handle empty or incomplete route states safely

## Done When

- a new user can complete one learning loop without opening the editor
- every transition has a clear next action
- no screen dead-ends after a passed or failed check

## Implementation Notes

- Today now labels the active route CTA as starting a lesson.
- Learner node overview has one primary funnel action: start lesson, go to check, or continue after a result.
- Assessment results provide a next step after both passed and failed attempts.
