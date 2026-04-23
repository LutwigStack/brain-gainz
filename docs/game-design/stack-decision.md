# Stack Decision

## Принятое решение

Для BrainGainz фиксируем следующий стек:

- `React + Vite + TypeScript` как основа приложения;
- `PixiJS` как отдельный игровой/rendering слой;
- `Capacitor` как mobile shell для `iOS` и `Android`;
- `Tauri` как desktop shell для local-first desktop-сценария.

Ключевой принцип:

> Сначала делаем web-first продукт, потом адаптируем тот же UI и игровой слой под mobile, а desktop оставляем как отдельную local-first оболочку.

---

## Почему именно так

### 1. Web-first снижает стоимость итераций

Основной продукт пока исследовательский и personal-first. Значит, самый важный критерий сейчас — скорость проверки гипотез:
- ежедневный ритуал;
- карта навыков;
- игровой отклик;
- логика квестов и прогресса.

Быстрее всего это проверять в web-среде.

### 2. Текущая кодовая база уже web-first

Проект уже живет на `React + Vite + Tauri`. Полный поворот в `React Native / Expo` сейчас означал бы смену runtime и перепаковку UI-модели, а это не помогает MVP.

### 3. Игровой слой должен быть отдельным модулем

`PixiJS` используем не как основу всего приложения, а как выделенный слой для:
- карты;
- анимаций;
- визуальных эффектов;
- пиксель-арт сцен;
- оживления узлов и героя.

То есть не “весь продукт — игра”, а “приложение с игровым render-слоем”.

### 4. Mobile лучше добавлять после живого web-прототипа

После первого работающего web-прототипа оборачиваем продукт в `Capacitor`.

Это дает:
- `iOS`;
- `Android`;
- `PWA / web`;
- минимальную смену UI-подхода;
- доступ к нативным возможностям по мере необходимости.

### 5. Desktop не выбрасываем

`Tauri` оставляем как desktop-оболочку для local-first сценариев:
- локальная база;
- файловые вложения;
- desktop-first использование;
- низкий overhead.

---

## Практическая архитектура

### App shell

`React + TypeScript` отвечает за:
- экраны;
- состояние приложения;
- формы;
- workflow;
- node/session/review UI;
- интеграцию между доменной логикой и игровым слоем.

### Game layer

Отдельный модуль `src/game/` отвечает за:
- рендер карты;
- героя;
- состояния узлов;
- визуальные эффекты;
- fog-of-war;
- анимации прогресса;
- pixel-art presentation.

### Platform shells

- web: основная среда разработки и первая целевая платформа;
- mobile: `Capacitor` после первого живого web prototype;
- desktop: `Tauri` для local-first desktop distribution.

### Desktop contract

Для desktop фиксируем отдельный runtime contract:

- `Tauri` не является universal runtime для `web + mobile + desktop`;
- desktop сохраняет native SQLite path и capability-gated доступ к desktop runtime;
- mobile path идет через `Capacitor`, а web path остается browser-first;
- desktop-first возможности вроде файловых вложений и более глубокого local-first поведения остаются за `Tauri`, но не диктуют архитектуру web/mobile shell заранее.

---

## Базовая структура каталогов

```text
src/
  application/     # orchestration, use-cases, services
  domain/          # node/session/review/progress rules
  components/      # app ui
  screens/         # route screens
  game/            # pixi scene, hero, map, effects
  platform/        # platform adapters
  stores/          # persistence-facing stores
```

`src/game/` должен зависеть от состояния приложения, но не становиться владельцем всей бизнес-логики.

---

## Что не выбираем сейчас

### Не переходим на Expo / React Native как основной runtime

Это хорошая технология, но для текущего репо слишком дорогая смена платформы. Она имеет смысл только если позже станет ясно, что web-first shell мешает продукту.

### Не делаем Tauri единственным universal runtime

`Tauri` подходит для desktop и умеет mobile, но для быстрого пути в `web + iOS + Android` текущая стратегия `web-first + Capacitor` проще.

Это значит, что `Tauri` в проекте важен не как замена всему остальному стеку, а как честный desktop shell с отдельной ролью.

### Не строим продукт целиком на game framework

`PixiJS` решает rendering и визуальную игру, но не должен подменять обычный app shell.

---

## Порядок реализации

1. Продолжаем текущий web app.
2. Переводим проект на `TypeScript`.
3. Выносим игровой слой в `src/game/` на `PixiJS`.
4. Собираем первый живой web prototype.
5. После этого добавляем `Capacitor` для mobile.
6. `Tauri` поддерживаем как desktop shell там, где нужен local-first сценарий.

---

## Критерий успеха архитектуры

Архитектура выбрана правильно, если:
- продукт быстро развивается в web;
- игровой слой можно улучшать независимо;
- mobile-адаптация не требует переписывать продукт с нуля;
- desktop-режим сохраняет local-first сильные стороны.
