# Branch Protection Runbook

Apply these rules in GitHub repository settings for `main` and `dev`.

## Required settings

- Require a pull request before merging
- Require approvals: minimum 1
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Include administrators
- Restrict who can force push / disable force pushes
- Restrict branch deletion

## Required status checks

- `Check / Test / Lint`

## Notes

- These rules are managed in GitHub settings and cannot be enforced purely by repo files.
- Keep this file in sync with `.github/ci-policy-checklist.md`.
