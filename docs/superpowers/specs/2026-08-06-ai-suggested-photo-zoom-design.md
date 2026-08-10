# Review AI Suggestions — Zoomable Photo Viewer & Inline Editing

## Goal

AI recognition of product labels is not reliable enough to accept blindly, so every suggestion has to be checked against the photo — and, when it's wrong, corrected. The "Review AI suggestions" screen originally showed only 128×128 thumbnails and a read-only card, which forced two separate loops:

1. **Reading the label.** Leave the app → find the original photo in the gallery → zoom it, read kcal / weight → return to the app, compare → leave again because the label has more numbers than fit in short-term memory → return, compare → repeat.
2. **Fixing a mistake.** Press **Accept** to reach the product form — which shows no photo — so a wrong value has to be corrected from memory, reintroducing loop 1 at the exact moment it matters most.

The fix has two parts, designed together and implemented as one arc:

- **Zoomable viewer.** Tap a thumbnail to open a full-screen, pinch-zoomable viewer of the **original** photo. This collapses loop 1 to a single tap.
- **Inline editing.** Render the suggestion directly into `ProductForm`, prefilled, with the photo thumbnails above it, and remove the separate Accept step. Mistakes are corrected where they are spotted, with the photo one tap away, collapsing loop 2.

Together these remove the "leave the app to compare" and "no photo during correction" gaps entirely.

A separate, tracked idea tackles the accuracy of the suggestions themselves (a reviewer LLM plus a confidence score in the result). This work is orthogonal to it — it makes *manual* verification and correction cheap, and stays useful regardless of how the accuracy work lands.

## In scope

- Retain the untouched camera file per upload as an object URL, alongside the existing resized copy.
- New generic `shared/ui/ImageViewer` — a full-screen zoomable image dialog, the sole import site of the zoom library.
- `ImagePreviewList` thumbnails become buttons that open the viewer.
- Object-URL lifecycle management via an RTK listener middleware.
- `ImageUploadStep` renders `ProductForm` prefilled from the suggestion instead of a read-only card.
- The **Accept** button is removed; the dialog's own submit button drives the product form.
- `SuggestedProductCard` is deleted; its skeleton is renamed and reshaped to match the form.
- `ProductForm` gains an `autoFocus` prop.
- Frontend component tests + a store-level lifecycle test; test-setup stubs.

## Out of scope

- **Swiping between uploaded photos in the viewer.** The viewer opens the tapped image only. A carousel would introduce swipe-vs-pan gesture arbitration while zoomed — the classic image-carousel bug — for a case that is usually context, not comparison. Close and tap another thumbnail to switch.
- **Any backend or API contract change.** The blob sent to `POST /api/v1/notes/recognize` is byte-for-byte what it is today; recognition payload size, latency, and OpenAI cost are unaffected.
- **Raising the 1024 px resize cap.** Rejected because it would enlarge every recognition upload as a side effect. The viewer reads the original instead.
- **Persisting photos.** Images remain transient dialog state, as today.
- **A new screen state.** The form is rendered inside the existing `image-upload` screen. No new member of `ManageNoteScreenState`.
- **Editing while the viewer is open.** The viewer is full-screen and stays that way; correcting a value is close → type. Overlaying an editable form on a zoomed photo would fight the on-screen keyboard for the space the photo needs.
- **Any reducer change beyond the `activeScreen` selector.** No slice reducer is touched.
- **Gesture unit tests.** See Test plan.
- **Playwright E2E coverage.** The suite requires Docker; excluded from this change.

## Key constraints discovered

