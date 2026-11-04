import { getRouteApi } from '@tanstack/react-router';
import { type FC } from 'react';
import { RecognizeProductButton } from '@/features/logFood';

const route = getRouteApi('/_app/log/food/');

export const CameraSlot: FC = () => {
  const navigate = route.useNavigate();

  return (
    <RecognizeProductButton
      onPhotosPicked={() => {
        void navigate({ to: '/log/food/recognition' });
      }}
    />
  );
};
