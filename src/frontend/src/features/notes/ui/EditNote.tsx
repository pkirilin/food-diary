import { useMemo, type FC, useEffect, type ReactElement } from 'react';
import { ProductAutocomplete, ProductInputDialog, productsModel } from '@/entities/products';
import { CategorySelect } from '@/features/categories';
import { NoteInputDialog, notesApi, useNotes } from '@/features/notes';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';

interface Props {
  note: NoteItem;
  pageId: number;
  children: (toggleDialog: () => void) => ReactElement;
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
  const [createProduct, createProductResponse] = productsApi.useCreateProductMutation();
  const [dialogOpened, toggleDialog] = useToggle();
  const productAutocomplete = productsModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  useEffect(() => {
    if (editNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
    }
  }, [editNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

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

  return (
    <>
      {children(toggleDialog)}
      <NoteInputDialog
        title="Edit note"
        submitText="Save"
        isOpened={dialogOpened}
        mealType={note.mealType}
        pageId={pageId}
        product={product}
        quantity={note.productQuantity}
        displayOrder={note.displayOrder}
        submitting={
          createProductResponse.isLoading || editNoteResponse.isLoading || notes.isFetching
        }
        renderProductAutocomplete={autocompleteProps => (
          <ProductAutocomplete
            {...autocompleteProps}
            options={productAutocomplete.options}
            loading={productAutocomplete.isLoading}
            renderInputDialog={productInputProps => (
              <ProductInputDialog
                {...productInputProps}
                renderCategoryInput={categoryInputProps => (
                  <CategorySelect
                    {...categoryInputProps}
                    label="Category"
                    placeholder="Select a category"
                    options={categorySelect.data}
                    optionsLoading={categorySelect.isLoading}
                  />
                )}
              />
            )}
          />
        )}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
      />
    </>
  );
};
