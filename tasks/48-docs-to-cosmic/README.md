# 48 Docs To Cosmic

## Status

`planned`

## Goal

Bring the project documentation in line with the cosmic direction. Update the prose in `docs/`, the wording in older `tasks/`, and the top-level `README.md` so a new contributor (human or AI) reads a single consistent story: the app is a gamified learning app, the primary metaphor is the galaxy, the main map is the `Карта знаний`, and there is no longer a "city" or an "atlas" in the user-facing language.

## Why This Epic Exists

The codebase has been moving toward the cosmic direction for several epics. The documentation has not always kept up: `docs/general-ux-review-prompt.md`, `docs/ux-review-prompt.md`, older `tasks/` (especially 29 `knowledge-city-control`, 31 `cs-skill-atlas-poe-map`), and the root `README.md` still describe the city / atlas metaphor. New contributors hit these files and pick up the wrong mental model. This epic is the documentation cleanup pass.

## Product Direction

- the user-facing language is `Карта знаний` (not `Атлас знаний`, not `Карта задач`, not `City`);
- the metaphor is the galaxy (sectors, planets, jump routes, current star);
- legacy terms (`atlas`, `city`, `POE`, `hero`) are explained once, in a "legacy naming" section at the end of each touched file, and are otherwise removed;
- the prose is concise and describes what the system does, not what it was meant to be.

## Visual Targets

This is a documentation epic, not a UI epic. The visual targets are the same as the user-facing language rules in epic 45 (`Sentence case` for body copy, `Title Case` for sub-headings, `ALL CAPS` for section headings only).

## Scope

Includes:

- the `docs/` directory (the two files found by `rg -l "atlas|city" docs/`: `general-ux-review-prompt.md`, `ux-review-prompt.md`, plus any other file that mentions the legacy terms);
- the `tasks/` directory: every README and workstream file that mentions `Атлас`, `Город`, `city`, or `POE` is updated. A small "legacy naming" section is added to the affected files; the rest of the file is rewritten in the cosmic voice;
- the root `README.md` (the section that describes the project, if any);
- the legacy `knowledge-city-control` module: a deprecation note is added at the top of the file, and the module is parked for a future removal epic. The module is **not** deleted in this epic.

Excludes:

- The `skill-atlas` file names in `src/` (the user-facing `Карта знаний` rename is already in epic 40; the file rename is parked for a later consolidation pass because it is a large diff with no behavior change);
- The `skill-atlas-layout.ts` content (already updated by epic 47);
- Localisation of the docs to English or other languages (Russian is the only shipped language in this epic).

## Success Criteria

- A `rg -i "atlas|city|poe" docs/` returns 0 hits except in the documented "legacy naming" sections.
- A `rg -i "Ат|Город" tasks/` returns 0 hits except in the documented "legacy naming" sections.
- A new contributor reading the root `README.md` learns that the app is a gamified learning app with a galaxy metaphor, that the main map is the `Карта знаний`, and that the older `city` and `atlas` terms are legacy.
- The `knowledge-city-control` module has a deprecation note at the top and is parked.

## Workstreams

- `planned` - [workstreams/01-rename-and-park.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/48-docs-to-cosmic/workstreams/01-rename-and-park.md)
- `planned` - [workstreams/02-thematic-updates.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/48-docs-to-cosmic/workstreams/02-thematic-updates.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/48-docs-to-cosmic/workstreams/03-verify.md)

## Suggested Sequence

1. Update the user-facing language in the docs and the older tasks.
2. Park the legacy `knowledge-city-control` module with a deprecation note.
3. Verify the documentation is consistent.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA: not required (this is a docs-only epic).
- Grep:
  - `rg -i "atlas|city|poe" docs/` → 0 hits except in documented sections;
  - `rg -i "Ат|Город" tasks/01-39` (legacy epics only; the new epics 40-48 are excluded because they necessarily contain these terms outside a formal `Legacy naming` section) → 0 hits except in documented sections;
  - `rg -l "Карта знаний" docs/ tasks/` → expected ≥ 1 hit in each (the new wording is the new default).
- A new contributor (a fresh clone, no prior context) is asked to read the root `README.md` and then to write a one-paragraph description of the project; the description should mention the galaxy metaphor and the `Карта знаний`. The verifier records the result in the QA notes.
