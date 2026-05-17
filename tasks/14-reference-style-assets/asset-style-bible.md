# BrainGainz Reference Style Asset Bible

## Purpose

This bible defines the first coherent reference-style asset system for BrainGainz. It is intentionally slot-first: every asset must explain campaign identity, learner identity, route state, progress, weakness, or opponent pressure in the cockpit. Assets are not decorative page dressing.

The first generated batch should validate the `Computer Science Bachelor` slice before the style is scaled to other campaigns.

## Style North Star

BrainGainz assets should feel like a dark sci-fi RPG command center for learning. The UI frame supplies the cockpit; images supply semantic identity and state.

Use the task 12 reference images as the visual north star:

- dark tactical command center with restrained glow
- crisp game-card silhouettes that remain readable in small containers
- pixel-inspired detail and hard-edged shapes without noisy low-resolution artifacts
- meaningful color accents by family and state
- compact forms designed for dashboards, validation cards, queue rows, rails, badges, and map previews
- cyber-academic motifs: terminals, data lattices, circuit diagrams, old books, lab glass, academy architecture, node graphs, shields, banners, artifacts
- strong foreground subject with controlled dark or transparent background
- readable value contrast at thumbnail size

The style should not become generic fantasy, generic stock sci-fi, or a one-note purple/blue wash. It should look like a learning game where academic progress is being commanded from a cockpit.

The Checks reference adds an important constraint: the same asset language must survive in dense validation surfaces. Assessment-type icons, mastery badges, weak-skill indicators, streak symbols, and recommendation markers should feel like parts of one cockpit system while still being distinct at row-icon size.

## Reusable Prompt Tokens

Use these token groups as building blocks for image-generation prompts. Combine only the tokens that fit the asset family and slot.

### Global Style Tokens

- dark sci-fi RPG command center asset
- pixel-inspired crisp game art
- high-contrast silhouette
- dashboard-readable at small size
- hard-surface academic tech
- controlled rim light
- dark navy graphite background
- subtle scanline texture
- clean foreground subject
- limited palette with one clear accent color
- no embedded text
- no logo lettering
- transparent background when used as an icon
- centered composition with safe margins

### BrainGainz Identity Tokens

- learning campaign cockpit
- knowledge map strategy game
- cyber academy
- tactical study dashboard
- mastery progression artifact
- academic technology relic
- neural circuit geometry
- graph-node constellation
- coded parchment and terminal glass

### Computer Science Bachelor Tokens

- undergraduate computer science academy
- algorithms and data structures
- programming fundamentals
- discrete mathematics
- compiler glyphs without readable text
- abstract code circuits
- binary-free data lattice
- theorem-grid geometry
- terminal-lit lecture hall
- cyber campus citadel

### Checks And Validation Tokens

- validation challenge artifact
- exact-answer scan matrix
- conceptual reasoning neural glyph
- timed mini-exam sigil
- spaced repetition loop artifact
- proof-of-understanding marker
- queue-row readable icon
- passed check green confirmation accent
- failed check red correction accent
- recommendation marker with warm gold accent

### Raven Strategist Tokens

- raven tactician portrait
- observant strategist
- black feather armor
- violet eye accent
- scholar cloak
- command intelligence
- composed profile
- no human face
- no horror styling

### Corvus AI Tokens

- rival raven AI commander
- synthetic black-feather construct
- red status accent
- adversarial but not monstrous
- tactical opponent banner
- machine intelligence portrait
- angular cyber armor

### State Accent Tokens

- primary progress: green circuitry accent
- verified mastery: violet shield accent
- strict assessment: blue-cyan scan accent
- conceptual assessment: green neural accent
- mini-exam: violet branching accent
- recovery: amber repair accent
- warning weakness: red-orange stress accent
- deferred or locked: muted steel accent
- retained mastery: silver hourglass accent
- recommendation: warm gold beacon accent
- failed result: red correction accent

## Negative Prompt And Forbidden Motifs

Use this negative prompt baseline for every generated asset:

`embedded text, readable words, letters, numbers, watermark, logo text, stock photo, photorealistic office, generic corporate dashboard, flat app icon set, mascot cartoon, cute chibi, fantasy tavern, medieval-only fantasy, neon overload, purple-blue wash, blurry thumbnail, noisy pixel mush, low-resolution artifacts, illegible micro detail, cluttered background, gore, horror, skulls, weapons as primary subject, human celebrity likeness, national flags, brand logos, copyrighted character, UI chrome, buttons, progress bars, checkboxes, rendered tables, fake notification badges`

