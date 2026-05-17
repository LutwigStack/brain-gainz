# 05 Russian UI QA

## Status

`done`

## Goal

Verify that the application reads as Russian-first after translation.

## Scope

- browser pass on all main screens
- console warnings/errors
- screenshot capture
- leftover-English report
- mobile layout check
- button text fit check

## Output

Create:

`tasks/15-russian-interface-pass/russian-ui-qa.md`

Include:
- short verdict
- screenshots
- leftover English list
- layout regressions
- console warnings/errors
- test results

## Done When

- leftover English is either fixed or explicitly classified as internal/dev-only
- no important button text overflows
- `npm run test`, `npm run lint`, and `npm run build` pass
