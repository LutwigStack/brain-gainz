# 02 Pixi Game Module

## Status

`done`

## Goal

Создать отдельный модуль `src/game/` на `PixiJS`.

## Why

Игровой слой должен улучшаться независимо от app shell и не тащить на себя бизнес-логику.

## Scope

- базовая Pixi bootstrap-сцена;
- hero layer;
- map layer;
- node states;
- минимальные эффекты;
- React bridge между app state и Pixi scene.

## Done When

- `src/game/` существует как отдельный слой;
- карта и герой живут там, а не размазаны по UI;
- React передает данные, а Pixi отвечает за rendering.
