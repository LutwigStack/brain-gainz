import { createUtcTimestamp } from '../stores/store-helpers.js';

export const CS_BACHELOR_TEMPLATE_SLUG = 'template-cs-bachelor';

const CS_BACHELOR_STATS = [
  { key: 'programming', title: 'Programming', color: '#58d6ff', icon: 'code', sort_order: 0 },
  { key: 'math-reasoning', title: 'Math Reasoning', color: '#ffd166', icon: 'sigma', sort_order: 1 },
  { key: 'structures', title: 'Structures', color: '#5ee6b5', icon: 'network', sort_order: 2 },
  { key: 'algorithms', title: 'Algorithms', color: '#fb7185', icon: 'route', sort_order: 3 },
  { key: 'databases', title: 'Databases', color: '#38bdf8', icon: 'database', sort_order: 4 },
  { key: 'debugging', title: 'Debugging', color: '#c084fc', icon: 'bug', sort_order: 5 },
  { key: 'systems-intuition', title: 'Systems Intuition', color: '#f97316', icon: 'cpu', sort_order: 6 },
];

const BRANCHES = [
  {
    id: 'programming-fundamentals',
    title: 'Programming Fundamentals',
    statKey: 'programming',
    summary: 'Syntax, control flow, functions, data representation, debugging, and small programs.',
  },
  {
    id: 'discrete-math',
    title: 'Discrete Math',
    statKey: 'math-reasoning',
    summary: 'Logic, sets, proofs, induction, relations, counting, and graph vocabulary.',
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    statKey: 'structures',
    summary: 'Core abstract data types, representations, operation costs, and tradeoffs.',
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    statKey: 'algorithms',
    summary: 'Complexity, searching, sorting, recursion, greedy intuition, dynamic programming, and graphs.',
  },
  {
    id: 'databases',
    title: 'Databases',
    statKey: 'databases',
    summary: 'Data modeling, relational tables, SQL queries, joins, constraints, indexes, transactions, and small database design.',
  },
  {
    id: 'debugging-and-testing',
    title: 'Debugging And Testing',
    statKey: 'debugging',
    summary: 'Reproduction, tracing, assertions, unit tests, and edge-case recovery.',
  },
  {
    id: 'math-notation-and-proof-support',
    title: 'Math Notation Support',
    statKey: 'math-reasoning',
    summary: 'Notation fluency, translating statements, proof skeletons, and recurrences.',
  },
  {
    id: 'memory-model-intro',
    title: 'Memory Model Intro',
    statKey: 'systems-intuition',
    summary: 'Values, references, stack, heap intuition, aliasing, and mutation costs.',
  },
];

const assessment = (type, extra = {}) => ({
  check_method: 'strict',
  strict_check_type: type,
  prompt: extra.prompt ?? 'Complete the check for this node.',
  expected_summary: extra.expected_summary ?? null,
  ...extra,
});

const llmAssessment = (extra = {}) => ({
  check_method: 'llm_assisted',
  prompt: extra.prompt ?? 'Explain the concept and justify your answer.',
  rubric: extra.rubric ?? extra.expected_summary ?? 'Answer should be specific, correct, and tied to the scenario.',
  expected_summary: extra.expected_summary ?? extra.rubric ?? null,
  ...extra,
});

