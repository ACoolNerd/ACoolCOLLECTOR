# ACool AI Toolchain Registry

**Last verified:** 2026-10-13  
**Source:** Live `--version` output from `/Users/acoolnerd` environment

---

## Installed Tools

| Tool | Binary | Installed | Latest | Status | Auth | Update Command |
|------|--------|-----------|--------|--------|------|----------------|
| Claude Code | `~/.local/bin/claude` | 2.1.179 | **2.1.296** | OUTDATED | Active | `claude update` |
| Gemini CLI | `~/.nvm/.../gemini` | 0.62.0 | **0.64.0** | OUTDATED | Active | `npm install -g @google/gemini-cli@latest` |
| Codex CLI | `~/.nvm/.../codex` | 0.159.0 | **0.162.1** | OUTDATED | Pending verification | `npm install -g @openai/codex` |
| Hermes Agent | `~/.local/bin/hermes` | 0.13.0 (2026.5.7) | Unknown | UNVERIFIED | Active | `hermes update --check` then `hermes update --backup` |
| GitHub CLI | `/usr/local/bin/gh` | 2.101.0 | Likely current | OK | Active (PAT in Keychain) | `brew upgrade gh` |
| Docker | `/usr/local/bin/docker` | 29.8.2 | Likely current | OK | Active | Docker Desktop auto-update |
| acool-mcp | `~/.local/bin/acool-mcp` | Active | — | OK | — | N/A |
| Node.js | `~/.nvm/.../node` | v22.23.0 | LTS | OK | — | `nvm install --lts` |
| npm | `~/.nvm/.../npm` | 10.9.8 | Likely current | OK | — | Auto with Node |
| OpenClaw | — | NOT INSTALLED | — | MISSING | — | Undefined |
| Antigravity IDE | App bundle | Active | — | OK (123 extensions) | Active | App store / bundle |

## MCP Server Status (acool-mcp doctor)

| Server | Status | Notes |
|--------|--------|-------|
| filesystem-kind | LIVE | v1.0.0 |
| filesystem-luxury | LIVE | v1.0.0 |
| github | LIVE | v2.0.2 |
| postgres | HELD | Intentionally disabled |
| supabase | HELD | Intentionally disabled |
| mux | HELD | Intentionally disabled |
| playwright | HELD | Intentionally disabled |

## Client Configs (from acool-mcp doctor)

| Client | Config | Servers |
|--------|--------|---------|
| Claude Desktop | valid | 7 |
| Gemini CLI | valid | 4 |
| Antigravity IDE | valid | 33 |
| Antigravity Legacy | valid | 43 |

## Updates Requiring Authorization

All updates below require explicit approval before execution:

| ID | Tool | Action | Risk |
|----|------|--------|------|
| U1 | Claude Code | `claude update` (2.1.179 → 2.1.296) | Low — same major version |
| U2 | Gemini CLI | `npm install -g @google/gemini-cli@0.64.0` | Low |
| U3 | Codex CLI | `npm install -g @openai/codex@0.162.1` | Low — verify auth after |
| U4 | Hermes | `hermes update --backup` | Medium — back up profiles first |
| U5 | OpenClaw | Define role before installing | High — unknown package |

## Notes

- Claude Code binary at `~/.local/bin/claude` but npm view shows a different registry path — the update path via `claude update` is canonical.
- Codex CLI auth requires `OPENAI_API_KEY` in environment or Keychain. Verify before using.
- OpenClaw: no evidence of a known, installable package at this name. Do not install without official source confirmation.
- Hermes at `~/.hermes/hermes-agent` — back up project profiles before updating.
