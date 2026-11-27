# Harness-agnostic agentic setup research

Research date: **2026-11-26**. All claims about harness behavior were verified against official
documentation on that date (AGENTS.md / agentskills.io specs, OpenCode V2 docs, Claude Code docs).
Config and file-layout claims were verified by reading this repository and the user-level configs
directly. Nothing was changed outside this file.

---

## 1. Bottom line

1. **`AGENTS.md` is the right shared root rules file, and both target harnesses read it
   natively.** OpenCode V2's native instruction file is `AGENTS.md`
   (https://opencode.ai/docs/instructions/); `CLAUDE.md` is only a *compatibility fallback* there.
   Claude Code ≥ v2.1.277 reads `AGENTS.md` directly through a built-in plugin
   (https://code.claude.com/docs/en/memory.md, "AGENTS.md" section). Claude's own docs bless the
   exact pattern this repo needs: keep `AGENTS.md` as the source of truth and put a one-line
   `@AGENTS.md` import in a thin `CLAUDE.md` next to it.

2. **Skills need zero migration.** Both harnesses implement the same Agent Skills spec
   (https://agentskills.io/specification.md: a `<skill>/SKILL.md` with `name` + `description`
   frontmatter). OpenCode V2 has *explicit project compatibility discovery* of `.claude/skills/`
   (https://opencode.ai/docs/skills/, "Discovery" table) and even understands Claude's
   `disable-model-invocation` field. The repo's three `.claude/skills/*` stay where they are and
   work in both. The repo's skills use only `name` + `description` — fully spec-portable.

3. **MCP configuration cannot be shared — two small files must coexist.** Claude Code reads
   project MCP servers only from `.mcp.json` (https://code.claude.com/docs/en/mcp.md, "MCP
   installation scopes"); OpenCode reads them only from its own `opencode.json(c)` under
   `mcp.servers` (https://opencode.ai/docs/mcp-servers/). Neither reads the other's file. The
   field translation is mechanical for the stdio chrome-devtools server the repo already
   duplicates (§7 mapping). Remote MCP servers live at user level in OpenCode global config
   (env refs only — no secrets in files), with Streamable HTTP + PKCE/CIMD/DCR OAuth; Claude
   Code's equivalent is user-scope config plus its `/mcp` OAuth flow.

4. **Permissions are structurally different — translate, don't share.** Claude: `settings.json`
   `permissions.{allow,deny,ask}` string rules, evaluated **deny → ask → allow, first match
   wins** (https://code.claude.com/docs/en/permissions.md). OpenCode V2: an *ordered array* of
   `{action, resource, effect}` rules, **last matching rule wins**, and the built-in default
   policy *allows everything* except asking for `.env` reads
   (https://opencode.ai/docs/permissions/). A naive copy would make OpenCode far more permissive
   than Claude's `default` mode; §8 gives the exact translation for this repo's rules.

5. **`.claude/rules/` is Claude-only glue.** OpenCode does not discover `.claude/rules/` — its
   compat layer covers `CLAUDE.md` and `.claude/skills`, not rules
   (https://opencode.ai/docs/instructions/, "CLAUDE.md fallback"; https://opencode.ai/docs/skills/,
   "Discovery"). Options: keep them as Claude glue (the root rules file already tells any agent
   to *read* `frontend.md`/`backend.md`, which works harness-agnostically), and/or list them in
   OpenCode's `instructions` array — but that loses Claude's `paths:` front-matter scoping
   (https://code.claude.com/docs/en/memory.md, "Path-specific rules") and loads them every
   session.

6. **STRATEGY.md → `docs/agents/strategy.md`.** Every other file in `docs/agents/` is a
   lowercase kebab-case single-topic name (`browser-verification.md`, `domain.md`,
   `issue-tracker.md`, `triage-labels.md`, `writing-docs.md`); the strategy doc is agent-facing
   guidance that gates feature decisions, so `strategy.md` fits the convention. Reference it from
   the root rules file (two places currently cite `STRATEGY.md`, both in the repo `CLAUDE.md`).

7. **The premise in the task note needs one correction:** the *repo* `CLAUDE.md` does **not**
   import `@RTK.md`. That import lives in the *user-level* `~/.claude/CLAUDE.md`, with
   `RTK.md` at `~/.claude/RTK.md` (verified on disk). The repo file is fully self-contained, so
   moving it to `AGENTS.md` carries no dangling references. User-level parity is mostly free:
   OpenCode also reads `~/.claude/CLAUDE.md` and `~/.claude/skills/` as compatibility sources.

8. **Future-harness portability is already cheap if we adopt AGENTS.md + SKILL.md.** The
   AGENTS.md standard (now stewarded by the Agentic AI Foundation under the Linux Foundation) is
   read by Codex, Cursor, Gemini CLI, Copilot coding agent, Zed, Aider, goose, Amp, Devin,
   Windsurf, and OpenCode, per https://agents.md. What remains harness-specific after this
   migration is only: permissions format, `.mcp.json`/`opencode.json` MCP glue, and
   `.claude/rules/` path-scoping — all small, documented, and per-harness by design.

---

## 2. Current repo state (verified by inspection)

| File | Contents | Committed |
|---|---|---|
| `CLAUDE.md` | Full project rules (108 lines). Header says "guidance to Claude Code". References `STRATEGY.md` (lines 7, 79), `.claude/rules/frontend.md` (line 24), `docs/agents/*.md`, `CODING_STANDARDS.md`. **No `@`-imports.** | yes |
| `.claude/rules/frontend.md` | Path-scoped rule, frontmatter `paths: ['*.ts', '*.tsx']` | yes |
| `.claude/rules/backend.md` | Path-scoped rule, `paths: ['*.cs', '*.csproj', '**/Directory.Build.props', '**/Directory.Packages.props']` | yes |
| `.claude/rules/coding.md` | No frontmatter → loads every Claude session; mostly duplicates/points to `CODING_STANDARDS.md` | yes |
| `.claude/settings.json` | `enabledMcpjsonServers: ["chrome-devtools"]` + `permissions.allow/deny/ask` (git/yarn/dotnet/rg/fd allows; `.env`/`secrets/**` read denies; `rm`/`git push`/4 stale github-MCP-tool asks) | yes |
| `.claude/settings.local.json` | `defaultMode: "auto"`, extra `rtk`/obsidian allows, `enableAllProjectMcpServers: true` | **no** (ignored via user-level global gitignore `**/.claude/settings.local.json`) |
| `.claude/skills/{draft-pr-description,draft-release-changelog,update-screenshots}/SKILL.md` | Agent Skills; frontmatter `name` + `description` only; `update-screenshots` bundles `assets/` images | yes |
| `.mcp.json` | `mcpServers.chrome-devtools`: `type: "stdio"`, `command: "npx"`, `args: [chrome-devtools-mcp@latest, --isolated, --headless, --no-usage-statistics, --no-performance-crux]`, `env: {}` | yes |
| `opencode.json` | `mcp.servers.chrome-devtools`: `type: "local"`, `command: [npx, …same flags]`. **No `permissions`, no `instructions`** | yes |
| `STRATEGY.md` (root) | 48-line product strategy with frontmatter `name: Food Diary`, `last_updated` | yes |
| `docs/agents/` | `browser-verification.md`, `domain.md`, `issue-tracker.md`, `triage-labels.md`, `writing-docs.md` — all lowercase kebab-case | yes |

References to update when renaming: `CLAUDE.md` lines 7 and 79 (only live references to
`STRATEGY.md` in the repo); `docs/agents/writing-docs.md` line 3 lists `CLAUDE.md` as a prose
surface; `docs/agents/browser-verification.md` line 7 points at the chrome-devtools server *from
`.mcp.json`* only (should mention `opencode.json` too). `docs/adr/0001-…md` mentions `CLAUDE.md`
historically — ADRs are immutable records; leave it.

User-level state (context for the acceptance criteria, nothing to commit):
`~/.claude/CLAUDE.md` imports `@RTK.md`; `~/.claude/skills/` holds `synced/` (claude.ai sync),
`visual-recap`, `vkusvill-cart`; `~/.config/opencode/opencode.json` defines a custom provider and
three **remote** MCP servers — vkusvill and food-diary with OAuth client refs from environment
variables (`{env:…}` placeholders), and z.ai web search with an `Authorization` header from an env
ref and `oauth: false`. No secret values are stored in any config file.

---

## 3. AGENTS.md — the shared rules file

### 3.1 The standard

- Format: "just standard Markdown", no required fields, root of the repo, nested files for
  subprojects; "The closest AGENTS.md to the edited file wins" — https://agents.md (FAQ).
- Emerged from OpenAI Codex / Amp / Jules / Cursor / Factory; "now stewarded by the Agentic AI
  Foundation under the Linux Foundation" — https://agents.md ("About").
- Adopters listed on the page include Codex, Jules, Factory, Aider, goose, **opencode**, Zed,
  Warp, VS Code, Devin, Cursor, Amp, RooCode, Gemini CLI, GitHub Copilot coding agent, Windsurf,
  Kilo Code, Ona, Augment (each linking its own docs page).

### 3.2 OpenCode V2 behavior (native)

From https://opencode.ai/docs/instructions/ (the `/docs/rules/` URL used by agents.md redirects
here — verified: `curl -L https://opencode.ai/docs/rules/` → 200 at `/docs/instructions/`):

- OpenCode loads a global `~/.config/opencode/AGENTS.md` (if present), then every `AGENTS.md`
  from the workspace directory upward to the project root; files are *combined*, conflicts are
  not resolved.
- Nested `AGENTS.md` files are discovered lazily as the agent reads into subdirectories.
- **CLAUDE.md fallback**: in any directory without an `AGENTS.md`, OpenCode reads `CLAUDE.md`
  instead; without a global `~/.config/opencode/AGENTS.md` it reads `~/.claude/CLAUDE.md`.
  "A directory's `AGENTS.md` always wins over its `CLAUDE.md`, so a symlink between the two loads
  once." Env flags: `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT=1` skips every `CLAUDE.md`;
  `OPENCODE_DISABLE_CLAUDE_CODE=1` also skips `.claude` skills;
  `OPENCODE_DISABLE_PROJECT_CONFIG=1` skips project `AGENTS.md` discovery.
- **Consequence for this repo**: once an `AGENTS.md` exists at the repo root, OpenCode reads
  *only* it and ignores the repo `CLAUDE.md`. The fallback overlap cannot double-load.
- The `instructions` config array adds extra files/globs/URLs, loaded *after* discovered
  `AGENTS.md` files, in listed order; relative globs are searched from the workspace up to the
  project root; entries update live when the files change
  (https://opencode.ai/docs/instructions/, "Configuration").

### 3.3 Claude Code behavior (native since v2.1.277)

From https://code.claude.com/docs/en/memory.md, "AGENTS.md" section:

- "Reading `AGENTS.md` directly requires Claude Code v2.1.277 or later." It is implemented by a
  built-in plugin `cc-plugin-agents-md@builtin`.
- **Default** ("Project instructions" = `claude-md-or-agents-md`): Claude reads `AGENTS.md` *only
  when there is no `CLAUDE.md`/`.claude/CLAUDE.md`/`CLAUDE.local.md` in the working directory or
  above*. `~/.claude/CLAUDE.md` and managed `CLAUDE.md` **do not count** against this check, so
  the user's personal `~/.claude/CLAUDE.md` does not block repo `AGENTS.md` loading.
- Setting `claude-md-and-agents-md` makes Claude read both; it can be set via `/config`, or in a
  settings file under `pluginConfigs["cc-plugin-agents-md@builtin"].options.instructionFiles` —
  **but Claude reads that key only from `~/.claude/settings.json`, a `--settings` file, or
  managed settings, and ignores it in project settings** (explicitly documented). So a repo
  cannot force "both" on its contributors via `.claude/settings.json`.
- Not read: `AGENTS.local.md`, `AGENTS.override.md`, anything under `.agents/`.
- `AGENTS.md` files support the same `@path` import expansion as `CLAUDE.md` (max depth 4 hops)
  when Claude reads them.

### 3.4 Recommended pattern: AGENTS.md as source of truth + thin CLAUDE.md shim

Claude's docs have a section for exactly this, "Share one file with other coding tools"
(https://code.claude.com/docs/en/memory.md):

> "putting an `@AGENTS.md` import in a `CLAUDE.md` next to it" — for repos that also keep a
> `CLAUDE.md` or sessions that can't load `AGENTS.md` directly; and:
> "A `CLAUDE.md` containing `@AGENTS.md`: you can leave it. Keeping the import never makes Claude
> read `AGENTS.md` twice."

A `CLAUDE.md` symlink to `AGENTS.md` is the documented alternative, but the docs warn it breaks
on Windows clones (symlink checkout) and that Edit/Write refuse to write through the symlink.
The `@AGENTS.md` import has none of those problems.

Resulting load behavior, both harnesses, exactly once:

| Harness | Root files present | What loads |
|---|---|---|
| OpenCode V2 | `AGENTS.md` + shim `CLAUDE.md` | `AGENTS.md` ("AGENTS.md always wins"); the shim is ignored |
| Claude Code ≥ 2.1.277 | `AGENTS.md` + shim `CLAUDE.md` | `CLAUDE.md` first, then `AGENTS.md` via the `@` import |

---

## 4. OpenCode V2 config surface (what the repo's `opencode.json` can hold)

From https://opencode.ai/docs/config/:

- File: `opencode.json` or `opencode.jsonc` at project root **or** `.opencode/opencode.json(c)`;
  global at `~/.config/opencode/opencode.json(c)`; JSONC (comments/trailing commas) supported —
  the user's global config already uses trailing commas.
- Precedence: global < project root < nearest discovered config < system dir. Every discovered
  `.opencode/` config overrides every direct config.
- **Variables**: `{env:NAME}` substitutes an environment variable (empty string if unset);
  `{file:path}` substitutes a file's contents. Shell `$NAME` is *not* expanded in JSON strings.

Repo-relevant fields (all verified on the pages cited):

| Field | Purpose | Doc |
|---|---|---|
| `instructions` | extra instruction files/globs/URLs loaded after `AGENTS.md` | /docs/instructions/ |
| `mcp.servers.<name>` | local/remote MCP servers, §7 | /docs/mcp-servers/ |
| `permissions` | ordered `{action, resource, effect}` rules, §8 | /docs/permissions/ |
| `skills` | extra skill directories or HTTP catalogs; arrays from every config combine | /docs/skills/ |
| `policies` | hard denies (provider.use, tool.use) that outrank config | /docs/policies/ |
| `agents.<id>` | custom agents with own permissions | /docs/agents/, /docs/permissions/ |

There is no OpenCode equivalent of Claude's `defaultMode`/permission *modes*; OpenCode's always-on
base policy plus "ask" rules and saved approvals cover the same ground differently (§8).

---

## 5. Claude Code config surface (repo-relevant keys, verified)

- **Memory**: `./CLAUDE.md` or `./.claude/CLAUDE.md`; `@path` imports (relative to the importing
  file, recursive to 4 hops); `.claude/rules/*.md` discovered recursively, optional `paths:`
  frontmatter scopes a rule to file globs (loads when Claude Read/Write/Edits a matching file);
  rules without `paths` load every session — https://code.claude.com/docs/en/memory.md.
- **Settings**: `.claude/settings.json` (project, committed), `.claude/settings.local.json`
  (personal, normally git-ignored), `~/.claude/settings.json` (user) — precedence and key index
  at https://code.claude.com/docs/en/settings.md and …/settings-reference.md.
- **MCP**: project scope = `.mcp.json` at repo root (`mcpServers.<name>`, `type: stdio | http |
  sse | ws`; `streamable-http` accepted as alias of `http`); project-scoped servers require
  approval via `enabledMcpjsonServers` / `enableAllProjectMcpServers` in settings, and those
  approvals are ignored in untrusted folders — https://code.claude.com/docs/en/mcp.md.
- **Env expansion**: `${VAR}` and `${VAR:-default}` in a server's `command`, `args`, `env`,
  `url`, `headers` in `.mcp.json`; a set of credential variable names is deliberately never
  expanded toward remote servers ("Credential variables that read as empty") — …/mcp.md.
  No general env-var expansion *inside `settings.json` values* is documented — **unverified /
  not documented**; the documented mechanism for settings is the `env` block that *sets*
  environment variables.
- **Skills**: project `.claude/skills/<name>/SKILL.md`, nested `<subdir>/.claude/skills/`,
  personal `~/.claude/skills/`, plugin skills; "Claude Code skills follow the Agent Skills open
  standard" — https://code.claude.com/docs/en/skills.md. Frontmatter beyond the spec
  (`disable-model-invocation`, `allowed-tools`, `context: fork`, `paths`, `hooks`, …) is
  Claude-extension; the six spec fields (`name`, `description`, `license`, `compatibility`,
  `metadata`, `allowed-tools`) are the portable subset
  (…/skills.md, "Using skill frontmatter outside Claude Code"). Reserved folder name `synced`
  (used by claude.ai sync) — relevant to the user's `~/.claude/skills/synced/`.
- **Permissions**: `Tool` / `Tool(specifier)` strings in `permissions.{allow,deny,ask}`;
  evaluation is **deny → ask → allow, first match wins**; Bash wildcards (`*` after subcommand;
  trailing `:*` is an equivalent suffix form); Read/Edit rules use gitignore-style paths
  (`./path`, `/path` anchored at the settings source, `~/`, `//` absolute); MCP rules
  `mcp__<server>` or `mcp__<server>__*` for a whole server, `mcp__<server>__<tool>` for one;
  `defaultMode`: `default | acceptEdits | plan | auto | dontAsk | bypassPermissions` —
  https://code.claude.com/docs/en/permissions.md.

---

## 6. Skills — shared format, shared directory

- **Format**: Agent Skills spec (https://agentskills.io/specification.md): directory with
  `SKILL.md`; required `name` (1–64 chars, lowercase kebab, **must match the parent directory
  name**) and `description` (≤1024 chars); optional `license`, `compatibility` (≤500),
  `metadata` (string→string map), experimental `allowed-tools`. Progressive disclosure:
  metadata at startup, body on activation, supporting files on demand. The repo's skills
  satisfy all of this today.
- **Claude Code locations**: project `.claude/skills/<name>/SKILL.md` (loads in sessions in that
  repo; nested subdirs load on demand), personal `~/.claude/skills/`, plugin, enterprise —
  https://code.claude.com/docs/en/skills.md, "Choose where skills load".
- **OpenCode V2 locations** — https://opencode.ai/docs/skills/, "Discovery":

  | Scope | Sources |
  |---|---|
  | Global | `~/.config/opencode/skills` |
  | Global compatibility | **`~/.claude/skills`**, `~/.agents/skills` |
  | Project | `.opencode/skills` |
  | Project compatibility | **`.claude/skills`**, `.agents/skills` |

  Precedence (later wins on ID collision): built-ins < `.claude/skills` < `.agents/skills` <
  `~/.config/opencode/skills` < project `.opencode/skills` < explicit `skills` config entries.
- **Verdict**: keep the repo skills in `.claude/skills/` — Claude reads it natively, OpenCode
  reads it as a first-class compatibility source. No duplication, no symlinks. (User-level
  `~/.claude/skills/` is likewise picked up by OpenCode globally — there is no
  `~/.config/opencode/skills/` on this machine; the user's OpenCode skills come from the
  compatibility path.)
- Portability rules for new skills: stick to spec fields (`name`, `description`) in shared
  skills; Claude-only frontmatter (`disable-model-invocation`, `context: fork`, `paths`, …) is
  understood by Claude alone — except `disable-model-invocation`, which OpenCode explicitly
  maps to its `opencode/autoinvoke: false` behavior (https://opencode.ai/docs/skills/).
  `metadata.opencode/autoinvoke` is the OpenCode-only counterpart.
- Could not verify from primary sources: the full client list on
  https://agentskills.io/clients.md is JS-rendered — the text fetch returns only the page shell,
  so the "supported clients" enumeration comes from the two harness docs instead
  (Claude: …/skills.md; OpenCode: /docs/skills/). Unverified claim to avoid: "every major agent
  reads `.agents/skills`" — only OpenCode's doc mentions that path; Claude Code's doc does not.

---

## 7. MCP — field-by-field comparison

Repo files today: `.mcp.json` (Claude) and `opencode.json` (OpenCode) define the same
chrome-devtools stdio server with equivalent flags — the duplication already exists and is the
model to keep.

### 7.1 Mapping table

| Concept | Claude Code (`.mcp.json`, project scope) | OpenCode V2 (`opencode.json(c)`) |
|---|---|---|
| Wrapper key | `mcpServers.<name>` | `mcp.servers.<name>` ("V2 does not place server names directly under `mcp`") |
| Stdio server | `type: "stdio"`, `command: "npx"`, `args: [...]` | `type: "local"`, `command: ["npx", ...args]` |
| Server env vars | `env: {K: V}` | `environment: {K: V}` |
| Working directory | (inherits; `CLAUDE_PROJECT_DIR` env is set) | `cwd` (relative resolves from workspace) |
| Remote server | `type: "http"` (`streamable-http` alias) or `"sse"` (deprecated) / `"ws"` | `type: "remote"` — **Streamable HTTP only**; `"url"` required |
| Remote URL/headers | `url`, `headers` | `url`, `headers` |
| Env substitution | `${VAR}`, `${VAR:-default}` in `command`/`args`/`env`/`url`/`headers`; unset+no-default loads unexpanded with a warning; credential-named vars never expand toward remote servers | `{env:VAR}` anywhere in config strings → **empty string if unset**; `{file:path}` also available; no default-value syntax |
| API-key remote server | `headers: {Authorization: "Bearer ${KEY}"}` | same **plus `oauth: false`** ("use `oauth: false` only when the server exclusively uses an API key") |
| OAuth remote server | OAuth 2.0 flow via `/mcp` panel or `claude mcp login`; tokens stored/refreshed by Claude Code; per-endpoint sign-in | OAuth on by default; discovery → **PKCE**, client identity via pre-registered `oauth.client_id` → CIMD → DCR; snake_case fields `client_id`, `client_secret`, `scope`, `callback_port`, `redirect_uri`; `opencode mcp auth <name>` |
| Disable without deleting | `disabledMcpjsonServers` (settings) or `/mcp` toggle | `disabled: true` on the server entry |
| Tool naming | `mcp__<server>__<tool>` | `<server>_<tool>` (non-alphanumeric → `_`); permission action is the same normalized name |
| Timeouts | per-server `timeout` ms + `MCP_TIMEOUT`/`MCP_TOOL_TIMEOUT` env | `timeout: {startup, catalog, execution}` (defaults 30s/30s/12h) |
| Sources of config | `.mcp.json` (project) / `~/.claude.json` (local & user scopes) / managed / plugins | `opencode.json(c)` project / `~/.config/opencode/opencode.json` global / system dir |

Sources: https://code.claude.com/docs/en/mcp.md; https://opencode.ai/docs/mcp-servers/.

### 7.2 Sharing one config across both: not supported

- Claude Code reads MCP config only from `.mcp.json`, `~/.claude.json`, managed config, and
  plugin manifests. It has no "read another file" setting for MCP
  (https://code.claude.com/docs/en/mcp.md). Claude's `/import` command can *copy* another
  agent's config once (…/memory.md, "Migrate instructions from other tools") — a migration aid,
  not live sharing.
- OpenCode reads MCP config only from its own config files (https://opencode.ai/docs/mcp-servers/,
  "To configure a server by hand…"). No `.mcp.json` compatibility is documented.
- **Recommendation**: keep both files; they are 15 lines each for this repo's single server, and
  the translation is mechanical (§7.1). A repo-level convention comment ("keep in sync with
  opencode.json") or a tiny CI check could catch drift; neither is required.

### 7.3 Remote MCP servers (user level)

The user's three remote servers live in `~/.config/opencode/opencode.json` with `{env:…}` refs
(verified; values redacted here). Claude Code equivalents would go in **user scope**
(`~/.claude.json` via `claude mcp add --scope user`), because:
- Claude Code OAuth for remote MCP servers exists ("Claude Code supports OAuth 2.0",
  `/mcp` flow, `claude mcp login`; tokens stored and refreshed) — so the two OAuth servers
  (vkusvill, food-diary) can be configured header-free and authorized per harness. Note the
  auth-model difference: OpenCode identifies via pre-registered client → CIMD → DCR; whether the
  food-diary MCP's auth server supports Claude Code's flow depends on its CIMD/DCR support —
  **not verifiable from these docs alone**; the vkusvill OAuth docs (repo `mcp_instructions`)
  describe a per-agent client registration flow, i.e. per-client credentials, which matches
  OpenCode's pre-registered `client_id`/`client_secret` env refs.
- The z.ai API-key server maps directly: `type: "http"`, same `url`, `headers.Authorization:
  "Bearer ${ZAI_API_KEY}"` (Claude side), no OAuth.
This is user-level glue — out of the repo, but required for full "same MCPs" parity.

---

## 8. Permissions — Claude ↔ OpenCode translation

### 8.1 Model differences (precise)

| | Claude Code | OpenCode V2 |
|---|---|---|
| Storage | `permissions.{allow, deny, ask}` arrays of strings in settings files | `permissions: [{action, resource, effect}]` ordered array in config files (or `agents.<id>.permissions`) |
| Rule shape | `Tool` or `Tool(specifier)`; per-tool specifier syntaxes | Three string fields; `action` names a tool action, `resource` a path/command/URL/query/ID, `effect` ∈ `allow/deny/ask` |
| Evaluation | **deny → ask → allow, first match wins**; specificity irrelevant | **Last matching rule wins** (rules combined in config order: lower-priority config first, global next, agent rules last) |
| No match | depends on tool + permission mode (`default` mode prompts for Bash/edits/web; built-in read-only command set runs free) | **`ask`** after applying the built-in base policy — which is `[{*/*: allow}, {read *.env: ask}, {read *.env.*: ask}, {read *.env.example: allow}]` |
| Shell matching | `Bash(prefix *)`; trailing `:*` equivalent; compound commands split, every part must be allowed; wrapper stripping (`timeout`, `xargs` bare, safe-env assignments); "what a Bash rule doesn't match" caveats (`git -C . push` etc.) | `shell` action, resource = scanner-produced command string; `*`/`?` wildcards; trailing `" *"` also matches the bare command; built-in shell scanner analyzes compound commands (Bash/Zsh/sh/PowerShell) and applies rules to every subcommand |
| File reads/writes | `Read(path)` / `Edit(path)` gitignore-style patterns (`./x`, `/x` anchored at settings source, `~/x`, `//abs`); `Read` deny also blocks Edit/Write on the path | `read` / `edit` actions with path resources; `*` crosses `/`; `external_directory` action guards paths outside the location |
| MCP | `mcp__<server>` or `mcp__<server>__*` (whole server), `mcp__<server>__<tool>` (one tool) | action = normalized `<server>_<tool>`, resource `*` per tool; resources actions `opencode_list_mcp_resources` / `opencode_read_mcp_resource` |
| Skills / subagents | `Skill(skill:<name>)` parameter rules; Agent tool rules | dedicated `skill` (resource = skill ID) and `subagent` (resource = agent ID) actions |
| Modes | `defaultMode`: `default/acceptEdits/plan/auto/dontAsk/bypassPermissions` | none; per-agent `mode` (build/plan/…) with per-agent permission policies instead |
| Saved approvals | "Yes, and don't ask again" writes rules to `.claude/settings.local.json` | "Allow always" saves durable project-scoped allow patterns (never overriding configured `deny`) |

Sources: https://code.claude.com/docs/en/permissions.md; https://opencode.ai/docs/permissions/.

### 8.2 Translation for this repo's `.claude/settings.json`

OpenCode's last-match-wins means **broad `ask` first, specific `allow` after** (the reverse of
Claude's deny-first intuition). Suggested `permissions` array for `opencode.json`:

| Claude rule (repo) | OpenCode rule | Note |
|---|---|---|
| — (default mode prompts for shell) | `{ "action": "shell", "resource": "*", "effect": "ask" }` | recreate Claude's default-mode posture; without it OpenCode's base policy *allows* everything |
| `Bash(git add:*)`, `git branch`, `git commit`, `git rm`, `git diff`, `git log`, `git status`, `git remote get-url` | one `{ "action": "shell", "resource": "git <sub> *", "effect": "allow" }` each | Claude's `:*` ≡ OpenCode's trailing `" *"`; both also match the bare command |
| `Bash(rg:*)`, `fd`, `yarn install/build/lint/test`, `dotnet test`, `unzip -p`, `npm view`, `gh pr diff/view`, `rtk *` family | same shape: `"rg *"` etc. | mechanical |
| `Read(./**)` allow | drop | OpenCode base policy already allows all reads |
| `Read(./.env)` + `src/**/.env*` + `secrets/**` denies | `{ "action": "read", "resource": "*.env", "effect": "deny" }` (+ `*.env.*`, `secrets/*`) placed **after** the base-default asks | OpenCode's base only *asks* for env reads; a project deny hardens it to Claude's posture. `*` crosses `/`, so one pattern covers nested paths |
| `Bash(rm:*)` ask | `{ "action": "shell", "resource": "rm *", "effect": "ask" }` | keep *before* the allow block |
| `Bash(git push:*)` ask | `{ "action": "shell", "resource": "git push *", "effect": "ask" }` | |
| `mcp__chrome-devtools` allow | `{ "action": "chrome_devtools_*", "resource": "*", "effect": "allow" }` | OpenCode normalizes the server name (`-` → `_`) |
| `mcp__github_com_github_github-mcp-server__…` asks | `{ "action": "github_com_github_github_mcp_server__<tool>", "resource": "*", "effect": "ask" }` | only if that server is ever configured again — these four rules are stale today (no github server in `.mcp.json`) and are cleanup candidates on the Claude side too |
| `enabledMcpjsonServers: ["chrome-devtools"]` | nothing | OpenCode connects configured servers automatically; Claude's project-MCP approval concept has no OpenCode counterpart |
| `defaultMode: "auto"` (settings.local.json) | no equivalent | OpenCode has no classifier mode; closest analog is its saved-approval flow |

### 8.3 What cannot be mapped 1:1

- Claude's **permission modes** (`plan`, `auto`, `acceptEdits`) have no OpenCode counterpart;
  OpenCode ships fixed agents (`plan`, `explore`, …) with their own permission policies instead.
- OpenCode's `external_directory` guard (default: *allowed silently*) has no Claude analog rule
  in this repo; if parity of caution is wanted, add
  `{ "action": "external_directory", "resource": "*", "effect": "ask" }`.
- Claude's `Read`-deny side effects (blocking Edit, `@`-mentions, redirect targets) are broader
  than OpenCode's `read` deny; the deny list here is small enough that the practical gap is nil.

---

## 9. STRATEGY.md relocation

- Target: **`docs/agents/strategy.md`**. Justification: the directory's five existing files are
  all lowercase kebab-case single-topic names; "strategy" is the topic (product strategy that
  gates feature decisions), read by agents and humans. Alternatives like `product-strategy.md`
  or `product.md` add nothing; `STRATEGY.md`'s SCREAMING CASE is a root-level convention the
  `docs/` tree doesn't follow.
- Keep the file's frontmatter (`name: Food Diary`, `last_updated`) — it is ordinary Markdown and
  harmless for both harnesses.
- Update references: the root rules file should cite `docs/agents/strategy.md` in both places
  the current `CLAUDE.md` cites `STRATEGY.md` (project overview, "When adding features"). That
  makes the root rules file the single place agents learn about it — satisfying "referenced in
  root rules file". `docs/agents/writing-docs.md` line 3 should list `AGENTS.md` (and
  `docs/agents/**`) as prose surfaces once `CLAUDE.md` becomes a shim.
- `git mv STRATEGY.md docs/agents/strategy.md` preserves history; no other file in the repo
  references `STRATEGY.md` (verified by search).

---

## 10. Vendor lock-in landscape (brief, per the task's scope)

- **AGENTS.md adoption** (from https://agents.md): Codex (OpenAI), Jules (Google), Cursor,
  Gemini CLI, GitHub Copilot coding agent, Zed, Warp, VS Code, Devin, Windsurf, Aider, goose,
  Amp, RooCode, Factory, Kilo Code, Ona, Augment — plus OpenCode. Writing the rules once in
  `AGENTS.md` makes all of these first-class. (Cursor also has its own `.cursor/rules/` system;
  Copilot also reads `.github/copilot-instructions.md`; Claude's `/init` and `/import` can absorb
  both — relevant only if a future harness needs its native format.)
- **SKILL.md**: the Agent Skills spec is Anthropic-originated but explicitly open; OpenCode V2
  implements it including `.claude/skills` compat paths. `.agents/skills/` appears in OpenCode's
  discovery as a neutral location, but Claude Code's docs list only `.claude/skills` — treating
  `.claude/skills/` as canonical stays correct for this pair.
- **MCP**: the protocol itself is the portable part; config *files* are per-harness (§7.2).
- **Lowest-common-denominator set** for "easy to switch later":
  1. `AGENTS.md` (rules) — portable today;
  2. `SKILL.md` skills in a directory the harness reads — portable between these two today;
  3. MCP servers declared per harness in ~15 lines each — portable by hand;
  4. permissions/settings — inherently per harness; keep each file small and mirror the *policy*
     (what's allowed/denied), not the syntax.
  The only real lock-in remaining after the migration is Claude's path-scoped `.claude/rules/`
  and permission modes — both optional conveniences, both documented, both replaceable by
  AGENTS.md prose.

---

## 11. Recommended target layout for this repo

Shared (harness-agnostic) vs harness-specific glue marked per line. Order = migration order.

```
AGENTS.md                          NEW (shared) — content of today's CLAUDE.md; retitle the
                                   header neutrally ("guidance for coding agents working in
                                   this repository"); replace both `STRATEGY.md` references
                                   with `docs/agents/strategy.md`
CLAUDE.md                          REPLACE with shim (shared content, Claude delivery):
                                   line 1 `@AGENTS.md`, then nothing else (or Claude-only
                                   notes if any ever appear). OpenCode ignores it whenever
                                   AGENTS.md exists; Claude reads AGENTS.md exactly once
                                   through the import. Keeping the shim (vs deleting the
                                   file) covers Claude Code < 2.1.277, Bedrock sessions,
                                   and any future session type that can't read AGENTS.md
                                   directly — all documented gaps.
docs/agents/strategy.md            MOVED from STRATEGY.md via `git mv` (shared); update
                                   writing-docs.md prose-surface list to mention AGENTS.md
.claude/skills/*                   KEEP as-is (shared via OpenCode compat discovery); keep new
                                   skills' frontmatter to name+description for portability
.claude/rules/{frontend,backend}.md KEEP (Claude glue). The root AGENTS.md already
                                   instructs every agent to read these files when touching
                                   frontend/backend code — that instruction works in
                                   OpenCode too; only the *automatic path-scoped loading*
                                   is Claude-only. Optional OpenCode parity: add
                                   "instructions": [".claude/rules/frontend.md",
                                   ".claude/rules/backend.md"] to opencode.json — tradeoff:
                                   they load every session instead of on file-touch
.claude/rules/coding.md            CANDIDATE to fold into AGENTS.md (it has no `paths`
                                   frontmatter, i.e. it already loads every Claude session,
                                   and it mostly restates CODING_STANDARDS.md + AGENTS.md
                                   content). Folding removes the last always-loaded
                                   Claude-only file
.claude/settings.json              KEEP (Claude glue): enabledMcpjsonServers + permissions.
                                   Cleanup: drop the four stale github MCP `ask` rules
.mcp.json                          KEEP (Claude glue): chrome-devtools stdio server
opencode.json                      EXTEND (OpenCode glue): keep mcp.servers.chrome-devtools;
                                   add the translated `permissions` array from §8.2; optionally
                                   `instructions` for the rules files (§ above)
docs/agents/browser-verification.md EDIT (shared docs): say the chrome-devtools MCP server
                                   comes from `.mcp.json` (Claude Code) / `opencode.json`
                                   (OpenCode) instead of only `.mcp.json`
```

Delete nothing else; `.claude/settings.local.json` stays untracked personal state.
No user-level changes are required for parity (OpenCode already reads `~/.claude/CLAUDE.md` and
`~/.claude/skills/`); adding the three remote MCP servers to Claude user scope
(`claude mcp add --scope user`) is the only user-level step if full MCP parity is wanted.

---

## 12. Open questions / unverified

1. **agentskills.io client list** — https://agentskills.io/clients.md renders its list with
   JavaScript; the text fetch returns only the page shell (tried both `/clients.md` and the
   root). OpenCode's and Claude's Agent Skills support is instead verified from each harness's
   own docs. *Would resolve it:* a browser render of that page.
2. **Does OpenCode V2 read `.claude/commands/`?** Not mentioned in the fetched OpenCode docs
   (skills page covers skills only). This repo has no `.claude/commands/`, so no impact today.
   *Would resolve it:* OpenCode docs search or a live probe.
3. **Claude Code env-var expansion inside `settings.json` values** — no doc claims general
   `${VAR}` expansion there; only `.mcp.json` expansion and the settings `env` block (which
   *sets* variables) are documented. Treat settings values as literal.
4. **Whether the food-diary MCP's authorization server works with Claude Code's OAuth flow**
   (CIMD/DCR support) — depends on the server implementation, outside these docs. The repo's
   `docs/guide` MCP page and `Mcp:Clients` config would settle it.
5. **Which Claude Code version the user runs** (shim-vs-direct decision gate): the shim works on
   every version, so the recommendation doesn't depend on it; `claude --version` ≥ 2.1.277 would
   only enable the *alternative* of deleting `CLAUDE.md` entirely.
6. **`.agents/skills/` as a cross-harness neutral location** — documented for OpenCode only;
   Claude Code's docs don't mention it. Don't move skills there until Claude documents it.

---

## 13. Sources

### Standards
- AGENTS.md standard, adopters, LF/AAIF stewardship, FAQ — https://agents.md
- Agent Skills specification (frontmatter fields, name/dir rule, progressive disclosure) — https://agentskills.io/specification.md
- Agent Skills overview — https://agentskills.io (client list at https://agentskills.io/clients.md is JS-rendered; see §12.1)

### OpenCode V2 (all verified 2026-11-26)
- Docs index (llms.txt) — https://opencode.ai/docs/llms.txt
- Instructions / AGENTS.md discovery, CLAUDE.md fallback, env flags, `instructions` array — https://opencode.ai/docs/instructions/ (`/docs/rules/` redirects here)
- Config locations, precedence, JSONC, `{env:}`/`{file:}` substitution, field overview — https://opencode.ai/docs/config/
- MCP servers: local/remote shapes, Streamable HTTP only, OAuth PKCE/CIMD/DCR + snake_case fields, `oauth: false`, timeouts, tool naming — https://opencode.ai/docs/mcp-servers/
- Permissions: rule shape, last-match-wins, action table, base policy, saved approvals — https://opencode.ai/docs/permissions/
- Skills: discovery table (incl. `.claude/skills` compat), precedence, frontmatter, `disable-model-invocation` — https://opencode.ai/docs/skills/

### Claude Code (all verified 2026-11-26)
- Docs index (llms.txt) — https://code.claude.com/docs/llms.txt
- Memory: CLAUDE.md locations, `@` imports (4 hops), `.claude/rules/` + `paths` frontmatter, AGENTS.md support (v2.1.277+, `claude-md-or-agents-md` default, `pluginConfigs["cc-plugin-agents-md@builtin"]` user-settings-only), "Share one file with other coding tools" — https://code.claude.com/docs/en/memory.md
- Skills: Agent Skills standard, locations, frontmatter reference, spec-vs-extension fields, reserved `synced` name — https://code.claude.com/docs/en/skills.md
- MCP: scopes (.mcp.json / ~/.claude.json), transports (`stdio`/`http`/`sse`/`ws`, `streamable-http` alias), `${VAR}`/`${VAR:-default}` expansion + credential protection, project-server approvals (`enabledMcpjsonServers`, `enableAllProjectMcpServers`), OAuth `/mcp` flow — https://code.claude.com/docs/en/mcp.md
- Permissions: rule syntax, deny→ask→allow first-match, Bash wildcards & `:*` suffix, Read/Edit gitignore paths, MCP rule forms (`mcp__<server>`, `mcp__<server>__*`), `defaultMode` values — https://code.claude.com/docs/en/permissions.md