const NODE_CHECKS = {
  'pf-01-programming-environment': assessment('checklist', {
    prompt: 'Confirm you can open the editor, run a program, and save the first file.',
    items: [
      { id: 'editor', label: 'Editor opens', required: true },
      { id: 'run', label: 'Program runs', required: true },
      { id: 'save', label: 'File is saved', required: true },
    ],
  }),
  'pf-02-values-variables-types': assessment('exact', {
    prompt: 'After x = 3 and x = x + 2, what value is stored in x?',
    expected_answer: '5',
  }),
  'pf-03-expressions-and-operators': assessment('number', {
    prompt: 'What is 2 + 3 * 4?',
    expected_number: 14,
    tolerance: 0,
  }),
  'pf-04-branching-with-conditionals': assessment('contains', {
    prompt: 'Explain when an if/else branch runs.',
    required_terms: ['condition', 'true'],
  }),
  'pf-06-functions-and-parameters': assessment('contains', {
    prompt: 'Explain why parameters avoid repeated code.',
    required_terms: ['input', 'reuse'],
  }),
  'pf-08-arrays-and-lists': assessment('checklist', {
    prompt: 'Work with a list by indexing, appending, and iterating.',
    items: [
      { id: 'index', label: 'Read by index', required: true },
      { id: 'append', label: 'Append a value', required: true },
      { id: 'iterate', label: 'Iterate over all values', required: true },
    ],
  }),
  'pf-12-small-program-design': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Build a small CLI-style program with input, branching, loops, and functions.',
    expected_summary: 'Reviewer confirms the program meets the checklist.',
  },
  'dm-01-sets-and-membership': assessment('exact', {
    prompt: 'What symbol is commonly read as "is an element of"?',
    expected_answer: 'in',
  }),
  'dm-03-truth-tables': assessment('number', {
    prompt: 'How many rows are in a truth table for three propositions?',
    expected_number: 8,
    tolerance: 0,
  }),
  'dm-05-direct-proofs': assessment('checklist', {
    prompt: 'Draft a direct proof from assumptions to conclusion.',
    items: [
      { id: 'assumptions', label: 'State assumptions', required: true },
      { id: 'steps', label: 'Write justified steps', required: true },
      { id: 'conclusion', label: 'State conclusion', required: true },
    ],
  }),
  'dm-10-graph-vocabulary': assessment('exact', {
    prompt: 'What is the usual name for a connection between two vertices?',
    expected_answer: 'edge',
  }),
  'ds-01-abstract-data-types': assessment('contains', {
    prompt: 'Explain an abstract data type without tying it to one implementation.',
    required_terms: ['operations', 'behavior'],
  }),
  'ds-02-arrays-and-dynamic-arrays': assessment('number', {
    prompt: 'What is the typical indexed access time for an array, as Big-O exponent-free number of nested loops?',
    expected_number: 1,
    tolerance: 0,
  }),
  'ds-04-stacks': assessment('exact', {
    prompt: 'Which removal policy does a stack use?',
    expected_answer: 'LIFO',
  }),
  'ds-07-trees': assessment('contains', {
    prompt: 'Explain why trees are useful for hierarchical data.',
    required_terms: ['parent', 'child'],
  }),
  'ds-08-binary-search-trees': llmAssessment({
    prompt: 'Explain why a balanced binary search tree can keep search efficient.',
    rubric: 'Answer should mention ordering, left and right subtrees, balance, and logarithmic search intuition.',
  }),
  'ds-09-hash-tables': assessment('number', {
    prompt: 'What is the usual average-case lookup cost exponent-free Big-O level for a hash table?',
    expected_number: 1,
    tolerance: 0,
  }),
  'ds-10-heaps-and-priority-queues': assessment('contains', {
    prompt: 'Explain why a heap is a good fit for repeatedly taking the next priority item.',
    required_terms: ['priority', 'min'],
  }),
  'ds-11-graph-representations': assessment('checklist', {
    prompt: 'Compare adjacency lists and adjacency matrices.',
    items: [
      { id: 'space', label: 'Compare space cost', required: true },
      { id: 'neighbors', label: 'Compare neighbor iteration', required: true },
    ],
  }),
  'ds-12-data-structure-tradeoffs': llmAssessment({
    prompt: 'Compare arrays, hash tables, and graphs for a concrete scenario.',
    rubric: 'Answer should justify choices by operations, constraints, and representation tradeoffs.',
    expected_summary: 'Answer should justify choices by operations and constraints.',
  }),
  'al-01-algorithmic-thinking': assessment('contains', {
    prompt: 'Explain how an algorithm differs from a program in one language.',
    required_terms: ['steps', 'input'],
  }),
  'al-02-asymptotic-complexity': assessment('number', {
    prompt: 'If one loop scans n items once, what is the exponent-free Big-O level?',
    expected_number: 1,
    tolerance: 0,
  }),
  'al-03-linear-and-binary-search': assessment('number', {
    prompt: 'How many times can binary search halve 16 sorted items before one remains?',
    expected_number: 4,
    tolerance: 0,
  }),
  'al-04-sorting-basics': assessment('contains', {
    prompt: 'Explain what sorting changes and what it preserves.',
    required_terms: ['order', 'same items'],
  }),
  'al-05-divide-and-conquer': assessment('checklist', {
    prompt: 'Trace a divide-and-conquer algorithm.',
    items: [
      { id: 'split', label: 'Split the problem', required: true },
      { id: 'solve', label: 'Solve subproblems', required: true },
      { id: 'combine', label: 'Combine results', required: true },
    ],
  }),
  'al-07-greedy-intuition': llmAssessment({
    prompt: 'Explain when a locally best choice might be enough for a global solution.',
    rubric: 'Answer should describe local choice, constraints, and why greedy choices need a correctness argument.',
  }),
  'al-08-dynamic-programming-intuition': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Solve a small overlapping-subproblem exercise with a table or memoized recursion.',
    expected_summary: 'Reviewer confirms the solution identifies state, recurrence, and base cases.',
  },
  'al-09-graph-traversal': assessment('checklist', {
    prompt: 'Trace a breadth-first traversal.',
    items: [
      { id: 'queue', label: 'Use a queue', required: true },
      { id: 'visited', label: 'Track visited vertices', required: true },
    ],
  }),
  'al-10-shortest-path-intuition': assessment('contains', {
    prompt: 'Explain when edge weights matter for shortest paths.',
    required_terms: ['weight', 'path'],
  }),
  'db-01-data-modeling-purpose': assessment('checklist', {
    prompt: 'Model a tiny library or habit tracker domain before creating tables.',
    items: [
      { id: 'entities', label: 'List core entities', required: true },
      { id: 'attributes', label: 'List important attributes', required: true },
      { id: 'relationships', label: 'Name at least one relationship', required: true },
    ],
  }),
  'db-02-entities-attributes-relationships': assessment('contains', {
    prompt: 'Explain the difference between entities, attributes, and relationships.',
    required_terms: ['entity', 'attribute', 'relationship'],
  }),
  'db-03-primary-keys': assessment('exact', {
    prompt: 'What kind of key uniquely identifies one row in a table?',
    expected_answer: 'primary key',
  }),
  'db-04-tables-and-rows': assessment('number', {
    prompt: 'A table has 4 rows and one row is deleted. How many rows remain?',
    expected_number: 3,
    tolerance: 0,
  }),
  'db-05-basic-select': assessment('contains', {
    prompt: 'Explain what SELECT and WHERE do in a simple query.',
    required_terms: ['select', 'where'],
  }),
  'db-06-filter-sort-project': assessment('checklist', {
    prompt: 'Write a query plan that picks columns, filters rows, and orders results.',
    items: [
      { id: 'project', label: 'Choose columns to return', required: true },
      { id: 'filter', label: 'Filter rows with a condition', required: true },
      { id: 'sort', label: 'Sort the result', required: false },
    ],
  }),
  'db-07-foreign-keys': assessment('exact', {
    prompt: 'What kind of key points from one table to a row in another table?',
    expected_answer: 'foreign key',
  }),
  'db-08-inner-joins': assessment('contains', {
    prompt: 'Explain why an inner join needs matching values between tables.',
    required_terms: ['match', 'key'],
  }),
  'db-09-join-cardinality': llmAssessment({
    prompt: 'Compare one-to-many and many-to-many relationships using a concrete example.',
    rubric: 'Answer should name both relationship shapes, explain a join table for many-to-many, and avoid confusing rows with tables.',
  }),
  'db-10-normalization-basics': assessment('checklist', {
    prompt: 'Normalize a small repeated-address table into cleaner tables.',
    items: [
      { id: 'repeat', label: 'Find repeated data', required: true },
      { id: 'split', label: 'Split into related tables', required: true },
      { id: 'keys', label: 'Connect tables with keys', required: true },
    ],
  }),
  'db-11-constraints': assessment('exact', {
    prompt: 'Which SQL constraint prevents duplicate values in a column?',
    expected_answer: 'unique',
  }),
  'db-12-indexes': assessment('number', {
    prompt: 'For the course model, what exponent-free Big-O level describes the goal of indexed lookup intuition?',
    expected_number: 1,
    tolerance: 0,
  }),
  'db-13-transactions': assessment('contains', {
    prompt: 'Explain why a transfer between two accounts should use a transaction.',
    required_terms: ['atomic', 'commit'],
  }),
  'db-14-acid-properties': assessment('exact', {
    prompt: 'What four-letter acronym names atomicity, consistency, isolation, and durability?',
    expected_answer: 'ACID',
  }),
  'db-15-isolation-and-races': llmAssessment({
    prompt: 'Explain one problem that can happen when two users update the same data at the same time.',
    rubric: 'Answer should mention concurrent updates, stale reads or lost updates, and why isolation or locking matters.',
  }),
  'db-16-sql-injection': assessment('contains', {
    prompt: 'Explain why parameterized queries help prevent SQL injection.',
    required_terms: ['parameter', 'input'],
  }),
  'db-17-schema-migrations': assessment('checklist', {
    prompt: 'Plan a safe schema change for adding a new column.',
    items: [
      { id: 'backward', label: 'Keep old app behavior working', required: true },
      { id: 'backfill', label: 'Backfill or default existing rows', required: true },
      { id: 'verify', label: 'Verify the new shape', required: true },
    ],
  }),
  'db-18-crud-app-flow': assessment('checklist', {
    prompt: 'Trace a CRUD flow from UI action to database change.',
    items: [
      { id: 'create', label: 'Create or insert is covered', required: true },
      { id: 'read', label: 'Read or list is covered', required: true },
      { id: 'update-delete', label: 'Update or delete is covered', required: true },
    ],
  }),
  'db-19-query-planning': assessment('contains', {
    prompt: 'Explain why a database query planner cares about filters, joins, and indexes.',
    required_terms: ['filter', 'index'],
  }),
  'db-20-aggregates-and-grouping': assessment('number', {
    prompt: 'If GROUP BY status finds open, paused, and done groups, how many groups are there?',
    expected_number: 3,
    tolerance: 0,
  }),
  'db-21-null-and-missing-data': assessment('contains', {
    prompt: 'Explain why NULL is not the same as an empty string.',
    required_terms: ['unknown', 'empty'],
  }),
  'db-22-backups-and-restore': assessment('checklist', {
    prompt: 'Describe a minimal backup and restore check.',
    items: [
      { id: 'backup', label: 'Create a backup copy', required: true },
      { id: 'restore', label: 'Test restoring it', required: true },
    ],
  }),
  'db-23-embedded-vs-server-db': llmAssessment({
    prompt: 'Compare an embedded database and a server database for a small desktop learning app.',
    rubric: 'Answer should compare deployment, concurrency, local storage, and operational complexity.',
  }),
  'db-24-orms-and-query-builders': assessment('contains', {
    prompt: 'Explain one benefit and one risk of using an ORM or query builder.',
    required_terms: ['query', 'mapping'],
  }),
  'db-25-data-privacy-basics': assessment('checklist', {
    prompt: 'Classify data before saving it.',
    items: [
      { id: 'personal', label: 'Identify personal data', required: true },
      { id: 'retention', label: 'Decide retention or deletion needs', required: true },
      { id: 'access', label: 'Limit who can access it', required: true },
    ],
  }),
  'db-26-database-testing': assessment('checklist', {
    prompt: 'Test code that reads and writes database rows.',
    items: [
      { id: 'setup', label: 'Create a known test dataset', required: true },
      { id: 'assert', label: 'Assert rows after the operation', required: true },
      { id: 'cleanup', label: 'Keep tests isolated', required: true },
    ],
  }),
  'db-27-performance-debugging': assessment('contains', {
    prompt: 'Explain how to start investigating a slow database query.',
    required_terms: ['index', 'plan'],
  }),
  'db-28-small-database-project': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Design a tiny database-backed feature with schema, queries, and tests.',
    expected_summary: 'Reviewer confirms the project includes tables, constraints, at least three queries, and a test plan.',
  },
  'dt-02-tracing-state-by-hand': assessment('checklist', {
    prompt: 'Trace variable state through a short program.',
    items: [
      { id: 'initial', label: 'Record initial state', required: true },
      { id: 'updates', label: 'Record each update', required: true },
    ],
  }),
  'dt-03-edge-cases': assessment('checklist', {
    prompt: 'List edge cases for a function that processes a list of numbers.',
    items: [
      { id: 'empty', label: 'Empty list considered', required: true },
      { id: 'single', label: 'Single item considered', required: true },
      { id: 'duplicates', label: 'Duplicates or repeated values considered', required: true },
    ],
  }),
  'dt-04-basic-unit-tests': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Write basic unit tests for normal, boundary, and invalid input behavior.',
    expected_summary: 'Reviewer confirms tests cover happy path and at least two edge cases.',
  },
  'ms-01-reading-symbols': assessment('exact', {
    prompt: 'What does the symbol forall usually mean?',
    expected_answer: 'for all',
  }),
  'ms-03-proof-skeletons': assessment('checklist', {
    prompt: 'Create a proof skeleton before filling in details.',
    items: [
      { id: 'given', label: 'State what is given', required: true },
      { id: 'goal', label: 'State what must be proved', required: true },
      { id: 'strategy', label: 'Pick a proof strategy', required: true },
    ],
  }),
  'ms-04-recurrence-notation': assessment('number', {
    prompt: 'For T(n) = 2T(n/2) + n, how many subproblems appear at each split?',
    expected_number: 2,
    tolerance: 0,
  }),
  'mm-01-values-vs-references': assessment('exact', {
    prompt: 'Name the concept used when two names point at the same mutable object.',
    expected_answer: 'aliasing',
  }),
  'mm-02-call-stack': assessment('contains', {
    prompt: 'Explain what a call stack frame keeps track of.',
    required_terms: ['function', 'local'],
  }),
  'mm-03-references-and-aliasing': assessment('checklist', {
    prompt: 'Trace two references that point to the same list.',
    items: [
      { id: 'names', label: 'Name both references', required: true },
      { id: 'mutation', label: 'Show one mutation through both names', required: true },
    ],
  }),
  'mm-04-mutation-costs': assessment('number', {
    prompt: 'If inserting at the front of an array shifts n items, what is the exponent-free Big-O level?',
    expected_number: 1,
    tolerance: 0,
  }),
  'mm-05-memory-model-for-recursion': llmAssessment({
    prompt: 'Explain why each recursive call needs its own stack frame.',
    rubric: 'Answer should mention separate parameters/local variables, base case progress, and returning values.',
  }),
};

