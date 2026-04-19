# Plan: PR1 Repository Bootstrap Design

## Project Goal

Transform BrainGainz into a node-centered development OS without growing the current `src/db.js` bootstrap into a larger persistence monolith.

## Task Goal

Produce an implementation-facing repository/bootstrap design for PR1 covering module boundaries, startup flow, migration runner ownership, seed posture, and storage test seams.

## Implementation Checklist

- [x] Define target bootstrap responsibilities.
- [x] Define repository/store split for PR1.
- [x] Define startup and migration runner flow.
- [x] Define legacy compatibility and seed posture.
- [x] Define storage-focused test seams for implementation.

## Validation Checklist

- [x] Design keeps migration and CRUD concerns separable.
- [x] Legacy subject/card flow remains bootable.
- [x] Store boundaries match the PR1 data contract and SQL blueprint.
- [x] Design avoids a larger replacement monolith.

## Rollout/Rollback Checklist

- [x] Documentation-only lane; no runtime rollout.
- [x] Future implementation can roll back by bypassing new stores while keeping legacy bootstrap active.

## Deferred Ideas / Not Tested Here

- Exact file paths/names in source code may be adjusted to match implementation style.
- Whether repositories stay in frontend JS first or partially move behind Tauri commands is deferred.
- Shared query helpers and transaction wrappers can be finalized during implementation.