# 01 Token Definition

## Status

`planned`

## Goal

Define the 8 sphere color tokens (`default`, `strong`, `soft`, plus a `text-on-strong`) and expose them as both a TypeScript constant and a CSS custom property.

## Why This Matters

A token-first color system is the only way to keep the cosmic palette consistent across the radar, the sector cards, the canvas, the panel, and the legend. Without tokens, every component re-implements the palette and a single change requires a sweep across `src/`.

## Scope

- a new file `src/theme/galaxy/sphere-tokens.ts` exporting a `sphereTokens` constant;
- the CSS custom property emission in `src/theme/pixel/` (extend the existing emitter, do not duplicate it);
- the assignment of `sphere.id` (or `sphere.slug`) → token key, captured in `src/theme/galaxy/sphere-id-to-token.ts` (or inline in `sphereTokens`).

## Requirements

### Token shape

- each sphere has the shape `{ default: string; strong: string; soft: string; textOnStrong: string; }`;
- the `textOnStrong` is computed from `strong` (white for cool `strong` stops, near-black for warm `strong` stops); the exact mapping is decided in the workstream and recorded as a comment next to the constant;
- the `soft` stop is dark enough to read as a low-saturation tint on the cosmic background (around 15-20% perceived lightness).

### Sphere → token map

- the assignment is `sphere.slug → sphere-token-key` and lives in one file;
- the slug is the same slug already used in the `referenceStyleAssets` module and in the `nlh-cash-course-catalog` and `cs-bachelor-course-catalog` modules;
- if a slug is missing, the workstream fails with a clear error rather than falling back to a default; the fallback is added in a follow-up.

### CSS emission

- the existing `applyPixelThemeCssVariables` is extended to also emit the sphere tokens as `--sphere-code-default`, `--sphere-code-strong`, etc.;
- the emission order matches the order of `sphereTokens` so that downstream grep is stable.

## Out Of Scope

- Recoloring any component (epic 41 workstream 02);
- Adding a `sphere-projects` contrast review (epic 45);
- Theming beyond the sphere palette (the rest of the cosmic palette is epic 47).

## Implementation Hints

- Use `as const` on the export so that consumers get literal types instead of `string`.
- The `textOnStrong` choice can be hand-coded for the 8 `strong` stops; do not try to compute it from HSL until a later pass.
- If the project already has a `tokens.ts` with a generic color palette, do not mix the sphere tokens into it; keep them in `src/theme/galaxy/` so the file tree reflects the visual direction.

## Done When

- `src/theme/galaxy/sphere-tokens.ts` exports the 8 spheres × 4 stops.
- The CSS custom properties `--sphere-*-{default,strong,soft,textOnStrong}` are emitted on the root element.
- A unit test (if the project uses `node --test`) verifies that every sphere slug in the catalog has a token and that every token has 4 stops.
- No new `console.warn` from missing keys.