const NODE_OUTCOMES = {
  'pf-01-programming-environment': 'Set up an editor/run loop so tiny programs can be written, executed, and saved.',
  'pf-02-values-variables-types': 'Track values through variable assignments and distinguish simple data types.',
  'pf-03-expressions-and-operators': 'Evaluate expressions using operator precedence and basic type behavior.',
  'pf-04-branching-with-conditionals': 'Use conditions to choose between branches and explain which path runs.',
  'pf-05-loops-and-iteration': 'Repeat work with loops while keeping loop state and termination clear.',
  'pf-06-functions-and-parameters': 'Package repeated logic into functions with inputs, outputs, and names.',
  'pf-07-scope-and-lifetime': 'Predict which variables are visible in a block or function call.',
  'pf-08-arrays-and-lists': 'Store ordered collections and use indexing, appending, and iteration.',
  'pf-09-dictionaries-and-records': 'Represent keyed data and compare lookup-by-key with lookup-by-position.',
  'pf-10-input-output-and-parsing': 'Turn user or file input into values a program can validate and process.',
  'pf-11-debugging-basics': 'Reproduce a bug, inspect state, and narrow the failing step.',
  'pf-12-small-program-design': 'Combine input, branches, loops, functions, and collections into a small complete program.',
  'dm-01-sets-and-membership': 'Use sets, membership, subsets, and simple set operations in CS examples.',
  'dm-02-propositions-and-logic': 'Translate conditions into propositions and reason about true/false statements.',
  'dm-03-truth-tables': 'Build truth tables for compound Boolean expressions.',
  'dm-04-quantifiers': 'Read and write statements with for-all and exists quantifiers.',
  'dm-05-direct-proofs': 'Write a direct proof from assumptions to a stated conclusion.',
  'dm-06-contrapositive-and-contradiction': 'Choose contrapositive or contradiction when direct proof is awkward.',
  'dm-07-induction': 'Use a base case and inductive step to prove statements about repeated structure.',
  'dm-08-functions-and-relations': 'Model mappings and relations with domain, codomain, and ordered pairs.',
  'dm-09-counting-basics': 'Count simple choices, products, and combinations used in algorithm analysis.',
  'dm-10-graph-vocabulary': 'Use vertex, edge, path, degree, directed, and weighted graph vocabulary.',
  'ds-01-abstract-data-types': 'Describe a data structure by operations before choosing an implementation.',
  'ds-02-arrays-and-dynamic-arrays': 'Explain indexed access, resizing, and insertion costs for dynamic arrays.',
  'ds-03-linked-lists': 'Trace node links and compare linked lists with arrays for insertion and traversal.',
  'ds-04-stacks': 'Apply last-in-first-out behavior to calls, undo, and traversal tasks.',
  'ds-05-queues': 'Apply first-in-first-out behavior to scheduling and breadth-first processing.',
  'ds-06-recursion-for-structures': 'Use recursive thinking on lists and trees with clear base cases.',
  'ds-07-trees': 'Model hierarchical data with roots, parents, children, leaves, and height.',
  'ds-08-binary-search-trees': 'Use ordered tree structure to support search, insert, and traversal.',
  'ds-09-hash-tables': 'Explain hash-based lookup, collisions, and average-case constant time.',
  'ds-10-heaps-and-priority-queues': 'Use heap order to repeatedly retrieve the next priority item.',
  'ds-11-graph-representations': 'Choose adjacency lists or matrices based on density and operations.',
  'ds-12-data-structure-tradeoffs': 'Pick a structure by workload, constraints, and operation costs.',
  'al-01-algorithmic-thinking': 'State inputs, outputs, steps, and correctness intent before coding.',
  'al-02-asymptotic-complexity': 'Estimate growth rates with Big-O and compare constant, linear, and quadratic work.',
  'al-03-linear-and-binary-search': 'Choose linear or binary search based on ordering and expected cost.',
  'al-04-sorting-basics': 'Explain what sorted order enables and recognize basic sorting costs.',
  'al-05-divide-and-conquer': 'Split a problem, solve subproblems, and combine results.',
  'al-06-recursion-and-recurrences': 'Connect recursive code to recurrence-style cost reasoning.',
  'al-07-greedy-intuition': 'Recognize greedy choices and the need for a correctness argument.',
  'al-08-dynamic-programming-intuition': 'Identify overlapping subproblems and reusable state.',
  'al-09-graph-traversal': 'Trace breadth-first and depth-first exploration with visited state.',
  'al-10-shortest-path-intuition': 'Explain shortest path goals and why edge weights change the algorithm choice.',
  'db-01-data-modeling-purpose': 'Start database work from user goals, entities, attributes, and relationships.',
  'db-02-entities-attributes-relationships': 'Separate entities, attributes, and relationships before creating tables.',
  'db-03-primary-keys': 'Use primary keys to identify rows reliably.',
  'db-04-tables-and-rows': 'Read tables as rows and columns with predictable row-level operations.',
  'db-05-basic-select': 'Use SELECT, FROM, and WHERE to retrieve focused data.',
  'db-06-filter-sort-project': 'Project columns, filter rows, and sort query results.',
  'db-07-foreign-keys': 'Connect tables with foreign keys and understand referential integrity.',
  'db-08-inner-joins': 'Use inner joins to combine rows that match across related tables.',
  'db-09-join-cardinality': 'Reason about one-to-one, one-to-many, and many-to-many relationships.',
  'db-10-normalization-basics': 'Reduce duplicated data by splitting repeated concepts into related tables.',
  'db-11-constraints': 'Use constraints to keep invalid data out of the database.',
  'db-12-indexes': 'Explain how indexes speed up lookup-heavy access patterns.',
  'db-13-transactions': 'Group related writes into a transaction so partial updates do not leak.',
  'db-14-acid-properties': 'Use ACID vocabulary to explain reliable database updates.',
  'db-15-isolation-and-races': 'Recognize concurrent update risks and why isolation matters.',
  'db-16-sql-injection': 'Treat user input as data and use parameterized queries.',
  'db-17-schema-migrations': 'Plan schema changes that preserve existing data and app behavior.',
  'db-18-crud-app-flow': 'Trace create, read, update, and delete behavior through an app feature.',
  'db-19-query-planning': 'Use filters, joins, and indexes to reason about query plans.',
  'db-20-aggregates-and-grouping': 'Summarize rows with aggregate functions and grouping.',
  'db-21-null-and-missing-data': 'Handle missing, unknown, and optional data without confusing it with empty values.',
  'db-22-backups-and-restore': 'Verify that important data can be backed up and restored.',
  'db-23-embedded-vs-server-db': 'Choose between embedded and server databases for a small product context.',
  'db-24-orms-and-query-builders': 'Understand what ORMs and query builders hide and what they can make risky.',
  'db-25-data-privacy-basics': 'Classify stored data and make basic privacy decisions before persisting it.',
  'db-26-database-testing': 'Test database code with known fixtures, assertions, and isolation.',
  'db-27-performance-debugging': 'Investigate slow queries with indexes, plans, and workload context.',
  'db-28-small-database-project': 'Build a small database-backed feature from schema through tests.',
  'dt-01-reading-error-messages': 'Use error messages as clues instead of treating them as noise.',
  'dt-02-tracing-state-by-hand': 'Manually trace variable values through branches and loops.',
  'dt-03-edge-cases': 'Find empty, boundary, duplicate, and invalid-input cases before testing.',
  'dt-04-basic-unit-tests': 'Write tests that protect expected behavior and edge behavior.',
  'dt-05-debugging-a-small-program': 'Diagnose and fix a small broken program with a repeatable process.',
  'ms-01-reading-symbols': 'Read common mathematical symbols used in set, logic, and proof statements.',
  'ms-02-translating-statements': 'Translate between plain English and compact mathematical notation.',
  'ms-03-proof-skeletons': 'Outline a proof before filling in algebraic or logical details.',
  'ms-04-recurrence-notation': 'Read simple recurrence notation used for recursive algorithms.',
  'mm-01-values-vs-references': 'Predict when a value is copied and when a reference points to shared data.',
  'mm-02-call-stack': 'Use stack-frame intuition to reason about function calls and returns.',
  'mm-03-references-and-aliasing': 'Recognize aliasing and explain surprising mutation through shared references.',
  'mm-04-mutation-costs': 'Connect mutation and shifting behavior to operation costs.',
  'mm-05-memory-model-for-recursion': 'Explain recursive calls using stack frames and separate local state.',
};

