# 07 CS Campaign QA And Balance

## Status

`planned`

## Goal

Verify the CS campaign and Daily Run mechanics through realistic browser use and record product balance issues.

## Scope

- run browser QA using `Computer Science Bachelor`
- verify campaign template/fork/open
- verify Today and Daily Run
- verify map overview and route readability
- verify assessment examples
- verify weak spot and recovery loop
- verify learner vs author mode
- record balance/content issues separately from code bugs

## Required Artifact

Create or update:

`tasks/13-cs-bachelor-campaign-and-daily-run/cs-campaign-qa.md`

Include:
- verified commit
- dev server port
- viewports
- command results
- console result
- screenshots
- findings by severity
- content balance notes
- suggested next content slice

## Acceptance Checklist

- CS template visible in Campaign Menu
- personal fork/open path works
- Today has real CS next tasks
- Daily Run starts and finishes
- weak spot recovery can be triggered
- Map overview is readable for first slice
- assessment examples cover multiple check types
- learner mode hides author internals
- author mode can edit campaign content
- console has no unexpected warnings/errors
- `npm run test`, `npm run lint`, and `npm run build` pass
