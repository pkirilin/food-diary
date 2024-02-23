import { type LoaderFunction, redirect } from 'react-router-dom';
import { authApi } from '@/features/auth';
import store from '@/store';
import { createUrl } from '@/utils';

export const ok = (): Response => new Response(null, { status: 200 });

export const badRequest = (message: string): Response => new Response(message, { status: 400 });

export const withAuthStatusCheck =
  <Context>(innerLoader: LoaderFunction<Context>): LoaderFunction<Context> =>
  async args => {
    const authStatus = await store.dispatch(authApi.endpoints.getStatus.initiate({}));

    if (!authStatus.data?.isAuthenticated) {
      const returnUrl = new URL(args.request.url).searchParams.get('returnUrl') ?? '/';
      const loginUrl = createUrl('/login', { returnUrl });
      return redirect(loginUrl);
    }

    return await innerLoader(args);
  };
