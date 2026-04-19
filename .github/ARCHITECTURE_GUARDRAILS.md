# Architecture Guardrails

Canonical source:

- `.github/ARCHITECTURE_GUARDRAILS.md`

This file exists to make the same rules visible from `.github`.

## Mandatory for All Agents

Every agent working through `.github/agents`, `.github/commands`, or repository-level agent flows must follow the canonical guardrails.

Minimum mandatory rules:

1. Do not create or expand god objects.
2. Every non-trivial task must classify work into:
   - `domain`
   - `application`
   - `infrastructure`
   - `transport`
   - `presentation`
   - `validation`
   - `tests`
3. Planning/design artifacts are invalid if they do not state which categories are touched.
4. Implementation is invalid if it collapses several categories into one catch-all file without explicit approval.
5. Review is invalid if it does not check for:
   - god object growth,
   - wrong-layer placement,
   - transport thickness,
   - presentation/persistence leakage,
   - hidden validation logic.

For the full policy, use `.github/ARCHITECTURE_GUARDRAILS.md`.
