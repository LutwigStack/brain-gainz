# Browser QA

## Status

`done`

## Target

Local app: `http://127.0.0.1:5176/`

Campaign tested: `Бакалавриат по информатике` personal copy created from the ready program card.

## Coverage

- desktop map overview;
- city layer;
- object -> knowledge map transition;
- folders layer;
- mobile `390x844` city and folders;
- learner mode old route legend hidden inside the new program layer controls;
- horizontal overflow check.

## Result

Pass.

Observed:

- city layer shows 8 infrastructure objects for CS bachelor;
- selecting a city object opens the knowledge map scoped to that object;
- folders layer shows visual cards and real atomic node titles;
- mobile `390x844` has no horizontal overflow;
- old learner route legend is hidden in the new program map controls;
- current route focus remains visible as context.

## Fixed During QA

`[P2]` Folder cards for atomic nodes initially reused the selected object title, so all child cards under an object looked identical. Fixed in `NavigationView.tsx`: object display copy is now used only for object entries, while atomic nodes render their own titles.

## Screenshots

- `qa/08-cs-city-desktop.png`
- `qa/08-cs-object-map-desktop.png`
- `qa/08-cs-folders-desktop.png`
- `qa/08-cs-city-mobile.png`
- `qa/08-cs-folders-mobile.png`


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
