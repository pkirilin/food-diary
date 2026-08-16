# Spec: Migrate frontend to MUI v9

Status: ready-for-agent

Research: [research.md](./research.md) — every version number, peer range and removed export below was verified on 2026-08-15 against the npm registry and the published package tarballs, not inferred from documentation.

⚠️ **This spec supersedes research §10.1.** The research left the picker confirmation behaviour as an open risk needing a spike ("may stop `onAccept` firing"). It was subsequently traced through the published v7 and v9 sources and is now a **known, confirmed break** with a decided remedy. See _The picker confirmation change_ below.

## Problem Statement

The frontend renders on MUI v6.5.0, published 2025-07-08 — over thirteen months without a release on that line. MUI publishes no dated end-of-life policy, so this is unmaintained in practice rather than formally expired, but the effect is the same: upstream fixes no longer reach the project. The current stable release is v9.3.1.

The practical consequences:

- Bug fixes and accessibility corrections in the component library do not reach the app.
- The MUI X packages — the date pickers and the weight chart — are pinned two majors behind on their own version line, and their peer ranges will eventually stop accommodating a v6 core at all.
- Every other frontend upgrade risks colliding with a UI layer that cannot move.

The migration is not a single version bump, and its shape is unusual in two ways.

**MUI Core has no v8.** The published version list goes 7.3.11 → 9.0.0-alpha.0, with zero `8.x` among 261 versions, and the upstream docs carry `upgrade-to-v7` and `upgrade-to-v9` with nothing in between. The core path is two hops.

**MUI X does have a v8**, on an independent version line, so the pickers and charts move across three package versions with two migration guides. Their peer ranges interlock with core in a way that dictates the order of the whole migration: X v9 refuses a v6 core, and a v9 core refuses anything below X v9. Only core v7 is compatible with every X major, which makes it the one safe place to stand while the X packages move.

## Solution

Move the frontend to MUI v9 and MUI X v9, in three ordered hops inside a single pull request.

From the developer's perspective `yarn build`, `yarn test` and `yarn lint` keep working, and the component API surface the app actually uses survives almost entirely — the theme has no `components` block and no colour schemes, which is why the large majority of upstream's breaking changes miss this codebase completely. The mechanical bulk of the work is a codemod pass over style props that moves them into `sx`.

From the app user's perspective almost nothing changes. There is one deliberate exception: **selecting a day in the date switcher now requires confirming with an OK button** rather than navigating on the first tap. This is upstream's intended direction for every picker except the desktop variants, and the decision here is to accept it rather than engineer around it.

One visual default is deliberately overridden rather than accepted: the weight chart's point markers, which upstream turns off by default in charts v9, are turned back on because the per-entry points carry information the line alone does not.

## User Stories

