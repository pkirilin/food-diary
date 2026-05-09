# Release automation via GitHub Actions

## Goal

Automate the manual release process for Food Diary so cutting a release becomes:
write notes in `CHANGELOG.md`, click "Run workflow", type a version. The workflow
handles tagging, image build, Docker Hub publish, and GitHub release creation.

The current manual process is:

1. Pick a version (e.g. `0.4.0`) and tag (`v0.4.0`).
2. Build the Docker image with that tag.
3. Write release notes from recent changes.
4. Create a GitHub release with the tag and notes.
5. Push the image to Docker Hub repo `pkirilin/food-diary` (public, owned by the maintainer).

## Scope

In scope:

- A new `.github/workflows/release.yml` with `workflow_dispatch` trigger.
- Conventions for `CHANGELOG.md` (new file) and how the workflow extracts notes from it.
- Docker Hub publishing of `pkirilin/food-diary:<version>` and `pkirilin/food-diary:latest`.
- GitHub release creation with notes extracted from `CHANGELOG.md`.
- README updates documenting the manual part of the release flow.
- Required GitHub repo configuration (one variable, one secret).

Out of scope:

- Changes to existing `build.yml`, `deploy.yml`, `deploy-demo.yml` (they cover CI and the
  private Yandex Cloud deploy — independent concern from public Docker Hub releases).
- Pre-release / build-metadata version formats (e.g. `0.4.0-rc.1`, `0.4.0+build.5`).
- Multi-arch images (amd64 + arm64). Single architecture only for now.
- Automated changelog generation, conventional commits, release-please, or any
  auto-version scheme. Notes are written by hand.
- Auto-cleanup on partial failure. Manual cleanup is acceptable.

## Design

### Workflow trigger and inputs

`workflow_dispatch` only. One input:

- `version` — required string, e.g. `0.4.0` (no `v` prefix; the workflow adds `v` where
  it is needed for the git tag and GitHub release).

The workflow refuses to run unless `github.ref == 'refs/heads/main'`.

### Pre-flight validations (fail fast, before any side effect)

All of these run before tag creation, image build, Docker push, or release creation.
If any fails, the workflow exits with a clear error and nothing has been published.

1. **Branch gate** — `github.ref` must be `refs/heads/main`.
2. **Version format** — must match `^\d+\.\d+\.\d+$` (strict semver, no pre-release or
   build metadata).
3. **Git tag does not already exist** — refuse if `v<version>` is already on the remote.
4. **Docker Hub tag does not already exist** — refuse if `pkirilin/food-diary:<version>`
   is already published. Prevents accidental overwrite of an immutable version.
5. **CHANGELOG.md section exists** — refuse if no `## [<version>]` header is found in
   `CHANGELOG.md`. The `[Unreleased]` section is optional and is **not** validated;
   it exists by convention so notes can be written incrementally as PRs land, but the
   maintainer may also write all notes at release time.

### CHANGELOG.md convention

New file at repo root: `CHANGELOG.md`. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

```markdown
# Changelog

All notable changes to Food Diary are documented here.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]
### Added
- New thing in flight

## [0.4.0] - 2026-05-09
### Added
- AI suggestions demo screen
- Multi-image upload for product detection

### Changed
- Migrated to react-router v7

### Fixed
- Note recognition reliability issues
```

The workflow does **not** modify `CHANGELOG.md`. Bumping `[Unreleased]` to
`[X.Y.Z] - <date>` is a manual commit on `main` made before dispatching the workflow.
Reasons:

- Keeps the workflow's side-effect surface small (no commits back to main, no PRs, no
  elevated `GITHUB_TOKEN` permissions for branch writes).
- The CHANGELOG-section validation already enforces that the bump happened.
- The bump is a normal, reviewable commit in git history.

### Note extraction

A workflow step reads the slice of `CHANGELOG.md` between the line `## [<version>]`
and the next `## [` header (exclusive). The version header line itself is excluded.
If the section is the last one in the file, the slice extends to EOF. That slice is
the GitHub release body.

A small `awk`/`sed` script is sufficient. Implementation can refine the exact tool;
the contract is: input is `CHANGELOG.md` + version string, output is the markdown
body of the matching version section.

### Build and publish

Single workflow, single job, sequential steps:

1. **Checkout** at `main`.
2. **Validate inputs** (all pre-flight checks above).
3. **Extract release notes** from `CHANGELOG.md` into a workflow output / file.
4. **Set up Docker Buildx** (`docker/setup-buildx-action@v3`).
5. **Log in to Docker Hub** (`docker/login-action@v3`) using
   `vars.DOCKERHUB_USERNAME` and `secrets.DOCKERHUB_TOKEN`.
