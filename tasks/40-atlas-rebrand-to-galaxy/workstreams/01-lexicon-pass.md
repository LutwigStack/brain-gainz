# 01 Lexicon Pass

## Status

`planned`

## Goal

Replace every user-facing "Атлас знаний" and "Карта задач" with "Карта знаний", and update the i18n keys that encode those phrases. No behavior change, only copy.

## Why This Matters

The current code mixes "Атлас знаний" (legacy), "Карта задач" (intermediate), and "Карта знаний" (current on the `Открыть карту знаний` button). For a learner, the same map is called three different things across the app, which makes the product feel unfinished. This pass lines up the copy with the confirmed cosmic direction.

## Scope

- user-facing strings in `src/components/NavigationView.tsx`;
- user-facing strings in `src/components/WindRoseView.tsx`;
- user-facing strings in `src/components/CampaignMenu.tsx`;
- user-facing strings in `src/components/NowView.tsx` (only the cross-references to the map, not the daily-run copy);
- i18n keys under `src/i18n/` or inline string maps (only values; the keys themselves are renamed only if they encode the old term and the rename does not break type signatures);
- the breadcrumbs component used by `NavigationView.tsx`;
- the alt text on the map preview image, if any.

## Requirements

### "Атлас знаний" → "Карта знаний"

- every literal `"Атлас знаний"` is rewritten to `"Карта знаний"`;
- variants with a colon or em dash (e.g. `"Атлас знаний:"`) are also rewritten;
- if the same phrase is part of a longer sentence (e.g. `"Открыть Атлас знаний"`), only the noun phrase is replaced; the verb stays.

### "Карта задач" → "Карта знаний"

- the workspace header that currently reads `Карта задач` is rewritten to `Карта знаний`;
- any breadcrumb or tooltip that says `Карта задач` is rewritten;
- the section header inside the atlas canvas panel that says `Карта задач` is rewritten;
- the `app-shell` header chip that says `Карта задач` (in `src/components/AppShell.tsx` if present) is rewritten.

### i18n

- if the project uses an i18n map (e.g. `src/i18n/ru.ts`), the corresponding keys are updated;
- keys that encode the old phrase (e.g. `atlas.title`) are renamed to encode the new phrase (e.g. `map.title`); the rename must be a global search-and-replace within the i18n module;
- no key is deleted in this epic; deprecated keys are kept and annotated `// legacy, see epic 48`.

### Comments

- one comment is allowed in the codebase to mark the migration, of the form `// legacy term "Атлас знаний", replaced by "Карта знаний" in epic 40`;
- this comment is allowed in the grep result and is the only acceptable non-zero hit.

## Out Of Scope

- Renaming the `skill-atlas` mode / enum / data model keys (parked; future consolidation pass, not part of any numbered epic yet);
- deleting the `knowledge-city-control` module (parked);
- rewriting the page title in `index.html` (deferred; not learner-facing inside the app shell);
- localization to English or other languages (Russian is the only shipped language in this epic).

## Implementation Hints

- Do the rewrite as a single `rg` + `Edit` pass to keep the diff reviewable. Suggested workflow:
  1. `rg -l "Атлас знаний" src/` to list files;
  2. open each file, confirm the match is user-facing, then `Edit` to `"Карта знаний"`;
  3. run the same for `"Карта задач"`.
- Where the string is inside a JSX `className` or a test fixture (e.g. `expect(...).toHaveTextContent("Атлас знаний")`), update the test to match the new copy.
- If a test asserts on the tab label, the test for "Город" is updated in workstream 02 of this epic.

## Done When

- `rg "Атлас знаний" src/` returns 0 user-facing hits (1 comment is allowed).
- `rg "Карта задач" src/` returns 0 user-facing hits.
- All visual surfaces read "Карта знаний" in the relevant place.
- `npm run test` still passes; updated tests still describe the new copy.
- No new `console.warn` from i18n key mismatches.