1. As a developer, I want the UI library on a maintained release, so that upstream bug fixes and accessibility corrections reach the app again.
2. As a developer, I want the core upgrade done in two hops rather than three, so that I am not hunting for a v8 migration guide that does not exist.
3. As a developer, I want the MUI X packages moved in an order their peer ranges actually permit, so that the install resolves at every intermediate step instead of only at the end.
4. As a developer, I want core parked at v7 while the X packages move across two majors, so that each hop is independently installable and independently verifiable.
5. As a developer, I want the migration in one pull request with deliberate commits inside it, so that it lands the way every prior migration in this repo has.
6. As a developer, I want the commits ordered so that compile-time failures and runtime failures never arrive in the same step, so that a red suite tells me which upgrade caused it.
7. As a developer, I want `yarn build` to pass after each commit, so that removed exports and changed prop shapes surface immediately rather than at the end.
8. As a developer, I want `yarn test` to pass after each commit, so that I know which hop changed behaviour.
9. As a developer, I want `yarn lint` to keep passing, so that the migration does not smuggle in style drift.
10. As a developer, I want the mechanical prop rewrites done by codemod rather than by hand, so that fifty-odd call sites across eleven modules are transformed consistently.
11. As a developer, I want to see a codemod's dry run before it writes anything, so that I can compare what it claims to touch against what the inventory predicted.
12. As a developer, I want the codemod pass to run every deprecation transform rather than only the ones the inventory found, so that anything the inventory missed is caught rather than trusted away.
13. As a developer, I want the legacy grid converted while the legacy component still exists, so that the final hop needs no grid work at all.
14. As a developer, I want a single grid generation in the codebase, so that nobody has to remember which of two APIs a given module uses.
15. As a developer, I want the unused lab package dropped, so that the app does not carry a dependency that has never had a stable release and would pin the core version on every patch.
16. As a developer, I want the styled-engine provider imported from the path upstream sanctions, so that the app does not depend on a specifier the migration guide declares removed.
17. As a developer, I want no `react-is` resolution override, so that the migration does not add a workaround that only applies to React 18 and below.
18. As a person logging meals, I want the date switcher to keep changing which day I am viewing, so that the core daily workflow keeps working after the upgrade.
19. As a person logging meals, I want to confirm a date before it takes effect, so that a mis-tap on the calendar does not navigate me away from the day I am on.
20. As a person tracking weight, I want the trend chart to keep showing a point for each entry, so that I can still see individual measurements rather than only the line between them.
21. As a person reviewing history, I want the history date filter to keep working, so that the upgrade does not cost me a feature I use.
22. As a developer, I want the date switcher decoupled from the router, so that its behaviour can be asserted against a mocked callback instead of an unobservable navigation.
23. As a developer, I want the date switcher to have a test at all, so that the one component whose behaviour this migration knowingly changes is pinned rather than assumed.
24. As a developer, I want the picker field test rewritten against the new accessible structure, so that it asserts the DOM the library actually renders now.
25. As a developer, I want the category filter's label assertions checked under the new release, so that a silent change from native label association to ARIA labelling does not go unnoticed.
26. As a developer, I want the behavioural changes that no compiler and no jsdom test can see verified by clicking through the running app, so that visual and interaction regressions are caught by the only seam that reaches them.
27. As a maintainer, I want the browser targets declared by the project to match what the library actually ships, so that the configuration stops advertising support the bundle does not deliver.
28. As a maintainer, I want the demo deployment considered when choosing those targets, so that the decision accounts for public visitors and not only my own device.
29. As an agent working in this repo, I want the project instructions to name the MUI version that is actually installed, so that I do not generate code against an API that was removed.
30. As an agent, I want the lab package removed from the documented dependency list, so that I do not reach for a component from a package that is no longer installed.
31. As a future reader, I want the date-picker confirmation decision recorded with its reasoning, so that I do not "helpfully" re-engineer one-tap selection back in without knowing what it costs.
32. As a maintainer, I want the styling engine left alone, so that a zero-runtime CSS migration does not ride along inside a version upgrade.
33. As a maintainer, I want the date library left alone, so that a timezone-API migration does not ride along either.
34. As a maintainer, I want to stay on the MIT tier of the chart and picker packages, so that no licence key becomes necessary.
35. As a maintainer, I want the known future trap around picker text-field theming written down, so that the first person to add a theme override knows to duplicate it.

## Implementation Decisions

### Target versions

Core moves `6.5.0 → 7.3.11 → 9.3.1`. The four core packages — material, icons-material, system and utils — move together at each hop; system and utils publish at `9.3.0` where material and icons publish at `9.3.1`.

MUI X moves `7.29.x → 9.11.x`, crossing v8 on the way. The two packages, charts and pickers, move together.

No peer requirement in the target majors needs work. React 19.2, TypeScript 5.9.3 and Node 24 all satisfy v9's floors, which are React ≥17, TypeScript ≥4.9 and Node ≥14. The `react-is` resolution override that occupies sixty lines of the v7 guide applies only to React 18 and below and is deliberately skipped.

### Migration path and ordering

Three hops, in this order:

1. **Core v6 → v7**, X untouched. X v7 accepts a v7 core, and the v7 guide states explicitly that MUI X packages should remain unchanged during the core upgrade.
2. **X v7 → v9**, core parked at v7. X v9 requires core ≥7.3.0, which the v7 target satisfies.
3. **Core v7 → v9**, X already on v9. A v9 core accepts only X v9.

The reverse ordering — X first, on a v6 core — is blocked at the last step, because X v9 does not accept v6.

Skipping the intermediate core version is rejected for a second reason beyond the peer ranges: the grid conversion codemod only has something to bind to while the legacy grid component still exists. Jumping straight to v9 means hand-writing that conversion.

