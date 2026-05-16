# 14 Reference Style Assets

## Status

`planned`

## Goal

Create a small coherent visual asset set for the reference-style BrainGainz cockpit without locking the product into final art too early.

This slice turns the current text-heavy cockpit into a more game-readable surface by giving identity to:
- current campaign
- specialization / branch
- race / persona
- city / civilization
- AI opponent
- Daily Run tasks
- mastery and recovery states
- mini knowledge map landmarks

## Product Hypothesis

Assets should improve comprehension, not just decorate the UI.

The user should understand faster:
- which campaign they are in
- what kind of learner/persona they are playing
- what the main goal is
- what is a recovery/weak spot
- what is opponent/city/meta progress
- where the current route lives on the knowledge map

## Scope

Includes:
- asset direction and style bible
- prompt pack for image-generation agents
- first generated asset batch for the `Computer Science Bachelor` slice
- static asset naming, sizing, and manifest rules
- integration points for Today, right rail, mini map, campaign menu, and route overview
- screenshot-based QA against desktop `1280x900` and mobile `390x844`

Excludes:
- generating art for every future campaign
- building a full avatar creator
- replacing lucide UI icons
- final production branding for a commercial release
- animation/VFX pass
- changing mastery/XP mechanics

## Asset Direction

Use the reference image as the north star:
- dark sci-fi RPG command center
- crisp game-card silhouettes
- pixel-inspired detail without noisy low-res artifacts
- readable at small sizes
- meaningful color accents per asset family
- no generic stock photos
- no one-note purple/blue wash across every asset

Asset families:
- `campaign` - large identity image or crest for campaign cards and top context
- `specialization` - branch emblem for top context and route overview
- `race` - portrait/card art for the player persona
- `city` - civilization/progress scene for the right rail
- `opponent` - rival portrait/banner
- `task` - small icons for Daily Run task types
- `mastery` - compact icons for mastery ladder levels
- `recovery` - weak spot / repair / revisit visuals
- `map` - landmark thumbnails for route clusters

## First Batch

Generate only a small test set:
- 1 campaign crest: `Computer Science Bachelor`
- 1 specialization emblem: `Core CS Foundations`
- 1 race portrait: `Raven Strategist`
- 1 city card: `Core CS Citadel`
- 1 opponent portrait/banner: `Corvus AI`
- 4 Daily Run task icons: practice, assessment, recovery, deferred
- 6 mastery level icons: seen, understood, remembered, applied, verified, retained
- 3 route landmark thumbnails: Programming Fundamentals, Discrete Math, Data Structures

This is enough to validate style, sizing, and UI composition before scaling.

## Success Criteria

- Assets make Today and the right rail easier to scan than text-only placeholders.
- The first batch reads coherently as one visual system.
- Images remain legible in their real UI containers.
- Mobile does not lose important information to oversized images.
- Every asset has a documented purpose, filename, target slot, size, and fallback behavior.
- Browser QA includes screenshots before/after integration.

## Workstreams

- `planned` - [workstreams/01-asset-style-bible.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/14-reference-style-assets/workstreams/01-asset-style-bible.md)
- `planned` - [workstreams/02-image-generation-first-batch.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/14-reference-style-assets/workstreams/02-image-generation-first-batch.md)
- `planned` - [workstreams/03-asset-manifest-and-integration.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/14-reference-style-assets/workstreams/03-asset-manifest-and-integration.md)
- `planned` - [workstreams/04-asset-qa-and-iteration.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/14-reference-style-assets/workstreams/04-asset-qa-and-iteration.md)
- `planned` - [agent-prompts.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/14-reference-style-assets/agent-prompts.md)
