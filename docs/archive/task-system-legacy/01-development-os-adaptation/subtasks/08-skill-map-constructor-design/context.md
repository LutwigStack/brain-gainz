# Context: Skill Map Constructor Design

## Why This Task Exists

The current `Map` surface behaves like a technical hierarchy inspector (`sphere -> direction -> skill -> node`) instead of a user-facing system for building and tracking knowledge progression.

The user clarified a different product center:

- the main screen should be a lightweight reminder/progress overview;
- `Map` should become the real system;
- knowledge should be organized like a game-style skill tree / mind-map;
- the user should manually define what to study, how to split knowledge, what completion means, and what rewards matter;
- each skill needs a descriptive card with themes, tasks, tests, card packs, and rewards;
- the system should then visualize progress and remind, not invent the learning structure for the user.

## Current Reality

- `src/components/NavigationView.jsx` renders a tree + detail pane over the existing hierarchy.
- The current data model is still presented in internal terms rather than as a player-facing skill system.
- `Now` currently acts as the strongest visible product surface, but the user wants `Map` to become the primary configuration surface for the system itself.

## Product Reframe

The next design work should redefine `Map` from:

- hierarchy browser

to:

- interactive skill map;
- intuitive game-like constructor;
- skill card with explicit completion criteria;
- progression graph where small skills roll into larger ones.

## Design Constraints

- Stay additive-first relative to the existing runtime and schema.
- Do not force immediate destructive replacement of legacy `Library` / `Study`.
- Keep the first slice narrow enough to design and later implement in reviewable steps.
- Prefer user-facing domain language over technical storage language.

## Why A Concrete PR1 Is Needed Now

The current lane already establishes the product direction, but the next implementation step still needs a tighter contract.

Without a concrete PR1, the team could accidentally do one of two bad things:

- rebuild the current `Map` screen cosmetically without changing the mental model;
- overbuild a freeform editor before the first user-facing loop is understandable.

The first delivery package inside this lane therefore needs to define:

- the exact user-facing entities;
- the first screen modes and wireframe split;
- the smallest usable constructor;
- the implementation slices that can ship incrementally.

## PR1 Outcome For This Lane

The first implementation package for the new `Map` should make it possible to:

- create a branch and a skill manually;
- attach a few explicit completion criteria;
- connect one skill to another as a dependency;
- open a readable skill card with progress state;
- see the result on a graph-like map without exposing storage jargon.

That is enough to validate whether `Map` is becoming the real system-definition surface.
