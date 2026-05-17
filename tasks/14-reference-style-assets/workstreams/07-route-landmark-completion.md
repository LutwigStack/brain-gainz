# 07 Route Landmark Completion

## Status

`done`

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

## Implementation Notes

- Added the accepted generated Algorithms landmark at `assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-algorithms-landmark.webp`.
- Saved the generated review candidate at `output/generated-assets/reference-style-first-batch/route/bgz-ref-route-cs-bachelor-algorithms-candidate-02.png`.
- Updated `assets/game/asset-manifest.json` from `planned` to `accepted` for `map.cs-bachelor.algorithms.landmark`.
- Wired `resolveRouteLandmarkAsset()` to resolve `Algorithms` and `Algorithm` stage names.
- Slightly increased Today mini-map landmark opacity/brightness/contrast while keeping graph nodes and labels dominant.

## QA

- `npm run lint`
- `npm run build`
- `npm run test -- tests/game-asset-manifest.test.js tests/today-dashboard-model.test.js`
- Browser QA route overview desktop `1280x900`: `tasks/14-reference-style-assets/qa/route-landmark-completion-route-overview-1280x900.png`
- Browser QA route overview element crop: `tasks/14-reference-style-assets/qa/route-landmark-completion-route-overview-element-1280x900.png`
- Browser QA Today mini-map desktop `1280x900`: `tasks/14-reference-style-assets/qa/route-landmark-completion-today-minimap-1280x900.png`
- Browser QA Today mini-map mobile `390x844`: `tasks/14-reference-style-assets/qa/route-landmark-completion-today-minimap-mobile-390.png`
- Route overview metrics: 4 stages, 4 generated image thumbnails, no fallback thumbnails, horizontal overflow `0`.
- Today mini-map metrics: desktop and mobile horizontal overflow `0`; mobile mini-map `333x136`.
