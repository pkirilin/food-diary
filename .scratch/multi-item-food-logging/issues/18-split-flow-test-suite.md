# 18: Keep happy paths in the flow suite and move edge cases to component tests

**What to build:** `src/frontend/tests/multiItemFoodLogging.test.tsx` holds 80 `renderApp` tests in 1.5K+ lines, and most of them check one component's rule. That breaks `.claude/rules/frontend.md` (Testing, first bullet): a component's own rule goes in a colocated `<Component>.test.tsx` that uses `render`. Shrink the flow suite to happy paths plus the edge cases that only the router can reproduce. Move every other test to the colocated test of the component that owns the rule. The suite's speed is already handled by commit `347dda86` (84s to 38s) and is not a goal of this ticket.

**Blocked by:** None

**Status:** resolved

## Decisions

### Settings tests get their own file

The three tests about the **Log several foods at once** switch (off by default via the drawer link, kept across a reload, off when device storage throws) move to `src/frontend/tests/settings.test.tsx`, with their own helpers.

### Other tests seed the preference

Tests outside `settings.test.tsx` no longer open the flow through Settings → drawer → Today (`openDayPageWithMultiItemFoodLoggingOn`). They write `devicePreferences.multiItemFoodLogging = 'true'` to `localStorage` and call `renderApp('/', { signedIn: true })`.

### `render` accepts a store

`@tests/render`'s `render` takes an optional `store`. A component test that needs a Meal Draft calls `configureStore()` and dispatches `foodLogModel.actions.mealDraftStarted` plus the picked Food Logs through the real reducers, then renders. When no store is given, `render` keeps building its own.

### What stays in the flow suite

**Happy paths:** one test per user goal. Every request succeeds, and the user does what each screen invites:

1. Pick several products and log them, in the order picked, after the Meal's existing Food Logs
2. Create a product that was not found, then log it
3. Recognize a product from a photo, then log it
4. Open a product, type a quantity, then log it
5. Change a quantity from a tray row, then log it
6. Edit a product while it is in the Meal Draft, then log it
7. Edit a product outside the Meal Draft: search, open the product, change its default quantity and/or name, then log the changed product
8. Leave with a non-empty Meal Draft and discard it

**Edge cases only the router can reproduce:**

- Log food returns to the day page's history entry, so the scroll position is restored. The day page also shows the logged Food Logs right away.
- The browser's back button asks to discard
- Searching again after picking a product stays in the flow without asking
- Going forward to the recognition screen or the product form after leaving it (no second request, saved values, lands on the search)
- Leaving while recognition runs aborts it
- Photos left after a failed recognition are forgotten after the Meal Draft is logged or discarded
- Opening the search screen with no Meal Draft lands on the day page
- Typing in the search does not re-check the auth status
- Add breakfast focuses a text input during the tap, then hands the focus to the search field. The focus crosses from the day page to the search route.
- The back arrow returns from the search screen to the day page, however much was typed
- Leaving the flow with an emptied Meal Draft does not ask
- Cancel on the discard prompt stays on the search screen with the Meal Draft intact
- A new meal opens with an empty Meal Draft after a previous meal was logged
- The back arrow returns from a product to an empty search with the Meal Draft unchanged
- The back arrow leaves the keyboard alone
- The full-size picked photo stays available until the recognition screen is left

### Everything else moves

Every other edge case moves to the colocated test of the component that owns the rule, for example `MealDraftTray.test.tsx`, `DiscardMealDraftDialog.test.tsx`, `FoundProductListItem.test.tsx`, `CreateProductForm.test.tsx`, `EditProductForm.test.tsx`, `FoodLogQuantityForm.test.tsx`, `RecognizeProductForm.test.tsx`, `LogFoodSearchField.test.tsx` and `LogFoodSearchResults.test.tsx`. That covers:

- failures and retries
- name clashes
- validation
- empty and not-found states
- singular wording
- tray toggling and collapsing
- fast typing
- the focus handoffs that stay within one form

The two "with the switch off, Add breakfast opens the old dialog" tests (empty and throwing device storage) move to `src/widgets/MealsList/ui/MealsListItem.test.tsx`.

A moved test is deleted from the flow suite, with no second copy kept.

### The rule is written down

`.claude/rules/frontend.md`, Testing, first bullet, gains: *"A flow suite keeps one test per happy path; an edge case goes to its component's colocated test unless only the router can reproduce it."*

## Acceptance criteria

- [x] `tests/settings.test.tsx` holds the three switch tests with its own helpers, and `multiItemFoodLogging.test.tsx` has none of them
- [x] No test outside `settings.test.tsx` opens the flow through the Settings page
- [x] `render` takes an optional `store`, and moved tests use it to start with a Meal Draft
- [x] `multiItemFoodLogging.test.tsx` holds exactly the 8 happy paths and the router-only edge cases listed above
- [x] Every other former flow test exists once, in a colocated component test, with the same behaviour asserted
- [x] The two old-dialog tests live in `MealsListItem.test.tsx`
- [x] `.claude/rules/frontend.md` states the flow-suite rule
- [x] `yarn test --run --reporter=verbose` passes, with no `stderr |` blocks
- [x] Lint and type-check pass
