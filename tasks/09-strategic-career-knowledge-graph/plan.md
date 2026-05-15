# Plan

## Intent

Layer a strategic learning-game identity over the campaign system from task 08.

Task 08 made campaigns, stats, XP, and the wind rose. Task 09 adds the next product layer:
- career specializations
- specialization completion and continuation
- shared knowledge graph direction
- mastery levels
- real checks
- short-session `Today`
- race / city / opponent presentation
- visual asset pipeline

This should be additive. Do not discard the campaign boundary implemented in task 08.

## Product Direction

- BrainGainz is a game about real learning, not a habit tracker.
- Campaigns are learning worlds.
- Specializations are routes through the learning world.
- Knowledge is territory.
- Checks are battles for nodes.
- Mastery is holding territory over time.
- City and race growth are visible rewards for verified learning.
- The AI opponent creates pressure but does not require a full battle system in v1.

## Model Direction

Task 09 should introduce concepts carefully:

- current 08 model:
  - campaign-scoped skills, nodes, edges, stats, XP
- new direction:
  - specializations inside campaigns
  - route membership for specializations
  - mastery state per campaign/user/node
  - optional shared knowledge identity for nodes
  - future shared graph without immediate full migration

Do not force a risky full conversion to a global graph in one pass. V1 can add stable IDs and route overlays so future work can merge equivalent nodes across campaigns.

## Specialization Model V1

Minimum fields:
- `id`
- `campaign_id`
- `name`
- `key`
- `domain`
- `length`: `short`, `medium`, `long`, or custom
- `status`: `active`, `completed`, `paused`, `archived`
- `started_at`
- `completed_at`
- `created_at`
- `updated_at`

Campaign state:
- selected campaign has one current specialization through `campaign.current_specialization_id` or an equivalent single source of truth
- a campaign cannot have multiple active current specializations
- completed specializations remain visible in campaign history
- continuing campaign creates or activates another specialization

Completion:
- specialization completion is separate from campaign archive
- completing specialization can show victory state
- campaign can remain open after specialization victory
- after completion, `current_specialization_id` stays on the completed specialization until the user chooses a new specialization
- campaign victory is not archive; single source of truth is stored `campaign.career_status`
- `campaign.career_status` updates transactionally with specialization completion / continuation
- continuing does not reset race, city, stats, XP, or mastery
- continuing with a new specialization changes `campaign.career_status` from `victory` to `active` without deleting specialization history
- continuation history is derived from completed specialization history, not a separate `continued` status

## Overlap Rule

When a new specialization includes nodes already present in the campaign:
- the existing node/mastery state is reused
- XP and mastery are not duplicated
- route progress can count the reused node as already partially or fully covered
- retention tasks can still appear for old nodes

When a new specialization requires missing nodes:
- the route opens new nodes and branches
- prerequisites can point to existing mastered nodes
- UI should show "already known" and "new frontier" visually

V1 uses optional `knowledge_node_id` plus route membership. It must not auto-deduplicate old graph content by title or fuzzy text matching.

## Mastery Model V1

Recommended mastery levels:
1. `seen`
2. `understood`
3. `remembered`
4. `applied`
5. `confirmed`
6. `retained`

Each node can have:
- current mastery level
- latest verified event
- retention due date
- decay / weakening indicator
- required mastery level for route completion

`done` from the existing system should not disappear immediately. V1 maps old completed nodes to `confirmed` through a legacy mastery event.

Mastery should be backed by an idempotent `mastery_events` ledger. XP grants from task 08 should reference mastery events or use compatible grant reasons so XP and mastery do not diverge.

`done -> active / paused` reverses only completion-derived legacy `confirmed` mastery events and deactivates the linked XP grant. Assessment-backed mastery events are not reversed by that transition.

## Assessment Direction

Checks must match task type:
- strict checks for exact answers, multiple choice, numeric tolerance, formal tasks
- LLM-assisted checks for explanations, comparisons, short proofs, and interpretation
- no LLM-only pass where strict checking is possible

Every check should store enough evidence to support XP/mastery decisions:
- attempt id
- task id
- answer type
- submitted answer
- result
- score or pass/fail
- check method
- feedback summary
- idempotency key
- created_at

Mastery above `seen` requires passed evidence or explicit legacy migration.

## Visual Direction

Target feel:
- dark command interface
- pixel-art / strategy-game UI
- compact, visual, high signal
- race and city always present as identity/reward
- opponent visible as pressure
- map as strategic territory

Main campaign surface should answer quickly:
- who am I playing as?
- what specialization is active?
- what should I do next?
- what is weakening?
- what did I unlock?
- is the opponent ahead or behind?

Opponent progress is specialization-scoped in v1 and resets when the user starts a new specialization. Campaign-level opponent history is cosmetic.

## Asset Pipeline Direction

Use the available image generation model for game assets, but keep it controlled:
- prompts live in repo
- outputs are reviewed and selected
- variants are tracked
- assets are tested at real UI sizes
- generated images must not contain required UI text
- visual identity should remain consistent across races and screens

## Delivery Order

1. Specialization model and campaign continuation flow.
2. Route overlap and shared knowledge graph direction.
3. Mastery ledger, existing `done` adapter, and node card changes.
4. Assessment evidence model.
5. `Today` / existing `Now` short-session game loop.
6. Game identity and mode framing.
7. Free mode builder upgrades.
8. Visual style and AI asset pipeline.
9. Race, city, and deterministic opponent projection.
10. End-to-end QA and visual review.
