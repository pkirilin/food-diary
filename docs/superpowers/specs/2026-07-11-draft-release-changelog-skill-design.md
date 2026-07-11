# Design: `draft-release-changelog` skill

## Goal

Automate step 1 of the README "Releasing" process: draft the `CHANGELOG.md`
entry for the next release from the commits made since the latest git tag, and
automatically determine the new version bump (major / minor / patch).

## Location

Project-level skill, committed to the repo:

```
.claude/skills/draft-release-changelog/SKILL.md
```

## Inputs / assumptions

- Latest release tag follows `vX.Y.Z` (current latest: `v0.5.0`).
- `CHANGELOG.md` uses the Keep a Changelog format with an `[Unreleased]`
  section at the top and per-version headings of the form
  `## [X.Y.Z] - <descriptive title>` (the actual convention in this repo;
  README currently documents a date form, which this skill corrects).
- The Release GitHub Actions workflow extracts notes by matching
  `^## \[X.Y.Z\]` — any heading this skill produces must stay compatible.
- Project is pre-1.0 (`0.x`).

## Workflow

### 1. Find the latest tag and preconditions

- Resolve latest tag: `git describe --tags --abbrev=0` (e.g. `v0.5.0`).
- If the current branch is not `main`, warn the user (releases are cut from
  `main`) but allow continuing.
- If there are no commits since the tag (`git rev-list <tag>..HEAD --count` is
  `0`), stop — nothing to release.

### 2. Gather changes

- `git log <tag>..HEAD --oneline` for the commit list.
- Inspect diffs (`git log <tag>..HEAD -p` / `git diff <tag>..HEAD`) as needed
  to understand the nature of each change semantically. Commits in this repo are
  **not** conventional-commit formatted, so classification is based on reading
  the changes, not parsing prefixes.

### 3. Classify changes (semantic analysis)

Sort **user-facing** changes into Keep a Changelog buckets:

- **Added** — new features / capabilities.
- **Changed** — changes to existing behavior.
- **Fixed** — bug fixes.
- **Removed / Deprecated / Security** — include only when applicable.

Filter out non-user-facing noise (build tooling, CI tweaks, internal design
specs, editor-ignore commits, refactors with no observable effect) instead of
dumping every commit. Entries are written as concise, user-oriented bullet
points consistent with existing CHANGELOG style.

### 4. Determine the version bump (pre-1.0 aware)

Based on the classified changes:

- Any new feature (entries in **Added**) → **minor** bump.
- Only fixes / changes (no **Added**) → **patch** bump.
- **major** is never auto-selected while on `0.x` (reserved for a deliberate
  `1.0`). If a breaking change is detected, the skill flags it in the reasoning
  and still proposes a minor bump per pre-1.0 SemVer convention, leaving the
  1.0 decision to the user.

Compute `X.Y.Z` from the latest tag accordingly.

> For the repo's current state (7 commits since `v0.5.0`, headlined by the AI
> nutrition suggestions feature), this yields **0.6.0**.

### 5. Generate a descriptive title

A short phrase summarizing the release, matching existing entries
(e.g. `AI nutrition suggestions on product form`).

### 6. Present the draft for approval

Show the user:

- Proposed version `X.Y.Z` and title.
- The drafted Added / Changed / Fixed sections.
- One-line reasoning for the chosen bump.

Do not modify any files until the user approves.

### 7. On approval: edit files and commit (no push)

- **`CHANGELOG.md`**: rename the existing `[Unreleased]` heading to
  `## [X.Y.Z] - <title>`, fill it with the drafted content, and insert a fresh
  empty `## [Unreleased]` section above it. If `[Unreleased]` already contains
  manually-written entries, **merge** them with the generated content — never
  discard them.
- **`README.md` step 1**: rewrite the "Releasing" step 1 to present two options:
  - **(a)** manual CHANGELOG editing (the existing instructions, corrected to
    the `## [X.Y.Z] - <descriptive title>` heading format).
  - **(b)** using this `draft-release-changelog` skill.
- **Commit** both files (do **not** push). Commit message summarizes the
  release preparation (e.g. `Prepare release 0.6.0`).

### 8. Report remaining manual steps

After committing, remind the user of what is left, per README:

1. Push `main`.
2. Dispatch **Actions → Release → Run workflow** with the version (no `v`
   prefix).

## Edge cases

| Situation | Behavior |
| --- | --- |
| Not on `main` | Warn, allow continue |
| No commits since latest tag | Stop — nothing to release |
| `[Unreleased]` already has manual entries | Merge, never overwrite |
| Breaking change detected on `0.x` | Flag in reasoning, still propose minor |
| Heading format | Always `## [X.Y.Z] - <title>`, regex-compatible with release workflow |

## Out of scope

- Pushing the branch or dispatching the Release workflow (remain manual).
- Building/publishing Docker images or creating the git tag (handled by the
  Release workflow).
