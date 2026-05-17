# CS Course Second Slice QA

## Browser Pass

Target: `http://127.0.0.1:5174/`

Environment: clean temporary Chrome profile through Playwright.

The in-app browser was also opened first, but its existing IndexedDB still had an old migration verification failure for `node_barrier_notes.source_event_id`. The clean Chrome profile was used for the actual QA so the run tested the current checkout without stale browser storage.

## Checks

- Forked `Computer Science Bachelor` into a personal campaign.
- Confirmed Today opens on `Programming Environment` with `0/72` required route progress.
- Confirmed route overview shows five stages, includes `Database Systems` with 28 nodes, and renders the Database Systems landmark instead of the blank fallback.
- Opened `Data Modeling Purpose` from the route overview.
- Opened the database checklist check and confirmed the database prompt appears.
- Confirmed Wind Rose includes `Databases`.
- Captured mobile route overview cards at `390x844`.
- Browser console warnings/errors during the clean-profile run: none.

## Screenshots

- [second-slice-today-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/17-cs-course-second-slice/qa/second-slice-today-desktop.png)
- [second-slice-route-overview-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/17-cs-course-second-slice/qa/second-slice-route-overview-desktop.png)
- [second-slice-database-check-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/17-cs-course-second-slice/qa/second-slice-database-check-desktop.png)
- [second-slice-wind-rose-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/17-cs-course-second-slice/qa/second-slice-wind-rose-desktop.png)
- [second-slice-route-mobile.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/17-cs-course-second-slice/qa/second-slice-route-mobile.png)

## Automated Coverage

- CS template seed counts: 86 nodes, 8 branches, 7 Wind Rose stats.
- Route overview route size: 72 nodes.
- Database branch count: 28 nodes.
- Today route-front behavior: after the first slice is confirmed, `Data Modeling Purpose` becomes the primary recommendation and `Database Systems` becomes the current stage.
