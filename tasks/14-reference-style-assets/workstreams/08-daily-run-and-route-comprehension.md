# 08 Daily Run And Route Comprehension

## Status

`planned`

## Goal

Use the asset baseline to improve the user's understanding of what to do next in Daily Run and where that work sits in the route.

## Problem

The app now has richer visual identity, but generated assets should not distract from the main loop:

1. start a run
2. complete, retry, skip, or defer tasks
3. finish the run
4. understand what changed
5. see where the route moved

## Scope

- review Daily Run task card hierarchy after asset integration
- make outcome states visually distinct after each action
- keep `Finish` visible or clearly discoverable when all tasks are resolved
- connect current Daily Run task to route overview / mini-map focus
- clarify route branch progress without adding long explanatory copy
- preserve desktop and mobile usability

## UX Questions

- Can the user tell which task is current?
- Can the user tell which tasks are done, deferred, skipped, or need another pass?
- Does `Finish` become the obvious next action after all outcomes?
- Does route overview show current branch, current step, and progress at a glance?
- Do assets support these answers or compete with them?

## Done When

- active Daily Run state and completed Daily Run state are visually distinct
- completed, failed, skipped, and deferred task outcomes have different visual treatment
- `Finish` is not lost below a long task list without a sticky or summary affordance
- route overview highlights the active branch and current step
- QA screenshots cover Daily Run active, ready-to-finish, completed, and route overview

## Suggested Tests

- Start Run
- Complete one task
- Another pass one task
- Skip one task
- Defer one task
- Finish
- desktop `1280x900`
- mobile `390x844`
- console warnings/errors
- `npm run test`
- `npm run lint`
- `npm run build`
