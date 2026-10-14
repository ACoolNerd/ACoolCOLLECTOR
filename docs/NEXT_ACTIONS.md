# ACoolCOLLECTOR — Next Actions

**Date:** 2026-10-13  
**Status:** Phase 1 complete. Phase 2 staging. Waiting on explicit approvals.

---

## Immediate — Keith Required

These cannot proceed until Keith acts. Sorted by urgency:

| Priority | ID | Action | How |
|----------|----|--------|-----|
| 1 | A1 | **Rotate SPORTSCARDSPRO_API_KEY** at the data provider — the key is live in a public repo | Log into sportscard data portal → API settings → generate new key → update Keychain entry and local `.env.local` |
| 2 | A2 | **Make GitHub repo private** | github.com/ACoolNerd/ACoolCOLLECTOR → Settings → Danger Zone → Change repository visibility → Private |
| 3 | A3 | **Enable secret scanning + push protection** | GitHub repo → Settings → Code security and analysis → Secret scanning (on) → Push protection (on) |
| 4 | A3 | **Enable branch protection on main** | GitHub → Settings → Branches → Add rule → main → Require PR review + status checks |
| 5 | U1 | Approve Claude Code update | Reply `APPROVE U1` then run: `claude update` |
| 6 | U2 | Approve Gemini CLI update | Reply `APPROVE U2` then run: `npm install -g @google/gemini-cli@latest` |
| 7 | U3 | Approve Codex CLI update | Reply `APPROVE U3` then run: `npm install -g @openai/codex@0.162.1` |

## Phase 2 — Awaiting "APPROVE PHASE 2"

Reply with exactly **"APPROVE PHASE 2"** to release Claude Code to execute these in order:

| Step | ID | Action | Impact |
|------|----|--------|--------|
| 1 | C1 | `git rm --cached .env.local src/omni-engine/.env` → add `.env.example` with key names | Stops forward exposure; history still has it (requires A7 to purge) |
| 2 | C2 | Untrack `data/raw`, `data/processed`, `src/omni-engine/node_modules`, `src/omni-engine/dist` | Removes raw data and build artifacts from future commits |
| 3 | C3 | Anchor Python `lib/` and `build/` gitignore patterns to Python paths | Prevents matching unintended directories |
| 4 | C4 | Make `POST /api/v1/scrape` return 503 with quarantine message (DO NOT delete MarketData row) | Disables the fake-price injection endpoint |
| 5 | C5 | docker-compose: Redis requirepass from .env, remove portainer-agent service, pin portainer image version | LAN exposure hardening |
| 6 | C6 | Write `docs/ACoolSECURITY_History_Purge_Plan.md` (plan only, no execution) | Documents the filter-repo approach for Keith to authorize later |
| 7 | C7 | Push `security/nextjs-15-upgrade` as draft PR to GitHub | Puts Next.js upgrade on GitHub for review |
| 8 | — | Recreate acool_portainer and acool_adminer from canonical root | Applies 127.0.0.1 bindings; eliminates orphaned containers |

After Phase 2: **APPROVE MERGE security/containment-2026-10** → merges containment PR.

## Phase 3 — After Containment Merged (future session)

| ID | Action | Notes |
|----|--------|-------|
| A5 | APPROVE MERGE security/nextjs-15-upgrade | Merge Next.js 15 upgrade PR to main |
| A6 | APPROVE REWRITE — git history purge | Requires git filter-repo; destructive; creates new commit SHAs; all forks must re-clone |
| A9 | Decide Next.js version target | 15.x (document residual risk) vs 16.4.0 (clears all CVEs, breaking changes possible) |
| — | Write `AGENTS.md` to replace stale `GEMINI.md` | Unified agent instruction file; no secret file references |
| — | Set up automated backup schedule | Weekly cron using existing SOP script |
| — | Investigate record count discrepancy | 3,886 (manifest) vs 3,475 (DB) vs 3,474 (prior commit) |
| A8 | Keith decides: quarantine or delete the 1 MarketData row | Delete only with explicit approval |

## Phase 4 — Product Roadmap

Once security branch merged and containment clean:

| Feature | Description |
|---------|-------------|
| Scanner integration | Gemini CLI pipeline for card ID from photos → `feature/scanner` |
| Market pricing | Real SportsCardsPro price pulls replacing the quarantined scrape route |
| Mobile UI | Antigravity IDE → `feature/ui` — mobile-first card browser |
| ACoolOMNI wiring | Connect ACoolCOMMANDER routing to ACoolCOLLECTOR endpoints |
| Analytics | ACoolANALYST dashboard over Item + MarketData tables |

## Command Reference

```bash
# Check current branch
git -C /Users/acoolnerd/ACool/repos/ACoolCOLLECTOR branch --show-current

# Container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Quick functional test
curl -s http://localhost:8000/api/v1/items?limit=1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'total={d[\"total\"]} items')"

# MCP health
acool-mcp doctor

# Run backup
source ~/ACool/repos/ACoolCOLLECTOR/docs/ACoolBACKUP_Recovery_SOP.md
```
