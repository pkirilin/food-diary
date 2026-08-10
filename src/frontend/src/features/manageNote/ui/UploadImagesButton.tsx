import PhotoIcon from '@mui/icons-material/Photo';
import { Box, IconButton, Tooltip, type SxProps, type Theme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useRef, type FC, type ChangeEventHandler } from 'react';
import { useAppDispatch } from '@/app/store';
import { imageLib } from '@/shared/lib';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { actions, type Image } from '../model';

const toResizedImage = async (file: File): Promise<Omit<Image, 'originalUrl'>> => {
  const resizedImage = await imageLib.resize(file);
  const base64 = await imageLib.convertToBase64String(resizedImage);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    base64,
  };
};

export const UploadImagesButton: FC = () => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const recognizeNotes = useRecognizeNotes();

  const handleFilesChange: ChangeEventHandler<HTMLInputElement> = async event => {
    try {
      const files = Array.from(event.target?.files ?? []);

      if (files.length === 0) {
        return;
      }

      const resizedImages = await Promise.all(files.map(toResizedImage));

      const images = files.map((file, index) => ({
        ...resizedImages[index],
        originalUrl: URL.createObjectURL(file),
      }));

      dispatch(actions.imagesUploaded(images));

      await recognizeNotes(images);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to upload images: ', error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      <Tooltip title="Upload images" placement="left">
        <IconButton edge="end" onClick={() => imageInputRef.current?.click()}>
          <PhotoIcon />
        </IconButton>
      </Tooltip>
      <Box
        component="input"
        ref={imageInputRef}
        sx={visuallyHidden as SxProps<Theme>}
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
      />
    </>
  );
};
