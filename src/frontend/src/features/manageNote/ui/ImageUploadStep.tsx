import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { Button } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { useSubmitProduct } from '../lib/useSubmitProduct';
import { actions, type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';
import { SuggestedProductCard } from './SuggestedProductCard';
import { SuggestedProductCardSkeleton } from './SuggestedProductCardSkeleton';

interface Props {
  date: string;
  images: Image[];
}

export const ImageUploadStep: FC<Props> = ({ date, images }) => {
  const recognizeNotes = useRecognizeNotes();
  const noteRecognition = useAppSelector(state => state.manageNote.noteRecognition);
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const dispatch = useAppDispatch();
  const { categories } = categoryLib.useCategoriesForSelect();
  const submitProduct = useSubmitProduct(date);

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
        <SuggestedProductCard
          suggestion={suggestion}
          image={images[0]}
          onEdit={({ product, quantity }) =>
            dispatch(
              actions.productDraftCreated({
                name: product.name.trim(),
                defaultQuantity: quantity,
                category: categories.at(0) ?? null,
                calories: product.caloriesCost,
                protein: product.protein,
                fats: product.fats,
                carbs: product.carbs,
                sugar: product.sugar,
                salt: product.salt,
              }),
            )
          }
        />
        <Stack spacing={2} direction="row">
          <Button
            fullWidth
            variant="outlined"
            onClick={() => dispatch(actions.aiSuggestionDiscarded())}
          >
            Cancel
          </Button>
          <Button
            startIcon={<CheckIcon />}
            fullWidth
            variant="contained"
            loading={isSubmitting}
            onClick={() =>
              submitProduct({
                name: suggestion.product.name.trim(),
                defaultQuantity: suggestion.quantity,
                category: categories.at(0) ?? null,
                calories: suggestion.product.caloriesCost,
                protein: suggestion.product.protein,
                fats: suggestion.product.fats,
                carbs: suggestion.product.carbs,
                sugar: suggestion.product.sugar,
                salt: suggestion.product.salt,
              })
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
        <Button fullWidth variant="outlined" size="large" startIcon={<CloudUploadIcon />}>
          Browse
        </Button>
      </Stack>
      <ImagePreviewList images={images} onRemove={() => {}} />
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
