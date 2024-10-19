import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { noteApi } from '@/entities/note';
import { type ProductSelectOption, type productModel } from '@/entities/product';

interface NoteDraft {
  product?: productModel.AutocompleteOption;
}

export interface State {
  draft?: NoteDraft;
}

const initialState: State = {};

// TODO: support edit note as well
export const addNoteSlice = createSlice({
  name: 'addNote',
  initialState,
  reducers: {
    draftCreated: state => {
      state.draft = {};
    },

    draftDiscarded: state => {
      state.draft = initialState.draft;
    },

    productSelected: (state, { payload }: PayloadAction<ProductSelectOption>) => {
      state.draft = {
        product: {
          freeSolo: false,
          id: payload.id,
          name: payload.name,
          defaultQuantity: payload.defaultQuantity,
        },
      };
    },
  },

  extraReducers: builder => {
    // TODO: clear draft after notes refreshed
    builder.addMatcher(noteApi.endpoints.createNote.matchFulfilled, state => {
      state.draft = initialState.draft;
    });
  },
});
