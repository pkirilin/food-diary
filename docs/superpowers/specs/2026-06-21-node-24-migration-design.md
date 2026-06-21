# Migrate Food Diary to Node 24 — Design

**Date:** 2026-06-21
**Status:** Completed — implemented on branch `chore/migrate-node-24`; both
execution blockers resolved (see "Migration blockers" below). Verified green on
Node 24: frontend lint/build/test (103 passing) and tests lint/tsc.

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

- No backend / .NET changes.
- No switch to an exact patch pin (loose major pin chosen deliberately).

> **Scope note:** the original spec scoped out all dependency/tooling changes
> beyond `@types/node`. Two execution blockers (below) forced two sanctioned
> scope additions, both approved by the maintainer: (1) vite 8 + vitest 4 to
> fix the test environment, and (2) switching both yarn workspaces from PnP to
> the node-modules linker to fix lint under Node 24.

## Migration blockers (encountered and resolved during execution)

Two Node-24-specific blockers surfaced that the original spec did not
anticipate. Both were confirmed by running each workspace under an explicit
Node 22 binary (pass) vs Node 24 (fail) — important because the dev/CI sandbox
itself runs Node 24, so a naive "stash and re-test" misleadingly reports these
as pre-existing.

### Blocker 1 — frontend tests (jsdom + Node 24)

- **Symptom:** 17 frontend tests failed on Node 24 (`TypeError: RequestInit:
  Expected signal … to be an instance of AbortSignal`); mocked requests fell
  through to stale data (e.g. `70` instead of the MSW-mocked `73`). 103/103
  passed on Node 22.
- **Root cause:** known `jsdom` + Node 24 + `vitest 2` incompatibility — jsdom
  polyfills `AbortSignal`/`AbortController`, which Node 24's native fetch
  (undici) rejects, breaking MSW interception. Not caused by `@types/node`.
- **Resolution:** maintainer upgraded **vite → 8 and vitest → 4** (fixes it
  upstream). Frontend suite now 103/103 on Node 24.

### Blocker 2 — lint under Yarn PnP (both workspaces)

- **Symptom:** `yarn lint` failed on Node 24 in both workspaces — frontend with
  `Cannot read config file … <pkg>.zip` and tests with `EBADF: bad file
  descriptor, fstat`. Both passed on Node 22. CI runs `yarn lint` in the
  frontend and e2e jobs, so this gated the migration.
- **Root cause:** Yarn PnP's experimental ESM loader is incompatible with Node
  24 when loading CJS modules from the zip cache (surfaced via ESLint's legacy
  config loader). Bumping Yarn 4.16 → 4.17 did not fix it.
- **Resolution:** switched both workspaces from PnP to the **node-modules
  linker** (`nodeLinker: node-modules`), removed the committed `.pnp.*` files
  and zero-install cache, and gitignored `.yarn/cache`. Lint, build, test, and
  tsc all pass on Node 24.

References: mswjs/msw discussion #2530, vitest-dev/vitest #8374,
reduxjs/redux-toolkit #4966.
