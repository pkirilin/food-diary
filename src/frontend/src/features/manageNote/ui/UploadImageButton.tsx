import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Box, IconButton, Tooltip } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useRef, type FC, type ChangeEventHandler } from 'react';
import { useAppDispatch } from '@/app/store';
import { imageLib } from '@/shared/lib';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { actions, type Image } from '../model';

export const UploadImageButton: FC = () => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const recognizeNotes = useRecognizeNotes();

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async event => {
    const file = event.target?.files?.item(0);

    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        if (typeof reader.result !== 'string') {
          throw new Error(
            'Image upload failed: expected a string, but received: ' + typeof reader.result,
          );
        }

        const resizedFile = await imageLib.resize(reader.result, 512, file.name);
        const base64 = await imageLib.convertToBase64String(resizedFile);

        const image: Image = {
          name: file.name,
          base64,
        };

        dispatch(actions.imageUploaded(image));
        await recognizeNotes(image);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Tooltip title="Upload image" placement="left">
        <IconButton edge="end" onClick={() => imageInputRef.current?.click()}>
          <PhotoCameraIcon />
        </IconButton>
      </Tooltip>
      <Box
        component="input"
        ref={imageInputRef}
        sx={visuallyHidden}
        type="file"
        name="image"
        accept="image/*"
        onChange={handleFileChange}
      />
    </>
  );
};
