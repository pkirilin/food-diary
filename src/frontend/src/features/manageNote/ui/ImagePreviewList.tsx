import { Box } from '@mui/material';
import { type FC } from 'react';
import { type Image } from '../model';

interface Props {
  images: Image[];
}

export const ImagePreviewList: FC<Props> = ({ images }) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    {images.map((image, index) => (
      <Box key={`${image.name ?? 'image'}-${index}`} sx={{ width: 128, height: 128 }}>
        <Box
          borderRadius={2}
          component="img"
          src={image.base64}
          alt={`Uploaded image preview ${index + 1}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 2,
          }}
        />
      </Box>
    ))}
  </Box>
);
