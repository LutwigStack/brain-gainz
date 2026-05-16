# 03 First Playable CS Slice

## Status

`planned`

## Goal

Build the first playable CS campaign slice with enough graph, route, and assessment content to test BrainGainz mechanics.

## Scope

- implement 30-60 meaningful nodes across the first slice
- include prerequisite edges and branch grouping
- create one main specialization route
- add side branches for weak spot and recovery testing
- add assessment metadata examples across supported check types
- ensure the graph is readable in overview and route contexts
- keep content concise and useful, not encyclopedic

## First Slice Candidate

Main route:
- Programming Basics
- Control Flow
- Functions
- Basic Data Structures
- Discrete Logic
- Proof Basics
- Complexity Intuition
- Arrays / Lists / Stacks / Queues
- Recursion
- Sorting / Searching
- Graph Basics

Side branches:
- Debugging
- Testing
- Mathematical Notation
- Memory Model Intro

## Done When

- CS template has a usable first slice
- Map overview shows meaningful branches
- Today can pick real next tasks
- Wind Rose has branch/stat data to show
- at least one check exists for exact, number, contains, checklist, manual, and LLM-assisted style over the slice or documented staged content
- route stages are visible and understandable

## High-Risk Scenarios

- too many nodes before map is readable
- assessment tasks are fake or unclear
- route is linear with no useful side branches
- prerequisite edges make the first day impossible

## Suggested Tests

- graph seed/read test
- navigation snapshot test for CS campaign
- route projection test
- browser smoke: open map, Today, Wind Rose for CS campaign
