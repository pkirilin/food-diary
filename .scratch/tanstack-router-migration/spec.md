# Spec: Migrate the frontend router to TanStack Router

Status: ready-for-agent

Research: [research.md](./research.md). Its claims were verified on 2026-10-03 against the published tarballs and a probe project, and the search-param claims were re-checked on zod 4. Earlier comparison: [routes-instead-of-modals research](../routes-instead-of-modals/research.md).

Decision records: [ADR-0004](../../docs/adr/0004-tanstack-router-for-typed-route-metadata.md) (why TanStack Router) and [ADR-0005](../../docs/adr/0005-pages-are-router-agnostic.md) (pages take props; route files adapt them).

Vocabulary: [CONTEXT.md](../../CONTEXT.md). **Food Log**, **Meal**, **Product**, **Category** and **Weight Log** keep the meanings defined there.

## Problem Statement

The owner wants the app to feel like a native mobile app. Section roots should show a burger menu and nested screens a back arrow, chosen by the routing layer rather than coded into each screen. Fullscreen dialogs such as the Food Log add flow should become real routes with real back behaviour. React Router cannot support this cleanly:

- **Untyped metadata:** a layout that reads "whatever route is current" gets untyped metadata in every React Router mode. Today's AppBar works only through a hand-written type guard over loader data, and loaders return JSX to set the AppBar title.
- **Hand-parsed search params:** loaders parse search params by hand, with no validation and no typing at links or navigation calls.
- **Route actions:** login and logout are route actions triggered through form submissions, a router feature with no equivalent in the chosen replacement.
- **"Return to where I was" never worked:** the auth gate reads `returnUrl` from the wrong URL, and the post-login screen reads a path param that does not exist. Signing in always lands on the diary.
- **Inconsistent titles:** Products and Categories show an empty AppBar title, and Categories repeats its name as a large in-page heading.

This spec covers the first step only: replace the router at near-behaviour parity, so that the add-flow migration can build on typed routes.

## Solution

Replace React Router with TanStack Router in one pull request made of ordered commits, each of which builds and passes tests.

For the owner, almost nothing visibly changes:
- Every screen keeps its hash URL, and so do the server's post-login and post-logout redirects, the installed PWA and the GitHub Pages demo.
- Navigation, the date switcher, the History filter, the drawer, the loading indicators and scroll restoration behave as before.

The deliberate changes are small:
- Signing in returns the owner to the screen they tried to open.
- Products and Categories get AppBar titles.
- Each screen has a single top-level heading.
- An unknown address shows a "Page not found" screen with a link back to the diary.
- The unused `/#/logout` address no longer exists.

For the developer:
- Every route declares its AppBar in typed static route data, and the AppBar reads it with no guards.
- Search params are schema-validated and typed at every link.
- Pages take plain props, and route files are thin adapters.
- RTK Query stays the only data cache.
- Login and logout are plain functions.

## User Stories

1. As the owner, I want every screen to keep its current hash URL, so that my bookmarks and the installed PWA keep working.
2. As the owner, I want the server's post-login and post-logout redirects to keep landing on the right screens, so that signing in and out with Google works as before.
3. As the owner, I want to open the diary for a given date by URL, so that I can jump straight to that day's Food Logs.
4. As the owner, I want to open History for a given month by URL, so that I can return to a month I was reviewing.
5. As the owner, I want a malformed date or month in the URL to fall back to the default, so that a typo shows a usable screen instead of an error.
6. As the owner, I want the diary without a date to show today's Food Logs even when the app has stayed open past midnight, so that I never log food against yesterday by accident.
7. As the owner, I want to land on the screen I opened after I sign in, so that a deep link survives an expired session.
8. As the owner, I want a sign-in return address that points outside the app to be ignored, so that a crafted link cannot send me somewhere unexpected.
9. As the owner, I want opening the sign-in screen while signed in to take me to the diary, so that I never see a pointless sign-in prompt.
10. As the owner, I want the Logout item in the drawer to sign me out as it does today, so that the migration does not change how I end a session.
11. As the owner, I want an expired session to sign me out and show the sign-in screen as it does today, so that I am not left on a broken screen.
12. As the owner, I want an unknown address to show "Page not found" with a link back to the diary, so that a broken link is obvious and recoverable.
13. As the owner, I want Products and Categories to show their names in the AppBar like the other sections, so that I always know where I am.
14. As the owner, I want each screen's name to appear once, so that Categories no longer repeats its title under the AppBar.
15. As the owner using a screen reader, I want exactly one top-level heading per screen, named after that screen, so that I can orient myself.
16. As the owner using a screen reader, I want the diary's top-level heading to name the selected date, so that I hear which day's Food Logs I am on.
17. As the owner, I want the date switcher to stay in the AppBar on the diary and change which date's Food Logs I see, so that switching days works as before.
18. As the owner, I want the History filter to stay in the AppBar and change the month, so that filtering works as before.
19. As the owner, I want tapping a day in History to open the diary for that date, so that I can drill into a day's Food Logs.
20. As the owner, I want the drawer to highlight the section I am in, with the diary item highlighted only on the diary, so that the menu tells the truth.
21. As the owner, I want the drawer to close when I move to another section, so that I do not have to dismiss it by hand.
22. As the owner, I want the current screen to stay visible with a progress bar while the next one loads, so that navigation feels as it does today.
23. As the owner, I want the full-screen loader only on the first load, so that later navigations do not flash it.
24. As the owner, I want my scroll position restored when I go back, so that long lists do not reset.
25. As the owner, I want browser back and forward to move between screens as before, so that the system back gesture keeps working.
26. As the owner, I want the first load to be no heavier than today, so that the app opens just as fast on mobile data.
27. As the owner, I want the "new version available" banner to keep working, so that PWA updates still reach me.
28. As someone trying the demo, I want the GitHub Pages build and any install served from a subpath to keep working, so that the hosted demo is not broken.
29. As a developer, I want every route to declare its AppBar next to its definition, and the compiler to reject a route that does not, so that a new screen cannot ship without an AppBar decision.
30. As a developer, I want the AppBar to read the current screen's configuration with no type guard or cast, so that the strict-typing criterion holds.
31. As a developer, I want the AppBar configuration to keep a variant discriminator, so that the back and search variants can be added later without changing existing routes.
32. As a developer, I want heavy AppBar content such as the date pickers to load lazily, so that it stays out of the entry chunk.
33. As a developer, I want search params validated by a schema and typed at every link and navigation call, so that a wrong key or type is a compile error.
34. As a developer, I want links in navigation widgets typed against the route tree, so that a link to a route that does not exist fails the build.
35. As a developer, I want pages to take plain props, so that I can test business logic without a router and could replace the router later.
36. As a developer, I want RTK Query to remain the single data cache, so that the router never holds a stale copy of Food Logs.
37. As a developer, I want loaders to receive the store through router context, so that pages no longer import the store singleton just to prefetch.
38. As a developer, I want login and logout as plain functions in the auth feature, so that they do not depend on route actions.
39. As a developer, I want the route tree generated from route files and committed, with CI failing when it is stale, so that a forgotten regeneration cannot reach the default branch.
40. As a developer, I want the generated route tree excluded from linting and formatting, so that tooling noise does not hide real findings.
41. As a developer, I want the router's idiomatic `throw redirect(...)` to pass lint in route files without weakening the rule elsewhere, so that I write routes the way the docs do.
42. As a developer, I want route components written in TanStack's idiom, as function declarations below the route definition, with that exception written into the conventions, so that the docs and the code read the same.
43. As a developer, I want router devtools in development and nothing in production, so that I can inspect matches without shipping the tool.
44. As a developer, I want the existing component-test helper to keep working, with an async render, so that feature tests need only an `await`.
45. As a developer, I want app-level tests that start from a URL and run the real route tree in memory, so that the auth gate and route behaviour have automated coverage.
46. As a developer, I want the two skipped auth tests running again, so that login, logout and session expiry are checked on every run.
47. As a developer, I want every commit in the pull request to build and pass tests, so that I can review commit by commit and bisect.
48. As a developer, I want React Router removed completely, with no leftover imports or comments, so that there is one routing model in the codebase.
49. As a future reader, I want the router choice and the pages boundary recorded as ADRs, so that I do not undo them by accident.
50. As an agent working in this repo, I want CLAUDE.md and the frontend rules to describe the router and the route-component exception, so that I generate code that matches the codebase.

