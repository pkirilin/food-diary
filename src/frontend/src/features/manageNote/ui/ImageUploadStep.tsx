import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { Button } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';
import { SuggestedProductCard } from './SuggestedProductCard';
import { SuggestedProductCardSkeleton } from './SuggestedProductCardSkeleton';

interface Props {
  images: Image[];
}

export const ImageUploadStep: FC<Props> = ({ images }) => {
  const recognizeNotes = useRecognizeNotes();
  const noteRecognition = useAppSelector(state => state.manageNote.noteRecognition);

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
    return (
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Review AI result
        </Typography>
        <SuggestedProductCard suggestion={noteRecognition.suggestions[0]} image={images[0]} />
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
        <Button fullWidth variant="outlined">
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={() => recognizeNotes(images)}>
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};