### Grid

The codebase currently uses both grid generations at once — the legacy API in one module, the v2 API in three. v7 renames both; v9 deletes both, leaving a single `Grid`.

Convert the legacy usage to the v2 API during the first hop, using the upstream grid-props codemod, and rename the v2 imports by hand — there is no codemod for the import rename, only diffs in the guide. Doing both at v7 means the final hop needs no grid work whatsoever.

### `@mui/lab`

Delete the dependency in the first hop. It has zero source imports; the only reference in the repository is the dependency declaration itself. It has never had a stable release on any version line, and its v9 beta declares a near-exact peer on the core version, which would turn every core patch bump into a lockstep lab bump. The components this project uses that once lived in lab — the alert, autocomplete and skeleton — graduated into the main package at v7 and are already imported from there.

If a lab component is ever wanted, it can be added back at that point.

### Styling engine

Stay on emotion. This is not forced by anything; it is a decision not to take an available detour.

v9 changes nothing about the CSS-in-JS story. The styled engine still depends on emotion and still declares it as a peer, and the Pigment CSS package remains an optional peer exactly as it was at v7. Adopting Pigment would mean a build plugin, a build-time theme, and revisiting the assumptions behind every `sx` usage in the codebase — a separate migration wearing this one's clothes.

### MUI X packages

Both packages stay on the MIT tier. The only chart the app uses is in the free package, and no licence key exists or becomes necessary.

Two hard breaks, both single-line:

- The date adapter named for date-fns v3 no longer exists; the unversioned adapter name now refers to it. The v2-era adapter was renamed rather than removed, so the fix is an import change, not a behaviour change.
- The chart legend's hidden slot prop became a dedicated prop when the legend moved from SVG to HTML at charts v8.

The date library needs no work. All three X majors declare the same date-fns peer range, which the project's v3 pin already satisfies. Moving to date-fns v4 is explicitly not part of this.

One naming trap worth knowing before reading the guides: MUI Core names its guides "upgrade **to** vN" while MUI X names its "migrate **from** vN". The two guides needed here are the X v7 and X v8 guides, which cover the 7→8 and 8→9 hops respectively.

### The picker confirmation change

This is the one genuinely non-mechanical change, and the research's open question about it has been resolved by reading the published sources of both versions.

At v7, a static picker rendered as a desktop wrapper defaulted its close-on-select behaviour to true and rendered no action bar, so selecting a day fired the accept callback immediately. At v9, that default is applied only by the desktop picker component; the static picker leaves it unset. The consequences follow mechanically: the action bar now renders Cancel and OK, and selecting a day is treated as a set rather than an accept, so the accept callback does not fire until OK is clicked.

The obvious one-line fix is unavailable. The close-on-select prop belongs to the interface documented as "props used to handle the value of non-static Pickers" and is absent from the static picker's props, so passing it is a type error. The other obvious route — switching to the change callback and filtering — is also closed, because v9 dropped the selection-state field from that callback's context, leaving no way to distinguish an intermediate year or month step from a completed day selection.

**The decision is to accept the new behaviour.** The day switcher gains a confirmation step. This is upstream's deliberate direction for every picker except the desktop variants, the Cancel button is genuinely useful inside a popover, and the alternatives are either a hand-rolled view-tracking workaround or replacing the popover-wrapped static picker with a desktop picker driven through its trigger slot. The latter is a real option if the extra tap proves annoying in daily use, and belongs in its own issue.

The history filter uses the change callback rather than the accept callback, so it keeps working untouched. It will gain the same Cancel/OK action bar as a visual side effect. It is deliberately left alone: nothing about it breaks, and widening the migration for consistency's sake is not worth it.

### Decoupling the date switcher

To make the changed behaviour testable, the date switcher splits into a presentational component taking the current date and a submit callback, and a thin container that owns the router hook and supplies that callback.

The split is required rather than stylistic. The switcher is currently constructed inside a route loader and returned as loader data, and loaders cannot call hooks — so there is no way for the calling side to supply a callback built from the router without introducing a component boundary that does not exist today.

Restructuring loaders so they stop returning React elements at all would be a genuine improvement and would remove the need for the container, but it changes the navigation widget's contract and touches three pages. It is out of scope here and worth its own issue.

