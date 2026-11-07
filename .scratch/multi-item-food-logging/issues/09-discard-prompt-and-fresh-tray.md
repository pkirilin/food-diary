# 09: Discard prompt when leaving the flow

**What to build:** Leaving `/log/food/*` while the Meal Draft has products asks `Discard N food logs?`. This covers the AppBar back arrow and the browser's back button. Leaving with an empty Meal Draft, or right after a successful **Log food**, doesn't ask. Moving between the flow's own routes (search, detail, edit, create, recognition) never asks. A fresh Meal Draft on entry is already handled by `mealDraftStarted` (ticket 01). See the spec's "Leaving the flow" section.

**Blocked by:** 03

**Status:** resolved

- [x] Leaving the flow with a non-empty Meal Draft shows `Discard N food logs?`, with the current count
- [x] Confirming dispatches `mealDraftDiscarded` and leaves. Cancelling stays, with the Meal Draft intact
- [x] No prompt when the Meal Draft is empty, or after `mealDraftLogged`
- [x] Moving between the flow's routes never prompts
- [x] The prompt uses the router's navigation blocker, in the `/log/food` layout route
- [x] `multiItemFoodLogging.test.tsx` covers prompting, confirming, cancelling and an empty-draft exit
