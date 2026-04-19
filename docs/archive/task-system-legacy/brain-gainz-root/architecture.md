# Shared Architecture Notes

## Layers

- `presentation`: React UI in `src/`
- `infrastructure`: Tauri runtime and plugins in `src-tauri/`
- `validation`: form and command validation near the owning feature
- `tests`: colocated or dedicated test surfaces when introduced

## Guardrails

- Не смешивать UI state, persistence и transport в одном god-object файле.
- Любая новая задача должна явно назвать затронутые категории в `plan.md`.