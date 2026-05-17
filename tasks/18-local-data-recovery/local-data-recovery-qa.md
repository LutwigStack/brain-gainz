# Local Data Recovery QA

## Environment

- Date: 2026-05-17
- URL: `http://127.0.0.1:5174/`
- Browser QA tool: Playwright CLI

## Browser Passes

- Clean mobile profile: app opened to Campaigns without storage or schema failure.
- Dirty desktop profile: seeded browser `localStorage` with an old SQL.js database where `node_barrier_notes` and `node_error_notes` lacked the `source_event_id` foreign key; app opened to Campaigns without showing the recovery screen.
- Dirty data verification: exported the repaired browser `localStorage` database and verified both note tables now have `source_event_id -> daily_session_events`; seeded barrier and error notes were still present.
- Corrupt mobile profile: seeded invalid local database value; app showed the recovery screen with retry, backup download, and explicit reset.

## Screenshots

Saved under ignored QA output:

- `output/playwright/task-18-local-data-recovery/clean-mobile.png`
- `output/playwright/task-18-local-data-recovery/dirty-repaired-desktop.png`
- `output/playwright/task-18-local-data-recovery/corrupt-recovery-mobile.png`

## Verification

- `npm run test`: pass, 190/190
- `npm run lint`: pass
- `npm run build`: pass
