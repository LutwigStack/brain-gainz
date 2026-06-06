# 01 Caps Audit

## Status

`planned`

## Goal

Find every user-facing string in `src/components/` that is ALL CAPS and decide whether it is a section heading (keep) or body copy (rewrite to Sentence case). Rewrite the body-copy strings.

## Why This Matters

ALL CAPS in body copy trains the eye to read the loudest thing first, which is usually the wrong thing. The fix is mechanical, but the audit has to be exhaustive - one stray caps string undoes the rule.

## Scope

- every user-facing string literal in `src/components/`;
- the i18n values (not the keys) that back those strings;
- the test fixtures that assert on those strings.

## Requirements

### Audit

- a `rg` pass that returns every literal with two or more consecutive capital letters;
- each hit is classified into one of three buckets:
  - **Keep**: section heading, brand, acronym;
  - **Rewrite**: body copy, button label, chip, table cell;
  - **Decide**: ambiguous case (e.g. `ОБЗОР` as a tab label); the decision is recorded in this epic's QA notes.
- the classification is recorded as a comment next to the file or in a `tasks/45-visual-discipline/audit.md` file at the root of the epic.

### Rewrite

- every string in the **Rewrite** bucket is changed to Sentence case;
- Russian Sentence case is the default: the first letter of the sentence is capital, the rest is lowercase, except proper nouns and acronyms;
- the i18n value is updated; the key is renamed only if the key encodes the old string (e.g. `progress.NODE_PROGRESS` becomes `progress.nodeProgress`).
- the tests that assert on the old string are updated.

### Keep

- every string in the **Keep** bucket is left alone;
- one comment is allowed per file, of the form `// epic 45: kept as section heading`, to make the intent visible in the code.

## Out Of Scope

- Recapitalizing the cosmic canvas (epic 47);
- Recapitalizing documentation pages (epic 48);
- Renaming CSS classes that contain caps (the class names are not user-facing).

## Implementation Hints

- Run the audit as a single `rg "..."` and a single sweep, then `Edit` each file.
- For each file with rewrites, prefer one `Edit` per file over many small edits, to keep the diff readable.
- Where the same string is used in multiple places, change it in the i18n module first, then in the components.

## Done When

- The `audit.md` lists every hit and its classification.
- All **Rewrite** strings are Sentence case.
- All **Keep** strings are still in caps.
- No test is broken.
- `npm run lint`, `npm run test`, `npm run build` all pass.
