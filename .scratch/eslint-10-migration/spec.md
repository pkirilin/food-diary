# Spec: Migrate frontend linting to ESLint 10

Status: ready-for-agent

Research: [research.md](./research.md) — all version numbers and error counts below were measured on 2026-08-13 by running ESLint 10.8.1 against the real codebase, not inferred from docs.

## Problem Statement

The frontend lints with ESLint 8.57.1, which reached end-of-life in October 2024. ESLint 9 reached end-of-life on 2026-08-06. Both of the repo's yarn workspaces that run ESLint — the React frontend and the Playwright E2E suite — sit on an unmaintained toolchain built around `eslint-config-standard-with-typescript`, a package its own author deprecated in March 2024.

The practical consequences:

- Security and correctness fixes in the linter no longer reach the project.
- `@typescript-eslint` is pinned two majors behind, so rules that catch real bugs in modern TypeScript are unavailable.
- `eslint-plugin-react-hooks` is pinned at v4, predating React 19 and the React Compiler diagnostics.
- Every dependency upgrade elsewhere in the frontend risks colliding with a lint stack that can no longer move.

The migration is not a straight version bump. The legacy `.eslintrc` configuration system was removed outright in ESLint 10 — there is no compatibility flag — so the configuration must be rewritten in flat-config form. Two plugins the project depends on crash outright when run under ESLint 10.

## Solution

Move both workspaces to ESLint 10 with flat configuration, and take the opportunity to shed the preset lineage the project has been fighting.

From the developer's perspective, `yarn lint` continues to work exactly as before and continues to enforce the conventions the project actually cares about — strict boolean expressions, alphabetized import ordering, arrow-function components, Prettier formatting. What changes underneath is that the rules now come from actively maintained sources, the React rules cover a class of bug they previously missed, and the toolchain can accept upgrades again.

The one visible difference is a set of 12 new warnings flagging `setState` calls inside effects. These are genuine React correctness findings. They are deliberately left as warnings and addressed separately, so that a tooling migration does not smuggle in a dozen behavioral changes.

## User Stories

