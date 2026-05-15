# UX Regression QA Checklist

Workstream: `10 UX Regression QA`

Run date: 2026-05-15
HEAD: `24acd7c`
Environment: Vite dev server at `http://127.0.0.1:5173/`, Playwright Chromium, desktop `1280x900`, mobile `390x844`

## Repeatable Setup

1. Start the app with `npm run dev -- --host 127.0.0.1 --port 5173`.
2. Reset the browser QA profile before a clean run.
3. Open `http://127.0.0.1:5173/`.
4. Capture console messages before and after the browser pass.
5. Capture screenshots for key before/after states into `output/playwright/ux-regression-qa/`.
6. Run `npm run lint`.
7. Run `npm run build`.

## Command Results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Pass | Completed without lint errors. |
| `npm run build` | Pass | Production build completed. |
| Console warnings | Pass | 0 warnings recorded. |
| Console errors | Fail | 1 runtime error recorded during map connect flow. See Finding UX-QA-001. |

## Executed Checklist

| Area | Scenario | Result | Evidence |
| --- | --- | --- | --- |
| Campaign Menu | App starts at campaign selection. | Pass | `output/playwright/ux-regression-qa/01-campaign-menu.png` |
| Campaign Menu | System campaign is visually distinguishable from user campaign. | Pass | `output/playwright/ux-regression-qa/01-campaign-menu.png` |
| Campaign Menu | User campaign create, open, archive, and restore are understandable. | Pass | `output/playwright/ux-regression-qa/02-campaign-archive.png` |
| Campaign Menu | Archived campaign is not the continue target. | Pass | `output/playwright/ux-regression-qa/02-campaign-archive.png` |
| Today | Empty campaign presents one concrete next action. | Pass | `output/playwright/ux-regression-qa/03-today-empty.png` |
| Today | Populated campaign puts the next node above secondary status. | Pass | `output/playwright/ux-regression-qa/04-today-populated.png` |
| Today | No-route state is explicit and does not present a broken route CTA. | Pass | `output/playwright/ux-regression-qa/04-today-populated.png` |
| Today | Verified progress differs from self-marked progress. | Pass | `output/playwright/ux-regression-qa/18-mobile-today-390.png` |
| Map Free Canvas | User can create a node through visible controls. | Pass | `output/playwright/ux-regression-qa/06-map-create-node.png` |
| Map Free Canvas | User can connect two nodes through visible controls. | Fail | Blocked by UX-QA-001. |
| Map Free Canvas | User can delete an edge through visible controls. | Blocked | Edge creation failed because of UX-QA-001. |
| Map Free Canvas | User can archive a node through visible controls. | Pass | `output/playwright/ux-regression-qa/20-mobile-archive-node.png` |
| Map Layers | Target parent/layer is clear. | Pass | `output/playwright/ux-regression-qa/07-map-layers.png` |
| Inspector | Selected node identity is clear. | Pass | `output/playwright/ux-regression-qa/05-map-free-canvas.png` |
| Inspector | Route controls are separate from assessment controls. | Pass | `output/playwright/ux-regression-qa/08-inspector-assessment.png` |
| Inspector | Graph mode is reachable and readable. | Pass | `output/playwright/ux-regression-qa/11-inspector-graph.png` |
| Assessment | Validation is clear before evidence is filled. | Pass | `output/playwright/ux-regression-qa/08-inspector-assessment.png` |
| Assessment | Failed attempt looks like a normal learning result. | Pass | `output/playwright/ux-regression-qa/09-assessment-fail.png` |
| Assessment | Verified pass attempt updates checked progress. | Pass | `output/playwright/ux-regression-qa/10-assessment-pass.png` |
| Check Authoring | Exact, number, contains, checklist, manual strict, and LLM-assisted check forms can be opened. | Pass | `output/playwright/ux-regression-qa/12-check-metadata-authoring.png` |
| Wind Rose | Selected stat shows branches. | Pass | `output/playwright/ux-regression-qa/13-wind-rose.png` |
| Wind Rose | Branch target is clear before opening. | Pass | `output/playwright/ux-regression-qa/13-wind-rose.png` |
| Wind Rose | Opening a branch focuses the expected map area. | Pass | `output/playwright/ux-regression-qa/14-wind-rose-open-branch.png` |
| Large Graph | Template creates a large 91-node graph structure. | Pass | `output/playwright/ux-regression-qa/15-large-graph-template.png` |
| Large Graph | Large graph top layer remains readable. | Pass | `output/playwright/ux-regression-qa/16-large-graph-layer.png` |
| Large Graph | Free-canvas overview is readable for the large graph. | Finding | See UX-QA-002. |
| Mobile 390px | Campaign Menu remains readable. | Pass | `output/playwright/ux-regression-qa/17-mobile-campaign-390.png` |
| Mobile 390px | Today remains readable and button text fits. | Pass | `output/playwright/ux-regression-qa/18-mobile-today-390.png` |
| Mobile 390px | Map appears before Inspector in a deliberate order. | Pass | `output/playwright/ux-regression-qa/19-mobile-map-390.png` |
| Mobile 390px | Navigation labels remain horizontal and do not break campaign names vertically. | Pass | `output/playwright/ux-regression-qa/17-mobile-campaign-390.png` |

