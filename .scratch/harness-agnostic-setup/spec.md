# Spec: Harness-agnostic agent setup (OpenCode + Claude Code)

Status: ready-for-agent

Research: [research.md](./research.md) — every harness-behavior claim below was verified against
primary sources on 2026-11-26 (agents.md spec, OpenCode V2 docs, Claude Code docs), and every
repo-state claim by direct inspection. The grilling session that settled the open decisions is
summarized in the Implementation Decisions section.

## Problem Statement

The project's agent setup is coupled to one harness. The root rules file is named after Claude
Code, a vendor-only rules directory with vendor-specific frontmatter carries the per-area coding
rules, permissions exist only on the Claude side, and the skills directory uses a Claude-owned
path. Since development moved to OpenCode, the consequence is asymmetry: OpenCode reads the root
file only as a compatibility fallback, discovers none of the rules directory, and runs with its
default allow-everything permission policy because no translated permission set exists. The same
repository therefore produces different agent behavior depending on which CLI launched it, every
rule edit risks drifting between the two setups, and the next harness switch would cost another
migration.

## Solution

One harness-neutral setup that both tools read natively, with no shim file: a single root rules
file in the AGENTS.md open format as the source of truth, per-area rules as plain markdown in the
agent-docs directory referenced by explicit triggers, permissions deliberately duplicated and
translated per harness (they are semantically different engines), MCP configs kept as intentional
mirrors with the sync convention written down, the skills directory kept where both harnesses
already read it with a neutral symlink alongside, and the product strategy doc relocated into the
agent-docs tree. Nothing about how the app builds, tests, or deploys changes.

## User Stories

1. As a developer using OpenCode, I want the repo's agent rules to load from a harness-neutral root file, so that guidance no longer comes from a file named after a competitor tool.
2. As a developer using Claude Code, I want to keep receiving the complete rules after the Claude-named root file is removed, so that my workflow does not degrade.
3. As a developer switching between harnesses mid-project, I want both harnesses to load identical rules, so that agent behavior never depends on which CLI I launched.
4. As a maintainer, I want one canonical rules source, so that a rule edit never has to be applied in two places.
5. As an agent picking up frontend work, I want the root rules file to tell me to read the frontend rules first, so that I still find them even though nothing injects them automatically anymore.
6. As an agent picking up backend work, I want an equivalent explicit pointer to the backend rules, so that backend conventions are discovered as reliably as frontend ones.
7. As an agent finishing a coding task, I want the coding self-check rules discoverable from the root file, so that build-and-test-before-done is always followed.
8. As a maintainer, I want the per-area rules as plain markdown without vendor frontmatter, so that they render and read identically in any tool, on GitHub, and in print.
9. As a developer browsing the docs tree, I want the product strategy doc to live beside the other agent-facing docs under the same naming convention, so that everything an agent reads sits in one predictable place.
10. As an agent deciding whether to add a feature, I want the strategy doc referenced from the root rules file, so that the scope check happens without hunting for it.
11. As a developer adding an MCP server, I want the dual-config convention documented in the root rules file, so that registering it in one client config never silently misses the other.
12. As an OpenCode user, I want a permission set equivalent to the Claude one, so that the agent is never more permissive merely because of the harness.
13. As a security-conscious maintainer, I want credential-file read denies on both harnesses, so that env and secret files are equally protected either way.
14. As a cautious maintainer, I want OpenCode to prompt before reading outside the workspace, so that the agent cannot silently roam the filesystem — a gap the Claude side does not have.
15. As a maintainer, I want permission rules for the long-gone GitHub MCP server removed, so that the config states only what is true.
16. As a developer whose skills should outlive harness choices, I want a harness-neutral skills path provided as a symlink, so that future tools can discover skills without another migration.
17. As a future maintainer reading the repo, I want an ADR explaining the absent Claude-named rules file and the duplicated configs, so that nobody "restores" them as an apparent fix.
18. As a reviewer of the migration, I want it as one atomic commit, so that no intermediate state has a root file pointing at docs that do not exist yet.
19. As an agent writing documentation, I want the writing-docs conventions to name the real rules file and docs surfaces, so that my output lands in the right files.
20. As a maintainer upgrading toolchains later, I want toolchain facts (commands, architecture notes) to stay in the always-loaded root file, so that agents never chase a second file just to learn how to run the tests.

## Implementation Decisions

