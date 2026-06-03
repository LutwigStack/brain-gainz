# 08 Browser QA

## Status

`done`

## Goal

Verify the map-first atlas workspace in real browser use.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open `NLH cash` atlas;
- open `Бакалавриат по информатике` atlas;
- enter focus mode;
- exit focus mode;
- hover/focus node card;
- select node and open lesson drawer;
- open check panel;
- complete/pass/fail check path if available;
- use route strip to focus current/next;
- switch to author/debug mode if available and verify controls remain accessible.

## Checks

- atlas is the dominant visual object;
- top HUD is compact;
- right inspector is not permanently occupying learner map view;
- node details are available through tooltip/card/drawer;
- route is visible without large header chips;
- focus mode hides nonessential panels;
- mobile has no horizontal overflow;
- console warnings/errors: `0`.

## Done When

- QA artifact exists under this epic.
- Screenshots are saved under `tasks/34-map-first-atlas-workspace/qa/`.
- Findings are severity-ranked with fix recommendations.
