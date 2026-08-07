# Review AI Suggestions — Zoomable Photo Viewer

## Goal

AI recognition of product labels is not reliable enough to accept blindly, so every suggestion has to be checked against the photo. The "Review AI suggestions" screen only shows 128×128 thumbnails, which forces this loop on mobile:

1. Leave the app
2. Find the original photo in the gallery
3. Zoom it, read kcal / weight
4. Return to the app, compare
5. Leave again — the label has more numbers than fit in short-term memory
6. Return, compare
7. Repeat

The solution: tap a thumbnail to open a full-screen, pinch-zoomable viewer of the **original** photo, with the AI's suggested values pinned over it so the label and the suggestion are readable in one glance. This collapses the loop to a single tap and removes steps 1–2 and 5–7 entirely.

A separate, tracked idea tackles the accuracy of the suggestions themselves (a reviewer LLM plus a confidence score in the result). This spec is orthogonal to it — it makes *manual* verification cheap, and stays useful regardless of how the accuracy work lands.

## In scope

- Retain the untouched camera file per upload as an object URL, alongside the existing resized copy.
- New generic `shared/ui/ImageViewer` — a full-screen zoomable image dialog, the sole import site of the zoom library.
- `ImagePreviewList` thumbnails become buttons that open the viewer.
- A collapsible footer over the photo rendering `SuggestedProductCard`.
- Object-URL lifecycle management via an RTK listener middleware.
- Frontend component tests + a store-level lifecycle test; test-setup stubs.

## Out of scope

- **Swiping between uploaded photos in the viewer.** The viewer opens the tapped image only. A carousel would introduce swipe-vs-pan gesture arbitration while zoomed — the classic image-carousel bug — for a case that is usually context, not comparison. Close and tap another thumbnail to switch.
- **Any backend or API contract change.** The blob sent to `POST /api/v1/notes/recognize` is byte-for-byte what it is today; recognition payload size, latency, and OpenAI cost are unaffected.
- **Raising the 1024 px resize cap.** Rejected because it would enlarge every recognition upload as a side effect. The viewer reads the original instead.
- **Persisting photos.** Images remain transient dialog state, as today.
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

## Dependency

Add `react-zoom-pan-pinch@^4.0.4` to `src/frontend` dependencies. MIT, zero runtime dependencies, peer deps `react: *` / `react-dom: *` — compatible with React 18.

Chosen over hand-rolling the gesture: it handles pinch, drag-pan, double-tap-to-point, wheel, and bounds clamping, including the iOS touch edge cases that would otherwise be discovered one at a time. Since the entire point of the feature is reading small text on a phone, a janky gesture would fail the goal. The dependency is confined to a single file so it can be swapped without touching feature code.

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
     ├── ImagePreviewList  images, footer     ← owns `openedImage` local state
     │      └── ImageViewer  (shared/ui)      ← only import site of react-zoom-pan-pinch
     │             └── footer slot = <SuggestedProductCard/> | null
     └── SuggestedProductCard

   app/store.ts → listenerMiddleware → revokes object URLs no longer in state
```

### Files

| File | Change |
|---|---|
| `shared/ui/ImageViewer/ImageViewer.tsx` | New — generic full-screen zoomable image dialog |
| `shared/ui/ImageViewer/index.ts` | New — barrel |
| `shared/ui/index.ts` | Export `./ImageViewer` |
| `features/manageNote/model/types.ts` | `Image` gains `originalUrl: string` |
| `features/manageNote/model/imageUrlsListener.ts` | New — object-URL revocation listener |
| `features/manageNote/model/index.ts` | Export the listener middleware |
| `features/manageNote/ui/UploadImagesButton.tsx` | Create the object URL in `toImage` |
| `features/manageNote/ui/ImagePreviewList.tsx` | Thumbnails become buttons; owns opened-image state; renders the viewer |
| `features/manageNote/ui/ImageUploadStep.tsx` | Passes the `footer` node |
| `app/store.ts` | Prepend `imageUrlsListener.middleware` |
| `package.json` | Add `react-zoom-pan-pinch` |
| `tests/setup.ts` | Stub `URL.createObjectURL` / `revokeObjectURL` / `ResizeObserver` |

FSD direction is respected throughout: `features/manageNote` imports from `shared/ui`, never the reverse. `ImageViewer` carries no nutrition knowledge.

## Components

### `shared/ui/ImageViewer`

```tsx
interface Props {
  src: string;
  alt: string;
  opened: boolean;
  footer: ReactNode;
  onClose: () => void;
}
```

`footer` is required and callers pass `null` when there is nothing to show, per the project rule that props are required by default.

Layout:

```
+----------------------------------+  MUI Dialog, fullScreen, black paper
|                            (X)   |  close: floating IconButton, top-right
|                                  |  (+ Esc via MUI default)
|      ,--------------------.      |
|      | NUTRITION per 100g |      |  <TransformWrapper>
|      | Energy      412kcal|      |    minScale 1, maxScale 8
|      | Protein      8.1 g |      |    pinch | drag-pan | wheel
|      | Fat         12.4 g |      |    double-tap -> toggle 1x <-> 3x
|      `--------------------'      |    <img src={src} objectFit: contain>
|                                  |
| - - - - - - - - - - - - - -  [v] |  chevron collapses the footer
| +------------------------------+ |
| | Oat granola          100 g   | |  <-- footer slot
| | 412kcal P8.1 F12.4 C61 S0.1  | |
| +------------------------------+ |
+----------------------------------+  translucent bar, safe-area padded
```

