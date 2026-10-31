# 01: Settings switch opens an empty new flow

**What to build:** A new Settings page, linked from the navigation drawer, with one switch: "Log several foods at once", marked "Stored on this device". The switch is off by default and is stored per device in localStorage. If storage can't be read, it counts as off. With the switch on, **Add <meal>** on the day page opens the new flow's search route for that date and Meal. That screen is titled after the Meal and date, has a back arrow in the AppBar, and shows product search results. With the switch off, **Add <meal>** opens the old `NoteInputDialog` exactly as it does today. See the spec's "Routes and state", "Entry and setting" and "Search screen" sections.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The drawer links to a Settings page with the switch and its "Stored on this device" hint
- [ ] The switch is off by default and keeps its value across a reload
- [ ] When localStorage is unavailable or throws, the switch reads as off and the app doesn't crash
- [ ] With the switch off, **Add <meal>** opens the old dialog, and its existing tests still pass
- [ ] With the switch on, **Add <meal>** navigates to the search route, with the date and Meal as typed, schema-validated search params
- [ ] The search screen's AppBar uses a new `'back'` variant, and the back arrow returns to the day page
- [ ] The search field is focused on open, and results show each product's name, default quantity and calories
- [ ] The route file is a thin adapter over router-agnostic feature UI (ADR-0005)
- [ ] `multiItemFoodLogging.test.tsx` exists and covers both switch states through `renderApp`
- [ ] `routeTree.gen.ts` is regenerated and committed
