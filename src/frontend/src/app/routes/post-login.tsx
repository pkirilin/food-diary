import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthCallbackProgress, authApi, returnUrlSchema } from '@/features/auth';

export const Route = createFileRoute('/post-login')({
  validateSearch: z.object({ returnUrl: returnUrlSchema }),
  staticData: { appBar: null },
  beforeLoad: async ({ context, search }) => {
    const { data } = await context.store.dispatch(
      authApi.endpoints.getStatus.initiate({}, { subscribe: false }),
    );

    if (data?.isAuthenticated === true) {
      throw redirect({ href: search.returnUrl ?? '/' });
    }
  },
  pendingComponent: PostLoginRoute,
  pendingMs: 0,
  component: PostLoginRoute,
});

function PostLoginRoute() {
  return <AuthCallbackProgress label="Logging in..." />;
}
