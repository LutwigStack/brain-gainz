# 05 Verify

## Status

`planned`

## Goal

Confirm that the cosmic canvas reads as the spec describes, on both campaigns and both viewports, with concrete artefacts.

## Viewports

- desktop `1280x900`
- wide desktop `1680x1050`
- mobile `390x844`

## Scenarios

- Open `Программы`, start `Бакалавриат по информатике`.
- Open `Обзор карты` → `Карта знаний`.
- Take a screenshot, save to `qa/after-fix-cs-bachelor-1280x900.png`.
- Repeat on `1680x1050`, save to `qa/after-fix-cs-bachelor-1680x1050.png`.
- Switch to `NLH cash`, repeat on `1280x900`, save to `qa/after-fix-nlh-cash-1280x900.png`.
- Mobile viewport: take a screenshot of the `Карта знаний` view, save to `qa/after-fix-mobile-390x844.png` (cosmetic pass is mostly desktop; the mobile screenshot is a sanity check that the layout does not break).

## Checks

- The current node is at roughly 35% from the left, 40% from the top of the canvas (not the screen). The focal point reads as a single, deliberate anchor — not a corner.
- The current node is a 4-point star, not a circle. The corona is visible and pulses (the verifier can check by taking two screenshots 1.2s apart; the corona alpha should differ).
- The remaining nodes fan out from the current node in a non-symmetric, non-overlapping pattern. No two nodes are within 18px of each other.
- The background shows eight tinted nebulae, one per sphere, each positioned at the centroid of its sphere's nodes. There are no stray soft circles.
- The minimap caption reads "Мини-карта" in full.
- The `Перейти` button is not truncated to "пер...".
- No `console.warn` or `console.error` from any of the touched files on a clean page load.

## Code grep

- `rg "circle\(" src/game/layers/` — no hits in the current-node marker function. (Other functions in the same file may have `circle()` calls; that is fine.)
- `rg "nebula" src/game/layers/` — exactly eight hit-groups, one per sphere token key.
- `rg "Майнкарпа" src/` — 0 hits.
- `rg '"пер\.\.\."' src/` — 0 hits.

## Build and tests

- `npm run lint` — clean.
- `npm run test` — all pass. The two new unit tests (focal spiral determinism, marker path shape) are included.
- `npm run build` — clean.

## Severity ranking

Findings are recorded in `qa/findings.md` with a severity (P0, P1, P2). P0 is "spec violation, ship-stopper". P1 is "visible flaw, fix in this epic". P2 is "nit, fix in a follow-up".

## Done When

- QA artefact folder `qa/` has at least the four screenshots named above.
- `qa/findings.md` lists the checks above with PASS/FAIL.
- No P0 findings.
- `npm run lint`, `npm run test`, `npm run build` all pass.
- The verifier writes a one-paragraph summary comparing the after-fix screenshots to the user-supplied reference (`C:\Users\Andr3y\.mavis\uploads\1780747710966-image.png`).
