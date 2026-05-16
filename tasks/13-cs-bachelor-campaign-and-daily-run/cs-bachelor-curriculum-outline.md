# Computer Science Bachelor Curriculum Outline

## Intent

This artifact defines a simplified but plausible `Computer Science Bachelor` campaign for BrainGainz product testing. It is not an accredited degree plan. It is a structured campaign template with enough curriculum shape to exercise map overview, routes, prerequisites, mastery, assessment checks, Daily Run sessions, weak spot recovery, and learner vs author surfaces.

The first playable slice should be seeded before the full campaign. The rest of the bachelor outline exists so the campaign feels coherent and so later branches have a known destination.

## Campaign Shape

- Campaign title: `Computer Science Bachelor`
- Campaign kind: reusable template, forkable into a personal campaign
- Recommended route title for first slice: `Core CS Foundations`
- Primary first slice path: `Programming Fundamentals -> Discrete Math -> Data Structures -> Algorithms`
- First playable slice target: `58 nodes`
- First playable slice range requirement: `30-60 nodes`
- Suggested first seed scope: all 58 first-slice nodes, route stages, prerequisite edges, side branches, and representative checks

## Curriculum Years And Stages

| Year | Stage | Main branches | Product purpose |
| --- | --- | --- | --- |
| Year 1 | Foundations | Programming Fundamentals, Discrete Math, Calculus Lite, Computer Systems Intro | Establish prerequisite chains, early mastery, small checks, first Daily Runs |
| Year 2 | Core CS | Data Structures, Algorithms, Databases, Linear Algebra Lite, Operating Systems Basics | Exercise route choices, branch comparisons, stronger assessments, weak spot recovery |
| Year 3 | Systems And Building | Software Engineering, Networks, Programming Languages, Compilers Lite, AI/ML Intro | Test larger map overview, project/`manual_strict` checks, specialization branches |
| Year 4 | Specialization And Capstone | Distributed Systems, Security, Advanced Electives, Capstone | Test long-term goals, elective branches, capstone readiness, learner/author separation |

## Branches

### Core Foundations

- `programming-fundamentals`: syntax, control flow, functions, data representation, debugging, small programs
- `discrete-math`: logic, sets, proofs, induction, relations, counting, graph vocabulary
- `data-structures`: abstract data types, arrays, lists, stacks, queues, hash tables, trees, heaps, graph representation
- `algorithms`: complexity, searching, sorting, recursion, greedy intuition, dynamic programming intuition, graph traversal

### Supporting Foundation Branches

- `debugging-and-testing`: reproduction, tracing, assertions, basic unit tests, test cases for edge behavior
- `math-notation-and-proof-support`: notation fluency, translating statements, proof reading, recurrence notation
- `memory-model-intro`: values, references, call stack, heap intuition, aliasing, mutation costs

### Later Bachelor Branches

- `computer-systems`: binary representation, CPU/memory model, processes, files, concurrency basics
- `databases`: relational model, SQL, normalization, indexes, transactions
- `software-engineering`: requirements, design, version control, code review, testing strategy, maintainability
- `operating-systems`: processes, scheduling, memory, file systems, synchronization
- `networks`: layers, IP/TCP/UDP, HTTP, routing, reliability, security basics
- `programming-languages`: types, evaluation, interpreters, functional programming, language design tradeoffs
- `ai-ml-intro`: search, probability basics, supervised learning, evaluation, ethical constraints
- `security`: threat modeling, auth, cryptography basics, web security, secure coding
- `distributed-systems`: replication, consensus intuition, messaging, fault tolerance
- `capstone`: project proposal, architecture, implementation milestones, demo, reflection

## First Playable Slice

The first playable slice is intentionally bounded to the foundation path. It should be large enough to feel like a real course sequence while still being readable in the current map UI.

