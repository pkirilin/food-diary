import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { logFoodModel } from '@/features/logFood';
import { LogFoodRecognitionPage } from '@/pages/ui/LogFoodRecognitionPage';

export const Route = createFileRoute('/_app/log/food/recognition')({
  staticData: {
    appBar: { variant: 'back', title: 'Recognize product' },
  },
  beforeLoad: ({ context }) => {
    if (logFoodModel.selectors.recognitionPhotos(context.store.getState()).length === 0) {
      throw redirect({ to: '/log/food', replace: true });
    }
  },
  component: LogFoodRecognitionRoute,
});

function LogFoodRecognitionRoute() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  return (
    <LogFoodRecognitionPage
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
