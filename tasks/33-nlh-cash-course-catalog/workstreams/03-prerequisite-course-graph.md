# 03 Prerequisite Course Graph

## Status

`done`

## Goal

Create the course-level prerequisite graph for `NLH cash`.

## Scope

- prerequisite edges between courses;
- recommended follow-up edges;
- safety gates;
- cycle checks;
- core spine identification.

## Requirements

- Graph is course-level only.
- No atomic hand spots.
- Avoid cycles unless explicitly marked as soft co-requisites.
- Bankroll/risk/math/preflop must gate advanced postflop/GTO work.
- Core spine should be visible:
  - bankroll/risk;
  - poker math;
  - ranges;
  - preflop;
  - flop;
  - turn/river;
  - review routine.

## Done When

- The graph has no accidental cycles.
- Advanced courses have plausible prerequisites.
- Route generation can later use this graph.
