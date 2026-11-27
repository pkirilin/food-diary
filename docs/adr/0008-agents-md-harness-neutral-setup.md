# AGENTS.md is the harness-neutral agent setup

Status: accepted (2026-11-27)

Development happens in coding agents, and it moved to OpenCode while the setup stayed coupled to
Claude Code: the root rules file was named `CLAUDE.md`, the per-area rules lived in the Claude-only
`.claude/rules/` directory keyed by vendor frontmatter, permissions existed only in Claude's
settings, and the product strategy sat at the root as `STRATEGY.md`. The same repository therefore
produced different agent behavior depending on which CLI launched it, and every rules edit risked
drifting between the two setups.

The setup is now harness-neutral, with each harness-specific piece kept as a small, deliberate
mirror:

- **`AGENTS.md` is the single root rules file.** OpenCode V2 reads it natively; Claude Code has
  since v2.1.277 through a built-in plugin, and the installed version (2.1.332) qualifies. The repo
  `CLAUDE.md` is deleted outright. Session-level context stays inline; conditional rules moved out
  (next point); `docs/agents/strategy.md` — `STRATEGY.md` moved under the `docs/agents/` naming
  convention — is referenced from it in both places it was cited.
- **Per-area rules are plain markdown in `docs/agents/`** (`frontend.md`, `backend.md`,
  `coding.md`, moved from `.claude/rules/`). Claude's `paths:` frontmatter auto-attachment is
  dropped; `AGENTS.md` carries explicit triggers instead — read the frontend rules before changing
  frontend code, the backend rules before backend work, the coding rules before finishing any task.
  Losing mechanical injection is the accepted price of one canonical source.
- **MCP configs stay duplicated.** Claude reads `.mcp.json` only and OpenCode reads `opencode.json`
  only; one stdio server is ~15 lines per side, so the files remain intentional mirrors, with the
  keep-in-sync note and the field mapping written into `AGENTS.md`.
- **Permissions are translated, not shared**, because the engines are opposites: Claude evaluates
  deny → ask → allow with the first match winning, OpenCode evaluates an ordered array with the
  last match winning over an allow-everything base policy. `opencode.json` recreates Claude's
  posture with a broad shell `ask` before the specific allows, adds `rm` and `git push` asks, and
  denies the secret carriers Claude denies — `.env`, the `.env.local` family, `secrets/` —
  generalized to any directory at any depth. It also asks before touching paths outside the
  workspace — the one place OpenCode is deliberately stricter than Claude, since Claude has no such
  gap to close — except for the system temp directories (`/private/var/folders`,
  `/private/tmp`), which stay exempt so agent scratch files never prompt. The
  committed env files stay readable: `deploy/.env.example` through the base policy's own allow,
  `tests/.env` and the frontend `.env.development` / `.env.test` through explicit allows after the
  denies, so nothing this repository commits is blocked.
  The four stale `mcp__github_com_github_github-mcp-server__*` ask rules left
  `.claude/settings.json`: the server they name is configured nowhere.
- **Skills stay in `.claude/skills/`.** Both harnesses read that path (OpenCode as a documented
  compatibility source) and the skills conform to the shared Agent Skills spec. A committed
  `.agents/skills` symlink points at the real directory as the neutral path for future tools.

## Consequences

Rules edits land once, in `AGENTS.md` and the `docs/agents/` files; there is nothing to mirror.
Claude sessions no longer receive the frontend or backend rules automatically on touching a
matching file — they follow the triggers in `AGENTS.md`. Adding an MCP server means editing two
small files. The absence of `CLAUDE.md` and `.claude/rules/` is the decision, not an accident:
restoring either would reintroduce the divergence this decision removes.

## Considered options

**A thin `CLAUDE.md` shim holding `@AGENTS.md`.** Claude's docs bless it and it covers Claude
versions without native `AGENTS.md` support, but it keeps a vendor-named file alive where the
installed version reads `AGENTS.md` directly, and it invites edits landing in the wrong one of two
root files.

**Folding the rules files into `AGENTS.md`.** One file to read, but the frontend rules alone are
~120 lines, and loading them into every session — backend and docs work included — buys nothing;
per-topic pages also render and print better outside an agent.

**Making `.agents/skills/` the real directory and symlinking `.claude/skills` to it.** Inverts the
dependency: Claude Code documents only `.claude/skills`, so its reads would depend on symlink
support (which also breaks on Windows checkouts), while OpenCode reads both paths natively.
