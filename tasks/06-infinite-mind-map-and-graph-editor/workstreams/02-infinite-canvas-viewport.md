# 02 Infinite Canvas Viewport

## Status

`done`

## Goal

Turn the map scene into an infinite canvas with stable viewport controls.

## Scope

- pan and zoom camera state
- screen/world coordinate conversion
- fit / reset viewport actions
- canvas interaction tests where practical
- explicit boundary between viewport state and graph persistence

## Done When

- the map pans smoothly
- zoom is cursor-anchored and stable
- zoom limits are defined and enforced
- pan works for mouse, touchpad, and trackpad input that the runtime exposes
- `fit to graph` and `reset camera` exist
- viewport state survives selection and in-session data refresh without mutating graph data
- viewport state is not required to survive full browser/app reload in MVP
- screen/world conversion is covered by unit tests
- the scene is no longer sized like a fixed panel map
