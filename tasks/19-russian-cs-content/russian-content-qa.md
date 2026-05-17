# Russian CS Content QA

## Environment

- Date: 2026-05-17
- App URL: `http://127.0.0.1:5174/`
- Profile: clean browser storage, then forked the reusable "Бакалавриат по информатике" template
- Desktop viewport: `1280x900`
- Mobile viewport: `390x844`

## Screenshots

- Campaign menu desktop: `output/playwright/task-19-russian-cs-content/campaign-menu-desktop.png`
- Today desktop: `output/playwright/task-19-russian-cs-content/today-desktop.png`
- Map desktop: `output/playwright/task-19-russian-cs-content/map-route-desktop.png`
- Route overview desktop: `output/playwright/task-19-russian-cs-content/route-overview-desktop.png`
- Check inspector desktop: `output/playwright/task-19-russian-cs-content/checks-desktop.png`
- Wind Rose desktop: `output/playwright/task-19-russian-cs-content/wind-rose-desktop.png`
- Today mobile: `output/playwright/task-19-russian-cs-content/today-mobile.png`
- Map mobile: `output/playwright/task-19-russian-cs-content/map-mobile.png`
- Wind Rose mobile: `output/playwright/task-19-russian-cs-content/wind-rose-mobile.png`

## Checked Flow

- Campaign menu shows the reusable template as "Бакалавриат по информатике".
- Forking the template creates a personal campaign and opens Today.
- Today shows "Основы информатики", "Среда программирования", "Основы программирования", Russian daily task titles, Russian route status, and Russian weak spot copy.
- Map overview shows Russian focus, route context, node description, and inspector tabs.
- Route view remains reachable from the map view and keeps Russian route labels.
- Check inspector shows Russian criteria, checklist text, action buttons, and confirmed-progress copy.
- Wind Rose shows Russian stat names and branch names: "Программирование", "Мат. мышление", "Структуры", "Алгоритмы", "Базы данных", "Отладка", "Системное мышление".
- Mobile Today, Map, and Wind Rose fit without obvious horizontal overflow in the checked viewport.

## Remaining English

Intentional technical or product terms:

- `BrainGainz`
- `XP`
- `SQL`, `CRUD`, `ACID`, `ORM`, `Big-O`, `NULL`, `SELECT`, `WHERE`, `GROUP BY`, `LIFO`

No learner-facing English course titles, route stages, node titles, or check instructions were visible in the checked flow.

## Console

Current page console after the QA flow: `0` errors, `0` warnings.

The all-session console file contains stale Vite hot-reload errors from an older `5173` session before this QA pass. The current-page console export is clean: `output/playwright/task-19-russian-cs-content/console-current-warnings.txt`.

## Automated Checks

- `npm run test`: pass, `190/190`
- `npm run lint`: pass
- `npm run build`: pass
