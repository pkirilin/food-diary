import { type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { getInAppReturnUrl } from '@/features/auth';
import { PostLoginPage } from '@/pages/ui/PostLoginPage';

export const Component: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return <PostLoginPage returnUrl={getInAppReturnUrl(searchParams)} navigate={navigate} />;
};
