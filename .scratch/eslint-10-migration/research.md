# ESLint 10 migration research

Research date: **2026-08-13**. All version claims verified against the npm registry and upstream
source on that date. Empirical probe results were produced by actually running ESLint 10.8.1 over
`src/frontend/src` + `src/frontend/tests` (281 files) — see [Appendix: how the probe was run](#appendix-how-the-probe-was-run).

---

## 1. Bottom line

1. **ESLint 10 is released.** `10.0.0` shipped **2026-02-06**; latest is **10.8.1** (2026-08-07).
   `npm view eslint dist-tags --json` → `{"latest":"10.8.1","maintenance":"9.39.5","next":"10.0.0-rc.2"}`.
   **ESLint 9 went EOL on 2026-08-06** — one week ago. ESLint 8 has been EOL since 2024-10-05.
   The project is two majors and ~2 years behind on an EOL runtime.

2. **Two plugins the project depends on are hard-broken on ESLint 10, and neither has a released
   fix.** Verified by running them:
   - `eslint-plugin-react@7.37.5` → `TypeError: contextOrFilename.getFilename is not a function`
     on *every* `react/*` rule. Fix is on `master` but unreleased since 2025-04-03; PR
     [#4022 "complete ESLint 10 compatibility"](https://github.com/jsx-eslint/eslint-plugin-react/pull/4022) is **open**.
   - `eslint-plugin-import@2.32.0` → `TypeError: sourceCode.getTokenOrCommentBefore is not a function`
     on **`import/order`** specifically. "support eslint v10" sits in the `[Unreleased]` section of
     its CHANGELOG; last release was 2025-06-20.
   Both also fail `npm install` peer resolution against `eslint@10` (ERESOLVE).
   → **`import/order` must move to `eslint-plugin-import-x`; `eslint-plugin-react` has no clean
   answer today.** This is the single biggest open decision.

3. **`eslint-config-love` (the stated successor to `standard-with-typescript`) does not support
   ESLint 10 either.** `eslint-config-love@155.0.0` declares `peerDependencies.eslint: "^9.35.0"`.
   PR [#2302 "feat!: eslint v10 support"](https://github.com/mightyiam/eslint-config-love/pull/2302)
   is **open** (last activity 2026-08-12), blocked precisely on `eslint-plugin-import`.
   → **Option (a) is not currently available.** Recommendation is **(b): compose `typescript-eslint`'s
   own shared configs directly** and drop the "standard" lineage entirely.

4. **The premise "ESLint 10 removed the deprecated core formatting rules" is false.** Verified in
   source at tag `v10.8.1`: `lib/rules/index.js` still registers `semi`, `indent`, `quotes`,
   `comma-dangle`, `space-before-function-paren`, etc. They remain deprecated-but-present. The v10
   migration guide has no section on formatting-rule removal. This means `eslint-config-prettier` is
   **still needed**.

5. **No eslintrc escape hatch survives — but `FlatCompat` does.** These are different things:
   the eslintrc *config system* (`.eslintrc.*`, `.eslintignore`, `--no-eslintrc`, `--env`,
   `--rulesdir`, `/* eslint-env */`, `ESLINT_USE_FLAT_CONFIG=false`) is **completely removed** in v10.
   `FlatCompat` from `@eslint/eslintrc` is a *translation utility that runs inside a flat config* and
   still works (the v10 migration guide explicitly tells you to upgrade it, not drop it).

6. **The project's own tuned rules carry over with essentially zero drift.** Empirically, running
   ESLint 10.8.1 + typescript-eslint 8.67.0 with the project's exact `strict-boolean-expressions`
   (all 9 options), `no-unused-vars`, and `import/order` options over the whole frontend produced
   **1 error** (a single `import-x/order` ordering nit in one fixture file) and 4 "unused
   eslint-disable directive" warnings. All 9 `strict-boolean-expressions` options still exist with
   the same names; `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing` is deprecated but works.

7. **The real fallout is opt-in, and it is bounded.** Measured error counts on the current codebase:
   - `eslint-plugin-react-hooks` v4 → v7 `recommended` (now includes the React Compiler rules):
     **11 errors**, all `react-hooks/set-state-in-effect`.
   - `typescript-eslint` `recommendedTypeChecked`: **29 errors** (22 are `require-await`).
   - `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked`: **93 errors**.
   - `prettier/prettier` as an ESLint rule on ESLint 10: **0 errors**, plugin works fine.

8. **Sizing: this is not a one-sitting job, but it is close.** The config rewrite + `recommendedTypeChecked`
   + react-hooks v7 is ~40 fixable errors — one sitting. What makes it multi-ticket is the
   `eslint-plugin-react` blocker (needs a decision, not a fix) and the `tests/` workspace (separate,
   trivial, but separate). Suggested split in §5.

9. **Unsettled:** (i) what to do about `eslint-plugin-react` — wait for a release, vendor a patch,
   or drop the plugin and keep only `react-hooks`; (ii) whether to adopt `strictTypeChecked` now or
   stay at `recommendedTypeChecked`. Both are judgement calls, not research gaps.

---

## 2. Q1 — ESLint 10 itself

### 2.1 Release status (verified from the registry)

| Fact | Value | Source |
|---|---|---|
| Latest | **10.8.1**, published 2026-08-07 | `npm view eslint dist-tags --json`, `npm view eslint time --json` |
| First 10.x | **10.0.0**, 2026-02-06 | `npm view eslint time --json` |
| Prereleases | `10.0.0-alpha.0` 2025-11-14 → `-rc.2` 2026-01-27 | same |
| Maintenance line | `9.39.5` (2026-07-10) — final v9 release | `npm view eslint dist-tags --json`, eslint.org/version-support |
| **v9 EOL** | **2026-08-06** | https://eslint.org/version-support/ |
| **v8 EOL** | 2024-10-05 (final 8.57.1, 2024-09-16) | https://eslint.org/version-support/ |
| Node floor | `^20.19.0 \|\| ^22.13.0 \|\| >=24` | `npm view eslint@10.8.1 engines`; also verified in `package.json` at tag `v10.8.1` |

The repo's `engines.node: ">=24 <25"` and `.nvmrc: 24` already satisfy v10. **No Node work required.**

### 2.2 Breaking changes that matter here

From https://eslint.org/docs/latest/use/migrate-to-10.0.0 (full heading list reproduced from the
raw doc on `main`):

**For users**
- Node.js < v20.19, v21, v23 no longer supported
- `eslint:recommended` updated — three rules newly on: `no-unassigned-vars`,
  `no-useless-assignment`, `preserve-caught-error`
- New configuration file lookup algorithm (searches upward from each linted file's directory; the
  `v10_config_lookup_from_file` feature flag is gone)
- **Old config format no longer supported**
- **JSX references are now tracked** — JSX identifiers count as variable references. Fixes
  false positives/negatives in `no-unused-vars` and other scope rules; this is why
  `react/jsx-uses-react` / `react/jsx-uses-vars` matter less now.
- `/* eslint-env */` comments are reported as **errors**
- Jiti < v2.2.0 no longer supported
- POSIX character classes in glob patterns
- `stylish` formatter uses native `styleText` instead of `chalk`
- Deprecated options of the `radix` rule removed
- `no-shadow-restricted-names` now reports `globalThis` by default (`reportGlobalThis: true`)
- `func-names` schema is stricter
- `no-invalid-regexp` `allowConstructorFlags` accepts only unique items
- `name` property added to ESLint core configs

**For plugin/integration developers** (relevant because it is what breaks `react`/`import`)
- Removal of deprecated `context` members: `context.getCwd()`, `getFilename()`,
  `getPhysicalFilename()`, `getSourceCode()`, `context.parserOptions`, `context.parserPath`
- Removal of deprecated `SourceCode` methods: `getTokenOrCommentBefore()`,
  `getTokenOrCommentAfter()`, `isSpaceBetweenTokens()`, `getJSDocComment()`
- `Program` AST node range spans entire source text (incl. leading/trailing comments)
- Fixer methods require string `text`
- `nodeType` removed from `LintMessage`
- RuleTester: `type` removed from error assertions; `errors`/`output` prohibited on valid cases

**Formatting rules were NOT removed.** Verified empirically:
`curl https://raw.githubusercontent.com/eslint/eslint/v10.8.1/lib/rules/index.js | rg 'semi|indent|quotes'`
returns `indent`, `indent-legacy`, `jsx-quotes`, `quotes`, `semi`, `semi-spacing`, `semi-style`,
`no-extra-semi`, `comma-*`, `object-curly-*`, `space-before-*`, `arrow-spacing`, … (294 rules total).
The rule-deprecation policy page states only that deprecated rules "may be removed at some point"
and gives no version. ESLint's guidance remains: use a formatter, or `@stylistic/*`.

### 2.3 Escape hatches — precise status

| Thing | Status on ESLint 10 | Source |
|---|---|---|
| `.eslintrc.*` / `.eslintignore` files | **Gone.** Ignored entirely. `.eslintignore` produces an `ESLintIgnoreWarning` at runtime (observed in every probe run). | migrate-to-10.0.0; observed |
| `ESLINT_USE_FLAT_CONFIG=false` | **Gone.** "could still be enabled in v9 by setting `ESLINT_USE_FLAT_CONFIG` … Starting with ESLint v10.0.0, the old configuration format is no longer supported." | migrate-to-10.0.0 |
| `--no-eslintrc`, `--env`, `--rulesdir` | **Gone.** | whats-coming blog + migrate-to-10.0.0 |
| `/* eslint-env */` | **Error.** | migrate-to-10.0.0 |
| `Linter#defineRule/defineParser/getRules` | **Gone.** | whats-coming blog |
| **`FlatCompat` from `@eslint/eslintrc`** | **Survives.** Latest `@eslint/eslintrc@3.3.6` (2026-07-10). The v10 guide says: *"if you are using `@eslint/js` v10.x with the `FlatCompat` utility from `@eslint/eslintrc`, you should upgrade `@eslint/eslintrc` to the latest version to ensure compatibility."* Package README: *"This package is frozen except for critical bug fixes."* | migrate-to-10.0.0; eslintrc README |
| `@eslint/compat` | Exists, provides compatibility shims for plugins using removed APIs. | whats-coming blog |

**Caveat on `FlatCompat`:** it translates *config shape*, not *plugin code*. It will not rescue
`eslint-plugin-react@7.37.5` or `eslint-plugin-import@2.32.0` — those crash at rule-execution time,
not config-load time. Confirmed by the probe (crashes occur while linting, in `lib/util/version.js`
and `import/order` respectively).

### 2.4 Upgrade sequence from 8

**A direct 8 → 10 jump is fine and is what I'd do.** Reasoning:

- There is no *technical* requirement to install 9 in between; v10's breaking changes are a superset
  documented independently. Both migration guides are readable side by side.
- Practically, the v8→v9 guide is still the one that explains the config-format change (the v10
  guide assumes you already migrated), so **read migrate-to-9.0.0 for the config rewrite and
  migrate-to-10.0.0 for the deltas.**
- Landing on 9 first would land you on an **EOL** version (as of 2026-08-06), so there is nothing to
  gain by stopping there.
- v9 rule-default changes still apply cumulatively when you jump. The one that matters for this
  project: **`no-unused-vars` `caughtErrors` default changed `"none"` → `"all"` in v9.** The project
  sets `["error", { argsIgnorePattern: "^_" }]` with no `caughtErrors`, so unused `catch` bindings
  become errors. (Probe: 0 hits in the current codebase — no unused catch bindings exist.)
  Other v9 defaults: `no-inner-declarations` `blockScopeFunctions`, `no-useless-computed-key`
  `enforceForClassMembers: true`, `no-implicit-coercion` reports unary `-`.

**`@eslint/migrate-config`** — current version **3.0.2**, last modified 2026-07-21. Still maintained
and still the right starting point. What it does **not** handle (per
https://eslint.org/docs/latest/use/configure/migration-guide):
- It "does not work well with `.eslintrc.js` files" — it evaluates them and emits the result, losing
  functions/conditionals. **Not a problem here: this repo uses `.eslintrc.json`.**
- It does not know which plugin *versions* are flat-compatible. It will happily emit `compat.extends(...)`
  wrappers around configs that then crash at runtime. Everything in §4 still has to be checked by hand.
- It does not migrate `.eslintignore` → `ignores` (you must do that; there are two of them in this repo).
- It cannot invent the `files:`-scoped structure you actually want (e.g. splitting test-only plugins
  onto `**/*.test.tsx`) — it produces a mechanical 1:1 translation of the existing `overrides` block.

---

## 3. Q2 — replacing `eslint-config-standard-with-typescript@43`

### 3.1 Deprecation confirmed

```
$ npm view eslint-config-standard-with-typescript deprecated
Please use eslint-config-love, instead.

$ npm view eslint-config-standard-with-typescript version time.modified
version = '43.0.1'
time.modified = '2024-03-16T11:59:52.297Z'
```

Unmaintained for ~2.4 years. It is eslintrc-only (no flat config export) and pins
`@typescript-eslint@^6`, so it is a hard blocker regardless of which direction you go.

### 3.2 Option (a) — `eslint-config-love`

| Property | Value | Source |
|---|---|---|
| Current version | **155.0.0**, published **2026-08-12** (yesterday) | `npm view eslint-config-love version time` |
| Peer range | **`eslint: "^9.35.0"`, `typescript: "*"`** — **no `^10`** | `npm view eslint-config-love peerDependencies`; same on repo `HEAD` |
| ESLint 10 support | **Not released.** PR [#2302](https://github.com/mightyiam/eslint-config-love/pull/2302) open, last activity 2026-08-12 | GitHub |
| Flat config | Yes — flat-only, spread into `eslint.config.js` | README |
| Character today | 262 rules from ESLint core + `@typescript-eslint` + `@eslint-community/eslint-comments` + `n` + `promise`. Philosophy: *"Safety at the cost of verbosity"*, *"Convention over arbitrary choice"*, *"No formatting rules (please use a formatter)"*. **It no longer tracks `standard` and the README never mentions it.** | README |
| Maintenance | Very active (weekly-ish majors — every rule change is a breaking major, hence v155) | npm `time` |
| Notable constraint | Sets `languageOptions.parserOptions.project = true` — full type-aware linting, non-negotiable | README |

The blocking chain, from the PR discussion: `eslint-config-love` depends on `eslint-plugin-import`;
`eslint-plugin-import` has an unreleased ESLint 10 fix; a contributor notes *"as long as this config
depends on it, releases here stay gated on a release over there that no one can put a date on."*
The resolution being pursued is to **drop `eslint-plugin-import` from the config entirely** rather
than switch to `import-x`. Even once merged, that means love-on-v10 will ship with **no import
linting at all** — so this project would need its own `import/order` setup regardless.

### 3.3 Option (b) — compose `typescript-eslint` directly

`typescript-eslint` **8.67.0** (peer `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0`; TS `>=4.8.4 <6.1.0`).
There is **no v9** — 8.x is the current major line (`npm view typescript-eslint dist-tags` →
`latest: 8.67.0`, `canary: 8.67.1-alpha.4`).

**ESLint 10 support landed in `typescript-eslint@8.56.0`** (2026-02-16, PR
[#12057](https://github.com/typescript-eslint/typescript-eslint/pull/12057)); 8.55.0 declares only
`^8.57.0 || ^9.0.0`. Verified via `npm view typescript-eslint@8.55.0 peerDependencies.eslint`.

Available shared configs (verified by importing the installed package):
`all, base, disableTypeChecked, eslintRecommended, recommended, recommendedTypeChecked,
recommendedTypeCheckedOnly, strict, strictTypeChecked, strictTypeCheckedOnly, stylistic,
stylisticTypeChecked, stylisticTypeCheckedOnly`.

**v6 → v7 → v8 breaking changes that matter here:**

| Version | Change | Impact on this repo |
|---|---|---|
| v7 | New unified **`typescript-eslint`** package replacing separate `@typescript-eslint/parser` + `/eslint-plugin`; exports `tseslint.config()` and flat configs | Replace both current deps with one |
| v7 | ESLint peer tightened to `^8.56.0`; Node `^18.18.0 \|\| >=20`; TS `>=4.7.4` | Satisfied |
| v8 | `ban-types` **removed**, split into `no-restricted-types` / `no-empty-object-type` / `no-wrapper-object-types` | Not referenced in this repo's config |
| v8 | `no-var-requires`, `no-loss-of-precision`, `no-empty-interface` removed from presets | **`src/app/theme.ts` has two `eslint-disable` comments for `@typescript-eslint/no-empty-interface`** — now dead directives (probe flagged them) |
| v8 | Added to presets: `no-empty-object-type`, `no-unsafe-function-type`, `no-wrapper-object-types`, `no-require-imports` | `no-empty-object-type`: **3 errors** in probe |
| v8 | `no-unused-vars` aligned with ESLint 9 on caught errors (`caughtErrors: 'none'` to opt out) | 0 hits |
| v8 | `prefer-nullish-coalescing` `ignoreConditionalTests` now defaults `true` | Not enabled here |
| v8 | `EXPERIMENTAL_useProjectService` → stable **`projectService`** | Use it (see §6.3) |
| v8 | `prefer-ts-expect-error` deprecated (→ `ban-ts-comment`); `no-useless-template-literals` → `no-unnecessary-template-expression` | Not referenced |
| v8 | Removed `DEPRECATED__createDefaultProgram`, `EXPERIMENTAL_useSourceOfProjectReferenceRedirect` | Not used |

**`tseslint.config()` vs `defineConfig()`:** `tseslint.config()` is a typed helper for building
the config array (`typescript-eslint` v7+). ESLint 9.15+/10 also ships `defineConfig()` from
`eslint/config`, which additionally supports `extends` inside config objects. Both work; the
typescript-eslint docs still show `tseslint.config()`, and `eslint-plugin-import`'s docs added a
"flat config guide for using `tseslint.config()`" in 2.32.0. **Either is fine — `defineConfig` is
the more future-proof choice** since it's core and `extends` makes the per-file scoping in §6.2 less
verbose. (This is my inference, not documented guidance.)

### 3.4 Recommendation: **(b), unambiguously**

1. **(a) is unavailable.** `eslint-config-love@155.0.0` cannot install against `eslint@10`. Adopting
   it means either staying on EOL ESLint 9 or waiting on a PR with no date.
2. **The project already fights `standard`.** The current config turns *off* seven type-aware rules
   that `standard-with-typescript` turns on (`no-misused-promises`, `no-confusing-void-expression`,
   `promise-function-async`, `unbound-method`, `no-floating-promises`, `no-unsafe-argument`,
   `no-invalid-void-type`) and re-tunes two more. That is the signature of a preset that doesn't fit.
   `eslint-config-love` is *stricter* than `standard-with-typescript`, not looser — adopting it means
   more overrides, not fewer.
3. **love's release cadence is hostile to a single-maintainer side project.** Every rule addition is
   a major (155 majors). Renovate/Dependabot on `^155` will never bump; manual majors will each
   arrive with new errors.
4. **(b) is measurably cheap here.** `recommendedTypeChecked` over the whole codebase: **29 errors**,
   22 of which are one auto-diagnosable rule (`require-await`). That is the entire cost of dropping
   the standard lineage.
5. **STRATEGY.md fit.** "Minimal, exact-fit tool… prefer not adding features." A config composed from
   `tseslint.configs.recommendedTypeChecked` + the four plugins actually in use is exactly that; a
   262-rule opinionated preset is not.

**Concrete shape of (b):**

```
@eslint/js                    js.configs.recommended
typescript-eslint             tseslint.configs.recommendedTypeChecked   (+ stylisticTypeChecked, optional)
eslint-plugin-react-hooks     configs.flat.recommended
eslint-plugin-react           configs.flat.recommended + configs.flat['jsx-runtime']   ← BLOCKED, see §5
eslint-plugin-import-x        order rule only (no preset needed)
eslint-plugin-testing-library flat/react, scoped to **/*.test.{ts,tsx}
eslint-plugin-jest-dom        flat/recommended, scoped to **/*.test.{ts,tsx}
eslint-config-prettier/flat   last
eslint-plugin-prettier        prettier/prettier: error   (keep — see §4)
```

`eslint-plugin-n` and `eslint-plugin-promise` come along with `standard-with-typescript` today and are
**not referenced by any rule in `.eslintrc.json`**. Dropping both is the FSD/browser-app-appropriate call
(`n` is a Node-targeting plugin). The `tests/` workspace has the same situation.

---

## 4. Q3 — Prettier's position

### 4.1 Does `eslint-plugin-prettier` + `"prettier/prettier": 2` still work on ESLint 10?

**Yes — verified by running it.** `eslint-plugin-prettier@5.5.6` + `eslint-config-prettier@10.1.8` +
`prettier@3` over 281 files on ESLint 10.8.1: **0 `prettier/prettier` errors**, no crash.

- Peer ranges (`npm view eslint-plugin-prettier peerDependencies`):
  `eslint: ">=8.0.0"`, `prettier: ">=3.0.0"`,
  `eslint-config-prettier: ">= 7.0.0 <10.0.0 || >=10.1.0"` (optional),
  `@types/eslint: ">=8.0.0"` (optional). `>=8.0.0` admits ESLint 10 — no ERESOLVE.
- Flat config: ships `eslint-plugin-prettier/recommended`, which bundles the plugin, the rule, **and**
  `eslint-config-prettier`. README: *"add it as the **last** item in the configuration array … so that
  `eslint-config-prettier` has the opportunity to override other configs."*
- Last publish 2026-05-28; actively maintained.

### 4.2 ESLint's own guidance

From https://eslint.org/blog/2023/10/deprecating-formatting-rules/ :

> "We recommend using a source code formatter instead of ESLint for formatting your code."

Named options: **Prettier** and **dprint**. The fallback for people who won't adopt a formatter is
`@stylistic/eslint-plugin-js` / `-ts`.

**ESLint does not mention `eslint-plugin-prettier` at all** — the guidance is "use a formatter",
which is silent on whether you invoke it via ESLint or as a separate step. `eslint-plugin-prettier`'s
own README carries the caveats: *"If your desired formatting does not match Prettier's output, you
should use a different tool such as prettier-eslint instead"*, plus warnings about autofix conflicts.

**My read (inference, not documented):** the repo already runs `prettier --check .` as a separate
`format:check` script, so `prettier/prettier` as a rule is *duplicate* enforcement. Dropping the
plugin would remove a dependency, speed up lint, and match ESLint's stated direction. But it works,
it costs nothing, and it gives editor-inline formatting feedback. **Not a migration blocker either
way — decide separately.**

### 4.3 `eslint-config-prettier` — still needed?

**Yes.** Two independent reasons:

1. Core formatting rules were **not** removed in v10 (§2.2), so `js.configs.recommended` and any
   preset that enables them still conflicts.
2. More importantly, `eslint-config-prettier` disables conflicting rules from **plugins**
   (`@typescript-eslint`, `react`, `vue`, `@stylistic`, …) — its changelog explicitly notes it
   "remains relevant because it continues disabling conflicting rules from various plugins … not just
   core ESLint rules." `typescript-eslint`'s `stylisticTypeChecked` is exactly such a source.

**v9 → v10 changes:**

| Version | Change |
|---|---|
| 10.0.0 | **"add support for @stylistic formatting rules"** — the only breaking entry. Additive in practice: it now also turns off `@stylistic/*` rules. |
| 10.1.0 | migrate to `exports` field |
| 10.1.1 | adds **`eslint-config-prettier/flat`** entry point — same rules plus a `name` property for config-inspector. *"the previous `eslint-config-prettier` entry still works, but `eslint-config-prettier/flat` adds a new `name` property … we just can't add it for the default entry for compatibility."* |
| current | **10.1.8**; peer `eslint: ">=7.0.0"` — admits ESLint 10 |

The changelog contains **no entry mentioning ESLint 10 support** — because it's a pure rules-off
config with no plugin code, so there is nothing to break. Verified working in the probe.

> ⚠️ Version-hygiene note: four `eslint-config-prettier` versions (`8.10.1`, `9.1.1`, `10.1.6`,
> `10.1.7`) were all published within minutes on 2025-07-18 and are the subject of
> [issue #339 "four new versions published with no code changes to repo"](https://github.com/prettier/eslint-config-prettier/issues/339)
> and [issue #361 "Package has malware in it"](https://github.com/prettier/eslint-config-prettier/issues/361).
> Patched releases `10.1.8` / `9.1.2` / `8.10.2` followed the same day. I could **not** read the
> maintainer resolution from the issue pages (see Open Questions). `tests/package.json` currently
> pins `eslint-config-prettier: "^9.1.0"`, which can resolve to `9.1.1`. Moving to `^10.1.8` as part
> of this migration sidesteps the question entirely.

---

## 5. Plugin version matrix

Target: **ESLint 10.8.1, flat config.** "Current" from `npm view <pkg> version` on 2026-08-13.

| Plugin | Repo has | Current | Min version for ESLint 10 + flat | Declared peer `eslint` | Flat config export | Status |
|---|---|---|---|---|---|---|
| `eslint` | ^8.57.1 | **10.8.1** | — | — | — | ✅ |
| `typescript-eslint` (unified) | `@typescript-eslint/*` ^6.21.0 | **8.67.0** | **8.56.0** (added ESLint 10 peer) | `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | `tseslint.configs.*` | ✅ |
| `eslint-plugin-react` | ^7.37.5 | 7.37.5 (2025-04-03) | **none released** | `^3…\|\| ^8 \|\| ^9.7` | `configs.flat.{recommended,all,jsx-runtime}` (since 7.35) | ❌ **BROKEN** — crashes on every rule; ERESOLVE on install; fix on `master`, PR #4022 open |
| `eslint-plugin-react-hooks` | ^4.6.2 | **7.1.1** | **7.1.0** ("Add ESLint v10 support") | `^3…\|\| ^9.0.0 \|\| ^10.0.0` | `configs.flat.recommended`, `configs.flat['recommended-latest']` | ✅ but see §6.1 — `recommended` now includes 14 React Compiler rules |
| `eslint-plugin-import` | ^2.32.0 | 2.32.0 (2025-06-20) | **none released** (v10 support is `[Unreleased]`) | `^2 … \|\| ^9` | `flatConfigs.*` | ❌ **BROKEN** — `import/order` crashes; ERESOLVE on install |
| `eslint-plugin-import-x` | — | **4.17.1** | 4.x (current) | `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | `flatConfigs.{recommended,typescript,react,…}` | ✅ **the maintained path** |
| `eslint-import-resolver-typescript` | ^3.10.1 | **4.4.5** | 4.x | `*` (+ optional peers on both `eslint-plugin-import` and `eslint-plugin-import-x`) | n/a (resolver) | ✅ works with import-x |
| `eslint-plugin-n` | ^16.6.2 | **18.3.0** | 18.x | `>=8.57.1` | `configs['flat/recommended']`, `flat/recommended-module`, `flat/mixed-esm-and-cjs`, `flat/all` | ✅ — **but recommend dropping** (Node plugin, browser app) |
| `eslint-plugin-promise` | ^6.6.0 | **7.3.0** | 7.x | `^7 \|\| ^8 \|\| ^9 \|\| ^10` | `configs['flat/recommended']` | ✅ — **recommend dropping** (no rule referenced) |
| `eslint-plugin-testing-library` | ^6.5.0 | **7.16.2** | 7.x | `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | `configs['flat/react']`, `flat/dom`, … | ✅ |
| `eslint-plugin-jest-dom` | ^5.10.1 | **5.10.1** | 5.10.1 (PR #416 "feat: support ESLint v10", 2026-07-28; published 2026-08-02) | `^6.8 … \|\| ^9.0.0 \|\| ^10.0.0` | `configs['flat/recommended']`, `flat/all` | ✅ already at the right version |
| `eslint-plugin-playwright` | ^0.21.0 (`tests/`) | **2.11.0** | 2.x | `>=8.40.0` | `configs['flat/recommended']` | ✅ |
| `eslint-plugin-prettier` | ^5.5.6 | 5.5.6 | 5.x | `>=8.0.0` | `eslint-plugin-prettier/recommended` | ✅ verified working |
| `eslint-config-prettier` | ^9.1.2 | **10.1.8** | 10.1.1+ for `/flat` entry | `>=7.0.0` | `eslint-config-prettier/flat` | ✅ |
| `eslint-config-standard-with-typescript` | ^43.0.1 | 43.0.1 (deprecated) | — | — | none | ❌ remove |
| `eslint-config-love` | — | 155.0.0 | **none — peer is `^9.35.0`** | `^9.35.0` | flat-only | ❌ not on v10 |
| `@eslint/js` | — | **10.0.1** | 10.x | `^10.0.0` | is a config | ✅ |
| `@eslint/eslintrc` (FlatCompat only) | — | 3.3.6 | 3.3.6 | — | n/a | ✅ escape hatch, frozen |
| `@eslint/migrate-config` | — | 3.0.2 | — | — | n/a | ✅ starting point |

### 5.1 `eslint-plugin-react-hooks` v4 → v5 → v6 → v7

| Major | Changes |
|---|---|
| **v5.0.0** | ESLint v9 support. **New violation:** component names must start with an *uppercase* letter (was: non-lowercase) — `_Button` now invalid. `useActionState` dispatch treated as stable. `React.use()` handled like `use()`. |
| **v5.2.0** | **Flat config support added** (`configs['recommended-latest']`); plugin converted to TypeScript with bundled types. |
| **v6.1.0** | (6.0.0 was mis-published and untagged.) **Breaking:** Node ≥18. **Breaking: flat config becomes the default `recommended` preset**; legacy moves to `recommended-legacy`. **New violations:** `use()` inside try/catch; `useEffectEvent` in arbitrary closures. Adds `settings['react-hooks'].additionalEffectHooks`. React Compiler rules introduced under `recommended-latest`. |
| **v7.0.0** | **Breaking:** presets slimmed to exactly two — `recommended` and `recommended-latest`. Removed `recommended-latest-legacy` and the standalone `flat/recommended` naming. **"all compiler rules are enabled by default"** — i.e. `recommended` = `rules-of-hooks` + `exhaustive-deps` + **14 React Compiler rules**. |
| **v7.0.1** | `export =` for Node16 ESM type resolution; `configs.flat` typing tightened. |
| **v7.1.0** | **ESLint v10 support** (PR facebook/react#35720). Skips compilation for non-React files (perf). Better `set-state-in-effect` detection. |
| **v7.1.1** | Restores a deprecated no-op `component-hook-factories` rule that 7.1.0 accidentally removed. |

**Exact `recommended` contents in 7.1.1** (extracted from the published bundle, `LintRulePreset.Recommended`):

`rules-of-hooks` (error), `exhaustive-deps` (warn), plus compiler rules —
`config`, `error-boundaries`, `gating`, `globals`, `immutability`, `preserve-manual-memoization`,
`purity`, `refs`, `set-state-in-effect`, `set-state-in-render`, `static-components`,
`unsupported-syntax` (warn), `use-memo`, `incompatible-library` (warn).

`recommended-latest` adds `void-use-memo`. Off by default in both:
`capitalized-calls`, `memoized-effect-dependencies`, `exhaustive-effect-dependencies`,
`no-deriving-state-in-effects`, `fbt`, `hooks`, `invariant`, `rule-suppression`, `syntax`, `todo`,
`memo-dependencies`.

**Flat config usage (from the package README):**
```js
import reactHooks from 'eslint-plugin-react-hooks';
export default defineConfig([ reactHooks.configs.flat.recommended ]);
```

**React 19 relevance:** the compiler rules are what make React Compiler adoption viable, and the repo
is on React 19.2 — so they're applicable. **But `recommended` is now a much bigger commitment than
the two rules the project currently enables.** Measured cost: **11 errors, all
`react-hooks/set-state-in-effect`.** Options: adopt `recommended` and fix the 11; or adopt
`recommended` and set `'react-hooks/set-state-in-effect': 'warn'`; or hand-pick
`rules-of-hooks` + `exhaustive-deps` only (the README explicitly discourages this).

### 5.2 `eslint-plugin-import` vs `eslint-plugin-import-x`

**`import-x` is the maintained path today.** Evidence:

| | `eslint-plugin-import` | `eslint-plugin-import-x` |
|---|---|---|
| Latest release | 2.32.0, **2025-06-20** (14 months ago) | 4.17.1, **2026-06-28** |
| ESLint 10 | **`[Unreleased]`** — "support eslint v10 (#3230)" sits in the changelog's Unreleased section; `main`'s `package.json` has `\|\| ^10` in peers but 2.32.0 does not | Shipped: peer `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` |
| `import/order` on ESLint 10 | **Crashes** — `sourceCode.getTokenOrCommentBefore is not a function` (v2.32.0 `src/rules/order.js:31,44`); `main` routes through a new `../core/getTokenOrComment` shim | Works (verified) |
| Deps | 117 transitive | 16 |
| TS resolution | `tsconfig-paths` | `get-tsconfig` + Rust-based resolver, supports `exports` field |

`eslint-config-love` — the closest thing to an authority on the "standard" lineage — chose to **drop
`eslint-plugin-import` entirely** rather than wait, after a merged-then-reverted `import-x` migration
([#2434](https://github.com/mightyiam/eslint-config-love/pull/2434), superseded by
[#2443](https://github.com/mightyiam/eslint-config-love/pull/2443)).

**Migration cost: near zero for this repo.**
- Rule names gain an `-x`: `import/order` → `import-x/order`. That's the only textual change in
  `.eslintrc.json`.
- **The `import/order` options carry over verbatim.** I ran the project's exact options
  (`groups`, `alphabetize: {order:'asc', caseInsensitive:true}`, all three `pathGroups` including
  `@/**/*`, `@tests/*`, `src/**`, and `pathGroupsExcludedImportTypes: ['internal']`) under
  `import-x/order` on the real codebase: schema accepted, **1 error** across 281 files
  (`ProductInputDialog.fixture.tsx:4` — `@tests/mockApi/server` should come after `@/shared/types`).
  That single diff is a genuine ordering nit, auto-fixable with `--fix`.
- `eslint-import-resolver-typescript@4.4.5` declares an optional peer on `eslint-plugin-import-x`, so
  the existing resolver config carries over. `import-x` also exports `createNodeResolver` and a
  `flatConfigs.typescript` preset that sets `import-x/extensions`, `import-x/parsers`, and
  `import-x/external-module-folders` for you.
- `import-x` exposes both `flatConfigs.*` and legacy-shaped `configs.*` (incl. `configs['flat/*']`).

**Alternative if you want to avoid the fork:** pin `eslint@9.39.5` and wait. Not recommended — v9 is EOL.

---

## 6. Rule-level behavioural changes

### 6.1 `@typescript-eslint/strict-boolean-expressions` (v6 → v8)

**No option was renamed, removed, or had its default changed.** All nine options the project sets
still exist with identical names. Documented current defaults
(https://typescript-eslint.io/rules/strict-boolean-expressions/):

| Option | Default | Project sets | Differs from default? |
|---|---|---|---|
| `allowString` | `true` | `true` | — |
| `allowNumber` | `true` | `true` | — |
| `allowNullableObject` | `true` | `true` | — |
| `allowNullableBoolean` | `false` | `true` | ✔ looser |
| `allowNullableString` | `false` | `true` | ✔ looser |
| `allowNullableNumber` | `false` | `false` | — |
| `allowNullableEnum` | `false` | `false` | — |
| `allowAny` | `false` | `false` | — |
| `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing` | `false` | `false` | — |

⚠️ `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing` is **marked deprecated**: *"this option
will be removed in the next major version"* (i.e. typescript-eslint v9, unreleased). It still works
today. Since the project sets it to `false` (the default) and `tsconfig.json` has `"strict": true`,
**this line can simply be deleted now** — zero behaviour change, and it pre-empts the v9 break.

**Empirical:** 0 new `strict-boolean-expressions` errors across 281 files on ESLint 10 +
typescript-eslint 8.67.0 with these exact options. **No fallout.**

### 6.2 `@typescript-eslint/no-unused-vars`

- `argsIgnorePattern: "^_"` still valid; the rule still extends the ESLint core rule.
- **The one real change: `caughtErrors` default moved `"none"` → `"all"`** — in ESLint core v9, and
  typescript-eslint v8 aligned with it. Unused `catch (e)` bindings are now errors.
- **Empirical: 0 hits.** No unused catch bindings in this codebase.
- ESLint 10's **"JSX references are now tracked"** change makes core `no-unused-vars` correct for JSX
  identifiers without `react/jsx-uses-vars` — a small point in favour of not urgently needing
  `eslint-plugin-react`.
- Docs suggest a fuller option set if you want it:
  `{ args: 'all', argsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_',
  destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }`.

### 6.3 `import/order`

Between 2.29.1 (era of the current lockfile's config authorship) and 2.32.0, `order` gained
`sortTypesGroup`, `newlines-between-types`, `consolidateIslands`, named-import ordering, and
`pathGroupOverrides` — all **additive**. `groups`, `alphabetize`, `pathGroups`,
`pathGroupsExcludedImportTypes` are unchanged. Confirmed by the probe: the config was accepted
verbatim by `import-x/order` and produced 1 diff (§5.2).

One thing to watch, from the `[Unreleased]` changelog: *"`order`: make the alphabetize comparator
transitive for sibling/parent imports in the same group, so the autofix converges under **Node 25's**
updated V8 sort."* Not applicable at Node 24, but relevant when the repo moves to Node 25+ — and it is
another unreleased `eslint-plugin-import` fix. `import-x` inherits the same lineage; **unverified**
whether import-x has that fix.

### 6.4 Flat config mechanics

**`overrides` → `files`/`ignores` on config objects.** The eslintrc `overrides` array is gone; the
exported array *is* the overrides list. Rules from https://eslint.org/docs/latest/use/configure/configuration-files:

- `files`: glob patterns the object applies to. Omitted ⇒ applies to any file matched by *another*
  object: *"Configuration objects without `files` or `ignores` are automatically applied to any file
  that is matched by any other configuration object."*
- `ignores`: patterns the object does **not** apply to.
- **Global ignores:** *"When `ignores` is used without any other keys (besides `name`) in the
  configuration object, then the patterns act as global ignores."* Use the `globalIgnores()` helper
  for clarity. **This is where `.eslintignore` content moves** (`node_modules`, `dist`, `public`,
  `vite.config.ts`, `vite-env.d.ts` for the frontend; `playwright.config.ts` for `tests/`).
- Merge: *"Configuration objects are merged with later objects overriding previous objects when there
  is a conflict."* Nested maps like `languageOptions.globals` merge rather than replace.
- ESLint only lints `**/*.js`, `**/*.cjs`, `**/*.mjs` by default — **`.ts`/`.tsx` must be named in a
  `files` pattern** or nothing gets linted. (The current config's `overrides.files: ["*.ts","*.tsx"]`
  must become `["**/*.ts","**/*.tsx"]` — bare `*.ts` matches only the project root in flat config.)
- `env` is gone → `languageOptions.globals` from the `globals` npm package.
- `parserOptions` and `globals` move under `languageOptions`; parsers/plugins become imported modules,
  not strings.

**Practical restructure of the current single `overrides` block:** split into
(1) global ignores, (2) a `**/*.{ts,tsx}` block with parser + type info + core/TS/react/import rules,
(3) a `**/*.test.{ts,tsx}` + `tests/**` block adding `testing-library` and `jest-dom` (they are
currently applied to *all* files, which is wasteful), (4) `eslint-config-prettier/flat` +
`eslint-plugin-prettier/recommended` last.

**`parserOptions.project` vs `projectService`.** typescript-eslint docs call `projectService`
*"our recommended option"* and `project` *"an older option that can be used as an alternative."*
`projectService` uses the same TypeScript project service the editor uses, automatically finding the
nearest `tsconfig.json` per file.

For this repo specifically: **`src/frontend/` has exactly one tsconfig** (`src/frontend/tsconfig.json`,
`include: ["src","tests","types"]`) — no `tsconfig.node.json`, no project references, no
`tsconfig.app.json`. Verified with `fd -H -t f 'tsconfig'`. So the multi-tsconfig complexity that
usually bites Vite projects **does not apply here**. Either option works; `projectService: true` is
simpler and is what I used in the probe (it linted all 281 files with full type information — proven
by type-only rules like `no-unsafe-member-access` firing).

The one gap: `vite.config.ts` and `vite-env.d.ts` are **not** in the tsconfig's `include` and are
currently in `.eslintignore`. If you want to lint `vite.config.ts` under flat config you'd need
`projectService: { allowDefaultProject: ['vite.config.ts'] }` (note: `**` is prohibited in those
globs, and each such file carries non-trivial perf cost). Simplest: keep it ignored.

---

## 7. The `tests/` Playwright workspace

Separate yarn workspace, separate everything. Current state: `.eslintrc.json` extends
`standard-with-typescript` + `plugin:playwright/recommended` + `prettier`, sets `prettier/prettier`
and `no-console`, and declares `plugins: ["prettier","import"]`. **No `parserOptions.project`** — so
it is running `standard-with-typescript` without type information.

Differences that matter:

1. **`eslint-plugin-playwright` 0.21.0 → 2.11.0** — three majors:
   - **v1.0.0** (2024-02-11) BREAKING: `additionalAssertFunctionNames` renamed to
     `assertFunctionNames`, and it is now rule-level only (no longer settable globally).
     Neither is used here, so no impact.
   - **v2.0.0** (2024-10-23) BREAKING: jest-playwright configs removed. Not used here.
   - Flat config export: `playwright.configs['flat/recommended']`. The docs recommend scoping it with
     `files` to test files only.
   - Peer `eslint: ">=8.40.0"` — admits ESLint 10, no ERESOLVE. I did **not** run it against ESLint 10
     (only one spec file exists), so "works" is peer-range inference, not verified execution.
2. **The workspace lints exactly one spec file** (`scenarios/appIntegrity.spec.ts`) plus `config.ts`;
   `playwright.config.ts` is in `.eslintignore`. This is a 15-minute job.
3. **`standard-with-typescript` here should just be deleted, not replaced.** With no `project` set,
   its type-aware half was never running. `tseslint.configs.recommended` (non-type-checked) +
   `playwright` flat/recommended + prettier is a faithful, simpler equivalent. `eslint-plugin-n`,
   `eslint-plugin-promise` and `eslint-plugin-import` are declared but never referenced — drop.
4. `tests/tsconfig.json` is `module: commonjs`, `target: es2016`, with no `include`. If you *do* want
   type-aware linting there, `projectService: true` will pick it up.
5. `@types/eslint: "^8"` in `tests/package.json` should be dropped — ESLint 10 ships its own types
   (v10 release notes: espree and eslint-scope now include built-in TypeScript type definitions), and
   `eslint-plugin-prettier` declares `@types/eslint` as an *optional* peer.
6. `eslint-config-prettier: "^9.1.0"` — see the version-hygiene note in §4.3.

---

## 8. Expected fallout & migration sizing

### 8.1 Measured, on the real codebase

All numbers from ESLint 10.8.1 + typescript-eslint 8.67.0 with `projectService`, over
`src/frontend/{src,tests}/**/*.{ts,tsx}` = **281 files**.

| Configuration probed | Errors | Warnings | Dominant rules |
|---|---|---|---|
| **Project's own rules only** (no preset) | **1** | 4 | `import-x/order` ×1; 4 unused-disable-directive warnings |
| + `react-hooks@7` `configs.flat.recommended` | **12** | 4 | `react-hooks/set-state-in-effect` ×11 |
| + `tseslint.configs.recommendedTypeChecked` | **29** | 4 | `require-await` ×22, `no-empty-object-type` ×3, `no-unsafe-*` ×3 |
| + `strictTypeChecked` + `stylisticTypeChecked` | **93** | 4 | `require-await` ×22, `no-deprecated` ×22, `restrict-template-expressions` ×18, `no-empty-function` ×13, `no-unnecessary-condition` ×8 |
| + `eslint-plugin-prettier/recommended` | **0** | 7 | — code is already Prettier-clean |

The 4 baseline warnings are **dead `eslint-disable` directives** left behind when
`standard-with-typescript` rules stop being enabled:
- `src/app/store.ts:7` — `@typescript-eslint/explicit-function-return-type`
- `src/app/theme.ts:5` and `:8` — `@typescript-eslint/no-empty-interface` (rule **removed** in
  typescript-eslint v8)
- `src/features/manageNote/model/imageUrlsListener.test.ts:35` — `@typescript-eslint/explicit-function-return-type`

### 8.2 Which choices produce volume

**Ranked by risk of blowing up the migration:**

1. 🔴 **`eslint-plugin-react` — not a volume problem, a blocker.** There is no version that installs
   and runs on ESLint 10. This determines whether the migration can complete at all. Three ways out:
   (a) drop `eslint-plugin-react` and keep only `react-hooks` — the project only uses 5 react rules,
   two of which (`react/react-in-jsx-scope`, `react/jsx-uses-react`) it turns *off*, and ESLint 10's
   JSX reference tracking covers what `jsx-uses-vars` did; the real losses are
   `react/function-component-definition` (a documented project convention!),
   `react/self-closing-comp`, `react/jsx-no-useless-fragment`, and `plugin:react/recommended`;
   (b) apply a `.yarn/patches` patch for the one-line `version.js` fix (already on `master`);
   (c) wait for PR #4022 to land and ship.
2. 🟠 **`strictTypeChecked`** — 93 errors, of which `no-deprecated` (22) and
   `restrict-template-expressions` (18) are the tedious ones. **Do not do this in the same PR.**
3. 🟡 **`react-hooks@7` `recommended`** — 11 errors, all `set-state-in-effect`. These are real React
   correctness findings and worth fixing, but each requires thinking about the effect. Could be
   `'warn'` for one release.
4. 🟡 **`recommendedTypeChecked`** — 29 errors; 22 are `require-await` (delete a stray `async`).
   Mechanical.
5. 🟢 **`strict-boolean-expressions`, `no-unused-vars`, `import/order`, `prettier/prettier`** — the
   three rules the task flagged as risky are all **zero-to-one-error**. The project's careful tuning
   ported forward cleanly.

### 8.3 Sizing verdict: **split into 3 tickets, not one sitting**

Not because of error volume — because of the `eslint-plugin-react` decision and the second workspace.

| # | Ticket | Contents | Size |
|---|---|---|---|
| **1** | **Decide the `eslint-plugin-react` story** | Spike: measure what `plugin:react/recommended` actually catches today; decide drop vs. yarn patch vs. wait. Blocks #2. | Small, but a decision |
| **2** | **Frontend: ESLint 8 eslintrc → ESLint 10 flat config** | `@eslint/migrate-config` as a starting point, then hand-written. Drop `standard-with-typescript`/`n`/`promise`. Add `typescript-eslint@8` unified pkg + `recommendedTypeChecked`. `import` → `import-x`. `react-hooks` v4 → v7 (`set-state-in-effect` to `warn` if needed). `.eslintignore` → `globalIgnores`. Bump `testing-library` 6→7, `eslint-config-prettier` 9→10, scope test plugins to test files. Delete the 4 dead disable-directives and the deprecated `allowRuleToRunWithoutStrictNullChecks…` option. Fix 29 + 1 errors. | ~1 sitting |
| **3** | **`tests/` workspace** | Same flat-config rewrite at 1/10 the scale; `playwright` 0.21 → 2.11; drop `standard-with-typescript`/`n`/`promise`/`import`/`@types/eslint`. | ~30 min |
| **4 (optional, later)** | **Raise the bar to `strictTypeChecked`** | 93 errors. Separate PR or never. | ~1 sitting |

---

## 9. Open questions

1. **When will `eslint-plugin-react` ship ESLint 10 support?** PR #4022 is open with no maintainer
   timeline; the last commit to `master` was 2026-05-17 and the last npm release 2025-04-03.
   *Would resolve it:* a maintainer comment on #4022 or #4027, or a new npm publish. Worth re-checking
   right before starting ticket #2.
2. **Same for `eslint-plugin-import`.** The v10 fix is merged to `main` and sitting in `[Unreleased]`;
   a contributor on the eslint-config-love PR called it a release "that no one can put a date on."
   If 2.33.0 ships before the migration starts, the `import-x` switch becomes optional.
3. **Does `eslint-plugin-import-x` carry the transitive-alphabetize-comparator fix** that
   `eslint-plugin-import`'s `[Unreleased]` section describes for Node 25's V8 sort? Not checked.
   *Would resolve it:* diff `import-x`'s `order.js` comparator against import-js#3235.
4. **The `eslint-config-prettier` July-2025 publishing incident.** Issues #339 and #361 exist; I could
   not read maintainer statements or an authoritative affected-versions list from the issue pages
   (GitHub returned partial content). *Would resolve it:* the GitHub Security Advisory database, or
   the npm audit entry. Mitigation is trivial regardless (use `>=10.1.8`), so this does not block.
5. **`eslint-plugin-playwright@2.11.0` on ESLint 10 was not executed**, only peer-range checked
   (`>=8.40.0`). No ESLint-10 issues exist in its tracker, but the repo has no `.github` search hits
   either way. *Would resolve it:* run it against `tests/scenarios/` during ticket #3 — cheap.
6. **Whether to keep `eslint-plugin-prettier` at all.** ESLint's guidance says "use a formatter" but
   is silent on plugin-vs-separate-step, and the repo already runs `prettier --check` separately.
   This is a preference, not a fact gap.
7. **`react-hooks/set-state-in-effect` × 11 — are they real bugs?** Not assessed; the rule is new to
   this codebase. Reading the 11 sites is part of ticket #2.

---

## 10. Sources

### ESLint core
- ESLint v10 migration guide — https://eslint.org/docs/latest/use/migrate-to-10.0.0
- Raw v10 migration guide (heading list) — https://raw.githubusercontent.com/eslint/eslint/main/docs/src/use/migrate-to-10.0.0.md
- ESLint v10.0.0 release announcement — https://eslint.org/blog/2026/02/eslint-v10.0.0-released/
- What's coming in ESLint v10.0.0 — https://eslint.org/blog/2025/10/whats-coming-in-eslint-10.0.0/
- ESLint v9 migration guide — https://eslint.org/docs/latest/use/migrate-to-9.0.0
- Version support policy / EOL dates — https://eslint.org/version-support/
- eslintrc → flat config migration guide — https://eslint.org/docs/latest/use/configure/migration-guide
- Flat config reference — https://eslint.org/docs/latest/use/configure/configuration-files
- Rule deprecation policy — https://eslint.org/docs/latest/use/rule-deprecation
- Deprecation of formatting rules (Prettier guidance) — https://eslint.org/blog/2023/10/deprecating-formatting-rules/
- v10.8.1 source, rule registry (proves formatting rules still present) — https://raw.githubusercontent.com/eslint/eslint/v10.8.1/lib/rules/index.js
- v10.8.1 `package.json` (Node engines) — https://raw.githubusercontent.com/eslint/eslint/v10.8.1/package.json
- `@eslint/eslintrc` README (FlatCompat) — https://raw.githubusercontent.com/eslint/eslintrc/main/README.md

### typescript-eslint
- v8 announcement — https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/
- v7 announcement — https://typescript-eslint.io/blog/announcing-typescript-eslint-v7/
- `strict-boolean-expressions` — https://typescript-eslint.io/rules/strict-boolean-expressions/
- `no-unused-vars` — https://typescript-eslint.io/rules/no-unused-vars/
- Typed linting guide — https://typescript-eslint.io/getting-started/typed-linting/
- Parser / `projectService` — https://typescript-eslint.io/packages/parser/
- ESLint v10 support PR — https://github.com/typescript-eslint/typescript-eslint/pull/12057 (released in v8.56.0, 2026-02-16)

### standard / love
- `eslint-config-love` repo — https://github.com/mightyiam/eslint-config-love
- PR: eslint v10 support (OPEN) — https://github.com/mightyiam/eslint-config-love/pull/2302
- Issue: support eslint@^10 — https://github.com/mightyiam/eslint-config-love/issues/2293
- PR: Replace eslint-plugin-import with import-x — https://github.com/mightyiam/eslint-config-love/pull/2434
- PR: eslint 10 no import — https://github.com/mightyiam/eslint-config-love/pull/2443

### Plugins
- `eslint-plugin-react` PR #4022 "complete ESLint 10 compatibility" (OPEN) — https://github.com/jsx-eslint/eslint-plugin-react/pull/4022
- `eslint-plugin-react` issue #4018 (the crash) — https://github.com/jsx-eslint/eslint-plugin-react/issues/4018
- `eslint-plugin-react` issue #4027 — https://github.com/jsx-eslint/eslint-plugin-react/issues/4027
- `version.js` on master (fixed) — https://raw.githubusercontent.com/jsx-eslint/eslint-plugin-react/master/lib/util/version.js
- `version.js` at v7.37.5 (broken) — https://raw.githubusercontent.com/jsx-eslint/eslint-plugin-react/v7.37.5/lib/util/version.js
- `eslint-plugin-import` CHANGELOG (`[Unreleased]` = eslint v10) — https://raw.githubusercontent.com/import-js/eslint-plugin-import/main/CHANGELOG.md
- `eslint-plugin-import` issue #3227 "Compatibility with ESLint 10" — https://github.com/import-js/eslint-plugin-import/issues/3227
- `import/order` at v2.32.0 (uses removed API) — https://raw.githubusercontent.com/import-js/eslint-plugin-import/v2.32.0/src/rules/order.js
- `eslint-plugin-import-x` — https://github.com/un-ts/eslint-plugin-import-x
- `eslint-plugin-react-hooks` CHANGELOG — https://raw.githubusercontent.com/facebook/react/main/packages/eslint-plugin-react-hooks/CHANGELOG.md
- `eslint-plugin-react-hooks@7.1.1` published bundle (preset extraction) — `npm pack eslint-plugin-react-hooks@7.1.1`
- `eslint-plugin-n` v18.0.0 / v17.0.0 releases — https://github.com/eslint-community/eslint-plugin-n/releases
- `eslint-plugin-promise` v7.0.0 release — https://github.com/eslint-community/eslint-plugin-promise/releases
- `eslint-plugin-playwright` releases (v1.0.0, v2.0.0) — https://github.com/playwright-community/eslint-plugin-playwright/releases
- `eslint-plugin-playwright` repo/README — https://github.com/playwright-community/eslint-plugin-playwright
- `eslint-plugin-jest-dom` PR #416 "feat: support ESLint v10" — https://github.com/testing-library/eslint-plugin-jest-dom/pull/416

### Prettier
- `eslint-plugin-prettier` repo — https://github.com/prettier/eslint-plugin-prettier
- `eslint-config-prettier` CHANGELOG — https://raw.githubusercontent.com/prettier/eslint-config-prettier/main/CHANGELOG.md
- `eslint-config-prettier` issue #339 — https://github.com/prettier/eslint-config-prettier/issues/339
- `eslint-config-prettier` issue #361 — https://github.com/prettier/eslint-config-prettier/issues/361

### Registry commands used
```
npm view eslint dist-tags --json
npm view eslint time --json
npm view eslint@10.8.1 engines dependencies
npm view eslint-config-standard-with-typescript deprecated version time.modified
npm view eslint-config-love version peerDependencies time --json
npm view typescript-eslint version peerDependencies dist-tags versions --json
npm view typescript-eslint@{8.40,8.45,8.50,8.55,8.56,8.57,8.58}.0 peerDependencies.eslint
npm view <plugin> version peerDependencies engines deprecated time.modified
npm view @eslint/{js,eslintrc,migrate-config} version peerDependencies dependencies
```

---

## Appendix: how the probe was run

Nothing was installed into the repo and no repo file was modified. Three throwaway npm projects were
created under the session scratchpad
(`/private/tmp/claude-501/.../scratchpad/{probe,probe2,probe3}`) and driven through the ESLint Node
API with `cwd` pointed at `src/frontend` and `overrideConfigFile: true`:

```js
const eslint = new ESLint({
  cwd: '/Users/pkirilin/storage/repo/personal/food-diary/src/frontend',
  overrideConfigFile: true,
  overrideConfig: [/* flat config under test */],
});
const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts', 'tests/**/*.tsx']);
```

Type information came from `parserOptions: { projectService: true, tsconfigRootDir: <frontend> }`;
TypeScript resolved the project's own dependencies from `src/frontend/node_modules` because module
resolution walks up from each source file. Type-only rules (`no-unsafe-member-access`,
`no-unsafe-return`, `no-unnecessary-condition`) firing confirms full type info was available.

Installed in `probe`: eslint 10.8.1, typescript-eslint 8.67.0, typescript 5.9.3,
eslint-plugin-react-hooks 7.1.1, eslint-plugin-import-x 4.17.1, eslint-import-resolver-typescript
4.4.5, eslint-plugin-prettier 5.5.6, eslint-config-prettier 10.1.8, eslint-plugin-testing-library
7.16.2, eslint-plugin-jest-dom 5.10.1 — **no peer conflicts**.

`probe2` needed `--legacy-peer-deps` to force `eslint-plugin-react@7.37.5` and
`eslint-plugin-import@2.32.0` alongside `eslint@10`; without it npm fails with:

```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: eslint@10.8.1
npm error Could not resolve dependency:
npm error peer eslint@"^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7" from eslint-plugin-react@7.37.5
```