- Total first-slice nodes: `58`
- Main route nodes: `44`
- Side branch nodes: `14`
- Branch count: `7`
- Seeded assessment-bearing nodes in first seed: `18-24`, selected from the possible check types in the node tables
- Practice/navigation-only nodes: remaining nodes should be seeded without active checks and used for route pacing, prerequisites, and Daily Run variety

### First Slice Branch Counts

| Branch | Node count | Role |
| --- | ---: | --- |
| Programming Fundamentals | 12 | Entry branch and route stage 1 |
| Discrete Math | 10 | Route stage 2 and proof/logic prerequisite layer |
| Data Structures | 12 | Route stage 3 and main practical CS bridge |
| Algorithms | 10 | Route stage 4 and first capstone-like endpoint |
| Debugging And Testing | 5 | Side branch for weak spots and recovery tasks |
| Math Notation Support | 4 | Side branch for learners blocked by discrete math |
| Memory Model Intro | 5 | Side branch for references, recursion, and data structure confusion |

## Route Stages

Route id: `route-core-cs-foundations`

Route title: `Core CS Foundations`

### Stage 1: Programming Fundamentals

Goal: learner can read and write small deterministic programs using variables, control flow, functions, and simple collections.

Recommended route nodes:

- `pf-01-programming-environment`
- `pf-02-values-variables-types`
- `pf-03-expressions-and-operators`
- `pf-04-branching-with-conditionals`
- `pf-05-loops-and-iteration`
- `pf-06-functions-and-parameters`
- `pf-07-scope-and-lifetime`
- `pf-08-arrays-and-lists`
- `pf-09-dictionaries-and-records`
- `pf-10-input-output-and-parsing`
- `pf-11-debugging-basics`
- `pf-12-small-program-design`

Stage gate: complete a small program from a checklist and pass one exact/contains-style code reading check.

### Stage 2: Discrete Math For CS

Goal: learner can reason about program behavior using logic, sets, functions, relations, proof patterns, counting, and graph vocabulary.

Recommended route nodes:

- `dm-01-sets-and-membership`
- `dm-02-propositions-and-logic`
- `dm-03-truth-tables`
- `dm-04-quantifiers`
- `dm-05-direct-proofs`
- `dm-06-contrapositive-and-contradiction`
- `dm-07-induction`
- `dm-08-functions-and-relations`
- `dm-09-counting-basics`
- `dm-10-graph-vocabulary`

Stage gate: pass a truth-table number check, a proof checklist, and a graph vocabulary exact check.

### Stage 3: Data Structures

Goal: learner can choose and explain core data structures by operation cost, representation, and use case.

Recommended route nodes:

- `ds-01-abstract-data-types`
- `ds-02-arrays-and-dynamic-arrays`
- `ds-03-linked-lists`
- `ds-04-stacks`
- `ds-05-queues`
- `ds-06-recursion-for-structures`
- `ds-07-trees`
- `ds-08-binary-search-trees`
- `ds-09-hash-tables`
- `ds-10-heaps-and-priority-queues`
- `ds-11-graph-representations`
- `ds-12-data-structure-tradeoffs`

Stage gate: complete a data structure tradeoff checklist and an `llm_assisted` explanation check comparing two structures.

### Stage 4: Algorithms

Goal: learner can analyze and apply basic algorithms over arrays, trees, hash tables, and graphs.

Recommended route nodes:

- `al-01-algorithmic-thinking`
- `al-02-asymptotic-complexity`
- `al-03-linear-and-binary-search`
- `al-04-sorting-basics`
- `al-05-divide-and-conquer`
- `al-06-recursion-and-recurrences`
- `al-07-greedy-intuition`
- `al-08-dynamic-programming-intuition`
- `al-09-graph-traversal`
- `al-10-shortest-path-intuition`

Stage gate: pass a complexity number check, a sorting contains check, and one `manual_strict` mini-project review.

## First Slice Nodes

