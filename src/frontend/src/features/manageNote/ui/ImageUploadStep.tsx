import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, AlertTitle, LinearProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { noteLib } from '@/entities/note';
import { ProductForm, type OnSubmitProductFn } from '@/entities/product';
import { type imageLib } from '@/shared/lib';
import { Button, ImagePreviewList } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { SuggestionSkeleton } from './SuggestionSkeleton';

interface Props {
  images: imageLib.Image[];
  onSubmitProduct: OnSubmitProductFn;
}

export const ImageUploadStep: FC<Props> = ({ images, onSubmitProduct }) => {
  const recognizeNotes = useRecognizeNotes();
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const { categories, categoriesLoading } = categoryLib.useCategoriesForSelect();

  const { suggestions, isLoading, error } = useAppSelector(
    state => state.manageNote.noteRecognition,
  );

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h6" component="h2">
          Analyzing Images...
        </Typography>
        <LinearProgress />
        <SuggestionSkeleton />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            disabled={isSubmitting}
            onClick={() => recognizeNotes(images)}
          >
            Retry
          </Button>
        }
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  const suggestion = suggestions.at(0);

  if (!suggestion?.product) {
    return (
      <Stack spacing={3}>
        <ImagePreviewList images={images} />
        <Alert severity="warning">No food found. Please try other images</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" component="h2">
        Review AI suggestions
      </Typography>
      <ImagePreviewList images={images} />
      {categoriesLoading ? (
        <SuggestionSkeleton />
      ) : (
        <ProductForm
          formId="product-form"
          autoFocus={false}
          defaultValues={noteLib.toRecognizedProductFormValues(
            suggestion,
            categories.at(0) ?? null,
          )}
          categories={categories}
          categoriesLoading={false}
          onSubmit={onSubmitProduct}
        />
      )}
      <Button
        startIcon={<RefreshIcon />}
        variant="outlined"
        fullWidth
        disabled={isSubmitting}
        onClick={() => recognizeNotes(images)}
      >
        Retry
      </Button>
    </Stack>
  );
};