## Implementation Decisions

### Shape of the change

One pull request from the existing migration branch, made of ordered commits. Each commit builds and passes lint, format checks and tests:

1. **Auth actions become functions.** Still on React Router. This includes the `returnUrl` fix.
2. **Pages take props.** Still on React Router.
3. **TanStack infrastructure.** Install the packages, configure the plugin, add the tooling ignores and the CI check. No router is mounted yet.
4. **Router and routes.** The factory, type registration, route files, search schemas, link wrappers and the AppBar. Nothing is mounted yet.
5. **Switch over.** Mount the new router, delete React Router and its routing module, port the test helpers, and update the docs.
6. **Headings.** The AppBar title becomes the page heading, and the in-page duplicates go.

There is no gradual coexistence. Both routers would own the URL, and TanStack documents no way to run them side by side. Both packages may be installed during the intermediate commits, with only one router mounted.

### Router setup

- **Routing style:** file-based routing through the TanStack Vite plugin, placed before the React plugin, with automatic code splitting on. Code-based and virtual-file routing were rejected.
- **Where route files live:** in a routes directory inside the **app** layer, with the generated route tree beside it. Route files are app-layer adapters that import pages, features and entities, which keeps Feature-Sliced Design's import direction. A top-level routes folder would sit outside the FSD layers.
- **Generated route tree:** committed. `tsc` runs before the plugin can regenerate it in the build, and the Docker build runs the same script.
  - The plugin's temporary directory is ignored by git.
  - The tracked editor settings mark the generated file read-only and exclude it from search and file watching.
- **Router factory:** takes the store and an optional history, defaulting to hash history. Tests pass memory history. The router type is registered globally.
- **Router options:**
  - Scroll restoration on.
  - `defaultPreloadStaleTime: 0`, which is the documented setting when an external cache owns the data.
  - Default stale and GC times.
  - Preloading stays off, as today.
- **Hash URLs:** the format is identical to React Router's. No base path is needed, because hrefs are relative to whatever path serves the page.
- **Root route:**
  - Created with a typed context holding the store.
  - Mounts the router devtools, which compile to nothing outside development.
  - Owns the not-found component: "Page not found" with a link to the diary, inside the existing error layout.
- **Version range:** a caret range with the lockfile, as for other dependencies. Only non-deprecated APIs are used.

### Route tree

| Route | Search | AppBar | Behaviour |
|---|---|---|---|
| Root | — | `null` | Typed store context, devtools, not-found component |
| Authenticated pathless layout | — | `null` | Auth gate in `beforeLoad`. Renders the AppBar, progress bar, update banner and outlet, and runs the periodic auth check. The pending component is the app loader, shown on first load only. The error component is the error page in the error layout. |
| Diary (`/`) | `date` | `menu`, title is a lazy date-switcher slot | Loader warms the Food Logs query for the date |
| History | `month`, `year` | `menu`, `'History'`, lazy filter slot as actions | Loader warms the history query for the month |
| Weight | — | `menu`, `'Weight'` | Loader may return the Weight Logs request range |
| Products | — | `menu`, `'Products'` | Loader warms the products query from the stored filter |
| Categories | — | `menu`, `'Categories'` | Loader warms the categories query |
| Login | `returnUrl` | `null` | `beforeLoad` redirects to the diary when already signed in. Shows the app loader while pending. |
| Post-login | `returnUrl` | `null` | Once authenticated, goes to `returnUrl`, or to the diary if there is none |
| Post-logout | — | `null` | Unchanged |

The logout route is deleted. The auth screens sit outside the authenticated layout and have no AppBar.

### AppBar contract

The type shape comes from the research probe. The grilling session changed `title` to a single field, and a later review wrapped its component form in an object.

```ts
type AppBarConfig = {
  variant: 'menu';
  title: string | { Component: ComponentType };
  Actions?: ComponentType;
};

// augmentation: every route must supply it
interface StaticDataRouteOption {
  appBar: AppBarConfig | null;
}
```

- **Required everywhere.** Every route must supply `appBar`, and the compiler enforces it. Root, layouts and the auth screens use an explicit `null`. An optional field would let a new screen silently get no AppBar.
- **How the AppBar reads it.** The AppBar reads the deepest match's static data through a selector over the matches. It narrows with a `switch` on `variant`, and narrows the title with `typeof title === 'string'`. There is no guard and no cast, and the old loader-data guard and its fallback are deleted.
- **Every component field is PascalCase.** A component title sits under `Component`, not directly in `title`. React treats a lowercase JSX tag as an HTML element. So with `title: string | ComponentType`, destructuring `title` and writing `<title />` would render an HTML `<title>`, and both `tsc` and ESLint accept it. With the wrapper, every component in the config is reached through a PascalCase name, `title.Component` or `Actions`, so the bug cannot be written. Routes write `title: { Component: DateSwitcherSlot }` for the diary.
- **Heading.** The title renders as the page's top-level heading with today's visual style. A slot title is wrapped in that heading too, so on the diary the heading's accessible name is the selected date.
- **Slots.** Slots are `React.lazy` components. The router's own lazy wrapper is not used, because of the React 19 warning in upstream issue #8487.
  - Slots live in ignored-prefix files next to their route file.
  - The AppBar wraps them in Suspense with a text-skeleton fallback.
  - Slots are adapters (ADR-0005). They read their route's typed search and navigation and pass plain props to the feature.
- **Entry chunk.** Static route data always ships in the entry chunk. Anything it references directly is bundled there, which is why heavy slots must be lazy.
- **Only the `menu` variant exists now.** The discriminator stays so that `back` and `search` can be added later.

### Search params

- **Schemas:** zod 4 schemas go straight into search validation, with no adapter package. The adapter only supports zod 3.
- **`date`, `month` and `year`:**
  - They are optional, with `.catch(undefined)`, so a malformed value is dropped silently instead of reaching the error component.
  - The schemas have no default. A schema default is written into the URL on the first load (`#/` becomes `#/?date=<today>`), and a reload after midnight would then bring back yesterday. Each route's `loaderDeps` fills a missing key with a default computed on each read, and the route and its slot read the value through `useLoaderDeps`.
  - The fixed dates used when MSW is enabled move into these defaults.
  - Each key stays optional at every link.
- **`month` and `year` are numbers.** The router's default parser JSON-parses values, so no coercion is needed.
- **`returnUrl`** accepts only an in-app path, meaning a string starting with `/`. It is optional, and any other value is dropped.
- **`loaderDeps`:** each route's loader dependencies pick only the keys its loader uses. Passing the whole search object is explicitly discouraged by the docs.

### Data loading

- **RTK Query stays the cache.** Loaders dispatch `initiate()` to warm it and `unsubscribe()` when done, which is today's pattern.
- **What loaders return.** Loaders return nothing, or request parameters, and never query data. Components read data through RTK hooks.
- **History.** History stops returning its data from the loader. Today it freezes a copy that RTK keeps updating elsewhere.
- **Store access.** Loaders and `beforeLoad` take the store from router context. Pages no longer import the store singleton to prefetch. Imports of the store's hooks from entities and features are unaffected.

### Auth

- **Two functions in the auth feature:**
  - `signIn(returnUrl, navigate)`. With fake auth, it signs in the fake user and navigates to `returnUrl`. Otherwise it sends the browser to the API login endpoint with `returnUrl`.
  - `signOut(navigate)`. With fake auth, it signs out the fake user and opens login. Otherwise it sends the browser to the API logout endpoint, which redirects to post-logout.
  - `navigate` takes an in-app href. The caller supplies it from the router, so the auth feature never imports the router (ADR-0005).
- **Callers.** The drawer's Logout item and the periodic auth check call `signOut` directly. The sign-in form calls `signIn`.
- **Auth gate.**
  - It queries auth status, forcing a refetch except when the router is preloading.
  - When the owner is not signed in, it throws a redirect to login, carrying the current in-app href as `returnUrl`.
  - It follows the router's idiomatic `throw redirect(...)` form.
