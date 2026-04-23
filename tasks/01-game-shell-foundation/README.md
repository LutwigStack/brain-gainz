# 01 Game Shell Foundation

## Status

`done`

## Цель

Собрать первую рабочую версию BrainGainz на выбранном стеке:
- web-first приложение;
- минимальный игровой слой;
- подготовка к mobile и desktop без смены архитектуры.

Это не epic про весь продукт. Это epic про фундамент:
- app shell;
- game shell;
- platform path.

## Scope

Входит:
- фиксация stack decisions;
- перевод frontend surface на `TypeScript`;
- выделение `src/game/`;
- первый живой web prototype;
- подготовка mobile path через `Capacitor`;
- фиксация desktop роли `Tauri`.

Не входит:
- богатый сюжет;
- продвинутые RPG-механики;
- production-grade mobile packaging;
- большой art pipeline;
- поздние social/commercial surfaces.

## Success Criteria

- web version остается основной средой разработки;
- игровой слой физически выделен в `src/game/`;
- app shell и game shell не перемешаны;
- есть понятный путь к `iOS` и `Android` без переписывания продукта;
- desktop local-first path не потерян.

## Workstreams

- `done` — [workstreams/01-typescript-foundation.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/01-game-shell-foundation/workstreams/01-typescript-foundation.md)
- `done` — [workstreams/02-pixi-game-module.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/01-game-shell-foundation/workstreams/02-pixi-game-module.md)
- `done` — [workstreams/03-web-prototype.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/01-game-shell-foundation/workstreams/03-web-prototype.md)
- `done` — [workstreams/04-capacitor-mobile-shell.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/01-game-shell-foundation/workstreams/04-capacitor-mobile-shell.md)
- `done` — [workstreams/05-tauri-desktop-role.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/01-game-shell-foundation/workstreams/05-tauri-desktop-role.md)
