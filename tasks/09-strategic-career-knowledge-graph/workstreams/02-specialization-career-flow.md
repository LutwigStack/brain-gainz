# Workstream 02: Specialization Career Flow

## Goal

Add specializations as routes inside campaigns, including completion and continuation.

## Scope

Includes:
- specialization model
- selected/current specialization state
- specialization status transitions
- specialization completion state
- continue with new specialization
- campaign history of completed specializations

Excludes:
- automatic generation of university routes
- complex route recommendation engine
- deleting completed specializations

## Model V1

Specialization fields:
- `id`
- `campaign_id`
- `name`
- `key`
- `domain`
- `length`
- `status`
- `started_at`
- `completed_at`
- `created_at`
- `updated_at`

Valid statuses:
- `active`
- `completed`
- `paused`
- `archived`

Rules:
- campaign has one current specialization
- completing specialization does not archive the campaign
- user can stop at completion or continue with another specialization
- continuing preserves campaign stats, XP, city, race, and mastery

## State Machine V1

Campaign current state:
- store the selected specialization as `campaign.current_specialization_id` or an equivalent single source of truth
- store campaign victory as `campaign.career_status`
- valid `campaign.career_status` values are `active` and `victory`
- at most one `active` specialization per campaign
- `current_specialization_id` can point to an `active`, `paused`, or `completed` specialization
- `current_specialization_id` can be null only when the campaign is in `victory` and the completed current specialization was archived
- completed specializations remain in history and are not deleted

Allowed transitions:
- `active -> completed`
- `active -> paused`
- `paused -> active`
- `completed -> active` is out of scope for v1 unless a future explicit revisit flow is designed
- `completed -> archived`
- `paused -> archived`

Continuation:
- after `active -> completed`, `current_specialization_id` stays on the completed specialization until the user chooses a new specialization
- the completed current specialization drives the victory state
- completing a specialization sets `campaign.career_status = victory` in the same transaction
- choosing a new specialization creates or activates an `active` specialization and replaces `current_specialization_id`
- choosing a new specialization sets `campaign.career_status = active` in the same transaction
- continuation is derived from completed specialization history, not from a separate `continued` campaign status
- continuation must not reset campaign stats, XP ledger, mastery events, city projection, race, or previous specialization history

Archive visibility:
- archived completed specialization is hidden from active/current pickers
- archived completed specialization remains visible in completed history and victory timeline
- archive is not deletion
- if the archived specialization was the current completed specialization, the archive operation clears `current_specialization_id` in the same transaction and keeps `campaign.career_status = victory`
- archiving a current `active` or `paused` specialization remains guarded unless the operation also selects another valid current specialization or explicitly pauses/completes the route first

Disallowed / guarded:
- multiple `active` specializations in one campaign
- archiving the current specialization without selecting, completing, or pausing the current route first
- treating specialization completion as campaign archive
- treating campaign archive as specialization completion

## Completion Rules

Specialization completion should be based on route requirements, not just time spent.

V1 may define completion as:
- all required route nodes reach required mastery level
- final check is passed, if route defines one

If final checks are not implemented yet:
- mark the specialization completion model, but keep route completion criteria explicit and testable.

## Done When

- A campaign can have an active specialization.
- A campaign cannot have multiple active current specializations.
- A specialization can be completed.
- After completion, current specialization stays on the completed specialization until continuation.
- Completed specialization remains visible in campaign history.
- Archived completed specialization remains visible in completed history / victory timeline.
- Archiving the current completed specialization does not leave `current_specialization_id` pointing at an archived row.
- User can continue same campaign with a new specialization.
- Continuing does not reset progress from previous specialization.
