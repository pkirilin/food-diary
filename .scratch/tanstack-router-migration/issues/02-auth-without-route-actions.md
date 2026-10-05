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

**Status:** ready-for-agent

- [ ] The sign-in form, the drawer's Logout item and the periodic auth check call the auth functions. No route action or router form submission remains for auth
- [ ] The logout route and its page are deleted
- [ ] The test environment's unused sign-out timer option is deleted
- [ ] Ticket 01's sign-in, logout and session-expiry tests pass unchanged
- [ ] New app-level test: a signed-out deep link to a History month shows sign-in, and signing in lands on that month
- [ ] New app-level test: a return address that does not start with `/` is ignored, and sign-in lands on the diary
- [ ] No TanStack Router code is introduced
- [ ] Browser check with playwright-cli in MSW and fake-auth mode: sign in, Logout, and the deep-link round trip. The console shows nothing beyond the MSW-mode baseline
- [ ] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero
