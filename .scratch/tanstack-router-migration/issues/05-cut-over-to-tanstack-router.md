# 05 — Cut over to TanStack Router

**What to build:** The app runs on TanStack Router. Every screen keeps its hash URL and behaves as before. Two visible additions: Products and Categories get AppBar titles, and an unknown address shows "Page not found" with a link back to the diary.

Every route declares its AppBar in typed static route data, and the AppBar reads it with no guard or cast. Search params are schema-validated and typed at every link. RTK Query stays the only data cache. React Router is gone.

This is the single runtime cut-over. Two routers cannot share the URL, so it cannot be split into separately verifiable slices. Tickets 02–04 removed everything that could be done beforehand.

Context worth knowing before starting:
- **Where to find the mapping.** The [spec](../spec.md) holds the decisions. *Router setup*, *Route tree*, *AppBar contract*, *Search params*, *Data loading*, *Auth* and *Pages, features and navigation widgets* all apply. The [research](../research.md), §2.1, maps every React Router usage to its TanStack equivalent.
- **Traps the research verified:**
  - Static route data always ships in the entry chunk. Slots must therefore be `React.lazy`, or the date pickers land in the entry bundle. Use React's `lazy`, not the router's wrapper, because of upstream issue #8487.
  - Search defaults must be functions, so that "today" is computed on each read.
  - `loaderDeps` picks only the keys each loader uses.
  - Active-link matching is not exact by default, so without exact matching the diary item would be active on every screen.
  - After loading, the router provider renders only its matches and drops children. The component-test helper must render the UI under test as the root route's component, and await the router's first load.
  - `throw redirect(...)` trips `only-throw-error`. Use the ESLint override for route files.
  - The full-screen loader is the authenticated layout's pending component, with no pending delay. Later navigations keep the old screen visible under the progress bar.
  - Set `defaultPreloadStaleTime: 0`, and leave preloading off.

**Blocked by:**
- 02 — Sign in and out without route actions, returning to the opened screen
- 03 — Pages take props
- 04 — TanStack tooling in place

**Status:** ready-for-agent

- [ ] A router factory takes the store and an optional history, with hash history as the default. The router type is registered globally. Loaders and `beforeLoad` get the store from router context
- [ ] Every route in the spec's route tree exists at its current hash URL. The logout route does not
- [ ] Every route declares `appBar`, and a route without it fails `tsc`. The AppBar reads the deepest match with no guard or cast, and the old loader-data guard is deleted
- [ ] The date switcher and the History filter render as lazy AppBar slots. The build output shows the date pickers outside the entry chunk
- [ ] Products and Categories show their titles in the AppBar
- [ ] Search schemas:
  - [ ] `date`, `month` and `year` use a default and a catch, both written as functions;
  - [ ] `returnUrl` accepts in-app paths only;
  - [ ] each route's `loaderDeps` picks only the keys its loader uses
- [ ] Loaders warm RTK Query and return nothing or request parameters, never query data
- [ ] Auth:
  - [ ] The auth gate lives in the authenticated layout's `beforeLoad` and throws a redirect to sign-in carrying the current in-app href.
  - [ ] Sign-in redirects to the diary when the owner is already signed in.
  - [ ] Post-login goes to the return address.
- [ ] An ESLint override for route files allows the router's `Redirect` in `only-throw-error`. If that type match does not work, the rule is turned off for route files only, and which one was used is recorded under `## Comments`
- [ ] Typed links:
  - [ ] MUI link wrappers live in the shared UI layer.
  - [ ] Drawer items are typed with the router's link-options helper. The active item is correct, with exact matching for the diary, and the drawer closes when the pathname changes.
  - [ ] The History list items, the filter's icon link and the error page's link use the wrappers.
- [ ] Loading behaviour:
  - [ ] The progress bar reads the router's loading state.
  - [ ] The full-screen loader appears on first load only.
  - [ ] Scroll restoration works.
- [ ] The root route shows "Page not found" with a link to the diary, inside the error layout, and mounts the router devtools
- [ ] Test helpers:
  - [ ] The component-test helper is async, and its callers await it.
  - [ ] The app-level helper uses the router factory with memory history.
- [ ] The tests from tickets 01 and 02 pass, with changes only inside the helpers
- [ ] New app-level tests:
  - [ ] an unknown address shows "Page not found";
  - [ ] a malformed month falls back to the default month;
  - [ ] opening sign-in while signed in lands on the diary
- [ ] React Router is uninstalled, and no import, dependency or comment that mentions it remains. `CLAUDE.md` names TanStack Router in the frontend stack
- [ ] The work lands as two commits, each passing build, lint, format check and tests: first the routes, added but not mounted; then the switch and React Router's removal
- [ ] Smoke check with playwright-cli in MSW and fake-auth mode:
  - [ ] every drawer link works;
  - [ ] a diary-date deep link and a History-month deep link open the right screens;
  - [ ] the console shows nothing beyond the MSW-mode baseline. If the warning from #8487 appears, it is recorded under `## Comments`
- [ ] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero
