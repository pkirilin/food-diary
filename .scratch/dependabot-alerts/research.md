# Dependabot alerts research

Research date: **2026-09-24**. The alert data comes from the GitHub REST API
(`gh api --paginate repos/pkirilin/food-diary/dependabot/alerts?state=open&per_page=100`). That call
**worked with the existing `gh` token and returned no permission errors**. I cross-checked it with
`yarn npm audit -R --json` in both yarn projects and `dotnet list package --vulnerable --include-transitive`
in `src/backend`. I tested the fix plan on **scratch copies** of `src/frontend` and `tests`. The frontend copy passed
`yarn install` + `yarn build` + `vitest run` + `yarn lint`. The tests copy passed `yarn install` + `yarn lint` + `tsc`.
No repo files, lockfiles or GitHub settings were changed. See [Appendix](#appendix-how-the-data-was-produced).

Repo facts that affect the answers (from `gh repo view` / `gh api`):
**public** repo; Dependabot alerts **on**; Dependabot security updates **off**
(`automated-security-fixes: {"enabled":false}`); secret scanning and push protection report `disabled`;
CodeQL default setup `not-configured`; `allow_auto_merge: true`; `main` has branch protection with
**no required status checks** (`contexts: []`); no rulesets; no `.github/dependabot.yml`.

---

## 1. TL;DR

1. **All 83 open alerts are npm, and all are transitive except `vitest`.** 57 are in `src/frontend/yarn.lock`
   and 26 in `tests/yarn.lock`. There are **0 NuGet, 0 GitHub Actions and 0 Docker alerts**. By severity:
   2 critical, 47 high, 25 medium, 9 low.
2. **None of these packages ship in the runtime image.** The final `Dockerfile` stage copies only
   `dotnet publish` output plus `frontend/dist`. All 83 alerts are in build or test tooling. The one flagged
   package that ends up in the production browser bundle is `@babel/runtime` (pulled in by emotion/MUI).
   The dedupe step below fixes it.
3. **Four lockfile-only commands per project clear every alert but one (82 of 83):**
   - `yarn dedupe` clears **10** frontend alerts. An old `msw@2.0.9` that `@mswjs/data` pulled in collapses onto the
     direct `msw@2.15.0`, which drops `inquirer@8` → `tmp`, `chokidar@3.5.3` → `braces`, and `cookie@0.5`.
     It also dedupes `@testing-library/jest-dom`, `browserslist`, `postcss` and `@babel/runtime`.
   - **`yarn up -R node-gyp`** clears **16 frontend + 25 tests alerts (41 total, both criticals)**. This is the biggest
     single win. Yarn Berry silently adds `node-gyp: "npm:latest"` to `fsevents` because it has a
     `binding.gyp` ([YN0032](https://yarnpkg.com/advanced/error-codes)). The lockfile still pins that to `node-gyp@10.0.1`,
     which drags in `tar@6.2.0` (13 alerts per project), `ip@2.0.0` (no patch exists), `glob@10.3.10`, and
     `minimatch@9.0.3` → `brace-expansion@2.0.1`. Re-resolving it gives `node-gyp@13.0.2` (`tar ^7.5.4`, no `socks`/`ip`).
   - `yarn up vitest@^4.1.11` clears **2** (the only direct dependency among the alerted packages).
   - `yarn up -R '@babel/*' brace-expansion minimatch flatted lodash picomatch undici yaml vite` clears **28**
     (frontend). In `tests`, `yarn up -R flatted` clears the last one.
4. **One alert has no in-range fix:** `uuid@8.3.2` (GHSA-w5hq-g745-h8pq) via `@mswjs/data@0.16.2`, which is the latest
   release and is now marked deprecated on npm. `@mswjs/data`'s shipped `lib/` never imports `uuid`, so either add
   `"resolutions": { "@mswjs/data/uuid": "^11.1.1" }` (tested: resolves and builds) or dismiss the alert as
   **`not_used`** ("Vulnerable code is not actually used").
5. **Free automation (public repo):** Dependabot security updates, version updates, `groups` with
   `applies-to: security-updates`, CodeQL default setup, secret scanning + push protection, and the auto-triage
   presets are all free here. A **"Dismiss low impact issues for development-scoped dependencies"** preset
   is already active: 27 alerts are `auto_dismissed`. Auto-merge needs a **required status check**, and `main` has none.
6. **Recommendation:** (1) run the §3 lockfile fixes once. (2) Turn on Dependabot security updates plus a small
   `dependabot.yml` with grouped, weekly, cooldown-gated updates. (3) Enable CodeQL default setup and secret scanning.
   Skip Renovate, Snyk, Socket and Trivy for now. Details in [§7](#7-recommended-setup-for-this-repo).

---

## 2. What the alerts are

### 2.1 Shape

| Manifest | Alerts | Direct | Transitive | GitHub `scope`: runtime / development |
|---|---:|---:|---:|---|
| `src/frontend/yarn.lock` | 57 | 1 (`vitest`) | 56 | 24 / 33 |
| `tests/yarn.lock` | 26 | 0 | 26 | 25 / 1 |
| `src/backend` (NuGet) | 0 | – | – | – |
| **Total** | **83** | 1 | 82 | 47 / 36 |

Other alert states: 143 `fixed`, 27 `auto_dismissed` (preset rule), 0 manually dismissed.

**GitHub's `scope` column is misleading here.** It marks `tar`, `ip`, `glob`, `minimatch` and similar packages as
"runtime". Their real chain is `fsevents` (a macOS-only optional dependency of `vite`/`rollup`/`chokidar`/`playwright`)
→ implicit `node-gyp`. They never run in production. This mislabel is also why the dev-scope auto-dismiss preset
([docs](https://docs.github.com/en/code-security/dependabot/dependabot-auto-triage-rules/about-dependabot-auto-triage-rules))
didn't catch them.

**What actually ships:** the runtime image is `mcr.microsoft.com/dotnet/aspnet:10.0` with the API publish output
plus `frontend/dist` (see `Dockerfile`). Only code that Vite bundles into `dist/` reaches users:

- `@babel/runtime@7.23.4` (GHSA-968p-4wvh-cqc8, medium), via `@emotion/*`. The browser bundle includes it. `yarn dedupe` fixes it.
- The **GitHub Pages demo** build sets `VITE_APP_MSW_ENABLED=true` (`.github/workflows/deploy-demo.yml`). That lazy-loads
  `@tests/mockApi/*` → `@mswjs/data` (and its `lodash`) in the browser. This is a client-side mock with no server,
  so it carries no real risk.

`yarn npm audit -R` finds a few more advisories than GitHub has open (e.g. `nanoid`, `qs`, `body-parser`,
`path-to-regexp`, extra `brace-expansion` GHSAs). Each of them matches an alert the preset already
auto-dismissed. The same fix plan clears them too.

### 2.2 Every alert, by package group

Legend for **Fix**: (a) bump the direct dep · (b) bump or refresh the parent · (c) `yarn up -R`/`yarn dedupe` within
existing ranges · (d) Yarn `resolutions` · (f) dismiss. "Step" refers to the plan in §3.
Installed versions come from `yarn why <pkg>`.

#### `src/frontend/yarn.lock` (57)

| Package @ installed | # | Sev | GHSA (CVE) | Vulnerable → patched | Pulled in by | Fix · step |
|---|---:|---|---|---|---|---|
| `tar@6.2.0` | 13 | 1 crit, 8 high, 4 med | GHSA-23hp-3jrh-7fpw (CVE-2026-59873, crit), GHSA-r292-9mhp-454m, -8x88-c5mf-7j5w, -9ppj-qmqm-q256, -qffp-2rhf-9h96, -83g3-92jg-28cx, -34x7-hfp2-rc4v, -r6q2-hw4h-h46w, -8qq5-rm4j-mr97, -w8wr-v893-vjvp, -gvwx-54wh-qm9j, -vmf3-w455-68vh, -f5x3-32g6-xq36 | ≤7.5.20 → **7.5.21** | `fsevents` → implicit `node-gyp@10.0.1` (+ `cacache@18`) | (b) `yarn up -R node-gyp` · **2** |
| `ip@2.0.0` | 2 | high, low | GHSA-2p57-rm9w-gvfp (CVE-2024-29415) **no patch**; GHSA-78xj-cgh5-2h22 | ≤2.0.1 → none / 2.0.1 | `node-gyp@10` → `@npmcli/agent` → `socks@2.7.1` | (b) the node-gyp refresh removes `ip` completely (`socks@2.8` uses `ip-address`) · **2** |
| `glob@10.3.10` | 1 | high | GHSA-5j98-mcp5-4vw2 (CVE-2025-64756) | 10.2.0–10.4.x → 10.5.0 | `node-gyp@10`, `cacache@18` | (b) · **2** |
| `undici@7.27.2` | 11 | 3 high, 6 med, 2 low | GHSA-4cwx-7wf7-3272, -hm92-r4w5-c3mj, -vmh5-mc38-953g, -m8rv-5g2x-5cg5, -jr45-8vmc-qm54, -v3r7-h72x-cjcm, -8xcm-r25x-g524, -p88m-4jfj-68fv, -pr7r-676h-xcf6, -g8m3-5g58-fq7m, -35p6-xmwp-9g52 | <7.29.0 → **7.29.0** | `jsdom@29.1.1` (`^7.25.0`) | (c) `yarn up -R undici` · **4** |
| `minimatch@3.1.2/5.1.6/9.0.3/10.2.5` | 5 | high | GHSA-7r86-cg39-jmmj, -23c5-xmqv-rm74, -3ppc-4f35-3m26 | → 3.1.3 / 5.1.8 / 9.0.7 | eslint deps, `filelist` (workbox), `glob@10` | (c) · **4** |
| `brace-expansion@1.1.11/2.0.1/5.0.6` | 3 | high | GHSA-3jxr-9vmj-r5cp (CVE-2026-13149) | → 1.1.16 / 2.1.2 / 5.0.7 | `minimatch` (all majors) | (c) · **4** |
| `lodash@4.17.21` | 3 | 1 high, 2 med | GHSA-r5fr-rjxr-66jc, -f23m-r3pf-42rh, -xxjr-mmjv-4gpg | ≤4.17.23 → 4.18.0 | `@mswjs/data`, old `jest-dom@6.1.4`, `inquirer@8` | (c) · **4** (the dedupe removes 2 of the 3 parents) |
| `@babel/plugin-transform-modules-systemjs@7.23.9` | 1 | high | GHSA-fv7c-fp4j-7gwp (CVE-2026-44728) | ≤7.29.3 → 7.29.4 | `workbox-build` → `@babel/preset-env@7.24.0` | (c) `yarn up -R '@babel/*'` · **4** |
| `@babel/core@7.24.5` | 1 | low | GHSA-4x5r-pxfx-6jf8 | ≤7.29.0 → 7.29.6 | `workbox-build` (`^7.24.4`) | (c) · **4** |
| `flatted@3.2.9` | 1 | high | GHSA-rf6f-7fwh-wjgh (CVE-2026-33228) | ≤3.4.1 → 3.4.2 | `eslint` → `file-entry-cache@8` → `flat-cache@4` | (c) · **4** |
| `esbuild@0.27.7` | 1 | low | GHSA-g7r4-m6w7-qqqr | 0.27.3–0.28.0 → 0.28.1 | `vitest-preview@0.0.3` → `vite@7.3.5` (`esbuild ^0.27.0`) | (b) `yarn up -R vite` → `vite@7.3.6` allows `^0.28.0` · **4** |
| `picomatch@2.3.1` | 1 | med | GHSA-3v7f-55p6-f55p | <2.3.2 → 2.3.2 | `@rollup/pluginutils` (workbox), `chokidar@3` | (c) · **4** |
| `yaml@1.10.2` | 1 | med | GHSA-48c2-rrv3-qjmp | <1.10.3 → 1.10.3 | `@emotion/babel-plugin` → `babel-plugin-macros` → `cosmiconfig@7` | (c) · **4** |
| `vitest@4.1.10` **(direct)** | 1 | med | GHSA-82fw-gwwq-j7x9 (CVE-2026-84373) | <4.1.11 → 4.1.11 | `package.json` devDependency | (a) `yarn up vitest@^4.1.11` · **3** |
| `@vitest/mocker@4.1.10` | 1 | med | GHSA-82fw-gwwq-j7x9 | <4.1.11 → 4.1.11 | `vitest` (exact pin) | (a) same bump · **3** |
| `browserslist@4.22.1/4.23.0` | 1 | high | GHSA-73wf-gq98-2v4g | ≤4.28.6 → 4.28.7 | `@babel/helper-compilation-targets`, `core-js-compat` | (c) `yarn dedupe` → the direct 4.28.8 · **1** |
| `postcss@8.5.15` | 2 | high, med | GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp | ≤8.5.22 → 8.5.23 | `vite@7.3.5`, `vite@8.0.16` | (c) · **1** |
| `tmp@0.0.33` | 2 | high, low | GHSA-ph9p-34f9-6g65, GHSA-52f5-9888-hmc6 | <0.2.6 → 0.2.6 | `@mswjs/data` → `msw@2.0.9` → `inquirer@8` → `external-editor` (`^0.0.33`, **not** in range) | (c) `yarn dedupe` (msw collapses) · **1** |
| `braces@3.0.2` | 1 | high | GHSA-grv7-fg5c-xmjg | <3.0.3 → 3.0.3 | `msw@2.0.9` → `chokidar@3.5.3` | (c) · **1** |
| `cookie@0.5.0` | 1 | low | GHSA-pxg6-pf52-xh8x | <0.7.0 → 0.7.0 | `msw@2.0.9` → `@bundled-es-modules/cookie` (`^0.5.0`, not in range) | (c) · **1** |
| `cross-spawn@7.0.3` | 1 | high | GHSA-3xgq-45jj-v275 | <7.0.5 → 7.0.5 | `glob@10` → `foreground-child@3.1.1` | (c) · **1** |
| `@adobe/css-tools@4.3.1` | 1 | med | GHSA-prr3-c3m5-p7q2 | <4.3.2 → 4.3.2 | `@types/testing-library__jest-dom@6.0.0` (a deprecated stub) → `jest-dom@6.1.4` | (c) · **1**. Also drop the stub devDep: jest-dom ships its own types ([npm deprecation text](https://www.npmjs.com/package/@types/testing-library__jest-dom)) |
| `@babel/runtime@7.23.4` | 1 | med | GHSA-968p-4wvh-cqc8 (CVE-2025-27789) | <7.26.10 → 7.26.10 | `@emotion/*` (`^7.18.3`). **In the browser bundle** | (c) · **1** |
| `uuid@8.3.2` | 1 | med | GHSA-w5hq-g745-h8pq | <11.1.1 → 11.1.1 | `@mswjs/data@0.16.2` (`^8.3.1`; latest release, deprecated) | (d) `resolutions` or (f) `not_used` · **5** |

#### `tests/yarn.lock` (26)

| Package @ installed | # | Sev | GHSA | Patched | Pulled in by | Fix · step |
|---|---:|---|---|---|---|---|
| `tar@6.2.0` | 13 | 1 crit, 8 high, 4 med | same 13 as frontend | 7.5.21 | `@playwright/test` → `fsevents@2.3.2` → implicit `node-gyp@10.0.1` | (b) `yarn up -R node-gyp` · **2** |
| `brace-expansion@2.0.1` | 5 | 3 high, 1 med, 1 low | GHSA-rgw5-rvv9-x895, -mh99-v99m-4gvg, -3jxr-9vmj-r5cp, -f886-m6hf-6m8v, -v6h2-p8h4-qcjw | 2.1.4 | `glob@10.3.10` → `minimatch@9.0.3` (node-gyp chain) | (b) · **2** |
| `minimatch@9.0.3` | 3 | high | GHSA-7r86-cg39-jmmj, -23c5-xmqv-rm74, -3ppc-4f35-3m26 | 9.0.7 | `glob@10.3.10` (node-gyp chain) | (b) · **2** |
| `ip@2.0.0` | 2 | high, low | GHSA-2p57-rm9w-gvfp (no patch), GHSA-78xj-cgh5-2h22 | – / 2.0.1 | `node-gyp@10` → `socks@2.7.1` | (b) · **2** |
| `glob@10.3.10` | 1 | high | GHSA-5j98-mcp5-4vw2 | 10.5.0 | `node-gyp@10`, `cacache@18` | (b) · **2** |
| `cross-spawn@7.0.3` | 1 | high | GHSA-3xgq-45jj-v275 | 7.0.5 | `glob@10` → `foreground-child@3.1.1` | (b) · **2** |
| `flatted@3.2.9` | 1 | high | GHSA-rf6f-7fwh-wjgh | 3.4.2 | `eslint` → `flat-cache@4` | (c) `yarn up -R flatted` · **4** |

#### Backend (NuGet): nothing to fix

- `dotnet list package --vulnerable --include-transitive` reports "no vulnerable packages" for all 11 projects
  (.NET SDK 10.0.302, source: nuget.org).
- The GitHub dependency graph has only **42 NuGet packages** for this repo, against 1,417 npm packages. That matches the
  `PackageVersion` entries in `Directory.Packages.props`, which means **GitHub sees direct NuGet deps only**, because there is no
  `packages.lock.json`. It cannot alert on NuGet transitives. NuGetAudit covers that gap (see §6.2).

---

## 3. Remediation plan (ordered, biggest win first)

I ran every step on scratch copies and re-audited after each one. The "alerts cleared" counts come from
matching the remaining `yarn npm audit` findings against the GitHub alert list.

| Step | Command (run inside the project dir) | Frontend cleared | Tests cleared | Running total |
|---|---|---:|---:|---:|
| **2** | `yarn up -R node-gyp` | 16 | 25 | 41 / 83 |
| **1** | `yarn dedupe` | 10 | 0 | 51 |
| **4** | frontend: `yarn up -R '@babel/*' brace-expansion minimatch flatted lodash picomatch undici yaml vite` · tests: `yarn up -R flatted` | 28 | 1 | 80 |
| **3** | `yarn up vitest@^4.1.11` (frontend) | 2 | – | 82 |
| **5** | frontend `package.json`: `"resolutions": { "@mswjs/data/uuid": "^11.1.1" }` then `yarn install`, **or** dismiss #233 as `not_used` | 1 | – | **83** |

Notes:

- Steps are numbered in the order I ran them. The table is sorted by impact. The order doesn't matter much, but running
  `dedupe` first keeps `yarn up -R` from refreshing ranges that dedupe would remove anyway.
- **Yarn semantics (verified):** `yarn up -R` "will force all ranges matching the selected packages to be resolved
  again (often to the highest available versions) … It however won't touch your manifests"
  ([yarn up](https://yarnpkg.com/cli/up)). `yarn dedupe` uses the `highest` strategy and only upgrades
  ([yarn dedupe](https://yarnpkg.com/cli/dedupe)). `resolutions` supports a `parent/child` key
  ([manifest › resolutions](https://yarnpkg.com/configuration/manifest#resolutions)). `yarn npm audit -R` covers
  transitives, and `-A` covers all workspaces (`yarn npm audit --help` on Yarn 4.16.0; [docs](https://yarnpkg.com/cli/npm/audit)).
- **Why `node-gyp` is in the lockfile at all:** Yarn injects an implicit `node-gyp` dependency into packages with a
  `binding.gyp` ([YN0032 NODE_GYP_INJECTED](https://yarnpkg.com/advanced/error-codes)). The lockfile has
  `fsevents@2.3.x: dependencies: node-gyp: "npm:latest"`. `latest` was locked long ago and nothing refreshes it.
  It will go stale again, so re-run `yarn up -R node-gyp` from time to time, or let Renovate `lockFileMaintenance` do it (§5.4).
  In the frontend, `enableScripts: false` means this chain is never even executed.
- **Size of the change:** the frontend `yarn.lock` diff is about +1.2k/−4.0k lines (mostly the 180-entry dedupe). Tests is +86/−669.
  The patched frontend passed `yarn install`, `yarn build`, `vitest run` (154 passed, 2 skipped) and `yarn lint`
  (0 errors). The patched tests passed `yarn install`, `yarn lint` and `tsc --noEmit`. **I did not run the E2E suite** (it needs Docker plus the
  full stack).
- For a smaller diff, `yarn dedupe msw @testing-library/jest-dom browserslist postcss @babel/runtime cross-spawn`
  targets only the step-1 packages. I didn't test that variant.
- Out of scope but found along the way: `yarn npm audit` flags `@mswjs/data@0.16.2` as deprecated ("Package no longer supported"),
  and `@testing-library/jest-dom@6.10.0` as a bad release ("Use 6.9.1 for the 6.x line, or upgrade to 7.0.0").
  These are deprecations, not advisories, so they create no alerts.

### Dismissal reasons (if you'd rather not fix something)

The REST enum for `dismissed_reason` is `fix_started`, `inaccurate`, `no_bandwidth`, `not_used`, `tolerable_risk`
([REST: Dependabot alerts](https://docs.github.com/en/rest/dependabot/alerts)). You can dismiss in bulk from the alert list
([Viewing and updating Dependabot alerts](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/viewing-and-updating-dependabot-alerts)).
The only alert that fits a dismissal is `uuid` #233 → `not_used`. `rg -uu uuid node_modules/@mswjs/data/lib` returns nothing.
Every other alert has a lockfile-only fix, so dismissing them would just hide them.

---

## 4. GitHub-native automation (free for this public repo)

| Feature | Free here? | Current state | Source |
|---|---|---|---|
| Dependabot alerts | Yes | On | [security features](https://docs.github.com/en/code-security/getting-started/github-security-features) |
| Dependabot security updates (auto-PRs for alerts) | Yes | **Off** | [about](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates), [configure](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates) |
| Dependabot version updates (`dependabot.yml`) | Yes | Not configured | [options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) |
| Auto-triage **presets** | Yes | Dev-scope preset active (27 auto-dismissed) | [auto-triage](https://docs.github.com/en/code-security/dependabot/dependabot-auto-triage-rules/about-dependabot-auto-triage-rules) |
| Auto-triage **custom rules** | **Docs contradict each other** (see below) | – | same + [GHAS table](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) |
| CodeQL code scanning, default setup | Yes | `not-configured` (detected: actions, csharp, javascript-typescript) | [GHAS table](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security), [default setup](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning) |
| Secret scanning | Yes ("runs automatically for free") | API reports `disabled` | [secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) |
| Push protection (repo) | Yes | `disabled` ("disabled by default") | [push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection) |
| Dependency review action | **Docs contradict each other** | – | [dependency review](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review) |

**Documentation conflicts I couldn't resolve:**

- *Custom auto-triage rules*: the auto-triage page says they are "available on public repositories". The GHAS
  availability table lists "Custom auto-triage rules" as **No** for "Public repository without GitHub Code Security".
- *Dependency review*: the dependency-review page says "The action is available for all public repositories". The same
  GHAS table lists "Dependency review" as **No** for public repos without Code Security.
- The easiest way to settle both is to try them in the repo's Settings → Advanced Security. I didn't, because this task is read-only.

### 4.1 Dependabot security updates

- **What they do:** "When enabled, it automatically attempts to resolve every open Dependabot alert with an available patch"
  ([about](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)).
- **Transitives:** "For npm, Dependabot will raise a pull request to update an explicitly defined dependency to a secure
  version, even if it means updating the parent dependency … For other ecosystems, Dependabot is unable to update an
  indirect or transitive dependency if it would also require an update to the parent dependency." (same page).
  **NuGet transitives needing a parent bump are not auto-fixed.**
- **Yarn Berry support:** the supported-ecosystems table lists **yarn v1, v2, v3, v4** under `npm` with version updates,
  security updates, private repos and private registries all supported
  ([supported ecosystems](https://docs.github.com/en/code-security/dependabot/ecosystems-supported-by-dependabot/supported-ecosystems-and-repositories)).
  *Not verified:* whether Dependabot can refresh the implicit `node-gyp: "npm:latest"` edge. It would have to, to fix the `tar`/`ip` alerts.
  The docs don't cover it. Given how long those alerts have stayed open, run §3 by hand once anyway.
- **NuGet:** version updates and security updates are supported (`nuget`, "<=6.12.0"). The docs also say "Dependabot doesn't run the
  NuGet CLI but does support most features up until version 6.8.0" (same page). `Directory.Packages.props` support comes from
  dependabot-core issues, not GitHub docs: [#4261](https://github.com/dependabot/dependabot-core/issues/4261).
  A related bug ([#12476](https://github.com/dependabot/dependabot-core/issues/12476), CPM alerts not raised) was closed on 2025-06-25.
- **Docker / Docker Compose:** version updates only. Security updates are **not supported** (same table). GitHub does not
  alert on container image CVEs at all.
- **Limits:** security-update PRs "are not subject to [the open-PR] limit … There is no limit on the number of open pull
  requests for security updates". The default 3-day cooldown "does not apply to security updates"
  ([options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)).
- **Grouping:** `groups.<name>.applies-to: security-updates`. Dependabot "will not group dependencies from different package
  ecosystems together, and it will not group security updates with version updates"
  ([about](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)).
- **Enable:** Settings → Advanced Security → "Dependabot security updates" → Enable
  ([configure](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates)),
  or `gh api -X PUT repos/pkirilin/food-diary/automated-security-fixes`.

### 4.2 Draft `.github/dependabot.yml`

Option semantics come from the [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference):
`directories` supports globs and lists; `groups` supports `applies-to`, `patterns`, `update-types`, and `dependency-type`
(supported for npm, not for NuGet); `group-by: dependency-name` works across directories for the same ecosystem, version updates only; `cooldown`
applies to version updates only, and `semver-*-days` works for npm/yarn and NuGet but not docker/actions; `versioning-strategy`
does not apply to NuGet; `dotnet-sdk` updates `global.json`.

```yaml
version: 2

updates:
  - package-ecosystem: "npm"            # covers Yarn Berry (v2–v4)
    directories: ["/src/frontend", "/tests"]
    schedule: { interval: "weekly", day: "monday" }
    cooldown:
      default-days: 7                   # mirrors .yarnrc.yml npmMinimalAgeGate: 7d
      semver-major-days: 14
    open-pull-requests-limit: 5
    groups:
      npm-security:
        applies-to: security-updates
        patterns: ["*"]
      npm-minor-patch:
        applies-to: version-updates
        update-types: ["minor", "patch"]
        patterns: ["*"]
      # majors stay as individual PRs: they need real review

  - package-ecosystem: "nuget"
    directory: "/src/backend"
    schedule: { interval: "weekly", day: "monday" }
    cooldown: { default-days: 7 }
    groups:
      nuget-security:
        applies-to: security-updates
        patterns: ["*"]
      nuget-minor-patch:
        applies-to: version-updates
        update-types: ["minor", "patch"]
        patterns: ["*"]

  - package-ecosystem: "dotnet-sdk"     # global.json
    directory: "/src/backend"
    schedule: { interval: "monthly" }

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: { interval: "monthly" }
    groups:
      actions:
        patterns: ["*"]

  - package-ecosystem: "docker"         # Dockerfile base images
    directory: "/"
    schedule: { interval: "monthly" }

  - package-ecosystem: "docker-compose" # caddy / postgres tags
    directories: ["/deploy", "/tests"]
    schedule: { interval: "monthly" }
```

Things to check before committing it:

- The `docker` / `docker-compose` entries don't do much today. The Dockerfile uses floating tags (`sdk:10.0`, `node:24-alpine`,
  `aspnet:10.0`) and so does deploy compose (`caddy:2-alpine`, `postgres:15-alpine`). Dependabot bumps tags by SemVer
  ([supported ecosystems › Docker](https://docs.github.com/en/code-security/dependabot/ecosystems-supported-by-dependabot/supported-ecosystems-and-repositories#docker)).
  Its real value would be the `postgres:15` → 16/17 majors, which is a data migration and not something to auto-merge. You could drop these two entries.
- The `Build` workflow has a `paths:` filter that **does not include `deploy/**`**. A compose PR touching only `deploy/compose.yml`
  never runs the workflow. If that check is required, the PR stays **"Pending" and can't merge**: "A workflow is skipped by path filtering … Associated checks
  stay in a 'Pending' state and block merging" ([troubleshooting required checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks)).

### 4.3 Auto-merge for Dependabot PRs

Requirements:

- Repo "Allow auto-merge" must be on. **It already is** (`allow_auto_merge: true`).
- "The option to enable auto-merge is shown only on pull requests that cannot be merged immediately", for example when a
  branch protection rule enforces required status checks
  ([automatically merging a PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)).
  **`main` has no required checks today**, so `gh pr merge --auto` has nothing to wait for. Add `frontend` and `backend` (and optionally
  `e2e-tests`) as required checks first. GitHub's docs say the same thing: "you should enable **Require status checks to pass before merging** … for Dependabot pull requests"
  ([automating Dependabot with Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)).
- Dependabot-triggered `push`/`pull_request` runs get a **read-only `GITHUB_TOKEN` and only Dependabot secrets**
  ([Dependabot on Actions](https://docs.github.com/en/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions)).
  `build.yml` uses no secrets, so CI runs unchanged. It triggers on `push`, which fires for Dependabot's in-repo branches.
  An auto-merge workflow needs an explicit `permissions: { contents: write, pull-requests: write }`.

Workflow shape (from GitHub's documented example, restricted to patch/minor):

```yaml
name: Dependabot auto-merge
on: pull_request
permissions: { contents: write, pull-requests: write }
jobs:
  automerge:
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - id: meta
        uses: dependabot/fetch-metadata@v2   # docs pin a SHA; do the same
      - if: steps.meta.outputs.update-type != 'version-update:semver-major'
        run: gh pr merge --auto --squash "$PR_URL"
        env: { PR_URL: "${{ github.event.pull_request.html_url }}", GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}" }
```

### 4.4 Auto-triage rules

- Preset **"Dismiss low impact issues for development-scoped dependencies"** (npm only) is "enabled by default for public
  repositories". Preset "Dismiss package malware alerts" is "disabled by default"
  ([about auto-triage](https://docs.github.com/en/code-security/dependabot/dependabot-auto-triage-rules/about-dependabot-auto-triage-rules)).
  The first one is what produced the 27 `auto_dismissed` alerts here.
- It misses most of this repo's noise because GitHub labels the `fsevents → node-gyp` chain as `runtime` (§2.1).
- Custom rules (by severity, package, CWE, scope) might help, but their availability for public repos is contradictory in the docs (§4).
  Don't count on them.

### 4.5 CodeQL, secret scanning, push protection

- **CodeQL default setup** is free on public repos, and the repo already detects `actions`, `csharp` and
  `javascript-typescript` (`gh api …/code-scanning/default-setup`). Turn it on in Settings → Advanced Security → Code scanning → Set up → Default
  ([default setup](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning)).
  No workflow file is needed.
- **Secret scanning** is free on public repos. **Push protection for repositories** is free on public repos but "disabled by default".
  **Push protection for users** "is enabled by default" and covers pushes to public repos
  ([push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection)).
  The API shows both repo-level toggles as `disabled`, so turn both on.

---

## 5. Third-party options (brief)

| Tool | Free? | What it adds over Dependabot for this stack | Verdict |
|---|---|---|---|
| **Renovate** (Mend-hosted app) | "free to install for both public and private repositories … no paid plan is required" ([GitHub App page](https://github.com/apps/renovate)) | **`lockFileMaintenance`** "deletes the lock file and runs the relevant package manager", off by default, weekly when enabled. That fixes stale-`node-gyp`-style rot automatically. `vulnerabilityAlerts` reads GitHub's alerts. `osvVulnerabilityAlerts` covers **direct deps only** ([config options](https://docs.renovatebot.com/configuration-options/)) | The strongest alternative. Replaces Dependabot version updates rather than adding to them; running both is noise. |
| **OSV-Scanner** | OSS | Scans `yarn.lock`, .NET `packages.lock.json`, and container images. Guided remediation is *experimental* ([supported lockfiles](https://google.github.io/osv-scanner/supported-languages-and-lockfiles/)). Not verified: whether it reads `Directory.Packages.props` without a lockfile | Not needed. `yarn npm audit` + NuGetAudit cover the same ground. |
| **Trivy** (`aquasecurity/trivy-action`) | OSS, Apache-2.0 | **Scans the built Docker image** (OS packages in `aspnet:10.0`), which nothing else here does. SARIF upload to code scanning ([repo](https://github.com/aquasecurity/trivy-action)) | The one real gap. Optional, e.g. a release-time scan. |
| **Snyk** Free | 5 projects, "100 tests / month" for Snyk Code ([plans](https://snyk.io/plans/)) | Reachability/fix PRs. Fix-PR availability on Free wasn't stated on the page | Skip. Caps, and another account to maintain. |
| **Socket** Free | "For individual developers and small teams" ([pricing](https://socket.dev/pricing)) | Malware and supply-chain behaviour checks, not only CVEs | Skip for now. `npmMinimalAgeGate: 7d` already blunts fresh-malware risk. |

---

## 6. Built-in toolchain audits (CI)

### 6.1 Yarn Berry: `yarn npm audit`

- `yarn npm audit -A -R --severity high` exits non-zero if any finding meets the threshold (`yarn npm audit --help`, Yarn 4.16.0;
  [docs](https://yarnpkg.com/cli/npm/audit)). Use `--exclude`/`npmAuditExcludePackages` for packages and `--ignore` for advisory IDs.
- It queries the npm registry advisory feed, which overlaps with but isn't identical to GitHub's alert set (§2.1). It also prints deprecations.
- Given the "minimal" philosophy, a **non-blocking** weekly job is probably more useful than a gate on every push.
  Otherwise any new advisory breaks unrelated PRs.

### 6.2 .NET: NuGetAudit

- **On by default:** `NuGetAudit` defaults to `true`, and `NuGetAuditLevel` defaults to `low`. **`NuGetAuditMode` defaults to `all`
  (transitives included) when a project targets `net10.0` or higher.** Otherwise the default is `direct`
  ([Auditing packages](https://learn.microsoft.com/en-us/nuget/concepts/auditing-packages)). This repo targets `net10.0`
  (`Directory.Build.props`), so every `dotnet restore` in CI already audits transitives.
- Warnings are NU1901–NU1904 (low→critical). NU1900 means feed errors, NU1905 means an audit source has no vulnerability DB (same page).
- **The repo explicitly disarms them.** `Directory.Build.props` has `TreatWarningsAsErrors=true` with
  `WarningsNotAsErrors=…NU1901;NU1902;NU1903;NU1904…`. This is the exact pattern Microsoft documents "to prevent vulnerabilities
  discovered in the future from breaking your build". Findings only show up as warnings in CI logs. That's reasonable. To make it
  enforceable without blocking normal PRs, the docs suggest a dedicated audit pipeline:
  `WarningsAsErrors Condition="'$(AuditPipeline)' == 'true'"` plus `dotnet restore -p:AuditPipeline=true` (same page).
- **Fixing transitives:** bump the top-level package first. Otherwise add a direct reference, or use CPM **transitive pinning**
  (`<CentralPackageTransitivePinningEnabled>true</CentralPackageTransitivePinningEnabled>`, which "promotes a transitive
  dependency to a top-level dependency implicitly … when necessary"; downgrades raise NU1109)
  ([CPM › Transitive pinning](https://learn.microsoft.com/en-us/nuget/consume-packages/central-package-management#transitive-pinning)).
  The .NET 10 SDK also has `dotnet package update --vulnerable` (auditing page). The repo already uses CPM, so pinning would just
  mean adding a `PackageVersion` line. Nothing needs it today.

---

## 7. Recommended setup for this repo

In order, keeping to STRATEGY.md's "build only what's actually needed":

1. **Clear the backlog (one PR):** the §3 commands in `src/frontend` and `tests`, plus the `uuid` resolution (or dismissal).
   Also consider dropping the stub `@types/testing-library__jest-dom`. Expect all 83 alerts to close automatically once merged.
2. **Flip the free switches (settings, no code):** Dependabot security updates · CodeQL default setup · secret scanning +
   push protection. Leave the default dev-scope auto-triage preset on.
3. **Add a small `dependabot.yml`** (§4.2): npm (both dirs) + nuget + github-actions, weekly or monthly, grouped, 7-day cooldown.
   Leave out docker/docker-compose unless you want the postgres-major nudges.
4. **Optional: auto-merge.** Add `frontend` and `backend` as required checks on `main`, then the §4.3 workflow for non-major bumps.
   Skip this if you'd rather review every PR. The volume will be low with grouping.
5. **Periodic lockfile refresh.** Dependabot doesn't do Renovate-style `lockFileMaintenance`, so the stale `node-gyp: npm:latest`
   edge can come back. Either run `yarn dedupe && yarn up -R node-gyp` by hand every few months, or switch version updates
   to Renovate with `lockFileMaintenance` enabled. Pick one bot, not both.
6. **Not now:** Snyk, Socket, OSV-Scanner. Trivy is worth reconsidering if you want CVE coverage for the runtime image's OS layer.

---

## Appendix: how the data was produced

- Alerts: `gh api --paginate "repos/pkirilin/food-diary/dependabot/alerts?state=open&per_page=100"` → 83 alerts.
  The all-states call gave 143 fixed, 27 auto_dismissed. The token had enough scope and there were no errors.
- Repo settings: `gh repo view --json visibility`, `gh api repos/…` (`security_and_analysis`, `allow_auto_merge`),
  `…/automated-security-fixes`, `…/vulnerability-alerts` (204 = on), `…/branches/main/protection`, `…/rulesets`,
  `…/code-scanning/default-setup`, `…/dependency-graph/sbom`.
- Dependency chains: `yarn why <pkg>` in each project (Yarn 4.16.0, `nodeLinker: node-modules`). Latest versions and ranges:
  `npm view`.
- Simulation: I copied `package.json`, `yarn.lock`, `.yarnrc.yml` and `.yarn/releases` into a scratch directory, ran each step with
  `--mode=update-lockfile`, then ran `yarn npm audit -R --json` after every step. For full verification I copied the git-tracked
  frontend and tests sources with the patched lockfile and ran install, build, test and lint (frontend) and install, lint and tsc (tests).
- Backend: `dotnet list package --vulnerable --include-transitive` in `src/backend` (SDK 10.0.302).
- Docs: GitHub docs were fetched as markdown via `https://docs.github.com/api/article/body?pathname=…` on 2026-09-24.
  Yarn, Microsoft Learn, Renovate (`docs/usage/configuration-options.md` on `main`), OSV-Scanner, Snyk and Socket pages were fetched the same day.
