# 01: Settings switch opens an empty new flow

**What to build:** A new Settings page, linked from the navigation drawer, with one switch: "Log several foods at once", marked "Stored on this device". The switch is off by default and is stored per device in localStorage through `shared/lib/devicePreferences`. If storage can't be read, it counts as off. `MealsListItem` reads the preference: off renders the old `AddNoteButton` exactly as today, on renders `MultiItemLogFood` from the new `features/logFood` slice. **Add <meal>** then starts a Meal Draft for that date and Meal in the new `entities/foodLog` slice and opens `/log/food`. That screen has the `'search'` AppBar variant (back arrow and search field, no camera yet) and shows product search results. See the spec's "Frontend architecture (FSD)", "State", "Routes", "Entry and setting", "AppBar" and "Search screen" sections.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The drawer links to a Settings page with the switch and its "Stored on this device" hint
- [x] The switch is off by default and keeps its value across a reload
- [x] When localStorage is unavailable or throws, the switch reads as off and the app doesn't crash
- [x] With the switch off, **Add <meal>** opens the old dialog, and its existing tests still pass
- [x] `entities/foodLog/model/foodLogSlice.ts` exists with store key `foodLog`, state `{ mealDraft }`, its own `MealType`, and `mealDraftStarted`. It imports no other entity (ADR-0007)
- [x] `MultiItemLogFood` is exported under that name from `features/logFood`. `features/manageNote` imports nothing from `entities/foodLog` or `features/logFood`
- [x] With the switch on, **Add <meal>** dispatches `mealDraftStarted({ date, mealType })` and the `_app/index.tsx` route navigates to `/log/food` through an `onOpenLogFood` callback passed down `IndexPage` → `MealsList` → `MealsListItem`. Date and Meal are not in the URL
- [x] Starting a Meal Draft replaces any previous one, so the flow always opens empty
- [x] Opening any `/log/food` URL with no Meal Draft in the store (e.g. after a reload) redirects to the day page
- [x] `AppBarConfig` gains the `'back'` and `'search'` variants. The back arrow goes back in history, falling back to `/`
- [x] The search field sits in the AppBar, filling it on a phone and with a capped width from `sm` up. It is focused on open, and its value is the typed, schema-validated `q` search param, updated with `replace`
- [x] Results show each product's name, default quantity and calories. `searchProducts` has moved to `entities/product/lib`
- [x] Route files and AppBar slots are thin adapters over router-agnostic pages and features (ADR-0005)
- [x] `multiItemFoodLogging.test.tsx` exists and covers both switch states and the no-draft redirect through `renderApp`
- [x] `routeTree.gen.ts` is regenerated and committed
