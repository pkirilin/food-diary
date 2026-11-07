# Spec: Multi-item food logging

Status: resolved

Vocabulary: [GLOSSARY.md](../../GLOSSARY.md). **Food Log**, **Product**, **Meal**, **Meal
Draft**, **Log** and **Create** are used with exactly those meanings. "Note" appears only
where it names existing code or API (`NoteInputDialog`, `/api/v1/notes`). "Tray" names a UI
component only, never state. The word "plate" is not used anywhere in code or UI.

Background: [research.md](research.md) surveys how the market-leading food trackers log several
foods at once.

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
for the next product. A tray stuck under the AppBar, headed with the Meal's name, shows the Meal
Draft and one **Log food** button that saves it in one request. Tapping a product's name,
in the results or on the tray, opens a detail screen to set its quantity, remove it, or edit the
Product itself. A product that doesn't exist yet can be created from the search
(`Create "<query>"`) or from a photo, and comes back already in the Meal Draft. Every screen is a
route, so the back button and the AppBar behave like a native app. The old dialog stays: a switch
on a new Settings page chooses between the two flows on each device.

## Final design

### Screens and routes

The flow is a set of routes under the existing app layout. The router owns which screen is shown,
and Redux owns the Meal Draft. Date and Meal live only in the Meal Draft, never in the URL: the URL
carries only what selects a screen. Route files live in `src/frontend/src/app/routes/_app/`.

| Path | Route file | Screen | AppBar | Params |
|---|---|---|---|---|
| `/settings` | `settings.tsx` | Settings | `'menu'`, **Settings** | — |
| `/log/food` | `log.food.tsx` | layout: guard and discard prompt | none of its own | — |
| `/log/food/` | `log.food.index.tsx` | search, with the tray | `'search'`, camera action | `q` (search query, optional) |
| `/log/food/products/$productId` | `log.food.products.$productId.index.tsx` | product detail | `'back'`, **Product** | `productId` |
| `/log/food/products/$productId/edit` | `log.food.products.$productId.edit.tsx` | edit product | `'back'`, **Edit product** | `productId` |
| `/log/food/products/new` | `log.food.products.new.tsx` | create product | `'back'`, **New product** | `name` (prefill, optional) |
| `/log/food/recognition` | `log.food.recognition.tsx` | recognise a product from photos | `'back'`, **Recognize product** | — |

- The `/log/food` prefix leaves room for `/log/weight` and others later. There is no `/log` route.
- The detail screen is an index route, so the edit route is its sibling and the detail renders no
  `Outlet`. The static `products/new` wins over the dynamic `products/$productId`.
- `productId` is parsed to a positive integer by the shared `-productIdParams.ts`. `q` and `name`
  are schema-validated strings that fall back to absent. `-searchQuery.ts` drops `q` from the URL
  when the query is empty. `-leaveSearch.ts` drops `q` from the search's history entry, then
  pushes the next screen.
- The `/log/food` layout's `beforeLoad` redirects to the day page when the store holds no Meal
  Draft: after a reload, after **Log food** or **Discard**, and on a browser forward into the flow
  after either. The recognition route's `beforeLoad` redirects to the search (with `replace`) when
  `recognitionPhotos` is empty.
- Following ADR-0005, route files and AppBar slots are thin adapters. Pages and features take
  plain values and callbacks (`onQueryChange(q)`, `onOpenProduct(productId)`, `onCreateProduct(name)`,
  `onLogged(date)`, `onDone`, `onEditProduct`, `onSaved`, `onCreated`). The AppBar slots are
  `-SearchSlot.tsx` and `-CameraSlot.tsx`, lazy-loaded like the existing slots.

Moves between screens:

