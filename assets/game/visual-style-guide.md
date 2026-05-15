# BrainGainz Visual Asset Style Guide V1

## Intent

BrainGainz assets should read as a compact strategy-game layer over a learning tool. They support campaign identity, Today pressure, city growth, and mastery state. They should not explain UI behavior or contain readable text.

## Base Style

- Dark retro-futuristic strategy interface.
- Pixel-art influenced, but clean enough for small UI slots.
- Strong silhouette first, internal detail second.
- Science-fantasy learning civilization mood.
- High contrast against `#10131A` / `#1F2633` panels.
- No baked labels, numbers, UI captions, or badges inside images.
- Avoid busy backgrounds for icons and portraits.

## Families

### Race Portraits

Usage: Today identity block, campaign cards, future setup picker.

Target:
- 256x256 PNG.
- Transparent background.
- Character bust or emblematic commander pose.
- Readable at 64x64 after downscale.

Acceptance:
- Silhouette recognizable at 48px.
- No text, no watermark, no UI frame baked into image.
- Face/identity remains clear on dark panel.

### City District Tiles

Usage: Today city projection and future campaign city overview.

Target:
- 192x128 PNG.
- Opaque background allowed.
- District as readable structure, not a resource icon.

Acceptance:
- Main building shape readable at 96x64.
- Color can reflect stat domain but should not dominate the UI.
- No resource counters or builder-game controls.

### Opponent Portraits

Usage: Today pressure card and future race/opponent panel.

Target:
- 192x192 PNG.
- Transparent background.
- Rival identity, not combat animation.

Acceptance:
- Feels like pressure/progress, not violence.
- No weapons-only closeups, no gore, no text.

### Mastery Icons

Usage: node cards, route completion, Today rewards.

Target:
- 64x64 PNG or SVG.
- Transparent background.
- Simple enough to use at 20-24px in UI.

Acceptance:
- One concept per icon.
- Works in monochrome-like small display.
- Does not duplicate existing lucide controls where a lucide icon is better.

## Review Checklist

- Manifest entry exists before generation.
- Prompt path exists and describes UI slot and target size.
- 2-4 raw variants are saved before selection.
- Selected asset path is browser-usable if UI renders it.
- Real component check was done at target size.
- Manifest status is only `accepted` after the component check.
