# 08 CS Browser QA

## Status

`done`

## Goal

Verify the three-layer map model on `Бакалавриат по информатике`.

## QA Matrix

Viewports:

- desktop `1280x900`
- mobile `390x844`

Scenarios:

- open CS bachelor personal campaign;
- open `Город`;
- open an infrastructure object;
- inspect `Карта знаний` scoped to that object;
- switch to `Папки`;
- navigate nested folders;
- select an atomic node;
- return to city layer;
- open Today/current route focus and verify it lands on the correct object/layer;
- complete one node check/assessment from the redesigned map path;
- verify learner mode does not show editor/free-canvas controls as primary actions;
- verify author/debug mode can still access old editor powers through the intended secondary path;
- verify route focus outside the current object shows a deterministic fallback or switches object clearly;
- verify no horizontal mobile overflow.

Checks:

- console warnings/errors: `0`;
- tabs/layers are understandable without reading code;
- city layer does not show all atomic nodes;
- mind-map does not show the full program by default;
- folders are visual containers, not a text list;
- selected object context survives layer switches.
- learner/author boundary is visually clear;
- check flow still reaches pass/fail/result without regression;
- Today route focus does not open an arbitrary full-program map.

## Done When

- QA artifact exists under this epic.
- Screenshots are saved under `tasks/30-program-map-layers-and-cs-content/qa/`.
- Findings are severity-ranked with fix recommendations.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
