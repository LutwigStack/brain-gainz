# Architecture: Skill Map Constructor Design

## Goal

Define the first user-facing architecture for `Map` as a skill-tree and constructor, not as a technical node inspector.

## Full-System Target

The end-state system should let the user do all of the following from one coherent product loop:

- define branches, skills, and subskills manually;
- describe what each skill means and why it matters;
- attach explicit completion criteria, tasks, tests, and card packs;
- express dependencies and unlock chains;
- track progress at criterion, skill, branch, and global levels;
- receive reminders and priority signals on the main screen;
- inspect blocked, stale, and advancing skills without switching mental models.

In other words, `Map` becomes the authoring and inspection center, while `Main` becomes the execution and reminder center.

## Proposed User-Facing Model

The current persistence hierarchy may remain in storage for now, but the `Map` UI should expose a clearer player-facing model:

- `Branch`: a large thematic track;
- `Skill`: a meaningful capability;
- `Subskill`: a smaller capability that contributes to a larger skill;
- `Task`: a practical activity required for completion;
- `Test`: a validation checkpoint;
- `Card Pack`: a set of flashcards tied to the skill;
- `Reward`: an optional user-defined reward or unlock.

## PR1 User-Facing Entities

The first implementation package should limit itself to the minimum set that makes the system understandable.

### Branch

- Represents a broad learning track such as `Frontend`, `German`, or `Algorithms`.
- Owns ordering, color/theme, and the first visible grouping on the map.
- Can contain skills directly.

### Skill

- Represents a capability the user wants to unlock or maintain.
- Is the primary node shown on the map.
- Has a title, short description, status, optional parent branch, and optional parent skill.

### Criterion

- Represents a concrete condition for considering a skill done or stable.
- Must be explicit and user-authored.
- Examples: `finish 3 exercises`, `pass one self-test`, `review the card pack twice without major errors`.

### Dependency

- Represents a relation `Skill B depends on Skill A`.
- Drives locked / available states and future reminders.

### Task Link

- Represents a practical action linked to the skill.
- In PR1 it can stay lightweight: title, optional note, and done/not-done state.

### Test Link

- Represents a proof checkpoint linked to the skill.
- In PR1 it can stay lightweight: title, optional note, and pass/not-passed state.

### Card Pack Link

- Represents a bridge from the skill to spaced-repetition material.
- PR1 only needs attachment metadata, not full card authoring inside the map flow.

### Reward

- Represents a user-defined reward or unlock.
- PR1 should keep it optional and lightweight: text plus unlocked/claimed state.

## Core Surface Split

### 1. Main Dashboard

Purpose:

- reminders;
- progress snapshot;
- overdue / available / recently advanced items.

It should not be the place where the user builds the system.

### 2. Map

Purpose:

- visualize the skill graph;
- select skills;
- inspect progress;
- open creation / editing flows.

### 3. Skill Card

Purpose:

- explain what the skill is;
- define criteria;
- show progress;
- show dependencies and unlocks;
- show attached tasks/tests/card packs/rewards.

### 4. Constructor

Purpose:

- create and connect skills;
- define criteria and rewards;
- attach supporting learning artifacts.

## Recommended Map Modes

### Explore Mode

- game-like skill tree view;
- clear node states: locked / available / in progress / mastered;
- visible relationships and unlock chains.

### Inspect Mode

- right-side or modal skill card;
- compact but complete detail view.

### Build Mode

- create node;
- choose node type;
- attach dependencies;
- define completion criteria;
- define reward.

## PR1 Wireframe / Screen Modes

The first implementation should use a stable three-panel mental model instead of a canvas-first experience.

### Mode A: Map Overview

Layout:

- left rail: branch list and quick filters;
- center: skill graph or structured map;
- right panel: selected skill summary.

Primary jobs:

- understand the landscape;
- pick a skill;
- see locked / available / in progress / mastered states.

### Mode B: Skill Inspect

Layout:

- center keeps map context visible;
- right panel expands into a full skill card.

Primary jobs:

- read what this skill means;
- inspect criteria, dependencies, tasks, tests, linked card packs, and reward;
- mark linked items complete where appropriate.

### Mode C: Guided Create / Edit

Layout:

- right panel or modal wizard with progressive steps;
- map remains visible behind or beside the form.

Primary jobs:

- create branch or skill;
- choose parent branch or parent skill;
- add criteria;
- attach dependency;
- optionally add reward.

This should feel like a guided constructor, not a blank design canvas.

## PR1 Skill Card Contract

The first skill card should expose only the fields needed to make the system legible.

- title;
- short description;
- current state: locked / available / in progress / mastered;
- progress summary derived from criteria completion;
- parent branch;
- parent skill if this is a subskill;
- dependencies;
- unlocks / downstream skills;
- criteria checklist;
- linked tasks;
- linked tests;
- linked card packs;
- optional reward.

## PR1 Constructor MVP

The first constructor slice should be deliberately constrained.

Included:

- create branch;
- create skill;
- create subskill by attaching a parent skill;
- add or remove explicit criteria;
- link one or more dependencies;
- attach lightweight task/test/card-pack/reward metadata;
- edit title and short description.

Not included:

- arbitrary drag-anywhere canvas editing;
- bulk graph editing;
- complex reward systems;
- automatic card-pack generation;
- deep analytics;
- branching logic more complex than direct prerequisite links.

## Design Position

The first design slice should not attempt a fully freeform canvas editor.
A constrained graph editor with guided creation is safer and more understandable for MVP.

## MVP Design Rules

- hide storage vocabulary from the user where possible;
- make completion criteria explicit and user-authored;
- make progress visible as criterion completion, not only as generic counts;
- allow rewards but keep them user-defined and lightweight;
- keep `Map` as the system-definition surface and `Main` as the reminder surface.

## Implementation Posture

The first runtime delivery should prefer:

- additive storage changes or adapter mapping over destructive renames;
- guided forms over canvas tooling;
- readable progress states over visual sophistication;
- a narrow but coherent vertical slice over broad partial coverage.

## Full-System Capability Map

### Capability 1: Authoring

- create branches, skills, and subskills;
- edit titles, descriptions, and relationships;
- define completion criteria and rewards.

### Capability 2: Progress Semantics

- derive progress from explicit criteria;
- compute locked / available / in progress / mastered states;
- roll up subskill progress into parent skills and branches.

### Capability 3: Learning Artifact Links

- attach tasks, tests, and card packs to skills;
- keep linked artifacts visible from the skill card;
- allow future surfaces to execute against the same authored structure.

### Capability 4: Reminder Integration

- expose available and stale skills to `Main`;
- prioritize skills that unlock other skills;
- show what is blocked and why.

### Capability 5: Review and Maintenance

- highlight stalled skills;
- show unmet criteria clearly;
- keep old or broken structures editable rather than opaque.

## Full-System Delivery Strategy

The full system should still be delivered in bounded waves rather than as one rewrite.

### Wave A: Readable Skill Vocabulary

- establish the user-facing model and adapter layer;
- stop exposing storage-centric language in the map UI.

### Wave B: Playable Map Surface

- ship the new overview + inspect experience;
- make node state and unlock relationships visible.

### Wave C: Guided Authoring

- let the user build and edit the graph directly from the map.

### Wave D: Real Progress Engine

- make authored criteria drive progress and unlock state.

### Wave E: Main-Screen Integration

- connect the authored graph to reminders, suggestions, and progress summaries.

### Wave F: Maintenance and Polish

- improve editing loops, stalled-state clarity, and long-lived usability.
