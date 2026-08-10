# Derive `imageUrlsListener` state type from the slice

**Date:** 2026-08-10
**Scope:** `src/frontend/src/features/manageNote/model/imageUrlsListener.ts`

## Problem

`imageUrlsListener.ts` types its middleware with a hand-written interface:

```ts
// Typed structurally because importing RootState from the app layer would invert FSD direction
interface ImagesListenerState {
  manageNote: ManageNoteState;
}

export const imageUrlsListener = createListenerMiddleware<ImagesListenerState>();
```

The FSD constraint is real — `features/` cannot import `RootState` from `app/`. But the workaround duplicates the store key `'manageNote'` by hand, and the effect body repeats it again as a raw path (`currentState.manageNote.images`). Every one of those is a place to edit when the store shape changes.

## Solution

RTK 2 exports `WithSlice<A>`, defined as `{ [Path in SliceLikeReducerPath<A>]: SliceLikeState<A> }` — the state shape a slice contributes to the store, derived from the slice's own `reducerPath` (which defaults to `name`). For `manageNoteSlice` that resolves to `{ manageNote: ManageNoteState }`: structurally identical to the current interface, but computed rather than written.

This is the same typing the slice's existing `selectors` already use. `NoteInputDialog.tsx` calls `useAppSelector(selectors.activeScreen)` with `RootState` today, so the listener ends up consistent with the rest of the feature rather than introducing a new mechanism.

### Change 1 — derive the state type

```ts
import { type WithSlice, createListenerMiddleware } from '@reduxjs/toolkit';
import { manageNoteSlice } from './manageNoteSlice';

export const imageUrlsListener = createListenerMiddleware<WithSlice<typeof manageNoteSlice>>();
```

Delete `interface ImagesListenerState`. Renaming `name: 'manageNote'` or reshaping `ManageNoteState` now propagates automatically.

### Change 2 — read through the slice, not a literal path

The type alone still leaves `currentState.manageNote.images` hardcoding the key. `manageNoteSlice.selectSlice` is typed against exactly the `WithSlice` shape, so use it in both the predicate and the effect:

```ts
predicate: (_action, currentState, previousState) =>
  manageNoteSlice.selectSlice(currentState).images !==
  manageNoteSlice.selectSlice(previousState).images,

effect: (_action, { getState, getOriginalState }) => {
  const liveUrls = new Set(
    manageNoteSlice.selectSlice(getState()).images.map(image => image.originalUrl),
  );

  manageNoteSlice
    .selectSlice(getOriginalState())
    .images.filter(image => !liveUrls.has(image.originalUrl))
    .forEach(image => {
      URL.revokeObjectURL(image.originalUrl);
    });
},
```

`selectSlice` is preferred over adding an `images` entry to the slice's `selectors` map: a single caller does not justify new public API on the slice.

### Change 3 — comments

- The FSD comment above the deleted interface moves to the `createListenerMiddleware` call, reworded for the new type. The constraint it records still holds and is the kind `.claude/rules/coding.md` keeps.
- The existing `// Must stay synchronous: getOriginalState() throws once the effect has awaited` comment is unchanged.

### Imports

`manageNoteSlice.ts` imports nothing from `imageUrlsListener.ts`, so importing the slice as a value (rather than only its type) introduces no cycle. `model/index.ts` re-exports both and is unaffected.

## Out of scope

Any compile-time guard that `app/store.ts` mounts the reducer under the slice's own name. That coupling is unchanged from today and identical to what `manageNoteSlice.selectors` already assume at every call site. Decided explicitly, not overlooked.

## Testing

No new tests. `imageUrlsListener.test.ts` already builds a store with `{ manageNote: manageNoteSlice.reducer }` and covers the three revocation paths end-to-end; those tests passing unchanged is the regression signal for a refactor that must not alter behavior.

Verification:

```shell
cd src/frontend
yarn build   # tsc — the real check for a type-level change
yarn test src/features/manageNote/model/imageUrlsListener.test.ts
yarn lint
```

## Risks

Low. Purely type-level plus mechanical accessor substitution; runtime behavior is identical. The one thing that could surprise: if `selectSlice` inference does not line up with the `createListenerMiddleware` generic, `tsc` fails loudly rather than silently degrading to `any`.
