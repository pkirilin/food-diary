# 04 — Core MUI v7 → v9

**What to build:** The app builds and runs on core MUI v9, looking and behaving as it does today. There is no v8 to pass through — the core line goes straight from v7 to v9.

The bulk of the work is mechanical: style props are removed from several components in v9 and move into the style prop object instead, across roughly fifty call sites. A codemod does this. The tail of the work is verification, because v9 also changed how the library detects a layout-less test environment, and upstream's own guidance is that this "might lead to unintended CI changes".

**Blocked by:** 03 (a v9 core accepts only X v9)

**Status:** resolved

- [x] The four core packages — material, icons, system and utils — are on the v9 line
- [x] The style-props codemod is run as a dry run, its claims compared against the research inventory, and then applied
- [x] **Every** deprecation transform is run, not only the handful the inventory predicted. Transforms no-op on code they do not match, and the inventory's count is a documented lower bound from a scan that cannot resolve aliased imports. If the pass touches more than predicted, that is a finding, not noise
- [x] The one style prop passed a theme callback rather than a literal is reviewed by hand — every example in the guide uses literals, and whether the codemod lifts a function correctly is unverified
- [x] The category filter's label assertions pass, or are updated. v9 changes a select field's label from a native association to ARIA labelling; the label query most likely survives, the listbox-by-name query is less certain
- [x] The navigation drawer's icon spacing is checked visually — the icon gutter tightens by twenty pixels in v9
- [x] Any test fallout from the changed test-environment detection is addressed rather than worked around
- [x] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero

## Answer

The four core packages are on v9 (`material`/`icons-material` 9.3.1, `system`/`utils` 9.3.0). Unlike
the X hop, `@mui/codemod` honours `--dry` correctly; both passes were still diffed against a copy of
`src/` in a scratch directory before being applied for real.

**The style-props pass touched 10 files, not the 11 the inventory predicted.** The miss is
`NotesHistoryList.tsx:25` — `<Typography color="textSecondary">` is a component-owned prop in v9
(`Typography.d.ts:29`), not a removed system prop, so the codemod was right to skip it and the
inventory over-counted.

**The deprecation pass touched 7 files, not 5.** Three the inventory did not predict:
`CardHeader titleTypographyProps` → `slotProps.title`, `ListItemText primaryTypographyProps` →
`slotProps.primary`, and the Autocomplete `params.InputProps` read that research §5.2 had marked
"manual verify". The codemod handled that last one, and correctly added a `...params.slotProps`
spread — without it the explicit `slotProps` would override the other slots that `{...params}` had
supplied.

**One predicted site the codemod did *not* fix:** `<DialogContentText paragraph>`. Both
`deprecations/all` and `deprecations/typography-props` no-op on it — the transform matches
`Typography` only. Replaced by hand with `sx={{ marginBottom: 2 }}` (16px at the default spacing,
matching what `paragraph` used to emit; `DialogContentText` already defaults to `component="p"`).

**One site neither the inventory nor the codemod could see:** `LoginPage.tsx:64`,
`<Paper component={Stack} p margin width alignItems>`. Stack's system props reach `Paper` through
`component=`, which the codemod's import-based matching cannot resolve. `tsc` caught it; it was the
hop's only compile error, and it is the concrete case behind the ticket's "aliased imports" caveat.

**The codemod deletes comments it moves props past.** `NutritionSummaryWidgetBar.tsx` lost
`// Adds extra space after the last item…` when `py` moved into the existing `sx`. Restored. Worth
watching for on any future codemod pass — nothing flags it.

**A silent visual regression the codemod could not flag, found in review.**
`NutritionSummaryItem.tsx:50` passed `color={color}` to `Typography`, where `color` is a raw hex from
`nutritionValuesConfig` (`green[500]`, `blue[500]`, …). Up to v7 `Typography` ran an unrecognised
`color` through `extendSxProp`, so an arbitrary CSS colour became `sx.color`. In v9 that path is
gone: `color` is destructured out of props (`Typography.js:120`) so it never reaches the DOM, and it
only produces a rule when it matches a palette key or a `text*` key via the `variants` array. A raw
hex matches nothing, so all six numbers on the Daily Nutrition Summary card silently fell back to
default text colour while their icons above stayed coloured. Nothing errored, because `color` is
still a *typed* prop. Fixed by moving it into `sx`, and pinned by a new test — reverting the fix
fails all six cases.

Theme-callback style props lift correctly: `bgcolor`, `boxShadow` and `zIndex` on `IndexPage`'s
sticky bar became function values inside `sx` and render right (paper background, elevation-2 shadow,
stacking below the app bar).

The category filter needed no change — **both** assertions pass, including the listbox-by-name query
the ticket flagged as less certain. The label is now a `<div>` with no `htmlFor`, but `labelId`
still reaches the `Select`, so the accessible name survives on both the combobox and the popup
listbox. Confirmed in the browser as well as in the suite.

No test fallout from the changed test-environment detection: 146 passed, 2 skipped, no `stderr`
blocks.

Drawer icon gutter measured at 36px, down from 56px. Visually fine — the labels sit closer to their
icons and nothing crowds.

Click-through (dev server, MSW): drawer, sticky nutrition bar, nutrition summary grid, products
table with its `slotProps` checkbox labels, pagination, category filter, delete-note dialog spacing,
full-screen dialog transition, and the weight page's empty-state secondary text.

### Found while verifying — a defect in 03, fixed here on request

**The history filter's picker gained a second, actively harmful confirmation.** Ticket 03 recorded
the extra Cancel/OK bar on `FilterNotesHistory.tsx` as cosmetic and accepted. It is not: the dialog
renders `["", "", "Cancel", "OK", "Cancel", "Apply"]`, and clicking the *picker's* Cancel fires
`onChange` with the old value — reverting `filterDate` — while leaving the dialog open. A user who
picks December, presses that Cancel, then presses Apply submits October with no indication. The
picker's OK does nothing at all, since neither `onAccept` nor `onClose` is wired.

Fixed in a follow-up commit on this branch: the picker's action bar is suppressed with
`slotProps={{ actionBar: { actions: [] } }}`, so the enclosing dialog is the only place the filter
is confirmed or dismissed. Two tests cover it, and removing the fix fails the first. ADR 0002 and
03's answer were both corrected — the switcher was re-checked at the same time and is genuinely
unaffected: its Cancel closes the popover, submits nothing, and leaves no stale selection.

### Still open — needs its own ticket

**`SelectDateView.tsx:62` leans on a deprecated prop.** `StaticOnlyPickerProps.onClose` is annotated
"will be removed in next major version". It works today and the switcher's test covers it, but on
the next X major Cancel would compile fine and silently stop closing the popover.
