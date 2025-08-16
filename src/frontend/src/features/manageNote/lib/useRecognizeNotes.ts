import { useAppDispatch } from '@/app/store';
import { noteApi } from '@/entities/note';
import { parseClientError } from '@/shared/api';
import { actions, type Image } from '../model';

type RecognizeNotesFn = (images: Image[]) => Promise<void>;

const createFileFromBase64 = async ({ base64, name }: Image): Promise<[Blob, string]> => {
  const imageResponse = await fetch(base64);
  const blob = await imageResponse.blob();
  return [blob, name];
};

export const useRecognizeNotes = (): RecognizeNotesFn => {
  const [triggerMutation] = noteApi.useRecognizeMutation();
  const dispatch = useAppDispatch();

  const recognizeNotes: RecognizeNotesFn = async images => {
    try {
      dispatch(actions.noteRecognitionStarted());

      const files = await Promise.all(images.map(image => createFileFromBase64(image)));
      const formData = new FormData();

      for (const [blob, name] of files) {
        formData.append('files', blob, name);
      }

      const mutationResponse = await triggerMutation(formData).unwrap();

      dispatch(actions.noteRecognitionSucceded(mutationResponse));
    } catch (error) {
      const clientError = parseClientError(error);
      dispatch(actions.noteRecognitionFailed(clientError));
    }
  };

  return recognizeNotes;
};
