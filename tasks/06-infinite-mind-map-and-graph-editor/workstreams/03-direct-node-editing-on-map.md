# 03 Direct Node Editing On Map

## Status

`done`

## Goal

Allow users to create, position, and remove nodes directly on the canvas.

## Scope

- create node at canvas position inside a resolved skill context
- drag node and persist coordinates
- archive node from map workflows
- keep rail selection and map selection in sync
- define failure behavior for map mutations

## Done When

- users can create nodes directly on the map with a deterministic `skill_id`
- create flow is explicitly defined for MVP:
  - toolbar/button entry
  - canvas position target
  - skill context resolution
  - default title policy before or during insert
- dragging a node persists its new position
- drag threshold does not conflict with click-to-select
- archive flow updates graph and selection correctly
- map mutation failure leaves selection and persisted coordinates consistent
- the rail reflects map-driven edits without stale state
- node creation defines one clear MVP title policy:
  - create with a deterministic default title and allow immediate rename in the rail/editor
