# Node 24 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the frontend and E2E JavaScript toolchains from Node 22.15.0 to Node 24 (Krypton LTS), using a loose major-version pin.

**Architecture:** Pure configuration migration across 7 files. Bump the Node version references (`.nvmrc`, `Dockerfile`, CI workflows, `engines`), bump `@types/node` to `^24` in both yarn workspaces, refresh the lockfiles via `yarn install`, and update README prose. No application code or backend (.NET 8) changes.

**Tech Stack:** Node 24, Yarn Berry (PnP), Vite 5.4, TypeScript 5.9 (frontend) / 5.3 (tests), Playwright, GitHub Actions, Docker.

## Global Constraints

- Node version target: loose major pin `24` (NOT an exact patch like `24.17.0`).
- `engines.node` range: `>=24 <25`.
- `@types/node`: `^24` in both `src/frontend/` and `tests/` workspaces.
- `src/frontend/` and `tests/` are independent Yarn Berry (PnP) workspaces — run `yarn` from inside each directory, never at repo root.
- Backend (.NET 8) is untouched and not re-verified.
- Full Playwright E2E suite is NOT run; the `tests/` workspace is verified by install + type-check only.

---

### Task 1: Bump frontend workspace to Node 24

**Files:**
- Modify: `src/frontend/.nvmrc`
- Modify: `src/frontend/package.json` (`engines.node` and `@types/node`)
- Test (verify): `src/frontend/` build, unit tests, lint

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a frontend workspace whose `.nvmrc` reads `24`, `engines.node` is `>=24 <25`, and `@types/node` is `^24`, with an updated `yarn.lock`. Later tasks (Docker, CI) rely on the same `24` major and the refreshed lockfile.

- [ ] **Step 1: Set `.nvmrc` to the Node 24 major**

Replace the entire contents of `src/frontend/.nvmrc` (currently `22.15.0`) with:

```
24
```

- [ ] **Step 2: Update `engines.node` in `src/frontend/package.json`**

Find (around line 93-95):

```json
  "engines": {
    "node": ">=22 <23"
  }
```

Replace with:

```json
  "engines": {
    "node": ">=24 <25"
  }
```

- [ ] **Step 3: Bump `@types/node` in `src/frontend/package.json`**

Find (around line 46):

```json
    "@types/node": "^22.19.21",
```

Replace with:

```json
    "@types/node": "^24",
```

- [ ] **Step 4: Refresh the lockfile**

Run from inside `src/frontend/`:

```bash
cd src/frontend && yarn install
```

Expected: completes without errors; `yarn.lock` and `.pnp.cjs` updated to resolve `@types/node@^24`.

- [ ] **Step 5: Verify the build compiles against Node 24 types**

Run from inside `src/frontend/`:

```bash
yarn build
```

Expected: `tsc && vite build` completes with no TypeScript errors and produces `dist/`.

- [ ] **Step 6: Verify unit/component tests pass**

Run from inside `src/frontend/`:

```bash
yarn test --run
```

Expected: vitest runs once (non-watch) and all tests PASS.

- [ ] **Step 7: Verify lint passes**

Run from inside `src/frontend/`:

```bash
yarn lint
```

Expected: eslint reports no errors.

- [ ] **Step 8: Commit**

```bash
git add src/frontend/.nvmrc src/frontend/package.json src/frontend/yarn.lock src/frontend/.pnp.cjs src/frontend/.pnp.loader.mjs
git commit -m "chore(frontend): migrate to Node 24"
```

(Include only the PnP files that actually changed — check `git status` first; some repos do not track `.pnp.loader.mjs`.)

---

### Task 2: Bump tests (E2E) workspace to Node 24 types

**Files:**
- Modify: `tests/package.json` (`@types/node`)
- Test (verify): `tests/` install + `tsc --noEmit`

**Interfaces:**
- Consumes: the `24` major established in Task 1 (no code dependency; conceptual alignment).
- Produces: a `tests/` workspace resolving `@types/node@^24` with a refreshed lockfile that type-checks under Playwright's TypeScript config.

- [ ] **Step 1: Bump `@types/node` in `tests/package.json`**

Find (line 20):

```json
    "@types/node": "^22.15.3",
```

Replace with:

```json
    "@types/node": "^24",
```

- [ ] **Step 2: Refresh the lockfile**

Run from inside `tests/`:

```bash
cd tests && yarn install
```

Expected: completes without errors; `tests/yarn.lock` and PnP state updated.

- [ ] **Step 3: Verify the workspace type-checks**

