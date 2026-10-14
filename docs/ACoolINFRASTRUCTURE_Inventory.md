# ACoolCOLLECTOR — Infrastructure Inventory

**Date:** 2026-10-13  
**Verified by:** Claude Code session  
**Status:** All services operational

---

## Docker Compose Services

| Container | Image | Port | Status | Role |
|-----------|-------|------|--------|------|
| `acool_db` | postgres:15-alpine | 127.0.0.1:5432 | healthy | Primary PostgreSQL database |
| `acool_redis` | redis:7-alpine | 127.0.0.1:6379 | healthy | Cache layer |
| `acool_ai_engine` | ./Dockerfile | 127.0.0.1:8000 | healthy | FastAPI inventory API |
| `acool_web` | ./apps/web/Dockerfile | 127.0.0.1:3000 | starting→healthy | Next.js 15 frontend |
| `acool_portainer` | portainer/portainer-ce | 127.0.0.1:9000 | running | Docker management UI |
| `acool_adminer` | adminer:4 | 127.0.0.1:8080 | running | Database admin UI |
| `acool_portainer_agent` | portainer/agent:2.45.2 | 127.0.0.1:9001 | running | Portainer local agent |

## Docker Volumes

| Volume | Driver | Contents |
|--------|--------|----------|
| `acoolcollector_postgres_data` | local | PostgreSQL data directory — 3,475 Item records + MarketData |
| `acoolcollector_portainer_data` | local | Portainer configuration and API keys |
| `acoolcollector_web_next` | local | Next.js `.next` build cache |
| `acoolcollector_web_node_modules` | local | Node.js dependencies |

## Persistence Paths

- PostgreSQL data: Docker volume `acoolcollector_postgres_data` (survives container restart)
- Backups: `~/ACool/backups/acoolcollector/` (host filesystem, outside git)

## Portainer Configuration

- URL: http://localhost:9000
- Environment ID: 3 (not default 1)
- API key: macOS Keychain → `PORTAINER_API_KEY`

## MCP Configuration

| Server | Status | Notes |
|--------|--------|-------|
| filesystem-kind | Active | |
| filesystem-luxury | Active | |
| github | Active | Reauthenticated 2026-10-12 |
| postgres | Held/disabled | Intentional |
| supabase | Held/disabled | Intentional |
| mux | Held/disabled | Intentional |
| playwright | Held/disabled | Intentional |

## Network

- Docker network: `acoolcollector_acool-network` (bridge)
- All containers communicate over Docker network (no host routing needed)
- All host port bindings: `127.0.0.1` only (LAN-isolated)

## Key Credentials (locations only — never stored in git)

| Credential | Location |
|------------|----------|
| PostgreSQL password | `.env` (gitignored) + macOS Keychain |
| Portainer API key | macOS Keychain → `PORTAINER_API_KEY` |
| OpenAI API key | macOS Keychain → `OPENAI_API_KEY` |
| GitHub PAT | macOS Keychain → `GITHUB_PERSONAL_ACCESS_TOKEN` |
