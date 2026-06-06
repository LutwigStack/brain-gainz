# 03 Asset Manifest And Integration

## Status

`done`

## Goal

Wire accepted assets into the real UI through a stable manifest instead of hardcoding scattered file paths.

## Scope

- choose app asset directory
- create asset manifest or typed asset map
- add fallbacks for missing assets
- integrate only the first validated slots
- keep UI text accessible and outside generated images
- verify production build paths

## Candidate Integration Points

- Campaign Menu: campaign crest thumbnail
- top context: campaign crest, specialization emblem, race portrait chip
- Today main goal: goal/course image
- Today task cards: task type icon
- mastery ladder: mastery icons
- recovery block: recovery icon accent
- mini map: route landmarks
- right rail: race portrait, city card, opponent banner
- route overview: branch thumbnails or compact emblems

## Done When

- assets load in dev and production build
- missing asset fallback does not break layout
- browser QA sees no broken images
- mobile layout remains stable

## Risks

- image dimensions cause layout shift
- hardcoded paths become difficult to replace
- images compete with primary CTAs
- mobile first viewport loses useful actions


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
