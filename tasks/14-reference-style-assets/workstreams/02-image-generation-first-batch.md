# 02 Image Generation First Batch

## Status

`planned`

## Goal

Generate the first coherent asset batch for the `Computer Science Bachelor` slice.

## Scope

Generate:
- `campaign/computer-science-bachelor-crest`
- `specialization/core-cs-foundations-emblem`
- `race/raven-strategist-portrait`
- `city/core-cs-citadel`
- `opponent/corvus-ai-banner`
- `task/practice`
- `task/assessment`
- `task/recovery`
- `task/deferred`
- `mastery/seen`
- `mastery/understood`
- `mastery/remembered`
- `mastery/applied`
- `mastery/verified`
- `mastery/retained`
- `route/programming-fundamentals`
- `route/discrete-math`
- `route/data-structures`

## Generation Rules

- no readable text inside images
- strong silhouette at small sizes
- dark transparent or dark controlled background depending on slot
- consistent lighting and line/detail density
- distinct accents per category
- export source-sized images plus normalized web variants

## Output

Store generated candidates in a staging folder first.

Recommended staging:

`output/generated-assets/reference-style-first-batch/`

Only move accepted assets into the app asset folder after QA.

## Done When

- each requested asset has 2-4 candidates
- the best candidate for each slot is selected
- rejected candidates are not wired into the UI
- final selected files have predictable names and dimensions

## Risks

- agents generate inconsistent art because prompts drift
- portraits look too realistic compared with the UI
- task icons become too detailed for small cards
- city art becomes atmospheric but not readable as progress/civilization
