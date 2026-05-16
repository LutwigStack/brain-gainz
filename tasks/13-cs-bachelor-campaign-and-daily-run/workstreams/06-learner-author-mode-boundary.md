# 06 Learner Author Mode Boundary

## Status

`planned`

## Goal

Separate learner-facing daily work from author-facing campaign editing so CS campaign content can be built without leaking technical fields into play.

## Scope

- define learner mode vs author mode entry points
- hide check metadata internals from learner surfaces
- expose authoring tools for campaign editors
- support previewing learner view from author mode
- ensure route/map editing remains available to authors
- keep destructive author actions protected

## UX Direction

Learner mode:
- Today
- Daily Run
- assessment attempts
- progress
- map overview

Author mode:
- node editing
- check metadata
- route authoring
- graph structure editing
- template/fixture maintenance

## Done When

- learner Today does not show author-only fields
- assessment attempt UI does not expose unnecessary verifier internals
- author can still edit CS campaign checks/routes/nodes
- mode switch is clear and does not look like debug
- preview path lets author inspect learner experience

## High-Risk Scenarios

- authoring controls disappear from existing workflows
- learner mode hides too much context
- mode state persists unexpectedly across campaigns
- destructive author actions bypass safety patterns

## Suggested Tests

- UI state tests for learner/author visibility
- browser smoke for author editing and learner attempt
- QA on CS campaign template and personal fork