### Programming Fundamentals

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `pf-01-programming-environment` | Programming Environment | none | checklist |
| `pf-02-values-variables-types` | Values, Variables, And Types | `pf-01-programming-environment` | exact |
| `pf-03-expressions-and-operators` | Expressions And Operators | `pf-02-values-variables-types` | number |
| `pf-04-branching-with-conditionals` | Branching With Conditionals | `pf-03-expressions-and-operators` | contains |
| `pf-05-loops-and-iteration` | Loops And Iteration | `pf-04-branching-with-conditionals` | exact, number |
| `pf-06-functions-and-parameters` | Functions And Parameters | `pf-05-loops-and-iteration` | contains |
| `pf-07-scope-and-lifetime` | Scope And Lifetime | `pf-06-functions-and-parameters` | exact |
| `pf-08-arrays-and-lists` | Arrays And Lists | `pf-05-loops-and-iteration` | checklist |
| `pf-09-dictionaries-and-records` | Dictionaries And Records | `pf-08-arrays-and-lists` | contains |
| `pf-10-input-output-and-parsing` | Input, Output, And Parsing | `pf-04-branching-with-conditionals` | checklist |
| `pf-11-debugging-basics` | Debugging Basics | `pf-04-branching-with-conditionals` | checklist |
| `pf-12-small-program-design` | Small Program Design | `pf-06-functions-and-parameters`, `pf-08-arrays-and-lists`, `pf-10-input-output-and-parsing`, `pf-11-debugging-basics` | manual_strict |

### Discrete Math

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `dm-01-sets-and-membership` | Sets And Membership | `pf-02-values-variables-types` | exact |
| `dm-02-propositions-and-logic` | Propositions And Logic | `pf-04-branching-with-conditionals` | exact |
| `dm-03-truth-tables` | Truth Tables | `dm-02-propositions-and-logic` | number |
| `dm-04-quantifiers` | Quantifiers | `dm-01-sets-and-membership`, `dm-02-propositions-and-logic` | contains |
| `dm-05-direct-proofs` | Direct Proofs | `dm-04-quantifiers` | checklist |
| `dm-06-contrapositive-and-contradiction` | Contrapositive And Contradiction | `dm-05-direct-proofs` | checklist |
| `dm-07-induction` | Induction | `dm-05-direct-proofs`, `pf-05-loops-and-iteration` | checklist |
| `dm-08-functions-and-relations` | Functions And Relations | `dm-01-sets-and-membership`, `dm-04-quantifiers` | exact |
| `dm-09-counting-basics` | Counting Basics | `dm-01-sets-and-membership` | number |
| `dm-10-graph-vocabulary` | Graph Vocabulary | `dm-01-sets-and-membership`, `dm-08-functions-and-relations` | exact |

### Data Structures

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `ds-01-abstract-data-types` | Abstract Data Types | `pf-06-functions-and-parameters`, `dm-01-sets-and-membership` | contains |
| `ds-02-arrays-and-dynamic-arrays` | Arrays And Dynamic Arrays | `pf-08-arrays-and-lists`, `ds-01-abstract-data-types` | number |
| `ds-03-linked-lists` | Linked Lists | `ds-01-abstract-data-types` | contains |
| `ds-04-stacks` | Stacks | `ds-01-abstract-data-types`, `pf-06-functions-and-parameters` | exact |
| `ds-05-queues` | Queues | `ds-01-abstract-data-types`, `ds-04-stacks` | exact |
| `ds-06-recursion-for-structures` | Recursion For Structures | `pf-06-functions-and-parameters`, `dm-07-induction` | checklist |
| `ds-07-trees` | Trees | `ds-06-recursion-for-structures`, `dm-10-graph-vocabulary` | contains |
| `ds-08-binary-search-trees` | Binary Search Trees | `ds-07-trees`, `dm-08-functions-and-relations` | llm_assisted |
| `ds-09-hash-tables` | Hash Tables | `ds-02-arrays-and-dynamic-arrays`, `dm-08-functions-and-relations` | number |
| `ds-10-heaps-and-priority-queues` | Heaps And Priority Queues | `ds-07-trees`, `dm-09-counting-basics` | contains |
| `ds-11-graph-representations` | Graph Representations | `dm-10-graph-vocabulary`, `ds-02-arrays-and-dynamic-arrays`, `ds-09-hash-tables` | checklist |
| `ds-12-data-structure-tradeoffs` | Data Structure Tradeoffs | `ds-02-arrays-and-dynamic-arrays`, `ds-04-stacks`, `ds-05-queues`, `ds-09-hash-tables`, `ds-11-graph-representations` | llm_assisted |

