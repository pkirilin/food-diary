# 02 — Sign in and out without route actions, returning to the opened screen

**What to build:** Signing in, Logout and an expired session work as they do today. They now go through two plain functions in the auth feature, a sign-in that takes a return address and a sign-out, instead of route actions submitted through the router. TanStack Router has no route actions ([ADR-0004](../../../docs/adr/0004-tanstack-router-for-typed-route-metadata.md)). In the same change, "return to where I was" starts working: a signed-out owner who opens a deep link signs in and lands on that screen. This is a behaviour change, so the PR description must call it out.

Context worth knowing before starting:
- **Why "return to where I was" never worked.** There are two bugs:
  - The auth gate reads `returnUrl` from the current URL's search params instead of using the current location.
  - The post-login screen reads a path param that does not exist.
- **What the API does with `returnUrl`.** It always nests `returnUrl` inside the app's own hash fragment, as the post-login screen's search. Only in-app paths matter, so any value that does not start with `/` is dropped.
- **How the two functions behave in each mode.**
  - With fake auth:
    - sign-in signs in the fake user, then navigates to the return address;
    - sign-out signs out the fake user and opens the sign-in screen.
  - Otherwise:
    - sign-in sends the browser to the API login endpoint with the return address;
    - sign-out sends the browser to the API logout endpoint, which redirects to post-logout.
- **The logout route has no screen.** Typing its address today shows an empty screen and does not sign out.

This ticket stays on React Router. See the [spec](../spec.md), *Auth*.

**Blocked by:** 01 — App-level regression tests on today's router

**Status:** resolved

- [x] The sign-in form, the drawer's Logout item and the periodic auth check call the auth functions. No route action or router form submission remains for auth
- [x] The logout route and its page are deleted
- [x] The test environment's unused sign-out timer option is deleted
- [x] Ticket 01's sign-in, logout and session-expiry tests pass unchanged
- [x] New app-level test: a signed-out deep link to a History month shows sign-in, and signing in lands on that month
- [x] New app-level test: a return address that does not start with `/` is ignored, and sign-in lands on the diary
- [x] No TanStack Router code is introduced
- [x] Browser check with playwright-cli in MSW and fake-auth mode: sign in, Logout, and the deep-link round trip. The console shows nothing beyond the MSW-mode baseline
- [x] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero

## Comments

### Behaviour changes for the PR description

- **Signing in returns the owner to the screen they opened.** A signed-out deep link goes to sign-in, and signing in lands on that screen. With fake auth this happens directly. After a Google sign-in it happens through post-login, which now reads `returnUrl` from its search.
- **A return address that is not an in-app path is ignored, and sign-in lands on the diary.** Not an in-app path means: it does not start with `/`, or it starts with `//` or `/\`.
- **`/#/logout` no longer exists.** Typing it used to show an empty screen without signing out. On today's router it now behaves like any other unknown address, which is React Router's default 404 screen. Ticket 05 turns that into "Page not found".

### Notes for later tickets

- **Signatures.** The functions are `signIn(returnUrl, navigate)` and `signOut(navigate)`, where `navigate` takes an in-app href. The spec's *Auth* section now matches. `SignInForm` takes `returnUrl` and `navigate`, and `useAuthStatusCheckEffect` takes `navigate`, so the auth feature no longer imports the router. At the cut-over, callers can pass `router.history.push`, which accepts a full href with search.
- **The in-app check rejects `//` and `/\` as well.** React Router's memory router throws "External navigation is not allowed" on `//example.com`. The TanStack `returnUrl` schema should keep the same rule.
- **`returnUrl` query strings are built with `URLSearchParams`, not `createUrl`.** `createUrl` uses `encodeURI`, which leaves the `?` and `&` inside a return address unencoded.
- **One test beyond the two listed:** post-login lands on the return address. Fake auth never visits post-login, so without this test the post-login fix would have no automated check.
- **The login and post-login pages still read search params through React Router.** Tickets 03 and 05 move that into route adapters.
- **The real Google round trip is unverified,** because the browser check used fake auth. Ticket 08 covers it.
