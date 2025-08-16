import { type PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit';
import { type NoteItem, noteLib, noteModel, type RecognizeNoteResponse } from '@/entities/note';
import { type productModel } from '@/entities/product';
import { type ClientError } from '@/shared/api';
import { type NoteFormValuesProduct, type NoteFormValues } from './noteSchema';
import { type NoteRecognitionState, type Image, type ManageNoteScreenState } from './types';

export interface ManageNoteState {
  note?: NoteFormValues;
  product?: productModel.ProductFormValues;
  images: Image[];
  noteRecognition: NoteRecognitionState;
  submitDisabled: boolean;
  isSubmitting: boolean;
}

export const initialState: ManageNoteState = {
  images: [],
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
    activeScreen: createSelector(
      [
        (state: ManageNoteState) => state.note,
        (state: ManageNoteState) => state.product,
        (state: ManageNoteState) => state.images,
      ],
      (note, product, images): ManageNoteScreenState => {
        if (product) {
          return {
            type: 'product-input',
            formId: 'product-form',
            product,
          };
        }

        if (images.length > 0) {
          return {
            type: 'image-upload',
            images,
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
    ),

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

    productSelected: (state, { payload }: PayloadAction<NoteFormValuesProduct>) => {
      if (state.note) {
        state.note.product = payload;
        state.note.quantity = payload.defaultQuantity;
      }
    },

    productDraftCreated: (state, { payload }: PayloadAction<productModel.ProductFormValues>) => {
      state.product = payload;
    },

    productDraftDiscarded: state => {
      if (state.note) {
        state.note.product = null;
        state.images = [];
        delete state.product;
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
        state.note.product = payload;
        state.noteRecognition = initialState.noteRecognition;
        state.images = [];

        delete state.product;
      }
    },

    productForEditLoadStarted: state => {
      state.submitDisabled = true;
    },

    productForEditLoadFailed: state => {
      state.submitDisabled = false;
    },

    productForEditLoaded: (state, { payload }: PayloadAction<productModel.ProductFormValues>) => {
      state.product = payload;
      state.submitDisabled = false;

      if (state.note?.product) {
        state.note.product = null;
      }
    },

    imagesUploaded: (state, { payload }: PayloadAction<Image[]>) => {
      state.images = payload;
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

    aiSuggestionDiscarded: state => {
      state.submitDisabled = true;
      state.noteRecognition = initialState.noteRecognition;
    },
  },
});
