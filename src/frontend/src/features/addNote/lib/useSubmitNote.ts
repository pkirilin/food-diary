import { useAppDispatch } from '@/app/store';
import { noteApi, type NoteRequestBody } from '@/entities/note';
import { actions, type NoteFormValuesProduct, type NoteFormValues } from '../model';
import { type OnSubmitNoteFn } from '../ui/NoteForm';

const toNoteRequestBody = (
  { date, mealType, displayOrder, quantity }: NoteFormValues,
  product: NoteFormValuesProduct,
): NoteRequestBody => ({
  date,
  mealType,
  displayOrder,
  productId: product.id,
  productQuantity: quantity,
});

export const useSubmitNote = (date: string): OnSubmitNoteFn => {
  const [createNote] = noteApi.useCreateNoteMutation();
  const [updateNote] = noteApi.useUpdateNoteMutation();
  const dispatch = useAppDispatch();

  return async note => {
    const { id, product } = note;

    if (!product) {
      throw new Error('Product should not be empty');
    }

    const shouldUpdate = typeof id === 'number';

    dispatch(actions.noteDraftSaveStarted());

    const mutationResponse = shouldUpdate
      ? await updateNote({ id, note: toNoteRequestBody(note, product) })
      : await createNote(toNoteRequestBody(note, product));

    if (mutationResponse.error) {
      dispatch(actions.noteDraftSaveFailed());
      return;
    }

    const notesResponse = await dispatch(noteApi.util.getRunningQueryThunk('notes', { date }));

    if (notesResponse?.error) {
      return;
    }

    dispatch(actions.noteDraftSaved());
  };
};
