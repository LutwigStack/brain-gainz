# Reference Style Assets Plan

## Sequence

1. Define asset bible before generating images.
2. Generate a small first batch for the CS slice.
3. Normalize filenames, sizes, backgrounds, and fallbacks.
4. Integrate assets into real UI slots.
5. Run browser screenshot QA on desktop and mobile.
6. Decide whether to scale the asset family or revise direction.

## Why This Order

Generating art before slot definitions is risky because the current UI has strict container sizes. The first batch should prove that assets work in Today, right rail, Campaign Menu, and route overview before producing more.

## Target Slots

- Campaign Menu card thumbnail
- top context campaign crest
- top context specialization emblem
- Today main goal image
- Daily Run task cards
- mastery ladder
- recovery / weak spot block
- mini knowledge map landmarks
- right rail race card
- right rail city card
- right rail opponent card
- route overview branch thumbnails

## Constraints

- Do not replace existing functional icons where lucide icons already communicate an action.
- Do not use generated art for destructive, disabled, or validation states.
- Do not make text embedded in generated images; text belongs in HTML for localization and accessibility.
- Keep generated images as semantic illustrations, portraits, crests, and icons.
- Prefer transparent or controlled dark backgrounds where the UI frame supplies the surface.
- Avoid assets that require reading tiny details to understand their meaning.

## Deliverables

- `asset-style-bible.md`
- generated first-batch images in a repo asset folder
- asset manifest mapping asset ids to files and UI slots
- integration changes for only the validated slots
- `asset-qa.md` with desktop/mobile screenshots and console status

## Acceptance

- `npm run test`
- `npm run lint`
- `npm run build`
- browser smoke on the CS campaign
- desktop screenshot `1280x900`
- mobile screenshot `390x844`
- no new horizontal overflow
- no console warnings/errors caused by asset loading
