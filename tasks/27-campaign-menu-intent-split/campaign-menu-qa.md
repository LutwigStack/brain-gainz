# Campaign Menu QA

## Status

`done`

## Build Under Test

- Branch/commit: local worktree
- Date: 2026-06-01
- Tester: Codex orchestration run
- Dev server URL: `http://localhost:5173/`
- Browser: Codex in-app browser
- Notes: desktop and 390px mobile checked after the visual hierarchy pass. A separate fresh-origin no-personal-campaign check was covered in headless browser smoke.

## Acceptance Summary

| Area | Expected | Result | Evidence | Issues |
| --- | --- | --- | --- | --- |
| Continue learning | Existing personal campaigns make continue the strongest path. | Pass | `qa/09-design-hierarchy-desktop.png`, `qa/09-design-hierarchy-mobile.png` | None |
| Ready courses | Developer-provided courses read as learner-ready courses, not admin/system rows. | Pass | Ready course card shows `Начать курс` and `Посмотреть` without template jargon. | None |
| Duplicate course copies | A ready course is not offered as `Начать курс` when an active personal copy exists. | Pass | `qa/10-template-copy-hidden-desktop.png` shows only the personal campaign and an added-course empty state. | None |
| Archived course copies | An archived personal copy offers restore instead of a fresh course start. | Pass | `qa/10-archived-template-restore-desktop.png` shows `Восстановить` as the course action. | None |
| Custom campaign | Custom creation is available but does not dominate the first viewport. | Pass | Creation section appears third; quick create was tested with `QA Test`. | None |
| Archive/restore | Archive and restore are secondary, reversible, and clear. | Pass | `QA Test` was hidden into archive and restored. | None |
| System/developer content | System/developer content does not compete with learner-primary choices. | Pass | Developer/system block is not rendered in the learner menu. | None |

## Desktop Matrix

Viewport: `1280x720` or wider desktop equivalent.

| Scenario | Steps | Expected | Actual Result | Evidence | Issue ID |
| --- | --- | --- | --- | --- | --- |
| No personal campaigns | Open Campaign Menu with no personal campaigns. | The first viewport clearly offers ready course start and custom creation without empty-state confusion. | Pass | `qa/08-minimal-desktop-campaign-menu.png` | None |
| One personal campaign | Open Campaign Menu with one active personal campaign. | Continue learning is the strongest path and campaign summary is scannable. | Pass | `qa/09-design-hierarchy-desktop.png` | None |
| Multiple personal campaigns | Open Campaign Menu with multiple active personal campaigns. | Primary campaign is easy to continue; other campaigns are accessible without competing equally. | Pass | `qa/07-mobile-campaign-menu-390.png` | None |
| Archived campaign | Open archive/disclosure and inspect restore path. | Archive is secondary; restore is clear and non-destructive. | Pass | `QA Test` archive/restore flow | None |
| Ready CS course template | Inspect ready-course section and start/copy action. | Course copy/start behavior is understandable and avoids system jargon. | Pass | `Начать курс` created a personal CS campaign. | None |
| System/developer template | Inspect any developer/system content visibility. | Developer/system content is hidden, secondary, or clearly separated from learner choices. | Pass | No developer/system block is visible in learner menu smoke. | None |
| Custom campaign creation | Open custom campaign path and submit/validate as appropriate. | Custom creation is findable and does not sit above continue/ready-course paths. | Pass | `QA Test` created and opened, then appeared in Campaign Menu. | None |
| Console health | Inspect browser console during the above flows. | No new blocking errors; warnings are captured if present. | Pass | Headless browser smoke after minimal pass reported no console entries. | None |

## Mobile Matrix

Viewport: `390x844` or equivalent narrow mobile.

| Scenario | Steps | Expected | Actual Result | Evidence | Issue ID |
| --- | --- | --- | --- | --- | --- |
| No personal campaigns | Open Campaign Menu with no personal campaigns. | Section order remains understandable and no horizontal overflow appears. | Pass | `qa/08-minimal-mobile-campaign-menu.png` | None |
| One personal campaign | Open Campaign Menu with one active personal campaign. | Continue path is visible early and labels are not clipped. | Pass | `qa/09-design-hierarchy-mobile.png` | None |
| Multiple personal campaigns | Open Campaign Menu with multiple active personal campaigns. | Campaign list is scannable or collapsed without hiding the main continue path. | Pass | `qa/07-mobile-campaign-menu-390.png` | None |
| Archived campaign | Inspect archive/restore controls. | Archive controls remain secondary and tappable. | Pass | Archive/restore flow tested on desktop; mobile controls visible and full-width. | None |
| Ready CS course template | Inspect ready-course section and primary action. | Ready-course CTA is readable and reachable without layout overflow. | Pass | `qa/09-design-hierarchy-mobile.png` | None |
| Custom campaign creation | Open custom campaign path. | Custom creation is below primary learner paths and fields fit the viewport. | Pass | `qa/07-mobile-campaign-menu-390.png` | None |
| Console health | Inspect browser console during mobile flows. | No new blocking errors; warnings are captured if present. | Pass | Headless browser smoke after minimal pass reported no console entries. | None |

## Screenshots

| Viewport | Scenario | Path/Link | Notes |
| --- | --- | --- | --- |
| Desktop | Minimal empty campaign menu | `tasks/27-campaign-menu-intent-split/qa/08-minimal-desktop-campaign-menu.png` | Three separate blocks, no old headline/description |
| Desktop | Minimal active campaign menu | `tasks/27-campaign-menu-intent-split/qa/08-minimal-active-campaign-menu.png` | Active card without per-card helper text |
| Mobile | Minimal 390px campaign menu | `tasks/27-campaign-menu-intent-split/qa/08-minimal-mobile-campaign-menu.png` | No horizontal overflow; actions stack full width |
| Desktop | Visual hierarchy pass | `tasks/27-campaign-menu-intent-split/qa/09-design-hierarchy-desktop.png` | Continue, ready course, and create are separate surfaces with distinct weight |
| Mobile | Visual hierarchy pass | `tasks/27-campaign-menu-intent-split/qa/09-design-hierarchy-mobile.png` | Course title remains readable and actions stack below content |
| Desktop | Existing active course copy | `tasks/27-campaign-menu-intent-split/qa/10-template-copy-hidden-desktop.png` | Ready course is hidden once the personal copy exists |
| Desktop | Archived course copy | `tasks/27-campaign-menu-intent-split/qa/10-archived-template-restore-desktop.png` | Archived course copy shows restore, not start |

## Test Commands

| Command | Result | Notes |
| --- | --- | --- |
| `node --test tests/campaigns-stats-xp.test.js tests/mode-boundary.test.js` | Pass, 34 passed | Focused campaign/template/mode regression |
| `npm run lint` | Pass | ESLint clean |
| `npm run build` | Pass | Vite production build |
| `git diff --check` | Pass with CRLF warnings only | Warnings include unrelated dirty task files |

## Open Issues

| ID | Severity | Viewport | Scenario | Description | Owner/Next Step |
| --- | --- | --- | --- | --- | --- |
| None | - | - | - | No open issues after visual hierarchy pass. | - |

## Final QA Decision

- Desktop QA: Pass.
- Mobile QA: Pass with no overflow at 390px.
- Browser console: Pass in headless smoke after visual hierarchy pass.
- Tests/lint/build: Pass.
- Overall decision: Pass.