Forbidden motifs:

- Text inside generated images. Labels, names, levels, percentages, and copy belong in HTML.
- UI controls inside generated images. Do not render fake buttons, sliders, meters, panels, or checkboxes.
- Generic stock imagery such as laptops, office desks, smiling students, server rooms, or abstract business gradients.
- Pure decoration that does not communicate identity or state.
- Full-page wallpaper compositions that require cropping away the subject.
- Tiny inscriptions, runes, code lines, equations, or diagrams that must be read to understand the asset.
- Overly cute mascots, horror birds, skull armor, gore, or aggressive weapon-forward imagery.
- One-family color dominance across the whole batch. Purple can mark raven identity or verified mastery, but it cannot wash every asset.
- Real university crests, corporate logos, platform logos, national symbols, or copyrighted character silhouettes.

## Asset Family Table

| Family | First batch assets | Primary purpose | Target slots | Visual subject | Accent guidance | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| `campaign` | `Computer Science Bachelor` crest | Identify the active campaign and main learning arc | Campaign Menu card thumbnail, top context campaign crest, Today main goal image | cyber academy crest, terminal-lit campus artifact, knowledge-tree seal | cyan plus gold; dark graphite base | deterministic crest placeholder with campaign initials in HTML adjacent text, not embedded in image |
| `specialization` | `Core CS Foundations` emblem | Show active branch / route focus | top context specialization emblem, route overview branch thumbnail | data-structure node emblem, linked blocks, theorem grid | cyan plus green | lucide-style branch/network icon inside existing UI frame |
| `race` | `Raven Strategist` portrait | Give player persona identity | right rail race card, top context race chip | raven scholar strategist, composed bust portrait | violet eye/accent, muted gold trim | silhouette portrait placeholder and race name in HTML |
| `city` | `Core CS Citadel` card | Communicate civilization / meta progress | right rail city card, campaign progress surface | cyber-academic citadel, campus skyline, lit towers | warm gold windows, cyan infrastructure | abstract city silhouette with progress stats in HTML |
| `opponent` | `Corvus AI` portrait/banner | Make rival pressure visible | right rail opponent card, opponent detail entry | synthetic raven AI commander, compact banner composition | red/magenta threat accent, dark steel | opponent silhouette placeholder with red status strip in HTML/CSS |
| `task` | practice, assessment, recovery, deferred | Make Daily Run and Checks task types scan fast | Daily Run task cards, Checks category cards, validation queue rows | compact semantic icon objects | family-specific state colors | existing lucide icon plus colored status chip |
| `mastery` | seen, understood, remembered, applied, verified, retained | Show mastery ladder as states, not prose | mastery ladder row, node badges, Checks level indicators | compact symbolic artifacts | each level gets a distinct accent | CSS/lucide symbolic icon for each level |
| `recovery` | weak spot / repair visuals | Highlight weakened concepts and revisit actions | weak spot block, recovery queue, Daily Run recovery task, Checks weak-skills panel | cracked node, repair circuit, amber tool glyph | amber and red-orange stress | warning icon plus progress bar and HTML label |
| `map` | Programming Fundamentals, Discrete Math, Data Structures landmarks | Make route clusters recognizable | mini knowledge map, route overview, map preview cards | tiny landmark thumbnails tied to topic | distinct per cluster while staying in system | colored graph-node thumbnail generated by CSS/SVG or existing node icon |

## Target Aspect Ratios And Suggested Dimensions

Generate at or above the suggested dimensions, then downscale and crop deliberately per slot. Keep the subject inside a central safe area of about 80 percent width and 78 percent height unless the slot calls for a full-width scene.

| Family | Asset shape | Exact aspect ratio | Suggested source dimensions | Runtime display intent | Notes |
| --- | --- | --- | --- | --- | --- |
| `campaign` crest | square crest | `1:1` | `1024x1024` | 40-72 px top context, 96-160 px campaign card | Must read as a crest even at 48 px. Use transparent or controlled dark background. |
| `campaign` hero/goal image | wide object card | `16:9` | `1600x900` | Today main goal image, campaign menu thumbnail | Subject left or center-left so HTML progress/copy can sit nearby. No text. |
| `specialization` emblem | square emblem | `1:1` | `1024x1024` | 32-64 px top context, route header badge | More diagrammatic than campaign crest. Avoid looking like an app action icon. |
| `race` portrait | portrait card | `4:5` | `1024x1280` | right rail race image, mobile profile card | Face and shoulders must fill the frame; safe crop for `1:1` chip should remain recognizable. |
| `race` top chip crop | square crop | `1:1` | derived from `4:5` source at `512x512` | top context race chip | Use a cropped derivative, not a separately styled asset. |
| `city` card | wide scene | `16:9` | `1600x900` | right rail city/civilization card | Skyline or citadel should be recognizable at 280-340 px wide and 70-120 px tall. |
| `opponent` banner | wide portrait banner | `3:1` | `1536x512` | right rail opponent banner | Opponent portrait on left, dark status-safe space on right. No rendered text. |
| `opponent` portrait | square crop | `1:1` | derived from banner or `1024x1024` | compact opponent chip | Must remain adversarial through silhouette and red accent. |
| `task` icon | square icon | `1:1` | `512x512` | 40-80 px Daily Run cards; 32-64 px Checks rows/cards | Transparent background preferred. Large single object, not a scene. |
| `mastery` icon | square icon | `1:1` | `512x512` | 28-56 px mastery ladder; 24-40 px level indicators | Distinct silhouette per state. Verify at 32 px. |
| `recovery` icon | square icon | `1:1` | `512x512` | 32-64 px weak spot rows/cards | Must read as repair/revisit/weakness, not generic danger. |
| `streak` icon | square icon | `1:1` | `512x512` | 20-40 px right rail streak row | Only generate later if CSS/lucide symbols cannot carry the state. Keep first batch out of scope. |
| `recommendation` marker | square icon | `1:1` | `512x512` | 32-56 px recommendation card | Only generate later if the recommendation needs identity beyond existing UI icons. |
| `map` landmark thumbnail | compact wide thumbnail | `4:3` | `1024x768` | mini map cluster preview, route overview cards | Topic landmark should read by shape/color at small size, not tiny detail. |
| `map` node badge derivative | square crop | `1:1` | derived from `4:3` at `512x512` | mini map node highlight | Crop from landmark for consistency when a square badge is needed. |

### First Batch Fixed Dimensions

For the first image-generation batch, request these exact source sizes:

| Asset | Aspect ratio | Source dimensions |
| --- | --- | --- |
| Computer Science Bachelor campaign crest | `1:1` | `1024x1024` |
| Core CS Foundations specialization emblem | `1:1` | `1024x1024` |
| Raven Strategist race portrait | `4:5` | `1024x1280` |
| Core CS Citadel city card | `16:9` | `1600x900` |
| Corvus AI opponent banner | `3:1` | `1536x512` |
| Daily Run task icons: practice, assessment, recovery, deferred | `1:1` | `512x512` each |
| Mastery icons: seen, understood, remembered, applied, verified, retained | `1:1` | `512x512` each |
| Route landmarks: Programming Fundamentals, Discrete Math, Data Structures | `4:3` | `1024x768` each |

## Naming Convention

Use stable, semantic, lowercase kebab-case filenames. Filenames should describe the asset identity and family, not the prompt wording.

Pattern:

`bgz-ref-[family]-[campaign-or-scope]-[asset-id]-[variant].[ext]`

Rules:

- `bgz-ref` marks the reference-style asset generation system.
- `family` must be one of `campaign`, `specialization`, `race`, `city`, `opponent`, `task`, `mastery`, `recovery`, or `map`.
- `campaign-or-scope` should be `cs-bachelor` for the first batch.
- `asset-id` should be the stable product id, such as `computer-science-bachelor`, `core-cs-foundations`, `raven-strategist`, `corvus-ai`, `practice`, or `data-structures`.
- `variant` should describe crop or use: `crest`, `hero`, `portrait`, `banner`, `icon`, `landmark`, `thumb`, `chip`, `dark`, `transparent`.
- Do not include generation dates, model names, prompt fragments, dimensions, spaces, uppercase letters, or version strings in the final production filename.
- Iteration files may temporarily use `-v01`, `-v02`, but only the selected asset should be referenced by the manifest.

Examples:

- `bgz-ref-campaign-cs-bachelor-computer-science-bachelor-crest.webp`
- `bgz-ref-specialization-cs-bachelor-core-cs-foundations-emblem.webp`
- `bgz-ref-race-cs-bachelor-raven-strategist-portrait.webp`
- `bgz-ref-city-cs-bachelor-core-cs-citadel-card.webp`
- `bgz-ref-opponent-cs-bachelor-corvus-ai-banner.webp`
- `bgz-ref-task-cs-bachelor-practice-icon.png`
- `bgz-ref-mastery-cs-bachelor-verified-icon.png`
- `bgz-ref-map-cs-bachelor-data-structures-landmark.webp`

Recommended asset id pattern for manifests:

`[family].[campaign-or-scope].[asset-id].[variant]`

Example:

`race.cs-bachelor.raven-strategist.portrait`

## File Format Guidance

- Use `webp` for scene-like, portrait, banner, crest, and landmark assets where alpha is not required.
- Use `png` for transparent task, mastery, recovery, and small emblem/icon assets where crisp alpha edges matter.
- Keep original generation files in a working/source folder if needed, but ship optimized derivatives only.
- Export final UI assets in sRGB.
- Prefer lossless or high-quality PNG for transparent icons; prefer visually lossless WebP for cards and portraits.
- Do not ship giant source images directly if the runtime slot displays them at small size. Create derivatives sized for UI use after generation.
- Avoid SVG for generated painterly assets. SVG remains appropriate for hand-authored UI icons, not generated reference art.
- Do not embed text into image metadata for app behavior. The manifest should carry ids, slots, alt text, and fallback data.
- Every final asset should have an explicit width, height, family, slot, and fallback in the future asset manifest.

Suggested optimized derivatives after generation:

| Use | Derivative size |
| --- | --- |
| top context crest/emblem/chip | `160x160` |
| right rail race portrait | `480x600` |
| right rail city card | `640x360` |
| opponent banner | `768x256` |
| Daily Run task icon | `160x160` |
| mastery/recovery icon | `128x128` |
| map landmark thumbnail | `480x360` |
| campaign menu thumbnail | `640x360` or `480x480` depending on final slot |

## Fallback Behavior

Fallbacks must preserve comprehension when images fail, load slowly, or are not generated yet.

General fallback rules:

- Never leave an empty image box.
- Keep all important names, levels, percentages, and actions in HTML outside the image.
- Use existing UI frame, CSS color token, and a deterministic icon or silhouette when an asset is missing.
- Show a low-emphasis placeholder, not a loud error state, unless the missing asset blocks a required user action.
- Preserve the exact layout footprint to avoid shifting Today, the right rail, or mobile cards during loading.
- If an image fails, keep the same background color and aspect-ratio box, then render the fallback symbol and adjacent HTML label.
- Use `alt` text that names the semantic role: for example `Raven Strategist persona portrait`, not decorative descriptions.

Family fallbacks:

| Family | Fallback behavior |
| --- | --- |
| `campaign` | Use a CSS crest frame with campaign initials or a generic academy seal icon, with campaign name rendered in HTML. |
| `specialization` | Use a network/branch icon with branch accent color and the specialization label in HTML. |
| `race` | Use a raven silhouette or neutral persona bust inside the same portrait frame. |
| `city` | Use a dark city silhouette band and keep city level / XP text in HTML. |
| `opponent` | Use a dark opponent silhouette with red status accent; keep name, rank, and progress in HTML. |
| `task` | Use existing lucide icon mapped to task type and the same status color. |
| `mastery` | Use existing state icon or simple geometric badge mapped to the mastery state. |
| `recovery` | Use warning/repair icon with amber or red-orange accent. |
| `map` | Use colored graph-node cluster thumbnail with route label outside image. |

## First Batch Checklist

Before generation:

- Confirm the first batch is limited to the CS slice listed below.
- Confirm the target UI slot for each asset and source aspect ratio.
- Confirm no prompt requests embedded words, labels, numbers, logos, UI controls, or readable code.
- Confirm each prompt has one clear subject and one primary accent color.
- Confirm task and mastery icons are object-first, not full scenes.
- Confirm task icons can support both Today cards and Checks validation rows without needing duplicate art.
- Confirm portrait and banner prompts preserve safe crop areas.
- Confirm city and landmark prompts are readable when downscaled.

Generate first batch:

