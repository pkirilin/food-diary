import PhotoIcon from '@mui/icons-material/Photo';
import { Box, IconButton, Tooltip } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useRef, type FC, type ChangeEventHandler } from 'react';
import { useAppDispatch } from '@/app/store';
import { imageLib } from '@/shared/lib';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { actions, type Image } from '../model';

const toImage = async (file: File): Promise<Image> => {
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

      const images = await Promise.all(files.map(toImage));

      dispatch(actions.imagesUploaded(images));

      await recognizeNotes(images);
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
        sx={visuallyHidden}
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
      />
    </>
  );
};
