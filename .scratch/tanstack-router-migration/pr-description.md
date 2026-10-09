# Switch the frontend router to TanStack Router

Replaces React Router with TanStack Router, keeping behaviour almost unchanged. This is the first step towards native-feeling navigation: every route now declares its AppBar in typed static route data, and search params are validated by schemas and typed at every link. The Food Log add flow can then move from fullscreen dialogs to real routes in a later PR.

Decision records:
- [ADR-0004: The frontend routes with TanStack Router](https://github.com/pkirilin/food-diary/blob/main/docs/adr/0004-tanstack-router-for-typed-route-metadata.md)
- [ADR-0005: Pages are router-agnostic; route files adapt them](https://github.com/pkirilin/food-diary/blob/main/docs/adr/0005-pages-are-router-agnostic.md)

Spec and tickets: `.scratch/tanstack-router-migration/`.

## Behaviour changes

Every screen keeps its hash URL, and so do the server's post-login and post-logout redirects, the installed PWA and the GitHub Pages demo. The deliberate changes:

- **Signing in returns you to the screen you opened.** Before, the auth gate read `returnUrl` from the wrong URL, so sign-in always landed on the diary. A `returnUrl` that is not an in-app path (it must start with `/`) is ignored, and sign-in lands on the diary.
- **Products and Categories have AppBar titles.** Before, both showed an empty title.
- **One top-level heading per screen, and it is the AppBar title.** Categories no longer repeats its name under the AppBar. Products loses its screen-reader-only heading and its table toolbar title. On the diary, the heading is the date switcher, so a screen reader announces the selected date. Weight's date-range heading is now a second-level heading.
- **Unknown addresses show "Page not found"** with a "Go to diary" link.
- **`/#/logout` no longer exists.** Typing it used to show an empty screen without signing out. It now shows "Page not found".
- **An error inside a screen renders inside the error layout's container.** Before, an error under the AppBar rendered the bare error page.
- **The date switcher lines up with the burger icon.**

Developer-only: with `VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true`, the mock API now starts signed in. The app no longer redirects to sign-in and back on each load, which used to show the full-screen loader twice.

## For developers

- File-based routes live in `src/app/routes/`. The generated `src/app/routeTree.gen.ts` is committed, and CI fails when it is stale.
- Every route must declare `staticData.appBar`, and the compiler rejects a route that does not. The AppBar reads it with no type guard or cast.
- `date`, `month`, `year` and `returnUrl` are zod 4 search schemas. A malformed value is dropped and the screen shows the default, which `loaderDeps` computes on each read. The URL is not rewritten, so `#/` stays `#/` and a reload after midnight shows today.
- Pages take plain props, and route files are thin adapters (ADR-0005). Loaders get the store from router context and only warm RTK Query, which stays the only data cache.
- Login and logout are plain functions, `signIn` and `signOut`, in the auth feature. They replace route actions.
- Typed MUI link wrappers (`createLink`) live in `shared/ui`. Drawer items use the router's link options, with exact matching for the diary.
- Route components are function declarations below the route definition, following TanStack's idiom. This exception is written into `CLAUDE.md` and the frontend rules.
- Router devtools load in development only, and nothing of them ships in the production build.
- React Router is uninstalled, and no import or mention of it remains.
- `.mcp.json` adds the Chrome DevTools MCP server for agent-driven browser testing.

## Build size

Sum of the gzip column Vite prints, using the method recorded in ticket 01:

| Set | Before (`fef28455`) | After (`9ab1c0df`) | Change |
|---|---|---|---|
| First load: the entry script plus every `modulepreload` in `dist/index.html` | 324.55 kB (16 files) | 326.91 kB (28 files) | **+2.36 kB (+0.7%)** |
| All of `dist/assets/` | 722.54 kB (56 files) | 721.36 kB (66 files) | −1.18 kB |
| `dist/serviceWorker.mjs` | 5.40 kB | 5.40 kB | 0 |
| `dist/index.html` | 0.67 kB | 0.83 kB | +0.16 kB |

**The first load is 2.36 kB gzip heavier than before, so the spec's goal of a first load no heavier than today is not met.** The router is the only new dependency in the first load. The date pickers, the date-switcher slot and the History filter slot are lazy chunks outside it. Merging means accepting the extra 2.36 kB.

## Verification

- `yarn build`, `yarn lint` (0 errors; the 10 warnings were already on `main`), `yarn format:check` and `yarn test --run --reporter=verbose` all pass: 191 tests in 31 files, with no `stderr` blocks. App-level tests start from a URL and run the real route tree in memory. They cover the auth gate, sign-in returning to the deep link, logout, session expiry, "Page not found", malformed search params, headings and the date switcher.
- The CI check for a stale route tree fails both ways it can. A committed tree from before the routes existed fails the Build step at `tsc`. A stale tree that still typechecks passes the build, which regenerates it, and then fails the `git diff --exit-code` step.
- E2E suite (`tests/`, full stack built from source in Docker): 3 passed (chromium, firefox, webkit). The suite only checks that the sign-in page renders.
- Browser check with playwright-cli in MSW and fake-auth mode:
  - Every drawer link opens its screen with one heading. The active item is correct ("Today" only on the diary), and the drawer closes.
  - Deep links to a History month, a diary date and post-login with a `returnUrl` each open the right screen.
  - Reloading the diary, a diary date, a History month, Weight, Products and Categories keeps the screen.
  - Browser back and forward work.
  - `#/no-such-screen` and `#/logout` show "Page not found", and its link opens the diary.
  - Signed out, a History-month deep link redirects to sign-in with a `returnUrl`, and signing in lands on that month. Opening sign-in while signed in lands on the diary.
  - The date switcher changes the diary's date and Food Logs. The History filter changes the month.
  - With a 1.5 s mock delay, the full-screen loader shows on the first load only. Later navigations keep the current screen under the AppBar progress bar.
  - The console shows no errors or warnings.
- Production build with the service worker (no MSW, API mocked in the browser): after a new service worker is published, the update banner appears on the sign-in screen and under the AppBar. Reload activates the new worker and stays on the same screen.
- Demo-style build (MSW, fake auth, demo mode, as in `deploy-demo.yml`) served from `/food-diary/`: links resolve under the subpath. Sign-in from a deep link returns to it, the drawer, back and "Page not found" work, and the service worker registers with the `/food-diary/` scope.

Not verified:
- **Each commit on its own.** All the checks above ran on the branch head only. The spec asks that each commit pass build, lint, format check and tests on its own. Tickets 01 to 06 each recorded this for their own commits. Nobody re-checked it for the 10 commits now on the branch.
- **Real Google sign-in round trip.** Fake auth skips the backend redirects, so the owner checks this on the local full stack before merge (ticket 08).
- **The update banner in MSW mode** (the demo, and the dev server with MSW). There, the app's worker imports `mockServiceWorker.js`, which calls `skipWaiting()` on install, so a new version activates at once and the banner never shows. This is the same on `main`, and this PR changes neither the worker nor the banner.
- **The error screen in a browser.** Nothing in MSW mode triggers a route error.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
