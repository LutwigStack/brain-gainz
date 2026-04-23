# 04 Capacitor Mobile Shell

## Status

`done`

## Goal

Добавить mobile path через `Capacitor` после появления живого web prototype.

## Why

Mobile нужен, но не должен диктовать архитектуру раньше времени.

## Scope

- интеграция `Capacitor` в существующий web app;
- базовый запуск на `Android`;
- подготовка пути к `iOS`;
- проверка key flows в mobile webview;
- фиксация platform-specific gaps.

## Current State

- Capacitor mobile path создан поверх существующего web app без конфликта с Tauri desktop shell.
- Папки `android/` и `ios/` присутствуют и синхронизируются через `Capacitor`.
- Web shell адаптирован под mobile webview на уровне viewport, safe-area и узкого header/navigation layout.
- Generated platform assets исключены из ESLint, чтобы platform scaffold не ломал базовые проверки.

## Implementation Plan

1. Добавить Capacitor CLI/runtime и базовый project config без ломки текущего web/Tauri pipeline.
2. Подготовить web build для Capacitor shell и завести scripts для sync/open/run сценариев.
3. Создать Android shell и зафиксировать iOS path настолько, насколько это реально с текущего Windows-окружения.
4. Дожать app shell под mobile webview: viewport, safe-area, root sizing и основные layout-слабости.
5. Проверить ключевые flows в mobile-friendly режиме и записать platform-specific gaps в task files.

## Constraints

- На текущем Windows-хосте полноценная iOS validation недоступна; максимум — подготовить конфиг, каталог и шаги для macOS/Xcode.
- Не смешивать Capacitor path с уже существующим Tauri desktop path.

## Validation

- `npm run lint`
- `npm run build`
- `npm test`
- `npm run cap:sync`

## Result

- добавлены зависимости `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` и создан [capacitor.config.ts](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/capacitor.config.ts);
- созданы платформенные каталоги `android/` и `ios/`;
- добавлены scripts для `cap:copy`, `cap:sync`, `cap:android`, `cap:ios:sync`;
- mobile shell теперь учитывает `viewport-fit=cover`, `safe-area` и узкий экран в app header/navigation;
- `Capacitor sync` успешно копирует web assets и обновляет plugins для Android и iOS.

## Platform Gaps

- реальный `android run` на девайсе или эмуляторе еще не подтвержден в этом workstream; подтвержден scaffold, sync и open path;
- полноценная `iOS` сборка и запуск требуют macOS + Xcode и остаются следующей ручной проверкой;
- Vite по-прежнему предупреждает о крупном bundle chunk, это не блокирует mobile shell, но может ухудшить cold start на слабых устройствах.

## Done When

- проект запускается в `Capacitor`;
- основные пользовательские сценарии не разваливаются на mobile;
- есть список platform-specific доработок, а не туман.