| Constraint | Source | Consequence |
|---|---|---|
| Uploads are downscaled to max 1024×1024 JPEG q0.9 and the original `File` is discarded | `shared/lib/image.ts:8`, `UploadImagesButton.tsx:10` | Zooming today's preview data has a hard detail ceiling; the original must be retained separately |
| PWA runs `display: 'standalone'` | `vite.config.ts:39` | Mobile browsers suppress native pinch-to-zoom; the viewer must own the gesture |
| `NoteInputDialog` is instantiated per meal type **and** per note | `AddNoteButton.tsx:46`, `EditNote.tsx:31` | Many instances are mounted at once, so object-URL cleanup cannot live in a component effect there |
| `manageNote.images` is cleared by four separate reducers and replaced by a fifth | `manageNoteSlice.ts` | Cleanup keyed to individual actions would be fragile; a state-diff listener is used instead |
| `tests/setup.ts` stubs neither `URL.createObjectURL` nor `ResizeObserver` | `tests/setup.ts` | Both need stubbing for the new tests |
| `useForm({ defaultValues })` reads its defaults once, at mount | react-hook-form | The category list must be loaded before the form mounts, or `category: null` bakes in permanently — see Mount-time defaults below |

## Dependency

Add `react-zoom-pan-pinch@^4.0.4` to `src/frontend` dependencies. MIT, zero runtime dependencies, peer deps `react: *` / `react-dom: *` — compatible with React 18.

Chosen over hand-rolling the gesture: it handles pinch, drag-pan, double-tap-to-point, wheel, and bounds clamping, including the iOS touch edge cases that would otherwise be discovered one at a time. Since the entire point of the feature is reading small text on a phone, a janky gesture would fail the goal. The dependency is confined to a single file so it can be swapped without touching feature code.

## Flow

Before:

```
photo → review (read-only card) → Accept → product form (no photo) → Add → note form → Add
```

After:

```
photo → review + edit (zoomable thumbnails + product form) → Add → note form → Add
```

One step shorter, the photo is present at the only step where the numbers can be wrong, and it's zoomable next to the label.

## Architecture

```
UploadImagesButton.toImage(file)
   ├─ resize(1024) → base64          → API payload + thumbnail  (unchanged)
   └─ URL.createObjectURL(file)      → originalUrl              (new)
                │
        dispatch(imagesUploaded)
                │
       Redux  manageNote.images
                │
   ImageUploadStep  (container)
     ├── ImagePreviewList  images        ← owns `openedImage` local state
     │      └── ImageViewer  (shared/ui) ← only import site of react-zoom-pan-pinch
     └── ProductForm  formId="product-form"  defaultValues from suggestion

   app/store.ts → listenerMiddleware → revokes object URLs no longer in state
```

### Files

| File | Change |
|---|---|
| `shared/ui/ImageViewer/ImageViewer.tsx` | New — generic full-screen zoomable image dialog |
| `shared/ui/ImageViewer/index.ts` | New — barrel |
| `shared/ui/index.ts` | Export `./ImageViewer` |
| `features/manageNote/model/types.ts` | `Image` gains `originalUrl: string`; `ImageUploadScreenState` gains `formId: 'product-form' \| null` |
| `features/manageNote/model/manageNoteSlice.ts` | `activeScreen` takes `noteRecognition.suggestions` and computes `formId` |
| `features/manageNote/model/imageUrlsListener.ts` | New — object-URL revocation listener |
| `features/manageNote/model/index.ts` | Export the listener middleware |
| `features/manageNote/ui/UploadImagesButton.tsx` | Create the object URL in `toImage` |
| `features/manageNote/ui/ImagePreviewList.tsx` | Thumbnails become buttons; owns opened-image state; renders the viewer |
| `features/manageNote/ui/ImageUploadStep.tsx` | Renders `ProductForm`; drops Accept; new `onSubmitProduct` prop; `toProductFormValues` mapper; categories-loading gate |
| `features/manageNote/ui/NoteInputDialog.tsx` | Passes `onSubmitProduct`; submit button keys off `activeFormId`; `autoFocus` on `ProductForm` |
| `features/manageNote/ui/SuggestedProductCard.tsx` | Deleted |
| `features/manageNote/ui/SuggestedProductCardSkeleton.tsx` | Renamed to `SuggestionSkeleton.tsx`, reshaped to the form layout |
| `entities/product/ui/ProductForm.tsx` | Adds required `autoFocus` prop |
| `features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx` | Passes `autoFocus` |
| `app/store.ts` | Prepend `imageUrlsListener.middleware` |
| `package.json` | Add `react-zoom-pan-pinch` |
| `tests/setup.ts` | Stub `URL.createObjectURL` / `revokeObjectURL` / `HTMLImageElement.decode` / `ResizeObserver` |

FSD direction is respected throughout: `features/manageNote` imports from `shared/ui`, never the reverse. `ImageViewer` carries no nutrition knowledge.

## Screen state & submit wiring

The dialog's submit button lives in `NoteInputDialog`, outside the step, so the screen state has to say whether a form is currently mounted. `ImageUploadScreenState` gains a **required, nullable** `formId`:

```ts
interface ImageUploadScreenState {
  type: 'image-upload';
  formId: 'product-form' | null;
  images: Image[];
}
```

`activeScreen` computes it from the recognition result, taking `noteRecognition.suggestions` as an additional input selector:

```ts
if (images.length > 0) {
  return {
    type: 'image-upload',
    formId: suggestions.at(0)?.product ? 'product-form' : null,
    images,
  };
}
```

`NoteInputDialog` drops `inputScreenActive` and keys off the form id directly:

```ts
const activeFormId = 'formId' in activeScreen ? activeScreen.formId : null;

// submit button
form={activeFormId ?? undefined}
disabled={activeFormId === null || submitDisabled}
```

Behaviour that falls out of this, with no reducer changes. `formId` reflects that a form is warranted, not that one is mounted, so two rows below carry a caveat:

| State | `formId` | Submit button |
|---|---|---|
| Analyzing images (first run — no prior suggestion) | `null` | disabled (also `submitDisabled` from `noteRecognitionStarted`) |
| Analyzing images (retry — prior suggestion had a product) | `'product-form'` (stale — form unmounted) | disabled by `submitDisabled` from `noteRecognitionStarted`, not by `formId` |
| Recognition failed | `null` | disabled |
| No food found | `null` | disabled |
| Categories still loading (suggestion has a product) | `'product-form'` (form not yet mounted — skeleton shown) | enabled; targets a `form` id that isn't in the DOM, so a tap does nothing. Accepted rather than fixed |
| Suggestion with a product, categories loaded | `'product-form'` | enabled, label "Add" from the existing `submitText` selector |

`state.product` is never set in the photo flow. Nothing depends on it: `useSubmitProduct` reads only its argument, and `productDraftSaved` needs only `state.note`. On a successful save it clears `images` and `noteRecognition`, the object-URL listener revokes the originals, and the note form takes over — exactly as it does today after the Accept-then-Add path.

`actions.productDraftCreated` keeps its other caller (`ProductSearchResults`) and is left alone.

## Components

### `shared/ui/ImageViewer`

```tsx
interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  opened: boolean;
  onClose: () => void;
}
```

Layout:

```
+----------------------------------+  MUI Dialog, fullScreen, black paper
|                            (X)   |  close: floating IconButton, top-right
|                                  |  (+ Esc via MUI default)
|                                  |  <TransformWrapper>
|            [photo]               |    minScale 1, maxScale 8
|                                  |    pinch | drag-pan | wheel
|                                  |    double-tap -> toggle 1x <-> 3x
+----------------------------------+    <img src={src} objectFit: contain>
```

