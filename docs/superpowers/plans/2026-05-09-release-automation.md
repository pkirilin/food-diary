# Release Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual-dispatch GitHub Actions workflow that publishes Food Diary to Docker Hub (`pkirilin/food-diary:<version>` + `:latest`), creates the matching `v<version>` git tag, and creates a GitHub release with notes pulled from `CHANGELOG.md`.

**Architecture:** Single-job workflow at `.github/workflows/release.yml` triggered via `workflow_dispatch` (input: `version`). Pre-flight validations (branch is `main`, version format is strict semver, git tag and Docker Hub tag don't already exist, `## [<version>]` section is present in `CHANGELOG.md`) all run before any side-effecting step. Then: extract notes → build & push image → push git tag → create GitHub release. `CHANGELOG.md` (Keep a Changelog format) is the single source of truth for release notes; the workflow only reads it. README documents the manual `[Unreleased]` → `[X.Y.Z]` bump that the maintainer commits before dispatching.

**Tech Stack:** GitHub Actions (`docker/setup-buildx-action@v4`, `docker/login-action@v4`, `docker/build-push-action@v7`), `gh` CLI (preinstalled on ubuntu runners), `awk`/`grep`/`curl` (preinstalled), Docker Hub Registry v2 API.

**Spec:** [`docs/superpowers/specs/2026-05-09-release-automation-design.md`](../specs/2026-05-09-release-automation-design.md).

---

## Preconditions (manual, NOT done by this plan)

These must be done by the maintainer once before the first release dispatch (Task 8). They cannot be done from inside the workflow:

1. Docker Hub repo `pkirilin/food-diary` exists and is public.
2. A Docker Hub Personal Access Token with read+write+delete scope is created (Docker Hub → Account Settings → Personal access tokens).
3. In the GitHub repo settings (Settings → Secrets and variables → Actions):
   - **Variables** tab: add `DOCKERHUB_USERNAME` = `pkirilin`.
   - **Secrets** tab: add `DOCKERHUB_TOKEN` = the access token from step 2.

The plan covers everything else.

---

## File map

| Path | Status | Responsibility |
|---|---|---|
| `CHANGELOG.md` | NEW | Source of truth for release notes; Keep a Changelog format. Workflow reads (never writes). |
| `.github/workflows/release.yml` | NEW | The release workflow (single job, `workflow_dispatch` only). |
| `README.md` | MODIFY | Add Docker Hub badge near top; add `## Releasing` section between `## Development` and `## Contacts`; add TOC entry. |

No other files are touched. Existing `build.yml`, `deploy.yml`, `deploy-demo.yml`, and `Dockerfile` are not modified.

---

## Task 1: Seed CHANGELOG.md

Create the file in the format the workflow will read. Initial content has only the `[Unreleased]` placeholder — no version sections yet (the workflow only validates a section when a version is dispatched).

**Files:**
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create CHANGELOG.md**

```markdown
# Changelog

All notable changes to Food Diary are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

- [ ] **Step 2: Verify file contents**

Run: `cat CHANGELOG.md`

Expected output: the exact six lines above.

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "Seed CHANGELOG.md for release automation"
```

---

## Task 2: Create release workflow scaffold (trigger, branch gate, version validation)

The smallest workflow that runs end-to-end without side effects: it accepts the version input, refuses non-`main` branches, and validates the version string matches strict semver. No tagging, no build, no publish yet.

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create the workflow file**

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (semver, no v prefix, e.g. 0.4.0)'
        required: true
        type: string

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-22.04
    env:
      VERSION: ${{ inputs.version }}
      IMAGE: pkirilin/food-diary
    steps:
      - name: Validate branch is main
        run: |
          if [[ "${{ github.ref }}" != "refs/heads/main" ]]; then
            echo "::error::Releases can only be cut from main (got ${{ github.ref }})"
            exit 1
          fi

      - name: Validate version format
        run: |
          if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "::error::Version must be strict semver MAJOR.MINOR.PATCH (got '$VERSION')"
            exit 1
          fi
          echo "Version $VERSION is valid"

      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
```

The two cheap validations (branch, version format) run before checkout so a typo fails before any work. Checkout follows because every subsequent step (CHANGELOG read, git tag check, Docker build, tag push, release create) needs the repo on disk. `fetch-depth: 0` brings full history so the later git-tag push is unambiguous.

- [ ] **Step 2: Validate YAML locally**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))" && echo OK`

Expected: `OK` (no traceback).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "Add release workflow scaffold with branch and version validation"
```

---

## Task 3: Add CHANGELOG section validation and notes extraction

Add the third validation (CHANGELOG must contain a `## [<version>]` section) and extract that section's body into a file the later release-creation step will use.

The extraction must handle: header lines like `## [0.4.0]` and `## [0.4.0] - 2026-05-09`; sections that end at the next `## [` header OR at EOF.

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: Test the extraction snippet locally with a sample CHANGELOG**

Create a temporary test file (this is throwaway — do NOT commit):

```bash
cat > /tmp/test-changelog.md <<'EOF'
# Changelog

## [Unreleased]
- Something in flight

## [0.4.0] - 2026-05-09
### Added
- AI suggestions demo screen
- Multi-image upload

### Fixed
- Note recognition reliability

## [0.3.0] - 2026-04-01
- Old stuff
EOF
```

Run the extraction snippet against version `0.4.0`:

```bash
awk -v ver="0.4.0" '
  $0 ~ "^## \\[" ver "\\]([[:space:]]|$)" { found=1; next }
  found && /^## \[/ { exit }
  found { print }
' /tmp/test-changelog.md
```

Expected output (note: leading and trailing blank lines may appear; that is fine):

```
### Added
- AI suggestions demo screen
- Multi-image upload

### Fixed
- Note recognition reliability

```

Run with a missing version to verify empty output:

```bash
awk -v ver="9.9.9" '
  $0 ~ "^## \\[" ver "\\]([[:space:]]|$)" { found=1; next }
  found && /^## \[/ { exit }
  found { print }
' /tmp/test-changelog.md
```

Expected: empty output.

Run with the last section in the file (verify EOF behavior):

```bash
awk -v ver="0.3.0" '
  $0 ~ "^## \\[" ver "\\]([[:space:]]|$)" { found=1; next }
  found && /^## \[/ { exit }
  found { print }
' /tmp/test-changelog.md
```

Expected output: `- Old stuff`

Cleanup: `rm /tmp/test-changelog.md`

- [ ] **Step 2: Add the validation + extraction step to release.yml**

Append after the "Validate version format" step (before any other step):

```yaml
      - name: Validate CHANGELOG section exists and extract release notes
        run: |
          if [[ ! -f CHANGELOG.md ]]; then
            echo "::error::CHANGELOG.md not found at repo root"
            exit 1
          fi
          notes=$(awk -v ver="$VERSION" '
            $0 ~ "^## \\[" ver "\\]([[:space:]]|$)" { found=1; next }
            found && /^## \[/ { exit }
            found { print }
          ' CHANGELOG.md)
          if [[ -z "$(echo "$notes" | tr -d '[:space:]')" ]]; then
            echo "::error::CHANGELOG.md has no '## [$VERSION]' section (or it is empty). Add a section with notes before dispatching."
            exit 1
          fi
          printf "%s\n" "$notes" > release-notes.md
          echo "Extracted release notes for $VERSION:"
          echo "----"
          cat release-notes.md
          echo "----"
```

- [ ] **Step 3: Re-validate YAML**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))" && echo OK`

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "Validate and extract release notes from CHANGELOG.md"
```

---

## Task 4: Add git-tag and Docker-Hub-tag existence checks

Network-bound pre-flight checks that prevent overwriting an already-published version. These run after the local validations (cheap-first ordering) and before any side effect.

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: Test the Docker Hub tag-existence check locally**

The Docker Hub Registry v2 API returns 200 if a tag exists, 404 if not. Verify against a known-existing image:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://hub.docker.com/v2/repositories/library/alpine/tags/latest/"
```

