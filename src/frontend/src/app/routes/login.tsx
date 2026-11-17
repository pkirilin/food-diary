import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { authApi, returnUrlSchema } from '@/features/auth';
import { LoginPage } from '@/pages/ui/LoginPage';
import { AppLoader } from '@/shared/ui';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ returnUrl: returnUrlSchema }),
  staticData: { appBar: null },
  beforeLoad: async ({ context }) => {
    const { data } = await context.store.dispatch(
      authApi.endpoints.getStatus.initiate({}, { forceRefetch: true, subscribe: false }),
    );

    if (data?.isAuthenticated === true) {
      throw redirect({ to: '/' });
    }
  },
  pendingComponent: AppLoader,
  pendingMs: 0,
  component: LoginRoute,
});

function LoginRoute() {
  const { returnUrl = '/' } = Route.useSearch();
  const router = useRouter();

  return <LoginPage returnUrl={returnUrl} navigate={router.history.push} />;
}
