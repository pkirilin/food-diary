import { type FC } from 'react';
import { RecognizeProductForm } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  onCreated: () => void;
}

export const LogFoodRecognitionPage: FC<Props> = ({ onCreated }) => (
  <PageContainer>
    <RecognizeProductForm onCreated={onCreated} />
  </PageContainer>
);
