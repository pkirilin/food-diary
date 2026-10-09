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

**Status:** resolved

- [x] A router factory takes the store and an optional history, with hash history as the default. The router type is registered globally. Loaders and `beforeLoad` get the store from router context
- [x] Every route in the spec's route tree exists at its current hash URL. The logout route does not
- [x] Every route declares `appBar`, and a route without it fails `tsc`. The AppBar reads the deepest match with no guard or cast, and the old loader-data guard is deleted
- [x] The date switcher and the History filter render as lazy AppBar slots. The diary declares its slot as `title: { Component: ... }`, never as a bare component in `title`. The build output shows the date pickers outside the entry chunk
- [x] Products and Categories show their titles in the AppBar
- [x] Search schemas:
  - [x] ~~`date`, `month` and `year` use a default and a catch, both written as functions;~~ Changed by the owner: the keys are optional with a catch, and `loaderDeps` fills the default (see `## Comments`);
  - [x] `returnUrl` accepts in-app paths only;
  - [x] each route's `loaderDeps` picks only the keys its loader uses
- [x] Loaders warm RTK Query and return nothing or request parameters, never query data
- [x] Auth:
  - [x] The auth gate lives in the authenticated layout's `beforeLoad` and throws a redirect to sign-in carrying the current in-app href.
  - [x] Sign-in redirects to the diary when the owner is already signed in.
  - [x] Post-login goes to the return address.
- [x] An ESLint override for route files allows the router's `Redirect` in `only-throw-error`. If that type match does not work, the rule is turned off for route files only, and which one was used is recorded under `## Comments`
- [x] Typed links:
  - [x] MUI link wrappers live in the shared UI layer.
  - [x] Drawer items are typed with the router's link-options helper. The active item is correct, with exact matching for the diary, and the drawer closes when the pathname changes.
  - [x] The History list items, the filter's icon link and the error page's link use the wrappers.
- [x] Loading behaviour:
  - [x] The progress bar reads the router's loading state.
  - [x] The full-screen loader appears on first load only.
  - [x] Scroll restoration works.
- [x] The root route shows "Page not found" with a link to the diary, inside the error layout, and mounts the router devtools
- [x] Test helpers:
  - [x] The component-test helper is async, and its callers await it.
  - [x] The app-level helper uses the router factory with memory history.
- [x] The tests from tickets 01 and 02 pass, with changes only inside the helpers
- [x] New app-level tests:
  - [x] an unknown address shows "Page not found";
  - [x] a malformed month falls back to the default month;
  - [x] opening sign-in while signed in lands on the diary
- [x] React Router is uninstalled, and no import, dependency or comment that mentions it remains. `CLAUDE.md` names TanStack Router in the frontend stack
- [x] The work lands as two commits, each passing build, lint, format check and tests: first the routes, added but not mounted; then the switch and React Router's removal
- [x] Smoke check with playwright-cli in MSW and fake-auth mode:
  - [x] every drawer link works;
  - [x] a diary-date deep link and a History-month deep link open the right screens;
  - [x] the console shows nothing beyond the MSW-mode baseline. If the warning from #8487 appears, it is recorded under `## Comments`
- [x] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero

## Comments

### Decisions made during the cut-over

- **Search defaults live in `loaderDeps`, not in the schemas (owner's decision).** A schema default makes TanStack rewrite the URL on the first load: `#/` becomes `#/?date=<today>`, and `#/history` gets `month` and `year`. A reload after midnight, or Android restoring a discarded PWA tab, would then bring back yesterday's diary. So `date`, `month` and `year` are `.optional().catch(undefined)`. Each route's `loaderDeps` fills a missing key from a function on each read, and the route and its slot read it with `useLoaderDeps`. A malformed value is dropped from the URL, and the screen shows the default. The spec's *Search params* section was updated to match.
- **ESLint override:** the type match works. Route files use `only-throw-error` with `allow: [{ from: 'package', package: '@tanstack/router-core', name: 'Redirect' }]`, and the rule stays on.
- **One error screen.** The router's default error component is the error page inside the error layout. Root, the authenticated layout, every screen and the auth screens all use it. Before the cut-over, an error in a screen under the AppBar rendered the bare error page; it now renders inside the error layout's container.
- **No unauthenticated layout.** Sign-in renders its own update banner, as before. Post-login and post-logout redirect immediately and show no banner.
- **The not-found link** reads "Go to diary".

### Notes for later tickets

- **#8487:** the warning did not appear in the browser check.
- **Test helpers.** `render` awaits `router.load()` and then renders. `renderApp` renders and then awaits `router.load()` inside `act()`: the provider starts its own first load on mount, and a malformed search value makes it rewrite the URL. Without the `act()`, those updates warn in the verbose run. The app store's cache reset from ticket 01 is gone, because loaders now take the store from router context.
- **Back after post-login** returns to post-login, which pushes the return address again. This matches the old behaviour, because post-login always pushed.
- **No browser check of the error screen.** Nothing in MSW mode triggers a route error.

### Build size (for ticket 07)

Measured with `yarn build` on the finished change, using the same method as ticket 01:

| Set | Files | Gzip | Ticket 01 baseline |
|---|---|---|---|
| First load: the entry script plus every `modulepreload` in `dist/index.html` | 31 | **327.39 kB** | 324.55 kB (16 files) |
| All of `dist/assets/` | 70 | **721.99 kB** | 722.54 kB |

The date pickers are outside the first load. `StaticDatePicker`, `dateViewRenderers`, `-DateSwitcherSlot` and `-HistoryFilterSlot` are separate chunks, and the entry only names them in its preload map.

### Browser check

In MSW and fake-auth mode with playwright-cli:
- **Drawer:** each link opens its screen, and the active item is correct (Today only on the diary). The drawer closes on navigation, and Products and Categories show their AppBar titles.
- **URLs:** `#/` stays `#/` after the first load. `#/?date=2023-10-20` and `#/history?month=9&year=2023` open the right screens. `#/history?month=abc&year=2023` shows October 2023. `#/post-login?returnUrl=…` lands on the return address. `#/no-such-screen` shows "Page not found", and its link opens the diary.
- **Navigation:** browser back and forward work, and a reload keeps the screen. The date switcher and the History filter work.
- **Loading:** with a 1.5 s mock delay, the full-screen loader shows on the first load only. Later navigations keep the old screen under the progress bar. Scroll position comes back on back navigation.
- **Console:** no errors or warnings, not even the MSW-mode baseline.
