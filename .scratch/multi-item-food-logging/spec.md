# Spec: Multi-item food logging

Status: ready-for-agent

Vocabulary: [GLOSSARY.md](../../GLOSSARY.md). **Food Log**, **Product**, **Meal**, **Meal
Draft**, **Log** and **Create** are used with exactly those meanings. "Note" appears only
where it names existing code or API (`NoteInputDialog`, `/api/v1/notes`). "Tray" names a UI
component only, never state. The word "plate" is not used anywhere in code or UI.

Background: [research.md](research.md). The design was settled with a throwaway prototype of three
variants, kept on the `prototype/multi-item-food-logging` branch (commit `e5bd584e`). Variant B won,
with variant A's editable quantity field later moved out of the tray into the detail route.
Ticket 11 removes these prototype references once the feature is built.

Two requirements from the original issue frame the whole design:

- The new flow is opt-in, and only the owner turns it on. The old dialog and the new flow live
  side by side.
- Every screen of the new flow is a route, not a dialog, and no state records which screen is
  active (no `activeScreen`). See ADR-0004 and ADR-0005.

## Problem Statement

Logging a meal takes one full round trip per product: tap **Add breakfast**, search, pick a
product, keep or change the quantity, tap **Add**, and the dialog closes. A breakfast of four
products means opening the dialog four times. Creating a missing product or recognising one from a
photo sits in the same one-at-a-time loop. Most of the time the default quantity is right, so most
of those taps are overhead.

## Solution

An opt-in, per-device flow for logging several foods in one go. **Add breakfast** starts a Meal
Draft and opens a search screen, with the search field in the AppBar. ⊕ next to a product adds it
to the Meal Draft with its default quantity, then clears the search and keeps it focused, ready
for the next product. A tray along the bottom of the screen, headed with the Meal's name, shows
the Meal Draft and one **Log food** button that saves it in one request. Tapping a product's name,
in the results or on the tray, opens a detail screen to set its quantity, remove it, or edit the
Product itself. A product that doesn't exist yet can be created from the search
(`Create "<query>"`) or from a photo, and comes back already in the Meal Draft. Every screen is a
route, so the back button and the AppBar behave like a native app. The old dialog stays: a switch
on a new Settings page chooses between the two flows on each device.

## User Stories

### Turning the flow on

1. As the owner, I want a Settings page in the navigation drawer, so that I can find the switch for the new flow.
2. As the owner, I want a "Log several foods at once" switch on that page, so that I can opt in to the new flow.
3. As the owner, I want the switch to be off by default, so that nothing changes until I choose it.
4. As the owner, I want the switch to say it is stored on this device, so that I'm not surprised when my other device still shows the old dialog.
5. As the owner, I want the switch to keep its value after a reload, so that I don't have to turn it on again.
6. As the owner, I want **Add breakfast** (and the button for every other Meal) to open the new flow when the switch is on, so that the entry point stays where I expect it.
7. As the owner, I want **Add breakfast** to open the old dialog when the switch is off, so that I can go back to the flow I know.

### Searching and picking

8. As the owner, I want the search field in the AppBar, so that the results and the tray get the rest of a phone screen.
9. As the owner, I want the search field focused when the screen opens, so that I can start typing straight away.
10. As the owner, I want each search result to show the product's name, default quantity and calories, so that I can pick the right one.
11. As the owner, I want a ⊕ button on each result, so that I can add a product to the Meal Draft with one tap.
12. As the owner, I want ⊕ to use the product's default quantity, so that the common case needs no typing.
13. As the owner, I want the search to clear and keep its focus after ⊕, with the phone keyboard staying open, so that I can type the next product at once.
14. As the owner, I want a product in the Meal Draft to look selected in the results, so that I can see what I've already picked.
15. As the owner, I want ⊕ on a product already in the Meal Draft to take it out, so that a mis-tap is undone by tapping again.
16. As the owner, I want tapping a product's name to open its detail screen, so that I can set a quantity before adding it.
17. As the owner, I want my search query back when I return from a detail screen, so that I can carry on where I was.

### Detail screen

