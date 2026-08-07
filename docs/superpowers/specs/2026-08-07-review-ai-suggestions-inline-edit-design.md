# Review AI Suggestions — Inline Editing

Amends [2026-08-06-ai-suggested-photo-zoom-design.md](./2026-08-06-ai-suggested-photo-zoom-design.md). The zoomable viewer built there stays; its footer and the read-only suggestion card are removed, and the review screen becomes an editable form.

## Goal

The zoom viewer made the AI's numbers readable next to the label, but the "Review AI suggestions" screen is still read-only. Finding a mistake means pressing **Accept** to reach the product form — and that form shows no photo. The original loop returns at the exact moment it matters most: when a value has to be corrected.

The fix is to make the review screen the editable form. The suggestion is rendered directly into `ProductForm`, prefilled, with the photo thumbnails above it. Mistakes are corrected where they are spotted, with the photo one tap away, and the separate Accept step disappears.

With values editable in place, the viewer's footer has no job left — it duplicated numbers that are now on screen and covered part of the label. It goes.

## In scope

- `ImageUploadStep` renders `ProductForm` prefilled from the suggestion instead of `SuggestedProductCard`.
- The **Accept** button is removed; the dialog's own submit button drives the product form.
- `ImageViewer` loses its `footer` prop and the collapse affordance; `ImagePreviewList` loses its `footer` prop.
- `SuggestedProductCard` is deleted; its skeleton is renamed and reshaped to match the form.
- `ProductForm` gains an `autoFocus` prop.
- Test updates across the touched components plus a new `ImageUploadStep` test.

## Out of scope

- **A new screen state.** The form is rendered inside the existing `image-upload` screen. No new member of `ManageNoteScreenState`.
- **Editing while the viewer is open.** The viewer is full-screen and stays that way; correcting a value is close → type. Overlaying an editable form on a zoomed photo would fight the on-screen keyboard for the space the photo needs.
- **Any backend, API contract, or reducer change.** No slice reducer is touched; only the `activeScreen` selector changes.
- **Playwright E2E coverage.** The suite requires Docker; excluded, as in the preceding spec.

## Flow

Before:

```
photo → review (read-only card) → Accept → product form (no photo) → Add → note form → Add
```

After:

```
photo → review + edit (photo thumbnails + product form) → Add → note form → Add
```

One step shorter, and the photo is present at the only step where the numbers can be wrong.

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

`toProductFormValues` is a module-level mapper holding the object literal lifted verbatim out of today's Accept handler:

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

**Mount-time defaults.** `useForm({ defaultValues })` reads its defaults once, at mount. Today the category is resolved when Accept is clicked, by which point the category list has certainly loaded. With the form mounted as soon as the suggestion arrives, an unloaded list would bake `category: null` into the form permanently and the user would have to pick one by hand. The success branch therefore renders `SuggestionSkeleton` while `categoriesLoading` is true and mounts the form only after. Retry is unaffected: recognition loading unmounts the form, so a retry remounts it with fresh defaults.

The error and "no food found" branches are unchanged apart from dropping the `footer` prop from `ImagePreviewList`.

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

Removed: the `footer` prop, the translucent bottom bar with its `env(safe-area-inset-bottom)` padding, the MUI `Collapse`, the chevron `IconButton`, the `footerExpanded` state and the `ExpandLess`/`ExpandMore` imports. The zoom behaviour, the close button and the `onError` fallback to `fallbackSrc` are untouched.

`ImageViewer` has no other consumer, so the prop is removed outright rather than left in place accepting `null`.

### `features/manageNote/ui/ImagePreviewList`

```tsx
interface Props {
  images: Image[];
}
```

Thumbnails, accessible names, `openedImage` local state and the `originalUrl` source are all unchanged.

### `features/manageNote/ui/SuggestionSkeleton`

`SuggestedProductCardSkeleton` is renamed to `SuggestionSkeleton` and reshaped to match what it is standing in for — the product form, not the deleted card:

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

