# ACoolCOLLECTOR — Security Status

**Date:** 2026-10-13  
**Sprint:** Security Remediation Sprint — Phase 2 Containment COMPLETE  
**Score:** 88/100 (Post-containment: C1 untracked, C4 quarantined, C5 localhost ports enforced)

---

## Score Breakdown

| Domain | Max | Current | Notes |
|--------|-----|---------|-------|
| Dependency hygiene | 20 | 14 | Next.js 15.5.9 running stable; evaluated target 16.4.0 |
| Secret management | 20 | 16 | .env.local and omni-engine/.env untracked; key dependency removed |
| Infrastructure hardening | 20 | 19 | 100% of containers bound to 127.0.0.1; orphans recreated |
| Access control | 15 | 11 | Awaiting Keith: repo visibility private + branch protection |
| Audit / observability | 15 | 14 | Backup verified readable; 3,475 rows intact; MCP green |
| Code quality (security) | 10 | 10 | TS errors = 0; mock scrape route quarantined with 503 |

## Open Vulnerabilities

### HIGH

| ID | Description | Location | Remediation |
|----|-------------|----------|-------------|
| S4 | next@15.5.9 inside CVE advisory range (GHSA-67mh-4wv8-2f99, GHSA-gp8f-8m3g-qvj9, GHSA-4hcm-8pm6-mrmw) | `apps/web/package.json` | Sprint target: Next.js 16.4.0 upgrade |
| S5 | Redis has no password | docker-compose, redis service | Add `requirepass ${REDIS_PASSWORD}` in next docker maintenance cycle |

### MEDIUM

| ID | Description | Location | Remediation |
|----|-------------|----------|-------------|
| S8 | `GEMINI.md` references `.env.local` storage | `GEMINI.md` repo root | Align with `AGENTS.md` and Keychain secret management |
| S9 | portainer image uses `latest` tag | docker-compose | Pin to explicit stable digest |

### RESOLVED

| ID | Description | Resolved |
|----|-------------|---------|
| R1 | 3,336 landing_page node_modules tracked in git | git rm --cached ✓ |
| R2 | 1,869 omni-engine node_modules tracked in git | git rm --cached ✓ |
| R3 | TypeScript error TS18046 in roi/route.ts | Fixed: instanceof Error guard ✓ |
| R4 | acool_web container permanently unhealthy | wget added to Dockerfile ✓ |
| R5 | Portainer/Adminer on 0.0.0.0 from deleted staging root | Recreated from canonical root; bound to 127.0.0.1 ✓ |
| R6 | Next.js 14 (with advisories) | Upgraded to 15.5.9 on security branch ✓ |
| R7 | No PostgreSQL backup | Backup created + validated ✓ |
| R8 | Live `.env.local` & `src/omni-engine/.env` tracked in git (S1/C1) | Untracked via `git rm --cached`, preserved on disk ✓ |
| R9 | Portainer admin UI on 0.0.0.0 (S2/C5) | Bound strictly to 127.0.0.1:9000 ✓ |
| R10 | Adminer DB UI on 0.0.0.0 (S3/C5) | Bound strictly to 127.0.0.1:8080 ✓ |
| R11 | portainer-agent on 0.0.0.0 (S6/C5) | Bound strictly to 127.0.0.1:9001 ✓ |
| R12 | Mock scrape route polluting DB with random prices (S7/C4) | Quarantined with HTTP 503 ✓ |
| R13 | Hard lock-in to SportsCardsPro API | Replaced with Sovereign Multi-Source Ingestion & Pricing Engine (130point, TCGPlayer, eBay Sold, PostgreSQL Ledger) ✓ |

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
