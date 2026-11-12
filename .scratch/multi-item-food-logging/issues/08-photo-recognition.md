# 08: Recognise a product from a photo

**What to build:** A camera action in the search route's AppBar opens a file picker that allows one or more images, stores them in a `recognitionPhotos` slice, then goes to `/log/food/recognition`. That route shows skeletons while recognition runs, and an error with **Retry** if it fails. When recognition returns, it shows the product form prefilled from the first suggestion, with the recognised quantity as the default quantity. **Create** saves the Product, adds it to the Meal Draft and returns to the search. In demo mode the camera action is shown, and recognition returns the mock API's mock suggestion. See the spec's "State", "Search screen" and "Product create, edit and recognition" sections.

**Blocked by:** 07

**Status:** resolved

- [x] The `Image` type and the `File` → `Image` conversion move to `shared/lib`, and a multi-file picker with `onPick(images)` moves to `shared/ui`. `manageNote`'s `UploadImagesButton` becomes a wrapper around it, with its behaviour and tests unchanged
- [x] The search AppBar has a camera action (`-CameraSlot`, a wrapper around the shared picker). Picking one or more images goes to the recognition route
- [x] The photos reach the recognition route through `recognitionPhotos: Image[]` in `features/logFood/model`, not through URL params or the Meal Draft
- [x] The recognition route redirects to the search when `recognitionPhotos` is empty
- [x] Skeletons show while `POST /api/v1/notes/recognitions` runs. Request status comes from RTK Query, not from a slice
- [x] A failed recognition shows an error with **Retry**, and **Retry** sends the same photos again
- [x] The form is prefilled from the first suggestion only, with its quantity as the default quantity
- [x] **Create** adds the created product to the Meal Draft and returns to the search
- [x] `recognitionPhotos` is cleared when recognition succeeds, and on `mealDraftDiscarded` and `mealDraftLogged`
- [x] The camera action is visible in demo mode and works against the mock API
- [x] The `CLAUDE.md` line saying demo mode disables external-integration features is corrected
- [x] `multiItemFoodLogging.test.tsx` covers recognition through the mock suggestion, and the Retry path
