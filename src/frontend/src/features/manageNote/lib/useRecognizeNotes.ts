import { useAppDispatch } from '@/app/store';
import { noteApi } from '@/entities/note';
import { parseClientError } from '@/shared/api';
import { actions, type Image } from '../model';

type RecognizeNotesFn = (image: Image) => Promise<void>;

export const useRecognizeNotes = (): RecognizeNotesFn => {
  const [triggerMutation] = noteApi.useRecognizeMutation();
  const dispatch = useAppDispatch();

  const recognizeNotes: RecognizeNotesFn = async image => {
    try {
      dispatch(actions.noteRecognitionStarted());
      const imageResponse = await fetch(image.base64);
      const blob = await imageResponse.blob();
      const file = new File([blob], image.name, { type: blob.type });
      const formData = new FormData();
      formData.append('files', file);
      const mutationResponse = await triggerMutation(formData).unwrap();
      dispatch(actions.noteRecognitionSucceded(mutationResponse));
    } catch (error) {
      const clientError = parseClientError(error);
      dispatch(actions.noteRecognitionFailed(clientError));
    }
  };

  return recognizeNotes;
};
