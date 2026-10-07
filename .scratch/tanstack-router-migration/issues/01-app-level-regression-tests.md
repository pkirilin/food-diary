# 01 — App-level regression tests on today's router

**What to build:** A test harness that starts the whole app at a given URL, using the real route tree with in-memory routing, the MSW mock API and fake auth. Alongside it, a set of tests that pin today's behaviour as the owner sees it. These tests are the safety net for every later ticket. After the cut-over (ticket 05) they must still pass, with only the helper's internals changed. This ticket also records today's build size, which ticket 07 compares against.

Context worth knowing before starting:
- **The existing app-level helper** mounts the real hash router and cannot start at a URL. Its only users are two skipped tests marked "TODO: move to e2e", which cover login/logout and session expiry.
- **The E2E suite** only checks that the sign-in button is visible. So once un-skipped, these will be the only automated tests of the auth flow.
- **The test environment** enables MSW and fake auth with sign-in-on-start turned off, so tests sign in by clicking.

See the [spec](../spec.md), *Testing Decisions*, seam 1.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] The app-level helper accepts a starting URL and runs the real route tree in memory with a fresh store
- [x] Signing in from the sign-in screen lands on the diary
- [x] Opening a diary date by URL shows that date's Food Logs
- [x] Opening a History month by URL shows that month
- [x] Switching the date on the diary shows the Food Logs for the new date
- [x] Each drawer link opens its section
- [x] Logout from the drawer shows the sign-in screen (un-skipped)
- [x] An expired session shows the sign-in screen (un-skipped)
- [x] A skipped test that cannot be made reliable is deleted, not left skipped, and the reason goes under `## Comments` in this ticket
- [x] Tests assert only what the owner sees, never router state, loader calls or store internals
- [x] The gzip totals of the current production build output are recorded under `## Comments` in this ticket, for ticket 07
- [x] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero

## Comments

### Baseline build size (for ticket 07)

Measured on `fef28455`, before this ticket changed any code, with `yarn build` in `src/frontend`. Each figure is the sum of the gzip column that Vite prints for the client build:

| Set | Files | Raw | Gzip |
|---|---|---|---|
| First load: the entry script plus every `modulepreload` in `dist/index.html` | 16 | 1014.29 kB | **324.55 kB** |
| All of `dist/assets/` | 56 | 2296.92 kB | **722.54 kB** |
| `dist/serviceWorker.mjs` | 1 | 16.01 kB | 5.40 kB |
| `dist/index.html` | 1 | 1.93 kB | 0.67 kB |

To repeat the measurement, save the build log and sum the `gzip:` column of the `dist/assets/` lines. For the first-load row, sum only the files that `dist/index.html` references.

### Notes for later tickets

- **No skipped test was deleted.** Both now pass reliably. The session-expiry test used to fake timers only after the periodic auth check had already been scheduled with real timers, so jumping ahead never fired it. It now fakes timers before rendering, with `shouldAdvanceTime` so that everything else keeps running.
- **Stale assertion dropped from the logout test.** MUI v9 gives the modal drawer's paper `role="dialog"`, so the old `navigation` check could not match. Finding the Logout button already proves the drawer is open, because the drawer is `aria-hidden` while closed.
- **`renderApp(url, { signedIn })`** waits for the router's first load and then renders, which is the same shape TanStack's `await router.load()` needs. `signedIn` signs in the fake user in the mock API before the first load, so deep-link tests start with a session. They cannot sign in by clicking until ticket 02 makes sign-in return to the opened screen.
- **Fresh store, with one workaround.** The React tree gets a fresh store. Today's loaders still dispatch to the app's store singleton, and History renders data straight from that singleton's cache. So the helper also clears the singleton's API cache before each render. Without that, a later test in the same file would see Food Logs that an earlier test had seeded. Ticket 05 can delete the reset once loaders take the store through router context.
- **The helper does not call `createRouter`.** It builds a memory router from the same exported `routes`, because the React Router factory only makes hash routers. Ticket 05's factory takes a history, so the helper can call it from then on.
- **Wait budget.** `tests/app.test.tsx` raises Testing Library's `asyncUtilTimeout` to 3 s. Under the parallel full suite, whole-app navigations take up to about 2 s.

