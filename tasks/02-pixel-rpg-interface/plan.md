# Plan

## Execution Order

1. Зафиксировать `pixel design system`, чтобы дальше не собирать экраны из несовместимых решений.
2. Переделать `Today` в главный `pixel command screen`.
3. Переделать `Map` в полноценную `world map + inspector` поверхность.

## Guardrails

- Не пытаться “перекрасить” текущие карточки вместо смены shell language.
- Не смешивать обычный dashboard UI и pixel-RPG chrome на одном экране.
- Не переносить всю текстовую и workflow-логику в `PixiJS`, если она лучше живет в `React`.
- Не начинать большой art production до фиксации visual primitives и layout system.
- Не терять текущую app-state архитектуру ради декоративного эффекта.

## Definition Of Done For Epic

- существует зафиксированный `pixel design system`;
- `Today` и `Map` используют один и тот же visual grammar;
- главные экраны воспринимаются как части одного игрового интерфейса;
- `React/Pixi` responsibilities закреплены в реальной реализации, а не только в обсуждении;
- task system показывает последовательный rollout нового интерфейсного слоя.
