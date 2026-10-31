# Spec: Multi-item food logging

Status: ready-for-agent

Vocabulary: [GLOSSARY.md](../../GLOSSARY.md). **Food Log**, **Product**, **Meal**, **Log** and
**Create** are used with exactly those meanings. "Note" appears only where it names existing code
or API (`NoteInputDialog`, `/api/v1/notes`).

Background: [research.md](research.md). The design was settled with a throwaway prototype of three
variants, kept on the `prototype/multi-item-food-logging` branch (commit `e5bd584e`). Variant B won,
with variant A's editable quantity field. The issue note in Obsidian
(`Projects/Food Diary/Todos/Добавить возможность записывать (логировать) несколько продуктов сразу`)
holds the acceptance criteria and the final design.

## Problem Statement

Logging a meal takes one full round trip per product: tap **Add breakfast**, search, pick a
product, keep or change the quantity, tap **Add**, and the dialog closes. A breakfast of four
products means opening the dialog four times. Creating a missing product or recognising one from a
photo sits in the same one-at-a-time loop. Most of the time the default quantity is right, so most
of those taps are overhead.

## Solution

An opt-in, per-device flow for logging several foods in one go. **Add breakfast** opens a search
screen. ⊕ next to a product puts it on a tray with its default quantity, then clears the search
and refocuses it, ready for the next product. The tray along the bottom of the screen lists what
has been picked, with an editable quantity field per item and one **Log foods** button that saves
everything in one request. Tapping a product's name opens a detail screen to set its quantity,
remove it, or edit the Product itself. A product that doesn't exist yet can be created from the
search (`Create "<query>"`) or from a photo, and comes back already on the tray. Every screen is a
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

8. As the owner, I want the flow to open on a search screen titled after the Meal and date, so that I know where the Food Logs will go.
9. As the owner, I want the search field focused when the screen opens, so that I can start typing straight away.
10. As the owner, I want each search result to show the product's name, default quantity and calories, so that I can pick the right one.
11. As the owner, I want a ⊕ button on each result, so that I can put a product on the tray with one tap.
12. As the owner, I want ⊕ to use the product's default quantity, so that the common case needs no typing.
13. As the owner, I want the search to clear and refocus after ⊕, so that I can type the next product at once.
14. As the owner, I want a product on the tray to look selected in the results, so that I can see what I've already picked.
15. As the owner, I want ⊕ on a product already on the tray to take it off, so that a mis-tap is undone by tapping again.
16. As the owner, I want tapping a product's name to open its detail screen, so that I can set a quantity before adding it.

### Detail screen

17. As the owner, I want the detail screen to show the product's name and its calories per 100 g, so that I know what I'm editing.
18. As the owner, I want a focused quantity field with its contents selected, so that I can type a new quantity straight away.
19. As the owner, I want to see the calories for the quantity I type, so that I can judge the portion.
20. As the owner, I want quantities outside the allowed range (10–1000 g) to be refused before saving, so that a typo never reaches the server.
21. As the owner, I want to put a product on the tray from its detail screen with the quantity I typed, so that I can log a non-default portion.
22. As the owner, I want to change the quantity of a product already on the tray from its detail screen, so that I can fix a portion.
23. As the owner, I want a **Remove** action on the detail screen of a product on the tray, so that I can take it off from there too.
24. As the owner, I want an **Edit product** action on the detail screen, so that I can fix a product's name, nutrition values, default quantity or category without leaving the flow.
25. As the owner, I want **Edit product** to save the Product straight away, so that the fix applies everywhere, not only to this meal.
26. As the owner, I want a product on the tray to take the edited name, nutrition values and new default quantity after I save the Product, so that the tray matches what I just saved.
27. As the owner, I want the back arrow to return me to the search with my tray intact, so that looking at a product never loses my picks.

### Tray

28. As the owner, I want the tray to show how many products I've picked and their total calories, so that I see the meal at a glance.
29. As the owner, I want to expand the tray to see every picked product, so that I can review the meal before logging it.
30. As the owner, I want an editable quantity field on each tray item, so that I can adjust portions without opening each product.
31. As the owner, I want the tray's calories to update as I change a quantity, so that the total stays right.
32. As the owner, I want to delete an item from the tray, so that I can drop something I won't eat.
33. As the owner, I want tray items to keep the order I picked them in, so that the logged meal reads the way I built it.
34. As the owner, I want **Log foods** to be disabled while the tray is empty, so that I can't log nothing.
35. As the owner, I want **Log foods** to be disabled while any tray quantity is invalid, so that I fix it before saving.