Expected: `200`

Verify against a known-missing tag:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://hub.docker.com/v2/repositories/library/alpine/tags/this-tag-does-not-exist-xyz/"
```

Expected: `404`

- [ ] **Step 2: Add both existence checks to release.yml**

Append after the CHANGELOG validation step:

```yaml
      - name: Check git tag does not already exist
        run: |
          if git ls-remote --exit-code --tags origin "refs/tags/v$VERSION" >/dev/null 2>&1; then
            echo "::error::Git tag v$VERSION already exists on origin"
            exit 1
          fi
          echo "Git tag v$VERSION is available"

      - name: Check Docker Hub tag does not already exist
        run: |
          status=$(curl -s -o /dev/null -w "%{http_code}" \
            "https://hub.docker.com/v2/repositories/${IMAGE}/tags/${VERSION}/")
          if [[ "$status" == "200" ]]; then
            echo "::error::Docker Hub tag ${IMAGE}:${VERSION} already exists"
            exit 1
          elif [[ "$status" != "404" ]]; then
            echo "::error::Unexpected HTTP $status from Docker Hub when checking ${IMAGE}:${VERSION}"
            exit 1
          fi
          echo "Docker Hub tag ${IMAGE}:${VERSION} is available"
```

(The checkout step was added in Task 2 and is already in place; `git ls-remote` queries the remote directly, so it works even on shallow checkouts.)

- [ ] **Step 3: Re-validate YAML**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))" && echo OK`

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "Add git tag and Docker Hub tag existence checks"
```

---

## Task 5: Add Docker build and push

After all pre-flight checks pass, log in to Docker Hub, build the image with Buildx, and push both `<version>` and `latest` tags. This is the first side-effecting step — image appears on Docker Hub if successful.

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: Append the build & push steps**

Append after the Docker Hub tag-existence check:

```yaml
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v4
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v7
        with:
          context: .
          file: ./Dockerfile
          platforms: linux/amd64
          push: true
          tags: |
            ${{ env.IMAGE }}:${{ env.VERSION }}
            ${{ env.IMAGE }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- [ ] **Step 2: Re-validate YAML**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))" && echo OK`

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "Build and push Docker image to Docker Hub"
```

---

## Task 6: Add git tag push and GitHub release creation

After successful image push, create the `v<version>` git tag on the workflow's commit SHA and push it. Then create the GitHub release using the notes file extracted in Task 3.

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: Append the tag and release steps**

Append after the build & push step:

```yaml
      - name: Create and push git tag
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git tag "v$VERSION" "${{ github.sha }}"
          git push origin "v$VERSION"

      - name: Create GitHub release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release create "v$VERSION" \
            --title "v$VERSION" \
            --notes-file release-notes.md
```

- [ ] **Step 2: Re-validate YAML**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))" && echo OK`

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "Push git tag and create GitHub release"
```

---

## Task 7: Update README with Docker Hub badge, Releasing section, and TOC entry

Document the manual part of the release flow so the maintainer (and any future contributor) knows what to do.

**Files:**
- Modify: `README.md` (line 3 for badge; line 22 for TOC; new section after line 204 / before `## Contacts`)

- [ ] **Step 1: Add Docker Hub badge below the existing build badge**

In `README.md`, find this line:

```markdown
[![food-diary](https://github.com/pkirilin/food-diary/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/pkirilin/food-diary/actions/workflows/build.yml)
```

Add this line directly after it:

```markdown
[![Docker Hub](https://img.shields.io/docker/v/pkirilin/food-diary?label=docker)](https://hub.docker.com/r/pkirilin/food-diary)
```

- [ ] **Step 2: Add `Releasing` to the Table of contents**

In the TOC list (around lines 13–23), insert this entry between `- [Development]` (and its sub-items, ending with `Managing database migrations`) and `- [Contacts]`:

```markdown
- [Releasing](#releasing)
```

The relevant TOC region after editing:

```markdown
- [Development]
  - [...existing sub-items...]
  - [Managing database migrations](#managing-database-migrations)
- [Releasing](#releasing)
- [Contacts](#contacts)
```

- [ ] **Step 3: Add the `## Releasing` section before `## Contacts`**

Insert the following block immediately before the `## Contacts` line (currently around line 206):

