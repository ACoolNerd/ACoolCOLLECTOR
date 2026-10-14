# ACool Agent Coordination Protocol

**Date:** 2026-10-13  
**Authority:** ACoolCOMMANDER (ACoolOMNI routing rules)  
**Principle:** One write owner per task. Agents review via separate branches or worktrees. Never share live secrets.

---

## Agent Responsibility Matrix

| Agent | Primary Role | Write Scope | Cannot Do | Current Status |
|-------|-------------|-------------|-----------|----------------|
| **Claude Code** | Lead engineer — security, implementation, infra, git branches | Feature branches → PRs only | Merge to main, push to main, delete data, rotate credentials, make repo private | ACTIVE |
| **Claude Desktop** | Project assessment, executive review, planning, documentation | Read-only review | No code writes | ACTIVE |
| **Codex CLI** | Independent PR reviewer, test author | Review comments, test files on separate branch | Merge, write to main | NEEDS AUTH SETUP |
| **Gemini CLI** | Scanner/vision track — card ID, market pricing, extraction schema | `feature/scanner` branch | Infrastructure, secrets, DB writes | ACTIVE (instructions stale — needs update) |
| **Antigravity IDE** | UI development, visual inspection, mobile client | `feature/ui` branch | Infrastructure, secret files | ACTIVE (123 extensions, Docker connected) |
| **Hermes Agent** | Ops observer — health probes, acool-mcp doctor runs, status reports | Read-only | No repo writes, no DB writes | ACTIVE |
| **OpenClaw** | Unassigned | None | — | NOT INSTALLED — on hold |
| **ChatGPT** | Strategic governance, cross-project synthesis | Advisory only | No code/data writes | External — no direct access |
| **Keith (owner)** | All approvals, provider actions, GitHub settings, merge decisions | Unrestricted | — | Active |

## Task Ownership Rules

1. **One branch, one writer.** Two agents never write to the same branch simultaneously.
2. **Reviewers use separate worktrees** or clone the PR branch read-only.
3. **No shared live secrets.** Each agent reads from its own configured source (Keychain, env files, MCP).
4. **Merge decisions are Keith's.** No agent merges to `main` without `APPROVE MERGE <branch>` reply.
5. **History rewrites require explicit `APPROVE REWRITE` command.**
6. **Data deletes require explicit `APPROVE DELETE <description>`.** Quarantine first, delete later.

## Canonical Source of Truth

- **Code:** `https://github.com/ACoolNerd/ACoolCOLLECTOR` (main branch, after containment)
- **Local canonical:** `/Users/acoolnerd/ACool/repos/ACoolCOLLECTOR`
- **Staging (retired):** `/Users/acoolnerd/Downloads/ACoolCOLLECTOR` — DELETED, do not use
- **Handoff docs:** `docs/PROJECT_HANDOFF.md` — updated each session
- **Multi-AI routing:** `/Users/acoolnerd/ACool/platform/ACoolOMNI/commander/routing-rules.json`

## Agent Instruction Files (Current State)

| File | Contents | Status |
|------|----------|--------|
| `GEMINI.md` (repo root) | Scanner instructions, env setup guide | STALE — tells agents to put keys in `.env.local` (caused the leak); references Flutter UI and pre-migration CSV |
| `CLAUDE.md` (global `~/.claude/`) | ACoolOPERATING system prompt | CURRENT |
| `AGENTS.md` | Not present in repo | MISSING |
| Codex instructions | Not present in repo | MISSING |

**Action required:** Replace `GEMINI.md` with a unified `AGENTS.md` that applies to all agents. Content must be consistent across Claude Code, Codex, and Gemini. No agent file should reference tracked secret files.

## Handoff Protocol

At end of each session, Claude Code updates `docs/PROJECT_HANDOFF.md` with:
- Verified state (not recap)
- Branch and commit hashes
- Pending approvals required
- Blockers
- Next executable action

Claude Desktop reads `PROJECT_HANDOFF.md` before any executive review to avoid contradicting verified local state.

## Approval Gate IDs (Active)

| ID | Action | Owner | Status |
|----|--------|-------|--------|
| A1 | Rotate SportsCardsPro key at provider | Keith | PENDING |
| A2 | Make GitHub repo private | Keith | PENDING |
| A3 | Branch protection + secret scanning | Keith | PENDING |
| A4 | APPROVE PHASE 2 — containment PR | Keith | PENDING |
| A5 | APPROVE MERGE security/nextjs-15-upgrade | Keith | PENDING |
| A6 | APPROVE MERGE security/containment-2026-10 | Keith | PENDING (branch not yet created) |
| A7 | APPROVE REWRITE — git history purge | Keith | PENDING |
| U1-U5 | Toolchain updates | Keith | PENDING |