### Creating a product

36. As the owner, I want a `Create "<query>"` row when the search finds nothing, so that I can add a product that's missing.
37. As the owner, I want it to open the product form with the name prefilled from my query, so that I don't type it twice.
38. As the owner, I want the form's button to say **Create**, so that it's clear this makes a Product, not a Food Log.
39. As the owner, I want a created product to land on the tray with its default quantity, and to return me to the search, so that I can carry on picking.
40. As the owner, I want a name clash to show an error on the form and keep my input, so that I can rename and retry.

### Recognising a product from a photo

41. As the owner, I want a camera action in the search screen's AppBar, so that I can log a product I photographed.
42. As the owner, I want to pick one or several photos, so that I can show the product from more than one angle.
43. As the owner, I want a recognition screen that shows skeletons while recognition runs, so that I know it's working.
44. As the owner, I want a **Retry** when recognition fails, so that a flaky request doesn't send me back to the start.
45. As the owner, I want the recognition screen to show the product form prefilled from the first suggestion, with the recognised quantity as the default quantity, so that I only review and correct it.
46. As the owner, I want **Create** there to create the Product, put it on the tray and return me to the search, so that photo logging fits the same loop.
47. As the demo visitor, I want the camera action to work in demo mode and return a mock product, so that I can try the whole flow without a backend.

### Logging and leaving

48. As the owner, I want **Log foods** to save the whole tray in one request, so that either the meal is logged or nothing is.
49. As the owner, I want a failed save to keep the tray as it was and show an error, so that I can retry without picking again.
50. As the owner, I want a successful save to return me to the day page with the new Food Logs listed under the Meal, so that I see the result.
51. As the owner, I want the new Food Logs to appear after the Meal's existing ones, in tray order, so that earlier entries keep their place.
52. As the owner, I want a `Discard N selected?` prompt when I leave the flow with a non-empty tray, so that I don't lose picks by accident.
53. As the owner, I want to leave without a prompt when the tray is empty, so that backing out costs nothing.
54. As the owner, I want the tray to be empty the next time I open the flow, so that a previous meal never leaks into the next.
55. As the owner, I want the flow to work equally on a phone and a desktop browser, so that I can log wherever I am.

## Implementation Decisions

### Routes and state

- The flow is a set of routes under the existing app layout, not a dialog. The screens are: search
  (with the inline tray), product detail, create product, and recognition. The router owns which
  screen is shown, and Redux owns the tray. No `activeScreen`-style state exists, as the
  "routes instead of modals" acceptance criterion requires.
- The date and Meal travel as typed, schema-validated search params on every route of the flow.
- Following ADR-0005, route files are thin adapters. The screens are router-agnostic feature UI
  that take plain values and callbacks, such as `onBack` or `onOpenProduct(productId)`.
- Nested screens use a **back** AppBar variant: a back arrow instead of the burger. The AppBar
  config's variant union gains `'back'` next to `'menu'`.
- The tray is a new Redux slice: an ordered list of items, each holding the product snapshot it
  needs to render and calculate calories, plus a quantity. The slice resets when the flow is
  entered. It is not persisted. The prototype's item shape encoded this:

  ```ts
  // from the prototype
  interface TrayItem {
    product: { id: number; name: string; calories: number; defaultQuantity: number; /* nutrition */ };
    quantity: number;
  }
  ```

- Tray operations: toggle (add with the default quantity, or remove if present), set quantity,
  remove, replace product (after **Edit product**: take the saved product and set its quantity to
  the new default quantity), and reset.
- The discard prompt uses the router's navigation blocker. It shows only while the tray is
  non-empty, and never after a successful **Log foods**.

### Entry and setting

- A per-device preference, "Log several foods at once", is stored in localStorage behind a small
  reader and writer in the shared layer. Reads fall back to off if storage is unavailable or
  throws.
- A new Settings route, linked from the navigation drawer, renders one switch for this preference
  with a "Stored on this device" hint.
- The existing Meal entry button reads the preference. When it is on, the button navigates to the
  flow's search route for that date and Meal. When it is off, it opens `NoteInputDialog` as today.
  The old dialog and the editing of an existing Food Log (`EditNote`) are unchanged.