18. As the owner, I want the detail screen to show the product's name and its calories per 100 g, so that I know what I'm editing.
19. As the owner, I want a focused quantity field with its contents selected, so that I can type a new quantity straight away.
20. As the owner, I want to see the calories for the quantity I type, so that I can judge the portion.
21. As the owner, I want quantities outside the allowed range (10–1000 g) to be refused on the detail screen, so that the Meal Draft never holds an invalid quantity.
22. As the owner, I want to add a product to the Meal Draft from its detail screen with the quantity I typed, so that I can log a non-default portion.
23. As the owner, I want to change the quantity of a product already in the Meal Draft from its detail screen, so that I can fix a portion.
24. As the owner, I want a **Remove** action on the detail screen of a product in the Meal Draft, so that I can take it out from there too.
25. As the owner, I want an **Edit product** action on the detail screen, so that I can fix a product's name, nutrition values, default quantity or category without leaving the flow.
26. As the owner, I want **Edit product** to save the Product straight away, so that the fix applies everywhere, not only to this meal.
27. As the owner, I want a product in the Meal Draft to take the edited name, nutrition values and new default quantity after I save the Product, so that the tray matches what I just saved.
28. As the owner, I want the back arrow to return me to the search with my Meal Draft intact, so that looking at a product never loses my picks.

### Tray

29. As the owner, I want the tray to be headed with the Meal's name, so that I know where the Food Logs will go.
30. As the owner, I want the tray to show how many products I've picked and their total calories, so that I see the meal at a glance.
31. As the owner, I want the collapsed tray to take a single row, so that it leaves room for search results on a phone.
32. As the owner, I want to expand the tray to see every picked product with its quantity and calories, so that I can review the meal before logging it.
33. As the owner, I want tapping a product on the tray to open its detail screen, so that I can change its quantity there.
34. As the owner, I want to delete a product from the tray, so that I can drop something I won't eat.
35. As the owner, I want the tray to keep products in the order I picked them, so that the logged meal reads the way I built it.
36. As the owner, I want **Log food** to be disabled while the Meal Draft is empty, so that I can't log nothing.

### Creating a product

37. As the owner, I want a `Create "<query>"` row when the search finds nothing, so that I can add a product that's missing.
38. As the owner, I want it to open the product form with the name prefilled from my query, so that I don't type it twice.
39. As the owner, I want the form's button to say **Create**, so that it's clear this makes a Product, not a Food Log.
40. As the owner, I want a created product to land in the Meal Draft with its default quantity, and to return me to the search, so that I can carry on picking.
41. As the owner, I want a name clash to show an error on the form and keep my input, so that I can rename and retry.

### Recognising a product from a photo

42. As the owner, I want a camera action in the search screen's AppBar, so that I can log a product I photographed.
43. As the owner, I want to pick one or several photos, so that I can show the product from more than one angle.
44. As the owner, I want a recognition screen that shows skeletons while recognition runs, so that I know it's working.
45. As the owner, I want a **Retry** when recognition fails, so that a flaky request doesn't send me back to the start.
46. As the owner, I want the recognition screen to show the product form prefilled from the first suggestion, with the recognised quantity as the default quantity, so that I only review and correct it.
47. As the owner, I want **Create** there to create the Product, add it to the Meal Draft and return me to the search, so that photo logging fits the same loop.
48. As the demo visitor, I want the camera action to work in demo mode and return a mock product, so that I can try the whole flow without a backend.

### Logging and leaving

49. As the owner, I want **Log food** to save the whole Meal Draft in one request, so that either the meal is logged or nothing is.
50. As the owner, I want a failed save to keep the Meal Draft as it was and show an error, so that I can retry without picking again.
51. As the owner, I want a successful save to return me to the day page with the new Food Logs listed under the Meal, so that I see the result.
52. As the owner, I want the new Food Logs to appear after the Meal's existing ones, in the order I picked them, so that earlier entries keep their place.
53. As the owner, I want a `Discard N food logs?` prompt when I leave the flow with a non-empty Meal Draft, so that I don't lose picks by accident.
54. As the owner, I want to leave without a prompt when the Meal Draft is empty, so that backing out costs nothing.
55. As the owner, I want the Meal Draft to be empty the next time I open the flow, so that a previous meal never leaks into the next.
56. As the owner, I want a reload inside the flow to take me back to the day page, so that I never see a flow screen with no Meal to log to.
57. As the owner, I want the flow to work equally on a phone and a desktop browser, so that I can log wherever I am.

## Implementation Decisions

### Frontend architecture (FSD)

New and changed code, by layer. "Moved" means moved, not copied: the old location imports from
the new one.

