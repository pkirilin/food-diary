import { type LoaderFunction, redirect } from 'react-router-dom';
import { authApi } from '@/features/auth';
import store from '@/store';
import { createUrl } from '@/utils';

export const ok = (): Response => new Response(null, { status: 200 });

export const withAuthStatusCheck =
  <Context>(innerLoader: LoaderFunction<Context>): LoaderFunction<Context> =>
  async args => {
    const getAuthStatusQuery = await store.dispatch(
      authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
    );

    if (!getAuthStatusQuery.data?.isAuthenticated) {
      const returnUrl = new URL(args.request.url).searchParams.get('returnUrl') ?? '/';
      const loginUrl = createUrl('/login', { returnUrl });
      return redirect(loginUrl);
    }

    return await innerLoader(args);
  };