```markdown
## Releasing

Releases are published to [Docker Hub](https://hub.docker.com/r/pkirilin/food-diary) and as GitHub releases via the [Release workflow](.github/workflows/release.yml).

To cut a new release:

1. On `main`, update `CHANGELOG.md`:
   - Rename the `[Unreleased]` section to `[X.Y.Z] - YYYY-MM-DD`.
   - Add a fresh empty `[Unreleased]` section above it.
2. Commit and push.
3. Go to **Actions → Release → Run workflow**.
4. Enter the version (e.g. `0.4.0`, no `v` prefix) and run.

The workflow validates inputs, builds the image, pushes `pkirilin/food-diary:X.Y.Z` and `pkirilin/food-diary:latest` to Docker Hub, creates the `vX.Y.Z` git tag, and publishes the GitHub release with notes extracted from the matching `CHANGELOG.md` section.

If a release fails partway through (e.g. the image is pushed but the git tag step fails), clean up manually: a re-run of the same version is blocked by the Docker Hub tag-existence check. Either delete the published Docker Hub tag (Docker Hub UI → Tags → Delete), or push the git tag and create the release with `gh` from your machine.
```

- [ ] **Step 4: Verify the README renders sensibly**

Run: `head -5 README.md` and confirm both badges are on consecutive lines.

Run: `grep -n "## Releasing\|## Contacts" README.md` and confirm `## Releasing` appears before `## Contacts`.

Run: `grep -n "Releasing\](#releasing)" README.md` and confirm the TOC entry is present.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Document release workflow in README"
```

---

## Task 8: End-to-end smoke test (cut the first real release)

The pre-flight validations make this safe — the worst case from a typo is a fast-fail with no published artifacts. The smoke test is a real release.

**Preconditions:** All items in the "Preconditions" block at the top of this plan must be done. If any is missing, stop and complete them first.

- [ ] **Step 1: Pick the first release version and decide release-worthy commits**

Decide on a version (e.g. `0.4.0`). Confirm:
- No git tag `v<version>` exists on origin: `git ls-remote --tags origin | grep "v<version>$" || echo "available"`
- No Docker Hub tag exists: `curl -s -o /dev/null -w "%{http_code}\n" "https://hub.docker.com/v2/repositories/pkirilin/food-diary/tags/<version>/"` → expect `404`.

- [ ] **Step 2: Update CHANGELOG.md on `main`**

On `main`, edit `CHANGELOG.md`:

- Rename the `## [Unreleased]` section to `## [<version>] - YYYY-MM-DD` (today's date).
- Add a fresh empty `## [Unreleased]` section above it.
- Fill the version section with the actual notes (Added / Changed / Fixed groups).

Commit and push:

```bash
git add CHANGELOG.md
git commit -m "Prepare CHANGELOG for v<version>"
git push origin main
```

- [ ] **Step 3: Dispatch the workflow**

Either via UI (Actions → Release → Run workflow → enter version) or via CLI:

```bash
gh workflow run release.yml --ref main -f version=<version>
```

Watch the run:

```bash
gh run watch
```

Expected: all steps succeed. If any pre-flight check fails, fix the underlying cause (typically: missing CHANGELOG section, version typo, or already-existing tag) and dispatch again.

- [ ] **Step 4: Verify the published artifacts**

```bash
# Git tag exists on origin
git fetch --tags && git tag --list "v<version>"

# GitHub release exists with notes
gh release view "v<version>"

# Docker Hub tags exist
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://hub.docker.com/v2/repositories/pkirilin/food-diary/tags/<version>/"
# Expected: 200
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://hub.docker.com/v2/repositories/pkirilin/food-diary/tags/latest/"
# Expected: 200
```

- [ ] **Step 5: Pull and run the published image**

```bash
docker pull pkirilin/food-diary:<version>
docker image inspect pkirilin/food-diary:<version> | head -20
```

Expected: image pulls successfully and inspect shows the architecture as `linux/amd64`.

A full smoke run (with a real database, env vars, etc.) is not required for this plan — the purpose is to confirm the release pipeline works end-to-end, not to retest the application.

- [ ] **Step 6: No commit needed**

The smoke test produces tags and releases on remotes — no local file changes. The plan is complete.

---

## Done criteria

- `release.yml` runs cleanly end-to-end with a real version input.
- `pkirilin/food-diary:<version>` and `pkirilin/food-diary:latest` are published to Docker Hub.
- Git tag `v<version>` exists on origin.
- GitHub release `v<version>` exists with notes from `CHANGELOG.md`.
- README documents the manual release-day flow.
- Each pre-flight failure mode (bad branch, bad version, missing CHANGELOG section, existing git tag, existing Docker Hub tag) produces a clear `::error::` message and exits before any side effect.