### Algorithms

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `al-01-algorithmic-thinking` | Algorithmic Thinking | `pf-12-small-program-design`, `dm-05-direct-proofs` | contains |
| `al-02-asymptotic-complexity` | Asymptotic Complexity | `al-01-algorithmic-thinking`, `dm-09-counting-basics` | exact, number |
| `al-03-linear-and-binary-search` | Linear And Binary Search | `al-02-asymptotic-complexity`, `pf-08-arrays-and-lists` | number |
| `al-04-sorting-basics` | Sorting Basics | `al-02-asymptotic-complexity`, `pf-08-arrays-and-lists` | contains |
| `al-05-divide-and-conquer` | Divide And Conquer | `al-03-linear-and-binary-search`, `al-04-sorting-basics` | checklist |
| `al-06-recursion-and-recurrences` | Recursion And Recurrences | `ds-06-recursion-for-structures`, `al-05-divide-and-conquer` | number |
| `al-07-greedy-intuition` | Greedy Intuition | `al-02-asymptotic-complexity`, `dm-05-direct-proofs` | llm_assisted |
| `al-08-dynamic-programming-intuition` | Dynamic Programming Intuition | `al-06-recursion-and-recurrences`, `al-07-greedy-intuition` | manual_strict |
| `al-09-graph-traversal` | Graph Traversal | `ds-11-graph-representations`, `ds-04-stacks`, `ds-05-queues` | checklist |
| `al-10-shortest-path-intuition` | Shortest Path Intuition | `al-09-graph-traversal`, `ds-10-heaps-and-priority-queues` | contains |

### Debugging And Testing Side Branch

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `dt-01-reading-error-messages` | Reading Error Messages | `pf-01-programming-environment` | contains |
| `dt-02-tracing-state-by-hand` | Tracing State By Hand | `pf-03-expressions-and-operators`, `pf-04-branching-with-conditionals` | checklist |
| `dt-03-edge-cases` | Edge Cases | `pf-05-loops-and-iteration`, `pf-08-arrays-and-lists` | checklist |
| `dt-04-basic-unit-tests` | Basic Unit Tests | `pf-06-functions-and-parameters` | manual_strict |
| `dt-05-debugging-a-small-program` | Debugging A Small Program | `pf-11-debugging-basics`, `dt-02-tracing-state-by-hand`, `dt-03-edge-cases` | manual_strict |

### Math Notation Support Side Branch

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `ms-01-reading-symbols` | Reading Mathematical Symbols | `dm-01-sets-and-membership` | exact |
| `ms-02-translating-statements` | Translating Statements | `dm-02-propositions-and-logic`, `dm-04-quantifiers` | contains |
| `ms-03-proof-skeletons` | Proof Skeletons | `dm-05-direct-proofs` | checklist |
| `ms-04-recurrence-notation` | Recurrence Notation | `dm-07-induction`, `al-02-asymptotic-complexity` | number |

### Memory Model Intro Side Branch

| ID | Node | Prerequisites | Possible check types |
| --- | --- | --- | --- |
| `mm-01-values-vs-references` | Values Vs References | `pf-08-arrays-and-lists`, `pf-09-dictionaries-and-records` | exact |
| `mm-02-call-stack` | Call Stack | `pf-06-functions-and-parameters`, `pf-07-scope-and-lifetime` | contains |
| `mm-03-references-and-aliasing` | References And Aliasing | `mm-01-values-vs-references` | checklist |
| `mm-04-mutation-costs` | Mutation Costs | `mm-03-references-and-aliasing`, `ds-02-arrays-and-dynamic-arrays` | number |
| `mm-05-memory-model-for-recursion` | Memory Model For Recursion | `mm-02-call-stack`, `ds-06-recursion-for-structures` | llm_assisted |

