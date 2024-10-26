import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { noteApi, type noteModel } from '@/entities/note';
import { type ProductSelectOption, type productModel } from '@/entities/product';
import { type ProductFormValues } from './productForm';
import { type Image } from './types';

interface NoteDraft {
  date: string;
  mealType: noteModel.MealType;
  displayOrder: number;
  product?: productModel.AutocompleteOption;
  isValid?: boolean;
}

interface State {
  draft?: NoteDraft;
  image?: Image;
}

const initialState: State = {};

// TODO: support edit note as well
export const addNoteSlice = createSlice({
  name: 'addNote',
  initialState,
  selectors: {
    activeFormId: state =>
      state.draft?.product?.freeSolo && state.draft?.product?.editing
        ? 'product-form'
        : 'note-form',
  },
  reducers: {
    draftCreated: (state, { payload }: PayloadAction<NoteDraft>) => {
      state.draft = payload;
    },

    draftDiscarded: state => {
      delete state.draft;
      delete state.image;
    },

    draftValidated: (state, { payload }: PayloadAction<boolean>) => {
      if (state.draft) {
        state.draft.isValid = payload;
      }
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
        state.draft.isValid = false;
      }
    },

    productAdded: (state, { payload }: PayloadAction<ProductFormValues>) => {
      if (state.draft) {
        state.draft.product = {
          freeSolo: true,
          editing: true,
          name: payload.name,
          defaultQuantity: payload.defaultQuantity,
          caloriesCost: payload.caloriesCost,
          category: payload.category,
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

    imageUploaded: (state, { payload }: PayloadAction<Image>) => {
      state.image = payload;
    },

    imageRemoved: state => {
      delete state.image;
    },
  },

  extraReducers: builder => {
    // TODO: clear draft after notes refreshed
    builder.addMatcher(noteApi.endpoints.createNote.matchFulfilled, state => {
      delete state.draft;
      delete state.image;
    });
  },
});
