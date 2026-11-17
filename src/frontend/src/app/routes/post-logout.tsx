import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/post-logout')({
  staticData: { appBar: null },
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
});