## Console Record

Final console count:

- Errors: 1
- Warnings: 0

Recorded error:

```text
ReferenceError: CONNECT_NODE_HIT_RADIUS is not defined
    at BrainGainzScene.finishBackgroundInteraction (http://127.0.0.1:5173/src/game/brain-gainz-scene.ts:375:56)
    at BrainGainzScene.handlePointerUp (http://127.0.0.1:5173/src/game/brain-gainz-scene.ts:665:22)
```

## Findings

### UX-QA-001 - High - Free Canvas connect flow throws and blocks edge creation

When using the visible `Connect` control and choosing a target node, the app throws `ReferenceError: CONNECT_NODE_HIT_RADIUS is not defined` from `src/game/brain-gainz-scene.ts:375:56`.

Impact: visible node-to-node connection cannot be completed in this QA run, and edge deletion could not be verified because no new edge could be created.

Regression coverage: keep a browser QA step that creates two nodes, enters connect mode, selects a target node, verifies no console error, then deletes the created edge through visible controls.

### UX-QA-002 - Medium - Large graph canvas overview can appear empty while structure contains 91 nodes

After creating the Algebra I template, the structure selector shows `Algebra I - 91 nodes`, but the free-canvas area shows an empty-map state while the root node is selected. Switching into layer context exposes the top-level sections and remains readable.

Impact: large graph data exists and layer navigation is readable, but the initial canvas overview can look like the large graph failed to render.

Regression coverage: keep a large-graph QA step that creates the Algebra I template, verifies the selected structure count, verifies the initial map canvas content, and verifies layer readability.

## Screenshot Index

- `output/playwright/ux-regression-qa/01-campaign-menu.png`
- `output/playwright/ux-regression-qa/02-campaign-archive.png`
- `output/playwright/ux-regression-qa/03-today-empty.png`
- `output/playwright/ux-regression-qa/04-today-populated.png`
- `output/playwright/ux-regression-qa/05-map-free-canvas.png`
- `output/playwright/ux-regression-qa/06-map-create-node.png`
- `output/playwright/ux-regression-qa/07-map-layers.png`
- `output/playwright/ux-regression-qa/08-inspector-assessment.png`
- `output/playwright/ux-regression-qa/09-assessment-fail.png`
- `output/playwright/ux-regression-qa/10-assessment-pass.png`
- `output/playwright/ux-regression-qa/11-inspector-graph.png`
- `output/playwright/ux-regression-qa/12-check-metadata-authoring.png`
- `output/playwright/ux-regression-qa/13-wind-rose.png`
- `output/playwright/ux-regression-qa/14-wind-rose-open-branch.png`
- `output/playwright/ux-regression-qa/15-large-graph-template.png`
- `output/playwright/ux-regression-qa/16-large-graph-layer.png`
- `output/playwright/ux-regression-qa/17-mobile-campaign-390.png`
- `output/playwright/ux-regression-qa/18-mobile-today-390.png`
- `output/playwright/ux-regression-qa/19-mobile-map-390.png`
- `output/playwright/ux-regression-qa/20-mobile-archive-node.png`
