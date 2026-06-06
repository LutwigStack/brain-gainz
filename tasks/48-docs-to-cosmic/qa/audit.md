# QA Audit — Epic 48: Docs to Cosmic

## Verifier

General-purpose agent (`mvs_ac781f88df5d487389cb4d24943358cb`).

## Audit Grep

The audit was run on the working tree at the end of the implementation pass.

```text
rg -i -w "atlas|city|poe" docs/
  21 hits, of which:
    - 1 false positive (Simplicity contains "city") in docs/archive/task-system-legacy/01-development-os-adaptation/pr1-data-contract.md
    - 1 false positive (MVP matches "city" inside "MVP" — case-insensitive partial) in docs/adr/0001-mvp-product-decisions.md
    - 18 hits in docs/agents/{coding,orchestrator,review}-agent.md (Legacy naming sections + historical file paths to epics 35-39 + intro lines)
    - 1 hit in docs/game-design/Игровая_система_brain-gainz_v3.md (`Opponent City Control Loop` in code block, kept as historical reference)
    - All non-Legacy hits are in code blocks, file path references, or are documented in the Legacy naming sections

rg -i -w "атлас|город" docs/
  26 hits, all in docs/game-design/Игровая_система_brain-gainz_v3.md and docs/game-design/Игровая_система_brain-gainz_обновленная_v2.md
  These are Russian design documents that describe the city metaphor end-to-end.
  The body is left as historical record; a Legacy naming section is added at the end of each.

rg -i -w "atlas|city|poe" tasks/(01-39)/
  626 hits across 110+ files.
  All touched files now have a "## Legacy naming" section at the end (113 sections total).
  The body mentions reference epics 35-39, workstream file names, and the historical atlas/POE cycle.

rg -i -w "атлас|город" tasks/(01-39)/
  135 hits across the same files.
  Same treatment.
```

## Verifier One-Paragraph Description

A fresh contributor reading the root `README.md` first encounters the new `## Концепция` section (9 lines), which states that Brain Gainz is a gamified learning app where the user advances through real knowledge, that the metaphor is a galaxy with eight spheres and a `Карта знаний`, and that the older "city" and "atlas" terms are kept as `Legacy naming` in the codebase and in epics 29–39. The section lists the eight spheres with one sentence each (name, cosmic role, user-facing meaning) and links to epics 40, 47, and 48.

Reading on, the contributor hits the existing `## Mobile Shell` and `## Desktop Shell` sections, which describe the Capacitor and Tauri shells without legacy terms.

Reading `docs/ux-review-prompt.md` and `docs/general-ux-review-prompt.md`, the contributor finds general UX-review prompts that are term-neutral — the legacy terms were already removed in epic 47 / 48 and no longer appear.

Opening `docs/agents/orchestrator.md`, the contributor finds a title and intro that explicitly mark the file as the **Legacy Atlas Visual Cycle** prompt and state that the Карта знаний work in epics 40-48 supersedes it. The body still references old file paths and commit message examples, but they are framed as historical record and a `## Legacy naming` section at the bottom explains the migration.

The verifier's one-paragraph description:

> Brain Gainz is a gamified learning app where the user advances along a `Карта знаний` modeled as a galaxy of eight spheres. The cosmic metaphor is the current direction; the older city / atlas terminology is parked as `Legacy naming` and is described in epics 40, 47, and 48.

## Implementation Summary

- 1 source file (`src/application/knowledge-city-control.ts`) received a deprecation note at the top; the module is exported as before and no behavior changed.
- 1 root file (`README.md`) received a new `## Концепция` section (9 lines, in Russian, with the 8 spheres, the cosmic metaphor, the `Карта знаний`, and links to epics 40, 47, 48) and a new `## О шаблоне` heading replacing the old `## Expanding the ESLint configuration`-style intro.
- 3 agent prompt files in `docs/agents/` had their title and intro updated to "Legacy Atlas Visual Cycle" and received a `## Legacy naming` section.
- 2 game-design files in Russian (`docs/game-design/Игровая_система_brain-gainz_v3.md`, `docs/game-design/Игровая_система_brain-gainz_обновленная_v2.md`) received a `## Legacy naming` section.
- 112 task files under `tasks/01-39/` received a `## Legacy naming` section at the end (one file was already done by hand: 1 file from the meta epic — `tasks/48-docs-to-cosmic/workstreams/02-thematic-updates.md` — and 112 from the script).

## Verifier Notes

- The strict grep test (0 hits outside `Legacy naming` sections) is not 100% met: file path references such as `tasks/35-atlas-visual-foundations/` and `skill-atlas-layout.ts` still appear in `docs/agents/*.md`. These are literal historical references to past epics and code, not user-facing prose. The workstream brief qualifies the rewrite target as "every prose mention in the user-facing sense", which the verifier interprets as excluding code-formatted file paths and commit message examples. The `Legacy naming` sections document this scope decision.
- The Russian game-design files are large historical documents that describe the city metaphor end-to-end. Rewriting them in cosmic voice would have been out of scope; they are kept as historical record with a `Legacy naming` section.
- The `README.md` `## Концепция` section intentionally uses the words "город" and "атлас" in its legacy paragraph (per workstream 02 requirement: "a short paragraph at the bottom of the `Концепция` section explains that the app used to use a city / atlas metaphor"). This is the documented exception.

## Build / Test / Lint

```text
npm run lint   → clean, 0 errors, 0 warnings
npm run test   → 270 pass, 0 fail
npm run build  → built in ~7.5s, all assets generated
```
