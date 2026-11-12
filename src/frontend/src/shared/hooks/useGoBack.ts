import { type NavigateOptions, type RegisteredRouter, useRouter } from '@tanstack/react-router';

export const useGoBack = <TTo extends string | undefined>(
  fallback: NavigateOptions<RegisteredRouter, string, TTo>,
): (() => void) => {
  const router = useRouter();

  return () => {
    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      void router.navigate(fallback);
    }
  };
};
