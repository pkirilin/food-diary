import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { type NoteItem, noteLib, noteModel, type RecognizeNoteResponse } from '@/entities/note';
import { type ProductSelectOption } from '@/entities/product';
import { type ClientError } from '@/shared/api';
import { type NoteFormValuesProduct, type NoteFormValues } from './noteSchema';
import { type ProductFormValues } from './productSchema';
import { type NoteRecognitionState, type Image, type ManageNoteScreenState } from './types';

interface State {
  note?: NoteFormValues;
  product?: ProductFormValues;
  image?: Image;
  noteRecognition: NoteRecognitionState;
  submitDisabled: boolean;
  isSubmitting: boolean;
}

const initialState: State = {
  submitDisabled: false,
  isSubmitting: false,
  noteRecognition: {
    suggestions: [],
    isLoading: false,
  },
};

export const manageNoteSlice = createSlice({
  name: 'manageNote',
  initialState,
  selectors: {
    // TODO: add unit tests
    // TODO: add memoization
    activeScreen: ({ note, product, image }): ManageNoteScreenState => {
      if (product) {
        return {
          type: 'product-input',
          formId: 'product-form',
          product,
        };
      }

      if (image) {
        return {
          type: 'image-upload',
          image,
        };
      }

      if (!note?.product) {
        return { type: 'product-search' };
      }

      return {
        type: 'note-input',
        formId: 'note-form',
        note,
      };
    },

    // TODO: replace with activeScreen, move to custom hook?
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
      state.submitDisabled = true;
    },

    productForEditLoadFailed: state => {
      state.submitDisabled = false;
    },

    productForEditLoaded: (state, { payload }: PayloadAction<ProductFormValues>) => {
      state.product = payload;
      state.submitDisabled = false;

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

    noteRecognitionSucceded: (state, { payload }: PayloadAction<RecognizeNoteResponse>) => {
      state.submitDisabled = false;
      state.noteRecognition.suggestions = payload.notes ?? [];
      state.noteRecognition.isLoading = false;
    },

    noteRecognitionStarted: state => {
      state.submitDisabled = true;
      state.noteRecognition.isLoading = true;
    },

    noteRecognitionFailed: (state, { payload }: PayloadAction<ClientError>) => {
      state.submitDisabled = false;
      state.noteRecognition.isLoading = false;
      state.noteRecognition.error = payload;
      state.noteRecognition.suggestions = [];
    },
  },
});
