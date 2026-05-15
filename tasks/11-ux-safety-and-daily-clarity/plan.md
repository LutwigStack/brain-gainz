# Plan

## Intent

Deliver the next UX slice after the first stabilization pass: protect users from accidental destructive actions, make the daily screen honest and action-first, and make map orientation stable enough for repeated daily use.

This is a safety and clarity slice, not a broad redesign.

## Delivery Order

1. Destructive action safety
2. `Today` state and next-step clarity
3. Large map overview and focus
4. Assessment language and progress copy
5. Inspector primary actions and density
6. Campaign / Wind Rose / mobile polish
7. UX safety regression QA

## First Usable Slice

The smallest valuable correction:
- node archive from toolbar and inspector requires confirmation or a two-step destructive state
- archive success shows a visible undo action
- archived nodes can be restored through an obvious UI path
- the destructive-action path has unit/integration coverage where the store boundary exists
- browser smoke confirms no accidental one-click archive remains

## Technical Direction

- Prefer a shared destructive-action pattern over one-off confirmation logic.
- Keep undo bounded and explicit; do not invent a global history system unless it already exists.
- Use existing archived-node state rather than adding a second deletion model.
- Keep user-facing errors sanitized while logging unexpected persistence errors for developers.
- Preserve existing map shortcuts and context menu behavior.
- Avoid adding long explanatory panels; prefer compact state labels and action grouping.
- Test the data boundary and the UI path separately where possible.

## Review Baseline

The visual review found:
- accidental archive changed local browser data from `109` nodes to `108` nodes in a system campaign
- `Today` showed an empty/free-mode state while the campaign card still showed nodes and XP
- large graphs rendered but did not provide a dependable orientation view
- assessment and inspector still exposed technical vocabulary on primary surfaces
- Wind Rose had duplicate branch CTAs with the same accessible label
- mobile header and panels consumed too much of the first screen

## Risks

- confirmation fatigue if every low-risk action becomes modal
- undo state becoming stale after campaign or structure switches
- restore path exposing archived system/template data in the wrong context
- `Today` copy hiding a projection bug instead of surfacing the real state
- large graph fit behavior fighting intentional user zoom/pan
- assessment copy becoming vague and losing verifier precision for authoring
- mobile compact nav breaking desktop keyboard/accessibility expectations

## Manual QA Requirements

Run these before closing the epic:
- desktop `1280x900`
- mobile `390x844`
- browser console error/warning capture
- campaign menu open/create/archive/restore
- node archive confirm/cancel/undo/restore
- `Today` empty campaign, free mode, active route, route incomplete
- map free canvas create/connect/delete/archive
- large graph free canvas and layers overview
- inspector tabs and primary actions
- assessment strict/manual/LLM states
- Wind Rose stat -> branch -> map

## Completion Gate

This epic is not done until a second visual review can no longer reproduce:
- one-click destructive node archive
- unexplained `Today` empty state for a non-empty campaign
- large graph opening without a readable overview or focus state
- primary assessment UI dominated by verifier implementation labels
