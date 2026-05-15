# Workstream 06: Today Short-Session Game Loop

## Goal

Turn `Today` into a short-session game loop that guides verified learning actions.

`Today` is the product evolution of the existing task 08 `Now` surface. V1 should reuse and extend the current Now service, daily sessions, actions, selected campaign state, and XP ledger path rather than creating a parallel daily-work model.

## Scope

Includes:
- daily action selection
- existing `Now` / daily session integration
- 5-10 minute task framing
- current specialization goal
- weakening / retention tasks
- progress feedback after action completion
- opponent pressure snapshot

Excludes:
- complex scheduling algorithm
- long onboarding
- full calendar planning

## UX Direction

`Today` should answer quickly:
- what should I do next?
- why this action matters?
- what will it improve?
- what is weakening?
- what did the opponent gain?

Permanent text should stay short. Use:
- task cards
- icons
- progress bars
- mastery badges
- city/race reward preview
- opponent progress bar

## Action Types V1

Examples:
- read / inspect
- explain
- recall
- solve
- mini-test
- repeat / retain

Each action should connect to:
- node
- mastery target
- expected reward
- estimated short duration

## Done When

- `Today` shows a small set of actionable learning tasks.
- `Today` reuses or extends existing `Now` services and daily session data.
- Tasks are tied to current specialization and campaign state.
- Retention / weakening tasks can appear for old nodes.
- Completing a task can update mastery and visible game progress.
- The screen remains visual-first and avoids long explanatory text.