6. **Build and push** (`docker/build-push-action@v6`):
   - Platforms: `linux/amd64`.
   - Tags: `pkirilin/food-diary:<version>`, `pkirilin/food-diary:latest`.
   - Cache: GitHub Actions cache (`cache-from: type=gha`, `cache-to: type=gha,mode=max`)
     for layer reuse across releases.
   - Dockerfile: existing repo-root `Dockerfile` (no changes needed).
7. **Create and push git tag** `v<version>` on the workflow's commit SHA.
8. **Create GitHub release** via `gh release create v<version> --title "v<version>"
   --notes-file <path>` using the built-in `GITHUB_TOKEN`.

#### Why this ordering

Docker push first, then git tag, then GitHub release. Failure semantics:

- Build fails → no tag, no release, nothing on Docker Hub. Clean rerun.
- Tag push fails (rare) → image is on Docker Hub but no tag and no release. Rerun is
  blocked by the Docker Hub tag-exists validation, signaling that manual cleanup is
  needed (delete the published Docker Hub tag, or push the git tag and create the
  release manually with `gh`).
- GitHub release creation fails → image and tag exist; create the release manually.

Manual cleanup on partial failure is acceptable for a personal-scope project.
The pre-flight validations make the most common failure mode (typo, duplicate version,
missing notes) impossible.

### Permissions

The workflow needs:

```yaml
permissions:
  contents: write   # for git tag push and release creation
```

### Required repo configuration

To be added once, before the first release run:

- **Variable** (Settings → Secrets and variables → Actions → Variables):
  - `DOCKERHUB_USERNAME` = `pkirilin`
- **Secret** (Settings → Secrets and variables → Actions → Secrets):
  - `DOCKERHUB_TOKEN` = a Docker Hub Access Token with read+write+delete scope on
    `pkirilin/food-diary` (created at Docker Hub → Account Settings → Personal access tokens).

### README updates

Add a new top-level `## Releasing` section between `## Development` and `## Contacts`
in `README.md`:

```markdown
## Releasing

Releases are published to [Docker Hub](https://hub.docker.com/r/pkirilin/food-diary)
and as GitHub releases via the [Release workflow](.github/workflows/release.yml).

To cut a new release:

1. On `main`, update `CHANGELOG.md`:
   - Rename the `[Unreleased]` section to `[X.Y.Z] - YYYY-MM-DD`.
   - Add a fresh empty `[Unreleased]` section above it.
2. Commit and push.
3. Go to Actions → **Release** → **Run workflow**.
4. Enter the version (e.g. `0.4.0`, no `v` prefix) and run.

The workflow validates inputs, builds the image, pushes
`pkirilin/food-diary:X.Y.Z` and `pkirilin/food-diary:latest` to Docker Hub,
creates the `vX.Y.Z` git tag, and publishes the GitHub release with notes
extracted from the matching `CHANGELOG.md` section.
```

Add a Docker Hub badge near the existing build badge at the top of the README:

```markdown
[![Docker Hub](https://img.shields.io/docker/v/pkirilin/food-diary?label=docker)](https://hub.docker.com/r/pkirilin/food-diary)
```

## Files changed by this work

- `.github/workflows/release.yml` (new)
- `CHANGELOG.md` (new, with at least an `[Unreleased]` section seeded; no version
  sections required at design-doc-merge time)
- `README.md` (add `## Releasing` section, add Docker Hub badge)

## Manual setup steps required from the maintainer

These cannot be done by the workflow itself and must be performed before the first
release dispatch:

1. Create Docker Hub repo `pkirilin/food-diary` if not already public.
2. Create a Docker Hub Access Token.
3. Add `DOCKERHUB_USERNAME` variable and `DOCKERHUB_TOKEN` secret to the GitHub repo.

## Open questions / future extensions

Deferred — not part of this spec, but worth noting for later:

- Multi-arch images (`linux/arm64`) for self-hosters on Apple Silicon / Raspberry Pi.
- Pre-release versions (`-rc.N`) without writing to `latest`.
- Automated CHANGELOG bump (workflow opens a PR that renames `[Unreleased]` to the
  new version) so the only manual action is approving the PR before dispatch.
- Verifying the most recent `build.yml` run on the release SHA succeeded before
  publishing (currently relies on maintainer judgment that `main` is green).