- **Root rules file**: replace the Claude-named root file with `AGENTS.md` as the single source of truth, deleted outright with no shim — both harnesses read `AGENTS.md` natively (OpenCode V2 natively; Claude Code since v2.1.277, and 2.1.332 is installed, verified). The Claude-only user-level memory file is unaffected.
- **Content shape ("thin" = no rules, no vendor syntax — not no context)**: the root file keeps every-session context inline — project overview, repo layout, common commands, architecture notes, frontend toolchain conventions, CLI-tool preferences, commit-message rules, and the pointers to the agent-docs and reference docs. Conditional *rules* move out to the agent-docs directory.
- **Rules relocation**: the three rules files move into the agent-docs directory as plain markdown (git mv, history preserved), dropping the vendor-only `paths:` frontmatter. The root file replaces mechanical auto-attachment with explicit triggers: read the frontend rules before changing frontend code, read the backend rules before backend work, and consult the coding rules before finishing any task. Losing mechanical injection is an accepted, deliberate trade-off (grilling round 2).
- **Duplication removal**: the arrow-function rule existed in both the overview and the frontend rules; it becomes single-sourced in the frontend rules file, which also absorbs the one fact unique to the overview copy (no lint rule enforces component style since the React lint plugin was dropped — follow it by convention).
- **Strategy doc relocation**: the root strategy file moves to `docs/agents/strategy.md` under the directory's kebab-case convention (git mv; its frontmatter is ordinary markdown and stays), referenced from the root rules file in both places it is cited today. It is the only live reference outside the root file.
- **MCP duplication**: both client configs stay as intentional mirrors (currently one stdio server, identically registered). The keep-in-sync convention gets a short note in the root rules file with the field mapping (stdio→local, command+args as array, `${VAR}`↔`{env:VAR}` env substitution, remote endpoints are Streamable HTTP with `oauth:false` for API-key auth). No dedicated doc page — over-documentation for this repo.
- **Permissions, Claude side**: delete the four stale ask-rules for the GitHub MCP server that is not configured anywhere in the repo (drive-by cleanup decided in grilling); nothing else in that file changes.
- **Permissions, OpenCode side**: a translated ruleset in the project config, authored for OpenCode's engine — rules are evaluated **last-match-wins** over a default allow-all base policy, the opposite of Claude's first-match deny→ask→allow. Shell is allow-first with asks only for `rm` and `git push` — a deliberate loosening of Claude's prompt-for-shell posture so the agent runs unattended; no allowlist of specific commands is kept, since the broad allow already decides every other command. An `external_directory` `ask` guards paths outside the workspace (system temp directories exempted so scratch files never prompt). Read denies for env files and the secrets directory harden OpenCode's base ask-only env posture to Claude's deny, and explicit allows after the denies keep the committed env files readable (`tests/.env`, `.env.development`, `.env.test` — without them the `*.env` deny or the base policy's `*.env.*` ask would bite). MCP tools need no rule: the base policy allows them when nothing matches. The external-directory guard makes OpenCode deliberately stricter than Claude, accepted in grilling.
- **Personal config untouched**: `.claude/settings.local.json` is gitignored personal state (its `defaultMode` and personal allows have no repo bearing) and stays out of the translation.
- **Skills layout**: the existing skills directory stays where both harnesses already discover it (OpenCode has documented compatibility discovery of the Claude path; all skills conform to the shared Agent Skills spec). A committed symlink provides the neutral `.agents/skills` path for future tools, pointing at the real directory — direction chosen so Claude-side reads never depend on symlink support.
- **Reference updates, live docs only**: the development doc and the browser-verification doc cite the frontend rules at their new home; the writing-docs conventions name `AGENTS.md` and the agent-docs tree as prose surfaces. Dated records — the historical superpowers specs/plans and existing ADR bodies — stay untouched.
- **ADR**: `docs/adr/0008-agents-md-harness-neutral-setup.md`, written at implementation end in the house one-decision format: native AGENTS.md root with the shim rejected, rules relocated with auto-attach dropped, duplicated MCP with the sync note, translated permissions and the stricter external-directory guard, the symlink, and the root-file removal rationale.
- **One atomic commit**, imperative subject, no co-author trailers — repo convention.

## Testing Decisions

- No code seams exist or are needed: the change's contract is harness loading behavior and config integrity, not app behavior. Existing app test suites are untouched and must stay green without modification — if any breaks, the migration went wrong.
- Verification, per the seams this change actually touches:
  - Config parses and MCP connects: the OpenCode project config is JSONC the strict JSON tools reject, so `opencode mcp list` is the parse check — all servers, including the newly migrated `z.ai-web-search`, must show connected.
  - Root file discovery: Claude Code ≥ v2.1.277 and OpenCode V2 both load `AGENTS.md` natively; the installed Claude version gate is already verified.
  - Symlink integrity: `.agents/skills` resolves from a fresh checkout and git records it as a link.
  - No dangling references: every doc pointer in the root rules file and the updated live docs resolves to a file in the tree.
  - Permissions review: the translated array is checked line-by-line against the documented last-match-wins semantics and the research file's translation table (§8.2), especially that only `rm` and `git push` ask among shell commands and the read allows follow the denies.
- Prior art: the recent migrations tracked in `.scratch` (ESLint 10, TanStack Router, MUI 9) were likewise verified by command runs and review rather than automated suites; this follows the same pattern.

## Out of Scope

- Mirroring user-level MCP servers (vkusvill, food-diary, z.ai web search) into Claude's user config — remote OAuth flows differ per harness and this is machine-level, not repo-level; a manual follow-up at most.
- Anything in `.claude/settings.local.json` (personal, gitignored).
- Re-adding a GitHub MCP server or rules referencing it.
- Rewriting dated records: `docs/superpowers/**`, existing ADR bodies (the new ADR notes the succession instead).
- Supporting Claude Code versions older than native AGENTS.md support — the shim was explicitly rejected.
- Any application code, docs/guide content, or CI changes.

## Further Notes

- The research file in this directory is the authority for harness semantics (AGENTS.md discovery rules, the permission-engine differences, the MCP field mapping, the vendor lock-in landscape) and cites primary sources for every claim; consult it before revisiting any decision above.
- The grilling session settled six decisions beyond the original plan: overview keeps always-relevant context (option a), auto-attach loss accepted, user-level MCP out of scope, ADR yes (0008), one commit, symlink direction as stated — plus three follow-ups: GitHub rules cleanup (option c), the external-directory guard, and the sync note in the root file rather than a dedicated page.
- OpenCode's config watches and hot-reloads, so no restart is needed after the permission changes; the MCP connection check doubles as the parse check.
