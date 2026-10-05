# 01 — App-level regression tests on today's router

**What to build:** A test harness that starts the whole app at a given URL, using the real route tree with in-memory routing, the MSW mock API and fake auth. Alongside it, a set of tests that pin today's behaviour as the owner sees it. These tests are the safety net for every later ticket. After the cut-over (ticket 05) they must still pass, with only the helper's internals changed. This ticket also records today's build size, which ticket 07 compares against.

Context worth knowing before starting:
- **The existing app-level helper** mounts the real hash router and cannot start at a URL. Its only users are two skipped tests marked "TODO: move to e2e", which cover login/logout and session expiry.
- **The E2E suite** only checks that the sign-in button is visible. So once un-skipped, these will be the only automated tests of the auth flow.
- **The test environment** enables MSW and fake auth with sign-in-on-start turned off, so tests sign in by clicking.

See the [spec](../spec.md), *Testing Decisions*, seam 1.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] The app-level helper accepts a starting URL and runs the real route tree in memory with a fresh store
- [ ] Signing in from the sign-in screen lands on the diary
- [ ] Opening a diary date by URL shows that date's Food Logs
- [ ] Opening a History month by URL shows that month
- [ ] Switching the date on the diary shows the Food Logs for the new date
- [ ] Each drawer link opens its section
- [ ] Logout from the drawer shows the sign-in screen (un-skipped)
- [ ] An expired session shows the sign-in screen (un-skipped)
- [ ] A skipped test that cannot be made reliable is deleted, not left skipped, and the reason goes under `## Comments` in this ticket
- [ ] Tests assert only what the owner sees, never router state, loader calls or store internals
- [ ] The gzip totals of the current production build output are recorded under `## Comments` in this ticket, for ticket 07
- [ ] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero
