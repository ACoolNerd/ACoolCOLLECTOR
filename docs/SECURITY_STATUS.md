# ACoolCOLLECTOR — Security Status

**Date:** 2026-10-13  
**Sprint:** Security Remediation Sprint — Phase 1 COMPLETE  
**Score:** 61/100 (pre-containment baseline — score updates after each phase)

---

## Score Breakdown

| Domain | Max | Current | Notes |
|--------|-----|---------|-------|
| Dependency hygiene | 20 | 12 | Next.js advisory unresolved; postcss/sharp high |
| Secret management | 20 | 4 | Live key tracked in HEAD and history in PUBLIC repo |
| Infrastructure hardening | 20 | 14 | 2 containers still on 0.0.0.0; no Redis auth |
| Access control | 15 | 10 | No branch protection; no secret scanning enabled |
| Audit / observability | 15 | 12 | Backup exists; no automated rotation monitoring |
| Code quality (security) | 10 | 9 | TS errors = 0; scrape route returns 200 with fake data |

## Open Vulnerabilities

### CRITICAL

| ID | Description | Location | Remediation |
|----|-------------|----------|-------------|
| S1 | Live `SPORTSCARDSPRO_API_KEY` in HEAD + git history | `.env.local`, `src/omni-engine/.env` | A1 (rotate key) + A2 (private repo) + APPROVE PHASE 2 (C1: untrack) + APPROVE REWRITE (A7: purge history) |

### HIGH

| ID | Description | Location | Remediation |
|----|-------------|----------|-------------|
| S2 | Portainer admin UI on 0.0.0.0:9000 (LAN-accessible) | docker-compose (orphaned container) | Recreate container from canonical root after APPROVE PHASE 2 |
| S3 | Adminer DB UI on 0.0.0.0:8080 (LAN-accessible) | docker-compose (orphaned container) | Same as S2 |
| S4 | next@15.5.9 inside CVE advisory range (GHSA-67mh-4wv8-2f99, GHSA-gp8f-8m3g-qvj9, GHSA-4hcm-8pm6-mrmw) | `apps/web/package.json` | A9 Keith decides: stay at 15.x or upgrade to 16.4.0 |
| S5 | Redis has no password | docker-compose, redis service | C5 in Phase 2: add `requirepass ${REDIS_PASSWORD}` from .env |

### MEDIUM

| ID | Description | Location | Remediation |
|----|-------------|----------|-------------|
| S6 | portainer-agent mounts host root `/` and Docker socket | docker-compose portainer-agent | C5: remove portainer-agent service |
| S7 | `POST /api/v1/scrape` inserts random prices into MarketData | `main.py` | C4: return 503 (quarantine) |
| S8 | `GEMINI.md` instructs agents to store keys in `.env.local` | `GEMINI.md` repo root | Write `AGENTS.md` to replace it |
| S9 | portainer image uses `latest` tag (unpinned) | docker-compose | C5: pin to explicit version |

### RESOLVED (since session start)

| ID | Description | Resolved |
|----|-------------|---------|
| R1 | 3,336 landing_page node_modules tracked in git | git rm --cached ✓ |
| R2 | 1,869 omni-engine node_modules tracked in git | git rm --cached ✓ |
| R3 | TypeScript error TS18046 in roi/route.ts | Fixed: instanceof Error guard ✓ |
| R4 | acool_web container permanently unhealthy | wget added to Dockerfile ✓ |
| R5 | All ports on 0.0.0.0 | docker-compose updated to 127.0.0.1 ✓ (orphan containers still need recreation) |
| R6 | Next.js 14 (with advisories) | Upgraded to 15.5.9 on security branch ✓ |
| R7 | No PostgreSQL backup | Backup created + validated ✓ |

## npm Audit (current — dev deps omitted)

```
# Produced: npm audit --omit=dev (on security/nextjs-15-upgrade branch)
found 3 vulnerabilities (1 critical, 2 high)
```

| Package | Severity | Advisory | Fixed in |
|---------|----------|----------|---------|
| next@15.5.9 | critical | GHSA-67mh-4wv8-2f99 (Server-Side Request Forgery) | 16.4.0 |
| next@15.5.9 | high | GHSA-gp8f-8m3g-qvj9 (Path traversal) | 16.4.0 |
| postcss@8.4.31 (nested under next) | high | GHSA-7fh8-c9q4-mpx5 | 8.4.31+ |
| sharp@0.33.x (dev) | high | GHSA-xxx (omitted) | Later version |

Note: `postcss@8.5.30` at project root is NOT vulnerable — only the bundled postcss inside `node_modules/next/node_modules/` is.

## Required Actions for Keith

1. **Rotate SPORTSCARDSPRO_API_KEY** at sportscard data provider portal — this is the only action that stops the live credential exposure.
2. **Make GitHub repo private** at github.com/ACoolNerd/ACoolCOLLECTOR → Settings → Danger Zone → Change visibility.
3. **Enable branch protection** on `main`: require PRs, require status checks, dismiss stale reviews.
4. **Enable secret scanning + push protection** on GitHub (Settings → Code security → Secret scanning).
5. **Approve git history rewrite** (APPROVE REWRITE) — required after C1 so the key is purged from all past commits.
6. **Decide Next.js target** (APPROVE PHASE 2 + A9): stay at 15.5.9 and document residual risk, or upgrade to 16.4.0 now.

## Target Score: 97/100

After all phases + Keith's A1–A7 actions complete.

| Domain | Max | Target |
|--------|-----|--------|
| Dependency hygiene | 20 | 18 (next@16.x clears all CVEs) |
| Secret management | 20 | 19 (key rotated, untracked, history purged) |
| Infrastructure hardening | 20 | 20 (all 127.0.0.1, Redis auth, portainer-agent removed) |
| Access control | 15 | 14 (branch protection + secret scanning) |
| Audit / observability | 15 | 14 (backup + monitoring) |
| Code quality | 10 | 10 (scrape route quarantined, AGENTS.md written) |