### Codemods

Two codemod packages are involved and they are not the same: the core package covers the core hops, and MUI X ships its own, which — unlike the core one — does provide `preset-safe` presets.

Run the dry run first at every step, read what it claims it will touch, and compare it against the inventory in the research before letting it write.

For the deprecation pass, run **every** deprecation transform rather than the handful the inventory identified. Transforms no-op on code they do not match, and the inventory's own count is documented as a lower bound — a regex-based scan that cannot resolve aliased imports. If the full pass touches only the predicted sites, that confirms the inventory; if it touches more, that is a finding rather than noise.

Note what codemods do not cover: the grid import rename, every behavioural change, and all test assertions. Nothing rewrites a query.

One call site needs manual review after the style-prop transform. A background-colour prop on the index page is passed a theme callback rather than a literal, and every example in the guide uses literals; whether the transform lifts a function into `sx` correctly is unverified.

### Chart defaults

Charts v9 flips the mark-visibility default off and makes strict x-axis domains the default. Neither errors; both silently change how the weight chart looks.

Turn the marks back on explicitly. A weight trend with a visible point per entry carries information the line alone does not, and losing it to an upstream default flip would be an accidental product change.

The domain change is left to visual judgement during the click-through — the line will touch the plot edges instead of sitting padded, which may be an improvement.

### Browser targets

v9 raises its shipped bundle targets to Chrome 117, Firefox 121, Safari 17 and Edge 121. The project's production browserslist is considerably looser, and since Vite does not down-level dependencies, the library's syntax is the effective floor regardless of what the configuration claims.

Tighten browserslist to match. This makes an already-true constraint honest. It matters beyond one device: the repo publishes a public demo to GitHub Pages, so the declared support surface is visible to people other than the maintainer.

### Documentation

The project instructions state the MUI major in two places and list the lab package as a UI dependency. Both become false when this lands, and the repo's own coding rules require them to stay accurate.

An architecture decision record captures the picker confirmation decision. Its subject is deliberately narrow — the date switcher's interaction — with the general reasoning in its rationale rather than its scope. It is explicitly **not** a blanket "we accept upstream defaults" record, because the chart mark decision in this same migration is the opposite call. The framing it records is the per-case one: preserve where a default carries product meaning, accept where working around it costs more than it returns.

It is written during the second commit rather than up front, so that it records verified behaviour rather than predicted behaviour.

### Commit structure

Four commits in one pull request, on the existing migration branch:

1. **Core v6 → v7** — the four core packages, the lab deletion, the grid conversion and rename, the styled-engine import path.
2. **MUI X v7 → v9** — both X packages across two hops, the adapter and legend fixes, the chart mark default, the date switcher split with its first tests, the picker field test rewrite, and the ADR.
3. **Core v7 → v9** — the four core packages, the style-prop and deprecation codemod passes, and the verification tail.
4. **Documentation** — browser targets and the project instructions.

Four separate pull requests were considered and rejected. The argument for splitting is failure-mode separation, and that argument is sound — but sequential commits on one branch deliver the same diagnostic value, since the suite runs after each. What separate pull requests additionally buy is independent revert after merge, and since this repo squashes each pull request into a single commit on the default branch, that granularity would only survive as four separate merges. For a solo self-hosted project that is not worth four review cycles. The accepted cost: if the X hop ships a subtle picker regression, reverting takes the whole migration with it.

## Testing Decisions

A good test here asserts what a user of the component observes — the roles and names in the rendered tree, and the callbacks the component fires — not which library version produced them. The characteristic failure of this specific migration is a test that passes because it asserts against a DOM shape rather than a behaviour, and then silently stops meaning anything when the shape changes.

Existing seams are reused and only one is added.

**Reused:**

1. **`yarn build`.** The primary gate for the two core commits. The TypeScript compiler catches every removed export and changed prop shape directly, including the open question about whether the autocomplete's render-input parameters still expose the input props object.
2. **`yarn test`, through the existing render harness.** The harness already renders through the root provider and a memory router against real MUI DOM, which is why the picker's structural change and the select field's label change surface here rather than needing new scaffolding.
3. **`yarn lint`.**
4. **Clicking through the running app.** The only seam that reaches the behavioural changes — picker confirmation, chart marks, axis domain, list-icon spacing. `yarn build` cannot see them and jsdom does not lay out.

