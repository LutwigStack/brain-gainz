# Plan: Skill Map Constructor Design

## Project Goal

Transform BrainGainz into a local-first system where the user defines a personal skill progression graph and the app visualizes progress, reminders, and mastery.

## Task Goal

Design the next `Map` direction as a game-like skill map with an intuitive constructor, explicit completion criteria, and skill cards that describe what must be learned and proven.

## Full-System Goal

Define the complete delivery path for turning `Map` into the core product surface of BrainGainz: the place where the user authors the skill graph, inspects progress, manages learning artifacts, and feeds meaningful reminders into `Main`.

## PR1 Goal

Define the first implementable package for the new `Map` so that the team can ship a guided skill-map MVP rather than another iteration of the old hierarchy inspector.

## PR1 Scope

- user-facing entities for branch, skill, subskill, criterion, dependency, task link, test link, card-pack link, and reward;
- wireframe-level screen modes for overview, inspect, and guided create/edit;
- a constrained constructor MVP that supports manual graph authoring without a freeform canvas;
- implementation slices that can be delivered incrementally.

## Full-System Scope

- user-facing authoring model for branches, skills, subskills, criteria, dependencies, tasks, tests, card packs, and rewards;
- visual map surface for overview, inspect, unlock logic, and progress states;
- guided constructor flows for creation and editing;
- progress engine that derives completion and availability from explicit criteria;
- reminder integration so `Main` reflects authored skill reality;
- maintenance flows for stale, blocked, or structurally broken skills.

## Implementation Checklist

- [x] Reframe `Map` from hierarchy inspector to user-facing skill system.
- [x] Define the role split between `Main` and `Map`.
- [x] Define the first user-facing entities for the skill map.
- [x] Define the first `Skill Card` contract.
- [x] Define the first `Map` interaction modes.
- [x] Bound the MVP so the future implementation does not become a fully freeform canvas too early.
- [x] Define the concrete PR1 goal for the new `Map` package.
- [x] Define the PR1 entity set and minimum field expectations.
- [x] Define the PR1 wireframe / screen mode split.
- [x] Define the PR1 constructor MVP scope and explicit non-goals.
- [x] Break the future implementation into reviewable slices.
- [x] Define the full-system target beyond the first constructor slice.
- [x] Define the later delivery waves needed to make `Map` the real product center.
- [x] Connect the future `Map` system back into `Main` as reminder/progress output.

## PR1 User-Facing Entities

- `Branch`: top-level thematic lane.
- `Skill`: primary progression node.
- `Subskill`: skill with a parent skill.
- `Criterion`: explicit completion condition.
- `Dependency`: unlock relationship between skills.
- `Task Link`: lightweight practical work item tied to a skill.
- `Test Link`: lightweight proof checkpoint tied to a skill.
- `Card Pack Link`: attachment to spaced-repetition material.
- `Reward`: optional user-defined reward.

## PR1 Wireframe / Screen Modes

### 1. Overview

- Left rail with branches and filters.
- Center map with skill graph.
- Right summary panel for the selected node.

### 2. Inspect

- Expanded skill card in the side panel or modal.
- Criteria, dependencies, linked artifacts, and reward are readable in one place.

### 3. Guided Create / Edit

- Step-based create/edit flow.
- User can create branch, skill, subskill, criteria, dependencies, and optional reward.

## PR1 Constructor MVP

The constructor is considered MVP-ready when the user can:

- create a branch;
- create a skill inside a branch;
- add a subskill under another skill;
- write explicit completion criteria;
- link prerequisites;
- attach lightweight tasks, tests, card packs, and reward text;
- reopen and edit the same skill from the map.

The constructor is explicitly not responsible for:

- freeform spatial graph editing;
- complex gamification loops;
- deep study-card authoring;
- automation-heavy graph generation.

## PR1 Implementation Slices

### Slice 1: Vocabulary and Read Model

Goal:

- introduce the user-facing map vocabulary and adapter layer without breaking the current runtime.

Expected output:

- stable frontend-facing entity shapes for branch/skill/criterion/dependency;
- mapping from storage model into the new view model;
- tests for status derivation and parent/dependency shaping.

### Slice 2: Overview and Inspect Surfaces

Goal:

- replace the current tree-inspector feel with the first readable map overview and skill card.

Expected output:

- branch rail;
- graph or structured skill-map center panel;
- skill card summary/inspect state;
- visible locked / available / in progress / mastered states.

### Slice 3: Guided Constructor

Goal:

- let the user author the system directly from the map.

Expected output:

- create/edit flow for branch and skill;
- criteria authoring;
- dependency linking;
- lightweight task/test/card-pack/reward attachments.

### Slice 4: Progress Semantics and Reminder Hooks

Goal:

- make the authored structure meaningful for progress and future reminders.

Expected output:

- progress derived from criteria completion;
- unlock-state transitions;
- hooks for `Main` to consume available / stale / advancing skills later.

## Full-System Delivery Waves

### PR1: Vocabulary and First Guided Constructor

Outcome:

- the user can create a branch, create skills/subskills, define criteria, attach dependencies, and inspect a readable skill card.

Why it exists:

- validates the new mental model before deeper progress or reminder automation.

### PR2: Skill Progress Engine

Outcome:

- skill state is derived from explicit criteria and dependency structure rather than generic legacy counts.

Includes:

- criterion completion semantics;
- locked / available / in progress / mastered calculation;
- parent rollups for branch and skill summaries.

### PR3: Main Integration and Reminder Logic

Outcome:

- `Main` becomes a progress/reminder dashboard powered by the authored skill graph.

Includes:

- surfaced available skills;
- stale skills and overdue maintenance signals;
- recently advanced and recently blocked summaries.

### PR4: Artifact-Linked Learning Loop

Outcome:

- skills become operational learning containers instead of static map nodes.

Includes:

- better task/test/card-pack attachment surfaces;
- skill-card actions that jump into execution surfaces;
- clearer distinction between learning proof and learning material.

### PR5: Maintenance, Repair, and Editing Quality

Outcome:

- the system remains understandable after long-term use and graph growth.

Includes:

- stalled-skill visibility;
- broken dependency detection;
- easier editing of criteria and relationships;
- safer rename / move / detach flows.

### PR6: Cutover and Legacy De-Emphasis

Outcome:

- the new `Map` + `Main` loop becomes the clear default product path.

Includes:

- route/default emphasis changes;
- reduced prominence of legacy study-first flows;
- reversible coexistence posture while confidence is still being built.

## Full-System Acceptance Criteria

- the user can model a real topic as a branch with multiple dependent skills;
- each skill can define explicit completion criteria and optional learning artifacts;
- progress state is readable without needing to inspect raw storage entities;
- `Main` reflects the authored graph with reminders and progress summaries;
- the user can repair or edit the graph after initial creation;
- the full system can coexist with legacy surfaces until cutover confidence is high.

## Validation Checklist

- [x] `Main` is positioned as overview/reminder rather than system builder.
- [x] `Map` is positioned as the primary configuration surface.
- [x] The concept supports manual authoring of structure, criteria, and rewards.
- [x] The concept allows small skills to roll up into larger skills.
- [x] The design direction is intuitive enough to implement without exposing storage jargon to the user.
- [x] PR1 has a narrow enough scope to ship before any freeform canvas work.
- [x] PR1 covers the four required planning anchors: entities, wireframe, constructor MVP, and slices.
- [x] Each planned slice has a distinct user-facing purpose rather than generic refactoring work.
- [x] The full-system plan now explains how PR1 grows into a complete authored-skill product loop.
- [x] `Main` remains constrained to reminder/progress output rather than reclaiming authoring responsibilities.

## Rollout/Rollback Checklist

- [x] Design-only lane; no runtime rollout is performed here.
- [x] Future implementation should remain additive relative to the current schema and legacy card surfaces.
- [x] A first implementation slice should prefer a guided graph editor over a totally freeform canvas.
- [x] The first runtime delivery should be able to coexist with the current `Map` implementation behind a reversible route/component boundary.
- [x] Full-system delivery remains staged so legacy surfaces can be de-emphasized gradually rather than ripped out in one pass.

## Deferred Ideas / Not Tested Here

- Full reward economy or gamification loops.
- Rich animation language for unlocks and mastery states.
- Multiplayer / cloud sync / shared maps.
- Automatic skill graph generation from existing cards or notes.
- Freeform drag-and-connect canvas editing.
- Advanced prerequisite logic beyond direct dependency links.

## Approval Gate

This lane now contains a full-system delivery plan, not only a PR1 starter package.
Per repo rules, implementation should begin only after one explicit user approval for the overall wave: `Y` or `N`.
