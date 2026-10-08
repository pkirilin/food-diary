import { type FC } from 'react';
import { useNavigate } from 'react-router';
import { PostLogoutPage } from '@/pages/ui/PostLogoutPage';

export const Component: FC = () => {
  const navigate = useNavigate();

  return <PostLogoutPage navigate={navigate} />;
};