### Search screen

- It reuses the existing product search query and its minimum query length.
- `Create "<query>"` replaces the overloaded `Add "<query>"` wording for the new flow. The old
  dialog's copy is left as it is.
- The camera action opens a file picker for one or more images, then navigates to the
  recognition route.

### Product create, edit and recognition

- Creating and editing reuse the existing product form and the existing create
  (`POST /api/v1/products`) and edit (`PUT /api/v1/products/{id}`) endpoints. After a create, the
  new product id from the response is put on the tray. The button label is **Create** on every
  create route.
- Recognition reuses `POST /api/v1/notes/recognitions` and today's mapping. Only the first
  suggestion is used. Its quantity becomes the form's default quantity. The picked images are
  handed to the recognition route through the flow's Redux state, in the same shape the old
  dialog's slice stores them, not through URL params.
- The camera action is shown in demo mode. The mock API's recognition handler already returns a
  mock suggestion.

### Batch endpoint

- New endpoint: `POST /api/v1/notes/batch`. The request and response contract names are the same
  on the backend and the frontend:

  ```
  CreateNotesRequest {
    date: DateOnly
    mealType: MealType
    notes: [{ productId: int, productQuantity: int }]   // tray order, at least one
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

### Docs

- `CLAUDE.md` claims that demo mode disables features touching external integrations, but photo
  upload works in demo mode with a mock. Correct that line as part of this work.

## Testing Decisions

A good test drives behaviour through the outermost interface a user or client touches and checks
what they would see: rendered text and roles on the frontend, HTTP responses and persisted Food
Logs on the backend. Tests never reach into slices, hooks, route internals or repositories. A
refactor that keeps behaviour must keep the tests green.

### Seam 1 — frontend, the whole app at its URL

- All flow tests live in one new file, `multiItemFoodLogging.test.tsx`, in the frontend test
  suite. They render the full app with the existing `renderApp(url, { signedIn: true })` helper
  against the MSW mock API.
- A test turns the switch on (through the Settings page, or by seeding the preference), starts
  from the day page, and drives the flow by role and label: **Add breakfast**, search, ⊕, the
  tray, the detail route, **Edit product**, `Create "<query>"`, the camera and recognition route,
  **Log foods**, and the discard prompt. It ends by checking the Food Logs listed on the day page.
- Cases to cover, at minimum:
  - the switch off opens the old dialog, and the switch on opens the new flow
  - ⊕ adds with the default quantity, clears and refocuses the search; ⊕ again removes
  - a quantity changed on the tray or on the detail screen is logged
  - an invalid quantity disables **Log foods**
  - **Edit product** updates the tray item's name and quantity
  - `Create "<query>"` returns to the search with the new product on the tray
  - photo recognition, through the mock suggestion, puts the created product on the tray
  - **Log foods** logs every item in tray order, after the Meal's existing Food Logs
  - a failed save keeps the tray and shows an error
  - leaving with a non-empty tray prompts, and leaving with an empty tray doesn't
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
  missing focus after ⊕, and an AppBar back arrow that doesn't return.
- Exercise what Vitest can't reach: the camera file input, the tray's expand and collapse
  layout, and the navigation blocker on the browser's own back.
- Check the console. The MSW-mode baseline errors are allowed; any other error is a defect.

## Out of Scope

- Removing the old `NoteInputDialog` flow. That is a follow-up issue.
- Editing an existing Food Log in the new flow. It stays in `EditNote`. Opening it in the new
  detail route is a possible follow-up.
- A recents or frequent-products list before typing.
- Using more than the first recognition suggestion.
- Matching recognition suggestions to existing Products.
- Persisting the tray across reloads.
- Copying a previous Meal, saved meals, barcodes and voice input.
- Partial success for the batch endpoint.
- Changing the old dialog's copy (`Add "<query>"`, **Add**).

## Further Notes

- Single-note `POST /api/v1/notes` keeps working unchanged, because the old dialog still uses it.
- The prototype branch is a primary source for layout and interaction details. It is not code to
  copy: it was written without tests or error handling, and its store is a module-level singleton.
- The `.scratch/routes-instead-of-modals/` research and ADR-0004 and ADR-0005 cover the routing
  approach this flow follows.