const NODE_POSITIONS = {
  'debugging-and-testing': { x: -1040, y: -260, dx: 220 },
  'programming-fundamentals': { x: -1200, y: 0, dx: 220 },
  'discrete-math': { x: -980, y: 300, dx: 220 },
  'math-notation-and-proof-support': { x: -760, y: 560, dx: 220 },
  'data-structures': { x: -760, y: 860, dx: 220 },
  'memory-model-intro': { x: -540, y: 1120, dx: 220 },
  algorithms: { x: -540, y: 1420, dx: 220 },
  databases: { x: -1200, y: 1720, dx: 180 },
};

const SUPPORT_EDGES = [
  ['mm-03-references-and-aliasing', 'ds-03-linked-lists'],
  ['mm-02-call-stack', 'ds-06-recursion-for-structures'],
  ['ms-04-recurrence-notation', 'al-06-recursion-and-recurrences'],
  ['dt-04-basic-unit-tests', 'pf-12-small-program-design'],
  ['ms-03-proof-skeletons', 'dm-05-direct-proofs'],
  ['ds-09-hash-tables', 'db-12-indexes'],
  ['al-02-asymptotic-complexity', 'db-19-query-planning'],
  ['dt-04-basic-unit-tests', 'db-26-database-testing'],
];

const nodeSummary = (node) => NODE_OUTCOMES[node.id] ?? `Practice ${node.title} in the CS bachelor foundation path.`;
const nodeCompletionCriteria = (node) =>
  node.check
    ? 'Complete the concept practice and pass the assessment check for this node.'
    : 'Complete the concept practice and connect it to at least one prerequisite or follow-up example.';
const nodeActionTitle = (node) => {
  if (node.check?.strict_check_type === 'manual_strict') {
    return `Build evidence for ${node.title}`;
  }
  if (node.check?.check_method === 'llm_assisted') {
    return `Explain ${node.title}`;
  }
  return `Practice ${node.title}`;
};
const nodeActionDetails = (node) =>
  node.check
    ? `Work the short learner task, then use the seeded ${node.check.check_method === 'llm_assisted' ? 'LLM-assisted' : node.check.strict_check_type} check.`
    : `Create a small example or note that shows you can use ${node.title} in the foundation route.`;
