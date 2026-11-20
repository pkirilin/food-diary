import { type NavigateOptions, type RegisteredRouter, useRouter } from '@tanstack/react-router';

export const useLeaveSearch = (): (<TTo extends string | undefined>(
  destination: NavigateOptions<RegisteredRouter, string, TTo>,
) => void) => {
  const router = useRouter();

  return destination => {
    void router
      .navigate({ to: '/log/food', search: {}, replace: true })
      .then(() => router.navigate(destination));
  };
};
