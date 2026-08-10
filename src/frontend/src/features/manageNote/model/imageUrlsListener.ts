import { type WithSlice, createListenerMiddleware } from '@reduxjs/toolkit';
import { manageNoteSlice } from './manageNoteSlice';

export const imageUrlsListener = createListenerMiddleware<WithSlice<typeof manageNoteSlice>>();

imageUrlsListener.startListening({
  predicate: (_action, currentState, previousState) =>
    manageNoteSlice.selectSlice(currentState).images !==
    manageNoteSlice.selectSlice(previousState).images,

  // Must stay synchronous: getOriginalState() throws once the effect has awaited
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
});
