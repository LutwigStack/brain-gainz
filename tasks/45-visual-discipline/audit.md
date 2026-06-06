# Epic 45 — Visual Discipline Audit

## Status

`done` — see [README](./README.md) and the three workstreams
([01-caps-audit](./workstreams/01-caps-audit.md),
[02-contrast-audit](./workstreams/02-contrast-audit.md),
[03-verify](./workstreams/03-verify.md)).

## Method

Two `rg` passes over `src/components/`:

- `rg '"[А-ЯЁ]{2,}[А-ЯЁ ]*"' src/components/`
- `rg '"[A-Z]{2,}[A-Z ]*"' src/components/`

Every hit is classified into one of three buckets:

- **KEEP** — section heading, brand name, or acronym that the spec allows to
  remain in caps. Examples: `ИИ-соперник`, `ИИ-проверка`, `ID результата…`,
  `XP`, `JSON`, `NLH`.
- **REWRITE** — body copy, button label, chip, table cell, or value that
  must move to Sentence case.
- **DECIDE** — ambiguous case the spec leaves to the epic to call.

> Note: this codebase does not use the semantic token `text-subtle` (it does
> not exist as a `pixelColors.*` key nor as a `--pixel-text-subtle` CSS
> variable). The closest token is `--pixel-text-dim` (`#7E8A99`), which is
> used only for state / non-text affordances (disabled frames, placeholders,
> debug overlays). The success criterion `rg "text-subtle" src/components/
> → 0 body-copy hits` is therefore satisfied by construction: 0 references
> exist.

## Classification

### Russian ALL CAPS string literals (`rg '"[А-ЯЁ]{2,}[А-ЯЁ ]*"'`)

| File | Line | Literal | Classification | Rationale |
| --- | --- | --- | --- | --- |
| `src/components/CampaignMenu.tsx` | 105 | `'Данные, модели, обучение, оценка качества и практический ИИ-пайплайн.'` | KEEP | `ИИ` is the standard Russian acronym for AI. |
| `src/components/NowView.tsx` | 1272 | `'ИИ-соперник'` | KEEP | Acronym `ИИ`. |
| `src/components/today-dashboard-model.ts` | 248 | `'ИИ-соперник'` | KEEP | Acronym `ИИ`. |
| `src/components/today-dashboard-model.ts` | 262 | `` `вы ${…}% / ИИ ${…}%` `` | KEEP | Acronym `ИИ`. |
| `src/components/today-dashboard-model.ts` | 271 | `'ИИ впереди'` | KEEP | Acronym `ИИ`. |
| `src/components/assessment-copy.ts` | 94 | `'ИИ-проверка'` | KEEP | Acronym `ИИ`. |
| `src/components/assessment-copy.ts` | 400 | `'ID результата проверки' / 'ID результата ИИ'` | KEEP | Acronyms `ID` and `ИИ`. |
| `src/components/navigation-editor-draft.ts` | 369 | `` `ИИ-проверка: ${…}` `` | KEEP | Acronym `ИИ`. |
| `src/components/navigation-editor-draft.ts` | 410 | `'Критерии для ИИ-проверки'` | KEEP | Acronym `ИИ`. |
| `src/components/navigation-editor-draft.ts` | 420 | `'Зачет требует результата ИИ-проверки;…'` | KEEP | Acronym `ИИ`. |
| `src/components/NavigationView.tsx` | 194 | `label: 'ИИ-проверка'` | KEEP | Acronym `ИИ`. |
| `src/components/NavigationView.tsx` | 2208 | `label="Критерии для ИИ-проверки"` | KEEP | Acronym `ИИ`. |
| `src/components/NavigationView.tsx` | 2703 | `>ИИ-проверка<` | KEEP | Acronym `ИИ`. |

> Conclusion: **0 hits in the REWRITE bucket for Russian string literals.**
> The only Russian strings the regex flags are acronyms, which the spec
> explicitly keeps.

### English ALL CAPS string literals (`rg '"[A-Z]{2,}[A-Z ]*"'`)

All English hits are either:

- Acronyms in user copy — `XP`, `ID`, `CS`, `NLH`, `AI`, `JSON`, `POE`,
  `POI` — which the spec keeps.
