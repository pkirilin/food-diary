import { type WithSlice, createListenerMiddleware } from '@reduxjs/toolkit';
import { recognitionPhotosSlice } from './recognitionPhotosSlice';

export const recognitionPhotoUrlsListener =
  createListenerMiddleware<WithSlice<typeof recognitionPhotosSlice>>();

recognitionPhotoUrlsListener.startListening({
  predicate: (_action, currentState, previousState) =>
    recognitionPhotosSlice.selectSlice(currentState) !==
    recognitionPhotosSlice.selectSlice(previousState),

  // Must stay synchronous: getOriginalState() throws once the effect has awaited
  effect: (_action, { getState, getOriginalState }) => {
    const liveUrls = new Set(
      recognitionPhotosSlice.selectSlice(getState()).map(photo => photo.originalUrl),
    );

    recognitionPhotosSlice
      .selectSlice(getOriginalState())
      .filter(photo => !liveUrls.has(photo.originalUrl))
      .forEach(photo => {
        URL.revokeObjectURL(photo.originalUrl);
      });
  },
});
