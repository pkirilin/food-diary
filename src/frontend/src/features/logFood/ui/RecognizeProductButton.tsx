import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { ImagePicker } from '@/shared/ui';
import { actions } from '../model';

interface Props {
  onPhotosPicked: () => void;
}

export const RecognizeProductButton: FC<Props> = ({ onPhotosPicked }) => {
  const dispatch = useAppDispatch();

  return (
    <ImagePicker
      label="Recognize product from photos"
      icon={<PhotoCameraIcon />}
      color="inherit"
      onPick={photos => {
        dispatch(actions.recognitionPhotosPicked(photos));
        onPhotosPicked();
      }}
    />
  );
};