| Layer / slice | Segment | Change |
|---|---|---|
| `shared/lib` | `devicePreferences` | **New.** localStorage reader and writer for "Log several foods at once". Reads fall back to off if storage is unavailable or throws. |
| `shared/lib` | `image` | **Moved** from `features/manageNote`: the `Image` type and the `File` → `Image` conversion. |
| `shared/ui` | image picker | **New**, split out of `manageNote`'s `UploadImagesButton`: a multi-file picker that calls `onPick(images: Image[])` and knows nothing about recognition. |
| `entities/foodLog` | `model` | **New entity slice.** `foodLogSlice.ts` (the Meal Draft), its own `MealType`, `MealDraftProduct`, and the calorie and nutrition rules, with unit tests. Imports no other entity ([ADR-0007](../../docs/adr/0007-food-log-entity-imports-no-other-entity.md)). |
| `entities/note` | `api` | **Changed.** `createNotes` mutation for `POST /api/v1/notes/batch` and its `CreateNotesRequest` contract. It invalidates the notes queries for the date. |
| `entities/product` | `lib` | **Moved** `searchProducts` here from `features/manageNote/lib`, because both features use it. |
| `features/logFood` | `ui`, `lib`, `model` | **New feature slice.** `MultiItemLogFood` (the entry button), search results with ⊕, the search field, the tray, the quantity form, create, edit and recognise, mappings between `foodLog` and `note`/`product` types, `useLogMealDraft`, and the `recognitionPhotos` slice in `model`. |
| `features/manageNote` | `ui` | **Changed.** `UploadImagesButton` becomes a wrapper around the shared picker that does its own recognition. Its imports follow the moves above. Behaviour unchanged. |
| `widgets/MealsList` | `ui` | **Changed.** `MealsListItem` reads the preference and renders `AddNoteButton` (off) or `MultiItemLogFood` (on). It passes an `onOpenLogFood(mealType)` callback through from `MealsList`. |
| `widgets/Navigation` | `model`, `ui` | **Changed.** `'back'` and `'search'` AppBar variants, and a Settings link in the drawer. |
| `pages/ui` | — | **New.** `SettingsPage`, `LogFoodSearchPage`, `LogFoodProductPage`, `LogFoodEditProductPage`, `LogFoodCreateProductPage`, `LogFoodRecognitionPage`. |
| `pages/ui` | `IndexPage` | **Changed.** Passes `onOpenLogFood` to `MealsList`. |
| `app/routes` | — | **New.** `_app/settings.tsx` and the `/log/food` routes below, with their AppBar slot adapters (`-SearchSlot`, `-CameraSlot`). `_app/index.tsx` supplies `onOpenLogFood`. |
| `app` | `store.ts` | **Changed.** Registers the `foodLog` and `recognitionPhotos` reducers. |

`MultiItemLogFood` is exported under that name, not aliased on import. `features/manageNote`
doesn't depend on `entities/foodLog` or `features/logFood`.

### State

- Redux organises state by data type, never by component. The flow's state is named after the
  Meal Draft, so replacing the tray with a review route or a bottom sheet doesn't touch it.
- `entities/foodLog/model/foodLogSlice.ts`, with slice name and store key `foodLog`:

  ```ts
  interface FoodLogState {
    mealDraft: MealDraft | null;
  }

  interface MealDraft {
    date: string;
    mealType: MealType; // foodLog's own enum, mapped to and from noteModel.MealType
    foodLogs: { product: MealDraftProduct; quantity: number }[]; // in the order picked
  }

  interface MealDraftProduct {
    id: number;
    name: string;
    defaultQuantity: number;
    calories: number; // the nutrition values are per 100 g
    protein: number | null;
    fats: number | null;
    carbs: number | null;
    sugar: number | null;
    salt: number | null;
  }
  ```

- Actions: `mealDraftStarted({ date, mealType })` (replaces any existing Meal Draft),
  `foodLogAdded({ product, quantity })` (⊕ passes the default quantity), `foodLogQuantityChanged({ productId,
  quantity })`, `foodLogRemoved(productId)`, `productUpdated(product)` (refreshes the snapshot
  and sets the quantity to the new default quantity), `mealDraftDiscarded`, `mealDraftLogged`.
  ⊕ dispatches `foodLogAdded` or `foodLogRemoved`, depending on whether the product is already
  in the Meal Draft.
- Selectors cover what the UI needs: the Meal Draft, whether a product is in it, the count, and
  the total calories.
- The Meal Draft only ever holds valid whole-number quantities within 10–1000. Quantities are
  typed and validated on the detail route's form, never on the tray.
