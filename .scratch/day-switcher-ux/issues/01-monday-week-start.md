# 01 — Weeks start on Monday app-wide

**What to build:** Every calendar in the app starts its weeks on Monday, with English text and the existing date formats unchanged. See the spec's "Week start" section.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] The shared `LocalizationProvider` in `app/RootProvider.tsx` gets an `adapterLocale` derived from date-fns `enUS` with `weekStartsOn: 1`
- [x] `SelectDateView.test.tsx` asserts the day switcher grid's first column is Monday
- [x] Existing weight log `DatePicker` and history filter tests still pass
- [x] Frontend build, lint and tests pass with no `stderr |` blocks in `yarn test --run --reporter=verbose`
