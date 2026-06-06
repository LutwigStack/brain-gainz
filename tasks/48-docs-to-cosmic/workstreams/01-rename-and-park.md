# 01 Rename And Park

## Status

`planned`

## Goal

Update the docs and the older tasks to use the new wording (`Карта знаний`, galaxy metaphor), and add a deprecation note to the legacy `knowledge-city-control` module. The module is not deleted in this workstream.

## Why This Matters

The user-facing language in epic 40 already uses `Карта знаний`, but the docs and the older tasks still describe the old metaphor. A new contributor who reads the docs first picks up the wrong mental model. This workstream aligns the prose with the code.

## Scope

- the two `docs/` files: `general-ux-review-prompt.md`, `ux-review-prompt.md` (and any other file surfaced by the audit grep);
- the older `tasks/` READMEs and workstreams that mention `Атлас`, `Город`, `city`, or `POE`;
- the top of `src/application/knowledge-city-control.ts` (a deprecation note);
- the root `README.md` (the project description, if present).

## Requirements

### Docs

- every prose mention of `Атлас знаний`, `Карта задач`, `atlas`, `city`, `POE` (in the user-facing sense) is rewritten to `Карта знаний` or to the cosmic equivalent;
- one section per touched file, at the bottom, named `Legacy naming`, explains in two sentences that these terms were used before the cosmic direction was confirmed and that the file is kept for context;
- no `Legacy naming` section is added to a file that has no legacy hits; the section is added only when needed.

### Tasks

- the same rewrite applies to the older `tasks/` files (epics 01-39);
- the `Legacy naming` section is added to the affected files;
- the new tasks (40-48) are written in the cosmic voice already and do not need the section; the audit grep in workstream 03 explicitly excludes `tasks/40-48` for that reason.

### Knowledge city control

- a deprecation note is added at the top of `src/application/knowledge-city-control.ts`, in the form:

  ```
  // NOTE: This module is parked. The user-facing language moved to "Карта знаний"
  // in epic 40. The module is kept for the consolidation pass that will rename
  // the data model and the file path. Do not add new functionality here.
  ```

- the module is exported as before; no behavior change in this workstream.

### Root README

- the project description, if present, is updated to mention the gamified learning app, the galaxy metaphor, and the `Карта знаний`;
- the "how to run" section is left untouched.

## Out Of Scope

- Deleting the `knowledge-city-control` module (parked, not deleted);
- Renaming `src/game/skill-atlas-layout.ts` and the `skill-atlas` enum / mode strings in the data model (parked; future consolidation pass, not part of any numbered epic yet);
- Updating the test fixtures in `tests/` to use the new wording (the tests assert on user-facing strings and are updated in epic 40's verify pass).

## Implementation Hints

- Run the audit as `rg -i "atlas|city|poe" docs/` and `rg -i "Ат|Город" tasks/0[1-9]-* tasks/[12][0-9]-* tasks/3[0-9]-*` first, then a single sweep of `Edit` calls. The new epics 40-48 are excluded because they intentionally discuss the migration terms.
- For the deprecation note, keep the existing imports and exports intact; only the comment block at the top changes.
- If a `Legacy naming` section already exists in a file (e.g. epic 29's README), do not duplicate it; extend the existing one.

## Done When

- `rg -i "atlas|city|poe" docs/` returns 0 hits except in the documented sections.
- `rg -i "Ат|Город" tasks/0[1-9]-* tasks/[12][0-9]-* tasks/3[0-9]-*` returns 0 hits except in the documented sections.
- The `knowledge-city-control` module has the deprecation note.
- The root `README.md` (if it has a project description) is updated.
- No new `console.warn` from any touched file.
