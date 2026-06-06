# 04 Node Labels On Zoom

## Status

`planned`

## Goal

Show short node titles in `skill-atlas` mode when the learner is zoomed in or focused on a branch.

## Why This Matters

`shouldShowNodeLabel` in `map-layer.ts:1219-1231` returns `false` for every node when `presentation === 'skill-atlas'`. Combined with the lack of visible sector labels and the small size of `atomic_node` (24px), learners often cannot tell which cluster they are looking at without hovering for a tooltip. The atlas reads as a sea of identical circles.

## Scope

- `shouldShowNodeLabel` in `map-layer.ts`;
- `label.style` block in `drawAtlasNode` (where applicable) in `map-layer.ts`;
- the `forceNodeLabels` prop wiring in `GameMapCanvas.tsx` (read only — make sure it propagates correctly).

## Requirements

- For `topic_node` and above, show a short `title` label at `zoom >= 0.6`.
- For the focused branch (any node with `isOnSelectedPath === true`), always show the title regardless of zoom.
- For route nodes, also show `#N` where `N` is `routeOrder` or `routeSequenceIndex`.
- Label `alpha` clamped to `0.85` so it does not fight the node badge.
- Label `wordWrapWidth` should fit within the node box and not overflow into neighbors.
- Do not show labels for `atomic_node` and below at any zoom (they are too dense).

## Out Of Scope

- Adding labels in `graph` (non‑atlas) presentation (already handled by existing rules).
- Adding multi‑line labels (single line is enough at this zoom).
- Localizing labels (they come from `node.title`).

## Implementation Hints

- Change the early return in `shouldShowNodeLabel` so atlas mode can also reach the inner conditions.
- Inside `drawAtlasNode`, set `label.text` to:
  - `routeOrder` chip (`#N`) when present,
  - then a short `title` (max ~14 characters at the chosen font size).
- Adjust `label.visible = true` only when the above conditions hold and the node is `topic_node` or larger.

## Done When

- At `zoom 0.6+`, every `topic_node`, `course_hub`, `domain_hub`, and `boss_node` displays a short title.
- The focused branch always shows titles.
- Route nodes also show their `#N` order.
- No label overlap on a `Бакалавриат по информатике` atlas at default zoom.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
