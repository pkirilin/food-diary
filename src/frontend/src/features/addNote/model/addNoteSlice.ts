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
  canSubmit: boolean;
  isSubmitting: boolean;
}

const initialState: State = {
  canSubmit: false,
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
    noteDraftSaved: (state, { payload }: PayloadAction<NoteFormValues>) => {
      state.note = payload;
    },

    noteDraftDiscarded: () => initialState,

    noteDraftSubmitted: () => initialState,

    draftValidated: (state, { payload }: PayloadAction<boolean>) => {
      state.canSubmit = payload;
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
        noteApi.endpoints.updateNote.matchPending,
        noteApi.endpoints.notes.matchPending,
        productApi.endpoints.createProduct.matchPending,
        productApi.endpoints.editProduct.matchPending,
      ),
      state => {
        state.isSubmitting = true;
      },
    );

    builder.addMatcher(
      isAnyOf(
        noteApi.endpoints.createNote.matchRejected,
        noteApi.endpoints.updateNote.matchRejected,
        noteApi.endpoints.notes.matchRejected,
        productApi.endpoints.createProduct.matchRejected,
        productApi.endpoints.editProduct.matchRejected,
      ),
      state => {
        state.isSubmitting = false;
      },
    );

    builder.addMatcher(noteApi.endpoints.notes.matchFulfilled, state => {
      state.isSubmitting = false;
    });

    builder.addMatcher(
      productApi.endpoints.createProduct.matchFulfilled,
      (state, { payload, meta }) => {
        if (state.note && state.product) {
          const product = meta.arg.originalArgs;

          state.isSubmitting = false;
          state.note.quantity = product.defaultQuantity;
          state.note.product = {
            id: payload.id,
            name: product.name,
            defaultQuantity: product.defaultQuantity,
          };

          delete state.product;
        }
      },
    );

    builder.addMatcher(productApi.endpoints.editProduct.matchFulfilled, (state, { meta }) => {
      if (state.note && state.product) {
        const product = meta.arg.originalArgs;

        state.isSubmitting = false;
        state.note.quantity = product.defaultQuantity;
        state.note.product = {
          id: product.id,
          name: product.name,
          defaultQuantity: product.defaultQuantity,
        };

        delete state.product;
      }
    });

    builder.addMatcher(productApi.endpoints.productById.matchPending, state => {
      state.canSubmit = false;
    });

    builder.addMatcher(
      isAnyOf(
        productApi.endpoints.productById.matchFulfilled,
        productApi.endpoints.productById.matchRejected,
      ),
      state => {
        state.canSubmit = true;
      },
    );
  },
});
