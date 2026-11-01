import { createFileRoute, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { LogFoodEditProductPage } from '@/pages/ui/LogFoodEditProductPage';

export const Route = createFileRoute('/_app/log/food/products/$productId/edit')({
  params: {
    parse: ({ productId }) => ({
      productId: z.coerce.number<string>().int().positive().parse(productId),
    }),
    stringify: ({ productId }) => ({ productId: String(productId) }),
  },
  staticData: {
    appBar: { variant: 'back', title: 'Edit product' },
  },
  component: LogFoodEditProductRoute,
});

function LogFoodEditProductRoute() {
  const { productId } = Route.useParams();
  const router = useRouter();
  const navigate = Route.useNavigate();

  return (
    <LogFoodEditProductPage
      productId={productId}
      onSaved={() => {
        if (router.history.canGoBack()) {
          router.history.back();
        } else {
          void navigate({
            to: '/log/food/products/$productId',
            params: { productId },
            replace: true,
          });
        }
      }}
    />
  );
}
