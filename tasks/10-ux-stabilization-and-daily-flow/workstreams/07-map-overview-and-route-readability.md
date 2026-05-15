# 07 Map Overview And Route Readability

## Status

`planned`

## Goal

Make large graphs and route overlays readable without losing map editing usefulness.

## Scope

- improve large graph overview for structures such as `Алгебра I · 91 узл.`
- fit visible graph after structure / branch selection
- reduce label clipping at inspector boundary
- allow inspector collapse or overview-friendly layout
- improve route overlay ordering, current target, stage, and completion states
- prevent unexpected camera jumps / zoom / focus changes
- make minimap support navigation without competing with the content

## UX Direction

Overview should answer:
- what are the main branches?
- where am I?
- what is the current route target?
- what is done versus not done?

Detailed editing can appear after focus; overview should not start as a cropped fragment.

## Done When

- opening a large graph shows a readable overview before detailed editing
- selected branch from Wind Rose opens with expected focus and fit
- route current item is visually distinct
- route order is readable without excessive label clutter
- complete / incomplete route nodes are visually distinct
- inspector can be collapsed or made less dominant while reviewing overview

## High-Risk Scenarios

- structure switch from small graph to large graph
- Wind Rose branch-to-map transition
- route filter active with route nodes hidden outside filter
- canvas mode switch between Free Canvas and Layers
- long node titles

