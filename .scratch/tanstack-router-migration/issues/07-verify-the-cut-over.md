# 07 — Verify the cut-over end to end

**What to build:** Confirm that the finished branch behaves correctly for the owner: in a real browser, as an installed PWA, as the GitHub Pages demo served from a subpath, and through the E2E suite. Also confirm that the first load is no heavier than before. Then write the PR description. Opening the PR is the owner's decision.

Context worth knowing before starting:
- **What fake auth cannot cover.** MSW and fake-auth mode skip the real backend redirects. The real Google sign-in round trip is ticket 08, done by the owner.
- **The E2E suite needs a running Docker daemon.** If Docker is not available, stop and ask the owner how to proceed. Never skip the suite or work around it.
- **The baseline build size** is recorded under `## Comments

The PR description is drafted in [`../pr-description.md`](../pr-description.md). It holds the verification report, the build-size table and what was not verified. Once the PR is open, its GitHub body becomes the copy to keep up to date.

### For the owner

- **The first load is 2.36 kB gzip heavier, which misses user story 26.** The PR description says this plainly. Merging means accepting the extra size.
- **The spec's first acceptance item is still unticked.** It says each commit passes build, lint, format check and tests on its own, and it still counts six commits where the branch now has ten. This ticket checked only the branch head.

### Notes from the checks

- **How the update banner was checked.** MSW mode cannot show the banner, so it was checked on a plain production build, served statically with the auth status mocked in the browser.
- **A reload in the demo signs the owner out.** `VITE_APP_FAKE_AUTH_LOGIN_ON_INIT` is `false` there, and the mock session lives in memory. This is expected.
- **The active drawer item ignores clicks** (`pointer-events: none`), as on `main`. A script that clicks it times out.
- **Spec items ticked beyond this ticket's list.** No React Router remains, which a search of `src/frontend` confirmed. The seam-1 tests pass in the verbose run. `CLAUDE.md` and the frontend rules describe the router and the route-component exception. The CI staleness check failed both times it was run against a stale route tree.