- The Meal Draft is not persisted. A reload empties it.
- `features/logFood/model` holds a separate `recognitionPhotos: Image[]` slice: the photos picked
  for recognition. They aren't Food Log data, and only this feature uses them. They are cleared
  when recognition succeeds and on `mealDraftDiscarded` and `mealDraftLogged`. Request status
  lives in RTK Query, not in either slice.

### Routes

- The flow is a set of routes under the existing app layout, not a dialog. The router owns which
  screen is shown. Redux owns the Meal Draft.
- Date and Meal live only in the Meal Draft, never in the URL. The URL carries only what selects
  a screen:

  | Path | Screen | Params |
  |---|---|---|
  | `/log/food` | layout: guard and discard blocker | — |
  | `/log/food/` | search | `q` (search query, optional) |
  | `/log/food/products/$productId` | product detail | `productId` |
  | `/log/food/products/$productId/edit` | edit product | `productId` |
  | `/log/food/products/new` | create product | `name` (prefill, optional) |
  | `/log/food/recognition` | recognise a product from photos | — |

  The `/log/food` prefix leaves room for `/log/weight` and others later. There is no `/log` route.
- The `/log/food` layout's `beforeLoad` redirects to the day page when the store holds no Meal
  Draft, which is what happens after a reload. The recognition route also redirects to the
  search when there are no `recognitionPhotos`.
- Search params are typed and schema-validated. `q` is updated with `replace`, so typing doesn't
  add history entries.
- Following ADR-0005, route files and AppBar slots are thin adapters. Pages and features take
  plain values and callbacks, such as `onBack`, `onOpenProduct(productId)` or
  `onQueryChange(q)`.

### Entry and setting

- A new Settings route, linked from the navigation drawer, renders one switch for the
  preference, with a "Stored on this device" hint.
- `MealsListItem` reads the preference. When it is off, it renders `AddNoteButton` and
  `NoteInputDialog` exactly as today. When it is on, it renders `MultiItemLogFood`: the same
  **Add <meal>** button, which dispatches `mealDraftStarted({ date, mealType })` and calls
  `onOpenLogFood`. The `_app/index.tsx` route navigates to `/log/food`. The button doesn't wait
  for the notes query, because the server assigns display order.
- Editing an existing Food Log (`EditNote`) is unchanged.

### AppBar

- `AppBarConfig` becomes a union:

  ```ts
  type AppBarConfig =
    | { variant: 'menu'; title: Title; Actions?: ComponentType } // existing
    | { variant: 'back'; title: Title; Actions?: ComponentType } // detail, edit, create, recognition
    | { variant: 'search'; Search: ComponentType; Actions?: ComponentType }; // the search route
  ```

- `'back'` and `'search'` show a back arrow instead of the burger. The back arrow goes back in
  history, falling back to `/` when there is no in-app history (`router.history.canGoBack()`).
  `Navigation` may use the router (navigation widgets are the ADR-0005 exception), but it never
  reads the Meal Draft.
- The search route's AppBar is: back arrow, then the search field, then the camera action. It
  adapts MUI's [App bar with a primary search field](https://mui.com/material-ui/react-app-bar/#app-bar-with-a-primary-search-field)
  to the project. The field fills the bar on a phone and has a capped width from `sm` up. It
  has no title text, because the tray carries the Meal's name.
- Nested routes use `'back'` with a short static title: **Product** (detail), **Edit
  product**, **New product** and **Recognize product**.

### Search screen

- It reuses the product search query and its minimum query length, through `searchProducts`
  in `entities/product/lib`.
- The search field (`-SearchSlot`) and the results (the page) are separate trees that share the
  query through `q`.
- ⊕ calls `preventDefault` on `mousedown`, so the search field never loses focus and a phone's
  keyboard stays open. ⊕ then clears `q`. The search field's `autoFocus` covers opening the
  screen. No ref crosses between the slot and the page.
- The ⊕ buttons are labelled `Add <name>` and `Remove <name>`.
- `Create "<query>"` replaces the overloaded `Add "<query>"` wording for the new flow, and
  navigates to `/log/food/products/new?name=<query>`. The old dialog's copy is left as it is.
- The camera action (`-CameraSlot`) wraps the shared image picker. On pick, it stores the
  photos in `recognitionPhotos` and navigates to the recognition route.

### Tray

