# GitHub Actions Node 24 Migration — Design

**Date:** 2026-06-23
**Branch:** `chore/migrate-node-24`
**Status:** Approved

## Problem

After migrating the project to Node.js 24, every GitHub Actions run logs a
deprecation warning: several actions still target the Node 20 runtime and are
being force-run on Node 24. We want to bump all Node-based actions to their
current major versions (all of which ship on the Node 24 runtime) so the
warnings disappear and the CI tooling stays consistent with the project's
Node version.

## Approach

Bump every Node-based action to its current major, referenced by **floating
major tag** (e.g. `@v7`) to match the repository's existing convention.
Three workflow files change substantively; `release.yml`'s Docker actions are
already on Node 24 majors and need only a `checkout` consistency bump.

### Verified current versions (June 2026)

All targets below run on the Node 24 runtime (confirmed via each action's
`action.yml` `runs.using` and/or release notes):

| Action | Current in repo | Target |
|---|---|---|
| `actions/checkout` | `v4` (×7) + `v6` (release.yml) | `v7` |
| `actions/setup-node` | `v4` | `v6` |
| `actions/setup-dotnet` | `v4` | `v5` |
| `actions/upload-artifact` | `v4` | `v7` |
| `actions/upload-pages-artifact` | `v3` | `v5` |
| `actions/deploy-pages` | `v4` | `v5` |
| `yc-actions/yc-cr-login` | `v2` | `v3` |
| `yc-actions/yc-sls-container-deploy` | `v2` | `v4` |

**Already on Node 24 — no change:** `docker/setup-buildx-action@v4`,
`docker/login-action@v4`, `docker/build-push-action@v7`. These were absent from
the deprecation warnings, confirming they already run on Node 24.

## Changes by file

### `.github/workflows/build.yml`
- `actions/checkout@v4` → `@v7` (5 occurrences: lines 18, 38, 61, 90, 104)
- `actions/setup-dotnet@v4` → `@v5` (lines 20, 92)
- `actions/setup-node@v4` → `@v6` (lines 39, 65)
- `actions/upload-artifact@v4` → `@v7` (line 76)
- `yc-actions/yc-cr-login@v2` → `@v3` (line 108)
- `yc-actions/yc-sls-container-deploy@v2` → `@v4` (line 124)

### `.github/workflows/deploy.yml`
- `actions/checkout@v4` → `@v7` (lines 15, 28)
- `actions/setup-dotnet@v4` → `@v5` (line 17)
- `yc-actions/yc-cr-login@v2` → `@v3` (line 32)
- `yc-actions/yc-sls-container-deploy@v2` → `@v4` (line 47)

### `.github/workflows/deploy-demo.yml`
- `actions/checkout@v4` → `@v7` (line 26)
- `actions/setup-node@v4` → `@v6` (line 29)
- `actions/upload-pages-artifact@v3` → `@v5` (line 50)
- `actions/deploy-pages@v4` → `@v5` (line 63)

### `.github/workflows/release.yml`
- `actions/checkout@v6` → `@v7` (line 37) — consistency only; Docker actions
  already on Node 24 majors, left untouched.

## Risk assessment

**Low risk — official `actions/*` bumps.** The inputs the workflows pass are
stable across these majors: `node-version`, `dotnet-version`, `path`, `cache`,
`cache-dependency-path`, `retention-days`, `fetch-depth`. The
`upload-pages-artifact` → `deploy-pages` pair is bumped together (both to v5)
so the Pages artifact format stays compatible between producer and consumer.

**Primary risk — third-party `yc-actions`.** `yc-cr-login` is a +1 major jump
and `yc-sls-container-deploy` is a **+2 major jump (v2 → v4)**, carrying ~13
inputs (`yc-sa-json-credentials`, `container-name`, `folder-id`, `public`,
`revision-image-url`, `revision-service-account-id`, `revision-cores`,
`revision-memory`, `revision-core-fraction`, `revision-concurrency`,
`revision-execution-timeout`, `revision-provisioned`, `revision-env`,
`revision-secrets`) that could have been renamed, removed, or made required
across majors. These get an explicit static input-compatibility check before
the bump is trusted.

## `yc-actions` static verification — DONE (2026-06-23)

Performed during the design stage against each target tag's `action.yml`.

**`yc-cr-login@v3`** — workflow passes only `yc-sa-json-credentials`, which
remains a valid (optional) input. No change needed.

**`yc-sls-container-deploy@v4`** — all 14 inputs the workflow passes still
exist, none renamed or removed:
`yc-sa-json-credentials`, `container-name` (required, provided),
`folder-id` (required, provided), `public`,
`revision-image-url` (required, provided), `revision-service-account-id`,
`revision-cores`, `revision-memory`, `revision-core-fraction`,
`revision-concurrency`, `revision-execution-timeout`, `revision-provisioned`,
`revision-env`, `revision-secrets`. The three inputs that are `required: true`
in v4 are all already supplied. v4 adds new optional inputs (mounts, logging,
networking) but none are required.

**Conclusion:** no workflow changes are needed beyond the version-tag bumps for
either `yc-action`.

## Verification strategy (remaining, at implementation time)
1. **Lint.** Run `actionlint` on the three changed workflows if available;
   otherwise note it was skipped.
2. **CI as live test.** `build.yml` runs on every push, so pushing the branch
   exercises `checkout`, `setup-dotnet`, `setup-node`, `upload-artifact`, and
   (in the main-gated jobs, which are skipped off `main` but whose action
   versions still resolve) `yc-cr-login` / `yc-sls-container-deploy`
   end-to-end. The deploy/release/deploy-demo workflows are manual or
   main-only and are verified statically — their `yc-actions` deploy jobs are
   **not** run, by the user's explicit choice (they touch live YC infra and
   require YC secrets).

## Documentation

No documentation changes expected. Action versions are not referenced in
`README.md` or `CLAUDE.md`, and the Node 24 migration docs are already
complete. Confirm there is no stray reference during implementation.

## Out of scope

- SHA-pinning of actions and Dependabot configuration.
- Any change to Docker actions (already Node 24).
- Runner image (`ubuntu-22.04`), `dotnet-version`, or `node-version` changes.
- Running the YC deploy jobs.
