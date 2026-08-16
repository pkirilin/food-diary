# 05 — Browser targets and documentation

**What to build:** The project stops advertising browser support it does not actually ship, and its own instructions describe the library version that is really installed.

MUI v9 raises the browsers its shipped bundle targets. The project's production browser list is considerably looser, and since the bundler does not down-level dependency code, the library's syntax is the effective floor no matter what the configuration claims. Tightening the list makes an already-true constraint honest. This matters beyond one device — the repo publishes a public demo, so the declared support surface is visible to other people.

**Blocked by:** 04

**Status:** resolved

- [x] The production browser list matches the floors MUI v9 targets, rather than admitting browsers the bundle will not run in
- [x] The project instructions name the installed MUI major. They currently state the old one in two places, and the repo's coding rules require them to stay accurate
- [x] The lab package is removed from the documented UI dependency list, so that nobody reaches for a component from a package that is no longer installed
- [x] The README is checked for any MUI version or dependency references that the migration has made false
- [x] `yarn build` and `yarn lint` exit zero

## Answer

`browserslist.production` in `src/frontend/package.json` went from `[">0.2%", "not dead", "not
op_mini all"]` to MUI v9's own floors: `chrome >= 117`, `edge >= 121`, `firefox >= 121`,
`safari >= 17.0`, `ios_saf >= 17.0`. `safari` and `ios_saf` are separate browserslist keys, so both
are listed to cover the guide's single "Safari (macOS + iOS) 17.0" row.

**The list is declarative only.** `vite.config.ts` sets no `build.target` and nothing reads
browserslist during the build, so this changes no emitted output — which is the point of the ticket:
MUI's shipped syntax was already the effective floor, and the config now says so.

CLAUDE.md said "MUI v6" in both places (repo layout line, frontend conventions line); both now say
v9, and `@mui/lab` is gone from the UI dependency list — it is not in `package.json` and was dropped
during the React 19 work.

The README has no MUI or dependency-version references at all (its only "browser" hit is the
`VITE_APP_AUTH_CHECK_INTERVAL` description), so nothing there is stale. Historical design docs under
`docs/superpowers/` still name v6, but they are dated records of past migrations and were left alone.

`yarn build` and `yarn lint` exit 0 (14 pre-existing warnings, unchanged); the full suite is 149
passed / 2 skipped. `yarn format:check` flags only untracked `.playwright-cli/` scratch files.