Run from inside `tests/`:

```bash
yarn tsc --noEmit
```

Expected: TypeScript reports no errors against `tests/tsconfig.json`. (The full Playwright suite is intentionally not run — see Global Constraints.)

- [ ] **Step 4: Verify lint passes**

Run from inside `tests/`:

```bash
yarn lint
```

Expected: eslint reports no errors.

- [ ] **Step 5: Commit**

```bash
git add tests/package.json tests/yarn.lock tests/.pnp.cjs
git commit -m "chore(tests): bump @types/node to v24"
```

(Check `git status` and add only the PnP files that actually changed.)

---

### Task 3: Update Docker and CI to Node 24

**Files:**
- Modify: `Dockerfile` (frontend build stage)
- Modify: `.github/workflows/build.yml:41` and `.github/workflows/build.yml:67`
- Modify: `.github/workflows/deploy-demo.yml:31`

**Interfaces:**
- Consumes: the `24` major from Task 1.
- Produces: container and CI environments pinned to Node 24, matching the workspace `engines` floor.

- [ ] **Step 1: Update the Dockerfile frontend stage**

Find in `Dockerfile`:

```dockerfile
FROM node:22.15.0-alpine AS frontend
```

Replace with:

```dockerfile
FROM node:24-alpine AS frontend
```

- [ ] **Step 2: Update both `node-version` entries in `build.yml`**

In `.github/workflows/build.yml`, replace both occurrences (lines 41 and 67):

```yaml
          node-version: '22.15.0'
```

with:

```yaml
          node-version: '24'
```

(Note: the two occurrences have different indentation — line 41 under `with:` at one nesting level, line 67 at another. Match each line's existing indentation exactly; only the value changes.)

- [ ] **Step 3: Update `node-version` in `deploy-demo.yml`**

In `.github/workflows/deploy-demo.yml`, replace the occurrence on line 31:

```yaml
          node-version: '22.15.0'
```

with:

```yaml
          node-version: '24'
```

- [ ] **Step 4: Verify no stale `22.15.0` references remain in infra/CI**

Run from repo root:

```bash
grep -rn "22.15.0" Dockerfile .github/workflows/
```

Expected: no output (exit code 1).

- [ ] **Step 5: Commit**

```bash
git add Dockerfile .github/workflows/build.yml .github/workflows/deploy-demo.yml
git commit -m "ci: pin Docker and GitHub Actions to Node 24"
```

---

### Task 4: Update README Node version references

**Files:**
- Modify: `README.md:90` and `README.md:148`

**Interfaces:**
- Consumes: the `24` target.
- Produces: documentation consistent with the new Node floor.

- [ ] **Step 1: Update both Node.js version mentions**

In `README.md`, replace both occurrences (lines 90 and 148):

```markdown
- [Node.js](https://nodejs.org/en) (22 or higher)
```

with:

```markdown
- [Node.js](https://nodejs.org/en) (24 or higher)
```

- [ ] **Step 2: Verify no stale Node-22 references remain anywhere**

Run from repo root:

```bash
grep -rn -E "node.*22|22.*node" README.md ; grep -rn "22.15.0" . --include="*.json" --include="*.yml" --include="*.nvmrc" --include="Dockerfile" --include="*.md"
```

Expected: no Node-22 version references remain (the `@types/node` entries now read `^24`, `.nvmrc` reads `24`). Ignore any unrelated matches (e.g. a dependency that legitimately contains "22" in its version).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update Node.js requirement to 24"
```

---

## Self-Review Notes

**Spec coverage** — all 7 files from the spec table are covered:
- `src/frontend/.nvmrc` → Task 1 Step 1
- `src/frontend/package.json` (engines + @types/node) → Task 1 Steps 2-3
- `tests/package.json` (@types/node) → Task 2 Step 1
- `Dockerfile` → Task 3 Step 1
- `.github/workflows/build.yml` (×2) → Task 3 Step 2
- `.github/workflows/deploy-demo.yml` (×1) → Task 3 Step 3
- `README.md` (×2) → Task 4 Step 1

Dependency resolution (`yarn install` in both workspaces) → Task 1 Step 4, Task 2 Step 2.
Verification (frontend build/test/lint; tests install + type-check; E2E NOT run) → Task 1 Steps 5-7, Task 2 Steps 3-4.

**Placeholder scan** — no TBD/TODO; every code/config change shows exact before/after content.

**Type consistency** — single shared value `24` / `^24` / `>=24 <25` used consistently across all tasks.