- `campaign`: Computer Science Bachelor crest, `1:1`, `1024x1024`
- `specialization`: Core CS Foundations emblem, `1:1`, `1024x1024`
- `race`: Raven Strategist portrait, `4:5`, `1024x1280`
- `city`: Core CS Citadel card, `16:9`, `1600x900`
- `opponent`: Corvus AI banner, `3:1`, `1536x512`
- `task`: practice icon, `1:1`, `512x512`
- `task`: assessment icon, `1:1`, `512x512`
- `task`: recovery icon, `1:1`, `512x512`
- `task`: deferred icon, `1:1`, `512x512`
- `mastery`: seen icon, `1:1`, `512x512`
- `mastery`: understood icon, `1:1`, `512x512`
- `mastery`: remembered icon, `1:1`, `512x512`
- `mastery`: applied icon, `1:1`, `512x512`
- `mastery`: verified icon, `1:1`, `512x512`
- `mastery`: retained icon, `1:1`, `512x512`
- `map`: Programming Fundamentals landmark, `4:3`, `1024x768`
- `map`: Discrete Math landmark, `4:3`, `1024x768`
- `map`: Data Structures landmark, `4:3`, `1024x768`

After generation:

- Reject any asset with embedded text, pseudo-letters, visible UI controls, brand marks, or illegible subject.
- Reject any asset that only works as decoration and does not communicate its assigned identity or state.
- Create optimized derivatives for actual UI slots.
- Record asset id, filename, dimensions, family, slot, alt text, and fallback in the future manifest.
- Validate all assets on dark cockpit backgrounds before integration.

## QA Criteria

QA should be screenshot-based after integration, but the same criteria apply to asset review before integration.

### Desktop 1280x900

At `1280x900`, the Today cockpit should remain a dense but readable command surface.

- Campaign, specialization, race, and mode context remain visible without wrapping into broken rows.
- Campaign crest and specialization emblem read at top-context size.
- Today main goal image improves scan speed and does not crowd goal title, progress, or action controls.
- Daily Run task icons distinguish practice, assessment, recovery, and deferred states at their actual card size.
- Checks category cards and validation queue rows can reuse the same task/check language without turning into generic app icons.
- Mastery icons are individually recognizable in the mastery row at approximately 28-56 px display size.
- Right-rail streak, confirmed-skill, weak-skill, and recommendation surfaces remain readable when mixed with portrait art.
- Recovery visuals make weak spots feel repairable/revisitable, not simply failed.
- Mini map landmarks support route recognition without overpowering the graph.
- Race, city, and opponent right-rail cards each have distinct identity and state.
- The batch does not make the screen read as one purple/blue palette.
- No generated image contains readable text, fake UI controls, watermarks, or brand marks.
- All images keep stable aspect-ratio boxes while loading and on fallback.
- No new horizontal overflow or accidental content overlap.

### Mobile 390x844

At `390x844`, assets should preserve hierarchy without stealing the working area.

- Top context remains compact; small crest, specialization, and race crops remain identifiable.
- Today main goal image is useful but not taller than the primary task workflow needs.
- Right-rail content, when stacked, does not push Daily Run actions below excessive imagery.
- Portrait and city cards crop safely; important subjects are not cut off.
- Daily Run task icons remain legible at mobile card size.
- Checks row icons and category cards remain distinguishable after stacking.
- Mastery row can scroll or wrap according to the final UI pattern without icon/text overlap.
- Recovery states remain visually distinct from ordinary practice tasks.
- Mini map landmarks still communicate route clusters without requiring tiny detail.
- Text remains outside images and does not overlay busy image areas without a controlled scrim.
- Fallbacks use the same dimensions as loaded images to avoid layout shift.
- No horizontal overflow at `390px` width.
- No asset makes tap targets smaller or obscures primary actions.

## Do And Do Not

Do:

- Use assets to answer "where am I, who am I, what is the state, what needs attention?"
- Keep subjects large, centered, and recognizable.
- Let HTML own text, numbers, labels, buttons, and accessibility.
- Use color accents to differentiate state and family.
- Create derivatives for the real slot instead of trusting browser crop behavior.

Do not:

- Generate decorative backgrounds just to fill space.
- Replace clear lucide action icons with generated art.
- Add fake UI widgets inside images.
- Rely on tiny equations, code, labels, or banners inside images.
- Generate a full campaign art set before the first batch proves itself in the cockpit.
