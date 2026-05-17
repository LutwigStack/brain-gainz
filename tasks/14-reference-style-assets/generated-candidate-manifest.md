# Generated Candidate Provenance

## Scope

Tracked provenance for the first Computer Science Bachelor reference-style asset batch.

The full-size raw candidate images are intentionally not tracked in git. They are local review artifacts under `output/generated-assets/`, which is ignored by repo hygiene. This file preserves the prompt intent, candidate count convention, selected candidate ids, and artifact location contract so a clean checkout still has review provenance without binary raw candidates.

Detailed selected-candidate rationale lives in `tasks/14-reference-style-assets/asset-selection.md`.

## Local Artifact Contract

- Raw candidates live under `output/generated-assets/reference-style-first-batch/`.
- Raw candidates are local or externally shared review artifacts, not runtime assets.
- Runtime-selected assets live under `assets/game/reference-style-first-batch/` and must be tracked.
- Manifest `raw_variant_paths` may reference ignored local raw candidates for reviewers who have the artifact bundle.

## Prompt Summary

All prompts followed the first-batch style bible:

- dark fantasy-tech learning UI assets for Computer Science Bachelor
- no readable text inside generated images
- compact silhouettes that remain legible in real UI slots
- restrained navy/charcoal backgrounds with cyan, teal, amber, violet, green, or red accents depending on state
- HTML renders labels, progress, and UI copy outside the images

## Selected Candidates

| Asset group | Candidate range | Selected | Prompt summary |
| --- | --- | --- | --- |
| `campaign/computer-science-bachelor-crest` | `01-04` | `03` | Computer Science Bachelor crest, knowledge-tree/citadel identity, dark cyber-academic seal. |
| `specialization/core-cs-foundations-emblem` | `01-04` | `01` | Core CS Foundations emblem, branch/node semantics, compact network artifact. |
| `race/raven-strategist-portrait` | `01-04` | `04` | Raven Strategist persona portrait, tactical hood/cloak silhouette, violet/gold accents. |
| `city/core-cs-citadel` | `01-04` | `02` | Core CS Citadel wide city card, readable skyline, civilization progress mood. |
| `opponent/corvus-ai-banner` | `01-04` | `02` | Corvus AI opponent banner, rival portrait, red threat accent, dark status space. |
| `task/practice` | `01-04` | `01` | Practice task icon, training terminal/node artifact, green/cyan small-state read. |
| `task/assessment` | `01-04` | `02` | Assessment task icon, precision validation artifact, cyan strict-check read. |
| `task/recovery` | `01-04` | `02` | Recovery task icon, amber repair module, weak-spot reinforcement read. |
| `task/deferred` | `01-04` | `04` | Deferred task icon, muted locked/waiting artifact, low-emphasis state read. |
| `mastery/seen` | `01-04` | `01` | Seen mastery icon, observation/eye state, blue-cyan first-contact read. |
| `mastery/understood` | `01-04` | `03` | Understood mastery icon, neural insight artifact, teal comprehension read. |
| `mastery/remembered` | `01-04` | `04` | Remembered mastery icon, memory/brain glyph, green recall read. |
| `mastery/applied` | `01-04` | `01` | Applied mastery icon, action/tool circuit artifact, amber application read. |
| `mastery/verified` | `01-04` | `03` | Verified mastery icon, proof crystal/shield state, violet validation read. |
| `mastery/retained` | `01-04` | `01` | Retained mastery icon, time/retention artifact, silver steel long-term read. |
| `route/programming-fundamentals` | `01-04` | `04` | Programming Fundamentals route landmark, starter terminal/knowledge tower, no pseudo-code text. |
| `route/discrete-math` | `01-04` | `02` | Discrete Math route landmark, graph/proof observatory, violet/cyan graph identity. |
| `route/data-structures` | `01-04` | `03` | Data Structures route landmark, stack/archive blocks, green grid structure identity. |
| `route/algorithms` | `01-04` | `02` | Algorithms route landmark, graph traversal, sorting bars, decision paths, search motif. |

## Reproduction Note

The selected runtime assets are the reproducible repo contract. If a future agent needs to regenerate candidates, use the prompt summaries above, the style bible, and the selected-candidate rationale as the source of truth, then write raw candidates back to ignored `output/generated-assets/` and update `asset-selection.md` only when the chosen candidate changes.