const nodePosition = (node, branchIndex) => {
  const config = NODE_POSITIONS[node.branchId] ?? { x: 0, y: 0, dx: 180 };
  return {
    x: config.x + branchIndex * config.dx,
    y: config.y,
  };
};

const NODES = [
  ['programming-fundamentals', 'pf-01-programming-environment', 'Programming Environment', []],
  ['programming-fundamentals', 'pf-02-values-variables-types', 'Values, Variables, And Types', ['pf-01-programming-environment']],
  ['programming-fundamentals', 'pf-03-expressions-and-operators', 'Expressions And Operators', ['pf-02-values-variables-types']],
  ['programming-fundamentals', 'pf-04-branching-with-conditionals', 'Branching With Conditionals', ['pf-03-expressions-and-operators']],
  ['programming-fundamentals', 'pf-05-loops-and-iteration', 'Loops And Iteration', ['pf-04-branching-with-conditionals']],
  ['programming-fundamentals', 'pf-06-functions-and-parameters', 'Functions And Parameters', ['pf-05-loops-and-iteration']],
  ['programming-fundamentals', 'pf-07-scope-and-lifetime', 'Scope And Lifetime', ['pf-06-functions-and-parameters']],
  ['programming-fundamentals', 'pf-08-arrays-and-lists', 'Arrays And Lists', ['pf-05-loops-and-iteration']],
  ['programming-fundamentals', 'pf-09-dictionaries-and-records', 'Dictionaries And Records', ['pf-08-arrays-and-lists']],
  ['programming-fundamentals', 'pf-10-input-output-and-parsing', 'Input, Output, And Parsing', ['pf-04-branching-with-conditionals']],
  ['programming-fundamentals', 'pf-11-debugging-basics', 'Debugging Basics', ['pf-04-branching-with-conditionals']],
  ['programming-fundamentals', 'pf-12-small-program-design', 'Small Program Design', ['pf-06-functions-and-parameters', 'pf-08-arrays-and-lists', 'pf-10-input-output-and-parsing', 'pf-11-debugging-basics']],
  ['discrete-math', 'dm-01-sets-and-membership', 'Sets And Membership', ['pf-02-values-variables-types']],
  ['discrete-math', 'dm-02-propositions-and-logic', 'Propositions And Logic', ['pf-04-branching-with-conditionals']],
  ['discrete-math', 'dm-03-truth-tables', 'Truth Tables', ['dm-02-propositions-and-logic']],
  ['discrete-math', 'dm-04-quantifiers', 'Quantifiers', ['dm-01-sets-and-membership', 'dm-02-propositions-and-logic']],
  ['discrete-math', 'dm-05-direct-proofs', 'Direct Proofs', ['dm-04-quantifiers']],
  ['discrete-math', 'dm-06-contrapositive-and-contradiction', 'Contrapositive And Contradiction', ['dm-05-direct-proofs']],
  ['discrete-math', 'dm-07-induction', 'Induction', ['dm-05-direct-proofs', 'pf-05-loops-and-iteration']],
  ['discrete-math', 'dm-08-functions-and-relations', 'Functions And Relations', ['dm-01-sets-and-membership', 'dm-04-quantifiers']],
  ['discrete-math', 'dm-09-counting-basics', 'Counting Basics', ['dm-01-sets-and-membership']],
  ['discrete-math', 'dm-10-graph-vocabulary', 'Graph Vocabulary', ['dm-01-sets-and-membership', 'dm-08-functions-and-relations']],
  ['data-structures', 'ds-01-abstract-data-types', 'Abstract Data Types', ['pf-06-functions-and-parameters', 'dm-01-sets-and-membership']],
  ['data-structures', 'ds-02-arrays-and-dynamic-arrays', 'Arrays And Dynamic Arrays', ['pf-08-arrays-and-lists', 'ds-01-abstract-data-types']],
  ['data-structures', 'ds-03-linked-lists', 'Linked Lists', ['ds-01-abstract-data-types']],
  ['data-structures', 'ds-04-stacks', 'Stacks', ['ds-01-abstract-data-types', 'pf-06-functions-and-parameters']],
  ['data-structures', 'ds-05-queues', 'Queues', ['ds-01-abstract-data-types', 'ds-04-stacks']],
  ['data-structures', 'ds-06-recursion-for-structures', 'Recursion For Structures', ['pf-06-functions-and-parameters', 'dm-07-induction']],
  ['data-structures', 'ds-07-trees', 'Trees', ['ds-06-recursion-for-structures', 'dm-10-graph-vocabulary']],
  ['data-structures', 'ds-08-binary-search-trees', 'Binary Search Trees', ['ds-07-trees', 'dm-08-functions-and-relations']],
  ['data-structures', 'ds-09-hash-tables', 'Hash Tables', ['ds-02-arrays-and-dynamic-arrays', 'dm-08-functions-and-relations']],
  ['data-structures', 'ds-10-heaps-and-priority-queues', 'Heaps And Priority Queues', ['ds-07-trees', 'dm-09-counting-basics']],
  ['data-structures', 'ds-11-graph-representations', 'Graph Representations', ['dm-10-graph-vocabulary', 'ds-02-arrays-and-dynamic-arrays', 'ds-09-hash-tables']],
  ['data-structures', 'ds-12-data-structure-tradeoffs', 'Data Structure Tradeoffs', ['ds-02-arrays-and-dynamic-arrays', 'ds-04-stacks', 'ds-05-queues', 'ds-09-hash-tables', 'ds-11-graph-representations']],
  ['algorithms', 'al-01-algorithmic-thinking', 'Algorithmic Thinking', ['pf-12-small-program-design', 'dm-05-direct-proofs']],
  ['algorithms', 'al-02-asymptotic-complexity', 'Asymptotic Complexity', ['al-01-algorithmic-thinking', 'dm-09-counting-basics']],
  ['algorithms', 'al-03-linear-and-binary-search', 'Linear And Binary Search', ['al-02-asymptotic-complexity', 'pf-08-arrays-and-lists']],
  ['algorithms', 'al-04-sorting-basics', 'Sorting Basics', ['al-02-asymptotic-complexity', 'pf-08-arrays-and-lists']],
  ['algorithms', 'al-05-divide-and-conquer', 'Divide And Conquer', ['al-03-linear-and-binary-search', 'al-04-sorting-basics']],
  ['algorithms', 'al-06-recursion-and-recurrences', 'Recursion And Recurrences', ['ds-06-recursion-for-structures', 'al-05-divide-and-conquer']],
  ['algorithms', 'al-07-greedy-intuition', 'Greedy Intuition', ['al-02-asymptotic-complexity', 'dm-05-direct-proofs']],
  ['algorithms', 'al-08-dynamic-programming-intuition', 'Dynamic Programming Intuition', ['al-06-recursion-and-recurrences', 'al-07-greedy-intuition']],
  ['algorithms', 'al-09-graph-traversal', 'Graph Traversal', ['ds-11-graph-representations', 'ds-04-stacks', 'ds-05-queues']],
  ['algorithms', 'al-10-shortest-path-intuition', 'Shortest Path Intuition', ['al-09-graph-traversal', 'ds-10-heaps-and-priority-queues']],
  ['databases', 'db-01-data-modeling-purpose', 'Data Modeling Purpose', ['pf-12-small-program-design', 'ds-12-data-structure-tradeoffs']],
  ['databases', 'db-02-entities-attributes-relationships', 'Entities, Attributes, And Relationships', ['db-01-data-modeling-purpose']],
  ['databases', 'db-03-primary-keys', 'Primary Keys', ['db-02-entities-attributes-relationships']],
  ['databases', 'db-04-tables-and-rows', 'Tables And Rows', ['db-03-primary-keys']],
  ['databases', 'db-05-basic-select', 'Basic SELECT Queries', ['db-04-tables-and-rows', 'pf-04-branching-with-conditionals']],
  ['databases', 'db-06-filter-sort-project', 'Filter, Sort, And Project', ['db-05-basic-select']],
  ['databases', 'db-07-foreign-keys', 'Foreign Keys', ['db-03-primary-keys', 'db-02-entities-attributes-relationships']],
  ['databases', 'db-08-inner-joins', 'Inner Joins', ['db-05-basic-select', 'db-07-foreign-keys']],
  ['databases', 'db-09-join-cardinality', 'Join Cardinality', ['db-08-inner-joins', 'dm-08-functions-and-relations']],
  ['databases', 'db-10-normalization-basics', 'Normalization Basics', ['db-09-join-cardinality']],
  ['databases', 'db-11-constraints', 'Constraints', ['db-03-primary-keys', 'db-07-foreign-keys']],
  ['databases', 'db-12-indexes', 'Indexes', ['db-05-basic-select', 'ds-09-hash-tables', 'al-02-asymptotic-complexity']],
  ['databases', 'db-13-transactions', 'Transactions', ['db-11-constraints']],
  ['databases', 'db-14-acid-properties', 'ACID Properties', ['db-13-transactions']],
  ['databases', 'db-15-isolation-and-races', 'Isolation And Race Conditions', ['db-14-acid-properties', 'dt-02-tracing-state-by-hand']],
  ['databases', 'db-16-sql-injection', 'SQL Injection', ['db-05-basic-select', 'pf-10-input-output-and-parsing']],
  ['databases', 'db-17-schema-migrations', 'Schema Migrations', ['db-11-constraints', 'dt-04-basic-unit-tests']],
  ['databases', 'db-18-crud-app-flow', 'CRUD App Flow', ['db-05-basic-select', 'pf-12-small-program-design']],
  ['databases', 'db-19-query-planning', 'Query Planning', ['db-08-inner-joins', 'db-12-indexes']],
  ['databases', 'db-20-aggregates-and-grouping', 'Aggregates And Grouping', ['db-06-filter-sort-project']],
  ['databases', 'db-21-null-and-missing-data', 'NULL And Missing Data', ['db-11-constraints']],
  ['databases', 'db-22-backups-and-restore', 'Backups And Restore', ['db-13-transactions']],
  ['databases', 'db-23-embedded-vs-server-db', 'Embedded Vs Server Databases', ['db-18-crud-app-flow', 'mm-05-memory-model-for-recursion']],
  ['databases', 'db-24-orms-and-query-builders', 'ORMs And Query Builders', ['db-18-crud-app-flow', 'pf-06-functions-and-parameters']],
  ['databases', 'db-25-data-privacy-basics', 'Data Privacy Basics', ['db-21-null-and-missing-data']],
  ['databases', 'db-26-database-testing', 'Database Testing', ['db-17-schema-migrations', 'dt-04-basic-unit-tests']],
  ['databases', 'db-27-performance-debugging', 'Database Performance Debugging', ['db-19-query-planning', 'dt-05-debugging-a-small-program']],
  ['databases', 'db-28-small-database-project', 'Small Database Project', ['db-18-crud-app-flow', 'db-19-query-planning', 'db-26-database-testing', 'db-25-data-privacy-basics']],
  ['debugging-and-testing', 'dt-01-reading-error-messages', 'Reading Error Messages', ['pf-01-programming-environment']],
  ['debugging-and-testing', 'dt-02-tracing-state-by-hand', 'Tracing State By Hand', ['pf-03-expressions-and-operators', 'pf-04-branching-with-conditionals']],
  ['debugging-and-testing', 'dt-03-edge-cases', 'Edge Cases', ['pf-05-loops-and-iteration', 'pf-08-arrays-and-lists']],
  ['debugging-and-testing', 'dt-04-basic-unit-tests', 'Basic Unit Tests', ['pf-06-functions-and-parameters']],
  ['debugging-and-testing', 'dt-05-debugging-a-small-program', 'Debugging A Small Program', ['pf-11-debugging-basics', 'dt-02-tracing-state-by-hand', 'dt-03-edge-cases']],
  ['math-notation-and-proof-support', 'ms-01-reading-symbols', 'Reading Mathematical Symbols', ['dm-01-sets-and-membership']],
  ['math-notation-and-proof-support', 'ms-02-translating-statements', 'Translating Statements', ['dm-02-propositions-and-logic', 'dm-04-quantifiers']],
  ['math-notation-and-proof-support', 'ms-03-proof-skeletons', 'Proof Skeletons', ['dm-05-direct-proofs']],
  ['math-notation-and-proof-support', 'ms-04-recurrence-notation', 'Recurrence Notation', ['dm-07-induction', 'al-02-asymptotic-complexity']],
  ['memory-model-intro', 'mm-01-values-vs-references', 'Values Vs References', ['pf-08-arrays-and-lists', 'pf-09-dictionaries-and-records']],
  ['memory-model-intro', 'mm-02-call-stack', 'Call Stack', ['pf-06-functions-and-parameters', 'pf-07-scope-and-lifetime']],
  ['memory-model-intro', 'mm-03-references-and-aliasing', 'References And Aliasing', ['mm-01-values-vs-references']],
  ['memory-model-intro', 'mm-04-mutation-costs', 'Mutation Costs', ['mm-03-references-and-aliasing', 'ds-02-arrays-and-dynamic-arrays']],
  ['memory-model-intro', 'mm-05-memory-model-for-recursion', 'Memory Model For Recursion', ['mm-02-call-stack', 'ds-06-recursion-for-structures']],
].map(([branchId, id, title, prerequisites], index, rows) => {
  const branchIndex = rows.slice(0, index).filter(([candidateBranchId]) => candidateBranchId === branchId).length;
  const baseNode = {
    branchId,
    id,
    title,
    prerequisites,
    order: index,
    branchIndex,
    check: NODE_CHECKS[id] ?? null,
  };
  const position = nodePosition(baseNode, branchIndex);
  return {
    ...baseNode,
    ...position,
    summary: nodeSummary(baseNode),
    completionCriteria: nodeCompletionCriteria(baseNode),
    actionTitle: nodeActionTitle(baseNode),
    actionDetails: nodeActionDetails(baseNode),
  };
});

