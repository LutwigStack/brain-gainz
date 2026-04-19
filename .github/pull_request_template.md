## Summary

Кратко: что изменено и зачем.

Engineering policy references:

- `docs/engineering-standards.md`
- `.github/ci-policy-checklist.md`

## Problem / Context

- Какую проблему решаем
- Почему это важно сейчас

## Scope

- In scope:
- Out of scope:

## Changes

- [ ] Backend (Rust/Tauri)
- [ ] Frontend (React/Vite)
- [ ] Docs
- [ ] Tests
- [ ] CI/Tooling

## Architecture Notes

- Context:
- Options considered:
- Decision:
- Consequences / Rollback:

## Validation

### Local checks run

- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml`
- [ ] `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- [ ] `npm run lint` (если затронут frontend)
- [ ] `npm run build` (если затронут frontend)

### Additional validation

- [ ] Integration / golden tests (если применимо)
- [ ] Bench / perf check (если затронут hot path)
- [ ] Security review notes added (если затронут threat surface)

## Contracts & Compatibility

- [ ] Изменения API/контрактов отсутствуют
- [ ] Есть изменения API/контрактов и они отражены в коде и docs
- [ ] Breaking change (описан migration/rollback plan)

## Risks

- Основные риски:
- Что может пойти не так:
- Как мониторим / откатываем:

## Documentation

- [ ] Обновлены релевантные файлы в `docs/`
- [ ] Обновлены релевантные файлы в `tasks/`
- [ ] Обновление docs не требуется (обосновано)

## Checklist (DoD)

- [ ] AC выполнены
- [ ] Тесты на изменённое поведение добавлены или обновлены
- [ ] Нет несанкционированного расширения scope
- [ ] Нет известных критичных regressions по perf или security
- [ ] PR готов к review