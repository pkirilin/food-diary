# draft-release-changelog Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a project-level `draft-release-changelog` skill that drafts the next `CHANGELOG.md` release entry from commits since the latest tag and auto-determines the version bump, plus update README "Releasing" step 1 to document it.

**Architecture:** A single `SKILL.md` instruction file (no code) that guides Claude through: discover latest tag → gather + semantically classify commits → determine pre-1.0 bump → draft entry → on approval edit `CHANGELOG.md` and commit (no push). A one-time README doc edit adds this as an alternative to manual editing and fixes the heading-format discrepancy. Validation is behavioral: dry-run the skill's git-discovery commands against the current repo and confirm the values it would derive.

**Tech Stack:** Markdown skill file with YAML frontmatter; git CLI (`git describe`, `git log`, `git rev-list`); Keep a Changelog + SemVer conventions.

## Global Constraints

- Skill lives at `.claude/skills/draft-release-changelog/SKILL.md` (project-level, committed).
- Frontmatter must have `name` and `description` fields (match existing repo skills like `pk-self-improving`).
- Version headings must stay compatible with the release workflow extractor regex `^## \[X.Y.Z\]` (see `.github/workflows/release.yml:47-52`).
- Heading format is always `## [X.Y.Z] - <descriptive title>` (never a date).
- Project is pre-1.0 (`0.x`): features/breaking → minor, fixes/chores only → patch, never auto-select major.
- Skill runtime touches **only** `CHANGELOG.md`; it must not edit README on each run.
- Follow project comment/naming rules in `.claude/rules/coding.md`.
- Commits end with the `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer.

---

### Task 1: Author the SKILL.md

**Files:**
- Create: `.claude/skills/draft-release-changelog/SKILL.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the skill file. Later tasks and the README reference the skill by its `name:` slug `draft-release-changelog`.

Because this is an instruction file (not code), the "test" is a review of required sections against the spec, plus a dry-run of the git-discovery commands in Task 3.

- [ ] **Step 1: Recommended — invoke the skill-authoring sub-skill**

Optionally invoke `superpowers:writing-skills` for authoring conventions (frontmatter, structure, verification). If unavailable, follow the structure of the existing `~/.claude/skills/pk-self-improving/SKILL.md` (frontmatter + `## Overview` + `## Workflow` with numbered steps + `## Edge cases` table).

- [ ] **Step 2: Write the frontmatter and overview**

Create `.claude/skills/draft-release-changelog/SKILL.md` starting with:

```markdown
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
```

- [ ] **Step 3: Write the Workflow section**

Append the 8-step workflow. Copy the exact commands so the executing engineer needs no other reference:

````markdown
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
````

- [ ] **Step 4: Verify required sections are present**

Run:

```shell
rg -n "^(name:|description:|## Overview|### 1\.|### 4\.|### 7\.|## Edge cases)" .claude/skills/draft-release-changelog/SKILL.md
```

Expected: matches for the frontmatter fields, Overview, workflow steps 1/4/7, and Edge cases — confirming the file is structurally complete.

- [ ] **Step 5: Commit**

```shell
git add .claude/skills/draft-release-changelog/SKILL.md
git commit -m "$(printf 'Add draft-release-changelog skill\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 2: Update README "Releasing" step 1

**Files:**
- Modify: `README.md:214-216` (the "Releasing" step 1 bullet)

**Interfaces:**
- Consumes: the skill `name` slug `draft-release-changelog` from Task 1.
- Produces: nothing downstream.

- [ ] **Step 1: Replace step 1 with two options**

In `README.md`, replace the current step 1:

```markdown
1. On `main`, update `CHANGELOG.md`:
   - Rename the `[Unreleased]` section to `[X.Y.Z] - YYYY-MM-DD` (e.g. `[0.4.0] - 2026-05-09`).
   - Add a fresh empty `[Unreleased]` section above it.
```

with:

```markdown
1. On `main`, update `CHANGELOG.md`. Either:
   - **(a) Manually:** rename the `[Unreleased]` section to
     `[X.Y.Z] - <short descriptive title>`
     (e.g. `[0.5.0] - Node.js 24 & minor packages bump`), and add a fresh empty
     `[Unreleased]` section above it.
   - **(b) With Claude Code:** run the `draft-release-changelog` skill, which
     drafts the entry from commits since the latest tag, auto-determines the
     version bump, and commits the change for you.
```

- [ ] **Step 2: Verify heading-format correction and skill reference**

Run:

```shell
rg -n "draft-release-changelog|short descriptive title|YYYY-MM-DD" README.md
```

Expected: the skill reference and the "short descriptive title" phrasing are present under "Releasing", and the old `YYYY-MM-DD` form no longer appears in step 1.

- [ ] **Step 3: Commit**

```shell
git add README.md
git commit -m "$(printf 'Document draft-release-changelog skill in README release steps\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 3: Behavioral dry-run against the current repo

**Files:**
- None (validation only).

**Interfaces:**
- Consumes: the workflow commands authored in Task 1.
- Produces: confidence that the skill derives correct values; no artifacts.

This confirms the skill's discovery logic yields the expected release for the repo's current state (7 commits since `v0.5.0`, headlined by the AI nutrition suggestions feature → `0.6.0`).

- [ ] **Step 1: Run the discovery commands**

```shell
git describe --tags --abbrev=0
git rev-list "$(git describe --tags --abbrev=0)"..HEAD --count
git log "$(git describe --tags --abbrev=0)"..HEAD --oneline
```

Expected: tag `v0.5.0`; a non-zero count; a commit list including the AI nutrition suggestions feature.

- [ ] **Step 2: Confirm the derived version**

Apply the Task 1 step-4 bump rule to the classified commits by hand: a new user-facing feature is present → minor bump → next version `0.6.0`. Confirm this matches the spec's stated expectation. No commit — validation only.

---

## Self-Review

- **Spec coverage:** Preconditions (§1), gather (§2), classify (§3), bump (§4), title (§5), approval (§6), edit+commit (§7), report (§8) → Task 1. README two-options + heading fix (build-time deliverable) → Task 2. Expected `0.6.0` outcome → Task 3. All spec sections covered.
- **Placeholder scan:** No TBD/TODO; all steps carry concrete commands and file content.
- **Type consistency:** Skill slug `draft-release-changelog` used identically in the frontmatter (Task 1), README reference (Task 2), and validation (Task 3). Heading format `## [X.Y.Z] - <title>` consistent across all tasks and the Global Constraints.
