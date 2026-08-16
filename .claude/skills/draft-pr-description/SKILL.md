---
name: draft-pr-description
description: Drafts a plain-English PR description for the current branch's open PR, with scope and final-draft approval gates
disable-model-invocation: true
---

# Draft PR Description

## Overview

Writes the body of the **existing** open PR for the current branch. Answers one
question — *what has changed and why* — for a reader who has not read the diff.
Two approval gates: the user picks which changes are in scope, then approves the
final draft before it reaches the PR.

## Workflow

### 1. Locate the PR and read the changes

```shell
gh pr view --json number,title,baseRefName,url
```

If no PR exists for the current branch, stop and say so — this skill edits an
existing PR, it does not create one.

Read the full diff against the PR's base branch:

```shell
BASE=$(gh pr view --json baseRefName -q .baseRefName)
git log "origin/$BASE"..HEAD --oneline
git diff "origin/$BASE"...HEAD
```

Also read the branch's spec, if one exists under `.scratch/<feature-slug>/` —
it carries the *why* that the diff cannot show.

Done when every changed file is accounted for in your understanding: you can
name the user-visible effect of each one, or classify it as noise.

### 2. Propose the scope

Present a numbered list of every **candidate** key change, one line each, each
tagged with your recommendation:

- **include** — a reader of the PR needs to know this.
- **omit** — mechanical noise (formatting, lockfile churn, generated files,
  no-op refactors, incidental renames).

Ask the user to confirm, drop, or add entries. **Stop and wait for the answer.**

### 3. Turn the selected changes into bullets

One bullet per selected change, in the repo's established shape:

- Lead with a **bold sentence** stating the change in user-facing terms.
- Follow with at most one or two plain sentences of consequence — why it was
  needed, or what it means for someone using or working on the app.
- Name behavior, not implementation. File paths, class names, and function
  names appear only when the change *is* about them (a config convention, a
  documented rule). Version numbers of upgraded dependencies are fine.

Three to five bullets is the usual size. If a bullet needs a paragraph to
justify itself, it is two bullets or it belongs in the lead paragraph.

### 4. Draft the full description and get approval

Assemble in this order:

1. **Lead paragraph** — one short paragraph of plain English: what this PR
   changes and why it was worth doing. No heading above it.
2. **The bullets** from step 3.
3. **The disclaimer**, verbatim as the last line:

```markdown
:robot: Generated with AI
```

Headings (`## Summary`, `## Verification`) are optional — add them only when the
PR is large enough that a reader needs signposts.

Show the complete draft. Ask the user to **approve** or **state changes**.
**Stop and wait.** Do not touch the PR before an explicit approval.

### 5. Apply or revise

- **Changes requested** → revise the draft and return to step 4. Repeat until
  approved.
- **Approved** → write the body to a temp file and push it:

```shell
gh pr edit --body-file <path>
```

Report the PR URL.

## Writing rules

| Rule | Why |
| --- | --- |
| Plain English, no deep technical detail | The reader is deciding whether to review, not reading the diff |
| Describe effects, not mechanics | "Picking a day now needs a confirming tap", not "changed `closeOnSelect`" |
| Present tense, active voice | Matches existing PR bodies |
| The disclaimer is the final line, always | Non-negotiable — it must survive every revision round |

## Edge cases

| Situation | Behavior |
| --- | --- |
| No open PR for the branch | Stop — this skill edits, it never creates |
| PR body already written | Show the existing body alongside the draft; ask which to keep before applying |
| Branch is behind its base | Note it, continue — the diff uses the three-dot merge-base form |
| User rejects every candidate change | Stop — nothing to describe |
