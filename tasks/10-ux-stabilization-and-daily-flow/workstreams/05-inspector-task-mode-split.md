# 05 Inspector Task Mode Split

## Status

`planned`

## Goal

Split the node inspector into clear task modes so users do not have to parse every node operation at once.

## Scope

- introduce inspector sections or tabs:
  - Overview
  - Route
  - Check / Assessment
  - Graph
- keep selected node identity obvious
- keep primary action tied to the active mode
- separate route membership from assessment submission
- keep graph stats and structure tree secondary
- improve mobile inspector placement

## UX Direction

The inspector should first communicate:
- this is the selected node
- this is its current state
- this is the next useful action

Editing, routing, self-marking, assessment, and graph maintenance should not all compete in the same visual block.

## Done When

- selected node panel title and path are clear
- assessment controls are reachable without deep desktop scrolling
- route controls have their own mode or grouped section
- graph stats and tree navigation no longer crowd mastery / assessment
- mobile map does not bury the inspector behind excessive canvas height
- switching selected nodes does not cause surprising rail layout jumps

## High-Risk Scenarios

- current inline editor / modal editor state
- selected edge versus selected node
- archived node state
- route item update state
- compact mobile layout

