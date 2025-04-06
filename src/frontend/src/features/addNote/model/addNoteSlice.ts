import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { type NoteItem, noteLib, noteModel } from '@/entities/note';
import { type ProductSelectOption } from '@/entities/product';
import { type NoteFormValuesProduct, type NoteFormValues } from './noteSchema';
import { type ProductFormValues } from './productSchema';
import { type Image } from './types';

interface State {
  note?: NoteFormValues;
  product?: ProductFormValues;
  image?: Image;
  canSubmit: boolean;
  isSubmitting: boolean;
}

const initialState: State = {
  canSubmit: true,
  isSubmitting: false,
};

export const addNoteSlice = createSlice({
  name: 'addNote',
  initialState,
  selectors: {
    activeFormId: state => (state.product ? 'product-form' : 'note-form'),

    dialogTitle: ({ note, product }) =>
      product ? 'Product' : noteLib.getMealName(note?.mealType ?? noteModel.MealType.Breakfast),

    submitText: ({ note, product }) => {
      if (product) {
        return typeof product.id === 'number' ? 'Save' : 'Add';
      }

      return note && typeof note.id === 'number' ? 'Save' : 'Add';
    },

    addDialogVisible: (state, mealType: noteModel.MealType): boolean =>
      Boolean(state.note && !('id' in state.note) && state.note.mealType === mealType),

    editDialogVisible: (state, note: NoteItem): boolean =>
      Boolean(state.note && state.note.id === note.id),
  },
  reducers: {
    noteDraftCreated: (state, { payload }: PayloadAction<NoteFormValues>) => {
      state.note = payload;
    },

    noteDraftDiscarded: () => initialState,

    noteDraftSaveStarted: state => {
      state.isSubmitting = true;
    },

    noteDraftSaveFailed: state => {
      state.isSubmitting = false;
    },

    noteDraftSaved: () => initialState,

    productSelected: (state, { payload }: PayloadAction<ProductSelectOption>) => {
      if (state.note) {
        state.note.product = payload;
        state.note.quantity = payload.defaultQuantity;
      }
    },

    productDraftCreated: (state, { payload }: PayloadAction<ProductFormValues>) => {
      state.product = payload;
    },

    productDraftDiscarded: state => {
      if (state.note) {
        state.note.product = null;
        delete state.product;
        delete state.image;
      }
    },

    productDraftSaveStarted: state => {
      state.isSubmitting = true;
    },

    productDraftSaveFailed: state => {
      state.isSubmitting = false;
    },

    productDraftSaved: (state, { payload }: PayloadAction<NoteFormValuesProduct>) => {
      if (state.note) {
        state.isSubmitting = false;
        state.note.quantity = payload.defaultQuantity;
        state.note.product = {
          id: payload.id,
          name: payload.name,
          defaultQuantity: payload.defaultQuantity,
        };

        delete state.product;
      }
    },

    productForEditLoadStarted: state => {
      state.canSubmit = false;
    },

    productForEditLoadFailed: state => {
      state.canSubmit = true;
    },

    productForEditLoaded: (state, { payload }: PayloadAction<ProductFormValues>) => {
      state.product = payload;
      state.canSubmit = true;

      if (state.note?.product) {
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
});
