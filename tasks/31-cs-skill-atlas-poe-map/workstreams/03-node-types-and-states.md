# 03 Node Types And States

## Status

`done`

## Goal

Define and implement visual node types and state priority.

## Scope

- node visual types
- node states
- state priority
- lock/current/verified/weak/contested/boss styling
- accessible labels

## Requirements

- Use icon + state, not text labels, for normal nodes.
- Use larger shapes for domain/course/boss nodes.
- Keep state priority deterministic.
- `current` route focus must be visible immediately.
- `contested` and `weak` must be visible without overwhelming the map.
- `self_marked` must stay visually weaker than `verified`.

## Done When

- Every node type has a clear shape/size.
- Every important state has a distinct visual treatment.
- Mixed states resolve predictably.
- User can spot current, verified, weak, contested, and boss nodes at a glance.

