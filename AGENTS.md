# ACoolCOLLECTOR — Agent Instructions

**Applies to:** Claude Code, Gemini CLI, Codex CLI, Antigravity IDE, Hermes, and any other AI agent working on this project.

---

## Canonical Repository

```
/Users/acoolnerd/ACool/repos/ACoolCOLLECTOR
```

All git operations, file reads, and writes must target this path.
The `~/Downloads/ACoolCOLLECTOR` staging copy was retired — do not use it.

---

## Secret Management — Critical Rule

**NEVER put API keys, passwords, or tokens in any file that could be tracked by git.**

| Where to store secrets | How to inject them |
|---|---|
| macOS Keychain | `security find-generic-password -s "KEY_NAME" -w` |
| `.env` file (gitignored) | Referenced by docker-compose.yml via `${VAR}` |
| `.env.local` (gitignored) | Referenced by Next.js via `process.env.VAR` |

`.env.example` lists all required key names with empty values — copy it to `.env` and fill in values locally. Never commit the filled-in file.

**If you add a new secret, add its name to `.env.example` only — not its value.**

---

## Stack Reference (current as of 2026-10-13)

| Component | Technology | URL |
|---|---|---|
| Frontend | Next.js 15.5.9 (App Router) | http://localhost:3000 |
| API | FastAPI + SQLAlchemy (Python) | http://localhost:8000 |
| Database | PostgreSQL 15 via Prisma | localhost:5432 |
| Cache | Redis 7 (auth-protected) | localhost:6379 |
| Container mgmt | Portainer 2.27.2 | http://localhost:9000 |
| DB admin | Adminer 4 | http://localhost:8080 |

All ports are bound to `127.0.0.1` — localhost only, not LAN-accessible.

Docker Compose canonical file: `docker-compose.yml` in the project root.
All secrets are injected via `.env` (gitignored). Reference `.env.example` for key names.

---

## Data Source (current)

The canonical data store is **PostgreSQL** (`acool_paas` database, `acool_admin` role).

- **3,475 Item records** loaded as of 2026-10-13
- Schema managed by Prisma: see `prisma/schema.prisma`
- The CSV files in `data/raw/` and `data/processed/` are source archives — not the live truth
- The legacy SportsCardsPro API adapter has been removed; the engine is provider-independent

---

## Write Ownership

One agent writes to one branch at a time. Never write to `main` directly.

| Agent | Owns | Branch pattern |
|---|---|---|
| Claude Code | Security, infra, FastAPI, migrations | `security/*`, `feature/*` |
| Gemini CLI | Scanner track, card ID, market pricing | `feature/scanner` |
| Codex CLI | Independent PR review, test files | Review only |
| Antigravity | UI/UX, mobile client | `feature/ui` |

All merges to `main` require Keith Z. C. McPherson's explicit approval.

---

## Approval Gate — Hard Rules

Do not take any of these actions without Keith's exact reply `APPROVE <ID>`:

- Merge any branch to `main`
- Push to `main` or force-push any branch
- Rewrite git history
- Delete database rows
- Rotate credentials
- Deploy to production
- Make repo public/private

---

## Naming Conventions

- Critical ACoolCOLLECTOR components prefix with `ACool` (e.g., `ACoolPRICING_Engine`)
- Database tables: PascalCase matching Prisma schema
- API routes: `/api/v1/<resource>`
- Feature branches: `feature/<short-description>`
- Security branches: `security/<description>`

---

## Architecture Principles

- **Provider-independent**: No single external data source is required to run the app. Adapters are replaceable.
- **7-Field Schema**: All DB entities require `id`, `entity`, `type`, `name`, `status`, `owner`, `updatedAt`. Domain fields in `metadata` JSONB.
- **Idempotent upserts**: `ON CONFLICT (id) DO UPDATE SET ...` for all bulk imports.
- **Localhost-only ports**: All Docker services bind to `127.0.0.1`. Never expose to `0.0.0.0`.

---

## Daily Check Commands

```bash
# Containers
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Inventory count
docker exec acool_db psql -U acool_admin -d acool_paas -c 'SELECT COUNT(*) FROM "Item";'

# MCP health
acool-mcp doctor

# Redis connectivity (with auth)
docker exec acool_redis redis-cli -a "${REDIS_PASSWORD}" ping
```

---

*GEMINI.md is superseded by this file. All new agent instructions go here.*
