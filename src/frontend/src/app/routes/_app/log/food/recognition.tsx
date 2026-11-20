import { createFileRoute, redirect } from '@tanstack/react-router';
import { logFoodModel } from '@/features/logFood';
import { LogFoodRecognitionPage } from '@/pages/ui/LogFoodRecognitionPage';
import { useGoBack } from '@/shared/hooks';

export const Route = createFileRoute('/_app/log/food/recognition')({
  staticData: {
    appBar: { variant: 'back', title: 'Recognize product' },
  },
  beforeLoad: ({ context }) => {
    if (logFoodModel.selectors.recognitionPhotos(context.store.getState()).length === 0) {
      throw redirect({ to: '/log/food', replace: true });
    }
  },
  onLeave: ({ context }) => {
    context.store.dispatch(logFoodModel.endRecognition());
  },
  component: LogFoodRecognitionRoute,
});

function LogFoodRecognitionRoute() {
  const goBack = useGoBack({ to: '/log/food', replace: true });

  return <LogFoodRecognitionPage onCreated={goBack} />;
}
