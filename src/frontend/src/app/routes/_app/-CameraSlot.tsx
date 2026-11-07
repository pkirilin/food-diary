import { type FC } from 'react';
import { RecognizeProductButton } from '@/features/logFood';
import { useLeaveSearch } from './-leaveSearch';

export const CameraSlot: FC = () => {
  const leaveSearch = useLeaveSearch();

  return (
    <RecognizeProductButton
      onPhotosPicked={() => {
        leaveSearch({ to: '/log/food/recognition' });
      }}
    />
  );
};
