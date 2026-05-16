# 01 Asset Style Bible

## Status

`planned`

## Goal

Define the visual asset system before any image-generation batch.

## Scope

- audit current UI slots that need assets
- define asset families, sizes, aspect ratios, and target containers
- define color accents per family
- define negative prompts and forbidden motifs
- decide image formats and fallback rules
- document how assets should differ from UI icons

## Output

Create:

`tasks/14-reference-style-assets/asset-style-bible.md`

Include:
- style north star
- asset family table
- target dimensions
- naming convention
- do/don't examples
- prompt tokens to reuse
- fallback behavior if an asset fails to load

## Done When

- image-generation agents can work from the bible without asking product questions
- implementation agents know where each asset should appear
- the first batch size is fixed and intentionally small

## Risks

- generated art becomes decorative instead of explanatory
- art style fights the pixel UI
- assets use embedded text and break localization
- too many images reduce scan speed