- `TransformWrapper` config: `minScale={1}`, `maxScale={8}`, `centerOnInit`, `doubleClick={{ mode: 'toggle', step: 3 }}`, `wheel={{ step: 0.2 }}`, and `limitToBounds` left at its default `true` so the photo cannot be flung off-screen.
- The `<img>` shows `fallbackSrc` (the resized `base64`, already decoded for the thumbnail) from the first frame. The original is decoded out of band — `new Image()` + `await decode()` in an effect keyed on `opened` / `src` — and swapped in only once it succeeds. See Error handling.
- No `footer` prop: nutrition values now live in the `ProductForm` below the thumbnails rather than pinned over the photo, so there is nothing left for the viewer to render on top of the image. (An earlier iteration of this design pinned a read-only `SuggestedProductCard` in a collapsible bottom bar; it was removed once the numbers became editable on-screen and would otherwise have duplicated them while covering part of the label.)

### `features/manageNote/ui/ImagePreviewList`

```tsx
interface Props {
  images: Image[];
}
```

Keeps today's 128×128 `objectFit: cover` thumbnails, wrapped in `ButtonBase` with an accessible name (`Open uploaded image preview {n}`). Holds `const [openedImage, setOpenedImage] = useState<Image | null>(null)` — ephemeral UI state, deliberately not in Redux — and renders one `ImageViewer` driven by it, sourced from `openedImage.originalUrl`.

### `features/manageNote/ui/ImageUploadStep`

```tsx
interface Props {
  images: Image[];
  onSubmitProduct: OnSubmitProductFn;
}
```

`useSubmitProduct(date)` is already called in `NoteInputDialog`; the handler is passed down rather than threading `date` into the step. Categories continue to come from `categoryLib.useCategoriesForSelect()` inside the step, which now also reads `categoriesLoading`.

Success branch:

```tsx
<Stack spacing={3}>
  <Typography variant="h6" component="h2">Review AI suggestions</Typography>
  <ImagePreviewList images={images} />
  <ProductForm
    formId="product-form"
    autoFocus={false}
    defaultValues={toProductFormValues(suggestion, categories.at(0) ?? null)}
    categories={categories}
    categoriesLoading={categoriesLoading}
    onSubmit={onSubmitProduct}
  />
  <Button startIcon={<RefreshIcon />} variant="outlined" fullWidth disabled={isSubmitting} onClick={() => recognizeNotes(images)}>
    Retry
  </Button>
</Stack>
```

`toProductFormValues` is a module-level mapper holding the object literal lifted verbatim out of the original Accept handler:

```ts
const toProductFormValues = (
  { product, quantity }: RecognizeNoteItem,
  category: SelectOption | null,
): productModel.ProductFormValues => ({
  name: product.name.trim(),
  defaultQuantity: quantity,
  category,
  calories: product.caloriesCost,
  protein: product.protein,
  fats: product.fats,
  carbs: product.carbs,
  sugar: product.sugar,
  salt: product.salt,
});
```

**Mount-time defaults.** `useForm({ defaultValues })` reads its defaults once, at mount. Under the old Accept flow the category was resolved when Accept was clicked, by which point the category list had certainly loaded. With the form mounted as soon as the suggestion arrives, an unloaded list would bake `category: null` into the form permanently and the user would have to pick one by hand. The success branch therefore renders `SuggestionSkeleton` while `categoriesLoading` is true and mounts the form only after. Retry is unaffected: recognition loading unmounts the form, so a retry remounts it with fresh defaults.

The error and "no food found" branches are unchanged aside from no longer passing a `footer` prop to `ImagePreviewList`.

### `features/manageNote/ui/SuggestionSkeleton`

`SuggestedProductCardSkeleton` is renamed to `SuggestionSkeleton` and reshaped to match what it stands in for — the product form, not the deleted card:

```
[ Name                          ]   full-width rounded, 56px
[ Category                      ]   full-width rounded, 56px
[ Calories      ] [ Quantity    ]   two half-width rounded, 56px
[ Nutrition                   v ]   accordion summary bar, 48px
```

Built from MUI `Skeleton variant="rounded"` in the same `Grid2` split `ProductForm` uses for the calories/quantity row, so the placeholder and the real form occupy comparable height and the screen does not jump when the form mounts.

### `entities/product/ui/ProductForm`