**Added — one:**

5. **A submit callback on the date switcher.** With the switcher decoupled from the router, its behaviour is asserted against a mocked callback: selecting a day, confirming with OK, and checking the callback fires once with the expected date. The higher seam — the harness's full-router entry point, which runs real loaders and would render the switcher in the navigation bar — exists but is not live: both of its tests are skipped and marked for migration to the E2E suite. The component is therefore the highest live seam available.

The container that owns the router hook gets no test of its own. It is two lines of wiring, and testing it would mean recreating exactly the router-level seam this decision walked away from.

Verification, in order, after each commit:

1. **`yarn build` exits zero.** Load-bearing for commits one and three.
2. **`yarn test` exits zero**, run with the verbose reporter. Per the project's frontend rules a green suite is not a clean suite — the reporter only prints a passing test's warnings in verbose mode, and any `stderr` block is a defect. This matters more than usual here: v9 replaced its test-environment detection with user-agent sniffing for layout-less DOMs, and upstream's own guidance is that this "might lead to unintended CI changes".
3. **`yarn lint` exits zero.**
4. **The manual click-through**, covering the date switcher, the history filter, the weight chart, and the navigation drawer's icon spacing.

Two existing tests are expected to need rewriting rather than merely passing. The weight log list asserts a textbox role and a form-element value against the picker field, and neither survives — the field now renders a group of spinbutton sections with editable content. The products test asserts a label association on the category select, which v9 changes from a native `for` attribute to ARIA labelling; the label query most likely survives, the listbox-by-name query is less certain. Both are treated as expected work in the second and third commits rather than assumed to pass.

Prior art for the added test is the existing route-level component tests, which drive real user events through the shared render harness and assert on accessible roles and names.

The E2E suite is not a gate for this change. It is a single sign-in scenario and does not exercise any of the affected components.

## Out of Scope

- **Pigment CSS.** Available and optional at v9; adopting it is a separate migration with its own build changes.
- **date-fns v4.** All three X majors accept the current v3 pin. v4's timezone API changes make it its own piece of work, not a quick win taken in passing.
- **Restructuring loaders so they stop returning React elements.** A real improvement, surfaced by the decoupling work, but it changes the navigation widget's contract and touches three pages. Its own issue.
- **Giving the history filter the same treatment as the date switcher.** Nothing about it breaks; consistency alone does not justify widening the migration.
- **Replacing the popover-wrapped static picker with a desktop picker.** The route back to one-tap date selection if the confirmation step proves annoying in daily use. Deliberately deferred until there is evidence it is needed.
- **The CSS layer support added at v7.** Opt-in, and solves no problem this project has.
- **Non-MUI dependency upgrades.** A different migration.
- **Any theme restructuring.** The theme has no components block and no colour schemes, which is precisely why most of upstream's breaking changes miss this codebase. Adding one now would forfeit that.
- **Backend and E2E workspaces.** Untouched.

## Further Notes

**Two upstream documentation defects were found and verified against published source**, both traps for a reader skimming the guides. The v7 guide states that importing the styled-engine provider from the main package "has been removed"; it has not, and still resolves at both v7 and v9 through a wildcard re-export. The import is changed anyway, on the grounds that depending on a specifier the official guide declares removed is exactly what breaks in an unannounced patch. Separately, the two documentation sets use opposite naming conventions for their migration guides, so the guide numbered for a given version means different things in Core and X.

**The system-prop count in the research is a lower bound.** It came from a regex scan that cannot resolve aliased imports and can miss attributes on multiline tags. This is the direct reason for running the full deprecation pass rather than the targeted transforms, and for reading every dry run.

**Why core skipped v8 is not documented.** The one-day gap between the core and X v9 releases makes major-alignment the obvious explanation, but upstream does not say so. Recorded as inference, not fact.

**A future theming trap has nothing to do today.** From pickers v8 onward, a theme override on the text field must be duplicated onto the pickers' own text field or the pickers silently miss it. The theme currently has no components block at all, so there is nothing to duplicate — but the first person to add one needs to know.

**The `.scratch/` directory is tracked in git** by deliberate choice, so this spec and the research document are committed alongside the change.
