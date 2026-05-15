# 09 Strategic Career Knowledge Graph

## Status

`planned`

## Goal

Turn the campaign system from task 08 into a strategic learning game loop:
- keep campaigns as the app entry point
- add career specializations inside campaigns
- allow a completed specialization to end the campaign or continue into a new specialization
- let new specializations layer over old progress: overlapping nodes keep their current mastery state, while new nodes and routes open around them
- introduce a shared knowledge graph direction without breaking the existing campaign-scoped implementation
- replace simple completion-only thinking with mastery levels, checks, retention, and visible game rewards
- define a visual style and asset pipeline for races, cities, node icons, campaign panels, and opponent imagery

## Scope

Includes:
- game identity and mode framing
- career specialization flow
- specialization completion and continue flow
- shared knowledge graph model direction
- campaign route overlays over knowledge nodes
- mastery levels for skill nodes
- node cards as compact learning mission panels
- assessment model for strict checks and LLM-assisted checks
- `Today` as the short-session game loop
- race, city, and AI opponent progression surfaces
- visual style system
- AI-generated asset pipeline using the available image generation model
- free mode upgrades so user-built trees still feel game-like
- QA plan for overlap, continuation, mastery, and visual density

Excludes:
- marketplace / public sharing
- multiplayer
- direct combat system
- complex race balance
- full university-program import automation
- automatic textbook parsing
- paid content systems
- cloud sync
- rewriting task 08 campaign scoping from scratch

## Product Direction

BrainGainz is a strategic learning game where real understanding builds a race, city, or civilization.

The game should not reward idle time or empty clicks. Progress comes from verified learning:
- reading is only the first step
- explaining shows understanding
- recall shows memory
- solving shows application
- tests show confirmation
- spaced repetition shows retention

Campaigns remain the entry point from task 08, but each campaign can now contain one or more specializations. A user can:
- finish the current specialization and treat that as campaign victory
- continue the same campaign by choosing a new specialization
- keep overlapping mastery from the previous specialization
- unlock new routes, new branches, and new city growth from the new specialization

## Core Concepts

- `campaign`: the user's current learning world / career save.
- `specialization`: a named educational route inside a campaign, such as `Computer Science`, `Mathematics`, `Machine Learning`, or `Bioinformatics`.
- `career route`: the set of branches and nodes required for a specialization at a chosen length.
- `knowledge graph`: the long-term shared graph of concepts, methods, checks, tasks, and prerequisites.
- `campaign route overlay`: a campaign/specialization-specific view over knowledge graph nodes.
- `mastery`: the user's current learning state for a node.
- `verified progress`: progress backed by a check, task, recall, explanation, or retention event.

## Specialization Continuation Rule

Completing a specialization does not have to end the campaign.

After completion, the user can:
- claim victory and leave the campaign in a victory state
- continue with a new specialization in the same campaign

Campaign victory v1:
- victory is not campaign archive
- campaign remains openable from the campaign menu
- single source of truth is stored `campaign.career_status`
- valid `career_status` values are `active` and `victory`
- `career_status` is updated transactionally when specialization completion or continuation succeeds
- choosing a new specialization changes the campaign from `victory` to `active` without deleting victory history
- continuation history is read from completed specializations, not from a separate campaign status

When continuing:
- overlapping nodes keep their mastery and XP state
- new specialization routes reveal additional nodes and branches
- old nodes can remain useful through retention and reinforcement
- the city/race keeps its history and grows into the new direction
- opponent progress is specialization-scoped in v1 and resets for each new specialization
- campaign-level opponent history is cosmetic and must not affect new specialization pressure

## Visual Direction

The game should feel like:
- dark strategic command interface
- pixel-art / retro-futuristic civilization UI
- knowledge map as territory
- race and city as visible reward
- opponent as pressure, not a complex war simulator

Use visual information first:
- icons
- progress bars
- radial stat shapes
- node glow / decay / lock states
- city districts
- race portraits
- compact labels
- details on click

Avoid:
- long explanatory text blocks
- dense tables as the main UI
- multiple competing primary actions
- settings-like campaign screens
- purely abstract dashboards without game identity

## Asset Direction

The project can use AI image generation for game assets.

Assets should be generated through a controlled pipeline:
- define art direction first
- generate reusable asset families, not one-off decorations
- keep prompts versioned in the repo
- store source prompts, generated outputs, selected variants, and usage notes
- avoid generating UI text inside images
- verify assets at actual in-app sizes

Initial asset families:
- race portraits
- race emblems
- city district tiles
- specialization icons
- mastery level icons
- node type icons
- opponent portraits
- campaign cards
- background panels / textures

## Success Criteria

- A campaign can contain a current specialization.
- A specialization can be completed.
- After completion, the user can either stop or continue with another specialization.
- Continuing with a new specialization preserves overlapping node mastery and opens new route content.
- Mastery levels are visible without reading long text.
- `Today` offers short verified learning actions.
- Node cards show what to understand, apply, confirm, and retain without becoming walls of text.
- The visual layer clearly communicates race, city, specialization, opponent, and next action.
- AI-generated assets are produced through a repeatable, reviewable pipeline.
- Free mode remains usable and gets the same game-like learning primitives where possible.
