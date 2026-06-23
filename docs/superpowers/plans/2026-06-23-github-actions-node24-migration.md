# GitHub Actions Node 24 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump every Node-based GitHub Action to its current Node-24 major so the "Node.js 20 is deprecated" warnings disappear.

**Architecture:** Pure version-tag edits across four workflow files. No workflow body/logic changes — the `yc-actions` input compatibility was already verified statically during design (all passed inputs still exist in the new majors). Each file is an independently reviewable task; a final task runs a repo-wide sweep and triggers CI.

**Tech Stack:** GitHub Actions (YAML), floating major tags.

## Global Constraints

- Reference actions by **floating major tag** (e.g. `@v7`), matching the repo's existing convention. No SHA pinning.
- Do **not** modify Docker actions (`docker/setup-buildx-action@v4`, `docker/login-action@v4`, `docker/build-push-action@v7`) — already on Node 24.
- Do **not** change workflow logic, `runs-on` images, `dotnet-version`, `node-version`, or any action inputs. Versions only.
- Target versions (verified June 2026, all Node 24): `actions/checkout@v7`, `actions/setup-node@v6`, `actions/setup-dotnet@v5`, `actions/upload-artifact@v7`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`, `yc-actions/yc-cr-login@v3`, `yc-actions/yc-sls-container-deploy@v4`.
- Branch: `chore/migrate-node-24` (already checked out).

---

### Task 1: Bump actions in `build.yml`

**Files:**
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks (each task is independent).

- [ ] **Step 1: Confirm the current versions present (pre-check)**

Run:
```bash
grep -nE 'uses: (actions|yc-actions)/' .github/workflows/build.yml
```
Expected output (versions to be replaced):
```
actions/checkout@v4   (×5: lines 18, 38, 61, 90, 104)
actions/setup-dotnet@v4   (×2: lines 20, 92)
actions/setup-node@v4   (×2: lines 39, 65)
actions/upload-artifact@v4   (×1: line 76)
yc-actions/yc-cr-login@v2   (×1: line 108)
yc-actions/yc-sls-container-deploy@v2   (×1: line 124)
```

- [ ] **Step 2: Apply the version bumps**

Make these exact string replacements in `.github/workflows/build.yml` (replace **all** occurrences of each):

| Find | Replace |
|---|---|
| `actions/checkout@v4` | `actions/checkout@v7` |
| `actions/setup-dotnet@v4` | `actions/setup-dotnet@v5` |
| `actions/setup-node@v4` | `actions/setup-node@v6` |
| `actions/upload-artifact@v4` | `actions/upload-artifact@v7` |
| `yc-actions/yc-cr-login@v2` | `yc-actions/yc-cr-login@v3` |
| `yc-actions/yc-sls-container-deploy@v2` | `yc-actions/yc-sls-container-deploy@v4` |

- [ ] **Step 3: Verify no stale versions remain**

Run:
```bash
grep -nE 'checkout@v4|setup-dotnet@v4|setup-node@v4|upload-artifact@v4|yc-cr-login@v2|yc-sls-container-deploy@v2' .github/workflows/build.yml
```
Expected: **no output** (exit code 1).

- [ ] **Step 4: Verify the new versions are present with correct counts**

Run:
```bash
grep -coE 'checkout@v7' .github/workflows/build.yml   # expect 5
grep -coE 'setup-dotnet@v5' .github/workflows/build.yml   # expect 2
grep -coE 'setup-node@v6' .github/workflows/build.yml   # expect 2
grep -coE 'upload-artifact@v7|yc-cr-login@v3|yc-sls-container-deploy@v4' .github/workflows/build.yml   # expect 3
```
Expected: `5`, `2`, `2`, `3`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/build.yml
git commit -m "ci: bump build.yml actions to Node 24 majors"
```

---

### Task 2: Bump actions in `deploy.yml`

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm the current versions present (pre-check)**

Run:
```bash
grep -nE 'uses: (actions|yc-actions)/' .github/workflows/deploy.yml
```
Expected (versions to be replaced):
```
actions/checkout@v4   (×2: lines 15, 28)
actions/setup-dotnet@v4   (×1: line 17)
yc-actions/yc-cr-login@v2   (×1: line 32)
yc-actions/yc-sls-container-deploy@v2   (×1: line 47)
```

- [ ] **Step 2: Apply the version bumps**

Make these exact string replacements in `.github/workflows/deploy.yml` (replace **all** occurrences of each):

| Find | Replace |
|---|---|
| `actions/checkout@v4` | `actions/checkout@v7` |
| `actions/setup-dotnet@v4` | `actions/setup-dotnet@v5` |
| `yc-actions/yc-cr-login@v2` | `yc-actions/yc-cr-login@v3` |
| `yc-actions/yc-sls-container-deploy@v2` | `yc-actions/yc-sls-container-deploy@v4` |

- [ ] **Step 3: Verify no stale versions remain**

Run:
```bash
grep -nE 'checkout@v4|setup-dotnet@v4|yc-cr-login@v2|yc-sls-container-deploy@v2' .github/workflows/deploy.yml
```
Expected: **no output** (exit code 1).

- [ ] **Step 4: Verify the new versions are present with correct counts**

Run:
```bash
grep -coE 'checkout@v7' .github/workflows/deploy.yml   # expect 2
grep -coE 'setup-dotnet@v5|yc-cr-login@v3|yc-sls-container-deploy@v4' .github/workflows/deploy.yml   # expect 3
```
Expected: `2`, `3`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: bump deploy.yml actions to Node 24 majors"
```

---

### Task 3: Bump actions in `deploy-demo.yml`

**Files:**
- Modify: `.github/workflows/deploy-demo.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm the current versions present (pre-check)**

Run:
```bash
grep -nE 'uses: actions/' .github/workflows/deploy-demo.yml
```
Expected (versions to be replaced):
```
actions/checkout@v4   (×1: line 26)
actions/setup-node@v4   (×1: line 29)
actions/upload-pages-artifact@v3   (×1: line 50)
actions/deploy-pages@v4   (×1: line 63)
```

- [ ] **Step 2: Apply the version bumps**

Make these exact string replacements in `.github/workflows/deploy-demo.yml`:

| Find | Replace |
|---|---|
| `actions/checkout@v4` | `actions/checkout@v7` |
| `actions/setup-node@v4` | `actions/setup-node@v6` |
| `actions/upload-pages-artifact@v3` | `actions/upload-pages-artifact@v5` |
| `actions/deploy-pages@v4` | `actions/deploy-pages@v5` |

- [ ] **Step 3: Verify no stale versions remain**

Run:
```bash
grep -nE 'checkout@v4|setup-node@v4|upload-pages-artifact@v3|deploy-pages@v4' .github/workflows/deploy-demo.yml
```
Expected: **no output** (exit code 1).

- [ ] **Step 4: Verify the new versions are present**

Run:
```bash
grep -coE 'checkout@v7|setup-node@v6|upload-pages-artifact@v5|deploy-pages@v5' .github/workflows/deploy-demo.yml
```
Expected: `4`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy-demo.yml
git commit -m "ci: bump deploy-demo.yml actions to Node 24 majors"
```

---

### Task 4: Unify `checkout` in `release.yml`

**Files:**
- Modify: `.github/workflows/release.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

Note: `release.yml`'s Docker actions are already on Node 24 majors and stay untouched. Only the `checkout@v6` reference is bumped for consistency.

- [ ] **Step 1: Confirm the current version present (pre-check)**

Run:
```bash
grep -n 'actions/checkout' .github/workflows/release.yml
```
Expected:
```
37:        uses: actions/checkout@v6
```

- [ ] **Step 2: Apply the version bump**

Replace in `.github/workflows/release.yml`:

| Find | Replace |
|---|---|
| `actions/checkout@v6` | `actions/checkout@v7` |

- [ ] **Step 3: Verify**

Run:
```bash
grep -n 'actions/checkout@v6' .github/workflows/release.yml   # expect no output
grep -n 'actions/checkout@v7' .github/workflows/release.yml   # expect line 37
```
Expected: first command no output (exit 1); second shows `37: ... actions/checkout@v7`.

- [ ] **Step 4: Confirm Docker actions are untouched**

Run:
```bash
grep -nE 'docker/(setup-buildx-action@v4|login-action@v4|build-push-action@v7)' .github/workflows/release.yml
```
Expected: three lines (89, 92, 98) — unchanged.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: bump release.yml checkout to v7 for consistency"
```

---

### Task 5: Repo-wide verification and CI trigger

**Files:**
- None modified. Verification only.

**Interfaces:**
- Consumes: the four edited workflow files.
- Produces: nothing.

- [ ] **Step 1: Confirm zero Node-20-era versions remain anywhere**

Run:
```bash
grep -rnE 'checkout@v[456]|setup-node@v[45]|setup-dotnet@v4|upload-artifact@v[456]|upload-pages-artifact@v[34]|deploy-pages@v4|yc-cr-login@v2|yc-sls-container-deploy@v[23]' .github/workflows/
```
Expected: **no output** (exit code 1). Any match is a missed bump — fix it before continuing.

Also confirm no docs reference pinned action versions (spec expects none):
```bash
grep -rnE '(actions|yc-actions)/[a-z-]+@v[0-9]' README.md CLAUDE.md 2>/dev/null || echo "No action versions referenced in docs — nothing to update"
```
Expected: `No action versions referenced in docs — nothing to update`. If a match appears, update it to the new version and include it in the relevant commit.

- [ ] **Step 2: Confirm the full target set is present**

Run:
```bash
grep -rhoE 'uses: \S+' .github/workflows/ | sed 's/uses: //' | sort | uniq -c | sort -rn
```
Expected to include (counts may vary): `actions/checkout@v7`, `actions/setup-node@v6`, `actions/setup-dotnet@v5`, `actions/upload-artifact@v7`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`, `yc-actions/yc-cr-login@v3`, `yc-actions/yc-sls-container-deploy@v4`, plus the unchanged `docker/*` entries. No `@v2`/`@v3`/`@v4`/`@v6` for the migrated `actions/*`/`yc-actions/*`.

- [ ] **Step 3 (optional): Lint workflows with actionlint via Docker**

`actionlint` is not installed locally. If Docker is available, run:
```bash
docker run --rm -v "$(pwd):/repo" --workdir /repo rhysd/actionlint:latest -color
```
Expected: no errors. If Docker/network unavailable, skip this step and note it was skipped — Step 1/2 plus the CI run in Step 4 are the authoritative checks.

- [ ] **Step 4: Push the branch to trigger CI (live test)**

Run:
```bash
git push -u origin chore/migrate-node-24
```
Then watch the `Build and Deploy` workflow:
```bash
gh run watch "$(gh run list --branch chore/migrate-node-24 --workflow build.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```
Expected: the `backend`, `frontend`, and `e2e-tests` jobs pass with **no** "Node.js 20 is deprecated" warning in the logs (the main-gated `run-migrations`/`build-and-push-image`/`deploy` jobs are skipped on this non-main branch, but their action versions still resolve at parse time).

- [ ] **Step 5: Confirm the deprecation warning is gone**

Run:
```bash
gh run view "$(gh run list --branch chore/migrate-node-24 --workflow build.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --log | grep -i 'Node.js 20 is deprecated' || echo "No Node 20 deprecation warnings — success"
```
Expected: `No Node 20 deprecation warnings — success`.
