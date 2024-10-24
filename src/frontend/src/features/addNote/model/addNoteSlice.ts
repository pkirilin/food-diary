import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { noteApi, type noteModel } from '@/entities/note';
import { type ProductSelectOption, type productModel } from '@/entities/product';
import { type ProductFormValues } from './productForm';

interface NoteDraft {
  date: string;
  mealType: noteModel.MealType;
  displayOrder: number;
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
    draftCreated: (state, { payload }: PayloadAction<NoteDraft>) => {
      state.draft = payload;
    },

    draftDiscarded: state => {
      state.draft = initialState.draft;
    },

    productSelected: (state, { payload }: PayloadAction<ProductSelectOption>) => {
      if (state.draft) {
        state.draft.product = {
          freeSolo: false,
          id: payload.id,
          name: payload.name,
          defaultQuantity: payload.defaultQuantity,
        };
      }
    },

    productDiscarded: state => {
      if (state.draft) {
        delete state.draft.product;
      }
    },

    productAdded: (state, { payload }: PayloadAction<string>) => {
      if (state.draft) {
        state.draft.product = {
          freeSolo: true,
          editing: true,
          name: payload,
          defaultQuantity: 100,
          caloriesCost: 100,
          category: null,
        };
      }
    },

    productSaved: (state, { payload }: PayloadAction<ProductFormValues>) => {
      if (state.draft) {
        state.draft.product = {
          freeSolo: true,
          editing: false,
          name: payload.name,
          caloriesCost: payload.caloriesCost,
          defaultQuantity: payload.defaultQuantity,
          category: payload.category,
        };
      }
    },
  },

  extraReducers: builder => {
    // TODO: clear draft after notes refreshed
    builder.addMatcher(noteApi.endpoints.createNote.matchFulfilled, state => {
      state.draft = initialState.draft;
    });
  },
});
