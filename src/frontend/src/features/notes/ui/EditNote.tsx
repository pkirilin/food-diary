import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { productModel } from '@/entities/product';
import { NoteInputDialog, notesApi, useNotes } from '@/features/notes';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';

interface Props {
  note: NoteItem;
  pageId: number;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

const toCreateProductRequest = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: productModel.AutocompleteFreeSoloOption): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category?.id ?? 0,
});

export const EditNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const [dialogOpened, toggleDialog] = useToggle();
  const notes = useNotes(pageId);
  const product = useMemo(() => toProductSelectOption(note), [note]);
  const [editNote, editNoteResponse] = notesApi.useEditNoteMutation();
  const { reset: resetEditNote } = editNoteResponse;
  const [createProduct] = productsApi.useCreateProductMutation();
  const productAutocomplete = productModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  const createProductIfNotExists = async (
    product: productModel.AutocompleteOptionType,
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
    <>
      {renderTrigger(toggleDialog)}
      <NoteInputDialog
        opened={dialogOpened}
        title="Edit note"
        submitText="Save"
        mealType={note.mealType}
        pageId={pageId}
        product={product}
        quantity={note.productQuantity}
        displayOrder={note.displayOrder}
        productAutocomplete={productAutocomplete}
        categorySelect={categorySelect}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
        submitSuccess={editNoteResponse.isSuccess && notes.isChanged}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};
