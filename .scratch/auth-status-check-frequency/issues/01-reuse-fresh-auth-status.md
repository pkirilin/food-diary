# 01 — Reuse a fresh auth status instead of checking on every navigation

**Status:** ready-for-agent

**Spec:** [spec.md](../spec.md) (user stories 1–7)

## Agent Brief

**Category:** enhancement
**Summary:** Send `GET /api/v1/auth/status` only when the cached status is older than `AUTH_CHECK_INTERVAL`, poll it with RTK Query, check on app visibility, and redirect to `/login` with a return address when the session ends

**Current behavior:**
`_app` `beforeLoad` forces a status request on every navigation to a new screen. `useAuthStatusCheckEffect` runs a hand-written `setInterval` and, on any result other than `isAuthenticated: true` (a failed request included), calls `signOut`, which leads to the Google account picker because `/api/v1/auth/logout` is `[Authorize]`.

**Desired behavior:**
See the spec's Solution, Implementation Decisions and sequence diagrams. In short:
- Every trigger (navigation, app visible, timer) reuses a cached status younger than `AUTH_CHECK_INTERVAL` and refetches an older one.
- The timer is `useGetStatusQuery` with `pollingInterval`.
- `isAuthenticated: false` from any trigger calls `onSessionEnded`, wired to `router.invalidate()`, which redirects to `/login?returnUrl=<current screen>`.
- A failed request keeps the last known status.
- Fake-auth `signIn`/`signOut` write the new status into the cache.

**Key interfaces:**
- `src/frontend/src/app/routes/_app.tsx` — `beforeLoad`, `AuthenticatedLayout`
- `src/frontend/src/app/routes/login.tsx` — `beforeLoad`
- `src/frontend/src/features/auth/constants` — `AUTH_STATUS_MAX_AGE_SECONDS`
- `src/frontend/src/features/auth/hooks/useAuthStatusCheckEffect.ts` — new signature `(onSessionEnded: () => void) => void`
- `src/frontend/src/features/auth/lib/session.ts` — `signIn`/`signOut` take `dispatch`
- `src/frontend/src/features/auth/ui/SignInForm.tsx`, `src/frontend/src/widgets/Navigation/ui/NavigationDrawerActions.tsx` — pass `dispatch`
- `docs/development.md` — `VITE_APP_AUTH_CHECK_INTERVAL` row

**Acceptance criteria:**
- [ ] Navigating between screens within `AUTH_CHECK_INTERVAL` of the last status response sends no status request (test asserts it)
- [ ] Navigating after the window sends one status request, and `false` redirects to `/login?returnUrl=…`
- [ ] The polling tick that gets `false` shows the sign-in screen, and signing in again returns to the same screen
- [ ] Bringing the app back to the foreground refetches only when the cached status is stale
- [ ] A failed status request (polling, visibility or navigation with a cached status) keeps the owner on the screen
- [ ] `useAuthStatusCheckEffect` no longer calls `signOut`; the sign-out button still does
- [ ] `_app` and `login` `beforeLoad` use `subscribe: false` with no `try`/`finally`
- [ ] Fake-auth sign-in, sign-out and sign-in again work in `tests/app.test.tsx` and in backend-less development
- [ ] `docs/development.md` describes `VITE_APP_AUTH_CHECK_INTERVAL` as both the polling interval and the maximum age of a reused status, and no longer says it is unused with fake auth
- [ ] `yarn lint`, `yarn build` and `yarn test --run --reporter=verbose` pass with no `stderr |` blocks
- [ ] Browser verification per `docs/agents/browser-verification.md`: the network panel shows no status request on navigation within the window

**Out of scope:**
- Backend changes, including 401/403 responses for `/api/*` and `/api/v1/auth/logout` behaviour without a session
- Reacting to 401 responses on the frontend

## Comments
