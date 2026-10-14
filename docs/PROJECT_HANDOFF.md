# ACoolCOLLECTOR — Project Handoff

**Format:** Verified state only. No recaps. Read this before any new session.  
**Last updated:** 2026-10-13  
**Session:** Security Remediation Sprint, Phase 1 complete → awaiting APPROVE PHASE 2

---

## Git State

| Fact | Value |
|------|-------|
| Canonical repo | `/Users/acoolnerd/ACool/repos/ACoolCOLLECTOR` |
| Active branch | `security/nextjs-15-upgrade` |
| Merge base | `e27c256` (main@HEAD when branch was cut) |
| Remote | `origin` — NOT yet pushed (security/nextjs-15-upgrade is local only) |
| Staging copy | `/Users/acoolnerd/Downloads/ACoolCOLLECTOR` — DELETED |
| Node modules in git | `src/landing_page/node_modules` removed ✓; `src/omni-engine/node_modules` removed ✓ |
| Env files in git | `.env.local` STILL TRACKED; `src/omni-engine/.env` STILL TRACKED — these are the Phase 2 removals |

## Docker Runtime

| Container | Image | Port | Status |
|-----------|-------|------|--------|
| acool_db | postgres:15-alpine | 127.0.0.1:5432 | healthy |
| acool_redis | redis:7-alpine | 127.0.0.1:6379 | healthy |
| acool_ai_engine | local build | 127.0.0.1:8000 | healthy |
| acool_web | local build | 127.0.0.1:3000 | healthy |
| acool_portainer | portainer-ce | **0.0.0.0**:9000 | running — ORPHANED from deleted staging root |
| acool_adminer | adminer:4 | **0.0.0.0**:8080 | running — ORPHANED from deleted staging root |
| acool_portainer_agent | portainer/agent | 127.0.0.1:9001 | running |

**Portainer and Adminer problem:** These two containers were started by the old `~/Downloads/ACoolCOLLECTOR/docker-compose.yml` before staging was deleted. The canonical `docker-compose.yml` now has `127.0.0.1` bindings, but those containers have not been recreated yet. They are currently LAN-accessible on 0.0.0.0. Fix: `docker compose stop portainer adminer && docker compose up -d portainer adminer` from canonical root.

## Database

| Fact | Value |
|------|-------|
| DB name | `acool_paas` |
| DB role | `acool_admin` |
| Item rows | 3,475 |
| MarketData rows | 1 (suspicious — random-price row from POST /api/v1/scrape) |
| Record discrepancy | Ingest manifest says 3,886; DB has 3,475; prior commit said 3,474 — UNEXPLAINED |
| Backup file | `~/ACool/backups/acoolcollector/acoolcollector_20261013_031744.dump` |
| Backup validation | Non-destructive pg_restore --list: 2 TABLE DATA sections confirmed |

## Application

| Fact | Value |
|------|-------|
| Next.js version | 15.5.9 (upgraded from 14) |
| npm audit (dev omitted) | critical=1 (next), high=2 (postcss, sharp), moderate=0 |
| Frontend | http://localhost:3000 — dark luxury, Live Inventory page active |
| API base | http://localhost:8000 — FastAPI |
| Portainer | http://localhost:9000 — environment ID = 3 |
| Adminer | http://localhost:8080 — PostgreSQL |

## Security Issues (Open)

| Severity | Issue | Status |
|----------|-------|--------|
| CRITICAL | `.env.local` tracked in git (contains SPORTSCARDSPRO_API_KEY) | OPEN — C1 in Phase 2 |
| CRITICAL | `src/omni-engine/.env` tracked in git (same key) | OPEN — C1 in Phase 2 |
| CRITICAL | Repo is PUBLIC on GitHub with live key in HEAD | OPEN — A2 requires Keith |
| CRITICAL | Key must be rotated at SportsCardsPro | OPEN — A1 requires Keith |
| HIGH | Portainer + Adminer on 0.0.0.0 (LAN-accessible) | OPEN — C5 in Phase 2 |
| HIGH | git history contains secret files (HEAD clear after C1, history still has them) | OPEN — A7 (history purge) requires Keith |
| MEDIUM | npm audit: next@15.5.9 still inside advisory range (only 16.4.0 clears all CVEs) | DOCUMENTED — A9 Keith decides target version |
| MEDIUM | 1 fake MarketData row from scrape route | OPEN — A8 Keith decides quarantine vs delete |
| MEDIUM | Redis: no password set | OPEN — C5 in Phase 2 |
| LOW | portainer-agent mounts host `/` and Docker socket | OPEN — C5 in Phase 2 |

## Approvals Needed

| ID | Action | Who |
|----|--------|-----|
| A1 | Rotate SPORTSCARDSPRO_API_KEY at provider | Keith |
| A2 | Make GitHub repo private | Keith |
| A3 | Branch protection + secret scanning + push protection | Keith |
| APPROVE PHASE 2 | Execute C1-C7 containment work | Keith |
| APPROVE MERGE security/nextjs-15-upgrade | Push + draft PR for Next.js upgrade | Keith |
| APPROVE REWRITE | git filter-repo history purge | Keith |
| U1-U5 | CLI tool updates (Claude Code, Gemini, Codex, Hermes, OpenClaw) | Keith |

## Next Executable Action (for Claude Code)

**With current authorization:** Nothing — Phase 2 requires APPROVE PHASE 2.

**After "APPROVE PHASE 2":**
1. Create branch `security/containment-2026-10` from `security/nextjs-15-upgrade`
2. Execute C1: `git rm --cached .env.local src/omni-engine/.env` + add `.env.example`
3. Execute C2: Untrack `data/raw`, `data/processed`, `src/omni-engine/node_modules`, `src/omni-engine/dist`
4. Execute C3: Anchor Python gitignore patterns to Python paths
5. Execute C4: Make `POST /api/v1/scrape` return 503 (DO NOT delete MarketData rows)
6. Execute C5: docker-compose Redis requirepass, remove portainer-agent, pin portainer image
7. Execute C6: Write `docs/ACoolSECURITY_History_Purge_Plan.md`
8. Execute C7: Push `security/nextjs-15-upgrade` as draft PR
9. Stop and restart portainer/adminer from canonical root to apply 127.0.0.1 bindings

## Files Created This Session

```
docs/DAILY_STATUS.md
docs/AI_TOOLCHAIN_REGISTRY.md
docs/AGENT_COORDINATION.md
docs/PROJECT_HANDOFF.md           ← this file
docs/SECURITY_STATUS.md
docs/NEXT_ACTIONS.md
docs/ACoolSECURITY_Audit_20261013.md
docs/ACoolINFRASTRUCTURE_Inventory.md
docs/ACoolBACKUP_Recovery_SOP.md
apps/web/app/inventory/page.tsx
apps/web/app/api/roi/route.ts     (fixed TS18046)
apps/web/Dockerfile               (added wget for healthcheck)
docker-compose.yml                (127.0.0.1 port bindings)
```
