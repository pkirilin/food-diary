import { useLoaderData } from 'react-router-dom';
import { useAppDispatch } from '@/app/store';
import { noteApi, type NoteRequestBody } from '@/entities/note';
import { actions, type NoteFormValuesProduct, type NoteFormValues } from '../model';

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

export type SubmitNoteFn = (note: NoteFormValues) => Promise<void>;

export const useSubmitNote = (): SubmitNoteFn => {
  const { date } = useLoaderData() as { date: string };
  const [createNote] = noteApi.useCreateNoteMutation();
  const [updateNote] = noteApi.useUpdateNoteMutation();
  const dispatch = useAppDispatch();

  const handleCreate = async (note: NoteRequestBody): Promise<void> => {
    const createResponse = await createNote(note);

    if (createResponse.error) {
      return;
    }

    const notesResponse = await dispatch(noteApi.util.getRunningQueryThunk('notes', { date }));

    if (notesResponse?.error) {
      return;
    }

    dispatch(actions.noteDraftSubmitted());
  };

  const handleUpdate = async (id: number, note: NoteRequestBody): Promise<void> => {
    const updateResponse = await updateNote({ id, note });

    if (updateResponse.error) {
      return;
    }

    const notesResponse = await dispatch(noteApi.util.getRunningQueryThunk('notes', { date }));

    if (notesResponse?.error) {
      return;
    }

    dispatch(actions.noteDraftSubmitted());
  };

  return async note => {
    const { id, product } = note;

    if (!product) {
      throw new Error('Product should not be empty');
    }

    const request = toNoteRequestBody(note, product);
    const shouldUpdate = typeof id === 'number';

    return shouldUpdate ? await handleUpdate(id, request) : await handleCreate(request);
  };
};
