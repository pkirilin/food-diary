# 03 — MUI X v7 → v9

**What to build:** The date pickers and the weight chart move to MUI X v9, crossing v8 on the way. Core stays on v7 throughout — it is the only core version compatible with every X major, which is what makes this hop possible in isolation.

This is the ticket that carries the migration's one deliberate user-visible change. **Choosing a day in the switcher now requires confirming with an OK button** instead of navigating on the first tap. This is a confirmed break, not a risk to investigate: at the current version a static picker rendered as a desktop wrapper defaults its close-on-select behaviour to true and renders no action bar, so picking a day fires the accept callback immediately. At v9 that default is applied only by the desktop picker component, so the static picker renders Cancel and OK, and picking a day counts as a set rather than an accept.

Both obvious workarounds are closed and should not be attempted: the close-on-select prop belongs to an interface documented as being for non-static pickers and is a type error here, and v9 dropped the selection-state field from the change callback's context, so there is no way to tell a completed day selection from an intermediate year or month step.

Expect this to be the ticket that needs judgement rather than codemods. Its failures show up at runtime and in tests, not at compile time.

**Blocked by:** 01 (the submit-callback seam the switcher's tests need), 02 (X v9 requires a core version at or above 7.3.0)

**Status:** resolved

- [x] Both X packages — pickers and charts — are on the v9 line, with each hop's `preset-safe` codemod run as a dry run and reviewed before it writes
- [x] The date adapter import is updated; the adapter named for the v3 date library no longer exists, and the unversioned name now refers to it
- [x] The chart legend is hidden through its dedicated prop rather than the slot property it used before the legend moved from SVG to HTML
- [x] Per-entry markers are explicitly enabled on the weight chart — v9 flips that default off, and losing the points would be an accidental product change
- [x] Choosing a day in the switcher, then confirming, navigates to that day in the running app
- [x] The switcher's test is updated from the single-tap flow to select-then-confirm; the diff on that assertion is the record of the behaviour change
- [x] The weight log list's picker assertions are rewritten against the new accessible structure — the field is no longer a textbox with a value, but a group of editable spinbutton sections
- [x] The history date filter still works. ~~It uses the change callback so it is unaffected, but it gains the same Cancel/OK action bar; this is accepted and it is otherwise left alone~~ — **corrected in 04:** the added action bar was not harmless, see the correction below
- [x] An ADR records the confirmation decision, narrowly scoped to the switcher's interaction, written once the behaviour is verified rather than predicted
- [x] The running app is clicked through: both pickers and the weight chart, including whether the chart's line now touching the plot edges is an improvement
- [x] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero

## Answer

Both X packages are on the v9 line (`@mui/x-charts@9.11.1`, `@mui/x-date-pickers@9.11.0`),
crossing v8.29.2 with the suite green at that intermediate step.

Three findings the ticket did not predict:

**The X codemod CLI ignores `--dry`.** `npx @mui/x-codemod@8.29.0 v8.0.0/preset-safe src --dry
--print` wrote to the working tree. Reviewing the resulting diff instead of trusting the flag is
what caught the next item. For the v9 hop the codemod was run against a copy of `src/` in a
scratch directory and diffed before being applied for real.

**The v8 adapter codemod produced the wrong adapter.** `rename-adapter-date-fns-imports` carries
two mappings that compose — `AdapterDateFns → AdapterDateFnsV2` and `AdapterDateFnsV3 →
AdapterDateFns` — and applying them in sequence turned the project's date-fns v3 adapter import
into `AdapterDateFnsV2`, the date-fns **v2** adapter. Nothing about that is a type error. Fixed by
hand to `@mui/x-date-pickers/AdapterDateFns`.

**The confirmation break arrives at v8, not v9, and the switcher needed more than a test edit.**
`StaticDatePicker` was fully controlled by `currentDate` with no change handler, which only worked
because accept fired on the first tap. With confirmation, the first tap is a set that the fixed
`value` prop immediately overwrote — so OK confirmed nothing and the day never changed. The
switcher now keeps the pending date in state, resets it to `currentDate` when the popover opens,
and wires `onClose` so Cancel dismisses. Both new lines are covered: removing either fails exactly
one test.

The v9 charts codemod adds `showMark: true` itself, so the mark default was preserved by the
codemod rather than by hand.

Both codemod passes touched exactly what the research inventory predicted and nothing else: the v8
pass hit `RootProvider.tsx` (adapter import) and `WeightChart.tsx` (legend prop) — research §7.4 and
§7.7 — and the v9 pass hit only `WeightChart.tsx` (`showMark`), research §7.8. 253 of 254 files
unmodified on the v9 pass. The inventory is confirmed, not merely assumed.

Click-through (dev server, MSW): switcher select-then-OK navigates and Cancel dismisses; the
history filter applies `month=11&year=2023` and now shows its own Cancel/OK bar above the dialog's
Cancel/Apply, accepted and untouched; the desktop `DatePicker` in the Log Weight dialog still
closes on the first tap; the weight chart draws a marker per entry.

On the strict x-axis domain: **accepted, no config added.** The end markers sit on the plot
boundary rather than inset, but at `r=5` against the plot edge they render whole — the surface has
margin either side — so nothing is clipped, and the chart uses its full width. It is upstream's
default and reversing it would mean adding a `domainLimit` the migration does not otherwise need.

Decision recorded in `docs/adr/0002-day-switcher-confirms-date-selection.md`.

### Correction (from 04)

The claim above that the history filter "is unaffected" and that its extra action bar is
cosmetic was **wrong**, and the click-through did not catch it because the failing path needs
the picker's Cancel to be pressed.

The dialog renders `["", "", "Cancel", "OK", "Cancel", "Apply"]`. The picker's Cancel fires the
change callback with the previous value, resetting the pending month **without closing
anything** — so picking December, pressing that Cancel, then pressing Apply submits October with
nothing on screen to say the choice was discarded. The picker's OK does nothing at all, because
the filter wires neither the accept nor the close callback.

Fixed in 04 by suppressing the picker's action bar
(`slotProps={{ actionBar: { actions: [] } }}`), with two tests covering it. ADR 0002 was
corrected to match.

The switcher was re-checked and is genuinely fine: its Cancel closes the popover, submits
nothing, and leaves no stale selection on reopen.
