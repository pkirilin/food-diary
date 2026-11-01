import { createFileRoute, redirect } from '@tanstack/react-router';
import { foodLogModel } from '@/entities/foodLog';

export const Route = createFileRoute('/_app/log/food')({
  staticData: { appBar: null },
  beforeLoad: ({ context }) => {
    if (foodLogModel.selectors.mealDraft(context.store.getState()) === null) {
      throw redirect({ to: '/' });
    }
  },
});
