import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { foodLogModel } from '@/entities/foodLog';
import { type imageLib } from '@/shared/lib';

const initialState: imageLib.Image[] = [];

export const recognitionPhotosSlice = createSlice({
  name: 'recognitionPhotos',
  initialState,
  selectors: {
    recognitionPhotos: state => state,
  },
  reducers: {
    recognitionPhotosPicked: (_state, { payload }: PayloadAction<imageLib.Image[]>) => payload,
    recognitionEnded: () => initialState,
  },
  extraReducers: builder => {
    builder.addMatcher(
      isAnyOf(foodLogModel.actions.mealDraftDiscarded, foodLogModel.actions.mealDraftLogged),
      () => initialState,
    );
  },
});
