import { createFileRoute } from '@tanstack/react-router';
import { LogFoodEditProductPage } from '@/pages/ui/LogFoodEditProductPage';
import { useGoBack } from '@/shared/hooks';
import { productIdParams } from './-productIdParams';

export const Route = createFileRoute('/_app/log/food/products/$productId/edit')({
  params: productIdParams,
  staticData: {
    appBar: { variant: 'back', title: 'Edit product' },
  },
  component: LogFoodEditProductRoute,
});

function LogFoodEditProductRoute() {
  const { productId } = Route.useParams();
  const goBack = useGoBack({
    to: '/log/food/products/$productId',
    params: { productId },
    replace: true,
  });

  return <LogFoodEditProductPage productId={productId} onSaved={goBack} />;
}
