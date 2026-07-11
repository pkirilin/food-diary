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

### 3. Classify changes (semantic analysis)

Sort **user-facing** changes into Keep a Changelog buckets:

- **Added** — new features / capabilities.
- **Changed** — changes to existing behavior.
- **Fixed** — bug fixes.
- **Removed / Deprecated / Security** — only when applicable.

Filter out non-user-facing noise (build/CI tweaks, internal design specs,
editor-ignore commits, no-op refactors). Write concise, user-oriented bullets
consistent with existing `CHANGELOG.md` entries.

### 4. Determine the version bump (pre-1.0 aware)

- Any entry in **Added** (new feature) → **minor** bump.
- Only **Fixed** / **Changed** (no Added) → **patch** bump.
- Never auto-select **major** while on `0.x`. If a breaking change is detected,
  flag it in the reasoning but still propose a minor bump; leave the 1.0
  decision to the user.

Compute `X.Y.Z` from the latest tag accordingly.

### 5. Generate a descriptive title

A short phrase summarizing the release, matching existing entries
(e.g. `AI nutrition suggestions on product form`).

### 6. Present the draft for approval

Show: proposed version `X.Y.Z` + title, the drafted Added / Changed / Fixed
sections, and one-line bump reasoning. **Do not modify any files until the user
approves.**

### 7. On approval: edit CHANGELOG.md and commit (no push)

- Rename the existing `## [Unreleased]` heading to `## [X.Y.Z] - <title>` and
  fill it with the drafted content.
- Insert a fresh empty `## [Unreleased]` section above it.
- If `[Unreleased]` already contains manual entries, **merge** them with the
  generated content — never discard them.
- Keep the heading regex-compatible with `.github/workflows/release.yml`
  (`^## \[X.Y.Z\]`).
- Commit `CHANGELOG.md` only (do **not** push):

```shell
git add CHANGELOG.md
git commit -m "Prepare release X.Y.Z"
```

### 8. Report remaining manual steps

Remind the user what is left, per README "Releasing":

1. Push `main`.
2. Dispatch **Actions → Release → Run workflow** with the version (no `v` prefix).

## Edge cases

| Situation | Behavior |
| --- | --- |
| Not on `main` | Warn, allow continue |
| No commits since latest tag | Stop — nothing to release |
| `[Unreleased]` already has manual entries | Merge, never overwrite |
| Breaking change detected on `0.x` | Flag in reasoning, still propose minor |
| Heading format | Always `## [X.Y.Z] - <title>`, regex-compatible with release workflow |
