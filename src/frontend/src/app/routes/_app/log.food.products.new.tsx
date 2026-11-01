import { createFileRoute, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { LogFoodCreateProductPage } from '@/pages/ui/LogFoodCreateProductPage';

export const Route = createFileRoute('/_app/log/food/products/new')({
  validateSearch: z.object({
    name: z.string().optional().catch(undefined),
  }),
  staticData: {
    appBar: { variant: 'back', title: 'New product' },
  },
  component: LogFoodCreateProductRoute,
});

function LogFoodCreateProductRoute() {
  const { name = '' } = Route.useSearch();
  const router = useRouter();
  const navigate = Route.useNavigate();

  return (
    <LogFoodCreateProductPage
      name={name}
      onCreated={() => {
        if (router.history.canGoBack()) {
          router.history.back();
        } else {
          void navigate({ to: '/log/food', replace: true });
        }
      }}
    />
  );
}