Gains a required `autoFocus: boolean` prop, replacing the hardcoded `autoFocus` on the Name field. The review screen passes `false` — its purpose is looking at a photo, and popping the mobile keyboard on arrival hides it. Both existing call sites, `NoteInputDialog`'s product-input branch and `features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx`, pass `true`, preserving current behaviour.

### Deleted

`features/manageNote/ui/SuggestedProductCard.tsx` — no consumers once the review screen renders the editable form directly.

## Data flow & object-URL lifecycle

The resized `base64` keeps doing exactly what it does today: it backs the thumbnail and is converted to the blob posted to `/notes/recognize` (`useRecognizeNotes.ts:8`). `originalUrl` is read *only* by the viewer.

`URL.createObjectURL` pins the full camera file in memory until revoked. `manageNote.images` is emptied by `noteDraftDiscarded`, `noteDraftSaved`, `productDraftDiscarded` and `productDraftSaved`, and replaced wholesale by `imagesUploaded` on re-upload. Rather than touch five call sites — or place an effect in a component mounted many times over — a single RTK listener watches the slice:

```ts
// features/manageNote/model/imageUrlsListener.ts
interface ImagesListenerState {
  manageNote: ManageNoteState;
}

export const imageUrlsListener = createListenerMiddleware<ImagesListenerState>();

imageUrlsListener.startListening({
  predicate: (_, currentState, previousState) =>
    currentState.manageNote.images !== previousState.manageNote.images,
  effect: (_, { getState, getOriginalState }) => {
    const liveUrls = new Set(getState().manageNote.images.map(i => i.originalUrl));
    getOriginalState()
      .manageNote.images.filter(i => !liveUrls.has(i.originalUrl))
      .forEach(i => URL.revokeObjectURL(i.originalUrl));
  },
});
```

`createListenerMiddleware` is first-party RTK, so this adds no dependency. Reducers stay pure, every current clearing path is covered, and any path added later is covered automatically without further edits.

The middleware is typed against a **local** `ImagesListenerState` rather than the app's `RootState`. `RootState` lives in `app/store.ts`, and FSD forbids a feature importing from the app layer — even as a type. Typing it structurally keeps the import direction correct and avoids an `app → feature → app` cycle.

`app/store.ts` registers it ahead of the API middleware, as RTK requires:

```ts
middleware: getDefaultMiddleware =>
  getDefaultMiddleware().prepend(imageUrlsListener.middleware).concat(api.middleware),
```

The effect body must stay synchronous: `getOriginalState()` throws if called after an `await`. There is nothing async to do here, so this is a constraint to preserve rather than work around.

## Error handling & edge cases

- **Dead object URL.** The viewer only swaps in the original after `decode()` resolves, so a revoked URL leaves the 1024 px copy on screen — degraded, not a broken-image icon.
- **Open latency.** A 12 MP camera file is ~10 MB and is not read from disk until an `<img>` requests it; measured at ~60 ms to decode on a desktop and multiples of that on a phone, which is long enough to make the viewer feel unresponsive on open. Showing the resized copy first removes that from the open path — it decodes in ~0–6 ms and is already in memory behind the thumbnail.
- **Validation.** `productSchema` already governs the fields, so a bad AI value (e.g. calories out of range) now surfaces as a field error on the review screen instead of being accepted silently and rejected a step later.
- **No categories exist.** `categories.at(0) ?? null` leaves the category empty and `productSchema`'s "Category is required" refinement blocks submission — visible on the review screen rather than after Accept.
- **Retry while editing.** Retry re-runs recognition, which unmounts the form; edits are discarded. This matches the pre-existing behaviour, where Retry discarded the card being reviewed.
- **No food found / recognition error.** No form, submit disabled, thumbnails still open the viewer.
- **Demo mode.** `DEMO_MODE_ENABLED` (`shared/config.ts:9`) does not gate photo upload and needs no change here.
- **Desktop.** Wheel zoom and drag-pan cover the mouse case; the viewer is not mobile-only.

