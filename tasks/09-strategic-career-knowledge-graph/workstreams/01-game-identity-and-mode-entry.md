# Workstream 01: Game Identity And Mode Entry

## Goal

Make the app feel like a strategic learning game while preserving the campaign entry point from task 08.

## Scope

Includes:
- naming and framing of the two major modes
- campaign menu updates for career vs free mode
- race / specialization / length entry points
- compact campaign victory / continue framing
- visual-first mode cards

Excludes:
- full race balance
- full tutorial
- marketplace or campaign sharing

## Product Decisions

Modes:
- `Career`: prepared developer campaigns based on real educational routes
- `Free Mode`: user-built learning trees and personal campaigns

Mode is not the same thing as the task 08 `campaign.type`.

Task 08 campaign types remain technical ownership / seed types:
- `developer_main`
- `user`

Task 09 should add separate mode metadata such as `mode = career/free` or `route_source = developer/user`.

Rules:
- `developer_main` is not the only possible Career campaign.
- A user-created campaign can use Career-style routes.
- A user-created campaign can also be Free Mode.
- `developer_main` remains a normal editable campaign with one exception: it cannot be archived.

Career setup should eventually include:
- race
- specialization
- route length

V1 can phase this in:
- keep existing campaign menu
- add visual mode distinction
- expose race / specialization where implemented
- do not block existing campaigns that do not yet have race or specialization data

## UX Rules

- Mode choice should be visual, not a long explanation.
- Campaign cards should show race, specialization, progress, and status at a glance.
- Completed specialization should show a clear victory state and a clear "continue with another specialization" path.
- `developer_main` remains visible and editable, but cannot be archived.

## Done When

- Campaign entry communicates Career vs Free Mode.
- Existing campaigns still open normally.
- Career / Free Mode does not replace task 08 `campaign.type`.
- Career campaign can show current race / specialization when present.
- Completed specialization has a visual completion state.
- Continue path is visible without large explanation text.
