# 40 Atlas Rebrand To Galaxy

## Status

`planned`

## Goal

Complete the lexical rebrand from the "city / atlas" metaphor to the "galaxy / knowledge map" metaphor. The learner-facing surface should consistently say "Карта знаний" and the first tab in the atlas workspace should use a cosmic term (proposed: "Сектора"). No "Атлас знаний" or "Город" copy should remain in the user-facing UI.

## Why This Epic Exists

Epic 39 already collapsed the top chrome of the atlas workspace, but the underlying lexicon still mixes three metaphors: "atlas", "city" (the `knowledge-city-control` module is still in the codebase), and the newer "Карта знаний" wording that appears on the `Открыть карту знаний` buttons. The "Город" tab inside `Обзор карты` is the most visible legacy term. The user has confirmed that the app is intentionally gamified and that the cosmic direction is the final visual language; this epic lines up the words with that direction.

## Product Direction

- The user-facing term for the main map is **`Карта знаний`** (not "Атлас знаний", not "Карта задач", not "City").
- The first tab inside the atlas workspace is renamed from "Город" to **`Сектора`** (single word, plural; reads as "sectors of the galaxy").
- The folder/file naming inside `src/` may still use the legacy `skill-atlas` slug for now; that is a separate refactor tracked here only if it blocks a user-facing string.
- The `knowledge-city-control` module is not deleted in this epic; it is parked for a later consolidation pass. See epic 48.

## Visual Targets

### Tab rename

- the first tab chip in the atlas workspace header reads `Сектора` instead of `Город`;
- the icon next to the label stays the same for this epic (iconography migration is part of epic 47);
- tab width adjusts to the new word length without re-flowing the row.

### Surface copy

- every user-visible string currently containing "Атлас знаний" is rewritten to "Карта знаний";
- every user-visible string currently containing "Карта задач" is rewritten to "Карта знаний";
- the section heading on the atlas workspace reads `Карта знаний` (already true on the `Открыть карту знаний` buttons; this epic extends that to the workspace heading itself);
- the `breadcrumbs` on the canvas screen use the same wording.

## Scope

Includes:

- user-facing strings in `src/components/NavigationView.tsx` (tab labels, section headings, breadcrumbs, tooltips);
- user-facing strings in `src/components/WindRoseView.tsx` (sphere labels stay, but the page heading is reviewed);
- user-facing strings in `src/components/CampaignMenu.tsx` (campaign card copy);
- the `i18n` lookup keys in `src/i18n/` if present (no deletion of keys, only value updates and key renames where the key encodes the old term);
- the `todox` placeholders in `src/` that mention "city" in user-facing contexts.

Excludes:

- renaming `src/game/skill-atlas-layout.ts` and the `skill-atlas` enum / mode strings in the data model (parked; this is a future consolidation pass and is not part of any numbered epic yet);
- deleting the `knowledge-city-control` module (parked);
- visual changes to the tab (icon, color) - handled by epic 41 and 47;
- this epic does not touch `NLH cash` or `Бакалавриат по информатике` course content beyond the surface copy.

## Success Criteria

- A `grep` for "Атлас знаний" against `src/` returns `0` hits in user-facing copy (a single comment in code that explains the migration is allowed and is annotated `// legacy term, see epic 48`).
- A `grep` for `"Город"` as a stand-alone label against `src/components/NavigationView.tsx` returns `0` hits in the tab strip.
- The atlas workspace tab order is `Сектора / Карта знаний / Папки` and is visible on both `NLH cash` and `Бакалавриат по информатике`.
- No string breaks the "Карта знаний" wording. Variants like "Карта знаний:" (with colon) and "Карта знаний —" (with em dash) are allowed.
- No `console.warn` from missing i18n keys.

## Workstreams

- `planned` - [workstreams/01-lexicon-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/40-atlas-rebrand-to-galaxy/workstreams/01-lexicon-pass.md)
- `planned` - [workstreams/02-tab-rename-to-sectors.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/40-atlas-rebrand-to-galaxy/workstreams/02-tab-rename-to-sectors.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/40-atlas-rebrand-to-galaxy/workstreams/03-verify.md)

## Suggested Sequence

1. Replace all "Атлас знаний" and "Карта задач" strings with "Карта знаний".
2. Rename the "Город" tab to "Сектора".
3. Verify with a full grep pass and a browser walkthrough.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900`;
  - mobile `390x844`;
  - `NLH cash` campaign open `Обзор карты` and confirm the new tab order;
  - `Бакалавриат по информатике` same;
  - click `Сектора` and confirm the sphere grid still renders;
  - click `Карта знаний` and confirm the canvas still renders;
  - click `Папки` and confirm the folder grid still renders;
  - console warnings/errors: `0`.
- Grep checks:
  - `rg "Атлас знаний" src/` returns 0 user-facing hits;
  - `rg '"Город"' src/components/NavigationView.tsx` returns 0;
  - `rg "Карта задач" src/` returns 0.