1. As a developer working on the frontend, I want `yarn lint` to run on a supported ESLint release, so that linter bug fixes and security patches continue to reach the project.
2. As a developer, I want the lint configuration expressed in flat-config form, so that it matches every current tutorial, plugin README, and upstream migration guide I will consult.
3. As a developer, I want `yarn lint` to keep the same command name and exit-code behavior, so that my muscle memory and the CI workflow keep working unchanged.
4. As a developer, I want the linter to still enforce `@typescript-eslint/strict-boolean-expressions` with the project's nine tuned options, so that the explicit-null-check convention documented in CLAUDE.md survives the migration.
5. As a developer, I want `import/order` to keep alphabetizing groups and placing the `@/**` path group after internal imports, so that import blocks stay in the order the project has always used.
6. As a developer, I want the linter to catch missing `key` props on list items, so that a whole class of React reconciliation bug is caught before review.
7. As a developer, I want React rules that understand TypeScript natively, so that I stop paying for prop-types machinery that a TypeScript codebase cannot use.
8. As a developer, I want the React hooks rules to keep flagging conditional hook calls and incomplete dependency arrays, so that the guarantees I currently rely on are not lost in the vendor swap.
9. As a developer, I want to be told when I call `setState` inside an effect, so that I can find render loops and redundant renders.
10. As a developer, I want those `setState`-in-effect findings to arrive as warnings rather than errors, so that the migration can land without me first reasoning about twelve unrelated effects.
11. As a developer, I want Prettier violations to keep surfacing inline in my editor as I type, so that I do not discover formatting problems only when CI runs.
12. As a developer, I want formatting to keep being enforced somewhere in CI, so that unformatted code cannot reach the default branch.
13. As a developer, I want the lint step to stop applying testing-library and jest-dom rules to production source files, so that lint runs faster and rule matches are meaningful.
14. As a developer, I want type-aware linting to resolve the TypeScript project automatically, so that I do not have to maintain a hand-listed set of tsconfig paths.
15. As a developer, I want dead `eslint-disable` comments removed, so that the codebase does not carry suppressions for rules that no longer exist.
16. As a developer, I want the MUI theme module augmentations to keep passing lint, so that theme customization continues to work after the empty-interface rule was renamed upstream.
17. As a developer, I want unreferenced lint plugins removed from `package.json`, so that install time and the dependency audit surface both shrink.
18. As a developer, I want the number of lint dependencies to go down rather than up, so that the next migration is smaller than this one.
19. As a developer running the E2E suite, I want the Playwright workspace on the same ESLint major as the frontend, so that I am not maintaining two different lint paradigms in one repo.
20. As a developer, I want the Playwright plugin upgraded to a version that supports current Playwright idioms, so that its rules reflect the API I actually write against.
21. As an agent working in this repo, I want CLAUDE.md's frontend conventions section to describe the linter that actually runs, so that I do not generate code against rules that were removed.
22. As an agent, I want the arrow-function-component convention documented in prose even though no rule enforces it, so that I keep writing components in the project's established style.
23. As a future reader of this repo, I want the decision to drop `eslint-plugin-react` recorded with its reasoning, so that I do not "helpfully" reinstate it.
24. As a developer, I want the migration split into two commits by workspace, so that a problem in one can be reverted without disturbing the other.
25. As a developer, I want `yarn build` to still pass after the rule fixes, so that I know the `require-await` cleanups did not change any function's return type in a way that breaks callers.
26. As a developer, I want `yarn test` to still pass, so that I know the migration changed tooling and not behavior.
27. As a developer, I want confirmation that the new config actually lints the whole codebase, so that I do not ship a configuration that silently checks nothing.
28. As a maintainer, I want `strictTypeChecked` left out of this change, so that 93 unrelated findings do not block the upgrade.
29. As a maintainer, I want the option to tighten CI to fail on warnings later, so that today's deliberate warning backlog does not become permanent by accident.
30. As a maintainer, I want the removed React Compiler rules noted explicitly, so that adopting the compiler later is a known decision rather than a surprise.

## Implementation Decisions

### Target versions

Jump directly from ESLint 8.57.1 to 10.8.1. There is no technical requirement to install 9 in between, and 9 is itself end-of-life. Read the v9 migration guide for the config-format rewrite and the v10 guide for the deltas.

Node requires no work — ESLint 10's floor is satisfied by the repo's existing Node 24 pin.

### Configuration format

Replace `.eslintrc.json` and `.eslintignore` with a single flat config module per workspace, authored as ESM JavaScript rather than TypeScript. A TypeScript config would require adding `jiti` purely to gain typing that `defineConfig` provides by inference anyway.

The single `overrides` block becomes several `files`-scoped configuration objects:

1. Global ignores, absorbing the contents of `.eslintignore`.
2. A TypeScript/TSX block carrying the parser, type information, and the core, TypeScript, React, and import rules.
3. A test-file block adding the testing-library and jest-dom rules. These currently apply to every file in the workspace; scoping them to test files is a deliberate correction.
4. Prettier last, so it can override earlier formatting opinions.

Glob patterns must be rewritten from `*.ts` to `**/*.ts`. Under flat config the bare form matches only the workspace root — a literal translation produces a configuration that silently lints almost nothing.

Type-aware linting uses the project service rather than a hand-listed project array. The frontend has exactly one tsconfig and no project references, so the multi-config complexity that usually complicates this in Vite projects does not apply.

### Base ruleset

Drop the `standard` lineage entirely rather than following it to its successor. The successor does not support ESLint 10, and it is stricter than the preset the project already overrides in nine places — adopting it would mean more overrides, not fewer.

Compose from `@eslint/js` recommended plus `typescript-eslint` at `recommendedTypeChecked`. The unified `typescript-eslint` package replaces the separate parser and plugin dependencies.

`eslint-plugin-n` and `eslint-plugin-promise` arrive today only as transitive requirements of the standard preset, and no rule in the project's configuration references either. Both are removed rather than carried forward. `eslint-plugin-n` targets Node, which is the wrong target for a browser application.

