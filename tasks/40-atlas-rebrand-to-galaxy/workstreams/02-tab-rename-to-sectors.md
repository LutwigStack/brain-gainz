# 02 Tab Rename To Sectors

## Status

`planned`

## Goal

Rename the first tab inside the atlas workspace from "Город" to "Сектора". The tab order becomes `Сектора / Карта знаний / Папки`. No layout change, only copy.

## Why This Matters

"Город" is the last visible user-facing legacy term from the abandoned city metaphor. The cosmic direction is now confirmed, and "Сектора" reads naturally as "sectors of the galaxy". This rename is the smallest visible change that signals the new direction and unblocks future copy work in epic 47.

## Scope

- the tab strip rendered by `NavigationView.tsx` (the `ГОРОД / КАРТА ЗНАНИЙ / ПАПКИ` chips);
- any test that asserts on the literal "Город" label;
- the i18n key that backs the tab label (rename key, do not delete).

## Requirements

- the first tab chip reads `Сектора` (title case, not all caps - this epic enforces the epic 45 rule locally as a side effect);
- the chip width grows from its current width to fit the new word without reflowing the row; if the row reflows, shorten the third tab to its icon only (decision recorded in the workstream QA notes);
- the `aria-label` of the chip is updated to `"Сектора"` for screen readers;
- the keyboard shortcut hint (if any) is preserved.

## Out Of Scope

- Replacing the tab icons (handled by epic 47);
- recoloring the tab strip (handled by epic 41);
- changing the panel that opens under "Сектора" - the sphere grid stays as-is, only the label changes.

## Implementation Hints

- The tab labels are likely defined as an array in `NavigationView.tsx` (e.g. `const tabs = ['Город', 'Карта знаний', 'Папки']`). Replace the first element with `'Сектора'`.
- If the labels come from an i18n map, update the value, then update the key, then re-run `rg` to confirm no orphan keys.
- A test in `tests/` (e.g. `navigation-tabs.test.tsx` if present) likely uses `getByRole('tab', { name: 'Город' })`. Update it to `'Сектора'`.

## Done When

- The first tab reads `Сектора` in both `NLH cash` and `Бакалавриат по информатике`.
- All tests that referenced `"Город"` are updated and pass.
- No layout regression: the tab row still fits in one line on desktop `1280x900` and on mobile `390x844`.
- No `console.warn` from a missing i18n key.
