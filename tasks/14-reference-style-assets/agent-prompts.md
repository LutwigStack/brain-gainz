# Agent Prompts

These prompts assume agents have access to an image-generation model. Keep batches small and review candidates before wiring them into the UI.

## Sequence

1. Run Agent A to create the asset bible.
2. Run Agent B to generate first-batch image candidates.
3. Run Agent C to select and normalize accepted assets.
4. Run Agent D to integrate accepted assets.
5. Run Agent E to perform browser QA.

Do not run generation and integration at the same time. Integration needs selected assets and dimensions.

## Agent A - Asset Style Bible

```text
You are working in C:\Users\Andr3y\projects\javascript_projects\brain-gainz.

Task: create the asset style bible for BrainGainz reference-style assets.

Read:
- tasks/14-reference-style-assets/README.md
- tasks/14-reference-style-assets/plan.md
- tasks/12-reference-style-game-cockpit/README.md
- tasks/13-cs-bachelor-campaign-and-daily-run/README.md
- the reference image path listed in task 12 if your environment can view local images

Do not generate images yet.
Do not edit app code.

Create:
- tasks/14-reference-style-assets/asset-style-bible.md

The bible must define:
- style north star
- reusable prompt tokens
- negative prompt / forbidden motifs
- asset family table
- exact target aspect ratios and suggested dimensions
- naming convention
- file format guidance
- fallback behavior
- first batch checklist
- QA criteria for desktop 1280x900 and mobile 390x844

Bias toward assets that explain state and identity, not decoration. Avoid embedded text in generated images.
Run no tests unless you changed repo files beyond docs.
```

## Agent B - Image Generation First Batch

```text
You are working in C:\Users\Andr3y\projects\javascript_projects\brain-gainz.

Task: generate the first BrainGainz reference-style asset candidates for the Computer Science Bachelor slice.

Read:
- tasks/14-reference-style-assets/README.md
- tasks/14-reference-style-assets/plan.md
- tasks/14-reference-style-assets/asset-style-bible.md

Use your image-generation model. Do not edit app code.

Generate 2-4 candidates for each asset:
- campaign/computer-science-bachelor-crest
- specialization/core-cs-foundations-emblem
- race/raven-strategist-portrait
- city/core-cs-citadel
- opponent/corvus-ai-banner
- task/practice
- task/assessment
- task/recovery
- task/deferred
- mastery/seen
- mastery/understood
- mastery/remembered
- mastery/applied
- mastery/verified
- mastery/retained
- route/programming-fundamentals
- route/discrete-math
- route/data-structures

Save candidates under:
- output/generated-assets/reference-style-first-batch/

For every generated image, create a small manifest note with:
- asset id
- prompt used
- intended slot
- dimensions
- why this candidate might work
- known concern

Rules:
- no readable text inside images
- strong silhouette at small UI sizes
- coherent dark sci-fi RPG command center style
- no generic stock-photo look
- no single purple/blue wash across every image
- keep category accents distinct

Do not wire images into the app. The output is candidate art only.
```

## Agent C - Asset Selection And Normalization

```text
You are working in C:\Users\Andr3y\projects\javascript_projects\brain-gainz.

Task: select and normalize the first accepted BrainGainz asset batch.

Read:
- tasks/14-reference-style-assets/asset-style-bible.md
- tasks/14-reference-style-assets/workstreams/02-image-generation-first-batch.md
- output/generated-assets/reference-style-first-batch/

Do not edit app UI code unless you need to create an asset manifest draft.

Choose one accepted candidate per asset id. Reject weak or inconsistent candidates.

Create:
- tasks/14-reference-style-assets/asset-selection.md
- a normalized accepted asset folder, using the destination recommended by the style bible

For each accepted asset, document:
- source candidate path
- final path
- final dimensions
- target UI slot
- selection reason
- fallback recommendation

Normalize:
- dimensions/aspect ratio
- safe margins
- transparent or dark background strategy
- filenames

Do not upscale tiny images into blurry output. If no candidate is good enough, mark it as regenerate instead of forcing acceptance.
```

## Agent D - Asset Integration

```text
You are working in C:\Users\Andr3y\projects\javascript_projects\brain-gainz.

Task: integrate the accepted first-batch assets into the BrainGainz UI.

Read:
- tasks/14-reference-style-assets/README.md
- tasks/14-reference-style-assets/plan.md
- tasks/14-reference-style-assets/asset-style-bible.md
- tasks/14-reference-style-assets/asset-selection.md
- current app components for Campaign Menu, Today, right rail, mini map, and route overview

Rules:
- keep changes tightly scoped
- use a manifest/typed asset map instead of scattered hardcoded paths
- keep text in HTML, not inside images
- preserve accessible names
- include fallbacks for missing assets
- do not redesign unrelated UI
- do not replace action icons where lucide already works

Integrate only:
- campaign crest
- specialization emblem
- race portrait
- city card image
- opponent banner/portrait
- Daily Run task type icons
- mastery icons
- route branch thumbnails if they fit cleanly

Verify:
- npm run test
- npm run lint
- npm run build
- browser smoke on the CS campaign

Report changed files and any skipped asset slots.
```

## Agent E - Asset Visual QA

```text
You are working in C:\Users\Andr3y\projects\javascript_projects\brain-gainz.

Task: perform browser visual QA for the integrated asset batch.

Do not edit code unless the task owner explicitly asks for fixes.

Use or start a dev server without killing existing processes. If the requested port is busy, choose a free port and record it.

Check:
- Campaign Menu
- Today / Daily Run
- right rail race/city/opponent cards
- mini knowledge map
- route overview
- mobile 390x844

Compare against:
- tasks/14-reference-style-assets/asset-style-bible.md
- tasks/12-reference-style-game-cockpit/README.md
- the reference image

Create or update:
- tasks/14-reference-style-assets/asset-qa.md

Report:
- short verdict
- High / Medium / Low findings
- whether assets improve comprehension
- visual hierarchy regressions
- broken images or console errors
- desktop and mobile screenshots
- keep / revise / remove recommendations

Run:
- npm run test
- npm run lint
- npm run build

Do not mark the asset slice done if the QA artifact is stale or missing screenshots.
```
