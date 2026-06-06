# 02 Region And Course Model

## Status

`done`

## Goal

Define the typed course-level model for `NLH cash`.

## Scope

- stable course keys;
- region keys;
- course levels;
- descriptions;
- prerequisite keys;
- risk notes;
- atlas hub metadata.

## Required Shape

```ts
type NlhCourseLevel = 'foundation' | 'core' | 'intermediate' | 'advanced' | 'routine';
type NlhCourseSize = 'small' | 'medium' | 'large' | 'capstone';

interface NlhCashCourse {
  key: string;
  title: string;
  regionKey: string;
  description: string;
  level: NlhCourseLevel;
  orderHint: number;
  prerequisiteKeys: string[];
  followUpKeys: string[];
  infrastructureObjectCandidate: boolean;
  atlasHubType: 'course_hub' | 'routine_hub' | 'risk_hub';
  size: NlhCourseSize;
  riskNote: string | null;
}
```

## Requirements

- The model describes courses, not hand spots.
- Every course has one primary region.
- Prerequisites are course keys only.
- Risk notes are required for bankroll, stop-loss, tilt, shot-taking, and variance courses.

## Done When

- Course data can be validated in tests.
- Every canonical course has required metadata.
- No atomic poker spots are created.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