| From | Action | Move |
|---|---|---|
| day page | **Add <meal>** | push `/log/food` |
| search | typing | `q` updated with `replace`, so typing adds no history entries |
| search | a result's name, or a tray row | drop `q` with `replace`, then push the detail route |
| search | `Create "<query>"` | drop `q` with `replace`, then push `/log/food/products/new?name=<trimmed query>` |
| search | photos picked with the camera action | drop `q` with `replace`, then push `/log/food/recognition` |
| search | **Log food** succeeds | go back to the day page, restoring its scroll position, falling back to `/?date=<the Meal Draft's date>` with `replace` |
| detail | **Add**, **Save** or **Remove** | go back, falling back to `/log/food` |
| detail | **Edit product** | push the edit route |
| edit product | **Save** succeeds | go back, falling back to the detail route with `replace` |
| create product, recognition | **Create** succeeds | go back, falling back to `/log/food` with `replace` |
| any `'back'` or `'search'` screen | AppBar back arrow | go back, falling back to `/` |

"Go back" is `useGoBack(fallback)` from `shared/hooks`: `router.history.back()` when
`router.history.canGoBack()`, otherwise a navigation to the fallback. The search drops `q` from
its own history entry before pushing another screen, so every return to it, whether by **Add**,
**Save**, **Remove**, **Create** or the back arrow, shows an empty search, ready for the next
product.

### AppBar

`AppBarConfig` in `widgets/Navigation/model.ts` is a union. `Navigation` renders the config of the
deepest matched route.

```ts
type Title = string | { Component: ComponentType };

type AppBarConfig =
  | { variant: 'menu'; title: Title; Actions?: ComponentType } // existing screens and Settings
  | { variant: 'back'; title: Title; Actions?: ComponentType } // detail, edit, create, recognition
  | { variant: 'search'; Search: ComponentType; Actions?: ComponentType }; // the search route
```

- `'menu'`: the burger and drawer, the title as an `h1`, then `Actions`. The drawer has a
  **Settings** link after **Categories**.
- `'back'`: a back arrow labelled **Back** in place of the burger, the title as an `h1`, then
  `Actions`.
