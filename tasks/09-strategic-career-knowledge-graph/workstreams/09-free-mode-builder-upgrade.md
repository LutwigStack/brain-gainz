# Workstream 09: Free Mode Builder Upgrade

## Goal

Keep Free Mode as a user-built learning tree while giving it the same game-like primitives where practical.

## Scope

Includes:
- free-mode route creation
- user-defined branches and rewards
- mastery requirements
- check selection
- optional custom race/city reward flavor
- compatibility with existing map free canvas and layers

Excludes:
- public sharing
- complex template marketplace
- full curriculum generator

## Product Direction

Free Mode is not a plain task board.

The user can define:
- branches
- micro-skills
- criteria for success
- checks
- rewards
- personal route length

Free Mode should still use:
- mastery levels
- node cards
- `Today`
- visual progress
- city / stat reward hooks where possible

## Rules

- User-created content can be less structured than Career content.
- Missing checks should be allowed, but UI should show that progress is less verified.
- Free-mode nodes should not be forced into developer route taxonomy.
- Existing free canvas and layers behavior must not regress.

## Self-Marked Progress

Free Mode can allow self-marked progress, but it is not the same as verified mastery.

Rules:
- self-marked progress is stored separately or as `mastery_event.source = self_marked`
- self-marked progress does not create XP grants
- self-marked progress does not count as verified route completion
- self-marked progress must look visually different from evidence-backed mastery
- later passed evidence can upgrade the node to verified mastery through the normal assessment path

## Done When

- Free Mode can use mastery levels.
- Free Mode nodes can define simple check / reward metadata.
- Free Mode remains compatible with map editing.
- The UI visually distinguishes verified progress from self-marked progress.
- Self-marked progress does not grant XP or verified route completion.
