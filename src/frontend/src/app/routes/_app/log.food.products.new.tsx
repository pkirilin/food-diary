import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { LogFoodCreateProductPage } from '@/pages/ui/LogFoodCreateProductPage';
import { useGoBack } from '@/shared/hooks';

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
  const goBack = useGoBack({ to: '/log/food', replace: true });

  return <LogFoodCreateProductPage name={name} onCreated={goBack} />;
}