## Test plan

Vitest + React Testing Library, jsdom.

### `tests/setup.ts`

Add stubs for `URL.createObjectURL` / `URL.revokeObjectURL` and `HTMLImageElement.prototype.decode` (absent in jsdom) and `ResizeObserver` (observed by the zoom library).

### `shared/ui/ImageViewer/ImageViewer.test.tsx` (new)

- Open/close behaviour, `alt` text, that `fallbackSrc` shows on the opening frame, that the original replaces it once decoded, and that a failed decode leaves `fallbackSrc` in place.

### `features/manageNote/ui/ImagePreviewList.test.tsx` (new)

- Renders one button per image, each with an accessible name.
- Tapping a thumbnail opens the viewer and, once the original has decoded, its `img` `src` is that image's `originalUrl` — explicitly asserting it is **not** the resized `base64`.
- The close button dismisses the viewer.

### `features/manageNote/ui/ImageUploadStep.test.tsx` (new)

- Suggestion present → the form renders prefilled with the suggested name, calories and quantity.
- Editing calories and submitting `product-form` calls `onSubmitProduct` with the edited value.
- Retry re-runs recognition.
- No food found → warning and thumbnails, no form.
- `categoriesLoading` → skeleton, no form.

### `features/manageNote/model/imageUrlsListener.test.ts` (new)

Pure store test, no React:

- `imagesUploaded([A, B])` then `noteDraftDiscarded()` → `revokeObjectURL` called with both URLs.
- `imagesUploaded([A, B])` then `imagesUploaded([C])` → A and B revoked, C not.
- `productDraftSaved` clears images → their URLs revoked.

### `features/manageNote/model/manageNoteSlice.test.ts` (update)

- Existing `Image` fixtures need the new required `originalUrl` field.
- `activeScreen` returns `formId: 'product-form'` when a suggestion with a product exists and `formId: null` when the suggestions list is empty or the suggestion has no product.

### Deliberately not tested

Pinch, pan and double-tap behaviour. jsdom has no layout engine, so `react-zoom-pan-pinch`'s transforms — which are computed from real element dimensions — cannot be meaningfully asserted. Such a test would exercise the library rather than this code. Gesture behaviour is verified by hand on a phone instead.

## Verification

From `src/frontend/`: `yarn build`, `yarn test`, `yarn lint`.

No backend work, so no `dotnet` run is required and the shared-contract-naming rule does not apply.

## Documentation

No env vars, Node/npm, or .NET versions change, so README.md and CLAUDE.md need no updates.

## Risks

- **Memory.** Full-resolution files stay in memory while the note dialog is open. Bounded by the number of photos in one upload (typically 1–2) and released by the listener as soon as the dialog closes or the images are replaced.
- **Object-URL lifecycle is the one genuinely error-prone part.** Mitigated by centralising it in a single tested listener and by the `onError` fallback to `base64`.
- **New runtime dependency.** Confined to `shared/ui/ImageViewer`, so replacing or removing it later touches one file.
- **Structural middleware typing.** Typing the listener against `ImagesListenerState` instead of `RootState` is the FSD-correct choice but leans on TypeScript accepting the narrower state type at the `configureStore` call. If it does not, the fallback is for `imageUrlsListener.ts` to export a `setupImageUrlsListener(startListening)` registration function and let `app/store.ts` own the typed middleware instance — same behaviour, same import direction.
- **Mount-time form defaults.** The one genuinely fragile point of the inline-edit half; handled by the `categoriesLoading` gate and covered by a test.
- **Longer review screen.** The form is taller than the old card, so the thumbnails may scroll out of view on small phones while editing. Accepted: the photo is one tap away and the alternative — a sticky photo strip — spends scarce vertical space on every screen to save a scroll on some.
- **`autoFocus` prop churn.** Three call sites, mechanical, caught by the compiler.
