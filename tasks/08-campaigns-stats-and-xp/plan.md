# Plan

## Intent

Move BrainGainz from a single workspace into campaign-based learning runs with a simple visual progression layer.

The campaign menu becomes the app entry point. After a campaign is selected, the user works inside that campaign through `Now`, `Map`, and `Wind Rose`.

## Product Direction

- Campaigns are separate learning worlds.
- The developer main campaign is editable in v1.
- User-created campaigns and the developer campaign share the same editing behavior for now except campaign archive: `developer_main` cannot be archived.
- Campaigns specialize their own stats and skills.
- Progress should feel game-like, but the first economy must stay simple.
- Interfaces must be visual-first and light on permanent text.

## Technical Direction

- Introduce `campaigns` as a first-class model.
- Migrate existing structures, skills, nodes, edges, actions, sessions, review/progress state, notes, and legacy learning data into the developer main campaign or explicitly mark each table as global.
- Filter all app data by selected campaign.
- Persist selected / last-opened campaign as app state.
- Add campaign-specific stats.
- Add an XP grant ledger so node completion cannot grant duplicate XP.
- Keep stat levels derived from XP totals, not manually edited counters.
- Keep the map graph truth unchanged:
  - nodes
  - coordinates
  - typed edges
  - campaign ownership

## UX Direction

- The app starts with visual campaign selection.
- The campaign shell should not feel like a settings page.
- The wind rose should be a compact visual map of the user's development.
- Details appear after a click, not as always-visible prose.
- Avoid onboarding walls, explanatory cards, and large text panels.
- Use short labels, icons, color, position, and progress indicators.

## Model Decisions

- v1 campaign types:
  - `developer_main`
  - `user`
- v1 campaign fields:
  - `id`
  - `type`
  - `name`
  - optional `icon`
  - optional `color`
  - `is_archived`
  - `created_at`
  - `updated_at`
  - `last_opened_at`
- campaign delete is out of scope for v1
- user campaigns can be archived and restored from a compact manage / archived section
- archived campaigns are hidden from normal lists and cannot become one-click continue targets
- `developer_main` cannot be archived in v1
- v1 developer campaign:
  - one campaign
  - seeded automatically
  - editable in the normal UI
  - not protected from user edits yet
- v1 stats:
  - campaign-owned
  - title, key, color, icon, sort order
  - developer main receives seeded stats
  - new user campaigns receive a minimal default stat set
  - XP and level derived from node completion
- v1 branch assignment:
  - branch means campaign-scoped `skill`
  - optional `primary_stat_id` per branch
  - branch without `primary_stat_id` is allowed, but completion creates no XP grant and the UI shows a compact visual unassigned-stat warning
  - weighted stats are not implemented in v1
- v1 XP:
  - normal node: 10 XP
  - important node: 25 XP
  - milestone / check node: 50 XP
  - no XP for archive
  - no double XP for repeated completion
  - undo and `done -> active / paused` remove or deactivate XP
  - unarchiving an archived completed node preserves the existing XP grant and does not create another one
- v1 completion:
  - completion is one explicit node transition into `done`
  - archive alone never creates XP
  - undo restores the XP ledger state for the reverted action

## Delivery Order

1. campaign menu and shell
2. campaign-scoped data
3. developer main campaign seed/edit behavior
4. campaign stats model
5. simple XP economy
6. wind rose view
7. stat-to-branch-to-map navigation
8. campaign-scoped `Now`
9. visual UI guardrails
10. tests and QA

## Risks

- creating a global campaign wrapper without correctly filtering all reads and writes
- making the wind rose decorative instead of navigational
- overloading the UI with explanatory text
- granting XP twice when node completion flows are retried or undone
- making the developer main campaign too special too early
- mixing official content and user content before there is a versioning strategy
- under-scoping actions, sessions, reviews, or notes and leaking progress across campaigns
- treating branch-focused map as a new graph model instead of a view of existing campaign graph data

## First Usable Slice

The smallest valuable version:
- campaign menu opens first
- developer main campaign can be opened
- existing data belongs to that campaign
- campaign tabs show `Now`, `Map`, `Wind Rose`
- campaign stats exist
- root branches can assign a primary stat
- completed nodes grant simple XP
- wind rose shows stat levels and links to branches
- campaign menu has one-click continue for the last campaign
- new user campaign starts with a usable stat path, not an empty broken wind rose
