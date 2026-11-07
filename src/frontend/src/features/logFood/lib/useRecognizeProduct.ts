import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { type productModel } from '@/entities/product';
import { type ClientError, parseClientError } from '@/shared/api';
import { actions, selectors } from '../model';

interface RecognizeProductResult {
  isRecognizing: boolean;
  error: ClientError | null;
  recognizedProduct: productModel.ProductFormValues | null;
  retry: () => void;
}

export const useRecognizeProduct = (): RecognizeProductResult => {
  const dispatch = useAppDispatch();
  const pickedPhotos = useAppSelector(selectors.recognitionPhotos);
  const [photos] = useState(pickedPhotos);
  const [recognize, { data, isUninitialized, isLoading, isError, error }] =
    noteApi.useRecognizeMutation();

  const sendPhotos = useCallback(() => {
    const request = recognize(noteLib.toRecognizeFormData(photos));

    void request.then(result => {
      if ('data' in result) {
        dispatch(actions.productRecognized());
      }
    });

    return request;
  }, [dispatch, photos, recognize]);

  useEffect(() => {
    const request = sendPhotos();

    return () => {
      request.abort();
    };
  }, [sendPhotos]);

  const suggestion = data?.notes.at(0);

  return {
    isRecognizing: isUninitialized || isLoading,
    error: isError ? parseClientError(error) : null,
    recognizedProduct: suggestion ? noteLib.toRecognizedProductFormValues(suggestion, null) : null,
    retry: () => {
      sendPhotos();
    },
  };
};
