# Layout Rules

## 1. Atlas Owns The Screen

Default desktop target:

- atlas/canvas area: 70-85% of usable width;
- HUD/header: one compact row;
- inspector/details: collapsed unless selected action requires it.

If the map is visible, the map should be the largest object.

## 2. Cards Are Overlays

Cards should appear as:

- tooltip;
- floating preview card;
- right drawer;
- bottom sheet;
- modal only for focused check/confirmation.

Cards should not permanently box the map into a small central region.

## 3. HUD Instead Of Header Stack

Map HUD should carry only:

- campaign/program name;
- active layer;
- current object/region;
- current route node;
- primary map actions.

Everything else should be behind details.

## 4. Inspector Is A Drawer

Collapsed state:

- selected node title;
- state;
- one primary action.

Expanded state:

- lesson overview;
- check UI;
- mastery;
- route actions.

Author/debug metadata is hidden in learner mode.

## 5. Tooltip First

Hover/focus/tap preview should be enough to decide:

- what node is this;
- why it matters;
- what state it is in;
- what action is available.

Full lesson opens only after explicit action.

## 6. Route Strip

The current route should be shown as a compact strip:

- current;
- next 3-5;
- weak/review items;
- boss/checkpoint if relevant.

It should not become another large panel.

## 7. Focus Mode

Focus mode hides:

- left rail;
- top context;
- right drawer;
- secondary route details.

Focus mode keeps:

- atlas;
- tiny HUD;
- zoom/search/current;
- exit action;
- tooltip/floating card.

## 8. Mobile

Mobile should not try to show desktop rail + map + inspector simultaneously.

Use:

- full-width atlas;
- bottom HUD;
- bottom sheet for node details;
- compact route strip;
- accessible close/back actions.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
