# 03 Large Map Overview And Focus

## Status

`planned`

## Goal

Make large graphs readable as an overview and keep map focus stable when users switch modes or arrive from Wind Rose.

## Scope

- improve free-canvas fit-to-content behavior for large graphs
- add or refine a visible overview/focus control
- provide a focus chip that tells the user what structure/branch/node is in view
- keep selected/current node visible without pinning it to awkward screen edges
- make route/current-step overlay readable over large graphs
- reduce surprise camera jumps when switching free canvas, layers, route filter, and Wind Rose navigation
- preserve manual pan/zoom once the user takes control

## UX Direction

Large map should answer:
- what graph am I seeing?
- where is the current focus?
- how do I get back to the overview?
- what is the route/current step if a route is active?

Overview is for orientation. Editing can require zoom, but the user should not feel lost before editing starts.

## Done When

- selecting a large graph opens with root and major sections visible
- `Fit overview` or equivalent is discoverable
- selected/current focus is named in a compact chip
- switching map modes does not unexpectedly fling the camera
- route overlay is readable enough to understand order and current target
- `Zoom in to edit` state does not block orientation

## High-Risk Scenarios

- 90+ node algebra graph
- Wind Rose branch opens map focus
- route filter toggled on/off
- inspector hidden/shown changes available canvas width
- user manually pans/zooms, then selects another node

## Suggested Tests

- unit tests for large-graph camera fit bounds
- browser screenshot QA for large graph free canvas and layers
- browser QA for Wind Rose stat -> branch -> map focus
- browser QA for inspector hide/show preserving useful map frame
