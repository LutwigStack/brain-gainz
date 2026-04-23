# 02 Pixel RPG Interface

## Status

`parked`

## Цель

Перевести BrainGainz из функционального web prototype в целостный `pixel-RPG shell`, где:
- `Today` ощущается как command screen;
- `Map` ощущается как живая world map;
- app shell и game shell работают как единый визуальный мир.

Этот epic не про новую бизнес-логику. Это epic про art direction, shell architecture и перенос текущих продуктовых поверхностей в новый игровой язык.

## Scope

Входит:
- фиксация `pixel design system`;
- переход к темному framed-shell интерфейсу;
- новый `Today` в логике pixel RPG dashboard;
- новый `Map` с полноценным inspector и world composition;
- разделение ответственности между `React` и `PixiJS` под pixel-first UI;
- подготовка asset pipeline для шрифтов, рамок, иконок и карт.

Не входит:
- продвинутый сюжет;
- большая narrative layer;
- production-grade art pipeline с финальными иллюстрациями для всех экранов;
- полная аудиосистема;
- polish каждого анимационного перехода.

## Success Criteria

- интерфейс больше не выглядит как generic dashboard;
- `Today` и `Map` визуально соответствуют выбранным pixel-RPG референсам;
- `React` остается app shell, а `PixiJS` становится лицом ключевых игровых экранов;
- pixel typography, panel chrome, XP/progress widgets и node states собраны в единый visual language;
- task system отражает последовательный rollout нового shell.

## Workstreams

- `done` — [workstreams/01-pixel-design-system.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/02-pixel-rpg-interface/workstreams/01-pixel-design-system.md)
- `parked` — [workstreams/02-full-pixel-today.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/02-pixel-rpg-interface/workstreams/02-full-pixel-today.md)
- `parked` — [workstreams/03-full-pixel-map-and-inspector.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/02-pixel-rpg-interface/workstreams/03-full-pixel-map-and-inspector.md)
