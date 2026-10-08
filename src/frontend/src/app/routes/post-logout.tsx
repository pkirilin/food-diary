import { createFileRoute, useRouter } from '@tanstack/react-router';
import { PostLogoutPage } from '@/pages/ui/PostLogoutPage';

export const Route = createFileRoute('/post-logout')({
  staticData: { appBar: null },
  component: PostLogoutRoute,
});

function PostLogoutRoute() {
  const router = useRouter();

  return <PostLogoutPage navigate={router.history.push} />;
}
