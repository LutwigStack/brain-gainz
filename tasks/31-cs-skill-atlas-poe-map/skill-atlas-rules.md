# Skill Atlas Rules

## 1. Scale Is The Feature

The atlas is allowed to be huge.

Target long-term scale:

- 4 academic years;
- 8 semesters;
- 40-80 courses/modules;
- 300-600 topic nodes;
- 1000+ atomic/checkable nodes.

The user should not read all nodes at once. The user should navigate by zoom, region, route focus, search, and tooltip.

## 2. Circular Layout

Use a circular/radial structure:

- center = program/root identity;
- first ring = domains;
- second ring = course/infrastructure hubs;
- outer rings = topics and atomic nodes;
- cross-links = prerequisites/applications between branches.

The map can have local clusters, but the overall silhouette should remain circular.

## 3. No Text On Normal Nodes

Normal nodes show:

- icon;
- border/state;
- tiny route marker if needed;
- small lock/check/alert indicator if needed.

They do not show:

- long title;
- description;
- check metadata;
- XP text;
- internal IDs.

Text appears in:

- hover/focus tooltip;
- selected node inspector;
- search results;
- breadcrumbs.

## 4. Node Size Language

- `root`: largest, central.
- `domain_hub`: large, visible at far zoom.
- `course_hub`: medium-large, visible at mid zoom.
- `topic_node`: medium.
- `atomic_node`: small.
- `practice_node`: small with practice icon.
- `review_node`: small with review/decay state.
- `boss_node`: large special ring/shape.

## 5. Link Language

Links are not all equal.

Use distinct styles:

- prerequisite link;
- route link;
- review/decay link;
- cross-domain application link;
- boss requirement link.

At far zoom, hide most atomic links. Keep region/course structure readable.

## 6. State Priority

When several states apply, visual priority is:

1. `current`
2. `boss`
3. `contested`
4. `weak`
5. `verified`
6. `in_progress`
7. `available`
8. `locked`
9. `self_marked`

The priority prevents unreadable mixed badges.

## 7. Learner vs Author

Learner sees:

- skill atlas;
- tooltip;
- route;
- checks;
- progress;
- weak/contested state.

Learner does not see by default:

- edge handles;
- draggable graph controls;
- raw node IDs;
- free-canvas authoring tools;
- debug metadata.

Author mode can expose those through a deliberate secondary mode.

## 8. Desktop First, Mobile Honest

The full atlas is desktop-first.

Mobile should provide:

- overview;
- current route focus;
- search;
- selected region/course;
- node details;
- next action.

Mobile does not need to show the full 1000-node atlas with the same density.



## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