- `TransformWrapper` config: `minScale={1}`, `maxScale={8}`, `centerOnInit`, `doubleClick={{ mode: 'toggle', step: 3 }}`, `wheel={{ step: 0.2 }}`, and `limitToBounds` left at its default `true` so the photo cannot be flung off-screen.
- The footer sits in a translucent bar pinned to the bottom, padded with `env(safe-area-inset-bottom)`, wrapped in a MUI `Collapse` toggled by a chevron `IconButton` so it never permanently hides part of the label. Default expanded.
- The `<img>` has an `onError` fallback described under Error handling.

### `features/manageNote/ui/ImagePreviewList`

```tsx
interface Props {
  images: Image[];
  footer: ReactNode;
}
```

Keeps today's 128×128 `objectFit: cover` thumbnails, wrapped in `ButtonBase` with an accessible name (`Open uploaded image preview {n}`). Holds `const [openedImage, setOpenedImage] = useState<Image | null>(null)` — ephemeral UI state, deliberately not in Redux — and renders one `ImageViewer` driven by it, sourced from `openedImage.originalUrl`.

It receives `footer` as an opaque node rather than a `suggestion`, so it stays presentational and ignorant of nutrition.

### `features/manageNote/ui/ImageUploadStep`

Supplies the footer on both branches that render the list:

- Success branch: `footer={<SuggestedProductCard suggestion={suggestion} />}`
- "No food found" branch: `footer={null}` — the viewer still opens.

`SuggestedProductCard` is reused **verbatim**, not reimplemented as a compact variant. The numbers compared against the label are therefore literally the same component as the card below, and the two cannot drift apart.

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

- **Dead object URL.** The viewer's `<img>` has an `onError` handler that swaps `src` to the image's `base64`. If an original URL is ever revoked early, the user sees the 1024 px copy — degraded, not a broken-image icon.
- **No suggestion.** `footer={null}`; the viewer opens normally.
- **Demo mode.** `DEMO_MODE_ENABLED` (`shared/config.ts:9`) does not gate photo upload today and needs no change here.
- **Desktop.** Wheel zoom and drag-pan cover the mouse case; the viewer is not mobile-only.

## Test plan

Vitest + React Testing Library, jsdom.

### `tests/setup.ts`

Add stubs for `URL.createObjectURL` / `URL.revokeObjectURL` (absent in jsdom) and `ResizeObserver` (observed by the zoom library).

### `features/manageNote/ui/ImagePreviewList.test.tsx` (new)

- Renders one button per image, each with an accessible name.
- Tapping a thumbnail opens the viewer with an `img` whose `src` is that image's `originalUrl` — explicitly asserting it is **not** the resized `base64`.
- The `footer` node renders inside the opened viewer.
- The close button dismisses the viewer.
- With `footer={null}`, the viewer still opens.

### `features/manageNote/model/imageUrlsListener.test.ts` (new)

Pure store test, no React:

- `imagesUploaded([A, B])` then `noteDraftDiscarded()` → `revokeObjectURL` called with both URLs.
- `imagesUploaded([A, B])` then `imagesUploaded([C])` → A and B revoked, C not.
- `productDraftSaved` clears images → their URLs revoked.

### `features/manageNote/model/manageNoteSlice.test.ts` (update)

Existing `Image` fixtures need the new required `originalUrl` field.

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
