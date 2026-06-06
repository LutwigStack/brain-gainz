# 04 City Placeholder Layer

## Status

`done`

## Goal

Add `Город` as the first map layer using a deliberate placeholder surface.

## Scope

- map tab/layer UI
- city placeholder component
- infrastructure object cards/islands
- selected object transition
- desktop/mobile layout

## Requirements

- Placeholder is acceptable and expected.
- Do not attempt a final illustrated city map.
- Show 6-12 infrastructure objects.
- Each object shows:
  - object name;
  - linked course/module name;
  - short description;
  - node count;
  - control/progress state;
  - opponent pressure if available;
  - CTA `Открыть карту знаний`.
- Do not render all atomic nodes on this layer.
- Use existing assets/CSS first.
- Consume `ProgramHierarchyEntry[]` and infrastructure object mapping; do not infer city objects independently.
- Consume `ProgramMapLayerState` for selected object behavior.
- Opening an object sets `selectedObjectKey` and switches to `Карта знаний`.
- Learner mode must not show old free-canvas/editor controls as primary actions.

## Done When

- User understands the city is made of major program objects.
- Clicking/opening an object leads to its mind-map.
- Route/current focus highlights or selects the containing object when available.
- The layer feels intentional, not like an empty placeholder.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
