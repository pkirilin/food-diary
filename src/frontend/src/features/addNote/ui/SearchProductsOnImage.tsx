import { CircularProgress, Alert, AlertTitle } from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, type FC, useCallback } from 'react';
import { noteApi } from '@/entities/note';
import { parseClientError } from '@/shared/api';
import { Button } from '@/shared/ui';
import { type Image } from '../model';
import { FoundProductsList } from './FoundProductsList';

interface Props {
  image: Image;
}

export const SearchProductsOnImage: FC<Props> = ({ image }) => {
  const [recognize, recognizeResult] = noteApi.useRecognizeMutation();

  const sendRecognizeRequest = useCallback(async (): Promise<void> => {
    const formData = new FormData();
    // TODO: add file name and content type
    formData.append('files', new File([image.base64], 'TEST.jpeg'));
    await recognize(formData);
  }, [image.base64, recognize]);

  useEffect(() => {
    sendRecognizeRequest();
  }, [sendRecognizeRequest]);

  if (recognizeResult.isLoading) {
    return (
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (recognizeResult.isError) {
    const error = parseClientError(recognizeResult.error);

    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={sendRecognizeRequest}>
            Retry
          </Button>
        }
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  const product = recognizeResult.data?.notes?.at(0)?.product;

  if (!product) {
    return <Alert severity="warning">No food found on your image</Alert>;
  }

  // TODO: set foundProducts as well
  return <FoundProductsList foundProducts={[]} query={product.name.trim()} />;
};
