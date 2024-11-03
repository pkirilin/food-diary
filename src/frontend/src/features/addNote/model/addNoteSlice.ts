import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { noteApi, noteLib, noteModel } from '@/entities/note';
import { productApi, type ProductSelectOption } from '@/entities/product';
import { type NoteFormValues } from './noteSchema';
import { type ProductFormValues } from './productSchema';
import { type Image } from './types';

interface State {
  note?: NoteFormValues;
  product?: ProductFormValues;
  image?: Image;
  isValid: boolean;
  isSubmitting: boolean;
}

const initialState: State = {
  isValid: false,
  isSubmitting: false,
};

export const addNoteSlice = createSlice({
  name: 'addNote',
  initialState,
  selectors: {
    activeFormId: state => (state.product ? 'product-form' : 'note-form'),
    dialogTitle: state =>
      state.product
        ? 'New product'
        : noteLib.getMealName(state?.note?.mealType ?? noteModel.MealType.Breakfast),
  },
  reducers: {
    noteDraftSaved: (state, { payload }: PayloadAction<NoteFormValues>) => {
      state.note = payload;
    },

    noteDraftDiscarded: () => initialState,

    draftValidated: (state, { payload }: PayloadAction<boolean>) => {
      state.isValid = payload;
    },

    productSelected: (state, { payload }: PayloadAction<ProductSelectOption>) => {
      if (state.note) {
        state.note.product = payload;
      }
    },

    productDraftSaved: (state, { payload }: PayloadAction<ProductFormValues>) => {
      state.product = payload;
    },

    productDraftDiscarded: state => {
      if (state.note) {
        state.note.product = null;
        delete state.product;
        delete state.image;
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
    builder.addMatcher(
      isAnyOf(
        noteApi.endpoints.createNote.matchPending,
        noteApi.endpoints.notes.matchPending,
        productApi.endpoints.createProduct.matchPending,
      ),
      state => {
        state.isSubmitting = true;
      },
    );

    builder.addMatcher(
      isAnyOf(
        noteApi.endpoints.createNote.matchRejected,
        noteApi.endpoints.notes.matchRejected,
        productApi.endpoints.createProduct.matchRejected,
      ),
      state => {
        state.isSubmitting = false;
      },
    );

    builder.addMatcher(noteApi.endpoints.notes.matchFulfilled, () => initialState);

    builder.addMatcher(productApi.endpoints.createProduct.matchFulfilled, (state, { payload }) => {
      if (state.note && state.product) {
        state.note.product = {
          id: payload.id,
          name: state.product.name,
          defaultQuantity: state.product.defaultQuantity,
        };
        delete state.product;
        state.isSubmitting = false;
      }
    });
  },
});
