# Security Policy

## Supported versions

Only actively maintained branches are supported for security fixes:

- `main`
- `dev` (pre-release hardening only)

## Reporting a vulnerability

If you discover a vulnerability:

1. Do not publish exploit details in public issues.
2. Open a private security report (GitHub Security Advisories) or contact maintainers directly.
3. Include reproduction steps, impact, and affected components.

## Internal handling workflow

Use the required finding template:

- `audit/02-security/findings/template.md`

Severity policy:

- `Critical` / `High`: merge is blocked until fix or explicit waiver is approved.
- `Medium` / `Low`: triaged with SLA and owner.

## Security SLA (target)

- Initial triage: within 2 business days
- Critical remediation plan: within 1 business day after triage
- High remediation plan: within 3 business days after triage

## Scope highlights

- Tauri IPC boundaries
- Input validation and parser boundaries
- Dependency supply-chain risk
- Secrets and private data exposure
