# 08 — Owner: real Google sign-in returns to the deep link

**What to build:** Nothing. This is a manual check for the owner. With fake auth the app skips the backend's sign-in redirect, so only a real Google sign-in can show that the return address makes the whole round trip:

1. The return address is carried through the API's login endpoint and Google.
2. The API sends the browser back to post-login with the return address.
3. The app sends the owner to the screen they opened.

Run it on the local full stack built from source. It is served at `https://localhost:8080` and uses the E2E environment file.

**Blocked by:** 05 — Cut over to TanStack Router

**Status:** ready-for-human

- [ ] Signed out, open a deep link to a History month, sign in with Google, and land on that month
- [ ] Log out from the drawer. The browser goes through the API logout and ends on the sign-in screen
- [ ] The result goes under `## Comments` in this ticket, and the owner item in the spec's acceptance checklist is ticked