- `MealDraftTray` in `features/logFood/ui`. It sits fixed along the bottom of the search screen
  and never covers results or buttons: the page reserves room for the collapsed tray.
- Collapsed, it is one row: a count badge, the Meal's name in bold, the total calories (or "Tap
  ⊕ to add a food" while empty), an expand toggle and **Log food**. There are no chips.
- Expanded, it lists the Meal Draft in the order picked. Each row shows the name, "N g · X kcal"
  and a delete button. Tapping a row opens the detail route. There is no quantity field on the
  tray.
- **Log food** is disabled while the Meal Draft is empty. `useLogMealDraft` sends
  `CreateNotesRequest`, mapping `foodLog`'s `MealType` to the API's. On success it dispatches
  `mealDraftLogged` and the page calls `onLogged`, so the route navigates to the day page for
  the draft's date. On failure the Meal Draft is unchanged, an error shows, and **Log food** can
  be retried.

### Detail screen

- Opened from a result's name or a tray row. It loads the Product with the existing
  `GET /api/v1/products/{id}` query, so it works for products that aren't in the Meal Draft yet.
- Its quantity form is a react-hook-form + Zod form using the shared `quantitySchema` (10–1000).
  It starts with the Meal Draft's quantity, or the default quantity for a product not in it.
  Confirming dispatches `foodLogAdded` with the typed quantity, or `foodLogQuantityChanged`
  when the product is already in the draft, then goes back.
- **Remove** shows only for a product in the Meal Draft.

### Product create, edit and recognition

- Creating and editing reuse the existing product form and the existing create
  (`POST /api/v1/products`) and edit (`PUT /api/v1/products/{id}`) endpoints. After a create,
  the new product (with the id from the response) is mapped to a `MealDraftProduct` and added
  with `foodLogAdded`, and the app returns to the search. After an edit, `productUpdated` is
  dispatched and the app returns to the detail screen. The button label is **Create** on every
  create route.
- Recognition reuses `POST /api/v1/notes/recognitions` and today's mapping, through a
  `useRecognizeProduct` hook in `features/logFood/lib`. It reads `recognitionPhotos`. Only the
  first suggestion is used, and its quantity becomes the form's default quantity. **Retry**
  sends the same photos again.
- The camera action is shown in demo mode. The mock API's recognition handler already returns a
  mock suggestion.

### Batch endpoint

- New endpoint: `POST /api/v1/notes/batch`. The request and response contract names are the same
  on the backend and the frontend:

  ```
  CreateNotesRequest {
    date: DateOnly
    mealType: MealType
    notes: [{ productId: int, productQuantity: int }]   // in Meal Draft order, at least one
  }
  ```

  It responds `200` with an empty body, or `400` with a validation problem.
- Validation follows the single-note body: `productId >= 1`, and `productQuantity` within
  10–1000. If any product is not found, nothing is saved and the response is `400`, naming the
  missing product id.
- All Food Logs are inserted in one database transaction: either all are saved or none are.
- The server assigns display order. The new Food Logs are appended after the Meal's existing Food
  Logs for that date, in request order. The request carries no `displayOrder`.
- A new Application command handler sits next to the existing note create handler and reuses the
  products repository for the existence check.
- On success the frontend invalidates the notes queries for that date, so the day page and the
  nutrition summary refresh.
- The MSW mock API used in development and tests gets a matching batch handler.

### Leaving the flow

- The `/log/food` layout uses the router's navigation blocker. Leaving `/log/food/*` with a
  non-empty Meal Draft asks `Discard N food logs?`, with the current count. Confirming
  dispatches `mealDraftDiscarded` and leaves. Cancelling stays. Moving between the flow's own
  routes never asks. After `mealDraftLogged` the Meal Draft is empty, so the move to the day page
  doesn't ask.

### Docs

- `CLAUDE.md` claims that demo mode disables features touching external integrations, but photo
  upload works in demo mode with a mock. Correct that line as part of this work.

## Testing Decisions

A good test drives behaviour through the outermost interface a user or client touches and checks
what they would see: rendered text and roles on the frontend, HTTP responses and persisted Food
Logs on the backend. Tests never reach into slices, hooks, route internals or repositories. A
refactor that keeps behaviour must keep the tests green. The one exception is the calorie and
nutrition rules in `entities/foodLog`: they duplicate the ones in `entities/note`
([ADR-0007](../../docs/adr/0007-food-log-entity-imports-no-other-entity.md)), so they get unit
tests mirroring `entities/note/lib/calculationHelpers.test.ts`, and drift between the two copies
fails a test.

