# 03 — Calendar grid and placement

**What to build:** The day switcher's calendar drops down from the app bar's bottom edge — full width below `sm`, capped to seven 48 px cells from `sm` up — with a six-row grid that includes the neighbouring months' days and a scrim over the content below the app bar. See the spec's "Grid (day switcher only)" and "Placement" sections.

**Blocked by:** 02

**Status:** resolved

- [x] Days outside the current month are shown, dimmed and selectable; the grid always renders six weeks
- [x] Day cells are at least 48 px square; below `sm` they stretch to fill the full viewport width
- [x] The calendar's top edge sits on the app bar's bottom edge; from `sm` up it is left-aligned under the date
- [x] A visible scrim dims only the content below the app bar; a tap anywhere outside the calendar, the app bar included, closes it like Cancel
- [x] Year → month → day drill-down and month arrows still work; the weight log `DatePicker` and history filter are unchanged
- [x] Test: a day from the previous month is shown and can be picked and confirmed
- [x] Browser check with `yarn playwright-cli` at 360 px and a desktop width covers the layout rules above
- [x] Frontend build, lint and tests pass with no `stderr |` blocks in `yarn test --run --reporter=verbose`
