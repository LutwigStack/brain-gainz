# Plan

## Execution Order

1. Stabilize frontend foundation on `TypeScript`.
2. Separate game/rendering concerns into `src/game/`.
3. Build the first web prototype with minimal hero, map, and effects.
4. Add `Capacitor` only after the web loop feels alive.
5. Keep `Tauri` as desktop shell instead of forcing one runtime for everything.

## Guardrails

- Не смешивать доменную логику и Pixi scene management.
- Не усложнять игру до появления живого core loop.
- Не делать mobile-first оптимизации до web validation.
- Не ломать desktop local-first путь.

## Definition Of Done For Epic

- stack decisions закреплены в docs;
- task system отражает новый pipeline;
- `TypeScript` и `src/game/` становятся частью реальной реализации;
- есть отдельный workstream для `Capacitor`;
- есть отдельный workstream для desktop роли `Tauri`.