const ROUTE_STAGES = [
  ['Programming Fundamentals', ['pf-01-programming-environment', 'pf-02-values-variables-types', 'pf-03-expressions-and-operators', 'pf-04-branching-with-conditionals', 'pf-05-loops-and-iteration', 'pf-06-functions-and-parameters', 'pf-07-scope-and-lifetime', 'pf-08-arrays-and-lists', 'pf-09-dictionaries-and-records', 'pf-10-input-output-and-parsing', 'pf-11-debugging-basics', 'pf-12-small-program-design']],
  ['Discrete Math For CS', ['dm-01-sets-and-membership', 'dm-02-propositions-and-logic', 'dm-03-truth-tables', 'dm-04-quantifiers', 'dm-05-direct-proofs', 'dm-06-contrapositive-and-contradiction', 'dm-07-induction', 'dm-08-functions-and-relations', 'dm-09-counting-basics', 'dm-10-graph-vocabulary']],
  ['Data Structures', ['ds-01-abstract-data-types', 'ds-02-arrays-and-dynamic-arrays', 'ds-03-linked-lists', 'ds-04-stacks', 'ds-05-queues', 'ds-06-recursion-for-structures', 'ds-07-trees', 'ds-08-binary-search-trees', 'ds-09-hash-tables', 'ds-10-heaps-and-priority-queues', 'ds-11-graph-representations', 'ds-12-data-structure-tradeoffs']],
  ['Algorithms', ['al-01-algorithmic-thinking', 'al-02-asymptotic-complexity', 'al-03-linear-and-binary-search', 'al-04-sorting-basics', 'al-05-divide-and-conquer', 'al-06-recursion-and-recurrences', 'al-07-greedy-intuition', 'al-08-dynamic-programming-intuition', 'al-09-graph-traversal', 'al-10-shortest-path-intuition']],
  ['Database Systems', ['db-01-data-modeling-purpose', 'db-02-entities-attributes-relationships', 'db-03-primary-keys', 'db-04-tables-and-rows', 'db-05-basic-select', 'db-06-filter-sort-project', 'db-07-foreign-keys', 'db-08-inner-joins', 'db-09-join-cardinality', 'db-10-normalization-basics', 'db-11-constraints', 'db-12-indexes', 'db-13-transactions', 'db-14-acid-properties', 'db-15-isolation-and-races', 'db-16-sql-injection', 'db-17-schema-migrations', 'db-18-crud-app-flow', 'db-19-query-planning', 'db-20-aggregates-and-grouping', 'db-21-null-and-missing-data', 'db-22-backups-and-restore', 'db-23-embedded-vs-server-db', 'db-24-orms-and-query-builders', 'db-25-data-privacy-basics', 'db-26-database-testing', 'db-27-performance-debugging', 'db-28-small-database-project']],
];

