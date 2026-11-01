import { createFileRoute, useRouter } from '@tanstack/react-router';
import { LogFoodProductPage } from '@/pages/ui/LogFoodProductPage';
import { useGoBack } from '@/shared/hooks';
import { productIdParams } from './-productIdParams';

export const Route = createFileRoute('/_app/log/food/products/$productId/')({
  params: productIdParams,
  staticData: {
    appBar: { variant: 'back', title: 'Product' },
  },
  component: LogFoodProductRoute,
});

function LogFoodProductRoute() {
  const { productId } = Route.useParams();
  const router = useRouter();
  const goBack = useGoBack({ to: '/log/food' });

  return (
    <LogFoodProductPage
      productId={productId}
      onDone={goBack}
      onEditProduct={() => {
        void router.navigate({
          to: '/log/food/products/$productId/edit',
          params: { productId },
        });
      }}
    />
  );
}
