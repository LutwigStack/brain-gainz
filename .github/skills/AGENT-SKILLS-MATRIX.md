# Agent Skills Matrix

Skill source: `.github/skills/skills/*`.

## Global Mandatory

These skills are mandatory for any technical PR:

- `verification-before-completion`
- `lint-and-validate`

## Role Mapping

| Agent | Required Skills | Optional Skills |
|---|---|---|
| `pr_orchestrator` | `architecture-patterns`, `architecture-decision-records`, `verification-before-completion` | `wiki-architect`, `c4-architecture` |
| `lead` | `architecture-patterns`, `architecture-decision-records` | `wiki-qa` |
| `codebase_researcher` | `wiki-researcher`, `wiki-qa` | `find-bugs`, `debugging-strategies` |
| `designer` | `architecture-patterns`, `c4-architecture` | `mermaid-expert`, `wiki-architect` |
| `planner` | `architecture-decision-records`, `test-driven-development`, `testing-patterns` | `performance-engineer` |
| `qa_engineer` | `test-driven-development`, `testing-patterns`, `find-bugs` | `test-fixing`, `debugging-strategies` |
| `implementer` | `rust-pro`, `rust-async-patterns`, `systems-programming-rust-project`, `memory-safety-patterns` | `computer-vision-expert`, `ai-engineer`, `ml-pipeline-workflow` |
| `frontend` | `testing-patterns`, `find-bugs`, `lint-and-validate` | `test-fixing`, `debugging-strategies`, `performance-profiling` |
| `reviewer` | `codex-review`, `find-bugs`, `production-code-audit` | `code-reviewer`, `code-review-checklist`, `code-review-excellence`, `architect-review` |
| `security_reviewer` | `security-auditor`, `threat-modeling-expert`, `security-scanning-security-dependencies` | `production-code-audit` |
| `verifier` | `lint-and-validate`, `verification-before-completion`, `testing-patterns` | `test-fixing`, `performance-profiling`, `performance-engineer` |
| `archive_keeper` | `wiki-architect`, `wiki-qa` | `architecture-decision-records` |
| `task_goal_auditor` | `codex-review`, `find-bugs`, `production-code-audit`, `architecture-decision-records` | `verification-before-completion` |

## Command Skill Binding (Mandatory)

| Command | Mandatory Skills |
|---|---|
| `/lead` | `architecture-patterns`, `architecture-decision-records` |
| `/research-codebase` | `wiki-researcher`, `wiki-qa` |
| `/design-feature`, `/design-bugfix` | `architecture-patterns`, `c4-architecture` |
| `/plan-prs` | `architecture-decision-records`, `test-driven-development`, `testing-patterns` |
| `/qa-red-tests <PRx>` | `test-driven-development`, `testing-patterns` |
| `/implement-backend <PRx>` | `rust-pro`, `memory-safety-patterns`, `lint-and-validate` |
| `/implement-frontend <PRx>` | `testing-patterns`, `find-bugs`, `lint-and-validate` |
| `/fix-backend-bugs <PRx>` | `find-bugs`, `debugging-strategies`, `test-fixing` |
| `/fix-frontend-bugs <PRx>` | `find-bugs`, `debugging-strategies`, `test-fixing` |
| `/review-pr <PRx>` | `codex-review`, `find-bugs`, `production-code-audit` |
| `/security-review-pr <PRx>` | `security-auditor`, `threat-modeling-expert`, `security-scanning-security-dependencies` |
| `/verify-pr <PRx>` | `verification-before-completion`, `lint-and-validate`, `testing-patterns` |
| `/archive-pr <PRx>` | `wiki-architect`, `wiki-qa` |
| `/task-goal-audit <PRx>` | `codex-review`, `find-bugs`, `production-code-audit`, `architecture-decision-records` |
| `/scope-change-request <PRx>`, `/rollback-pr <PRx>` | `architecture-decision-records`, `verification-before-completion` |

## Activation Rules

1. At the start of each stage, the agent explicitly lists the activated skills.
2. If a required skill is unavailable, log that risk and use the closest optional fallback.
3. Review fallback order: `codex-review` -> `code-reviewer` -> `code-review-checklist` -> `code-review-excellence` -> `architect-review` -> `production-code-audit` -> `security-auditor`.
