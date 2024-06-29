import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { productLib } from '@/entities/product';
import { useAddProductIfNotExists } from '../lib';
import { mapToEditNoteRequest, mapToProductSelectOption } from '../lib/mapping';
import { type Note } from '../model';
import { AddOrEditNoteFlow } from './AddOrEditNoteFlow';

interface Props {
  note: noteModel.NoteItem;
  pageId: number;
  renderTrigger: (onClick: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const [editNote, { reset, ...editNoteResponse }] = noteApi.useEditNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(pageId);
  const categorySelect = categoryLib.useCategorySelectData();
  const productAutocompleteData = productLib.useAutocompleteData();
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
      dialogTitle="Edit note"
      submitText="Save"
      submitSuccess={editNoteResponse.isSuccess && notes.isChanged}
      pageId={pageId}
      mealType={note.mealType}
      displayOrder={note.displayOrder}
      product={product}
      quantity={note.productQuantity}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};
