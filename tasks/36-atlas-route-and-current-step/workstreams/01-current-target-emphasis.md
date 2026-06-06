# 01 Current Target Emphasis

## Status

`planned`

## Goal

Make the current route step the most readable single node on the atlas.

## Why This Matters

`drawAtlasNode` in `map-layer.ts:1043-1164` adds a single thin outer ring (`radius + 13`, `alpha 0.54`) when `isCurrentRouteTarget` is true, plus a pulse from `tick`. The visual weight is similar to other `isOnSelectedPath` or `isActiveBranchHub` nodes. There is no "checkpoint" marker above the node, no double pulse, and the cyan color matches several other states at low contrast.

## Scope

- the `isCurrentRouteTarget` branch in `drawAtlasNode` (`map-layer.ts:1140-1143`);
- the `pulse` drawing in `map-layer.ts:1082-1088`;
- the `tick` pulse animation in `map-layer.ts:391-401`.

## Requirements

- Add a second outer pulse ring at `radius + 18` with `color 0xfacc15` (warm yellow) and `alpha 0.32-0.48`.
- Add a small "checkpoint" marker above the node: a small triangle (`size ≈ 6px`) at `(0, -radius - 14)`, `color 0x38bdf8`, `alpha 0.95`.
- Pulse animation must use two phases:
  - inner ring scales `1.0 -> 1.15` over `~1.2s`;
  - outer ring scales `1.0 -> 1.25` over `~1.8s`, offset by `~0.6s`.
- Marker must not occlude the node label (workstream 04 of epic 35).

## Out Of Scope

- Adding sound or haptic feedback.
- Changing the existing `isOnSelectedPath` visuals.
- Adding a "current" badge to the route strip (handled in workstream 02).

## Implementation Hints

- Use the existing `pulses` map in `map-layer.ts` — it already supports multiple pulses per node id if you index by `(nodeId, phase)`.
- The `tick` function should iterate both phases and advance them independently.
- The checkpoint marker is drawn once in `drawAtlasNode`; no per‑frame animation needed.

## Done When

- The current step node has an inner cyan pulse and an outer yellow pulse, both visibly different.
- A small checkpoint marker sits above the node without overlapping the label.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
