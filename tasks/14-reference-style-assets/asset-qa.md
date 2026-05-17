# BrainGainz Reference Style Asset QA

## Status

`qa-current-with-revisions`

QA date: 2026-05-17

Initial dev server: existing process on `http://127.0.0.1:5173` was used. No existing process was stopped.

Post-review fix pass: port `5173` was busy, so a new dev server was started on `http://127.0.0.1:5176`. No existing process was stopped.

Compared against:

- `tasks/14-reference-style-assets/asset-style-bible.md`
- `tasks/12-reference-style-game-cockpit/README.md`
- reference image: `C:/Users/Andr3y/Downloads/6ec5063d-913f-4a43-9c68-0f5679c48b54.png`

## Short Verdict

Keep the accepted first batch in the app for the CS Bachelor slice, but treat it as a QA-current slice with revisions before broad rollout. The assets clearly improve identity and route comprehension. State comprehension improves less strongly because the task and mastery icons are displayed very small.

## Screenshots

| Surface | Viewport | Screenshot |
| --- | --- | --- |
| Campaign Menu | `1280x900` | `tasks/14-reference-style-assets/qa/asset-qa-01-desktop-campaign-menu.png` |
| Today / Daily Run / right rail top | `1280x900` | `tasks/14-reference-style-assets/qa/asset-qa-02-desktop-today-daily-run.png` |
| Today lower panels / mini map / opponent rail | `1280x900` | `tasks/14-reference-style-assets/qa/asset-qa-03-desktop-lower-rail-map.png` |
| Route overview | `1280x900` | `tasks/14-reference-style-assets/qa/asset-qa-04-desktop-route-overview.png` |
| Mobile Today top | `390x844` | `tasks/14-reference-style-assets/qa/asset-qa-05-mobile-today-top.png` |
| Mobile mastery / recovery / mini map | `390x844` | `tasks/14-reference-style-assets/qa/asset-qa-06-mobile-mastery-map.png` |
| Mobile right rail cards | `390x844` | `tasks/14-reference-style-assets/qa/asset-qa-07-mobile-right-rail.png` |
| Post-fix Campaign Menu | `1280x900` | `tasks/14-reference-style-assets/qa/asset-qa-08-postfix-campaign-menu-1280x900.png` |
| Post-fix route overview fallback | `1280x900` | `tasks/14-reference-style-assets/qa/asset-qa-09-postfix-route-overview-1280x900.png` |
| Post-fix mobile smoke | `390x844` | `tasks/14-reference-style-assets/qa/asset-qa-10-postfix-mobile-390x844.png` |

## Browser Checks

- Broken generated images: none observed.
- Desktop generated images loaded: `22` on Today/right rail view.
- Route overview generated thumbnails loaded: `3`.
- Console errors: none observed. Initial pass showed only the React DevTools development info message; post-review fix pass reported `0` console errors.
- Desktop horizontal overflow: none observed.
- Mobile `390x844` horizontal overflow: none observed.
- Text remains in HTML; no readable image text was visible in the integrated slots.

## Post-Review Fix Pass

Addressed after review:

- `assets/game/asset-manifest.json` now reflects the accepted CS Bachelor first batch and carries slot, alt, and fallback metadata for accepted and planned route assets.
- `src/assets/referenceStyleAssets.tsx` derives canonical metadata from the JSON manifest while keeping bundled image imports in TypeScript.
- `ReferenceAssetImage` no longer keeps a stale failure state after `asset.src` changes.
- Route overview, mini-map, and opponent banner now use explicit visual fallback elements instead of `fallback={null}`.
- Campaign Menu personal campaign actions no longer wrap the `Открыть` button vertically at `1280x900`.
- `tasks/14-reference-style-assets/asset-selection.md` no longer claims app UI is unwired.

## Findings

### High

None.

### Medium

1. Task and mastery icons are useful but under-sized for state comprehension.
   Daily task icons render around `22x22`; mastery icons render around `24x24`. They add mood and category color, but practice/recovery/deferred and mastery-state differences require careful looking. The style bible asks these to distinguish state at actual card size.

2. Route overview thumbnails create a strong branch identity but the missing `Algorithms` generated thumbnail remains a batch gap.
   Programming Fundamentals, Discrete Math, and Data Structures fit cleanly and improve route scanning. The fourth route stage now has a deterministic CSS fallback instead of a blank incomplete card, but it should still receive a matching generated asset in the next batch.

### Low

1. Mini knowledge map landmark is atmospheric but slightly too dark for route recognition.
   The landmark supports cockpit mood without overpowering the graph, but the graph still carries most of the comprehension. A slightly clearer landmark or stronger local contrast would better meet the "route cluster recognition" goal.

2. Opponent banner identity is present but subdued.
   The red banner reinforces opponent pressure, but the overlayed avatar/status treatment makes the generated Corvus image feel more like a texture than a named rival. It is still acceptable as a background state asset.

3. Mobile race portrait crop is dramatic but narrow.
   The raven identity is obvious at mobile width, but the crop emphasizes the eye/head and loses some scholar-cloak context. This is acceptable for the first batch.

## Asset Comprehension

Assets improve comprehension most in these slots:

- campaign crest: fast CS campaign recognition in top context and Campaign Menu
- race portrait: clear player persona identity
- city card: clear civilization / progress identity
- route overview thumbnails: strong branch-level recognition for three routes

Assets improve comprehension moderately in these slots:

- Daily Run task icons: helpful accents, but too small for reliable state recognition
- mastery icons: good color and shape family, but too small and dense for immediate distinction
- mini map landmark: reinforces route mood, but graph nodes and labels still do most of the work
- opponent banner: reinforces danger/pressure, but the opponent identity remains partly generic

## Visual Hierarchy Regressions

- The Campaign Menu action wrap regression was fixed in the post-review pass.
- Route overview thumbnails are large enough to dominate the route cards. This works for branch identity, but should not grow further.
- No asset obscured primary Today actions, progress numbers, or route labels.
- Mobile keeps the working hierarchy: Today goal and Daily Run remain above stacked right-rail art.

## Keep / Revise / Remove

| Asset slot | Recommendation | Notes |
| --- | --- | --- |
| Campaign crest | Keep | Asset works; post-review Campaign Menu action layout no longer wraps the open button vertically. |
| Specialization emblem | Keep | Distinct from campaign crest and readable in top context. |
| Race portrait | Keep | Strong identity on desktop and mobile. |
| City card image | Keep | Best-integrated right rail asset; improves civilization read. |
| Opponent banner | Revise later | Accept for now, but increase opponent identity/contrast before scaling. |
| Daily Run task icons | Revise sizing/treatment | Increase effective display size or simplify derivatives for `22-28px` use. |
| Mastery icons | Revise sizing/treatment | Consider larger icons or simplified small derivatives. |
| Mini map landmark | Revise contrast | Keep the subdued role, but make route landmark slightly more legible. |
| Route branch thumbnails | Keep, add missing Algorithms later | Current three thumbnails fit; the missing fourth branch now has a CSS fallback but should get matching art if the overview keeps art. |

## Verification

- `npm run test`: passed, `186/186`
- `npm run lint`: passed
- `npm run build`: passed
- Browser post-review smoke: passed on `1280x900` Campaign Menu, `1280x900` route overview fallback, and `390x844` mobile smoke; console errors `0`.

## QA Decision

Do not mark the full asset slice as final production-done yet. The QA artifact is current and includes post-review screenshots, but the batch should remain `keep-with-revisions` until task/mastery small-size clarity and the missing Algorithms route asset are addressed.
