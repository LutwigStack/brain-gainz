# 02 Region And Course Model

## Status

`done`

## Goal

Define the typed course-level model for the bachelor catalog.

## Scope

- stable course keys;
- region keys;
- course levels;
- descriptions;
- size buckets;
- atlas hub metadata.

## Required Shape

```ts
type CsCourseLevel = 'pre-core' | 'core' | 'intermediate' | 'advanced' | 'project';
type CsCourseSize = 'small' | 'medium' | 'large' | 'capstone';

interface CsBachelorCourse {
  key: string;
  title: string;
  regionKey: string;
  description: string;
  level: CsCourseLevel;
  yearHint: 1 | 2 | 3 | 4;
  semesterHint: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  prerequisiteKeys: string[];
  followUpKeys: string[];
  infrastructureObjectCandidate: boolean;
  atlasHubType: 'course_hub' | 'project_hub' | 'support_hub';
  size: CsCourseSize;
}
```

## Requirements

- The model describes courses, not lessons.
- Each course has one primary region.
- Prerequisites are course keys only.
- Future lower nodes will reference course keys.

## Done When

- Course data can be validated in tests.
- Every canonical course has required metadata.
- No atomic nodes are created.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
