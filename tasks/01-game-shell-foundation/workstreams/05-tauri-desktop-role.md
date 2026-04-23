# 05 Tauri Desktop Role

## Status

`done`

## Goal

Зафиксировать роль `Tauri` как desktop local-first shell, а не как единственный universal runtime.

## Scope

- описать desktop-only преимущества;
- определить какие функции остаются desktop-first;
- проверить, что game/app architecture не ломает desktop path;
- сохранить совместимость с локальной базой и вложениями.

## Current State

- Desktop path уже существует через `src-tauri/` с `Tauri 2`, desktop window config и capability policy.
- Локальная база для desktop идет через `@tauri-apps/plugin-sql` и выбирается рантаймом в [src/database/bootstrap.js](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/src/database/bootstrap.js).
- Web и mobile path уже отделены: web использует `sql.js` fallback, mobile идет через `Capacitor`, но явный desktop contract пока не оформлен.
- В коде нет отдельного desktop-only adapter layer для файловых вложений или других local-first преимуществ, поэтому роль desktop пока описана только частично.

## Implementation Plan

1. Зафиксировать desktop role в docs и task system как отдельный local-first shell, а не как универсальный runtime для всех платформ.
2. Проверить текущие Tauri capabilities, config и database path и явно описать, что уже является desktop-only contract.
3. Добавить минимальный desktop runtime adapter/metadata слой в frontend, если это нужно для явного разделения web/mobile/desktop поведения.
4. Обновить README и связанные архитектурные документы так, чтобы путь `web + Capacitor + Tauri` был описан без противоречий.
5. Подтвердить, что build/check/test сценарии для desktop path не конфликтуют с mobile path.

## Validation

- `npm run build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`

## Expected Outcome

- понятно, какие преимущества остаются за desktop shell уже сейчас;
- зафиксировано, какие desktop-first возможности остаются следующим шагом;
- desktop path не смешивается с Capacitor/mobile path на уровне документации и runtime assumptions.

## Result

- runtime path разделен явно через [src/platform/runtime.js](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/src/platform/runtime.js): `web`, `capacitor-native`, `tauri-desktop`;
- database bootstrap использует этот runtime contract и оставляет native SQLite только за desktop path;
- app shell показывает текущую роль shell и storage path в header, чтобы desktop local-first режим был виден явно;
- README и архитектурная заметка теперь фиксируют `Tauri` как отдельный desktop shell, а не как universal runtime.

## Desktop-First Contract

- desktop runtime: `Tauri 2` window + capability policy;
- desktop storage: native SQLite через `@tauri-apps/plugin-sql`;
- web/mobile storage: browser-backed path, без требования Tauri runtime;
- будущие file attachments и более глубокие local-first возможности остаются desktop-first до отдельного решения.

## Validation Result

- `npm run build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- дополнительно: `npm run lint`, `npm test`

## Done When

- понятно, зачем проекту `Tauri`;
- desktop path не конфликтует с mobile path;
- local-first desktop возможности не теряются случайно.
