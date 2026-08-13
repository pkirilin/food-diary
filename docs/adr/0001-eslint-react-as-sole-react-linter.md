# `@eslint-react` is the sole source of React lint rules

Status: accepted (2026-08-13)

When migrating the frontend to ESLint 10, `eslint-plugin-react` turned out to have no
released version that runs on it — every rule throws on a context API that ESLint 10
removed, and it fails peer resolution on install. We replaced it with
`@eslint-react/eslint-plugin` at its `strict-typescript` preset, and removed
`eslint-plugin-react-hooks` at the same time, because `@eslint-react` reimplements the
hooks rules and ships a preset whose entire job is disabling twelve of the fourteen
rules the hooks plugin provides. Running both would mean paying twice to detect the
same violations.

## Considered options

**Patch `eslint-plugin-react`.** The fix is a one-liner and has been on the plugin's
default branch since April 2025 — but it has not been released since, and the pull
request carrying full ESLint 10 compatibility is still open with no maintainer
timeline. Patching would have tied the repo to a package that has stopped shipping.

**Wait for the upstream release.** Rejected because ESLint 9 reached end of life on
2026-08-06, so waiting means sitting on an unsupported linter for an unbounded period.

**Run `@eslint-react` alongside `eslint-plugin-react-hooks`.** The rule most worth
recovering, missing-`key` detection, lives in a preset that also carries nine rules
overlapping the hooks plugin. Keeping both would have meant nine hand-written
suppressions to silence duplicate reports — config weight that rots.

**Keep `eslint-plugin-react-hooks` alone and accept the gap.** Rejected because it is
the only option that silently loses a real correctness rule: nothing else in the stack
detects missing `key` props.

## Consequences

Two rules have no equivalent in `@eslint-react` and are simply gone:
`react/self-closing-comp` and `react/function-component-definition`. Both were
warnings, CI does not fail on warnings, and the codebase was fully compliant with both.
The arrow-function component convention survives as prose in CLAUDE.md rather than as
an enforced rule.

Four React Compiler rules — covering compiler configuration, gating, manual
memoization, and library compatibility — are also lost. They matter only if this
project adopts React Compiler, which it has not. Revisit this ADR if it does.

`rules-of-hooks` and `exhaustive-deps` now come from a third-party reimplementation
rather than from the React team's own plugin. This is the real cost of the decision.
It was accepted because the alternative was carrying two plugins that detect the same
things, and because `@eslint-react` releases actively where `eslint-plugin-react` has
not shipped in over a year.

`no-class-component` is active. A React error boundary is the one legitimate reason to
write a class component and would need a targeted suppression.

**If `eslint-plugin-react` resumes releasing**, this decision is worth revisiting — the
two dropped style rules become recoverable. That is the most likely trigger for
superseding this ADR.
