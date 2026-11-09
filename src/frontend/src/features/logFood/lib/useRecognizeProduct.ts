import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { type productModel } from '@/entities/product';
import { type ClientError, parseClientError } from '@/shared/api';
import { type imageLib } from '@/shared/lib';
import { actions, selectors } from '../model';

interface RecognizeProductResult {
  photos: imageLib.Image[];
  isRecognizing: boolean;
  error: ClientError | null;
  recognizedProduct: productModel.ProductFormValues | null;
  retry: () => void;
}

export const useRecognizeProduct = (): RecognizeProductResult => {
  const dispatch = useAppDispatch();
  const pickedPhotos = useAppSelector(selectors.recognitionPhotos);
  const [photos] = useState(pickedPhotos);
  const [recognize, { data, isUninitialized, isLoading, isSuccess, isError, error }] =
    noteApi.useRecognizeMutation();

  const sendPhotos = useCallback(
    () => recognize(noteLib.toRecognizeFormData(photos)),
    [photos, recognize],
  );

  useEffect(() => {
    const request = sendPhotos();

    return () => {
      request.abort();
    };
  }, [sendPhotos]);

  // Waits for the screen to unmount: emptying the slice revokes the URLs of the photos it shows
  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    return () => {
      dispatch(actions.productRecognized());
    };
  }, [dispatch, isSuccess]);

  const suggestion = data?.notes.at(0);

  return {
    photos,
    isRecognizing: isUninitialized || isLoading,
    error: isError ? parseClientError(error) : null,
    recognizedProduct: suggestion ? noteLib.toRecognizedProductFormValues(suggestion, null) : null,
    retry: () => {
      sendPhotos();
    },
  };
};
