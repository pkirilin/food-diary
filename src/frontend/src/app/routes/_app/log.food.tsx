import { createFileRoute, Outlet, redirect, useBlocker } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { DiscardMealDraftDialog } from '@/features/logFood';

export const Route = createFileRoute('/_app/log/food')({
  staticData: { appBar: null },
  beforeLoad: ({ context }) => {
    if (foodLogModel.selectors.mealDraft(context.store.getState()) === null) {
      throw redirect({ to: '/' });
    }
  },
  component: LogFoodLayoutRoute,
});

const isInLogFoodFlow = (pathname: string): boolean =>
  pathname === Route.fullPath || pathname.startsWith(`${Route.fullPath}/`);

function LogFoodLayoutRoute() {
  const store = Route.useRouteContext({ select: context => context.store });
  const dispatch = useAppDispatch();
  const foodLogsCount = useAppSelector(foodLogModel.selectors.foodLogsCount);

  const blocker = useBlocker({
    shouldBlockFn: ({ next }) =>
      !isInLogFoodFlow(next.pathname) && foodLogModel.selectors.foodLogsCount(store.getState()) > 0,
    enableBeforeUnload: false,
    withResolver: true,
  });

  return (
    <>
      <Outlet />
      {blocker.status === 'blocked' && (
        <DiscardMealDraftDialog
          foodLogsCount={foodLogsCount}
          onDiscard={() => {
            dispatch(foodLogModel.actions.mealDraftDiscarded());
            blocker.proceed();
          }}
          onCancel={blocker.reset}
        />
      )}
    </>
  );
}
