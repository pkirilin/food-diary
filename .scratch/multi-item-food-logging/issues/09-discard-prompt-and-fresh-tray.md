# 09: Discard prompt and a fresh tray on entry

**What to build:** Leaving the flow while the tray has items asks `Discard N selected?`. This covers the AppBar back arrow, the drawer and the browser's back button. Leaving with an empty tray, or right after a successful **Log foods**, doesn't ask. Each time the flow is opened, the tray starts empty. Moving between the flow's own routes (search, detail, create, recognition) never asks. See the spec's "Routes and state" section.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Leaving the flow with a non-empty tray shows `Discard N selected?`, with the current count
- [ ] Confirming leaves and empties the tray. Cancelling stays, with the tray intact
- [ ] No prompt when the tray is empty, or after a successful **Log foods**
- [ ] Moving between the flow's routes never prompts
- [ ] Opening the flow again starts with an empty tray
- [ ] The prompt uses the router's navigation blocker
- [ ] `multiItemFoodLogging.test.tsx` covers prompting, confirming, cancelling and an empty-tray exit
