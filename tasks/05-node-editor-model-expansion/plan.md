# Plan

## Intent

Turn the remaining pseudo-persisted parts of `Node Editor` into a real saved model.

## Order

1. Add schema support for editor-owned node fields.
2. Expose the new fields through stores and typed boundaries.
3. Migrate the rail so persisted fields are editable and derived fields stay clearly read-only.

## Risks

- confusing persisted editor fields with relationship graph data
- breaking old snapshots if the new fields are not backfilled safely
- leaving mixed semantics in the rail after partial migration
