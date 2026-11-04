import { Alert, AlertTitle, LinearProgress, Skeleton, Stack } from '@mui/material';
import { type FC } from 'react';
import { Button } from '@/shared/ui';
import { useRecognizeProduct } from '../lib/useRecognizeProduct';
import { CreateProductForm } from './CreateProductForm';

interface Props {
  onCreated: () => void;
}

const RecognitionSkeleton: FC = () => (
  <Stack spacing={2}>
    <LinearProgress aria-label="Recognizing product" />
    <Skeleton variant="rounded" height={56} />
    <Skeleton variant="rounded" height={56} />
    <Stack direction="row" spacing={2}>
      <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
      <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
    </Stack>
    <Skeleton variant="rounded" height={56} />
  </Stack>
);

export const RecognizeProductForm: FC<Props> = ({ onCreated }) => {
  const { isRecognizing, error, recognizedProduct, retry } = useRecognizeProduct();

  if (isRecognizing) {
    return <RecognitionSkeleton />;
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={retry}>
            Retry
          </Button>
        }
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  if (recognizedProduct === null) {
    return <Alert severity="warning">No food found. Please try other photos</Alert>;
  }

  return <CreateProductForm defaultValues={recognizedProduct} onCreated={onCreated} />;
};
