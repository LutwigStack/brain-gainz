# 03 Node Content Translation

## Status

`done`

## Goal

Translate learner-facing node content in the CS campaign.

## Scope

- node titles
- short descriptions
- learning outcomes
- daily task labels
- weak spot/recovery text tied to nodes
- keep internal ids stable unless there is a real need to change them

## Result

Translated learner-facing content for all CS route nodes in `src/database/cs-bachelor-template-seed.js`.

The implementation keeps node ids stable and only changes the visible content: titles, summaries, completion criteria, daily task titles, task details, outcomes, and recovery-facing text generated from route nodes.

## Done When

- inspector and Today task cards show Russian learning content
- map labels are readable and not too long
- route overview still fits on desktop and mobile
