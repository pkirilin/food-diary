import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Box, IconButton, Tooltip } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useRef, type FC, type ChangeEventHandler } from 'react';
import { useAppDispatch } from '@/app/store';
import { noteApi } from '@/entities/note';
import { imageLib } from '@/shared/lib';
import { type Image, actions } from '../model';

export const UploadImageButton: FC = () => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const [recognize] = noteApi.useRecognizeMutation();

  const sendRecognizeRequest = async (image: Image): Promise<void> => {
    const response = await fetch(image.base64);
    const blob = await response.blob();
    const file = new File([blob], image.name, { type: blob.type });
    const formData = new FormData();
    formData.append('files', file);
    await recognize(formData);
  };

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
        sendRecognizeRequest(image);
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
