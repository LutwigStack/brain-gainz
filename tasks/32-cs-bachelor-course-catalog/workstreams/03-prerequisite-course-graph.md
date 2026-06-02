# 03 Prerequisite Course Graph

## Status

`done`

## Goal

Create the course-level prerequisite graph.

## Scope

- prerequisite edges between courses;
- recommended follow-up edges;
- cross-region dependency edges;
- cycle checks;
- core spine identification.

## Requirements

- Graph is course-level only.
- No atomic node prerequisites.
- Avoid cycles unless explicitly marked as soft co-requisites.
- Core spine should be visible:
  - programming;
  - discrete math/proofs;
  - data structures;
  - algorithms;
  - systems;
  - probability/statistics.

## Done When

- The graph has no accidental cycles.
- Each advanced course has plausible prerequisites.
- Course route generation can later use this graph.
