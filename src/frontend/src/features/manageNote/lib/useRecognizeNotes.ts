import { useAppDispatch } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { parseClientError } from '@/shared/api';
import { type imageLib } from '@/shared/lib';
import { actions } from '../model';

type RecognizeNotesFn = (images: imageLib.Image[]) => Promise<void>;

export const useRecognizeNotes = (): RecognizeNotesFn => {
  const [triggerMutation] = noteApi.useRecognizeMutation();
  const dispatch = useAppDispatch();

  const recognizeNotes: RecognizeNotesFn = async images => {
    try {
      dispatch(actions.noteRecognitionStarted());

      const mutationResponse = await triggerMutation(noteLib.toRecognizeFormData(images)).unwrap();

      dispatch(actions.noteRecognitionSucceded(mutationResponse));
    } catch (error) {
      const clientError = parseClientError(error);
      dispatch(actions.noteRecognitionFailed(clientError));
    }
  };

  return recognizeNotes;
};
