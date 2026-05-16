# 04 Race City Opponent Visual Cards

## Status

`planned`

## Goal

Turn race, city, XP, and opponent status into meaningful visual cards like the reference right rail.

## Scope

- create Today right rail with race card, city progress card, and opponent card
- use existing campaign/race/opponent data when available
- provide stable placeholder assets for race portrait, city, and opponent if final art is missing
- show XP, rank/title, streak, city level, and opponent progress where data exists
- avoid presenting missing data as broken
- make the cards visually distinct from forms and debug panels

## UX Direction

The right rail should motivate without stealing the primary daily action.

Cards should answer:
- who am I playing as?
- how is my city/campaign growing?
- who is the opponent?
- what progress comparison matters?

## Done When

- Today has a right rail on desktop
- race/persona card is visual, not text-only
- city progress has a visual image/placeholder and XP meter
- opponent has portrait/banner/progress state
- missing data has intentional empty/placeholder states
- right rail collapses or moves predictably on mobile

## High-Risk Scenarios

- no race selected
- no opponent active
- city level/progress missing
- free mode vs career mode
- small viewport

## Suggested Tests

- view-model tests for race/city/opponent card states
- browser screenshot QA for right rail
- mobile screenshot QA for collapsed rail
