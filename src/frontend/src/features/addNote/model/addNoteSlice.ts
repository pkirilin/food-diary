import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { type NoteItem, noteApi, noteLib, noteModel } from '@/entities/note';
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

    addDialogVisible: (state, mealType: noteModel.MealType): boolean =>
      Boolean(state.note && !('id' in state.note) && state.note.mealType === mealType),

    editDialogVisible: (state, note: NoteItem): boolean =>
      Boolean(state.note && state.note.id === note.id),
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
        state.note.quantity = payload.defaultQuantity;
      }
    },

    productDraftSaved: (state, { payload }: PayloadAction<ProductFormValues>) => {
      state.product = payload;
    },

    productDraftEditStarted: (state, { payload }: PayloadAction<ProductFormValues>) => {
      if (state.note?.product) {
        state.product = payload;
        state.note.product = null;
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
        noteApi.endpoints.updateNote.matchPending,
        noteApi.endpoints.notes.matchPending,
        productApi.endpoints.createProduct.matchPending,
      ),
      state => {
        if (state.note) {
          state.isSubmitting = true;
        }
      },
    );

    builder.addMatcher(
      isAnyOf(
        noteApi.endpoints.createNote.matchRejected,
        noteApi.endpoints.updateNote.matchRejected,
        noteApi.endpoints.notes.matchRejected,
        productApi.endpoints.createProduct.matchRejected,
      ),
      state => {
        if (state.note) {
          state.isSubmitting = false;
        }
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
        state.note.quantity = state.product.defaultQuantity;
        delete state.product;
        state.isSubmitting = false;
      }
    });
  },
});
