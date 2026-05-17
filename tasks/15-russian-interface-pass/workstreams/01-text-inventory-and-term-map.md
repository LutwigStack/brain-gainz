# 01 Text Inventory And Term Map

## Status

`done`

## Goal

Find user-visible English text and create the Russian term map before editing screens.

## Scope

- search source files for English labels used in UI
- inspect QA screenshots for visible English
- separate user-facing text from internal keys and ids
- create a term map for recurring states and actions
- note risky terms that need product decisions

## Output

Create:

`tasks/15-russian-interface-pass/russian-text-inventory.md`

Include:
- term map
- screen-by-screen leftover list
- terms not to translate
- high-risk labels that need design care

## Done When

- agents can translate screens without inventing new words each time
- repeated terms have one preferred Russian form
- internal technical strings are clearly excluded
