import { createUtcTimestamp } from '../stores/store-helpers.js';

export const CS_BACHELOR_TEMPLATE_SLUG = 'template-cs-bachelor';

const CS_BACHELOR_STATS = [
  { key: 'programming', title: 'Programming', color: '#58d6ff', icon: 'code', sort_order: 0 },
  { key: 'math-reasoning', title: 'Math Reasoning', color: '#ffd166', icon: 'sigma', sort_order: 1 },
  { key: 'structures', title: 'Structures', color: '#5ee6b5', icon: 'network', sort_order: 2 },
  { key: 'algorithms', title: 'Algorithms', color: '#fb7185', icon: 'route', sort_order: 3 },
  { key: 'debugging', title: 'Debugging', color: '#c084fc', icon: 'bug', sort_order: 4 },
  { key: 'systems-intuition', title: 'Systems Intuition', color: '#f97316', icon: 'cpu', sort_order: 5 },
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
  strict_check_type: type,
  prompt: extra.prompt ?? 'Complete the check for this node.',
  expected_summary: extra.expected_summary ?? null,
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
    check_method: 'manual_strict',
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
  'ds-09-hash-tables': assessment('number', {
    prompt: 'What is the usual average-case lookup cost exponent-free Big-O level for a hash table?',
    expected_number: 1,
    tolerance: 0,
  }),
  'ds-11-graph-representations': assessment('checklist', {
    prompt: 'Compare adjacency lists and adjacency matrices.',
    items: [
      { id: 'space', label: 'Compare space cost', required: true },
      { id: 'neighbors', label: 'Compare neighbor iteration', required: true },
    ],
  }),
  'ds-12-data-structure-tradeoffs': {
    check_method: 'llm_assisted',
    strict_check_type: 'llm_assisted',
    prompt: 'Compare arrays, hash tables, and graphs for a concrete scenario.',
    expected_summary: 'Answer should justify choices by operations and constraints.',
  },
  'al-02-asymptotic-complexity': assessment('exact', {
    prompt: 'What Big-O class describes scanning every item once?',
    expected_answer: 'O(n)',
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
  'dt-02-tracing-state-by-hand': assessment('checklist', {
    prompt: 'Trace variable state through a short program.',
    items: [
      { id: 'initial', label: 'Record initial state', required: true },
      { id: 'updates', label: 'Record each update', required: true },
    ],
  }),
  'ms-01-reading-symbols': assessment('exact', {
    prompt: 'What does the symbol forall usually mean?',
    expected_answer: 'for all',
  }),
  'mm-01-values-vs-references': assessment('exact', {
    prompt: 'Name the concept used when two names point at the same mutable object.',
    expected_answer: 'aliasing',
  }),
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
].map(([branchId, id, title, prerequisites], index) => ({
  branchId,
  id,
  title,
  prerequisites,
  order: index,
  check: NODE_CHECKS[id] ?? null,
}));

const ROUTE_STAGES = [
  ['Programming Fundamentals', ['pf-01-programming-environment', 'pf-02-values-variables-types', 'pf-03-expressions-and-operators', 'pf-04-branching-with-conditionals', 'pf-05-loops-and-iteration', 'pf-06-functions-and-parameters', 'pf-07-scope-and-lifetime', 'pf-08-arrays-and-lists', 'pf-09-dictionaries-and-records', 'pf-10-input-output-and-parsing', 'pf-11-debugging-basics', 'pf-12-small-program-design']],
  ['Discrete Math For CS', ['dm-01-sets-and-membership', 'dm-02-propositions-and-logic', 'dm-03-truth-tables', 'dm-04-quantifiers', 'dm-05-direct-proofs', 'dm-06-contrapositive-and-contradiction', 'dm-07-induction', 'dm-08-functions-and-relations', 'dm-09-counting-basics', 'dm-10-graph-vocabulary']],
  ['Data Structures', ['ds-01-abstract-data-types', 'ds-02-arrays-and-dynamic-arrays', 'ds-03-linked-lists', 'ds-04-stacks', 'ds-05-queues', 'ds-06-recursion-for-structures', 'ds-07-trees', 'ds-08-binary-search-trees', 'ds-09-hash-tables', 'ds-10-heaps-and-priority-queues', 'ds-11-graph-representations', 'ds-12-data-structure-tradeoffs']],
  ['Algorithms', ['al-01-algorithmic-thinking', 'al-02-asymptotic-complexity', 'al-03-linear-and-binary-search', 'al-04-sorting-basics', 'al-05-divide-and-conquer', 'al-06-recursion-and-recurrences', 'al-07-greedy-intuition', 'al-08-dynamic-programming-intuition', 'al-09-graph-traversal', 'al-10-shortest-path-intuition']],
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
    [key, node.title, `Concept node for ${node.title}.`, timestamp, timestamp],
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
        `Learn ${node.title} in the CS bachelor foundation path.`,
        node.check ? 'Pass the seeded check or complete the practice task in a personal fork.' : 'Complete the practice task in a personal fork.',
        (node.order % 12) * 180,
        Math.floor(node.order / 12) * 150,
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

    await database.execute(
      `
        INSERT INTO node_actions (node_id, title, details, status, size_hint, sort_order, is_minimum_step, is_repeatable, due_at, completed_at, created_at, updated_at)
        SELECT ?, ?, ?, 'todo', 'standard', 0, 0, 0, NULL, NULL, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM node_actions WHERE node_id = ? AND title = ?
        )
      `,
      [row.id, `Study ${node.title}`, `Work through the learner-facing material for ${node.title}.`, timestamp, timestamp, row.id, `Study ${node.title}`],
    );
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

  for (const [, slugs] of ROUTE_STAGES) {
    for (let index = 1; index < slugs.length; index += 1) {
      const source = routeRowsBySlug.get(slugs[index]);
      const target = routeRowsBySlug.get(slugs[index - 1]);
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
