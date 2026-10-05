# 07 — Verify the cut-over end to end

**What to build:** Confirm that the finished branch behaves correctly for the owner: in a real browser, as an installed PWA, as the GitHub Pages demo served from a subpath, and through the E2E suite. Also confirm that the first load is no heavier than before. Then write the PR description. Opening the PR is the owner's decision.

Context worth knowing before starting:
- **What fake auth cannot cover.** MSW and fake-auth mode skip the real backend redirects. The real Google sign-in round trip is ticket 08, done by the owner.
- **The E2E suite needs a running Docker daemon.** If Docker is not available, stop and ask the owner how to proceed. Never skip the suite or work around it.
- **The baseline build size** is recorded under `## Comments` in ticket 01.

See the [spec](../spec.md), *Acceptance Checklist* and *Behaviour changes to call out in the PR description*.

**Blocked by:** 06 — One heading per screen

**Status:** ready-for-agent

- [ ] Browser check with playwright-cli in MSW and fake-auth mode:
  - [ ] Every drawer link opens its screen, the active item is correct (the diary item only on the diary), and the drawer closes.
  - [ ] Deep links to a History month, to a diary date, and to post-login with a return address each open the right screen.
  - [ ] Refreshing each screen keeps it.
  - [ ] Browser back and forward work.
  - [ ] An unknown address shows "Page not found".
  - [ ] A signed-out deep link redirects to sign-in, then returns to the deep link.
  - [ ] The date switcher and the History filter work.
  - [ ] The progress bar shows on navigation, and the full-screen loader shows on first load only.
  - [ ] The console shows nothing beyond the MSW-mode baseline.
- [ ] In a production preview with the service worker, the update banner still appears
- [ ] A demo-style build (MSW and fake auth) served from a subpath works
- [ ] The E2E suite passes
- [ ] The gzip totals of the production build output are compared with ticket 01's baseline, and both are recorded in the PR description
- [ ] The PR description lists every behaviour change from the spec, and links ADR-0004 and ADR-0005
- [ ] The spec's acceptance checklist is ticked for every item verified here
