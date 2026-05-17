# BrainGainz Reference Style Asset Selection

## Status

`accepted-first-batch`

## Scope

This document selects one accepted candidate per first-batch asset id for the `Computer Science Bachelor` slice.

App UI code is now wired to these assets through `src/assets/referenceStyleAssets.tsx`, with canonical slot metadata tracked in `assets/game/asset-manifest.json`.

## Accepted Asset Folder

Accepted normalized assets:

`assets/game/reference-style-first-batch/`

Review contact sheet:

`assets/game/reference-style-first-batch/accepted-contact-sheet.png`

Source candidate staging:

`output/generated-assets/reference-style-first-batch/`

## Normalization Rules Applied

- Selected exactly one candidate per requested asset id.
- Rejected weaker candidates instead of carrying alternates into the accepted folder.
- Downscaled only from larger candidate sources; no tiny source was upscaled into blurry output.
- Used the style bible filename convention: `bgz-ref-[family]-cs-bachelor-[asset-id]-[variant].[ext]`.
- Preserved exact target aspect ratios from the style bible.
- Used UI-optimized dimensions from the style bible:
  - crest/emblem: `160x160`
  - race portrait: `480x600`
  - city card: `640x360`
  - opponent banner: `768x256`
  - task icons: `160x160`
  - mastery icons: `128x128`
  - map landmarks: `480x360`
- Preserved generated safe margins where they already worked; no crop was tightened during acceptance.
- Kept controlled dark backgrounds for this batch. The generated sources have glow, feather, circuitry, and glass edges that are not suitable for reliable local alpha extraction.
- Used `webp` for scene-like, portrait, banner, crest, and landmark assets.
- Used `png` for compact task and mastery icons to preserve crisp small-size detail.

## Accepted Assets

