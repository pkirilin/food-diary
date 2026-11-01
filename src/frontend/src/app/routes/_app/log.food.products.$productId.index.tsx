import { createFileRoute, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { LogFoodProductPage } from '@/pages/ui/LogFoodProductPage';

export const Route = createFileRoute('/_app/log/food/products/$productId/')({
  params: {
    parse: ({ productId }) => ({
      productId: z.coerce.number<string>().int().positive().parse(productId),
    }),
    stringify: ({ productId }) => ({ productId: String(productId) }),
  },
  staticData: {
    appBar: { variant: 'back', title: 'Product' },
  },
  component: LogFoodProductRoute,
});

function LogFoodProductRoute() {
  const { productId } = Route.useParams();
  const router = useRouter();

  return (
    <LogFoodProductPage
      productId={productId}
      onDone={() => {
        if (router.history.canGoBack()) {
          router.history.back();
        } else {
          void router.navigate({ to: '/log/food' });
        }
      }}
    />
  );
}
