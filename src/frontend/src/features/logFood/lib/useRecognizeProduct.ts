import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi } from '@/entities/note';
import { type productModel } from '@/entities/product';
import { type ClientError, parseClientError } from '@/shared/api';
import { type imageLib } from '@/shared/lib';
import { actions, selectors } from '../model';
import { toRecognizedProductFormValues } from './mapping';

interface RecognizeProductResult {
  isRecognizing: boolean;
  error: ClientError | null;
  recognizedProduct: productModel.ProductFormValues | null;
  retry: () => void;
}

const toBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const type = /^data:([^;]*)/.exec(header)?.[1] ?? '';
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  return new Blob([bytes], { type });
};

const toFormData = (photos: imageLib.Image[]): FormData => {
  const formData = new FormData();

  for (const { base64, name } of photos) {
    formData.append('files', toBlob(base64), name);
  }

  return formData;
};

export const useRecognizeProduct = (): RecognizeProductResult => {
  const dispatch = useAppDispatch();
  const pickedPhotos = useAppSelector(selectors.recognitionPhotos);
  const [photos] = useState(pickedPhotos);
  const [recognize, { data, isUninitialized, isLoading, isError, error }] =
    noteApi.useRecognizeMutation();

  const sendPhotos = useCallback(() => {
    const request = recognize(toFormData(photos));

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
    recognizedProduct: suggestion ? toRecognizedProductFormValues(suggestion) : null,
    retry: () => {
      sendPhotos();
    },
  };
};