`features/manageNote/ui/SuggestedProductCard.tsx` — no consumers once the footer and the review card are gone.

## Files

| File | Change |
|---|---|
| `features/manageNote/model/types.ts` | `ImageUploadScreenState` gains `formId: 'product-form' \| null` |
| `features/manageNote/model/manageNoteSlice.ts` | `activeScreen` takes `noteRecognition.suggestions` and computes `formId` |
| `features/manageNote/ui/ImageUploadStep.tsx` | Renders `ProductForm`; drops Accept; new `onSubmitProduct` prop; `toProductFormValues` mapper; categories-loading gate |
| `features/manageNote/ui/NoteInputDialog.tsx` | Passes `onSubmitProduct`; submit button keys off `activeFormId`; `autoFocus` on `ProductForm` |
| `features/manageNote/ui/ImagePreviewList.tsx` | Drops `footer` |
| `features/manageNote/ui/SuggestedProductCard.tsx` | Deleted |
| `features/manageNote/ui/SuggestedProductCardSkeleton.tsx` | Renamed to `SuggestionSkeleton.tsx`, reshaped to the form layout |
| `shared/ui/ImageViewer/ImageViewer.tsx` | Drops `footer` and the collapse affordance |
| `entities/product/ui/ProductForm.tsx` | Adds required `autoFocus` prop |
| `features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx` | Passes `autoFocus` |

## Error handling & edge cases

- **Validation.** `productSchema` already governs the fields, so a bad AI value (e.g. calories out of range) now surfaces as a field error on the review screen instead of being accepted silently and rejected a step later.
- **No categories exist.** `categories.at(0) ?? null` leaves the category empty and `productSchema`'s "Category is required" refinement blocks submission — visible on the review screen rather than after Accept.
- **Retry while editing.** Retry re-runs recognition, which unmounts the form; edits are discarded. This matches today's behaviour, where Retry discards the card being reviewed.
- **No food found / recognition error.** No form, submit disabled, thumbnails still open the viewer.

## Test plan

Vitest + React Testing Library, jsdom.

### `shared/ui/ImageViewer/ImageViewer.test.tsx` (update)

Drop the footer-rendering and collapse-toggle cases; update remaining renders to the new props. Open/close, `alt`, and the `onError` fallback cases stay.

### `features/manageNote/ui/ImagePreviewList.test.tsx` (update)

Drop the `footer` prop and the two footer cases. The button-per-image, `originalUrl`-not-`base64`, and close cases stay.

### `features/manageNote/ui/ImageUploadStep.test.tsx` (new)

- Suggestion present → the form renders prefilled with the suggested name, calories and quantity.
- Editing calories and submitting `product-form` calls `onSubmitProduct` with the edited value.
- Retry re-runs recognition.
- No food found → warning and thumbnails, no form.
- `categoriesLoading` → skeleton, no form.

### `features/manageNote/model/manageNoteSlice.test.ts` (update)

`activeScreen` returns `formId: 'product-form'` when a suggestion with a product exists and `formId: null` when the suggestions list is empty or the suggestion has no product.

### Deliberately not tested

Gesture behaviour in the viewer, unchanged from the preceding spec and for the same reason: jsdom has no layout engine.

## Verification

From `src/frontend/`: `yarn build`, `yarn test`, `yarn lint`.

No backend work, so no `dotnet` run is required and the shared-contract-naming rule does not apply.

## Documentation

No env vars, Node/npm, or .NET versions change, so README.md and CLAUDE.md need no updates.

## Risks

- **Mount-time form defaults.** The one genuinely fragile point; handled by the `categoriesLoading` gate and covered by a test.
- **Longer review screen.** The form is taller than the card, so the thumbnails may scroll out of view on small phones while editing. Accepted: the photo is one tap away and the alternative — a sticky photo strip — spends scarce vertical space on every screen to save a scroll on some.
- **`autoFocus` prop churn.** Three call sites, mechanical, caught by the compiler.
