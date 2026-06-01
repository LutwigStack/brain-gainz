# 06 Inspector And Assessment Control Copy

## Status

`done`

## Goal

Make node details and assessment outcomes speak the control language.

## Scope

- node inspector control summary
- assessment pass/fail result copy
- review/recovery action copy
- disabled state reasons

## Requirements

- Inspector shows:
  - current control state;
  - why the state exists;
  - how to change it;
  - opponent pressure if relevant.
- Assessment pass says control was gained/held/strengthened.
- Assessment fail says control was not held and offers recovery.
- Do not expose technical terms such as verifier evidence or check metadata on learner surface.
- Authoring UI can keep technical details under explicit details/disclosure.

## Example Outcome Copy

Pass:

- `Контроль закреплен`
- `Участок теперь под вашим контролем`
- `Соперник отступил от этого объекта`

Fail:

- `Контроль не удержан`
- `Участок остается спорным`
- `Следующий шаг: короткое повторение`

## Done When

- Assessment result instantly tells what happened and what to do next.
- Failed attempt no longer reads like an app error.
- Inspector does not become a lore wall.
