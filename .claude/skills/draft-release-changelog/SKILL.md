---
name: draft-release-changelog
description: Use when preparing a new release of Food Diary - drafts the next CHANGELOG.md version entry from commits since the latest git tag and auto-determines the major/minor/patch bump
---

# Draft Release Changelog

## Overview

Automates step 1 of the README "Releasing" process. Reads the commits made
since the latest `vX.Y.Z` tag, drafts a Keep a Changelog entry (Added /
Changed / Fixed), determines the next version using pre-1.0 SemVer rules, and
on approval edits `CHANGELOG.md` and commits (without pushing). Remaining
release steps (push, dispatch the Release workflow) stay manual.

Two approval gates: the user confirms which changes are in scope, then
approves the finished draft before anything is written.

## Workflow

### 1. Preconditions

- Resolve the latest release tag: `git describe --tags --abbrev=0` (e.g. `v0.5.0`).
- If the current branch is not `main`, warn the user (releases are cut from
  `main`) but allow continuing.
- If there are no new commits, stop — nothing to release:

```shell
git rev-list "$(git describe --tags --abbrev=0)"..HEAD --count
```

If this prints `0`, stop.

### 2. Gather changes

```shell
TAG=$(git describe --tags --abbrev=0)
git log "$TAG"..HEAD --oneline      # commit list
git log "$TAG"..HEAD -p             # diffs, for semantic understanding
```

Commits are **not** conventional-commit formatted — classify by reading the
actual changes, not by parsing message prefixes.

### 3. Identify the notable changes

`CHANGELOG.md` documents **all notable changes**. A change is notable when it
matters to **someone running or maintaining this app**, not only to someone
using it. Runtime and dependency upgrades, Docker and deployment configuration,
build and CI behavior, and security posture all clear that bar — existing
entries cover .NET 10, yarn, `Dockerfile` `CMD`, and Node.js deprecation
warnings, none of which are visible in the UI.

Leave out only what a reader gains nothing from:

- formatting-only commits
- lockfile churn
- documentation typos
- no-op refactors
- `.scratch/` specs
- agent skills and `.claude/` config

List one candidate per notable change, phrased as the changelog line it would
become.

### 4. Confirm the scope

Put the candidates to the user through the **`AskUserQuestion` tool** — always
that tool, so the answer is a click rather than typed-out numbers:

- `multiSelect: true`, one option per candidate change.
- Option `label` — the change in 1–5 words. Option `description` — the
  changelog line it would become.
- Pre-select nothing; the user's picks *are* the scope.

The tool caps a question at 4 options. A release runs longer than a branch, so
keep asking — across further questions and further calls — until every
candidate has been offered; overflow never goes into the exclusion list. Title
each question so the user can see the end coming ("Which changes belong in
0.8.0? (2 of 3)").

List what you left out as plain chat text beneath, so the user can see it and
pull anything back via the tool's "Other" free-text field.

**Stop and wait for the answer.**

### 5. Sort the selected changes into buckets

- **Added** — new features / capabilities.
- **Changed** — changes to existing behavior.
- **Fixed** — bug fixes.
- **Removed / Deprecated / Security** — only when applicable.

Write concise bullets consistent with existing `CHANGELOG.md` entries: one
line each, plain prose, no bold lead-ins.

### 6. Determine the version bump (pre-1.0 aware)

- Any entry in **Added** → **minor** bump.
- Only **Fixed** / **Changed** (no Added) → **patch** bump.
- Never auto-select **major** while on `0.x`. If a breaking change is detected,
  flag it in the reasoning but still propose a minor bump; leave the 1.0
  decision to the user.

Compute `X.Y.Z` from the latest tag accordingly. Strip the `v` prefix from the
tag (e.g. `v0.5.0` → next `0.6.0`); the CHANGELOG heading and the version you
report never carry the `v`.

### 7. Generate a descriptive title

A short phrase summarizing the release, matching existing entries
(e.g. `AI nutrition suggestions on product form`).

### 8. Present the draft for approval

Show: proposed version `X.Y.Z` + title, the drafted Added / Changed / Fixed
sections, and one-line bump reasoning. **Do not modify any files until the user
approves.**

### 9. On approval: edit CHANGELOG.md and commit (no push)

- Rename the existing `## [Unreleased]` heading to `## [X.Y.Z] - <title>` and
  fill it with the drafted content.
- Insert a fresh empty `## [Unreleased]` section above it.
- If `[Unreleased]` already contains manual entries, **merge** them with the
  generated content — never discard them.
- Keep the heading regex-compatible with `.github/workflows/release.yml`
  (`^## \[X.Y.Z\]`).
- Commit `CHANGELOG.md` only (do **not** push). End the commit message with a
  `Co-Authored-By` trailer naming the model you are **currently** running as
  (read it from your own environment / system context) — do not hardcode a
  model name:

```shell
# Replace <current-model> with the model you are running as, e.g. "Claude Opus 4.8"
git add CHANGELOG.md
git commit -m "$(printf 'Prepare release X.Y.Z\n\nCo-Authored-By: <current-model> <noreply@anthropic.com>')"
```

### 10. Report remaining manual steps

Remind the user what is left, per README "Releasing":

1. Push `main`.
2. Dispatch **Actions → Release → Run workflow** with the version (no `v` prefix).

## Edge cases

| Situation | Behavior |
| --- | --- |
| Not on `main` | Warn, allow continue |
| No commits since latest tag | Stop — nothing to release |
| User selects no changes at the scope gate | Stop — nothing to release |
| More than 4 candidate changes | Keep asking until every candidate is offered |
| `[Unreleased]` already has manual entries | Merge, never overwrite |
| Breaking change detected on `0.x` | Flag in reasoning, still propose minor |
| Heading format | Always `## [X.Y.Z] - <title>`, regex-compatible with release workflow |