- **Post-login.** It reads `returnUrl` from validated search and pushes it as an in-app href.
- **Backend.** No backend change. The API always nests `returnUrl` inside the app's own hash fragment, and the frontend schema rejects anything that is not an in-app path.
- **Test helper.** The test environment's unused `signOutAfterMilliseconds` option is deleted.

### Pages, features and navigation widgets (ADR-0005)

- **Pages take props.** Route components read typed search and navigation and pass plain values and callbacks down.
  - The date switcher takes the date and a change callback, and keeps its existing router-free view.
  - The History filter takes an apply callback for month and year.
- **Navigation widgets may link directly,** because navigation is their job:
  - the drawer items;
  - the History list items that open a date in the diary;
  - the filter's icon link;
  - the error page link.

  They use typed link wrappers built with the router's `createLink` around the MUI components (Link, ListItemButton, IconButton). The wrappers live in the shared UI layer.
- **Drawer items:**
  - They are typed with the router's link-options helper instead of plain path strings.
  - The active state comes from the link's active props, with exact matching for the diary.
  - The drawer closes when the pathname changes.
- **Progress bar.** The navigation progress bar reads the router's loading state.
- **Deleted:** the dead root page, the empty-response helper, React Router's routing module, and the navigation loader-data types.

### Headings

- The AppBar title is the only top-level heading on each authenticated screen.
- Categories' visible heading and Products' visually hidden heading are removed.
- Weight's date-range heading becomes a second-level heading.

### Lint, format, CI and conventions

- **Generated route tree:** in ESLint's global ignores and Prettier's ignore list.
- **ESLint override for route files only:** `only-throw-error` allows the router's `Redirect` type. If matching that type through the package re-export does not work, the rule is turned off for route files only.
- **Route components:** function declarations placed below the route definition, which is TanStack's idiom. Hoisting means there is no temporal-dead-zone hazard. The exception is written into CLAUDE.md's frontend conventions and into the frontend rules' arrow-function guidance. No lint rule enforces component style.
- **CI:** after the frontend build, CI fails when the generated route tree differs from the committed one.
- **Docs:** CLAUDE.md's description of the frontend stack names TanStack Router instead of React Router. Comments that mention React Router are updated or removed.

### Behaviour changes to call out in the PR description

- Signing in returns the owner to the screen they opened.
- Products and Categories have AppBar titles.
- The heading structure is now one AppBar heading per screen, and Weight's range heading is a subheading.
- Unknown addresses show "Page not found".
- `/#/logout` no longer exists. Typing it used to show an empty screen without signing out. It now shows "Page not found".

## Testing Decisions

- **What makes a good test here.** It drives the app the way the owner does: it starts from a URL, clicks and types, and asserts what is on screen, such as headings, buttons, Food Logs and the sign-in prompt. Tests do not assert on router state, route static data, search schemas or which loader ran.
- **Seam 1, the primary seam: the whole app in memory.** The app-level helper builds the real route tree through the router factory, with a fresh store, memory history at a given URL, the MSW mock API and fake auth. The test environment already enables MSW and fake auth. Covered behaviours:
  1. A signed-out deep link to a History month shows sign-in. Signing in lands on that month.
  2. A `returnUrl` that is not an in-app path is ignored, and sign-in lands on the diary.
  3. Opening login while signed in lands on the diary.
  4. Logout from the drawer shows sign-in. This is the first skipped app test, un-skipped.
  5. An expired session shows sign-in. This is the second skipped app test, un-skipped.
  6. An unknown address shows "Page not found" with a link to the diary.
  7. History, Weight, Products and Categories each show their title as the only top-level heading. The diary's heading names the selected date.
  8. A malformed month falls back to the default month, not the error screen.
  9. Switching the date on the diary shows that date's Food Logs.

  If either skipped test cannot be made reliable, it is deleted rather than left skipped.
