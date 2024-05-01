import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { productsModel } from '@/entities/products';
import { NoteInputDialog, notesApi, useNotes } from '@/features/notes';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';

interface Props {
  note: NoteItem;
  pageId: number;
  children: (openDialog: () => void) => ReactElement;
}

const toCreateProductRequest = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: productsModel.AutocompleteFreeSoloOption): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category?.id ?? 0,
});

export const EditNote: FC<Props> = ({ note, pageId, children }) => {
  const notes = useNotes(pageId);
  const product = useMemo(() => toProductSelectOption(note), [note]);
  const [editNote, editNoteResponse] = notesApi.useEditNoteMutation();
  const { reset: resetEditNote } = editNoteResponse;
  const [createProduct] = productsApi.useCreateProductMutation();
  const productAutocomplete = productsModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  const createProductIfNotExists = async (
    product: productsModel.AutocompleteOptionType,
  ): Promise<number> => {
    if (!product.freeSolo) {
      return product.id;
    }

    const createProductRequest = toCreateProductRequest(product);
    const { id } = await createProduct(createProductRequest).unwrap();
    return id;
  };

  const handleSubmit = async (formData: NoteCreateEdit): Promise<void> => {
    const productId = await createProductIfNotExists(formData.product);
    const request = toEditNoteRequest(note.id, productId, formData);
    await editNote(request);
  };

  const handleSubmitSuccess = useCallback(() => {
    resetEditNote();
  }, [resetEditNote]);

  return (
    <NoteInputDialog
      title="Edit note"
      submitText="Save note"
      mealType={note.mealType}
      pageId={pageId}
      product={product}
      quantity={note.productQuantity}
      displayOrder={note.displayOrder}
      submitSuccess={editNoteResponse.isSuccess && notes.isChanged}
      // renderProductAutocomplete={autocompleteProps => (
      //   <ProductAutocomplete
      //     {...autocompleteProps}
      //     options={productAutocomplete.options}
      //     loading={productAutocomplete.isLoading}
      //     renderInputDialog={productInputProps => (
      //       <ProductInputDialog
      //         {...productInputProps}
      //         renderCategoryInput={categoryInputProps => (
      //           <CategorySelect
      //             {...categoryInputProps}
      //             label="Category"
      //             placeholder="Select a category"
      //             options={categorySelect.data}
      //             optionsLoading={categorySelect.isLoading}
      //           />
      //         )}
      //       />
      //     )}
      //   />
      // )}
      // onClose={toggleDialog}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSubmitSuccess}
    >
      {openDialog => children(openDialog)}
    </NoteInputDialog>
  );
};