### React linting

`@eslint-react/eslint-plugin` at its `strict-typescript` preset becomes the sole source of React rules. Both incumbent React plugins are removed.

The reasoning, in order:

- `eslint-plugin-react` has no released version that runs on ESLint 10. Every rule throws at execution time on a removed context API, and it fails peer resolution on install. The fix has been on the default branch since April 2025 with no release.
- `@eslint-react` reimplements the hooks rules, and ships a conflict-resolution preset that disables twelve of the fourteen rules in the current hooks plugin. The two are alternatives, not complements. Running both means paying for duplicate detection of the same violations.
- `strict-typescript` measured identically to the weaker presets against this codebase — the same fourteen warnings, zero errors — so the stricter tier is free. It is also the only tier that includes a useless-fragment rule, preserving one the project runs today.

Accepted losses, all verified as having no equivalent in the chosen plugin:

- Self-closing-component and arrow-function-component enforcement. Both are warnings today, CI does not fail on warnings, and the codebase is fully compliant. The arrow-function convention is retained as documented prose.
- Four React Compiler rules covering compiler configuration, gating, manual memoization, and library compatibility. These matter only if the project adopts React Compiler, which it has not.

`no-class-component` is active under `strict-typescript` and the codebase currently has no class components. A React error boundary is the one legitimate class-component use and would need a targeted suppression if introduced later.

### Import linting

Switch from `eslint-plugin-import` to `eslint-plugin-import-x`. The incumbent crashes on the ordering rule under ESLint 10 and its fix is unreleased; the fork ships ESLint 10 support, releases actively, and carries a small fraction of the transitive dependency weight.

This is deliberately not symmetric with the React decision. There, patching would have been reasonable because no maintained alternative exists. Here one does, so patching would mean choosing to stay on a stalled package.

The ordering rule's options — groups, case-insensitive ascending alphabetization, all three path groups, and the excluded import types — transfer verbatim. Only the rule's namespace prefix changes. Verified against the whole codebase: the options were accepted as-is and produced a single auto-fixable ordering difference.

The TypeScript import resolver moves to its v4 line, which declares compatibility with the fork.

### Prettier

Keep running Prettier as a lint rule. Although ESLint's published direction is to delegate formatting to a formatter, the separate `format:check` script is **not** wired into CI — the lint rule is currently the only thing enforcing formatting on the default branch. Removing it without adding a CI step would silently drop that enforcement, which is out of scope here.

The companion config that disables conflicting rules moves from its v9 to its v10 line. It remains necessary: ESLint 10 did **not** remove the deprecated core formatting rules — verified in the released source — and the config's larger job is disabling conflicting rules contributed by plugins.

### Code changes

- Roughly 29 findings from the new TypeScript ruleset, of which 22 are functions marked `async` with nothing awaited. These need case-by-case judgment rather than blanket removal of the keyword: dropping `async` changes a function's return type and can break callers or type contracts. The build is the check.
- One auto-fixable import ordering difference.
- Four dead suppression comments. Two reference a rule that no longer exists in any enabled preset and are deleted. Two reference a TypeScript rule that was **renamed** upstream rather than removed, and must be rewritten to the new rule name — deleting them would surface new errors in the theme module augmentations.
- The deprecated strict-boolean-expressions escape-hatch option is deleted. The project sets it to its default value, so removal is behavior-neutral and pre-empts its removal in the next major.

Suppressions for `no-console` are unaffected and stay.

### E2E workspace

The Playwright workspace receives the same rewrite at roughly a tenth of the scale. Its standard preset is deleted rather than replaced: it was configured without type information, so the preset's type-aware half was never running. A non-type-checked TypeScript recommended set plus the Playwright plugin is a faithful and simpler equivalent.

The Playwright plugin moves across three majors. Neither of the two breaking changes affects this workspace — one renamed an option it does not set, the other removed integrations it does not use.

The workspace also declares ESLint type packages, an import plugin, and the Node and promise plugins, none of which any rule references. All are removed.

