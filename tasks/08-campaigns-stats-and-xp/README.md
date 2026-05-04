# 08 Campaigns Stats And XP

## Status

`planned`

## Goal

Make campaigns the top-level application entry point and add a simple stat progression loop:
- launch into a campaign menu
- open one campaign before using `Now`, `Map`, or `Wind Rose`
- keep each campaign's skills, structures, nodes, edges, progress, stats, and current focus scoped to that campaign
- turn completed learning work into simple stat XP
- use the wind rose as a visual navigation surface, not a text dashboard

## Scope

Includes:
- campaign menu and campaign shell
- one editable developer main campaign
- user-created campaigns
- campaign-scoped data reads and writes
- campaign-specific stats
- branch-to-stat assignment
- simple XP and level rules
- wind rose view
- stat-to-branch-to-map navigation
- campaign-scoped `Now`
- visual-first UI rules for the new surfaces

Excludes:
- marketplace / sharing campaigns
- immutable developer templates
- campaign version merging
- cloud sync
- multiplayer / collaboration
- complex economy, currencies, shops, rewards, or achievements
- global stats shared across all campaigns
- long textual onboarding or explanation screens

## Product Direction

- A campaign is a separate learning run.
- The app always starts from the campaign menu.
- `Now`, `Map`, and `Wind Rose` exist inside the selected campaign, not globally.
- The developer main campaign exists as normal editable data for now.
- Each campaign can have its own stat set and specialized skill structure.
- The wind rose should answer visually:
  - what is strong
  - what is weak
  - which stat can be trained next
  - which branches train that stat
- Text should be minimized. Prefer shapes, color, size, progress, icons, compact labels, and details-on-demand.

## Model Decisions

- `campaign` is the top-level boundary for user-facing work.
- Existing data migrates into the developer main campaign.
- The developer main campaign is editable from the normal UI in v1.
- User campaigns and the developer main campaign share the same editing behavior in v1 except campaign archive: `developer_main` cannot be archived.
- A branch is a campaign-scoped `skill` in v1.
- A branch map opens the existing map focused / filtered to that skill; it does not introduce a second graph model.
- A branch may have one `primary_stat_id` in v1; without it, completion creates no XP grant and shows a compact warning.
- Multi-stat weights are out of scope for v1.
- XP is derived from node completion events and branch stat assignment.
- XP truth is a ledger of grants, not side effects on stat counters.
- XP should not be granted twice for the same completed node.
- `done -> active / paused` removes or deactivates the XP grant.
- Unarchiving an archived completed node preserves the existing XP grant and must not create another grant.
- The wind rose is a navigation surface first and a progress chart second.

## Visual UI Rules

- Do not fill campaign screens with explanatory copy.
- Use text as labels, not as documentation.
- Keep permanent text short: names, levels, counts, action labels.
- Hide details behind click, hover, drill-in, or compact panels.
- Prefer:
  - visual cards for campaigns
  - radial stat shape for the wind rose
  - color and icon identity for stats
  - progress rings / bars for levels
  - branch chips/cards for stat drill-down
- Avoid:
  - long paragraphs
  - big tables as the primary UI
  - repeated helper text
  - multiple competing primary buttons in the same area

## Success Criteria

- On app launch, the user chooses or continues a campaign before entering the work area.
- The selected campaign owns the visible `Now`, `Map`, and `Wind Rose`.
- Switching campaigns changes visible structures, skills, nodes, edges, stats, and focus.
- Developer main shares normal campaign editing behavior but cannot be archived.
- Completing nodes increases stat XP predictably.
- Undo and `done -> active / paused` prevent duplicate or stale XP.
- Unarchive preserves one existing completed-node XP grant.
- Migration into the developer main campaign is idempotent and safe to re-run.
- Existing map modes still work inside a selected campaign.
- The wind rose makes stat strengths and weaknesses visible without reading a lot of text.
- Clicking a stat leads to branches, and clicking a branch opens the relevant map.

## Workstreams

- `planned` - [workstreams/01-campaign-menu-and-shell.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/01-campaign-menu-and-shell.md)
- `planned` - [workstreams/02-campaign-scoped-data.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/02-campaign-scoped-data.md)
- `planned` - [workstreams/03-developer-main-campaign.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/03-developer-main-campaign.md)
- `planned` - [workstreams/04-campaign-stats-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/04-campaign-stats-model.md)
- `planned` - [workstreams/05-simple-xp-economy.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/05-simple-xp-economy.md)
- `planned` - [workstreams/06-wind-rose-view.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/06-wind-rose-view.md)
- `planned` - [workstreams/07-stat-to-branch-navigation.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/07-stat-to-branch-navigation.md)
- `planned` - [workstreams/08-campaign-now-view.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/08-campaign-now-view.md)
- `planned` - [workstreams/09-visual-ui-rules.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/09-visual-ui-rules.md)
- `planned` - [workstreams/10-tests-and-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/08-campaigns-stats-and-xp/workstreams/10-tests-and-qa.md)