## Prerequisite Rules

Use prerequisites to unlock learning paths, not to model every possible academic dependency.

- Programming nodes should unlock early and avoid blocking the first Daily Run.
- Discrete math should start after basic variables and conditionals, not after the full programming branch.
- Data structures should require functions, arrays/lists, and selected discrete math concepts.
- Algorithms should require enough data structures to make examples concrete.
- Side branches should unlock when they can help with weak spots, not only after their main topic is complete.
- Cross-branch prerequisites should be sparse and intentional so the map remains readable.

Recommended early unlock front:

- `pf-01-programming-environment`
- `pf-02-values-variables-types` after `pf-01`
- `dt-01-reading-error-messages` after `pf-01`

Recommended first week Daily Run pool once only `pf-01` is complete:

- `pf-02-values-variables-types`
- `dt-01-reading-error-messages`

Recommended first week Daily Run pool after `pf-02-values-variables-types` is complete:

- `pf-03-expressions-and-operators`

Recommended first week Daily Run pool after `pf-04-branching-with-conditionals` is complete:

- `dt-02-tracing-state-by-hand`

## Side Branch Strategy

Side branches should support product mechanics:

- Use `debugging-and-testing` to generate recovery tasks after failed programming checks.
- Use `math-notation-and-proof-support` to recover from failed discrete math checks without forcing route rollback.
- Use `memory-model-intro` to explain confusing behavior in linked lists, recursion, aliasing, and mutation.
- Allow side branch nodes to appear in Daily Run as optional or recovery tasks.
- Do not make side branch nodes hard prerequisites for main route completion in the first seed.

Suggested support links, not hard gates:

- `pf-12-small-program-design` requires `pf-11-debugging-basics`, but not the full testing branch.
- Failed attempts on `ds-03-linked-lists` should recommend `mm-03-references-and-aliasing`.
- Failed attempts on `ds-06-recursion-for-structures` should recommend `mm-02-call-stack`.
- Failed attempts on `al-06-recursion-and-recurrences` should recommend `ms-04-recurrence-notation`.

## Assessment Coverage Plan

The first seed should include at least one assessment of every supported type. Checks should be short and concrete. They should test learner behavior and give Daily Run enough outcomes to update mastery or create weak spots.

| Assessment type | First-slice coverage | Example node | Example prompt intent | Weak spot target |
| --- | --- | --- | --- | --- |
| exact | Required | `pf-02-values-variables-types` | Name the value assigned after a short statement sequence | variables/types |
| number | Required | `dm-03-truth-tables` | Count rows where a Boolean expression is true | logic/truth-tables |
| contains | Required | `pf-06-functions-and-parameters` | Explain why parameters avoid repeated code; answer should mention reuse and inputs | functions |
| checklist | Required | `pf-01-programming-environment` | Confirm environment setup, run command, and save a first file | setup |
| manual_strict | Required | `pf-12-small-program-design` | Build a small CLI-style program with input, branching, loops, and functions | integrated-programming |
| llm_assisted | Required | `ds-12-data-structure-tradeoffs` | Compare arrays, hash tables, and graphs for a scenario | conceptual-explanation |

### Suggested Check Distribution

| Branch | exact | number | contains | checklist | manual_strict | llm_assisted |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Programming Fundamentals | 2 | 2 | 3 | 3 | 1 | 0 |
| Discrete Math | 3 | 2 | 1 | 3 | 0 | 0 |
| Data Structures | 2 | 2 | 3 | 2 | 0 | 2 |
| Algorithms | 1 | 3 | 2 | 2 | 1 | 1 |
| Side Branches | 2 | 2 | 3 | 5 | 3 | 1 |

