# 42 Sphere Cards With Mini Preview And Progress Arc

## Status

`planned`

## Goal

Replace the empty circular dot at the top of each sphere card in the `Сектора` tab with two visual elements: a small stylized mini-preview of the sphere's own knowledge map (top) and a progress arc that shows the share of completed nodes in that sphere (bottom-right of the card). The card stays the same size as today.

## Why This Epic Exists

Each sphere card in the `Сектора` grid currently shows an empty dot in the top-left, a sphere name, a description, a small `N узл.` counter, and a `Открыть карту знаний` button. The empty dot is wasted space; it does not tell the learner what is inside the sphere, nor how far they are. A mini-preview + a progress arc turns the card from a label into a glanceable summary, which is what the user asked for in the original review.

## Product Direction

- the mini-preview is a stylised, abstract representation of the sphere's knowledge map - it is **not** a live render of the canvas. It is a static SVG that mirrors the silhouette of the sphere's node cluster in `Карта знаний`.
- the progress arc is a thin ring around the mini-preview, filled clockwise to the share of `completed` / `total` nodes in the sphere.
- the color of the arc and the dots in the mini-preview is the sphere's `default` token (from epic 41). The focused sphere (the one currently open on the canvas) uses the `strong` token.
- the description under the name is shortened to a single sentence; the full description is shown on hover.

## Visual Targets

### Card layout

- the card is a fixed height (around 220px) and a flexible width inside the grid;
- the top half is the mini-preview zone (about 120px tall), the bottom half is the meta zone (name, counter, progress percentage, button);
- the mini-preview is centered horizontally, with 16px of inner padding on the top, left, and right;
- the progress arc is a 3px stroke ring around the mini-preview circle, starting at the top (12 o'clock) and going clockwise.

### Mini-preview

- a 96px diameter circle filled with `--sphere-{slug}-soft`;
- inside, 6 to 12 small dots in `--sphere-{slug}-default`, scattered in a deterministic but irregular pattern (same pattern for the same sphere across all sessions, so the card is recognisable);
- one of the dots is slightly larger (1.5x) and is filled with `--sphere-{slug}-strong`; that dot represents the "current" node inside the sphere;
- the dots are pure decoration; they are not clickable in this epic.

### Progress arc

- the arc shows `completed / total` as a percentage;
- if `total` is 0, the arc is hidden;
- the percentage is shown as a small label inside the card, near the button: `N%`;
- the text label uses `--sphere-{slug}-strong` for emphasis.

## Scope

Includes:

- the `SphereCard` (or equivalent) component used by the `Сектора` grid in `NavigationView.tsx`;
- the data shape for the card (it already has `nodesCount`; this epic adds `completedCount` if missing);
- the static SVG mini-preview generator (a new `src/components/galaxy/SphereMiniPreview.tsx`);
- the progress arc component (a new `src/components/galaxy/ProgressArc.tsx`);
- the unit test for the deterministic dot pattern.

Excludes:

- Live rendering of the actual canvas (the mini-preview is static; live render is too heavy and would make the grid slow);
- A clickable mini-preview that opens the canvas (out of scope; the button already does that);
- Recolor of the cards (epic 41).

## Success Criteria

- Every sphere card in the `Сектора` tab shows a mini-preview and a progress arc.
- The mini-preview pattern is the same across reloads for the same sphere (deterministic).
- The percentage in the arc matches the data shown in the right `Занятие` panel for the same sphere.
- The focused sphere's mini-preview uses the `strong` token.
- No regression in the grid layout (still 4 columns on desktop, 2 on tablet, 1 on mobile).

## Workstreams

- `planned` - [workstreams/01-mini-preview-component.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/42-sphere-cards-preview-arc/workstreams/01-mini-preview-component.md)
- `planned` - [workstreams/02-progress-arc.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/42-sphere-cards-preview-arc/workstreams/02-progress-arc.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/42-sphere-cards-preview-arc/workstreams/03-verify.md)

## Suggested Sequence

1. Build the `SphereMiniPreview` and the `ProgressArc` components in isolation, with tests.
2. Wire them into the sphere card in `NavigationView.tsx`.
3. Verify visually and via the data flow test.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900` and mobile `390x844`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - confirm 8 cards, each with a mini-preview and an arc;
  - hover a card and confirm the focus state is visible;
  - click `Открыть карту знаний` and confirm the canvas still opens correctly;
  - console warnings/errors: `0`.
- Snapshot tests:
  - the mini-preview SVG snapshot is stable across runs (deterministic);
  - the progress arc renders the right percentage for a sample of `completed / total` pairs.
