# CS Campaign QA And Balance

Date: 2026-05-17

Verified commit: `e8a308c`

Dev server: reused the already-running Vite server on `http://127.0.0.1:5182/`. Other existing Vite processes and ports were left untouched.

Viewports checked:
- Desktop: `1280x900`
- Mobile: `390x844`

## Verdict

Pass for the CS campaign and Daily Run acceptance slice.

The `Computer Science Bachelor` template is visible, forks into a personal campaign, feeds Today with realistic CS tasks, supports Daily Run start/outcomes/finish, keeps learner and author surfaces separated, and now exposes a readable route overview for the 44-node CS route slice.

## Command Results

- `npm run test`: pass, `186/186` tests passing. Node emitted expected `ExperimentalWarning: SQLite is an experimental feature` warnings during tests.
- `npm run lint`: pass.
- `npm run build`: pass, Vite production build completed.

## Browser QA Result

Desktop Daily Run on `http://127.0.0.1:5182/`:
- Forked a fresh personal `Computer Science Bachelor` campaign from the reusable template.
- Started Daily Run from Today.
- Recorded one task each through `Complete`, `Another pass`, `Skip`, and `Defer`.
- After the four outcomes, the session changed from pending to `ready to finish`; `Finish` became enabled.
- Clicking `Finish` showed `Run completed` with the run summary.

Console warnings/errors: none captured. Playwright console query reported total messages `3`, errors `0`, warnings `0`.

## Screenshots

Fresh screenshots for `e8a308c` are stored under:

`C:/Users/Andr3y/projects/javascript_projects/brain-gainz/output/cs-campaign-qa`

- `desktop-1280x900-daily-run-ready-e8a308c.png`
- `desktop-1280x900-daily-run-completed-e8a308c.png`
- `desktop-1280x900-route-overview-e8a308c.png`
- `mobile-390x844-daily-run-active-e8a308c.png`

Earlier screenshots in the same directory remain useful for campaign menu, assessment, weak spot, and author-surface coverage, but the four screenshots above are the current acceptance evidence for the fixed Daily Run and route overview behavior.

## Desktop Observations

- Campaign Menu shows `Computer Science Bachelor` under `Reusable templates` with `58` nodes.
- `Use template` creates and opens a personal `Computer Science Bachelor` campaign.
- Today starts on `Programming Environment` with recovery tasks for `Values, Variables, And Types`, `Expressions And Operators`, and `Branching With Conditionals`.
- Daily Run outcomes now mutate session state. The verified sequence was `Complete` -> `Another pass` -> `Skip` -> `Defer` -> `Finish`.
- After finishing, Today shows `Run completed`, XP/mastery summary, and remaining recovery count.
- Route mode now includes `Route overview` sections for `Programming Fundamentals`, `Discrete Math For CS`, `Data Structures`, and `Algorithms`, with current step and per-section counters. This is readable enough for the 44-node CS slice and is a material improvement over a dense graph-only overview.

## Mobile Observations

- At `390x844`, Daily Run is usable with an active 5-task run.
- Outcome buttons fit inside each task card; no horizontal document scroll was detected.
- Measured layout: `window.innerWidth = 390`, `document.documentElement.scrollWidth = 390`, `document.body.scrollWidth = 390`.
- Density is still high, and `Finish` sits below the first screen when the run contains 5 tasks. This is polish, not an acceptance blocker.

## Acceptance Checks

- CS template visible in Campaign Menu: pass. `Computer Science Bachelor` appears under `Reusable templates` with `58` nodes.
- Personal fork/open path: pass. `Use template` created and opened a personal `Computer Science Bachelor` campaign.
- Today has real CS next tasks: pass. Today shows the current route front plus concrete recovery tasks.
- Daily Run starts and finishes: pass. `Start Run` created a task run, outcomes reduced pending state, `Finish` enabled, and `Run completed` appeared after finishing.
- Complete/fail/skip/defer task: pass. Browser verified `Complete`, `Another pass`, `Skip`, and `Defer`.
- Mobile Daily Run usable at `390x844`: pass. No horizontal document overflow was detected; action buttons remained reachable.
- Route overview readable for first CS slice: pass. Route mode shows grouped branch overview with counters and current front, not only a dense graph canvas.
- Assessment examples cover multiple check types: pass from seeded content and prior browser coverage. Seed includes `exact`, `number`, `contains`, `checklist`, `manual_strict`, and `llm_assisted`.
- Learner mode hides author internals: pass from current and prior browser coverage. Learner map/check views do not expose node editor, graph editing, route editing, or check metadata authoring controls.
- Author mode can edit campaign content: pass from prior browser coverage. Author mode exposes node editor fields, check metadata type selection, checklist item editing, graph tools, route/map tools, and save controls.

## Findings By Severity

### Critical

None.

### High

None.

### Medium

None.

### Low / Polish

1. Mobile Daily Run density remains high.
   - Observed at `390x844` with a 5-task active run.
   - Outcome controls fit and no horizontal scroll was detected, but the run consumes a long vertical page and `Finish` is below the first screen.
   - Impact: acceptable for this slice, worth tightening before broader mobile QA.

## Content Balance Notes

- The first Today slice is plausible: current front plus recovery tasks creates an understandable first-week loop.
- Recovery appears immediately, which is useful for QA but slightly aggressive for a brand-new fork. Consider making initial recovery copy explicit as "foundation reinforcement" until the learner has a real failed/stale history.
- The first assessment flow remains good for QA: checklist on `Programming Environment` and exact answer on `Values, Variables, And Types` are concrete and short.
- The current 44-node route slice is enough to exercise route overview, Daily Run selection, weak spots, and mobile density without expanding to the full degree yet.

## Suggested Next Content Slice

Now that Daily Run completion and route overview readability are unblocked, extend only the next practical slice:

- Complete the first Programming Fundamentals week through `Loops And Iteration`, `Functions And Parameters`, and `Scope And Lifetime`.
- Add one debugging recovery path tied to real failed attempts.
- Keep assessment variety balanced across `exact`, `number`, `contains`, and `checklist`; reserve `manual_strict` and `llm_assisted` for later gates.
- Do not add the full CS degree yet. The product now has a stable run loop, but mobile density and route comprehension should stay under watch as content grows.
