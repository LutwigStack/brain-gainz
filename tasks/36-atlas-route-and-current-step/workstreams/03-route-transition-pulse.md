# 03 Route Transition Pulse

## Status

`planned`

## Goal

Animate a one‑shot pulse along the edge from the previous step to the new current step when the route advances.

## Why This Matters

When a learner completes a check and the route advances, the visual change on the atlas is silent: only the cyan ring swaps to a different node. There is no directional cue, so the learner has to scan the whole atlas to find "what changed". A short pulse along the new edge tells the story instantly.

## Scope

- a new transient effect in `map-layer.ts` (or a new `effects-layer` pass);
- the route metadata pipeline in `applyRouteOverlayToModel` (`route-overlay-model.ts:17-58`);
- the `BrainGainzScene` lifecycle to detect a route change.

## Requirements

- Detect when `routeNodeMetadata` changes by comparing the previous and current `currentTargetNodeId`.
- On change, schedule a one‑shot pulse along the edge from the previous `currentTargetNodeId` to the new one.
- Pulse duration: `~600ms`.
- Pulse color: `0x38bdf8` (cyan), `alpha 0.4-0.6` decay.
- Pulse is a moving dot (radius `~3px`) or a moving short stroke along the same quadratic route used by the underlying edge.
- The pulse does not persist between route advances — it plays once and disappears.

## Out Of Scope

- Multiple simultaneous pulses.
- Reversed direction (back to previous step).
- Sound or haptic feedback.

## Implementation Hints

- Track the previous `currentTargetNodeId` in `BrainGainzScene` or in a small module under `src/game/`.
- Schedule the pulse using a `pulseTime` counter similar to the existing node pulse, but with a fixed duration and a `done` flag.
- Reuse `createQuadraticRoute` from `edge-geometry.ts` for the edge path.
- Reuse `getRouteSegmentAnchors` from `map-layer.ts:218-231` for the start/end anchors.

## Done When

- Advancing the route plays a visible one‑shot pulse along the new edge.
- The pulse does not loop and does not fire on unrelated re‑renders.
- Visual test screenshot or short video clip stored under `qa/`.