This is a candidate check pool, not a requirement to seed every possible check. The first implementation should choose 18-24 active assessment-bearing nodes from this pool and leave the rest as practice/navigation-only nodes. It intentionally over-represents simple deterministic checks early so Daily Run can have reliable pass/fail outcomes. `manual_strict` and `llm_assisted` checks should appear later or as stage gates.

## Mastery And Route Outcomes

Suggested mastery outcomes for the first slice:

- Programming Fundamentals: learner can implement small programs and debug simple failures.
- Discrete Math: learner can read formal statements and use basic proof patterns.
- Data Structures: learner can pick data structures based on operations and constraints.
- Algorithms: learner can reason about correctness, complexity, and common strategies.

Suggested branch stat labels:

- Programming
- Math Reasoning
- Structures
- Algorithms
- Debugging
- Systems Intuition

Map/Wind Rose can use these labels to show progress without exposing author-only curriculum metadata.

## Naming Conventions

### IDs

- Campaign template id: `template-cs-bachelor`
- Route id: `route-core-cs-foundations`
- Branch ids: lowercase kebab-case, for example `programming-fundamentals`
- Node ids: short branch prefix plus two-digit sequence and kebab-case topic
- Check ids: `check-<node-id>-<type>-<short-purpose>`

Examples:

- `pf-05-loops-and-iteration`
- `dm-03-truth-tables`
- `ds-12-data-structure-tradeoffs`
- `check-dm-03-number-true-rows`
- `check-ds-12-llm-tradeoff-explanation`

### Titles

- Node titles should be learner-facing and concise.
- Avoid course catalog labels like `CS101 Lecture 3`.
- Prefer `Loops And Iteration` over `Iteration Constructs In Imperative Languages`.
- Author notes can include academic framing, but learner mode should show practical outcomes.

## Later Campaign Expansion

After the first slice works, expand the campaign in this order:

1. Computer Systems Intro and Operating Systems Basics, using memory model nodes as bridge prerequisites.
2. Databases, using data structures and discrete relations as prerequisites.
3. Software Engineering, using programming/testing/`manual_strict` checks as bridge prerequisites.
4. Networks and Security, using systems and software engineering as bridge prerequisites.
5. AI/ML Intro, using algorithms, probability-lite, and linear algebra-lite prerequisites.
6. Capstone, requiring broad completion and at least one `manual_strict` project check.

## Known Simplifications

- The curriculum omits many general education, lab science, writing, and elective requirements because BrainGainz needs CS mechanics test coverage, not a full university catalog.
- Calculus and linear algebra are represented as later lite branches instead of first-slice requirements so the initial playable route stays focused.
- Theory is compressed into discrete math and algorithms rather than separate automata, computability, and formal languages courses.
- Systems topics are delayed even though real programs often introduce low-level behavior early; the `memory-model-intro` side branch gives just enough support for data structures.
- Programming language choice is unspecified. The campaign should use language-neutral concepts so the seed can work with the current app without a full coding runner.
- Assessments are representative, not exhaustive. The first seed should prove that each check type works in context before content volume is expanded.
- Prerequisites are pedagogical and product-oriented. They are intentionally sparser than a real dependency graph to keep map readability and Daily Run task selection healthy.

## Seed/Template Notes For Next Agent

The seed/template implementation agent should take:

- `template-cs-bachelor` as the campaign template identity.
- `route-core-cs-foundations` as the first main route.
- The 58 node IDs and branch groupings from `First Slice Nodes`.
- The route stage lists as the ordered route projection for the 44 main route nodes.
- The prerequisite rules and explicit prerequisite columns as the unlock graph.
- The assessment coverage matrix as the minimum check set.
- Side branches as optional/recovery sources, not full route blockers.

Do not seed the full four-year curriculum in the first pass unless the UI already handles a larger graph comfortably. The first useful implementation target is a readable 58-node foundation campaign that can feed Today, Map, Wind Rose, Daily Run, and weak spot recovery.
