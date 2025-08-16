import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { LinearProgress, Stack, Typography } from '@mui/material';
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
  const noteRecognition = useAppSelector(state => state.manageNote.noteRecognition);
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const dispatch = useAppDispatch();
  const { categories } = categoryLib.useCategoriesForSelect();

  if (noteRecognition.isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Analyzing Images...
        </Typography>
        <LinearProgress />
        <SuggestedProductCardSkeleton />
      </Stack>
    );
  }

  if (noteRecognition.suggestions.length > 0) {
    const suggestion = noteRecognition.suggestions[0];

    return (
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Review AI result
        </Typography>
        <SuggestedProductCard suggestion={suggestion} image={images[0]} />
        <Stack spacing={2} direction="row">
          <Button
            startIcon={<CloseIcon />}
            fullWidth
            variant="outlined"
            onClick={() => dispatch(actions.aiSuggestionDiscarded())}
          >
            Discard
          </Button>
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
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Upload Images
        </Typography>
      </Stack>
      <ImagePreviewList images={images} onRemove={index => dispatch(actions.imageRemoved(index))} />
      <Stack spacing={2} direction="row">
        <Button
          fullWidth
          variant="outlined"
          onClick={() => dispatch(actions.productDraftDiscarded())}
        >
          Cancel
        </Button>
        <Button
          startIcon={<AutoAwesomeIcon />}
          fullWidth
          variant="contained"
          loading={isSubmitting}
          onClick={() => recognizeNotes(images)}
        >
          Generate
        </Button>
      </Stack>
    </Stack>
  );
};
