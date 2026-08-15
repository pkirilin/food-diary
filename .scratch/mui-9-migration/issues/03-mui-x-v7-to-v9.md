# 03 — MUI X v7 → v9

**What to build:** The date pickers and the weight chart move to MUI X v9, crossing v8 on the way. Core stays on v7 throughout — it is the only core version compatible with every X major, which is what makes this hop possible in isolation.

This is the ticket that carries the migration's one deliberate user-visible change. **Choosing a day in the switcher now requires confirming with an OK button** instead of navigating on the first tap. This is a confirmed break, not a risk to investigate: at the current version a static picker rendered as a desktop wrapper defaults its close-on-select behaviour to true and renders no action bar, so picking a day fires the accept callback immediately. At v9 that default is applied only by the desktop picker component, so the static picker renders Cancel and OK, and picking a day counts as a set rather than an accept.

Both obvious workarounds are closed and should not be attempted: the close-on-select prop belongs to an interface documented as being for non-static pickers and is a type error here, and v9 dropped the selection-state field from the change callback's context, so there is no way to tell a completed day selection from an intermediate year or month step.

Expect this to be the ticket that needs judgement rather than codemods. Its failures show up at runtime and in tests, not at compile time.

**Blocked by:** 01 (the submit-callback seam the switcher's tests need), 02 (X v9 requires a core version at or above 7.3.0)

**Status:** ready-for-agent

- [ ] Both X packages — pickers and charts — are on the v9 line, with each hop's `preset-safe` codemod run as a dry run and reviewed before it writes
- [ ] The date adapter import is updated; the adapter named for the v3 date library no longer exists, and the unversioned name now refers to it
- [ ] The chart legend is hidden through its dedicated prop rather than the slot property it used before the legend moved from SVG to HTML
- [ ] Per-entry markers are explicitly enabled on the weight chart — v9 flips that default off, and losing the points would be an accidental product change
- [ ] Choosing a day in the switcher, then confirming, navigates to that day in the running app
- [ ] The switcher's test is updated from the single-tap flow to select-then-confirm; the diff on that assertion is the record of the behaviour change
- [ ] The weight log list's picker assertions are rewritten against the new accessible structure — the field is no longer a textbox with a value, but a group of editable spinbutton sections
- [ ] The history date filter still works. It uses the change callback so it is unaffected, but it gains the same Cancel/OK action bar; this is accepted and it is otherwise left alone
- [ ] An ADR records the confirmation decision, narrowly scoped to the switcher's interaction, written once the behaviour is verified rather than predicted
- [ ] The running app is clicked through: both pickers and the weight chart, including whether the chart's line now touching the plot edges is an improvement
- [ ] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero
