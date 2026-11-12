import PhotoIcon from '@mui/icons-material/Photo';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { ImagePicker } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { actions } from '../model';

export const UploadImagesButton: FC = () => {
  const dispatch = useAppDispatch();
  const recognizeNotes = useRecognizeNotes();

  return (
    <ImagePicker
      label="Upload images"
      icon={<PhotoIcon />}
      color="default"
      onPick={images => {
        dispatch(actions.imagesUploaded(images));
        void recognizeNotes(images);
      }}
    />
  );
};