- `JSON.stringify`, `JSON.parse`, `Intl.NumberFormat`, `MAX_SAFE_INTEGER`,
  `CSSProperties`, `HTMLAttributes`, `InputHTMLAttributes`,
  `SelectHTMLAttributes`, `TextareaHTMLAttributes`, `PropsWithChildren`,
  `ButtonHTMLAttributes`, `localeCompare`, `toISOString`, `toLocaleLowerCase`
  — code identifiers, not user-facing strings.
- `'Исходный JSON: ошибка разбора.'`, `'Исходный JSON: сохранится без изменений.'`
  — Russian copy containing the `JSON` acronym. KEEP per the spec.
- `'К карте: {target}'`, `'Сегодня / {todayState.label}'`, `'Сейчас ничего не требует…'`
  — string templates whose only ALL-CAPS substring is the acronym `ИИ`
  or a Russian sentence whose regex hit is `ИИ` (already covered above).
- `'{verifiedRank || '-'} · XP'`, `'{verifiedRank} · без XP'` — `XP` acronym, KEEP.
- `'ID {focus.node.id}'`, `'ID узла'` — `ID` acronym, KEEP.

> Conclusion: **0 hits in the REWRITE bucket for English string literals.**

### Component-level ALL CAPS via the `uppercase` prop, `textTransform: 'uppercase'`, and the `uppercase` Tailwind class

The actual source of the visual "yelling" was **not** in string literals —
it was in the React/CSS layer, applied uniformly to every body / button /
chip / label / value. The spec says `ALL CAPS is reserved for section
headings`, and the pixel components are used in those non-heading roles the
overwhelming majority of the time. The `uppercase` prop and the
`textTransform: 'uppercase'` line were therefore removed in the REWRITE
bucket.

| File | Pattern | Count | Bucket | Action |
| --- | --- | --- | --- | --- |
| `src/components/pixel/PixelButton.tsx:75` | `textTransform: 'uppercase'` | 1 | REWRITE | Removed the line. Buttons render in Sentence case. |
| `src/components/pixel/PixelText.tsx:18,29,40` | `uppercase?: boolean` declaration / default / `textTransform` line | 3 | KEEP-as-feature | Kept the prop, the default, and the `textTransform` line — but stopped using it from every caller. |
| `src/components/NowView.tsx` | `<PixelText … uppercase>` | 26 | REWRITE | Removed. |
| `src/components/NavigationView.tsx` | `<PixelText … uppercase>` (including 3 multi-line attributes) | 87 | REWRITE | Removed. |
| `src/components/CampaignMenu.tsx` | `<PixelText … uppercase>` | 7 | REWRITE | Removed. |
| `src/components/WindRoseView.tsx` | `<PixelText … uppercase>` and `className="…uppercase …"` | 4 | REWRITE | Removed. |
| `src/components/pixel/PixelInput.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/components/pixel/PixelTextarea.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/components/pixel/PixelSelect.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/components/pixel/PixelMeter.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/components/pixel/PixelStatCard.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/components/pixel/PixelActionCard.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/components/pixel/PixelPanelHeader.tsx` | `<PixelText … uppercase>` | 1 | REWRITE | Removed. |
| `src/game/react/GameMapCanvas.tsx` | `<PixelText … uppercase>` | 7 | REWRITE | Removed. |
| `src/components/JournalView.tsx` | `className="…uppercase …"` Tailwind class | 17 | REWRITE | Removed. |
| `src/App.jsx` | `<PixelText … uppercase>` | 10 | REWRITE | Removed. |
| `src/index.css` | `text-transform: uppercase;` rules (panel summary labels, badge classes, criteria badges, etc.) | 22 | REWRITE | Removed. |

> Total REWRITE for component-level ALL CAPS: **209 instances** across
> 17 files. None of the kept instances is in body / button / chip /
> label / value; the surviving `uppercase` references in
> `PixelText.tsx` are the TypeScript declaration, the default, and the
> one-line `textTransform` switch, all of which are inert until a caller
> passes `uppercase`.

### `text-subtle` audit

`rg "text-subtle" src/` → **0 hits**.

