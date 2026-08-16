# 06 — Drop the day switcher's deprecated picker `onClose`

**What to build:** The day switcher's popover keeps behaving exactly as it does today — pick a day, OK submits it and closes, Cancel closes without submitting — without leaning on `StaticOnlyPickerProps.onClose`, which MUI X annotates "will be removed in next major version". Left as-is, the next X major would compile fine and silently stop closing the popover on Cancel.

**Blocked by:** 04

**Status:** resolved

- [x] `SelectDateView` no longer passes `onClose` (or any other deprecated picker prop)
- [x] Cancel closes the popover without submitting; OK submits the picked date and closes
- [x] Reopening still starts from the current date, discarding an abandoned selection
- [x] Only one confirmation affordance is rendered, pinned by a test
- [x] Checked in the running app, not only in the suite
- [x] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero

## Answer

The picker's built-in action bar is suppressed with `slotProps={{ actionBar: { actions: [] } }}` and
the popover renders its own `DialogActions` with Cancel and OK. This is the same shape already used
by `FilterNotesHistory.tsx` (04), where the enclosing dialog owns the confirmation — here the
popover does.

`onAccept` went with `onClose`: OK now reads the component's own `selectedDate`, which the open
handler already resets to `currentDate`, so the picker no longer needs to report acceptance or
closure at all. What remains of the picker's API surface is `value`, `views` and `onChange`, none of
them deprecated.

The two candidate approaches were a custom `actionBar` slot driven by `usePickerActionsContext` and
this one. The slot route keeps MUI's translations but has to thread the close callback into a slot
whose props type is fixed to `PickersActionBarProps`, which means either an extra React context or a
cast. Owning the bar avoids both and matches the existing precedent; the app sets no `localeText`
overrides, so the hardcoded "Cancel"/"OK" match what the picker was already rendering.

A fourth test asserts exactly one Cancel and one OK are present, after a day has been picked — the
guard against the duplicate action bar that 04 found on the history filter.

ADR 0002's consequences paragraph said the switcher "keeps its action bar" and "wires the close
callback", which this change makes false. The decision itself is untouched — confirming with OK
still costs the extra tap — so the paragraph was amended in place rather than the ADR superseded.

Verified in the browser (dev server, MSW): the bar renders identically to before (text buttons,
right-aligned, inside the popover paper), OK moved the header from 19 to 20 Oct, and Cancel after
picking 25 left it on 20 Oct with the popover closed. No React or MUI console errors.

`yarn build` clean, `yarn lint` 0 errors (14 pre-existing warnings, none in the touched files),
`yarn test --run --reporter=verbose` 149 passed / 2 skipped with no `stderr` blocks.