| Asset id | Accepted candidate | Source candidate path | Final path | Final dimensions | Target UI slot | Selection reason | Fallback recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `campaign/computer-science-bachelor-crest` | `03` | `output/generated-assets/reference-style-first-batch/campaign/bgz-ref-campaign-cs-bachelor-computer-science-bachelor-crest-candidate-03.png` | `assets/game/reference-style-first-batch/campaign/bgz-ref-campaign-cs-bachelor-computer-science-bachelor-crest.webp` | `160x160` | Campaign Menu card thumbnail, top context campaign crest, Today main goal identity | Best campaign identity: strong crest silhouette with knowledge-tree/citadel read and less generic chip shape than the other candidates. | CSS academy crest placeholder with campaign name rendered in HTML. |
| `specialization/core-cs-foundations-emblem` | `01` | `output/generated-assets/reference-style-first-batch/specialization/bgz-ref-specialization-cs-bachelor-core-cs-foundations-emblem-candidate-01.png` | `assets/game/reference-style-first-batch/specialization/bgz-ref-specialization-cs-bachelor-core-cs-foundations-emblem.webp` | `160x160` | top context specialization emblem, route overview branch thumbnail | Best balance of branch/node semantics and small-size clarity; clearly distinct from campaign crest. | Network/branch lucide icon with green/cyan branch accent and HTML specialization label. |
| `race/raven-strategist-portrait` | `04` | `output/generated-assets/reference-style-first-batch/race/bgz-ref-race-cs-bachelor-raven-strategist-portrait-candidate-04.png` | `assets/game/reference-style-first-batch/race/bgz-ref-race-cs-bachelor-raven-strategist-portrait.webp` | `480x600` | right rail race card, top context race chip crop | Strongest player-persona mood: raven strategist, hood/cloak silhouette, violet eye, gold trim, non-horror read. | Raven/persona silhouette placeholder with race name in HTML. |
| `city/core-cs-citadel` | `02` | `output/generated-assets/reference-style-first-batch/city/bgz-ref-city-cs-bachelor-core-cs-citadel-candidate-02.png` | `assets/game/reference-style-first-batch/city/bgz-ref-city-cs-bachelor-core-cs-citadel-card.webp` | `640x360` | right rail city/civilization card, campaign progress surface | Most readable as a city/civilization scene rather than abstract circuitry; skyline remains coherent in a wide rail card. | Dark city silhouette band with city level and XP rendered in HTML. |
| `opponent/corvus-ai-banner` | `02` | `output/generated-assets/reference-style-first-batch/opponent/bgz-ref-opponent-cs-bachelor-corvus-ai-banner-candidate-02.png` | `assets/game/reference-style-first-batch/opponent/bgz-ref-opponent-cs-bachelor-corvus-ai-banner.webp` | `768x256` | right rail opponent card, opponent detail entry | Strong left-weighted rival portrait with red threat accent and enough dark space for adjacent status copy. | Dark opponent silhouette with red status strip and HTML name/rank/progress. |
| `task/practice` | `01` | `output/generated-assets/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-practice-candidate-01.png` | `assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-practice-icon.png` | `160x160` | Daily Run task cards, Checks validation queue rows | Reads as practice/training work through green terminal-node artifact; less like a generic refresh UI control than candidate `02`. | Existing lucide task icon plus green status chip. |
| `task/assessment` | `02` | `output/generated-assets/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-assessment-candidate-02.png` | `assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-assessment-icon.png` | `160x160` | Daily Run assessment task, Checks category cards and queue rows | Best small-size scan target for strict validation; clear cyan precision/assessment read. | Existing lucide check/scan icon plus cyan status chip. |
| `task/recovery` | `02` | `output/generated-assets/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-recovery-candidate-02.png` | `assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-recovery-icon.png` | `160x160` | Daily Run recovery task, weak spot block, recovery queue | Best practical recovery candidate: amber repair module reads as repair without candidate `01` small-size density. | Warning/repair lucide icon with amber/red-orange accent and HTML label. |
| `task/deferred` | `04` | `output/generated-assets/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-deferred-candidate-04.png` | `assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-deferred-icon.png` | `160x160` | Daily Run deferred/locked task cards | Clearest low-emphasis deferred/locked read while preserving enough contrast at small size. | Muted lock/deferred lucide icon with steel accent and unchanged layout box. |
| `mastery/seen` | `01` | `output/generated-assets/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-seen-candidate-01.png` | `assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-seen-icon.png` | `128x128` | mastery ladder row, node badges, Checks level indicators | Matches the reference-style eye/observation state and remains readable at small size. | Simple eye/visibility state icon in blue-cyan. |
| `mastery/understood` | `03` | `output/generated-assets/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-understood-candidate-03.png` | `assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-understood-icon.png` | `128x128` | mastery ladder row, node badges, Checks level indicators | Avoids the generic lightbulb; neural insight artifact gives a clearer understood/comprehension state. | Simple lightbulb/insight icon in teal. |
| `mastery/remembered` | `04` | `output/generated-assets/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-remembered-candidate-04.png` | `assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-remembered-icon.png` | `128x128` | mastery ladder row, node badges, Checks level indicators | Direct memory/brain glyph matches the reference ladder language and is the clearest small-size candidate. | Simple memory/brain state icon in green. |
| `mastery/applied` | `01` | `output/generated-assets/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-applied-candidate-01.png` | `assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-applied-icon.png` | `128x128` | mastery ladder row, node badges, Checks level indicators | Strong applied/action silhouette with gold tool/circuit read, less confused with settings than candidate `02`. | Simple tool/application icon in amber-gold. |
| `mastery/verified` | `03` | `output/generated-assets/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-verified-candidate-03.png` | `assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-verified-icon.png` | `128x128` | mastery ladder row, node badges, Checks level indicators | Avoids checkmark-as-UI-control risk; violet proof crystal reads as verified/proven state. | Shield/check state icon in violet, rendered by UI not image text. |
| `mastery/retained` | `01` | `output/generated-assets/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-retained-candidate-01.png` | `assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-retained-icon.png` | `128x128` | mastery ladder row, node badges, Checks level indicators | Clearest retention/time-state silhouette; strong hourglass read at `32-64px`. | Simple hourglass/time-retained icon in silver/steel. |
| `route/programming-fundamentals` | `04` | `output/generated-assets/reference-style-first-batch/route/bgz-ref-route-cs-bachelor-programming-fundamentals-candidate-04.png` | `assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-programming-fundamentals-landmark.webp` | `480x360` | mini knowledge map, route overview, map preview cards | Best route landmark without obvious pseudo-code marks; reads as a starter terminal/knowledge tower. | Colored graph-node thumbnail with route label outside image. |
| `route/discrete-math` | `02` | `output/generated-assets/reference-style-first-batch/route/bgz-ref-route-cs-bachelor-discrete-math-candidate-02.png` | `assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-discrete-math-landmark.webp` | `480x360` | mini knowledge map, route overview, map preview cards | Strong graph/proof landmark identity with localized violet/cyan accents and less dense facade than alternatives. | Colored graph-node thumbnail with route label outside image. |
| `route/data-structures` | `03` | `output/generated-assets/reference-style-first-batch/route/bgz-ref-route-cs-bachelor-data-structures-candidate-03.png` | `assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-data-structures-landmark.webp` | `480x360` | mini knowledge map, route overview, map preview cards | Most concrete data-structures read: stack/archive blocks plus green grid, good route landmark clarity. | Colored graph-node thumbnail with route label outside image. |
| `route/algorithms` | `02` | `output/generated-assets/reference-style-first-batch/route/bgz-ref-route-cs-bachelor-algorithms-candidate-02.png` | `assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-algorithms-landmark.webp` | `480x360` | mini knowledge map, route overview, map preview cards | Strong generated Algorithms candidate: graph traversal, decision paths, sorting bars, and search motif stay distinct from Data Structures while matching the accepted dark landmark family. | Colored graph-node thumbnail with route label outside image. |

## Rejected Candidate Summary

No asset id requires immediate regeneration for this first accepted batch.

Rejected candidates remain in:

`output/generated-assets/reference-style-first-batch/`

Reasons for rejection included:

- weaker silhouette at small sizes
- too much pseudo-code / pseudo-symbol detail
- over-abstract city or route landmarks
- checkmark-like generated shapes that could read as UI controls
- too-dark deferred variants
- recovery candidates that read as generic refresh or medical tooling instead of learning repair

## Remaining QA Before Integration

Before app wiring, verify selected files in real component containers:

- desktop `1280x900`
- mobile `390x844`
- top context crest/emblem/race chip
- right rail race/city/opponent cards
- Daily Run cards
- mastery ladder
- mini knowledge map

Acceptance should stay provisional until those real-slot screenshots confirm no crowding, no overlap, no horizontal overflow, and no loss of meaning at final display sizes.