### Seam 1 — frontend, the whole app at its URL

- All flow tests live in one new file, `multiItemFoodLogging.test.tsx`, in the frontend test
  suite. They render the full app with the existing `renderApp(url, { signedIn: true })` helper
  against the MSW mock API.
- A test turns the switch on (through the Settings page, or by seeding the preference), starts
  from the day page, and drives the flow by role and label: **Add breakfast**, search, ⊕, the
  tray, the detail route, **Edit product**, `Create "<query>"`, the camera and recognition route,
  **Log food**, and the discard prompt. It ends by checking the Food Logs listed on the day page.
- Cases to cover, at minimum:
  - the switch off opens the old dialog, and the switch on opens the new flow
  - ⊕ adds with the default quantity, clears the search and keeps it focused; ⊕ again removes
  - a quantity changed on the detail screen, opened from a result or from a tray row, is logged
  - a quantity outside 10–1000 can't be confirmed on the detail screen
  - **Edit product** updates the tray row's name and quantity
  - `Create "<query>"` returns to the search with the new product in the Meal Draft
  - photo recognition, through the mock suggestion, adds the created product to the Meal Draft
  - **Log food** logs every product in Meal Draft order, after the Meal's existing Food Logs
  - a failed save keeps the Meal Draft and shows an error
  - leaving with a non-empty Meal Draft prompts, and leaving with an empty one doesn't
  - opening a `/log/food` URL with no Meal Draft lands on the day page
- Prior art: `tests/app.test.tsx` for `renderApp`. `MealsListItem.test.tsx` and its steps file for
  given/when/then steps that drive the note dialog against MSW.

### Seam 2 — backend, HTTP component tests

- LightBDD scenarios in the Notes component tests, against PostgreSQL in Testcontainers (Docker
  required; see `CLAUDE.md`), using the existing `Create.Note()` and `Create.Product()` DSL.
- Cases:
  - every Food Log is created
  - an unknown product saves nothing and returns `400`
  - a quantity outside 10–1000 saves nothing and returns `400`
  - new Food Logs are appended after the Meal's existing ones in request order
  - an empty `notes` list is rejected
- Prior art: the `NotesApiTests` and `NotesApiContext` scenarios.

### Seam 3 — real browser, via chrome-devtools-mcp

- Check the finished flow in a real browser using the chrome-devtools MCP tools, against the
  MSW dev server. For this feature this replaces the `playwright-cli` default in
  `.claude/rules/frontend.md`, at the owner's request.
- Run the full flow at a phone width (about 390 px) and a desktop width. Look for broken markup:
  overlapping or clipped elements, the tray covering content or buttons, horizontal scroll,
  the AppBar search field squeezing the back arrow or the camera action, missing focus after ⊕,
  and an AppBar back arrow that doesn't return.
- Exercise what Vitest can't reach: the camera file input, the tray's expand and collapse
  layout, and the navigation blocker on the browser's own back.
- Check the console. The MSW-mode baseline errors are allowed; any other error is a defect.
- Device emulation doesn't reproduce a phone's on-screen keyboard. The owner checks once on a
  real phone that the keyboard stays open after ⊕.

## Out of Scope

- Removing the old `NoteInputDialog` flow. That is a follow-up issue.
- Merging `entities/note` into `entities/foodLog`. That is a follow-up issue.
- Editing an existing Food Log in the new flow. It stays in `EditNote`. Opening it in the new
  detail route is a possible follow-up.
- A recents or frequent-products list before typing.
- Using more than the first recognition suggestion.
- Matching recognition suggestions to existing Products.
- Persisting the Meal Draft across reloads.
- Copying a previous Meal, saved meals, barcodes and voice input.
- Partial success for the batch endpoint.
- Changing the old dialog's copy (`Add "<query>"`, **Add**).

## Further Notes

- Single-note `POST /api/v1/notes` keeps working unchanged, because the old dialog still uses it.
- The prototype branch is a primary source for layout and interaction details. It is not code to
  copy: it was written without tests or error handling, its store is a module-level singleton,
  and it predates the decisions above (it has chips, a quantity field on the tray, date and Meal
  in the URL, and "plate" naming). Where it disagrees with this spec, the spec wins.
- The `.scratch/routes-instead-of-modals/` research and ADR-0004 and ADR-0005 cover the routing
  approach this flow follows.
