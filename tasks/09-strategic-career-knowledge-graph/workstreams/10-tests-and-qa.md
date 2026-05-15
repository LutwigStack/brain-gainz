# Workstream 10: Tests And QA

## Goal

Verify that strategic career features do not break campaign scoping, map editing, XP, or user flow.

## Scope

Includes:
- model tests
- migration / adapter tests
- UI smoke tests
- visual density review
- manual QA for career continuation
- asset review checklist

## High-Risk Scenarios

Specialization continuation:
- complete specialization
- continue same campaign with a new specialization
- completed specialization remains current until continuation
- campaign victory is not campaign archive
- campaign victory source of truth is stored `campaign.career_status`
- continuing with a new specialization sets `campaign.career_status = active`
- continuation history comes from completed specializations, not a separate `continued` status
- archived completed specialization remains in completed history / victory timeline
- archiving current completed specialization clears or replaces `current_specialization_id` without leaving a dangling pointer
- overlapping nodes keep mastery
- new nodes appear as new frontier
- XP is not duplicated
- retention tasks can appear for old nodes
- opponent progress resets for the new specialization

Campaign compatibility:
- existing task 08 campaign still opens
- campaign menu still works
- developer main cannot be archived
- user campaign archive/restore still works
- current specialization does not leak across campaigns

Map compatibility:
- free canvas still creates and moves nodes
- layers mode still creates children correctly
- route filtering/focus does not hide required editing controls
- shared/overlapping node identity does not duplicate edges unexpectedly
- route membership duplicate insertion is rejected
- canonical knowledge identity does not share mastery across campaigns

Mastery and checks:
- old completed nodes map to explicit mastery state
- strict checks and LLM-assisted checks are stored differently
- mastery changes require evidence where applicable
- `done -> active / paused` still handles XP correctly
- `done -> active / paused` reverses completion-derived legacy `confirmed` mastery but does not erase assessment-backed mastery
- self-marked Free Mode progress does not grant XP or verified route completion

Wind Rose and stats compatibility:
- Wind Rose continues to load within selected campaign scope
- stat to branch to map navigation still opens the expected skill focus / filter
- specialization route filters do not break branch stat assignment
- XP ledger and mastery state do not visibly disagree on completed / confirmed progress
- overlapping route reuse does not double-count stat XP

Visual QA:
- main campaign screen is understandable in two seconds
- no wall-of-text onboarding
- race/city/opponent panels do not crowd the primary next action
- icons remain readable at real size
- generated assets match the style guide and do not include UI text

## Done When

- Tests cover specialization completion and continuation.
- Tests cover campaign victory without campaign archive.
- Tests cover continuation setting one concrete campaign status.
- Tests cover archived completed specialization history visibility.
- Tests cover archived current specialization pointer handling.
- Tests cover overlapping route node reuse.
- Tests cover route membership uniqueness.
- Tests cover XP and mastery no-duplicate rules.
- Tests cover Wind Rose and stat to branch to map compatibility after specialization changes.
- Manual QA covers existing map free canvas and layers.
- Visual review confirms the new game layer is readable and not text-heavy.
