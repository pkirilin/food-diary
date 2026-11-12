import { type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';
import { noteApi } from '@/entities/note';
import { recognitionPhotosSlice } from './recognitionPhotosSlice';

export const RECOGNITION_REQUEST_KEY = 'productRecognition';

export const endRecognition =
  (): ThunkAction<void, unknown, unknown, UnknownAction> => dispatch => {
    dispatch(noteApi.util.getRunningMutationThunk('recognize', RECOGNITION_REQUEST_KEY))?.abort();
    dispatch(recognitionPhotosSlice.actions.recognitionEnded());
  };
