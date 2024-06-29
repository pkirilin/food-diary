import { Box, ImageList, ImageListItem, ImageListItemBar, Stack } from '@mui/material';
import { useState, type FC } from 'react';
import { convertToBase64String, resizeImage } from '@/shared/lib';
import { UploadButton } from '@/shared/ui';
import { type UploadedPhoto } from '../model';

interface Props {
  onUploadSuccess: (file: File) => Promise<void>;
}

export const NoteInputFromPhotoFlow: FC<Props> = ({ onUploadSuccess }) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const handleUpload = async (file: File): Promise<void> => {
    const base64 = await convertToBase64String(file);
    const resizedFile = await resizeImage(base64, 512, file.name);
    const resizedBase64 = await convertToBase64String(resizedFile);

    setUploadedPhotos([
      {
        src: resizedBase64,
        name: file.name,
        file,
      },
    ]);

    await onUploadSuccess(resizedFile);
  };

  if (uploadedPhotos.length === 0) {
    return (
      <UploadButton name="photos" accept="image/*" onUpload={handleUpload}>
        Upload photo
      </UploadButton>
    );
  }

  return (
    <Stack spacing={3}>
      <ImageList cols={2} gap={16}>
        {uploadedPhotos.map((photo, index) => (
          <ImageListItem key={index}>
            <Box
              component="img"
              height="194px"
              src={photo.src}
              alt={photo.name}
              sx={{ objectFit: 'cover' }}
            />
            <ImageListItemBar title={photo.name} />
          </ImageListItem>
        ))}
      </ImageList>
    </Stack>
  );
};
