import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, AlertTitle, LinearProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { type RecognizeNoteItem } from '@/entities/note';
import { ProductForm, type OnSubmitProductFn, type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { Button } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';
import { SuggestionSkeleton } from './SuggestionSkeleton';

interface Props {
  images: Image[];
  onSubmitProduct: OnSubmitProductFn;
}

const toProductFormValues = (
  { product, quantity }: RecognizeNoteItem,
  category: SelectOption | null,
): productModel.ProductFormValues => ({
  name: product.name.trim(),
  defaultQuantity: quantity,
  category,
  calories: product.caloriesCost,
  protein: product.protein,
  fats: product.fats,
  carbs: product.carbs,
  sugar: product.sugar,
  salt: product.salt,
});

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
          defaultValues={toProductFormValues(suggestion, categories.at(0) ?? null)}
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
