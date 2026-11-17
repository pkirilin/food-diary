# Auth status check: can RTK Query built-ins replace the hand-written effects?

Research date: **2026-11-17**. Installed versions: `@reduxjs/toolkit@2.12.0`,
`@tanstack/react-router@1.170.41`, `@tanstack/router-core@1.171.34`.
RTK Query claims are cited from the installed source,
`src/frontend/node_modules/@reduxjs/toolkit/src/query/…` (abbreviated `rtkq/…` below), or from the
official docs. `redux-toolkit.js.org` now 301-redirects to `redux.js.org/toolkit/…`. Where the docs
and the installed 2.12.0 source disagree, the source wins, and the difference is noted.

Every claim marked **(verified)** was checked by running code. The node experiment against the
real RTK is in [Appendix A](#appendix-a-rtk-query-focus-experiment). The prototypes were run
against the real frontend test suite in a scratch copy of `src/frontend`; see
[Appendix B](#appendix-b-prototypes-run-against-the-real-test-suite). No repo source was changed.

---

## TL;DR

1. **Q1: setupListeners + refetchOnFocus as a replacement for the two effects: No. The spec is right.** `refetchOnFocus` always refetches (`forceRefetch: true`) on every `focus` *and* every `visibilitychange → visible`, with no freshness window. It also cannot call `onSessionEnded`.
2. **Q2: no `useEffect` at all, same behaviour: Partially.** You can remove every `useEffect` with `setupListeners`, a listener on `api.internalActions.onFocus` that calls `prefetch({ ifOlderThan })`, and a render-time `<Navigate>` (all 319 tests pass). It is **not identical**: it adds a window-`focus` trigger, the listener lives for the whole store, and the redirect path and test plumbing change. It is also **not simpler**: +53/−51 lines and more moving parts.
3. **Q3: one `useAuth` hook with no `useEffect`: Partially.** A single `useGetStatusQuery` call can serve all three call sites, but only on top of Q2's store-level changes, and the post-login and post-logout pages would then poll every hour too. A bigger simplification is to delete `useAuth` and move `/post-login` and `/post-logout` into `beforeLoad`, the same pattern `login.tsx` already uses: −54 lines net, 28/28 flow tests pass.

---

## 1. Current behaviour baseline (the yardstick)

The code is `useAuthStatusCheckEffect.ts`, `useAuth.ts`, `_app.tsx`, `login.tsx`, `post-login.tsx`, `post-logout.tsx` and `lib/session.ts`.
All triggers share one cache entry, `getStatus({})`.

| # | Trigger / situation | Request sent? | Outcome |
| --- | --- | --- | --- |
| B1 | **App launch into an `_app` screen** (`_app` `beforeLoad`, `initiate({}, { forceRefetch: 3600, subscribe: false })`) | Yes. The cache is empty. | `true` renders the layout. `false`, or a failed first request (`data` undefined), throws `redirect('/login?returnUrl=<href>')`. A `beforeLoad` redirect navigates with `replace: true, ignoreBlocker: true` (router-core `load-client.ts:1701-1735`). |
| B2 | **Layout mounts** (`useGetStatusQuery({}, { pollingInterval: AUTH_CHECK_INTERVAL })`) | No. The entry was just fulfilled and the thunk `condition` skips cached data (`rtkq/core/buildThunks.ts:968-972`). | Adds the only long-lived subscription, which keeps the entry alive past `keepUnusedDataFor` (60 s, `rtkq/createApi.ts:359`). The first poll is scheduled when the subscription is added (`rtkq/core/buildMiddleware/polling.ts:38-43,135-146`). |
| B3 | **Navigation inside `_app`**, including preloads and search-param changes | Only if the last `fulfilledTimeStamp` is ≥ `AUTH_STATUS_MAX_AGE_SECONDS` (3600 s) old (`buildThunks.ts:885-905`), and never while a request is pending (`buildThunks.ts:946-949`). | A fulfilled response restarts the polling timer (`polling.ts:45-50`). `false` redirects with `returnUrl` = the **target** screen. A failed request keeps the last `data`. |
| B4 | **Polling timer** | Every `AUTH_CHECK_INTERVAL` after the last response (fulfilled or rejected) from **any** trigger. The refetch is forced (`polling.ts:104-108`). | Polls even while the tab is hidden: `skipPollingIfUnfocused` defaults to `false` (`rtkq/react/buildHooks.ts:1696`), and `setupListeners` is never called. |
| B5 | **`document` `visibilitychange` → `visible`**, only while `AuthenticatedLayout` is mounted | Only if stale (`prefetch` with `ifOlderThan: 3600`, `buildThunks.ts:1025-1036`) or never fulfilled. | Window `focus` is **not** a trigger. |
| B6 | **Session end**: subscribed `data` becomes `{ isAuthenticated: false }` from any source (poll, visibility, navigation, fake `signOut` upsert) while the layout is mounted | — | Effect 1 calls `onSessionEnded` → `router.invalidate()`. `_app` `beforeLoad` re-runs, finds the fresh cached `false` and makes no request. It redirects to `/login?returnUrl=<current href>` (replace, ignores the `log.food` blocker). `/login` `beforeLoad` then always sends 1 request (B8). |
| B7 | **Failed request** (offline, 5xx) | — | `data` keeps the last success, so the session is not ended (test "a failed auth status check keeps the owner signed in", 3 requests). |
| B8 | **`/login`** `beforeLoad` (`forceRefetch: true, subscribe: false`) | Always. | `true` → `redirect('/')`. |
| B9 | **`/post-login`** (`useAuth()`, which is a plain subscription with no options) | Only if nothing is cached. After a real sign-in, the page reload empties the cache, so 1 request. | `data ?? { isAuthenticated: false }`. Shows "Logging in..." until `true`, then `history.push(returnUrl)`. It never re-checks, so a `false` spins forever. |
| B10 | **`/post-logout`** (`useAuth()`) | Starts 1 request when the cache is empty. | While loading, `data` is `undefined` → `isAuthenticated: false`, so the effect **navigates to `/` on the first render**, before the response arrives. `_app` `beforeLoad` then waits on the request that is already in flight (`buildThunks.ts:946-949`). "Logging out..." is only seen when a cached `true` exists. In practice it never is, because a real logout is a full page load to `/#/post-logout` (`src/backend/src/FoodDiary.API/Startup.cs:61`). |
| B11 | **Fake-auth** `signIn` / `signOut` | No. | They write the status with `upsertQueryData`, then navigate. |
| B12 | **`/mcp-consent`** and other non-`_app` routes | No auth check. | — |

---

## 2. Q1: can `setupListeners` + `refetchOnFocus` (and friends) replace the two `useEffect`s?

**Verdict: No.** You can only replace effect 2, and only by **dropping the freshness window** on
focus (a behaviour change; see the table at the end of this section). The spec's statement
("`refetchOnFocus` and `skipPollingIfUnfocused` are not used: both need `setupListeners`, and
`refetchOnFocus` refetches on every focus regardless of the freshness window") is **confirmed**.

### 2.1 Effect 1 (`onSessionEnded`) is not a fetching concern

No RTK Query hook option calls a callback when data changes. `UseQuerySubscriptionOptions` contains
only `refetchOnReconnect`, `refetchOnFocus`, `refetchOnMountOrArgChange`, `skip`, `pollingInterval`
and `skipPollingIfUnfocused` (`rtkq/react/buildHooks.ts:1690-1697`; `rtkq/core/apiState.ts:145-170`).
`setupListeners` and `refetchOnFocus` only decide **when to fetch**. They cannot redirect.

### 2.2 Effect 2 (visibility check) vs `refetchOnFocus`: facts from the source

| Question | Answer | Proof |
| --- | --- | --- |
| Which DOM events does `setupListeners` listen to? | `focus`, `visibilitychange`, `online` and `offline`, all registered **on `window`**. `visibilitychange` dispatches `onFocus` when `visible` and `onFocusLost` otherwise. | `rtkq/core/setupListeners.ts:9-13, 73-79, 87-101`. Docs: "adds one set of `focus`, `visibilitychange`, `online` and `offline` listeners to `window`" ([setupListeners](https://redux.js.org/toolkit/rtk-query/api/setupListeners)). |
| Does `refetchOnFocus` respect a staleness threshold? | **No.** It dispatches `refetchQuery`, which is `initiate(args, { subscribe: false, forceRefetch: true })`. | `rtkq/core/buildMiddleware/windowEventHandling.ts:20-22, 55-57`; `rtkq/core/buildMiddleware/index.ts:146-160`. **(verified)** Experiment A1: a focus 20 ms after a fetch sends a second request. Prototype P3: the flow test "bringing the app back to the foreground … only once the last check is older…" fails with `expected 1 to be +0`. |
| Does it refetch only subscribed queries? | **Yes.** It iterates `internalState.currentSubscriptions`, so an entry fetched with `subscribe: false` (the `beforeLoad` path) is never refetched. A subscription that never fetched (`uninitialized`) is skipped too. | `windowEventHandling.ts:37-57`. Docs: "refetch all subscribed queries after the application window regains focus" ([cache-behavior](https://redux.js.org/toolkit/rtk-query/usage/cache-behavior#re-fetching-on-window-focus-with-refetchonfocus)). **(verified)** Experiment A: the `other` query (`subscribe: false`) stays at 1 call. |
| Per-endpoint vs per-hook vs per-api? | **Per-api** (`createApi({ refetchOnFocus })`) or **per-subscription** (hook option or `initiate(…, { subscriptionOptions })`). There is **no per-endpoint option**. A query refetches if any subscriber resolves to `true`, or if all are unset and the api default is `true`. | `rtkq/createApi.ts:146-153, 356-362`; `rtkq/core/apiState.ts:161-170`; `windowEventHandling.ts:43-46`. `rg refetchOnFocus rtkq/endpointDefinitions.ts` returns 0 hits. Docs list only `createApi` and the four hooks ([cache-behavior](https://redux.js.org/toolkit/rtk-query/usage/cache-behavior#re-fetching-on-window-focus-with-refetchonfocus)). |
| Does it fire on both events when the owner switches back to the tab? | Both events dispatch `onFocus`. The second is dropped while the first request is pending (`condition` returns `false` for `pending`). | `setupListeners.ts:73-79, 87-92`; `buildThunks.ts:946-949`. **(verified)** Experiment A4: `visibilitychange` + `focus` together send 1 request. |
| Can several stores use it (one per test)? | **Not in 2.12.0.** A module-level `initialized` flag makes every later `setupListeners` call a no-op until the first one's `unsubscribe` runs. Events keep going to the **first** store. The current docs describe per-store fan-out, which the installed source does not implement. | `setupListeners.ts:35, 81-114`. **(verified)** Experiment B: the second store gets 0 refetches. Experiment C: after `unsubscribe()` of store 1 it works. Each `renderApp` would need `onTestFinished(setupListeners(store.dispatch))`. |
| Does the existing test helper still work? | **No.** `bringAppToForeground` dispatches `new Event('visibilitychange')` on `document` without `bubbles`. A listener on `window` never sees it. Browsers fire it with `bubbles: true`. | **(verified)** Experiments A2 and A3: non-bubbling gives 0 refetches, bubbling gives 1. Prototypes P2 and P3 needed `{ bubbles: true }`. |
| Does `setupListeners` change other queries? | No. `refetchOnFocus`, `refetchOnReconnect` and `refetchOnMountOrArgChange` all default to `false` (`createApi.ts:356-362`), and `shared/api/api.ts` does not set them. It only starts tracking `config.focused` and `config.online` (`rtkq/core/buildSlice.ts:676-705`). | — |

### 2.3 The related options

| Option | Can it express the current behaviour? | Why |
| --- | --- | --- |
| `refetchOnMountOrArgChange: <seconds>` | Not for navigation or focus. | It is evaluated **only when a subscription is created** or its arg changes: the hook calls `initiate(…, { forceRefetch: refetchOnMountOrArgChange })` only if `!lastPromise \|\| lastPromise.arg !== stableArg` (`buildHooks.ts:1793-1811`). Docs: "At the time a query subscription is created…" ([cache-behavior](https://redux.js.org/toolkit/rtk-query/usage/cache-behavior#encouraging-re-fetching-with-refetchonmountorargchange)). `AuthenticatedLayout` stays mounted across child navigations, so it would check once. The navigation trigger already uses the same rule through `initiate(…, { forceRefetch: 3600 })` in `beforeLoad` (`buildThunks.ts:894-901`), which is the correct built-in. |
| `refetchOnReconnect` | No. It would be a **new** trigger. | It is also forced and unconditional (`windowEventHandling.ts:23-25`). It could be useful (a check after coming back online), but no current behaviour corresponds to it. |
| `keepUnusedDataFor` | Not a trigger. | It only explains why the polling subscription is needed: without a subscriber, the entry is evicted after 60 s (`rtkq/core/buildMiddleware/cacheCollection.ts:163-176`). |
| `pollingInterval` | Already used (B4). | Built in, no effect needed. |
| `skipPollingIfUnfocused` | Would change B4: no polling while hidden. | It needs `setupListeners` (`polling.ts:105`). In 2.12.0, **any** polling subscriber with `true` enables the skip (`polling.ts:175`, OR semantics). The current docs say every subscriber must set it ([polling](https://redux.js.org/toolkit/rtk-query/usage/polling)), so docs and source differ here too. |

### 2.4 Closest possible simplification (behaviour change): P3

```ts
// src/app/index.tsx
import { setupListeners } from '@reduxjs/toolkit/query';
setupListeners(store.dispatch);

// tests/render/render.tsx (renderApp)
const store = configureStore();
onTestFinished(setupListeners(store.dispatch));

// features/auth/hooks/useAuthStatusCheckEffect.ts: effect 2 and usePrefetch removed
export const useAuthStatusCheckEffect = (onSessionEnded: () => void): void => {
  const { data } = authApi.useGetStatusQuery(
    {},
    { pollingInterval: AUTH_CHECK_INTERVAL, refetchOnFocus: true },
  );

  useEffect(() => {
    if (data?.isAuthenticated === false) {
      onSessionEnded();
    }
  }, [data, onSessionEnded]);
};

// tests/app.test.tsx
document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
```

**(verified)** With these changes, 27 of 28 flow tests pass. The one that fails asserts the freshness window on foreground (B5).

| Behaviour | Current | P3 (`refetchOnFocus`) |
| --- | --- | --- |
| Tab becomes visible, status < 1 h old | No request | **1 request** |
| Window regains `focus` (tab was visible all along, e.g. returning from another app window or DevTools) | No request | **1 request** |
| Visible + focus fired together | ≤ 1 request | ≤ 1 request (pending dedupe) |
| Requests per hour with frequent focus changes | ≤ 1 from this trigger | 1 per focus |
| Scope | Only while `AuthenticatedLayout` is mounted | Only while the polling subscription exists, which is the same thing |
| Session end on `false` | Effect 1 | Effect 1 (unchanged) |
| Test setup | — | `setupListeners` per test store plus a bubbling event |

---

## 3. Q2: can `useAuthStatusCheckEffect` run with no `useEffect`, using only built-ins, with identical behaviour?

**Verdict: Partially.** Zero `useEffect` is achievable, and the full suite passes (Appendix B, P2).
It needs RTK's listener middleware (RTK, not strictly RTK Query) and TanStack Router's `<Navigate>`.
**The behaviour is not identical, and the code is not simpler.**

### 3.1 Effect 2 (visibility) without `useEffect`

The only built-in source of "the app became visible" is `setupListeners`. Its `onFocus` action is
then caught by a listener that applies the same freshness rule with `prefetch({ ifOlderThan })`.

- `onFocus` is **not exported** from the package entry. `rtkq/index.ts:63` exports only
  `setupListeners`. It is reachable as `api.internalActions.onFocus` (`rtkq/core/module.ts:550-555`),
  and the docs show `dispatch(api.internalActions.onFocus())`
  ([setupListeners](https://redux.js.org/toolkit/rtk-query/api/setupListeners)), so it is
  documented, but it sits in a namespace called `internalActions`.
- The listener lives for the whole lifetime of the store, not only while the layout is mounted. A
  guard on the cached `isAuthenticated === true` stands in for "the layout is mounted". Without the
  guard, every focus on `/login` (whose entry is evicted 60 s after its `subscribe: false` fetch)
  would send a request, because `prefetch` fetches whenever no `fulfilledTimeStamp` exists
  (`buildThunks.ts:1026-1030`).
- `store.ts` must import it by a deep path, `@/features/auth/model`. The `@/features/auth` barrel
  creates a cycle because `features/auth/ui/SignInForm.tsx:3` imports `@/app/store`. **(verified)**
  The suite failed to load with `authStatusListener` undefined until the import was changed.

```ts
// features/auth/model/authStatusListener.ts
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from '../api';
import { AUTH_STATUS_MAX_AGE_SECONDS } from '../constants';

type AuthApiState = Parameters<ReturnType<typeof authApi.endpoints.getStatus.select>>[0];

export const authStatusListener = createListenerMiddleware();

authStatusListener.startListening({
  actionCreator: authApi.internalActions.onFocus,
  effect: (_, { dispatch, getState }) => {
    const { data } = authApi.endpoints.getStatus.select({})(getState() as AuthApiState);

    if (data?.isAuthenticated === true) {
      void dispatch(
        authApi.util.prefetch('getStatus', {}, { ifOlderThan: AUTH_STATUS_MAX_AGE_SECONDS }),
      );
    }
  },
});

// app/store.ts: .prepend(…, authStatusListener.middleware)
// app/index.tsx: setupListeners(store.dispatch)
// tests/render/render.tsx: onTestFinished(setupListeners(store.dispatch))
```

### 3.2 Effect 1 (session end) without `useEffect`

| Candidate | Works? | Notes |
| --- | --- | --- |
| `selectFromResult` with a side effect | No | It runs during render, and the router must not be called from render. |
| `onQueryStarted` / `onCacheEntryAdded` on `getStatus` | No | The endpoint is in `features/auth` and cannot reach the router in `app/` (FSD). It would also fire on `/login`'s own `false` fetches. |
| Listener middleware on `getStatus.matchFulfilled` → `router.invalidate()` | Possible, not recommended | The router is created after the store (`app/index.tsx:22`, `tests/render/render.tsx:63-65`), so it would have to be wired in later. It needs a "an `_app` route is matched" guard, because `/login` `beforeLoad` fetches `false` → `invalidate` → `beforeLoad` again: a loop. `upsertQueryData` also goes through the query thunk, so fake `signOut` would trigger it. |
| **Render-time `<Navigate>` in `AuthenticatedLayout`** | **Yes, with care** | See below. |

```tsx
function AuthenticatedLayout() {
  const loading = useRouterState({ select: state => state.isLoading });
  const href = useRouterState({
    select: state => state.resolvedLocation?.href ?? state.location.href,
  });
  const { data } = authApi.useGetStatusQuery({}, { pollingInterval: AUTH_CHECK_INTERVAL });

  if (data?.isAuthenticated === false) {
    return <Navigate to="/login" search={{ returnUrl: href }} replace ignoreBlocker />;
  }
  // …
}
```

Pitfalls found by running it:

- **With `useLocation()` instead of `resolvedLocation` it loops until the process runs out of
  memory.** **(verified)** Prototype "naive Navigate": `FATAL ERROR: Reached heap limit` in the
  expired-session test, even with the redirect wrapped in `memo`. `useLocation` reads
  `router.stores.location` (`react-router/src/useLocation.tsx:56`), which switches to the
  **pending** `/login?returnUrl=…` while `/login` `beforeLoad` runs. The layout is still mounted
  then, so it renders `<Navigate>` again with `returnUrl=/login?returnUrl=…`, and the URL grows
  without bound.
- `<Navigate>` calls `navigate()` in a layout effect **every time its props object changes**
  (`react-router/src/useNavigate.tsx:66-78`). The layout re-renders on `isLoading`, so the redirect
  is sent several times. **(verified)** The redirect branch rendered 6 times across the 4
  session-end tests. Each send is the same replace-navigation, so the result is the same.
- On a **navigation-triggered** `false` (B3), `beforeLoad` redirects with the *target* href, while
  `<Navigate>` uses the *resolved* (old) href. The test "opening another section after the auth check
  interval…" (expects `returnUrl=/weight`) passes, so `beforeLoad` wins today, but correctness now
  depends on ordering. Today `router.invalidate()` re-runs `beforeLoad` for the pending location,
  so there is a single source of truth.
- It must pass `replace` and `ignoreBlocker` to match `beforeLoad` redirects
  (`load-client.ts:1708-1712, 1726-1730`), or the `log.food` `useBlocker` would intercept it.

### 3.3 Behaviour diff: current vs P2 (no `useEffect`)

| Behaviour | Current | P2 |
| --- | --- | --- |
| Visible, status < 1 h | No request | No request |
| Visible, status ≥ 1 h | 1 request | 1 request |
| Window `focus` without a visibility change, status ≥ 1 h | No request | **1 request** (new trigger, still gated by freshness) |
| Visibility/focus check outside `_app` (`/login`, `/post-login`, `/mcp-consent`) | Never | Only when the cached status is `true` and stale |
| Session end path | `router.invalidate()` → `_app` `beforeLoad` → redirect | `<Navigate replace ignoreBlocker>` straight to `/login`; sent several times per end |
| `returnUrl` when the end is found by a poll or visibility check | Current screen | Current screen (via `resolvedLocation`) |
| `returnUrl` when the end is found by navigation | Target screen | Target screen, but it depends on `beforeLoad` winning the race |
| Number of `/auth/status` requests on session end | 1 (`/login` `beforeLoad`) | 1 (same) |
| Polling, failure handling, `/login`, fake auth | — | Unchanged |
| Store-wide setup | none | `setupListeners` in `index.tsx` and in `renderApp`, listener middleware in the store, deep import |
| Test helper | non-bubbling event | must use `{ bubbles: true }` |
| Lines | — | +53 / −51 across 13 files (with Q3's merge) |

---

## 4. Q3: can `useAuth` and `useAuthStatusCheckEffect` be merged into one `useAuth` with no `useEffect`?

**Verdict: Partially.** A single hook with no `useEffect` works for all three call sites, **but only
on top of Q2's store-level changes** (setupListeners, listener, `<Navigate>`), and its behaviour
differs.

Call sites and what each one needs:

| Call site | Needs | Conflict with a merged hook |
| --- | --- | --- |
| `_app.tsx` `AuthenticatedLayout` | Polling, a visibility check, a redirect on `false` | — |
| `PostLoginPage` | `isAuthenticated`, `false` while loading, no redirect | Polling gets added (harmless: the page lives for seconds) |
| `PostLogoutPage` | `!isAuthenticated`, so `false` is the **expected** state | A merged hook that **redirected** on `false` would send the owner to `/login?returnUrl=/post-logout`. After signing in again they would land on `/post-logout` and be bounced to `/`. So the redirect must stay in the layout, not in the hook. |

The merged hook (**verified**: 39/39 flow and page tests, and the full suite of 47 files / 319 tests
passes with no `stderr |` blocks):

```ts
// features/auth/hooks/useAuth.ts (useAuthStatusCheckEffect.ts deleted)
interface UseAuthResult {
  isAuthenticated: boolean;
  sessionEnded: boolean;
}

export const useAuth = (): UseAuthResult =>
  authApi.useGetStatusQuery(
    {},
    {
      pollingInterval: AUTH_CHECK_INTERVAL,
      selectFromResult: ({ data }) => ({
        isAuthenticated: data?.isAuthenticated === true,
        sessionEnded: data?.isAuthenticated === false,
      }),
    },
  );

// _app.tsx:   const { sessionEnded } = useAuth(); if (sessionEnded) return <Navigate … />;
// pages:      const { isAuthenticated } = useAuth();   // was useAuth().status
```

`sessionEnded` must stay distinct from `!isAuthenticated`. `undefined` (loading, or never fetched)
must not end the session in the layout, but it must still count as "signed out" for
`PostLogoutPage` (B10).

| Behaviour | Current | Merged `useAuth` (on P2) |
| --- | --- | --- |
| Everything in the Q2 table | — | Same differences as P2 |
| `/post-login` stuck on `false` | Never re-checks | Re-checks hourly (poll). The focus listener skips it, because its guard needs a cached `true`. |
| `/post-logout` | Navigates to `/` on first render | Unchanged |
| `useEffect`s in the pages | 2 (navigate on status) | 2 (unchanged; these are outside both hooks) |

### 4.1 Closest simplification that keeps the behaviour (recommended for Q3)

Drop `useAuth` entirely instead of merging it. `/post-login` and `/post-logout` become
`beforeLoad` routes, the same pattern as `login.tsx`. That removes `useAuth`, `PostLoginPage`,
`PostLogoutPage` and their two `useEffect`s. **(verified)** 28/28 flow tests pass, `tsc` and
`eslint` are clean, and the diff is +20 / −74.

```tsx
// app/routes/post-login.tsx
export const Route = createFileRoute('/post-login')({
  validateSearch: z.object({ returnUrl: returnUrlSchema }),
  staticData: { appBar: null },
  beforeLoad: async ({ context, search }) => {
    const { data } = await context.store.dispatch(
      authApi.endpoints.getStatus.initiate({}, { subscribe: false }),
    );

    if (data?.isAuthenticated === true) {
      throw redirect({ href: search.returnUrl ?? '/' });
    }
  },
  pendingComponent: PostLoginRoute,
  pendingMs: 0,
  component: PostLoginRoute,
});

function PostLoginRoute() {
  return <AuthCallbackProgress label="Logging in..." />;
}

// app/routes/post-logout.tsx
export const Route = createFileRoute('/post-logout')({
  staticData: { appBar: null },
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
  component: PostLogoutRoute,
});

function PostLogoutRoute() {
  return <AuthCallbackProgress label="Logging out..." />;
}
```

| Behaviour | Current | `beforeLoad` routes |
| --- | --- | --- |
| `/post-login`, status `true` | `history.push(returnUrl)`; `/post-login` stays in history | `redirect` with `replace: true`, so Back skips `/post-login`. An improvement, because Back used to bounce forward again. |
| `/post-login`, status `false` | "Logging in..." forever | Same |
| `/post-login` request | 1 if nothing is cached | Same (`initiate` without `forceRefetch` reuses a cached entry, `buildThunks.ts:968-972`) |
| `/post-logout` with an empty cache (every real logout) | Navigates to `/` on first render; `_app` `beforeLoad` makes 1 request | Redirects to `/`; `_app` `beforeLoad` makes 1 request |
| `/post-logout` with a cached `true` (not reachable in practice, see B10) | "Logging out..." forever | Redirects to `/`, which shows the diary |
| `returnUrl` validation | `returnUrlSchema` | Same schema (`features/auth/lib/returnUrl.ts:4-6`) |

With that done, `features/auth/hooks` contains one hook, `useAuthStatusCheckEffect`, and the
"merge" question no longer arises.

---

## 5. Recommendation

The current `useAuthStatusCheckEffect` already uses the RTK Query built-ins that fit:
`pollingInterval`, `usePrefetch({ ifOlderThan })`, and `initiate({ forceRefetch: <seconds> })` in
`beforeLoad`. Each of the two remaining effects is a few lines, and there is no exact built-in
replacement for either:

1. **Keep effect 1** (`data === false` → `onSessionEnded` → `router.invalidate()`). The
   no-effect alternative (`<Navigate>`) only works with `resolvedLocation`, sends the redirect
   several times, makes the navigation-case `returnUrl` depend on ordering, and loops until the
   process runs out of memory with the obvious `useLocation()`. It is less robust for no reduction in code.
2. **Effect 2 depends on one product decision.**
   - If checking on **every** return to the app is acceptable, replace effect 2 with
     `refetchOnFocus: true` plus `setupListeners` (P3, §2.4). It removes about 13 lines and
     `usePrefetch`. It adds a window-`focus` trigger, calls to `setupListeners` in `index.tsx` and
     `renderApp` (2.12.0 serves one store at a time), a bubbling test event, and a rewrite of the
     one foreground test. That trades the spec's freshness rule on focus for a built-in. The
     endpoint is cheap (a cookie read; the backend contacts Google at most once an hour), so this is
     defensible, but it reverses a decision the spec recorded.
   - If the freshness rule matters, **keep effect 2**. P2 (§3.1) keeps the rule without a
     `useEffect`, but it spreads the logic across the store, `index.tsx`, the test renderer and an
     `internalActions` listener, and changes the trigger set. That costs more upkeep than the 10-line
     effect it removes.
3. **Do the §4.1 change regardless.** Moving `/post-login` and `/post-logout` to `beforeLoad`
   removes `useAuth`, two page components and two `useEffect`s (−54 lines net), matches how
   `/login` and `_app` already work, and changes only history entries (replace instead of push) and
   an unreachable `/post-logout` case.
4. Don't merge the two hooks (Q3). With §4.1 done there is nothing left to merge.

---

## 6. Sources

### RTK Query 2.12.0 source (`src/frontend/node_modules/@reduxjs/toolkit/src/query/`)

- `core/setupListeners.ts:9-13` event names; `:35` module-level `initialized`; `:73-79` visibility → `onFocus`/`onFocusLost`; `:81-114` single registration on `window`, `unsubscribe`; `:117` `customHandler`
- `core/buildMiddleware/windowEventHandling.ts:19-26` `onFocus`/`onOnline` handling; `:37` iterates subscriptions only; `:43-46` per-subscriber vs api-default resolution; `:55-57` `refetchQuery`
- `core/buildMiddleware/index.ts:146-160` `refetchQuery` = `initiate(…, { subscribe: false, forceRefetch: true })`
- `core/buildThunks.ts:885-905` `isForcedQuery` (number = seconds since `fulfilledTimeStamp`); `:924-975` thunk `condition` (pending dedupe `:946-949`, cached skip `:968-972`); `:1000-1041` `prefetch` / `ifOlderThan`
- `core/buildMiddleware/polling.ts:38-50` (re)scheduling on subscribe/fulfilled/rejected; `:78-111` `startNextPoll`; `:105` focus check; `:163-184` lowest interval, `skipPollingIfUnfocused` OR (`:175`)
- `core/buildMiddleware/cacheCollection.ts:163-176` `keepUnusedDataFor`
- `react/buildHooks.ts:1690-1697` subscription options; `:1793-1811` `initiate` only on mount or arg change (`refetchOnMountOrArgChange` at `:1798`); `:1664-1680` `usePrefetch`
- `createApi.ts:136-161` option docs; `:356-362` defaults (`keepUnusedDataFor: 60`, `refetchOn*: false`)
- `core/apiState.ts:22-26, 145-170` config and subscription option types
- `core/buildSlice.ts:676-705` `config.focused`/`online` reducers
- `core/module.ts:80-90` `PrefetchOptions`; `:550-555` `api.internalActions.onFocus` …
- `index.ts:63` public export of `setupListeners` (no `onFocus` export)
- `core/buildInitiate.ts:71-76, 386-410` `StartQueryActionCreatorOptions`, `subscribe = true` default
- `endpointDefinitions.ts`: no `refetchOnFocus`, `refetchOnMountOrArgChange` or `pollingInterval` field (`rg` finds 0 hits)

### TanStack Router source

- `@tanstack/react-router/src/useNavigate.tsx:56-80`: `<Navigate>` re-navigates in `useLayoutEffect` whenever its props identity changes
- `@tanstack/react-router/src/useLocation.tsx:56`: reads `router.stores.location` (pending location)
- `@tanstack/router-core/src/load-client.ts:1701-1735`: `beforeLoad` redirects commit with `replace: true, ignoreBlocker: true`

### Official docs (fetched 2026-11-17)

- [setupListeners](https://redux.js.org/toolkit/rtk-query/api/setupListeners): events, `customHandler`, `api.internalActions.onFocus`. It describes multi-store fan-out, which 2.12.0 does not implement.
- [Cache behavior](https://redux.js.org/toolkit/rtk-query/usage/cache-behavior): `refetchOnMountOrArgChange` ("at the time a query subscription is created"), `refetchOnFocus` ("all subscribed queries"; `createApi` plus hooks only), `keepUnusedDataFor`.
- [Polling](https://redux.js.org/toolkit/rtk-query/usage/polling): `pollingInterval`, and `skipPollingIfUnfocused` "requires `setupListeners`". The page states AND semantics; 2.12.0 implements OR.
- [API slice utils, `prefetch`](https://redux.js.org/toolkit/rtk-query/api/created-api/api-slice-utils): `ifOlderThan` in seconds against `fulfilledTimeStamp`.

### Repo

- `src/frontend/src/features/auth/hooks/{useAuthStatusCheckEffect,useAuth}.ts`, `features/auth/lib/session.ts`, `features/auth/ui/SignInForm.tsx:3`
- `src/frontend/src/app/routes/{_app,login,post-login,post-logout}.tsx`, `app/store.ts`, `app/index.tsx`, `app/router.ts`
- `src/frontend/tests/app.test.tsx`, `tests/render/render.tsx`, `tests/mockApi/auth/auth.handlers.ts`
- Commits `96ce3f76` and `793fb660`; `.scratch/auth-status-check-frequency/spec.md`

---

## Appendix A: RTK Query focus experiment

A node script against the installed `@reduxjs/toolkit@2.12.0` with jsdom. The `queryFn` endpoints
count their calls. `getStatus` is subscribed with `refetchOnFocus: true`. `other` is fetched with
`subscribe: false`, the way `beforeLoad` fetches.

```js
const s1 = makeStore();
const unsubscribe1 = setupListeners(s1.store.dispatch);
s1.store.dispatch(s1.api.endpoints.getStatus.initiate({}, { subscriptionOptions: { refetchOnFocus: true } }));
s1.store.dispatch(s1.api.endpoints.other.initiate({}, { subscribe: false }));
window.dispatchEvent(new window.Event('focus'));                                // A1
document.dispatchEvent(new window.Event('visibilitychange'));                   // A2
document.dispatchEvent(new window.Event('visibilitychange', { bubbles: true })); // A3
/* A4: both */ /* B: setupListeners(s2) without unsubscribe */ /* C: unsubscribe1(); setupListeners(s2) */
/* D: prefetch ifOlderThan 3600 vs 0.001 */
```

Observed output:

```
RTK version: "2.12.0"
A0 after initial fetch: {"getStatus":1,"other":1}
A1 after window focus (data fresh): {"getStatus":2,"other":1}
A2 after non-bubbling visibilitychange on document: {"getStatus":2,"other":1}
A3 after bubbling visibilitychange on document: {"getStatus":3,"other":1}
A4 after visibilitychange + focus together: {"getStatus":4,"other":1}
B before focus: {"s1":{"getStatus":4,"other":1},"s2":{"getStatus":1,"other":0}}
B after focus (store 1 still subscribed): {"s1":{"getStatus":5,"other":1},"s2":{"getStatus":1,"other":0}}
C after unsubscribe(store1) + setupListeners(store2) + focus: {"s1":{"getStatus":5,"other":1},"s2":{"getStatus":2,"other":0}}
D prefetch ifOlderThan=3600 on fresh data: {"getStatus":1,"other":0}
D prefetch ifOlderThan=0.001 on 20ms-old data: {"getStatus":2,"other":0}
```

Results: focus refetches fresh data (A1). `visibilitychange` must bubble to reach the `window`
listener (A2, A3). Two events at once send one request (A4). `subscribe: false` entries are never
refetched (`other` stays at 1). A second store gets no events until the first unsubscribes (B, C).
`prefetch` respects `ifOlderThan` (D).

## Appendix B: Prototypes run against the real test suite

Method: `src/frontend` was copied without `node_modules` into the session scratchpad, with
`node_modules` symlinked. A baseline `vitest run tests/app.test.tsx` passed 28/28 before any change.

| Prototype | Change | Result |
| --- | --- | --- |
| Navigate, naive | Effect 1 → `<Navigate search={{ returnUrl: useLocation().href }}>` (also with `memo`) | **Out of memory** in "an expired session…" (`returnUrl` grows recursively) |
| Navigate, `resolvedLocation` | Same, with the href from `state.resolvedLocation` | 28/28 |
| P3 | Effect 2 → `refetchOnFocus: true` + `setupListeners` + bubbling test event | 27/28. The foreground freshness test fails with `expected 1 to be +0` |
| P2 | Effect 2 → `setupListeners` + listener on `api.internalActions.onFocus` → `prefetch({ ifOlderThan })`; effect 1 → `<Navigate>` (`resolvedLocation`) | 28/28 (after the deep-import fix for the `SignInForm` → `@/app/store` cycle) |
| Q3 merge | P2 + a single `useAuth` (polling + `selectFromResult`), `useAuthStatusCheckEffect` deleted | 39/39 (`tests/app.test.tsx` + `src/pages`). **Full suite 47 files / 319 tests, 0 `stderr \|` blocks.** `tsc` clean; `eslint` clean after `--fix` (prettier and import order) |
| §4.1 routes | `/post-login` and `/post-logout` as `beforeLoad` routes; `useAuth`, `PostLoginPage` and `PostLogoutPage` deleted | 28/28, `tsc` and `eslint` clean, +20 / −74 |
