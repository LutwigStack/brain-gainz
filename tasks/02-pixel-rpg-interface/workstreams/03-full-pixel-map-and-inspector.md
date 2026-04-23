# 03 Full Pixel Map And Inspector

## Status

`parked`

## Goal

Сделать `Map` центральной `world surface` BrainGainz с постоянным inspector-панелем и pixel-first world composition.

## Why

Текущая карта уже существует логически и технически, но еще не воспринимается как живая world map. Чтобы продукт соответствовал референсам, карта должна стать главным пространством мира, а не canvas-блоком внутри продуктовой секции.

## Scope

- full-surface world map composition;
- регионы / биомы / hub layout;
- node states, связи, selection glow, fog и atmosphere;
- zoom / legend / HUD controls;
- постоянный inspector справа;
- rewards, prerequisites, tasks, connected skills;
- интеграция `PixiJS` scene с `React` inspector и shell;
- выравнивание `Map` под тот же visual grammar, что и `Today`.

## Done When

- карта становится основной игровой поверхностью;
- inspector и map читаются как единый экран;
- `PixiJS` отвечает за world rendering, а `React` — за structured context и workflow;
- экран визуально близок к целевым pixel-RPG референсам, а не к обычной product map.
