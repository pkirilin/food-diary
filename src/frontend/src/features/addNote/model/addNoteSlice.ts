import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { noteApi, type noteModel } from '@/entities/note';
import { productApi, type ProductSelectOption, type productModel } from '@/entities/product';
import { type ProductFormValues } from './productForm';
import { type Image } from './types';

interface NoteDraft {
  date: string;
  mealType: noteModel.MealType;
  displayOrder: number;
  // TODO: change type to ProductDraft
  product?: productModel.AutocompleteOption;
  isValid?: boolean;
  isSubmitting?: boolean;
}

interface State {
  draft?: NoteDraft;
  image?: Image;
}

const initialState: State = {};

const isEditingProduct = (state: State): boolean =>
  (state.draft?.product?.freeSolo && state.draft?.product?.editing) ?? false;

// TODO: support edit note as well
export const addNoteSlice = createSlice({
  name: 'addNote',
  initialState,
  selectors: {
    activeFormId: state => (isEditingProduct(state) ? 'product-form' : 'note-form'),
    dialogTitle: state => (isEditingProduct(state) ? 'New product' : 'New note'),
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
          editing: true,
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
    builder.addMatcher(
      isAnyOf(
        noteApi.endpoints.createNote.matchPending,
        noteApi.endpoints.notes.matchPending,
        productApi.endpoints.createProduct.matchPending,
      ),
      state => {
        if (state.draft) {
          state.draft.isSubmitting = true;
        }
      },
    );

    builder.addMatcher(noteApi.endpoints.notes.matchFulfilled, state => {
      if (state.draft) {
        delete state.draft;
        delete state.image;
      }
    });

    builder.addMatcher(productApi.endpoints.createProduct.matchFulfilled, (state, { payload }) => {
      if (state.draft?.product) {
        state.draft.product = {
          id: payload.id,
          name: state.draft.product.name,
          defaultQuantity: state.draft.product.defaultQuantity,
        };
        state.draft.isSubmitting = false;
      }
    });
  },
});