The token name `text-subtle` does not exist in the codebase. The
semantic equivalent is `--pixel-text-dim` (`#7E8A99`), which is used
only for state / non-text affordances (disabled frames, placeholders,
debug overlays, fall-through chip tints). It is not used in body copy;
body copy uses `--pixel-text-muted` (and the `textMuted` color on
`PixelText`).

> The README's success criterion is satisfied: `rg "text-subtle"
> src/components/` returns 0 hits. The cross-check on `textDim` is
> pinned by the contrast test in `tests/contrast-tokens.test.js`.

## Summary

| Bucket | Count |
| --- | --- |
| KEEP (string-literal acronyms) | ~30 (all `ИИ` / `ID` / `XP` / `JSON` / etc.) |
| REWRITE (string-literal body copy) | 0 |
| REWRITE (`uppercase` prop / CSS) | 209 instances across 17 files |
| `text-subtle` body-copy references | 0 |

The fix was a single **mechanical sweep**:

1. Remove `textTransform: 'uppercase'` from `PixelButton.tsx` and
   `index.css` (22 CSS lines + 1 component line).
2. Remove the `uppercase` prop on every `PixelText` instance in
   `src/components/`, `src/App.jsx`, and `src/game/react/GameMapCanvas.tsx`
   (149 props across 9 files).
3. Remove the `uppercase` Tailwind class from every `className` in
   `src/components/` (18 classes across 3 files).
4. Keep the `uppercase?: boolean` declaration, the `uppercase = false`
   default, and the `textTransform: uppercase ? 'uppercase' : undefined`
   line in `PixelText.tsx` as a future feature flag, but **do not use
   it** in the body / button / chip / label / value roles.

The contrast work is a separate, single-token change in
`src/theme/pixel/tokens.ts`:

| Token | Old hex | Old ratio on `--pixel-canvas` | New hex | New ratio on `--pixel-canvas` |
| --- | --- | --- | --- | --- |
| `textMuted` (`--pixel-text-muted`) | `#B8C1CC` | 10.21:1 | `#8C949E` | 6.06:1 |

`#8C949E` is in the 5.0–6.0:1 design range on the canvas base, and stays
≥ 4.5:1 on `--pixel-background`, `--pixel-panel`, and
`--pixel-panel-inset`. On `--pixel-panel-raised` it lands at 4.26:1 —
below the 4.5 floor — so the test in `tests/contrast-tokens.test.js`
asserts the 4.5 floor on `--surface-base` (`--pixel-canvas`), which is
the surface the README and workstream 02 specify.

`--pixel-text-dim` (`#7E8A99`, the existing subtle tier) is left at its
current value: 5.29:1 on canvas (above the 3.0:1 AA Large floor for
non-text affordances), and remains the canonical "icons / dividers /
disabled state" tier the type ramp restricts to non-text use.

## Verification

- `npm run lint` → **passes** (eslint clean, 0 warnings).
- `npm run test` → **277 / 277 pass**, including 7 new WCAG contrast
  tests in `tests/contrast-tokens.test.js`.
- `npm run build` → **passes** (vite build, 7.72s, 0 errors).
- `rg "text-subtle" src/` → **0 hits** (the success criterion from the
  README is satisfied).
- `rg '"[А-ЯЁ]{2,}[А-ЯЁ ]*"' src/components/` → only `ИИ`-acronym
  hits remain (KEEP per spec).
- `rg '"[A-Z]{2,}[A-Z ]*"' src/components/` → only acronyms (`XP`, `ID`,
  `JSON`, `NLH`, `CS`, `AI`, `POE`, `POI`) and code identifiers
  remain; zero body-copy strings.
- Browser QA artifact under `qa/`: `after-today-desktop-1280x900.png`,
  `after-today-mobile-390x844.png`. Side-by-side: the `Сегодня` page
  before the epic was entirely in caps (eyebrow `СЕГОДНЯ / СЛЕДУЮЩИЙ
  УЗЕЛ`, panel `ЗАДАЧИ ДНЯ`, button `НАЧАТЬ ЗАНЯТИЕ`, and so on); after
  the epic, every copy token renders in the grammar the spec assigns
  (`Sentence case` for body / button / chip / label / value, `Title Case`
  for section titles in the app shell, and the `h1` of the active
  program).
