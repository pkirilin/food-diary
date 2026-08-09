import { createListenerMiddleware } from '@reduxjs/toolkit';
import { type ManageNoteState } from './manageNoteSlice';

// Typed structurally because importing RootState from the app layer would invert FSD direction
interface ImagesListenerState {
  manageNote: ManageNoteState;
}

export const imageUrlsListener = createListenerMiddleware<ImagesListenerState>();

imageUrlsListener.startListening({
  predicate: (_action, currentState, previousState) =>
    currentState.manageNote.images !== previousState.manageNote.images,

  // Must stay synchronous: getOriginalState() throws once the effect has awaited
  effect: (_action, { getState, getOriginalState }) => {
    const liveUrls = new Set(getState().manageNote.images.map(image => image.originalUrl));

    getOriginalState()
      .manageNote.images.filter(image => !liveUrls.has(image.originalUrl))
      .forEach(image => {
        URL.revokeObjectURL(image.originalUrl);
      });
  },
});
