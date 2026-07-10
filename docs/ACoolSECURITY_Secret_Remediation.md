# ACoolSECURITY — Secret Remediation Runbook

## Incident summary

At least two active-looking SportsCardsPro credentials were exposed:

1. one was committed in the repository's tracked `.env.local` file;
2. another was shared outside the repository during integration planning.

Both credentials must be treated as compromised. Removing a file in a later commit does not remove the credential from Git history.

## Immediate containment

1. Revoke or rotate both exposed provider credentials.
2. Do not use either old value again.
3. Store the replacement only in a protected secret manager or GitHub Actions secret.
4. Disable workflows or deployments that still reference the old credentials.
5. Confirm no client-side application bundles contain provider credentials.

## Repository cleanup

The feature branch removes `.env.local` and adds repository-wide ignore rules, but an administrator must assess full-history remediation.

Recommended process:

1. Create a protected backup of the repository.
2. Search all branches, tags, releases, Actions logs, artifacts, issues, pull requests, wikis, and package registries.
3. Use `git filter-repo` or an equivalent approved method to remove the committed secret from history.
4. Force-push rewritten refs only after coordinating with every collaborator.
5. Invalidate old clones and require fresh clones.
6. Re-run secret scanning after the rewrite.
7. Preserve an internal incident record without preserving the actual secret value.

## GitHub security controls

Enable:

- secret scanning;
- push protection;
- Dependabot alerts and updates;
- code scanning where practical;
- branch protection on `main`;
- required pull-request review;
- required CI checks;
- dismissal of stale approvals after new commits;
- blocked force pushes and branch deletion;
- signed commits where practical.

## Secret storage

### Local development

Use `.env.local`, which must remain ignored.

### GitHub Actions

Use repository or environment secrets. Restrict production secrets to an environment with required reviewers.

### Cloud deployment

Use the platform's secret manager. Do not use public environment variables or frontend build-time variables.

## Logging rules

Never log:

- provider tokens;
- authorization headers;
- full callback query strings containing sensitive values;
- QuickBooks access or refresh tokens;
- service-role credentials;
- signed private evidence URLs;
- customer payment data.

Redact secrets in exception messages before writing logs or audit events.

## Verification checklist

- [ ] Both exposed provider credentials revoked
- [ ] Replacement credential created
- [ ] Replacement stored as `SPORTSCARDSPRO_API_TOKEN`
- [ ] `.env.local` no longer tracked
- [ ] Full Git history searched
- [ ] GitHub Actions logs and artifacts searched
- [ ] History rewritten if required
- [ ] Secret scanning enabled
- [ ] Push protection enabled
- [ ] `main` branch protected
- [ ] CI secret-pattern check passes
- [ ] Local and production synchronization tested with the replacement secret

## Closure criteria

The incident may be closed only after the provider confirms the old credentials are invalid, repository scanning is complete, production uses the replacement secret, and no active deployment depends on an exposed value.