### Documentation

CLAUDE.md's frontend conventions section becomes false in two ways once this lands: it names the deprecated preset, and it lists the arrow-function-component rule as enforced when no plugin will enforce it. Both are rewritten, with the component-style convention retained as prose.

An ADR records the React-vendor decision. It is the repo's first, so the ADR directory is created here.

### Commit structure

Two commits: frontend, then E2E workspace. Documentation changes ride with the frontend commit.

## Testing Decisions

A good test here asserts observable behavior of the lint pipeline, not the internal shape of a configuration object. Asserting that a config file contains a particular key tests the implementation; asserting that the linter processes the expected files and reports the expected findings tests the behavior a developer depends on.

The existing seam is the right one and no new seam is introduced. `yarn lint` is a single command per workspace and is already what CI invokes.

Verification, in order:

1. **`yarn lint` exits zero in both workspaces.** The primary assertion.
2. **The frontend config actually covers the codebase.** Exiting zero is not sufficient evidence — a flat config that matches no files also exits zero, and mistranslated glob patterns are the characteristic failure of this exact migration. Confirm the linter reports the expected file count, verified once during implementation and recorded in the commit message. Deliberately not committed as a permanent assertion: a hard-coded file count in a repository test would drift on every file added and be deleted within months, and the risk it guards is a one-time migration risk.
3. **`yarn build` exits zero.** Load-bearing rather than ceremonial. The `require-await` fixes alter function return types, and the TypeScript compiler is what catches a fix that breaks a caller.
4. **`yarn test` exits zero.** Confirms the source edits changed tooling compliance and not behavior.

Prior art for the verification approach exists in this feature's research: the ESLint Node API driven with an explicit working directory and an inline configuration, counting results by rule. That pattern produced every number in the research document and is the cheapest way to re-confirm coverage.

The E2E suite itself is not a gate for this change. Its lint step runs inside a job that first builds and starts containers, and the suite is a single sign-in scenario.

## Out of Scope

- **`strictTypeChecked`.** Measured at 93 findings. A separate decision, possibly never taken.
- **The 12 `setState`-in-effect warnings.** Real findings, deliberately deferred to a follow-up so that twelve behavioral React changes do not ride along in a tooling change.
- **Failing CI on warnings.** Revisited once the warning backlog reaches zero. Adding it now would force the deferred work back into this change.
- **Wiring `format:check` into CI.** Related and arguably overdue, but it is a workflow change, and the decision here was to keep the lint rule that currently covers it.
- **Removing Prettier from the lint pipeline.** Contingent on the item above.
- **Adopting React Compiler.** The four compiler-specific rules lost in the vendor swap only matter if this is taken up.
- **Backend linting.** Untouched.
- **Any behavioral change to the application.** Source edits are confined to satisfying new rules.

## Further Notes

**Two premises that shaped early framing turned out to be wrong**, both corrected by reading released source. ESLint 10 did *not* remove the deprecated core formatting rules — they remain registered and deprecated — which is why the Prettier compatibility config is still required. And while the eslintrc *configuration system* is entirely gone, the compatibility translation utility survives and is explicitly supported. It cannot help here, though: the plugin failures are runtime API crashes, not configuration-shape problems.

**Two upstream releases would change this plan** and are worth re-checking immediately before implementation. If `eslint-plugin-react` ships its pending ESLint 10 release, retaining it becomes viable and the two dropped style rules could be kept. If `eslint-plugin-import` ships its unreleased fix, the fork becomes optional. Neither has a published timeline; both were open as of 2026-08-13.

**The ADR is already written** — `docs/adr/0001-eslint-react-as-sole-react-linter.md`, created ahead of implementation. It carries the rejected alternatives and the accepted costs, so the implementation does not need to restate them.

**The `.scratch/` directory is tracked in git** by deliberate choice, so this spec and the research document are committed alongside the change.

**`docs/agents/issue-tracker.md` references a `triage-labels.md` that does not exist.** The status line above uses the label named by the spec tooling. Worth completing the tracker setup separately.
