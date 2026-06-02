# 01 CS Program Content Audit

## Status

`done`

## Goal

Audit and shape `Бакалавриат по информатике` as a content-first program graph before changing map UI.

## Scope

- inspect current CS bachelor seed/content
- identify domains, modules, object candidates, and atomic nodes
- document gaps in the current CS content
- propose the minimum content adjustments needed for map-layer testing

## Requirements

- Do not start from the game map.
- Start from the educational structure.
- Identify the largest domains.
- Identify lower-level atomic concepts/checks.
- Identify which containers should become infrastructure objects.
- Keep the first implementation practical; do not rewrite the whole bachelor program in one pass.

## Deliverable

Create a QA/design artifact under this epic:

- `cs-content-map.md`

It should include:

- current structure summary;
- proposed domains;
- proposed infrastructure objects;
- example atomic nodes per object;
- missing content/gaps;
- implementation recommendation.

## Done When

- Agents can implement map layers without guessing what counts as a city object.
- CS bachelor has enough structure to test `город -> объект -> mind-map -> node`.
