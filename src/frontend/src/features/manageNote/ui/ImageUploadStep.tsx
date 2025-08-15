import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { Button } from '@/shared/ui';
import { type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';

interface Props {
  images: Image[];
}

export const ImageUploadStep: FC<Props> = ({ images }) => {
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
        <Button fullWidth variant="contained">
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};
