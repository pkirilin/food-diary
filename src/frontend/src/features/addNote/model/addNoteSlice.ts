import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { noteApi, type noteModel } from '@/entities/note';
import { productApi, type ProductSelectOption } from '@/entities/product';
import { type ProductFormValues } from './productForm';
import { type ProductDraft, type Image } from './types';

interface State {
  note?: NoteDraft;
  product?: ProductDraft;
  image?: Image;
  isValid: boolean;
  isSubmitting: boolean;
}

interface NoteDraft {
  date: string;
  mealType: noteModel.MealType;
  displayOrder: number;
  product?: ProductSelectOption;
}

const initialState: State = {
  isValid: false,
  isSubmitting: false,
};

// TODO: support edit note as well
export const addNoteSlice = createSlice({
  name: 'addNote',
  initialState,
  selectors: {
    activeFormId: state => (state.product ? 'product-form' : 'note-form'),
    dialogTitle: state => (state.product ? 'New product' : 'New note'),
  },
  reducers: {
    noteDraftCreated: (state, { payload }: PayloadAction<NoteDraft>) => {
      state.note = payload;
    },

    noteDraftDiscarded: state => {
      delete state.note;
      delete state.product;
      delete state.image;
    },

    draftValidated: (state, { payload }: PayloadAction<boolean>) => {
      state.isValid = payload;
    },

    productSelected: (state, { payload }: PayloadAction<ProductSelectOption>) => {
      if (state.note) {
        state.note.product = payload;
      }
    },

    productDraftDiscarded: state => {
      if (state.note?.product) {
        delete state.note.product;
        delete state.product;
        state.isValid = false;
      }
    },

    productDraftSaved: (state, { payload }: PayloadAction<ProductFormValues>) => {
      state.product = {
        name: payload.name,
        caloriesCost: payload.caloriesCost,
        defaultQuantity: payload.defaultQuantity,
        category: payload.category,
      };
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

    builder.addMatcher(noteApi.endpoints.notes.matchFulfilled, state => {
      state.isSubmitting = false;
      delete state.note;
      delete state.product;
      delete state.image;
    });

    builder.addMatcher(productApi.endpoints.createProduct.matchFulfilled, (state, { payload }) => {
      if (state.note && state.product) {
        state.note.product = {
          id: payload.id,
          name: state.product.name,
          defaultQuantity: state.product.defaultQuantity,
        };
        state.isSubmitting = false;
      }
    });
  },
});
