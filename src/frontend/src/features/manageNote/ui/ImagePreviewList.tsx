import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton } from '@mui/material';
import { type FC } from 'react';
import { type Image } from '../model';

interface Props {
  images: Image[];
  onRemove: () => void;
}

export const ImagePreviewList: FC<Props> = ({ images, onRemove }) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    {images.map((image, index) => (
      <Box key={image.base64} sx={{ position: 'relative', width: 128, height: 128 }}>
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
        <IconButton
          onClick={onRemove}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            width: 24,
            height: 24,
            zIndex: 2,
            '&:hover': {
              background: 'rgba(0,0,0,0.7)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    ))}
  </Box>
);
