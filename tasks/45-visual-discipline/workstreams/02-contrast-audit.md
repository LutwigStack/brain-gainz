# 02 Contrast Audit

## Status

`planned`

## Goal

Rewrite the `text-muted` token so that body copy on `--surface-base` reaches WCAG AA (≥ 4.5:1). The new value is still recognisable as "muted" - the goal is not to match `text-default`.

## Why This Matters

The current `text-muted` sits at roughly 3.2:1 on `--surface-base`. That is below AA, and on the deep-space background the canvas is moving to (epic 47) the contrast will get worse, not better. A single token rewrite fixes every place that uses the token, with no per-component edit.

## Scope

- the `text-muted` token in `src/theme/pixel/tokens.ts` (or the new `src/theme/galaxy/` module if it exists);
- the `tailwind` config (or equivalent utility-class generator) so that the token is exposed as `text-text-muted` (or the project's naming);
- the test that asserts the contrast of body copy (if it exists; if not, this epic adds it).

## Requirements

### Token rewrite

- the new `text-muted` value lands in the 5.0-6.0:1 range against `--surface-base`;
- the value is picked from a perceptual ramp, not from a random greyscale (slate-300 to slate-400 is the typical range);
- the new value is recorded next to the token with a short comment that names the contrast ratio and the background it was tested against.

### Test

- a new unit test (in `tests/` or wherever the project's `node --test` lives) asserts:
  - `text-emphasis` on `--surface-base` ≥ 7.0;
  - `text-default` on `--surface-base` ≥ 4.5;
  - `text-muted` on `--surface-base` ≥ 4.5;
  - `text-subtle` on `--surface-base` ≥ 3.0 (the test is here so that future tweaks do not silently break the floor).
- the test uses the standard WCAG contrast formula, not a hand-rolled one.

### Tailwind / utility classes

- the new token is exposed as a utility class (e.g. `text-text-muted`);
- the old class name still works (the project does not break older stylesheets in this epic).

## Out Of Scope

- Recoloring the canvas (epic 47);
- Recoloring the cosmic background (epic 47);
- Touching `text-subtle` for non-text use (icons, dividers); it stays as it is for those uses.

## Implementation Hints

- Use a contrast checker like https://webaim.org/resources/contrastchecker/ to pick the value, then paste the formula into the test.
- Keep the rewrite to a single line change in the tokens file; resist the temptation to do a bigger pass in this epic.

## Done When

- The `text-muted` token is rewritten and recorded with a contrast comment.
- The new contrast test passes.
- The visual change is unannounced but the muted text is now readable on `--surface-base`.
- No regression in any other token.
- `npm run lint`, `npm run test`, `npm run build` all pass.
