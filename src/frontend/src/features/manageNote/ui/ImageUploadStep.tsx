import CheckIcon from '@mui/icons-material/Check';
import { Alert, AlertTitle, LinearProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { Button } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { actions, type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';
import { SuggestedProductCard } from './SuggestedProductCard';
import { SuggestedProductCardSkeleton } from './SuggestedProductCardSkeleton';

interface Props {
  images: Image[];
}

export const ImageUploadStep: FC<Props> = ({ images }) => {
  const recognizeNotes = useRecognizeNotes();
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const dispatch = useAppDispatch();
  const { categories } = categoryLib.useCategoriesForSelect();

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
        <SuggestedProductCardSkeleton />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => recognizeNotes(images)}>
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
      <SuggestedProductCard suggestion={suggestion} />
      <Stack spacing={2} direction="row">
        <Button
          startIcon={<CheckIcon />}
          fullWidth
          variant="contained"
          loading={isSubmitting}
          onClick={() =>
            dispatch(
              actions.productDraftCreated({
                name: suggestion.product.name.trim(),
                defaultQuantity: suggestion.quantity,
                category: categories.at(0) ?? null,
                calories: suggestion.product.caloriesCost,
                protein: suggestion.product.protein,
                fats: suggestion.product.fats,
                carbs: suggestion.product.carbs,
                sugar: suggestion.product.sugar,
                salt: suggestion.product.salt,
              }),
            )
          }
        >
          Accept
        </Button>
      </Stack>
    </Stack>
  );
};
