# 03 Richer Edge Semantics And Rail

## Status

`done`

## Goal

Make graph relations easier to understand than the current basic type labels.

## Scope

- clearer edge copy in the rail
- stronger visual distinction between edge types on canvas
- optional extension of edge metadata if needed for clearer meaning
- better grouping and explanation of incoming / outgoing edges in the rail
- one explicit semantics matrix for each edge type:
  - outgoing copy
  - incoming copy
  - arrow meaning on canvas
  - whether the relation should read as directed or associative for the user

## Done When

- users can understand what a relation means without decoding internal graph wording
- edge types are visually distinct on the map
- the rail explains incoming and outgoing edges without direction ambiguity
- the semantics matrix is consistent between rail copy and canvas direction
- any semantic expansion stays consistent with the single graph source of truth
