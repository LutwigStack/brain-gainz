# 45 Visual Discipline

## Status

`planned`

## Goal

Establish two global rules and apply them across the app:

1. **ALL CAPS is reserved for section headings.** No body copy, button label, chip, or table cell uses all caps unless it is the heading of a `section`.
2. **Secondary text meets WCAG AA on the cosmic background.** The muted / secondary token pair gains enough contrast to be readable on the deep-space background the canvas is moving to in epic 47.

## Why This Epic Exists

Two long-standing review notes from the user:

- the app screams in caps: `РЕЖИМ УЧЕНИКА`, `ПРОГРЕСС УЗЛА`, `УЧЕБНЫЙ ПУТЬ`, `ОСВОЕНИЕ`, `ЗАДАЧИ ДНЯ`, `МИНИ-КАРТА`, `ПОДРОБНОСТИ`, `0/100`, `СТАРТ`, `ПОДТВЕРЖДЕНО`, `САМООЦЕНКА`. The pattern trains the eye to read the loudest thing first, which is usually the wrong thing;
- the secondary text (`text-muted`, `text-subtle`) sits on a deep navy background and is hard to read at small sizes.

This epic turns both into enforced rules and a single audit pass.

## Product Direction

- The grammar of capitalization is fixed:
  - **Section heading**: ALL CAPS allowed.
  - **Sub-heading**: Title Case.
  - **Body / button / chip / label / value**: Sentence case (first letter capitalised, the rest lowercase, Russian style: only the first letter of the whole sentence capital).
  - **Proper noun (e.g. `NLH cash`)**: kept as the brand writes it.
  - **Acronym (e.g. `CS`, `AI`, `XP`)**: kept as the acronym.
- The contrast rule:
  - `text-emphasis` on `--surface-base` ≥ 7:1 (AAA).
  - `text-default` on `--surface-base` ≥ 4.5:1 (AA).
  - `text-muted` on `--surface-base` ≥ 4.5:1 (AA) - this is the change.
  - `text-subtle` on `--surface-base` ≥ 3:1 (AA Large) - for non-text affordances only, no body copy.

## Visual Targets

### Capitalization

- the section heading `ОБЗОР ПРОГРЕССА` (still in some ux-research screenshots) becomes `Обзор прогресса` and lives under a `section` heading rule, not in body copy;
- the right panel block names (`Режим ученика`, `Прогресс узла`, `Учебный путь`, `Освоение`) are now Sentence case;
- the chips in the right panel (`Подтверждено`, `Самооценка`) are Sentence case;
- the section titles in the app shell (`Программы`, `Сегодня`, `Обзор карты`, `Изучать`, `Прогресс`, `Настройки`) are Title Case; ALL CAPS is reserved for the `<h1>` of the app shell if the design ever needs it.

### Contrast

- the `text-muted` token is changed from a low-contrast grey to a high-contrast slate that still reads as "muted" but stays above 4.5:1 on `--surface-base`;
- the `text-subtle` token is unchanged for non-text use (icons, dividers) but is removed from the type ramp; body copy cannot reference it;
- the change is a single token rewrite in `src/theme/pixel/tokens.ts` (or the equivalent theme file); no per-component edit is needed.

## Scope

Includes:

- the audit pass that finds every ALL CAPS string and every reference to `text-muted` / `text-subtle` in body copy;
- the token rewrite in `src/theme/pixel/tokens.ts` (or the new `src/theme/galaxy/` module if it exists by then);
- the `tailwind` config if the project uses Tailwind, so that the new tokens are exposed as utility classes;
- the i18n keys (values, not keys) for the renamed strings.

Excludes:

- The capitalization of brand strings (`NLH cash`, `BrainGainz`, `POE`);
- The capitalization of section headings inside the cosmic canvas (epic 47; the rule applies there too but the work is done as part of the canvas redraw);
- The capitalization of static documentation pages under `docs/` (epic 48).

## Success Criteria

- A `rg` for `text-subtle` in body copy returns 0 hits in `src/components/`.
- A `rg` for two-or-more consecutive capital letters inside a string literal returns 0 hits in `src/components/`, with the documented exceptions (section headings, brands, acronyms).
- The contrast check (axe or a manual check via the dev tools) reports 0 AA violations on `text-muted` against `--surface-base`.
- The visual change is unannounced: a learner who did not see the diff cannot tell the muted text changed, only that it is now readable.

## Workstreams

- `planned` - [workstreams/01-caps-audit.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/45-visual-discipline/workstreams/01-caps-audit.md)
- `planned` - [workstreams/02-contrast-audit.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/45-visual-discipline/workstreams/02-contrast-audit.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/45-visual-discipline/workstreams/03-verify.md)

## Suggested Sequence

1. Run the caps audit; rewrite strings.
2. Rewrite the muted token; verify the token shows up correctly.
3. Verify both rules on the live app.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900` and mobile `390x844`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - walk through `Сегодня`, `Обзор карты`, `Изучать`, `Прогресс` and confirm no string is yelling;
  - zoom the secondary text to 200% and confirm it stays readable;
  - console warnings/errors: `0`.
- Grep:
  - `rg "text-subtle" src/components/` → 0 body-copy hits;
  - `rg '"[А-ЯЁ]{2,}[А-ЯЁ ]*"' src/components/` → 0 hits except in documented exceptions;
  - `rg '"[A-Z]{2,}[A-Z ]*"' src/components/` → 0 hits except in documented exceptions.
- Contrast:
  - axe or Lighthouse audit of the home page returns 0 AA violations.
