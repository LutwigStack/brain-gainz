# 02 Map Workspace Layout

## Status

`planned`

## Goal

Сделать `Карта` главным экраном работы с правильной screen composition.

## Why

Даже после pixel-полировки `Карта` все еще воспринимается как screen with sections. Нужен более жесткий workspace layout:
- summary bar сверху;
- большая node surface слева;
- правый rail как companion-pane.

## Scope

- summary bar над картой;
- большая центральная/левая область world map;
- cleanup конкурирующих блоков вокруг карты;
- выравнивание map HUD, zoom/legend и статусов под новый layout;
- приведение композиции к референсу, но с учетом реального BrainGainz workflow.

## Done When

- `Карта` визуально и логически читается как основной workspace;
- map surface доминирует над остальными блоками;
- summary bar сверху даёт краткий ориентир без перегруза;
- layout готов принять editor + summary rail справа.
