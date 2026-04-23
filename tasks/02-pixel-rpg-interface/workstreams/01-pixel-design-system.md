# 01 Pixel Design System

## Status

`done`

## Goal

Собрать базовый визуальный и технический каркас для `pixel-first` интерфейса BrainGainz.

## Why

Без отдельного design system дальнейшие экраны снова распадутся на смесь:
- обычного web dashboard;
- случайных pixel-декораций;
- несовместимых panel patterns;
- разных правил для `React` и `PixiJS`.

## Scope

- выбор `pixel fonts`;
- palette и semantic tokens;
- panel frame system;
- progress bars, badges, tabs, stat rows, list items;
- правила по scale, `image-rendering`, nearest-neighbor;
- базовый asset pipeline для UI chrome;
- фиксация правил разделения `React` vs `PixiJS` для интерфейсных primitives.

## Done When

- есть единый набор visual tokens;
- есть базовые pixel UI primitives;
- есть documented правила для typography, borders, spacing и colors;
- новый `Today` и новый `Map` можно собирать из одного набора primitives, а не из ad-hoc решений.
