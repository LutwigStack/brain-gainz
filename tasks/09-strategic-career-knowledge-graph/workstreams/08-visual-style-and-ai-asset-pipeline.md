# Workstream 08: Visual Style And AI Asset Pipeline

## Goal

Create a repeatable visual direction and asset generation pipeline for BrainGainz.

## Scope

Includes:
- visual style guide
- asset taxonomy
- prompt storage
- generated variant review
- asset import rules
- in-app size checks

Excludes:
- final full art bible
- animated cinematics
- generated UI text inside images
- one-off decorative images without usage

## Style Direction

Target style:
- dark strategic interface
- pixel-art / retro-futuristic civilization mood
- science fantasy without clutter
- strong silhouettes
- readable at small sizes
- color-coded domains and mastery states

Primary visual reference:
- `tasks/09-strategic-career-knowledge-graph/references/visual-reference-strategy-dashboard.md`

## Asset Families

Initial families:
- race portraits
- race emblems
- city district tiles
- specialization icons
- mastery level icons
- node type icons
- opponent portraits
- campaign cards
- panel textures / background motifs

## Generation Rules

Use the available image generation model through a controlled process:
- prompts are committed to the repo
- generated outputs are saved with source prompt reference
- selected variants are marked
- rejected variants can be deleted or archived
- assets are tested in the app at actual display size
- generated images should not include readable UI text
- style drift must be reviewed across a batch, not only per asset
- asset generation starts from a concrete UI slot and target size, not from generic decoration needs

## Asset Manifest V1

Before generating an asset family, create or update an asset manifest entry.

Minimum manifest fields:
- `asset_id`
- `family`
- `usage_surface`
- `ui_slot`
- `target_width`
- `target_height`
- `format`
- `transparent_background`
- `source_prompt_path`
- `raw_variant_paths`
- `selected_variant_path`
- `status`
- `notes`

Workflow:
1. Define UI slot and target size.
2. Write prompt template.
3. Generate 2-4 variants.
4. Select one variant.
5. Check it in the real component at real size.
6. Mark the manifest entry as accepted.

## Suggested Repo Structure

Possible structure:
- `assets/prompts/`
- `assets/generated/raw/`
- `assets/generated/selected/`
- `assets/game/races/`
- `assets/game/city/`
- `assets/game/icons/`

Adjust to the existing asset conventions if the repo already has a better place.

## Done When

- Style guide exists.
- Prompt templates exist for the main asset families.
- Asset manifest exists before bulk generation.
- At least one race asset family can be generated and reviewed end-to-end.
- Assets are checked at in-app sizes before being accepted.
- UI does not depend on text baked into images.
