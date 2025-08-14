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
    name: file.name,
    base64,
  };
};

export const UploadImagesButton: FC = () => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const recognizeNotes = useRecognizeNotes();

  const handleFilesChange: ChangeEventHandler<HTMLInputElement> = async event => {
    const files = Array.from(event.target?.files ?? []);
    const images = await Promise.all(files.map(toImage));

    dispatch(actions.imagesUploaded(images));

    await recognizeNotes(images);
  };

  return (
    <>
      <Tooltip title="Upload image" placement="left">
        <IconButton edge="end" onClick={() => imageInputRef.current?.click()}>
          <PhotoIcon />
        </IconButton>
      </Tooltip>
      <Box
        component="input"
        ref={imageInputRef}
        sx={visuallyHidden}
        type="file"
        name="image"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
      />
    </>
  );
};
