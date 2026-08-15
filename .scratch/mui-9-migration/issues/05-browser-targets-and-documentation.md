# 05 — Browser targets and documentation

**What to build:** The project stops advertising browser support it does not actually ship, and its own instructions describe the library version that is really installed.

MUI v9 raises the browsers its shipped bundle targets. The project's production browser list is considerably looser, and since the bundler does not down-level dependency code, the library's syntax is the effective floor no matter what the configuration claims. Tightening the list makes an already-true constraint honest. This matters beyond one device — the repo publishes a public demo, so the declared support surface is visible to other people.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] The production browser list matches the floors MUI v9 targets, rather than admitting browsers the bundle will not run in
- [ ] The project instructions name the installed MUI major. They currently state the old one in two places, and the repo's coding rules require them to stay accurate
- [ ] The lab package is removed from the documented UI dependency list, so that nobody reaches for a component from a package that is no longer installed
- [ ] The README is checked for any MUI version or dependency references that the migration has made false
- [ ] `yarn build` and `yarn lint` exit zero