const selectOne = async (database, sql, params = []) => (await database.select(sql, params))[0] ?? null;

const upsertCampaign = async (database, timestamp) => {
  await database.execute(
    `
      INSERT INTO campaigns (type, slug, name, icon, color, mode, career_status, is_archived, created_at, updated_at, last_opened_at)
      VALUES ('template', ?, 'Computer Science Bachelor', 'brain', '#58d6ff', 'career', 'active', 0, ?, ?, NULL)
      ON CONFLICT(slug) DO UPDATE SET
        type = 'template',
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        mode = excluded.mode,
        career_status = excluded.career_status,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [CS_BACHELOR_TEMPLATE_SLUG, timestamp, timestamp],
  );

  return selectOne(database, 'SELECT * FROM campaigns WHERE slug = ? LIMIT 1', [CS_BACHELOR_TEMPLATE_SLUG]);
};

const upsertStats = async (database, campaignId, timestamp) => {
  const statsByKey = new Map();
  for (const stat of CS_BACHELOR_STATS) {
    await database.execute(
      `
        INSERT INTO campaign_stats (campaign_id, key, title, color, icon, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(campaign_id, key) DO UPDATE SET
          title = excluded.title,
          color = excluded.color,
          icon = excluded.icon,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [campaignId, stat.key, stat.title, stat.color, stat.icon, stat.sort_order, timestamp, timestamp],
    );
    const row = await selectOne(database, 'SELECT * FROM campaign_stats WHERE campaign_id = ? AND key = ? LIMIT 1', [
      campaignId,
      stat.key,
    ]);
    statsByKey.set(stat.key, row);
  }
  return statsByKey;
};

