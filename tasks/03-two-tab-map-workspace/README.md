# 03 Two Tab Map Workspace

## Status

`done`

## Цель

Пересобрать BrainGainz вокруг двух главных вкладок:
- `Сейчас` как короткая ежедневная сводка
- `Карта` как основной рабочий экран и место ручного редактирования узлов

Этот epic не про дальнейшее наращивание dashboard-поверхностей. Это epic про сужение продукта до более ясной модели:
- одна вкладка для обзора
- одна вкладка для реальной работы

## Scope

Входит:
- сокращение shell navigation до двух основных вкладок
- редизайн `Сейчас` в компактную summary-поверхность
- удаление dominant `Главный шаг` блока из `Сейчас`
- фокус `Сейчас` на трех секциях:
  - `Ослабевает`
  - `Почти завершено`
  - `Еще можно сделать`
- превращение `Карта` в основной workspace
- верхний summary bar над картой
- большая map surface слева
- правый rail из двух секций:
  - раскрывающийся `Node Editor`
  - постоянный `Node Summary`
- ручное редактирование узлов из `Карта`
- приведение layout и interaction model к референсам с поправкой под BrainGainz

Не входит:
- расширение количества основных вкладок
- новая narrative/gameplay система
- сложный multi-panel workflow вне `Сейчас` и `Карта`
- полноценный graph editor связей уровня отдельного CAD-like режима
- мобильный redesign

## Success Criteria

- в app shell остаются две основные вкладки: `Сейчас` и `Карта`
- `Сейчас` ощущается как быстрый digest, а не как второй рабочий экран
- `Карта` становится главным operational workspace
- справа на `Карта` есть и editor, и summary, и они не дублируют друг друга
- ручное создание и редактирование узлов проектируется как first-class workflow
- layout экрана `Карта` читается ближе к целевым референсам, чем текущая product-page композиция

## Workstreams

- `done` — [workstreams/01-two-tab-shell-and-now-digest.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/03-two-tab-map-workspace/workstreams/01-two-tab-shell-and-now-digest.md)
- `done` — [workstreams/02-map-workspace-layout.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/03-two-tab-map-workspace/workstreams/02-map-workspace-layout.md)
- `done` — [workstreams/03-node-editor-and-summary-rail.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/03-two-tab-map-workspace/workstreams/03-node-editor-and-summary-rail.md)
