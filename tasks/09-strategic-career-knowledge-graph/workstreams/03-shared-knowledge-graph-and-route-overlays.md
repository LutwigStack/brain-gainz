# Workstream 03: Shared Knowledge Graph And Route Overlays

## Goal

Prepare the model for a shared knowledge graph while avoiding a risky rewrite of the task 08 campaign-scoped graph.

## Scope

Includes:
- stable knowledge identity for reusable concepts
- route membership for specializations
- overlap detection for existing nodes
- reuse of existing mastery for overlapping nodes
- visual distinction between known nodes and new frontier nodes

Excludes:
- full global graph migration in one step
- automatic deduplication of all existing nodes
- external curriculum import

## Product Rule

Different specializations can reference the same knowledge.

Examples:
- linear algebra can belong to mathematics, CS, ML, physics, bioinformatics, and poker solvers
- a mastered shared node can count toward multiple routes
- old knowledge can reappear as retention or reinforcement

## Model Direction

V1 can introduce optional shared identity:
- `knowledge_node_id` or equivalent stable canonical id
- route membership table linking specialization routes to nodes
- required mastery level per route node
- route-specific labels or rewards without duplicating mastery

Do not require every existing node to have a canonical knowledge id on day one. Missing canonical ids should be allowed, but new developer route content should use them where possible.

## V1 Contract

Recommended tables / concepts:
- `knowledge_nodes`: optional canonical identity for reusable concepts
- `specialization_route_nodes`: route membership linking specialization to a campaign node and/or `knowledge_node_id`
- `specialization_route_edges`: route-specific prerequisite / unlock requirements

Suggested uniqueness:
- route membership should be unique per `(specialization_id, knowledge_node_id)` when `knowledge_node_id` exists
- route membership should be unique per `(specialization_id, node_id)` when only campaign node exists
- the same route should not create two entries for the same conceptual node

SQL-safe enforcement:
- use a partial unique index for `(specialization_id, knowledge_node_id)` where `knowledge_node_id IS NOT NULL`
- use a partial unique index for `(specialization_id, node_id)` where `knowledge_node_id IS NULL AND node_id IS NOT NULL`
- if the database adapter cannot express partial unique indexes, enforce the same guards in the route membership service before insert/update

Reuse order:
1. If route item has `knowledge_node_id`, find existing campaign node with that `knowledge_node_id`.
2. If no canonical match exists, use explicit route-to-node mapping if present.
3. If no mapping exists, create a new campaign node for that route item.
4. Do not auto-deduplicate old graph content by title or loose text similarity in v1.

Route overlay edges:
- route prerequisite / unlock edges belong to the specialization route overlay
- campaign graph edges remain the editable map graph truth from task 08
- route overlay edges can guide progress and display route requirements without rewriting user-created graph edges

Progress identity:
- mastery and XP should be granted once for the reused campaign node / canonical identity
- route progress can count reused mastery toward several specializations
- route membership itself must not create duplicate XP or mastery
- mastery and XP uniqueness always includes `campaign_id`
- canonical identity does not automatically share mastery across campaigns in v1
- cross-campaign mastery import / sharing is a separate future flow, not implicit behavior

## Overlap Rules

When adding a new specialization route:
- if route node maps to an existing campaign node or canonical knowledge id, reuse it
- preserve mastery state
- do not duplicate XP grants
- show reused nodes as already-known / partially-known in the route
- create only missing route nodes

## Done When

- Specialization routes can contain nodes.
- Route nodes can overlap with existing campaign nodes.
- Overlapping nodes keep current mastery and XP state.
- Overlapping route nodes do not duplicate XP or mastery.
- Route membership duplicate insertion is rejected.
- Canonical node identity does not share mastery across campaigns.
- New route nodes open without resetting old progress.
- UI can distinguish already-known route content from new frontier content.
