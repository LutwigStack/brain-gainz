# 07 Route Landmark Completion

## Status

`planned`

## Goal

Complete the route landmark set for the CS Bachelor first slice and improve route landmark contrast where needed.

## Problem

Route overview works better with generated landmarks, but `Algorithms` still uses a CSS fallback. QA also noted the mini knowledge map landmark is atmospheric but slightly too dark for route recognition.

## Scope

- generate or select one `Algorithms` route landmark
- normalize it to match existing route landmarks
- add it to `assets/game/reference-style-first-batch/map/`
- update `assets/game/asset-manifest.json`
- update `src/assets/referenceStyleAssets.tsx`
- wire route overview to use the generated Algorithms asset
- improve mini-map landmark contrast only if it helps route recognition

## Asset Direction

Algorithms should read as:

- algorithmic thinking
- search/sort pathing
- tactical computation
- ordered graph traversal

Avoid:

- readable pseudo-code
- generic server room imagery
- pure abstract neon grids
- fake UI controls

## Done When

- route overview has generated landmarks for Programming Fundamentals, Discrete Math, Data Structures, and Algorithms
- fallback still works for unknown future route groups
- mini-map remains subordinate to the graph and does not become decorative wallpaper
- desktop `1280x900` route overview screenshot shows a coherent four-branch row/grid

## Suggested Tests

- `npm run test`
- `npm run lint`
- `npm run build`
- browser QA route overview desktop `1280x900`
- browser QA Today mini-map desktop and mobile
