# Migrate Food Diary to Node 24 — Design

**Date:** 2026-06-21
**Status:** Paused — blocked by a test-environment incompatibility (see "Migration blocker" below)

## Goal

Move the frontend and E2E JavaScript toolchains from Node 22.15.0 to Node 24
(Krypton LTS), using a loose major-version pin (`24`) rather than an exact patch.
The backend (.NET 8) is untouched.

## Background

Node 22.15.0 is currently pinned across the repo's JS toolchain. Node 24 is the
current Krypton LTS line (latest patch v24.17.0 as of 2026-06-17). The repo
previously used exact patch pins; this migration intentionally switches to a
loose major pin so CI and local environments track the latest 24.x patch
without per-patch maintenance.

## Scope of changes

Seven files reference the Node version:

| File | From | To |
|------|------|-----|
| `src/frontend/.nvmrc` | `22.15.0` | `24` |
| `Dockerfile` | `node:22.15.0-alpine` | `node:24-alpine` |
| `.github/workflows/build.yml` (2 occurrences) | `node-version: '22.15.0'` | `node-version: '24'` |
| `.github/workflows/deploy-demo.yml` (1 occurrence) | `node-version: '22.15.0'` | `node-version: '24'` |
| `src/frontend/package.json` | `engines.node: ">=22 <23"`, `@types/node: ^22.19.21` | `engines.node: ">=24 <25"`, `@types/node: ^24` |
| `tests/package.json` | `@types/node: ^22.15.3` | `@types/node: ^24` |
| `README.md` (2 occurrences) | `Node.js (22 or higher)` | `Node.js (24 or higher)` |

## Dependency resolution

After editing `package.json` files, run `yarn install` (Yarn Berry / PnP) in both
`src/frontend/` and `tests/` to resolve `@types/node ^24` and update each
workspace's lockfile and PnP state. These are independent workspaces — install
must run from inside each directory, not at repo root.

## Verification

- **Frontend** (`src/frontend/`):
  - `yarn build` (tsc + vite build) — confirms TypeScript compiles against Node 24 types.
  - `yarn test` (vitest) — confirms the unit/component test suite passes.
  - `yarn lint` (eslint) — confirms no lint regressions.
- **E2E** (`tests/`):
  - `yarn install` succeeds and the project type-checks.
  - Full Playwright suite is **not** run (it requires the full stack to be up);
    install + type-check is sufficient for this change.
- **Backend:** no changes; not re-verified.

## Risks

Low. Vite 5.4, Yarn Berry, and the rest of the toolchain support Node 24. The
main thing to watch is `@types/node` v24 surfacing stricter or changed type
signatures, which `yarn build` (tsc) will catch.

## Out of scope

- No dependency upgrades beyond `@types/node`.
- No backend / .NET changes.
- No Vite, React, or other major framework bumps.
- No switch to an exact patch pin (loose major pin chosen deliberately).

## Migration blocker (discovered during execution)

Task 1 (the frontend version bump) was implemented and committed on branch
`chore/migrate-node-24`, but **the migration is paused** because Node 24 turns
17 frontend unit/component tests red. Tasks 2–4 were not started.

**Verified behaviour:**
- `src/frontend` test suite: **103/103 passing on Node 22.15.0**, **17 failing
  on Node 24** (`yarn test --run`).
- Failure signature: `TypeError: RequestInit: Expected signal ("AbortSignal {}")
  to be an instance of AbortSignal`. Affected tests receive stale/default data
  (e.g. `70` instead of the MSW-mocked `73`) because mocked requests fail.

**Root cause:** A known incompatibility between `jsdom` + Node 24 + `vitest 2`.
jsdom polyfills the global `AbortSignal`/`AbortController`; Node 24's native
fetch (undici) rejects those polyfilled signals, breaking MSW request
interception. It is *not* caused by `@types/node` and not specific to MSW.
Current relevant versions: `vitest ^2.1.9`, `jsdom ^24.1.3`,
`environment: 'jsdom'`, `msw ^2.14.6`.

> Note: the CI/dev sandbox itself runs Node 24, so a naive "stash the change and
> re-test" check misleadingly reports the failures as pre-existing. The Node-22
> baseline must be exercised with an explicit Node 22 binary (e.g. via nvm).

**Candidate fixes (require a scope decision before resuming):**
- **A — setup-file workaround:** reconcile the `AbortSignal` globals in
  `src/frontend/tests/setup.ts`. Smallest change; needs a spike to confirm it
  clears all 17 failures.
- **B — swap `jsdom` → `happy-dom`:** happy-dom does not polyfill those globals.
  Adds/removes a dependency and requires re-verifying all 103 tests.
- **C — upgrade `vitest` to v4:** fixes the root cause upstream; larger
  breaking-change surface.

References: mswjs/msw discussion #2530, vitest-dev/vitest #8374,
reduxjs/redux-toolkit #4966.
