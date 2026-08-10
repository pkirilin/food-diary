import { Box, ButtonBase } from '@mui/material';
import { useState, type FC } from 'react';
import { ImageViewer } from '@/shared/ui';
import { type Image } from '../model';

interface Props {
  images: Image[];
}

export const ImagePreviewList: FC<Props> = ({ images }) => {
  const [openedImage, setOpenedImage] = useState<Image | null>(null);

  return (
    <>
      <Box display="flex" gap={2} flexWrap="wrap">
        {images.map((image, index) => (
          <ButtonBase
            key={image.id}
            aria-label={`Open uploaded image preview ${index + 1}`}
            onClick={() => setOpenedImage(image)}
            sx={{ width: 128, height: 128, borderRadius: 2 }}
          >
            <Box
              component="img"
              src={image.base64}
              alt=""
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          </ButtonBase>
        ))}
      </Box>
      {openedImage !== null && (
        <ImageViewer
          opened
          src={openedImage.originalUrl}
          fallbackSrc={openedImage.base64}
          alt={`Uploaded image preview ${images.indexOf(openedImage) + 1}`}
          onClose={() => setOpenedImage(null)}
        />
      )}
    </>
  );
};
