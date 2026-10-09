import { createFileRoute, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { returnUrlSchema } from '@/features/auth';
import { PostLoginPage } from '@/pages/ui/PostLoginPage';

export const Route = createFileRoute('/post-login')({
  validateSearch: z.object({ returnUrl: returnUrlSchema }),
  staticData: { appBar: null },
  component: PostLoginRoute,
});

function PostLoginRoute() {
  const { returnUrl = '/' } = Route.useSearch();
  const router = useRouter();

  return <PostLoginPage returnUrl={returnUrl} navigate={router.history.push} />;
}
