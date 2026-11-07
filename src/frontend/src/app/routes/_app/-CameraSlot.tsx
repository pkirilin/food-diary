import { getRouteApi } from '@tanstack/react-router';
import { type FC } from 'react';
import { RecognizeProductButton } from '@/features/logFood';
import { useClearSearchQuery } from './-searchQuery';

const route = getRouteApi('/_app/log/food/');

export const CameraSlot: FC = () => {
  const navigate = route.useNavigate();
  const clearSearchQuery = useClearSearchQuery();

  return (
    <RecognizeProductButton
      onPhotosPicked={() => {
        void clearSearchQuery().then(() => navigate({ to: '/log/food/recognition' }));
      }}
    />
  );
};