- **Seam 2, existing: the component-test helper.** Feature and widget tests keep using it. It becomes async: it builds a root-only route tree whose component renders the UI under test, waits for the router's first load, then renders. Its five callers add `await`. The UI must be the route's component, because the router provider drops children. No new tests go at this seam.
- **Nothing is tested in isolation below these seams.** That includes the auth functions, route files, schemas and link wrappers. Pages take props, so a future page test can render with no router.
- **Prior art:**
  - The skipped app tests: user-level auth flows on MSW and fake auth.
  - The Products, Categories, History-filter and nutrition-summary feature tests, all on the component helper.
  - The MSW mock API server and fake user service.
- **Test hygiene.** Follow the frontend rules:
  - Run the verbose reporter and treat any stderr block as a defect.
  - Await settled async state rather than padding with `act`.
  - Give mocks and matchers explicit type arguments.
  - Keep the `scrollTo` stub in test setup.
- **Browser verification is mandatory for this change.** Use playwright-cli against the dev server in MSW and fake-auth mode (checklist below).
- **E2E suite:** it needs Docker. If Docker is unavailable, stop and ask the owner.
- **Real Google sign-in:** fake auth bypasses the backend redirect, so the owner checks the real round trip on the local full stack before merge.

## Acceptance Checklist

- [ ] Each of the six commits passes build, lint, format check and tests on its own.
- [ ] No React Router import, dependency or comment remains.
- [ ] Seam-1 behaviours 1–9 pass, and the verbose test run shows no stderr blocks.
- [ ] Browser check in MSW and fake-auth mode:
  - [ ] Every drawer link opens its screen, the active item is correct (the diary item only on the diary), and the drawer closes.
  - [ ] These deep links open the right screen: a History month, a diary date, and post-login with a `returnUrl`.
  - [ ] Refreshing each screen keeps it.
  - [ ] Browser back and forward work.
  - [ ] An unknown address shows "Page not found".
  - [ ] A signed-out deep link redirects to sign-in and returns to the deep link.
  - [ ] The date switcher and the History filter work.
  - [ ] The progress bar shows on navigation, and the full-screen loader shows on first load only.
  - [ ] The console has no errors beyond the MSW-mode baseline.
- [ ] A production preview with the service worker still shows the update banner.
- [ ] A demo-style build served from a subpath works.
- [ ] The E2E suite passes.
- [ ] Gzip totals of the build output before and after are recorded in the PR.
- [ ] Owner: on the local full stack, a real Google sign-in from a signed-out deep link lands on that deep link.
- [ ] CLAUDE.md and the frontend rules reflect the router and the route-component exception.
- [ ] CI fails when the generated route tree is stale.
- [ ] The PR description lists the behaviour changes above.

## Out of Scope

- **The add flow:** the `back` and `search` AppBar variants, `useCanGoBack`, the legacy history-state shim, and back-fallback rules. They arrive with the first route that needs them, in the add-flow migration.
- **Moving the Food Log add flow** from fullscreen dialogs to routes, and any change to how Redux holds the draft.
- **Preloading on hover or touch.** If it is ever enabled, the auth gate must skip the forced refetch when preloading.
- `noUncheckedIndexedAccess`.
- **Enforcement:** a lint rule that enforces arrow-function components.
- **Store imports:** removing the store-hook imports from entities and features.
- **Per-screen titles:** a per-screen document title.
- **Drawer label:** renaming "Today" in the drawer.
- **Backend:** any backend change.
- **Unrelated bug:** the product nutrition suggestions bug where a cleared field counts as filled.

## Further Notes

- **Upstream issues to watch:**
  - #8487: the router's lazy wrapper triggers a React 19 "conditional `use()`" warning. Automatic code splitting still uses that wrapper for route components, so the warning may appear during navigation.
  - #8198: an invariant during interrupted concurrent renders. Mitigate it by reading route state only inside the route's own subtree.
- **No legacy history-state gotcha at cut-over.** Nothing reads `useCanGoBack` until the back variant arrives.
- **The router's docs contain a test-helper defect.** Their "alternative" helper renders UI as children of the router provider, and those children are dropped. Seam 2 avoids it by rendering the UI as the route component.
