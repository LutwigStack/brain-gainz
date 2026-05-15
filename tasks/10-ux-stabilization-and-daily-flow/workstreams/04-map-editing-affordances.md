# 04 Map Editing Affordances

## Status

`planned`

## Goal

Make core map editing actions discoverable without relying on hidden gestures.

## Scope

- add visible map editing controls for select / create / connect / delete or archive
- preserve double-click and right-click as shortcuts
- show create state clearly in Free Canvas and Layers
- show connect source / target state clearly
- make gates visible only when useful, such as hover or selected node state
- clarify where new nodes are added in Layers mode
- avoid long instruction panels

## UX Direction

Users should understand how to:
- create a node
- move a node
- connect two nodes
- select an edge
- delete an edge
- archive a node

The map should feel like an editor with modes, not a canvas that only experts can operate.

## Done When

- user can create a node using a visible control
- user can initiate connection using a visible control
- map mode state is visible and cancelable
- Free Canvas and Layers mode have different create labels / states
- edge delete is discoverable after selecting an edge
- hidden gestures remain available but are not the only path

## High-Risk Scenarios

- Pixi pointer handling conflicts with React toolbar state
- connect preview creates invalid edges
- Layers mode creates a child in the wrong parent
- mobile / touch has no right-click equivalent

