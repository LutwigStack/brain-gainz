# 08 Tuning And Browser QA

## Status

`done`

## Goal

Calibrate the first city-control loop with real UI use.

## Scope

- full browser QA for the MVP slice
- tuning constants review
- screenshots
- residual findings

## QA Scenarios

- Fresh CS bachelor personal campaign.
- Player verifies the first route node.
- A node becomes weakened through seeded/test state.
- A failed assessment creates contested state.
- Recovery pass reduces pressure.
- Opponent gains daily XP with clear reason.
- Archived campaign does not resolve opponent turn.
- Template campaign does not resolve opponent turn.
- Mobile `390x844`.

## Checks

- `npm run lint`
- `npm run test`
- `npm run build`
- browser console warnings/errors: `0`
- no horizontal mobile overflow
- player sees a next action in every bad state

## Done When

- QA artifact is written under this epic.
- Tuning values are documented.
- Remaining issues are severity-ranked.
