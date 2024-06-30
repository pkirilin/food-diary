import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { productLib } from '@/entities/product';
import { useAddProductIfNotExists } from '../lib';
import { mapToEditNoteRequest, mapToProductSelectOption } from '../lib/mapping';
import { type Note } from '../model';
import { AddOrEditNoteFlow } from './AddOrEditNoteFlow';
import { EditNoteDialog } from './EditNoteDialog';

interface Props {
  note: noteModel.NoteItem;
  pageId: number;
  renderTrigger: (onClick: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const [editNote, { reset, ...editNoteResponse }] = noteApi.useEditNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(pageId);
  const noteForm = noteLib.useFormValues({
    pageId,
    mealType: note.mealType,
    displayOrder: note.displayOrder,
    quantity: note.productQuantity,
  });

  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const product = useMemo(() => mapToProductSelectOption(note), [note]);

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(formData.product);
    const request = mapToEditNoteRequest(note.id, productId, formData);
    await editNote(request).unwrap();
  };

  const handleSubmitSuccess = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <AddOrEditNoteFlow
      renderTrigger={renderTrigger}
      renderDialog={dialogProps => (
        <EditNoteDialog {...dialogProps} noteFormValues={noteForm.values} />
      )}
      submitSuccess={editNoteResponse.isSuccess && notes.isChanged}
      product={product}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};