const upsertStructure = async (database, campaignId, statsByKey, timestamp) => {
  await database.execute(
    `
      INSERT INTO spheres (campaign_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'Computer Science Bachelor', 'cs-bachelor-foundations', 'Reusable template for a realistic undergraduate CS foundation path.', 0, 0, ?, ?)
      ON CONFLICT(campaign_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        sort_order = excluded.sort_order,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [campaignId, timestamp, timestamp],
  );
  const sphere = await selectOne(database, 'SELECT * FROM spheres WHERE campaign_id = ? AND slug = ? LIMIT 1', [
    campaignId,
    'cs-bachelor-foundations',
  ]);

  await database.execute(
    `
      INSERT INTO directions (sphere_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'Core CS Foundations', 'core-cs-foundations', 'First playable slice through programming, discrete math, data structures, algorithms, and support branches.', 0, 0, ?, ?)
      ON CONFLICT(sphere_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        sort_order = excluded.sort_order,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [sphere.id, timestamp, timestamp],
  );
  const direction = await selectOne(database, 'SELECT * FROM directions WHERE sphere_id = ? AND slug = ? LIMIT 1', [
    sphere.id,
    'core-cs-foundations',
  ]);

  const skillsByBranch = new Map();
  for (const [index, branch] of BRANCHES.entries()) {
    const stat = statsByKey.get(branch.statKey);
    await database.execute(
      `
        INSERT INTO skills (direction_id, primary_stat_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(direction_id, slug) DO UPDATE SET
          primary_stat_id = excluded.primary_stat_id,
          name = excluded.name,
          description = excluded.description,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [direction.id, stat?.id ?? null, branch.title, branch.id, branch.summary, index, timestamp, timestamp],
    );
    const skill = await selectOne(database, 'SELECT * FROM skills WHERE direction_id = ? AND slug = ? LIMIT 1', [
      direction.id,
      branch.id,
    ]);
    skillsByBranch.set(branch.id, skill);
  }

  return skillsByBranch;
};

const upsertKnowledgeNode = async (database, node, timestamp) => {
  const key = `cs-bachelor:${node.id}`;
  await database.execute(
    `
      INSERT INTO knowledge_nodes (key, title, domain, summary, created_at, updated_at)
      VALUES (?, ?, 'Computer Science', ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        title = excluded.title,
        domain = excluded.domain,
        summary = excluded.summary,
        updated_at = excluded.updated_at
    `,
    [key, node.title, node.summary, timestamp, timestamp],
  );
  return selectOne(database, 'SELECT * FROM knowledge_nodes WHERE key = ? LIMIT 1', [key]);
};

const upsertNodes = async (database, skillsByBranch, timestamp) => {
  const nodesBySlug = new Map();

  for (const node of NODES) {
    const skill = skillsByBranch.get(node.branchId);
    const knowledgeNode = await upsertKnowledgeNode(database, node, timestamp);
    await database.execute(
      `
        INSERT INTO nodes (
          skill_id,
          type,
          status,
          title,
          slug,
          summary,
          completion_criteria,
          links,
          reward,
          x,
          y,
          knowledge_node_id,
          self_marked_mastery_level,
          check_metadata,
          importance,
          target_date,
          last_touched_at,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, 'task', 'active', ?, ?, ?, ?, NULL, NULL, ?, ?, ?, NULL, ?, ?, NULL, NULL, 0, ?, ?)
        ON CONFLICT(skill_id, slug) DO UPDATE SET
          title = excluded.title,
          summary = excluded.summary,
          completion_criteria = excluded.completion_criteria,
          x = excluded.x,
          y = excluded.y,
          knowledge_node_id = excluded.knowledge_node_id,
          self_marked_mastery_level = NULL,
          check_metadata = excluded.check_metadata,
          importance = excluded.importance,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [
        skill.id,
        node.title,
        node.id,
        node.summary,
        node.completionCriteria,
        node.x,
        node.y,
        knowledgeNode.id,
        node.check ? JSON.stringify(node.check) : null,
        node.check ? 'high' : 'medium',
        timestamp,
        timestamp,
      ],
    );
    const row = await selectOne(database, 'SELECT * FROM nodes WHERE skill_id = ? AND slug = ? LIMIT 1', [
      skill.id,
      node.id,
    ]);
    nodesBySlug.set(node.id, row);

    const existingPrimaryAction = await selectOne(
      database,
      'SELECT * FROM node_actions WHERE node_id = ? AND sort_order = 0 ORDER BY id ASC LIMIT 1',
      [row.id],
    );
    if (existingPrimaryAction) {
      await database.execute(
        `
          UPDATE node_actions
          SET title = ?,
              details = ?,
              size_hint = 'standard',
              is_minimum_step = 0,
              is_repeatable = 0,
              updated_at = ?
          WHERE id = ?
        `,
        [node.actionTitle, node.actionDetails, timestamp, existingPrimaryAction.id],
      );
    } else {
      await database.execute(
        `
          INSERT INTO node_actions (node_id, title, details, status, size_hint, sort_order, is_minimum_step, is_repeatable, due_at, completed_at, created_at, updated_at)
          VALUES (?, ?, ?, 'todo', 'standard', 0, 0, 0, NULL, NULL, ?, ?)
        `,
        [row.id, node.actionTitle, node.actionDetails, timestamp, timestamp],
      );
    }
  }

  for (const node of NODES) {
    const blocked = nodesBySlug.get(node.id);
    for (const prerequisite of node.prerequisites) {
      const blocking = nodesBySlug.get(prerequisite);
      if (!blocked || !blocking) {
        continue;
      }
      await database.execute(
        `
          INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
          VALUES (?, ?, 'requires', ?)
        `,
        [blocked.id, blocking.id, timestamp],
      );
    }
  }

  for (const [supportSlug, supportedSlug] of SUPPORT_EDGES) {
    const support = nodesBySlug.get(supportSlug);
    const supported = nodesBySlug.get(supportedSlug);
    if (!support || !supported) {
      continue;
    }
    await database.execute(
      `
        DELETE FROM node_dependencies
        WHERE blocked_node_id = ?
          AND blocking_node_id = ?
          AND dependency_type = 'supports'
      `,
      [supported.id, support.id],
    );
    await database.execute(
      `
        INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
        VALUES (?, ?, 'supports', ?)
      `,
      [support.id, supported.id, timestamp],
    );
  }

  return nodesBySlug;
};

const upsertRoute = async (database, campaign, nodesBySlug, timestamp) => {
  await database.execute(
    `
      INSERT INTO career_specializations (
        campaign_id,
        name,
        key,
        domain,
        length,
        status,
        started_at,
        completed_at,
        created_at,
        updated_at
      )
      VALUES (?, 'Core CS Foundations', 'route-core-cs-foundations', 'Computer Science', 'long', 'active', ?, NULL, ?, ?)
      ON CONFLICT(campaign_id, key) DO UPDATE SET
        name = excluded.name,
        domain = excluded.domain,
        length = excluded.length,
        status = 'active',
        started_at = COALESCE(career_specializations.started_at, excluded.started_at),
        completed_at = NULL,
        updated_at = excluded.updated_at
    `,
    [campaign.id, timestamp, timestamp, timestamp],
  );
  const specialization = await selectOne(
    database,
    'SELECT * FROM career_specializations WHERE campaign_id = ? AND key = ? LIMIT 1',
    [campaign.id, 'route-core-cs-foundations'],
  );

  let routeOrder = 0;
  const routeRowsBySlug = new Map();
  for (const [stage, slugs] of ROUTE_STAGES) {
    for (const slug of slugs) {
      const node = nodesBySlug.get(slug);
      if (!node) {
        continue;
      }
      const existingRouteNode = await selectOne(
        database,
        'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND knowledge_node_id = ? LIMIT 1',
        [specialization.id, node.knowledge_node_id],
      );

      if (existingRouteNode) {
        await database.execute(
          `
            UPDATE specialization_route_nodes
            SET node_id = ?,
                required_mastery_level = 'confirmed',
                route_label = ?,
                route_order = ?,
                route_stage = ?,
                is_required = 1,
                updated_at = ?
            WHERE id = ?
          `,
          [node.id, node.title, routeOrder, stage, timestamp, existingRouteNode.id],
        );
      } else {
        await database.execute(
          `
            INSERT INTO specialization_route_nodes (
              specialization_id,
              node_id,
              knowledge_node_id,
              required_mastery_level,
              route_label,
              route_order,
              route_stage,
              is_required,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, 'confirmed', ?, ?, ?, 1, ?, ?)
          `,
          [specialization.id, node.id, node.knowledge_node_id, node.title, routeOrder, stage, timestamp, timestamp],
        );
      }
      const routeRow = await selectOne(
        database,
        'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND knowledge_node_id = ? LIMIT 1',
        [specialization.id, node.knowledge_node_id],
      );
      routeRowsBySlug.set(slug, routeRow);
      routeOrder += 1;
    }
  }

  const routeSlugs = ROUTE_STAGES.flatMap(([, slugs]) => slugs);
  for (let index = 1; index < routeSlugs.length; index += 1) {
    const source = routeRowsBySlug.get(routeSlugs[index]);
    const target = routeRowsBySlug.get(routeSlugs[index - 1]);
    if (!source || !target) {
      continue;
    }
    await database.execute(
      `
        INSERT OR IGNORE INTO specialization_route_edges (specialization_id, source_route_node_id, target_route_node_id, edge_type, created_at)
        VALUES (?, ?, ?, 'requires', ?)
      `,
      [specialization.id, source.id, target.id, timestamp],
    );
  }

  await database.execute(
    `
      UPDATE campaigns
      SET current_specialization_id = ?,
          mode = 'career',
          career_status = 'active',
          updated_at = ?
      WHERE id = ?
    `,
    [specialization.id, timestamp, campaign.id],
  );
};

const clearTemplateProgress = async (database, campaignId, timestamp) => {
  await database.execute(
    `
      DELETE FROM node_barrier_notes
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute(
    `
      DELETE FROM node_error_notes
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute(
    `
      DELETE FROM daily_session_events
      WHERE session_id IN (
        SELECT id FROM daily_sessions WHERE campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute('DELETE FROM daily_sessions WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM assessment_attempts WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM mastery_events WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM stat_xp_grants WHERE campaign_id = ?', [campaignId]);
  await database.execute(
    `
      UPDATE node_actions
      SET status = 'todo',
          completed_at = NULL,
          updated_at = ?
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
  await database.execute(
    `
      UPDATE nodes
      SET status = 'active',
          self_marked_mastery_level = NULL,
          last_touched_at = NULL,
          updated_at = ?
      WHERE id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
};

export const seedCsBachelorTemplate = async (database) => {
  const timestamp = createUtcTimestamp();
  const campaign = await upsertCampaign(database, timestamp);
  const statsByKey = await upsertStats(database, campaign.id, timestamp);
  const skillsByBranch = await upsertStructure(database, campaign.id, statsByKey, timestamp);
  const nodesBySlug = await upsertNodes(database, skillsByBranch, timestamp);
  await upsertRoute(database, campaign, nodesBySlug, timestamp);
  await clearTemplateProgress(database, campaign.id, timestamp);
  return selectOne(database, 'SELECT * FROM campaigns WHERE id = ? LIMIT 1', [campaign.id]);
};
