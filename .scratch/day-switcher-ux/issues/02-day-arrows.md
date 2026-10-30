# 02 — Previous/next day arrows

**What to build:** Icon buttons labelled "Previous day" and "Next day" on each side of the day switcher's date button move one day per tap, with no confirmation and no bound on future dates. See the spec's "Day arrows" section.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] `SelectDateView` renders the two arrows around the date button; each submits `currentDate ± 1 day` through `onSubmitDate` immediately
- [x] Tests: each arrow submits the adjacent date; a date after today is reachable via "Next day"
- [x] Existing OK, Cancel and reopen-resets tests keep passing (ADR-0002 unchanged)
- [x] Frontend build, lint and tests pass with no `stderr |` blocks in `yarn test --run --reporter=verbose`
