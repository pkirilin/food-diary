import { noteApi, noteLib } from '@/entities/note';
import { type productModel } from '@/entities/product';
import { type ClientError, parseClientError } from '@/shared/api';
import { type imageLib } from '@/shared/lib';
import { RECOGNITION_REQUEST_KEY } from '../model';

interface RecognizeProductResult {
  isRecognizing: boolean;
  error: ClientError | null;
  recognizedProduct: productModel.ProductFormValues | null;
  recognize: (photos: imageLib.Image[]) => void;
}

export const useRecognizeProduct = (): RecognizeProductResult => {
  const [sendPhotos, { data, isLoading, isError, error }] = noteApi.useRecognizeMutation({
    fixedCacheKey: RECOGNITION_REQUEST_KEY,
  });

  const suggestion = data?.notes.at(0);
  // Leaving the route aborts the request while its screen is still rendered
  const isAborted = error !== undefined && 'name' in error && error.name === 'AbortError';

  return {
    isRecognizing: isLoading || isAborted,
    error: isError ? parseClientError(error) : null,
    recognizedProduct: suggestion ? noteLib.toRecognizedProductFormValues(suggestion, null) : null,
    recognize: photos => {
      sendPhotos(noteLib.toRecognizeFormData(photos));
    },
  };
};
