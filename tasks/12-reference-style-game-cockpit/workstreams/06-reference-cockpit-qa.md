# 06 Reference Cockpit QA

## Status

`planned`

## Goal

Verify the cockpit slice against the supplied reference through real browser interaction and screenshots.

## Scope

- run browser QA on desktop and mobile
- capture screenshots for Campaign Menu, Today, Map, Wind Rose, and mobile Today
- compare Today screenshot against the reference structurally
- check console warnings/errors
- verify old workflows still work through the new shell
- document remaining visual deltas

## Required Reference

`C:/Users/Andr3y/Downloads/ChatGPT Image 5 мая 2026 г., 13_40_35 (1).png`

## Acceptance Checklist

- left nav exists and active screen is clear
- top context shows campaign, specialization, race/persona, and mode
- Today has main goal, task cards, mastery row, weak spots, mini map, and right meta rail
- mini map does not expose destructive editor tools
- race/city/opponent rail is visual and compact
- full Map still exposes editor tools intentionally
- Wind Rose remains reachable and visually coherent
- mobile layout is usable at `390x844`
- console has no unexpected warnings/errors
- `npm run test`, `npm run lint`, and `npm run build` pass

## QA Artifact

Create or update:

`tasks/12-reference-style-game-cockpit/reference-cockpit-qa.md`

Include:
- verified commit
- dev server port
- viewport sizes
- command results
- console result
- screenshot paths
- remaining findings by severity
- explicit comparison notes against the reference image