- `'search'`: the back arrow, the `Search` slot, then `Actions` at the right edge of the bar. The
  search field fills the space between the arrow and the actions on a phone and is 400 px wide from
  `sm` up. It has no title text, because the tray carries the Meal's name. It adapts MUI's
  [App bar with a primary search field](https://mui.com/material-ui/react-app-bar/#app-bar-with-a-primary-search-field).
- `Navigation` may use the router (navigation widgets are the ADR-0005 exception), but it never
  reads the Meal Draft.

### Tray

`MealDraftTray` in `features/logFood/ui` is the first element of `LogFoodSearchPage`, above the
results. At the bottom of the screen a phone's keyboard hides it, so it sits at the top.

- It is a `Paper` section labelled by the Meal's name, `position: sticky` directly under the AppBar,
  in page flow. It stays under the AppBar while the results scroll, and expanding it moves the
  results down, so it never covers a result or a ⊕ at rest. The update banner, sticky at the same
  height, covers it until closed.
- It is at most `60dvh` tall. Its lower part (the error and the list) scrolls inside it, and the
  collapsed row always stays visible.
- The collapsed row is 64 px: a count badge on a restaurant icon (it shows 0), the Meal's name in
  bold, the total calories ("N kcal", or "Tap ⊕ to add a food" while empty), a chevron, and
  **Log food**. There are no chips. The row stays visible while the Meal Draft is empty, so the
  results don't jump on the first ⊕.
- Everything in the row left of **Log food** is one button labelled **Picked foods**, reaching the
  left edge of the screen on a phone and the full height of the row. It sets `aria-expanded` and is
  disabled while the Meal Draft is empty. Deleting the last product collapses the tray.
- Expanding moves the focus to that button, which closes a phone's keyboard, because `dvh` doesn't
  shrink for the keyboard and the list needs the room. Collapsing leaves the focus alone.
- Any change of `q` collapses the tray: typing makes room for the results, and so does the clearing
  after ⊕.
- Expanded, a list labelled **Picked foods** opens downward, below the row. It shows the Meal Draft
  in the order picked. Each row shows the name and "N g · X kcal", opens the detail route when
  tapped, and has a **Delete <name>** button. There is no quantity field on the tray.
- **Log food** is disabled while the Meal Draft is empty and shows a spinner while saving. A failed
  save shows an error alert inside the tray, between the row and the list.

### State

- Redux organises state by data type, never by component. The flow's state is named after the
  Meal Draft, so replacing the tray with a review route or a bottom sheet doesn't touch it.
- `entities/foodLog/model/foodLogSlice.ts`, with slice name and store key `foodLog`. The types are
  in `entities/foodLog/model/types.ts`:

  ```ts
  interface FoodLogState {
    mealDraft: MealDraft | null;
  }

  interface MealDraft {
    date: string;
    mealType: MealType;
    foodLogs: MealDraftFoodLog[]; // in the order picked
  }

  interface MealDraftFoodLog {
    product: MealDraftProduct;
    quantity: number;
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

  // foodLog's own string enum. features/logFood/lib/mapping.ts maps it to and from the numeric
  // noteModel.MealType that the API uses.
  enum MealType {
    Breakfast = 'Breakfast',
    SecondBreakfast = 'SecondBreakfast',
    Lunch = 'Lunch',
    AfternoonSnack = 'AfternoonSnack',
    Dinner = 'Dinner',
  }
  ```

- Actions:
  - `mealDraftStarted({ date, mealType })` replaces any Meal Draft with an empty one.
  - `foodLogAdded({ product, quantity })` appends a Food Log. It does nothing when there is no Meal
    Draft or the product is already in it. ⊕ passes the default quantity.
  - `foodLogQuantityChanged({ productId, quantity })` and `foodLogRemoved(productId)`.
  - `productUpdated(product)` replaces the product's snapshot and sets its quantity to the new
    default quantity. It does nothing for a product that isn't in the Meal Draft.
  - `mealDraftDiscarded` and `mealDraftLogged` both set `mealDraft` to `null`.

  ⊕ dispatches `foodLogAdded` or `foodLogRemoved`, depending on whether the product is already in
  the Meal Draft.
- Selectors: `mealDraft`, `isInMealDraft(productId)`, `foodLogOfProduct(productId)` (the Food Log
  or `null`), `foodLogsCount` and `totalCalories`.
- The calorie and nutrition rules are `calculateCalories(foodLog)` (calories per 100 g × quantity
  / 100, rounded down) and `calculateNutritionValues(foodLogs)`, in
  `entities/foodLog/model/foodLog.ts`, with helpers in `model/calculationHelpers.ts`.
- The Meal Draft only ever holds valid whole-number quantities within 10–1000. Quantities are
  typed and validated on the detail route's form, never on the tray.
- The Meal Draft is not persisted. A reload empties it.
- `features/logFood/model/recognitionPhotosSlice.ts`, with slice name and store key
  `recognitionPhotos`, holds `imageLib.Image[]`: the photos picked for recognition. They aren't
  Food Log data, and only this feature uses them. `recognitionPhotosPicked(images)` replaces them.
  `productRecognized()` empties them when recognition responds successfully, and so do
  `mealDraftDiscarded` and `mealDraftLogged`. `recognitionPhotoUrlsListener` revokes the object URL
  of every photo that leaves the slice.
- Request status lives in RTK Query, not in either slice.

### Frontend architecture (FSD)

New and changed code, by layer. "Moved" means moved, not copied: every caller imports from the new
location, and the old one is gone.

| Layer / slice | Segment | Change |
|---|---|---|
| `shared/lib` | `devicePreferences` | **New.** `useMultiItemFoodLoggingPreference()` returns `[enabled, setEnabled]` for "Log several foods at once". It reads the localStorage key `devicePreferences.multiItemFoodLogging` through `useSyncExternalStore` and follows `storage` events from other tabs. Reads fall back to off, and writes are dropped, when storage is unavailable or throws. |
| `shared/lib` | `image`, `imageFiles` | **Moved** from `features/manageNote`: the `Image` type, now `imageLib.Image`. **New** `toImages(files)` in `imageFiles.ts`: resizes each file, converts it to base64 and creates its object URL. |
| `shared/ui` | `ImagePicker` | **New**, split out of `manageNote`'s `UploadImagesButton`. Props `label`, `icon`, `color` and `onPick(images: Image[])`. An icon button with a tooltip opens a hidden multi-file image input labelled `label`. It knows nothing about recognition. |
| `shared/hooks` | `useGoBack` | **New.** `useGoBack(fallback)`, described under Screens and routes. |
| `shared/api` | `errorHandling` | **Changed.** `parseFieldValidationError(error, field)` returns a field's first message from a validation problem, matching the field key case-insensitively, because ASP.NET Core keeps the C# casing (`Name`). |
| `entities/foodLog` | `model` | **New entity slice**, exported only as `foodLogModel`. `types.ts`, `foodLogSlice.ts` (the Meal Draft), the calorie and nutrition rules in `foodLog.ts` and `calculationHelpers.ts`, a test DSL in `dsl.ts`, and unit tests. Imports no other entity ([ADR-0007](../../docs/adr/0007-food-log-entity-imports-no-other-entity.md)). |
| `entities/note` | `api` | **Changed.** `createNotes` mutation for `POST /api/v1/notes/batch` and its `CreateNotesRequest` contract. It invalidates the `note` tag, which refetches the cached notes queries of every date. |
| `entities/note` | `lib` | **Changed.** `recognition.ts`, moved out of `features/manageNote` and used by both features: `toRecognizeFormData(images)` builds the recognition request, and `toRecognizedProductFormValues(suggestion, category)` maps a suggestion to product form values. |
| `entities/product` | `lib` | **Moved** `searchProducts` here from `features/manageNote/lib`, because both features use it. |
| `entities/product` | `ui` | **Changed.** `ProductForm` takes optional `serverErrors` (`ProductFormServerErrors`, `{ name: string \| null }`) and shows the name error on the Name field. |
| `features/logFood` | `ui` | **New feature slice.** `MultiItemLogFood` (the entry button), `LogFoodSearchField`, `LogFoodSearchResults` and `FoundProductListItem` (results with ⊕), `MealDraftTray` and `MealDraftFoodLogListItem`, `LogFoodProductDetail` and `FoodLogQuantityForm`, `CreateProductForm`, `EditProductForm` and their shared `ProductFormFooter`, `RecognizeProductButton`, `RecognizeProductForm`, and `DiscardMealDraftDialog`. |
| `features/logFood` | `lib` | **New.** `mapping.ts` (between `foodLog` and `note`/`product` types), `useLogMealDraft`, `useCreateProduct`, `useEditProduct`, `useProductFormErrors` and `useRecognizeProduct`. |
| `features/logFood` | `model` | **New**, exported as `logFoodModel`: the `recognitionPhotos` slice and `recognitionPhotoUrlsListener`. |
| `features/manageNote` | `ui`, `lib`, `model` | **Changed.** `UploadImagesButton` wraps the shared `ImagePicker` and does its own recognition. `useRecognizeNotes` and `ImageUploadStep` use `noteLib`'s recognition mapping. Imports follow the moves above. Behaviour unchanged. |
| `widgets/MealsList` | `ui` | **Changed.** `MealsListItem` reads the preference and renders `AddNoteButton` (off) or `MultiItemLogFood` (on). `MealsList` passes an `onOpenLogFood(mealType)` callback through to it. |
| `widgets/Navigation` | `model`, `ui` | **Changed.** The `'back'` and `'search'` AppBar variants, and a Settings link in the drawer. |
| `pages/ui` | — | **New.** `SettingsPage`, `LogFoodSearchPage`, `LogFoodProductPage`, `LogFoodEditProductPage`, `LogFoodCreateProductPage` and `LogFoodRecognitionPage`. |
| `pages/ui` | `IndexPage` | **Changed.** Passes `onOpenLogFood` to `MealsList`. |
| `app/routes` | — | **New.** `_app/settings.tsx` and the `/log/food` routes above, with the slot adapters `-SearchSlot.tsx` and `-CameraSlot.tsx` and the helpers `-productIdParams.ts` and `-searchQuery.ts`. `_app/index.tsx` supplies `onOpenLogFood`. |
| `app` | `store.ts` | **Changed.** Registers the `foodLog` and `recognitionPhotos` reducers and the `recognitionPhotoUrlsListener` middleware. |

`MultiItemLogFood` is exported under that name, not aliased on import. `features/manageNote`
doesn't depend on `entities/foodLog` or `features/logFood`.

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
13. As the owner, I want the search to clear and keep its focus after ⊕ adds a product, with the phone keyboard staying open, so that I can type the next product at once.
14. As the owner, I want a product in the Meal Draft to look selected in the results, so that I can see what I've already picked.
15. As the owner, I want ⊕ on a product already in the Meal Draft to take it out, so that a mis-tap is undone by tapping again.
16. As the owner, I want tapping a product's name to open its detail screen, so that I can set a quantity before adding it.
17. As the owner, I want the search empty when I return from a detail, create or recognition screen, so that I can type the next product at once.

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
53. As the owner, I want a `Discard N food logs?` prompt (`Discard 1 food log?` for one) when I leave the flow with a non-empty Meal Draft, so that I don't lose picks by accident.
54. As the owner, I want to leave without a prompt when the Meal Draft is empty, so that backing out costs nothing.
55. As the owner, I want the Meal Draft to be empty the next time I open the flow, so that a previous meal never leaks into the next.
56. As the owner, I want a reload inside the flow to take me back to the day page, so that I never see a flow screen with no Meal to log to.
57. As the owner, I want the flow to work equally on a phone and a desktop browser, so that I can log wherever I am.

## Implementation Decisions

### Entry and setting

- The Settings route renders one switch, "Log several foods at once", with a "Stored on this
  device" hint, bound to `useMultiItemFoodLoggingPreference()`.
- `MealsListItem` reads the preference. When it is off, it renders `AddNoteButton` and
  `NoteInputDialog` exactly as before. When it is on, it renders `MultiItemLogFood`: the same
  **Add <meal>** button, which dispatches `mealDraftStarted({ date, mealType })` and calls
  `onOpenLogFood`. The `_app/index.tsx` route navigates to `/log/food`. The button doesn't wait
  for the notes query, because the server assigns display order.
- Editing an existing Food Log (`EditNote`) is unchanged.

### Search screen

- Results come from the products autocomplete query, filtered by `productLib.searchProductsByName`
  with its minimum query length of 3 (`productLib.QUERY_LENGTH_THRESHOLD`). A spinner replaces the
  results while the products are being fetched for a query of that length.
- The search field (`-SearchSlot`) and the results (the page) are separate trees that share the
  query through `q`. No ref crosses between them.
- `LogFoodSearchField` is a `type="search"` input labelled **Search products**, inside a
  `role="search"` box, with `autoFocus` covering the screen's opening. It keeps the typed value in local state and resyncs it whenever `q` changes. `q` arrives only after the navigation that
  updates it, and a field bound straight to `q` drops fast keystrokes.
- A field that mounts after a navigation is too late for iOS Safari to open the keyboard for it.
  So the handler of the tap that leads to it first focuses a hidden placeholder input
  (`holdSoftKeyboardForNextField` in `shared/lib`), and the field takes the focus from it. This
  covers **Add <meal>**, a result row, a tray row, the **Create** row, **Edit product**, **Add**,
  **Save** and **Remove** on the product, and **Create** and **Save** on the product forms. An
  invalid product form or a failed request releases the placeholder, which closes the keyboard.
  The back arrow holds nothing, so going back opens no keyboard. Neither does the recognition
  form: it appears after the server's answer, and the gesture before it is picking a file.
- Results are a list labelled **Found products**. Each row shows the name and
  "<default quantity> g · X kcal", and opens the detail route when tapped. A product in the Meal
  Draft has a selected background and a check icon in place of ⊕.
- The ⊕ buttons are labelled `Add <name>` and `Remove <name>`. ⊕ calls `preventDefault` on
  `mousedown`, so the search field never loses focus and a phone's keyboard stays open. Adding
  clears `q`, and the field follows it. Removing leaves `q` as it is.
- When the trimmed query is at least 3 characters long and nothing is found, the results are a
  single `Create "<trimmed query>"` row, which navigates to
  `/log/food/products/new?name=<trimmed query>`. `Create "<query>"` replaces the overloaded
  `Add "<query>"` wording for the new flow. The old dialog's copy and its own rule for offering to
  add a product are left as they are.
- The camera action (`-CameraSlot`) renders `RecognizeProductButton`, a camera icon labelled
  **Recognize product from photos** that wraps the shared image picker. On pick, it stores the
  photos with `recognitionPhotosPicked` and the slot navigates to the recognition route.

### Detail screen

- Opened from a result's name or a tray row. It loads the Product with the existing
  `GET /api/v1/products/{id}` query, so it works for products that aren't in the Meal Draft yet.
  A spinner shows while it loads, and "The product could not be loaded" if the request fails.
- It shows the product's name as a heading and "<calories> kcal per 100 g".
- Its quantity form is a react-hook-form + Zod form using the shared `quantitySchema` (whole
  numbers, 10–1000), validated on every change. The field is labelled **Quantity**, has a `g`
  suffix and a numeric keyboard, and is focused with its contents selected. It starts with the
  Meal Draft's quantity, or the default quantity for a product not in it.
- Under the field, a valid quantity shows its calories ("X kcal"). Any invalid quantity shows one
  fixed message, `Enter a whole number from 10 to 1000`, and disables the confirm button.
- The actions row holds **Edit product** on the left, then **Remove** (only for a product in the
  Meal Draft), then the confirm button: **Add** for a product not in the Meal Draft, **Save** for
  one in it. **Add** dispatches `foodLogAdded` with the typed quantity, **Save** dispatches
  `foodLogQuantityChanged`, and **Remove** dispatches `foodLogRemoved`. Each then goes back.

### Product create, edit and recognition

- Creating and editing reuse the existing product form and the existing create
  (`POST /api/v1/products`) and edit (`PUT /api/v1/products/{id}`) endpoints. The button label is
  **Create** on every create route and **Save** on the edit route.
- `CreateProductForm` takes the form's default values. It renders nothing until the categories
  load, and a product without a category gets the first category. After a create, the new product
  (with the id from the response) is mapped from the form values to a `MealDraftProduct` and added
  with `foodLogAdded` at its default quantity, and the app goes back to the search.
- `EditProductForm` loads the Product by id and the categories, with a spinner until both are
  ready. After an edit, `productUpdated` is dispatched with the saved values, and the app goes back
  to the detail screen. The edit invalidates the `product` tag, so the detail shows the saved
  Product, and its quantity form opens with the new default quantity.
- A name clash comes back as a `400` validation problem with a `Name` error. It is shown under the
  Name field and the input is kept. Any other failure shows an error alert under the form.
- Recognition reuses `POST /api/v1/notes/recognitions` and the shared mapping in
  `entities/note/lib/recognition.ts`, through `useRecognizeProduct` in `features/logFood/lib`. It
  takes a snapshot of `recognitionPhotos` when the screen mounts and sends it, aborting the request
  if the screen unmounts first.
  - While it runs, the screen shows a progress bar labelled **Recognizing product** and form
    skeletons.
  - A failure shows an error alert with **Retry**, which sends the same photos again.
  - A response with no suggestions shows "No food found. Please try other photos".
  - Otherwise the screen shows `CreateProductForm` prefilled from the first suggestion, whose
    quantity becomes the default quantity.
  - A successful response dispatches `productRecognized`, so a later browser forward into the
    recognition route lands on the search.
- Nothing checks for demo mode. The demo build runs against the MSW mock API, whose recognition
  handler returns one suggestion per photo, named after the photo's file.

### Logging the Meal Draft

- `useLogMealDraft(onLogged)` sends `CreateNotesRequest` built by `toCreateNotesRequest`, mapping
  `foodLog`'s `MealType` to the API's and the Food Logs, in order, to `notes`.
- On success it dispatches `mealDraftLogged`, then calls `onLogged(date)`, and the route navigates
  to the day page for the draft's date.
- On failure the Meal Draft is unchanged, the tray shows the error, and **Log food** can be
  retried.

### Batch endpoint

- New endpoint: `POST /api/v1/notes/batch`. The request contract is named `CreateNotesRequest` on
  the backend and the frontend:

  ```
  CreateNotesRequest {
    date: DateOnly
    mealType: MealType
    notes: [{ productId: int, productQuantity: int }]   // in Meal Draft order, at least one
  }
  ```

  The backend declares the list element as the nested class `CreateNotesRequest.Note`. The
  frontend types it inline.
- It responds `200` with an empty body. Validation follows the single-note body: `date` is
  required, `mealType` must be a known Meal, `notes` must hold at least one item, `productId >= 1`,
  and `productQuantity` within 10–1000. A failed check is a `400` validation problem.
- `CreateNotesCommandHandler` sits next to the existing note create handler in
  `FoodDiary.Application/Notes/Create/`. It checks every product in one query with the new
  `IProductsRepository.FindExistingIds`. If any product is not found, nothing is saved and the
  response is a `400` problem titled `Product with id <id> not found`, naming the first missing
  product.
- The server assigns display order. The new Food Logs are appended after the Meal's existing Food
  Logs for that date, in request order, starting one above the highest existing display order.
  The request carries no `displayOrder`.
- All Food Logs are inserted by the new `INotesRepository.AddRange` in one `SaveChangesAsync`, so
  in one database transaction: either all are saved or none are.
- On success the frontend invalidates the `note` tag, so the day page and the nutrition summary
  refresh.

### Mock API

- The MSW mock API used in development, the demo and tests has a matching batch handler. It
  rejects an empty list, a quantity outside 10–1000 and an unknown product with a plain `400`, and
  otherwise appends the Food Logs after the Meal's existing ones.
- Its product create and edit handlers reject a name that another Product already has with an
  ASP.NET-shaped validation problem carrying a `Name` error, as the backend does.

### Leaving the flow

- The `/log/food` layout uses the router's `useBlocker` with `enableBeforeUnload: false`. It blocks
  a navigation whose target is outside `/log/food` while the store holds a non-empty Meal Draft. It
  reads the count from the store at that moment, not from a rendered selector, because
  `useLogMealDraft` empties the Meal Draft and navigates in the same tick.
- A blocked navigation opens `DiscardMealDraftDialog`, titled `Discard N food logs?` with the
  current count (`Discard 1 food log?` for one), with **Cancel** and **Discard**. **Discard**
  dispatches `mealDraftDiscarded` and lets the navigation through. **Cancel** stays. This covers the
  AppBar back arrow and the browser's own back button.
- Moving between the flow's own routes never asks. After `mealDraftLogged` the Meal Draft is
  `null`, so the move to the day page doesn't ask.
- A reload or closing the tab drops the Meal Draft without a prompt. After a reload the layout's
  guard lands on the day page.

### Docs

- The demo mode line in `CLAUDE.md` and the `VITE_APP_DEMO_MODE_ENABLED` row in
  `docs/development.md` describe demo mode as it is: it only shows a warning on the login page,
  and the demo build runs against the MSW mock API, so photo recognition returns the mock API's
  suggestion.

## Testing Decisions

A good test drives behaviour through the outermost interface a user or client touches and checks
what they would see: rendered text and roles on the frontend, HTTP responses and persisted Food
Logs on the backend. Tests never reach into slices, hooks, route internals or repositories. A
refactor that keeps behaviour must keep the tests green. The one exception is the calorie and
nutrition rules in `entities/foodLog`: they duplicate the ones in `entities/note`
([ADR-0007](../../docs/adr/0007-food-log-entity-imports-no-other-entity.md)), so
`entities/foodLog/model/foodLog.test.ts` and `model/calculationHelpers.test.ts` run the same cases
as `entities/note/model/note.test.ts` and `entities/note/lib/calculationHelpers.test.ts`.

### Seam 1 — frontend, the whole app at its URL

- All flow tests live in one file, `src/frontend/tests/multiItemFoodLogging.test.tsx`. They render
  the full app with `renderApp(url, { signedIn: true })` against the MSW mock API. `renderApp`
  uses the app's own hash history over jsdom, because a memory history never runs navigation
  blockers on back and forward, and it returns the render result, so a test can unmount the app to
  simulate a reload.
- A test turns the switch on (through the Settings page, or by seeding the preference), starts
  from the day page, and drives the flow by role and label: **Add breakfast**, search, ⊕, the
  tray, the detail route, **Edit product**, `Create "<query>"`, the camera and recognition route,
  **Log food**, and the discard prompt. It ends by checking the Food Logs listed on the day page.
- The photo tests swap in Node's `Blob`, `File` and `FormData` while they upload, because a jsdom
  `FormData` holding a `Blob` can't be sent through the test environment's `fetch`.
- Cases to cover, at minimum:
  - the switch off opens the old dialog, and the switch on opens the new flow
  - ⊕ adds with the default quantity, clears the search and keeps it focused; ⊕ again removes
  - tapping the tray's row toggles the list, **Log food** doesn't, and changing `q` collapses it
  - a quantity changed on the detail screen, opened from a result or from a tray row, is logged
  - a quantity outside 10–1000 can't be confirmed on the detail screen
  - **Edit product** updates the tray row's name and quantity
  - `Create "<query>"` returns to an empty search with the new product in the Meal Draft
  - photo recognition, through the mock suggestion, adds the created product to the Meal Draft
  - **Log food** logs every product in Meal Draft order, after the Meal's existing Food Logs
  - a failed save keeps the Meal Draft and shows an error
  - leaving with a non-empty Meal Draft prompts, and leaving with an empty one doesn't
  - opening a `/log/food` URL with no Meal Draft lands on the day page
- Prior art: `tests/app.test.tsx` for `renderApp`. `MealsListItem.test.tsx` and its steps file for
  given/when/then steps that drive the note dialog against MSW.

### Seam 2 — backend, HTTP component tests

- LightBDD scenarios in `NotesApiTests`, against PostgreSQL in Testcontainers (Docker required;
  see `CLAUDE.md`), using the existing `Create.Note()` and `Create.Product()` DSL and a new
  `CreateNotesRequestBuilder`.
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
  real phone that the keyboard stays open after ⊕, that the tray's row is visible above it, and
  that expanding the tray closes it.

## Out of Scope

- Removing the old `NoteInputDialog` flow. That is a follow-up issue.
- Merging `entities/note` into `entities/foodLog`. That is a follow-up issue.
- Editing an existing Food Log in the new flow. It stays in `EditNote`. Opening it in the new
  detail route is a possible follow-up.
- A recents or frequent-products list before typing.
- Using more than the first recognition suggestion.
- Matching recognition suggestions to existing Products.
- Persisting the Meal Draft across reloads, or asking before a reload drops it.
- Copying a previous Meal, saved meals, barcodes and voice input.
- Partial success for the batch endpoint.
- Changing the old dialog's copy (`Add "<query>"`, **Add**).

## Further Notes

- Single-note `POST /api/v1/notes` keeps working unchanged, because the old dialog still uses it.
- The `.scratch/routes-instead-of-modals/` research and ADR-0004 and ADR-0005 cover the routing
  approach this flow follows.
