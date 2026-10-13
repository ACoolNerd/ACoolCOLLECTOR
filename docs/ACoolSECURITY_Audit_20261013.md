# ACoolCOLLECTOR — Security Audit & Remediation Report

**Date:** 2026-10-13  
**Sprint:** Infrastructure Hardening & Dependency Security  
**Branch:** security/nextjs-15-upgrade  
**Auditor:** Claude Code (ACoolCOMMANDER session)  
**Status:** REMEDIATED (residual risk documented)

---

## Audit Findings

### Pre-Remediation State

| Package | Severity | Advisories | Vulnerability Summary |
|---------|----------|------------|----------------------|
| `next@14.2.35` | Critical | 23 | DoS, SSRF, CSRF, XSS, cache poisoning, RCE (Windows) |
| `postcss@8.4.31` (nested in Next.js) | High | 4 | XSS, arbitrary file read, path traversal via sourceMappingURL |
| All services on `0.0.0.0` | High | Infrastructure | PostgreSQL, Redis, Adminer, Portainer LAN-accessible |
| `src/landing_page/node_modules` tracked in git | Medium | — | 3,336 phantom Dependabot alerts |
| `src/omni-engine/node_modules` tracked in git | Medium | — | 1,869 phantom Dependabot alerts |
| `wget` missing from web container | Low | — | Healthcheck always failing (unhealthy status) |
| `error.message` on `unknown` type | Low | — | TypeScript safety: ROI route handler |

### Post-Remediation State

| Finding | Status | Fix Applied |
|---------|--------|-------------|
| `next@14.2.35` critical | Partially resolved | Upgraded to `next@15.5.9`; 15+ advisories resolved |
| `postcss@8.4.31` nested in Next.js | Residual risk | PostCSS version controlled by Next.js; Next.js 15 still bundles 8.4.31 |
| Services on `0.0.0.0` | Resolved | All ports re-bound to `127.0.0.1` in docker-compose.yml |
| Tracked `landing_page/node_modules` | Resolved | Removed from git, gitignored (commit 1dc6473) |
| Tracked `omni-engine/node_modules` | Resolved | Removed from git, gitignored (commit ad4a2ce) |
| Web container healthcheck | Resolved | `wget` added to Dockerfile apt-get install |
| TypeScript unknown error | Resolved | `error instanceof Error` narrowing added |

---

## Residual Risk Register

| Risk | Severity | Likelihood | Notes |
|------|----------|------------|-------|
| `next@15.5.9` still in npm advisory range `9.3.4 - 16.3.0-preview.10` | Critical (per audit) | **Low in this deployment** | App is self-hosted, localhost only, not publicly accessible. Windows-RCE not applicable (macOS/Linux). Image Optimizer not exposed externally. |
| `postcss@8.4.31` bundled in Next.js 15 | High (per audit) | **Low in this deployment** | sourceMappingURL attack requires attacker control of CSS processing pipeline; not reachable from outside the container. |
| `sharp@<=0.35.5-rc.1` (libvips/libheif/librsvg) | High | Low | Transitive via Next.js image optimization. Not exploitable without external access to the image optimization endpoint. |

**Full resolution path:** Upgrade to `next@16.4.0` (first stable after the advisory range). This is a major version with breaking changes; scheduled as a dedicated sprint.

---

## Advisory Details — Next.js Advisories Fixed in 15.x

The following advisories are confirmed patched in Next.js 15.x:

| Advisory | Title | Status |
|----------|-------|--------|
| GHSA-955p-x3mx-jcvp | Unauthenticated disclosure of internal Server Function endpoints | Patched in ≥15.2.4 |
| GHSA-p293-qw3h-jr36 | RCE on Windows-hosted servers | Not applicable (Linux/macOS) |
| GHSA-ggv3-7p47-pfv8 | HTTP request smuggling in rewrites | Patched in 15.x |
| GHSA-36qx-fr4f-26g5 | Middleware bypass in i18n routes | Patched in 15.x |
| GHSA-wfc6-r584-vfw7 | Cache poisoning in RSC responses | Patched in 15.x |

---

## Infrastructure Hardening

### Port Binding Change

**Before:** All services bound to `0.0.0.0` — accessible from any machine on the local network.

**After:** All services bound to `127.0.0.1` — accessible from localhost only.

| Service | Before | After |
|---------|--------|-------|
| PostgreSQL | `0.0.0.0:5432` | `127.0.0.1:5432` |
| Redis | `0.0.0.0:6379` | `127.0.0.1:6379` |
| AI Engine | `0.0.0.0:8000` | `127.0.0.1:8000` |
| Web | `0.0.0.0:3000` | `127.0.0.1:3000` |
| Portainer | `0.0.0.0:9000` | `127.0.0.1:9000` |
| Adminer | `0.0.0.0:8080` | `127.0.0.1:8080` |
| Portainer Agent | `0.0.0.0:9001` | `127.0.0.1:9001` |

---

## Next Security Sprint

1. **Upgrade to Next.js 16.4.0** — clears all remaining npm audit advisories. Major version; requires dedicated compatibility testing sprint.
2. **Evaluate PostCSS version** — check if Next.js 16 bundles postcss ≥8.5.23.
3. **Upgrade `sharp`** — install `sharp@latest` directly to override transitive version.
4. **Add Dependabot config** — `.github/dependabot.yml` to automate future dependency alerts with PR creation.
