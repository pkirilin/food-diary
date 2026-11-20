import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';
import { type GetNotesHistoryRequest, noteApi } from '@/entities/note';
import { HistoryPage } from '@/pages/ui/HistoryPage';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';

const getDefaultMonth = (): number => (MSW_ENABLED ? 10 : new Date().getMonth() + 1);
const getDefaultYear = (): number => (MSW_ENABLED ? 2023 : new Date().getFullYear());

const HistoryFilterSlot = lazy(() =>
  import('./-HistoryFilterSlot').then(module => ({ default: module.HistoryFilterSlot })),
);

export const Route = createFileRoute('/_app/history')({
  validateSearch: z.object({
    month: z.number().int().min(1).max(12).optional().catch(undefined),
    year: z.number().int().optional().catch(undefined),
  }),
  staticData: {
    appBar: {
      variant: 'menu',
      title: 'History',
      Actions: HistoryFilterSlot,
    },
  },
  loaderDeps: ({ search }) => ({
    month: search.month ?? getDefaultMonth(),
    year: search.year ?? getDefaultYear(),
  }),
  loader: async ({ context, deps }) => {
    const date = new Date(deps.year, deps.month - 1);

    const notesHistoryRequest: GetNotesHistoryRequest = {
      from: dateLib.formatToISOStringWithoutTime(date),
      to: dateLib.formatToISOStringWithoutTime(dateLib.getEndOfMonth(date)),
    };

    const notesHistoryQueryPromise = context.store.dispatch(
      noteApi.endpoints.notesHistory.initiate(notesHistoryRequest),
    );

    try {
      await notesHistoryQueryPromise;
      return { notesHistoryRequest };
    } finally {
      notesHistoryQueryPromise.unsubscribe();
    }
  },
  component: HistoryRoute,
});

function HistoryRoute() {
  const { notesHistoryRequest } = Route.useLoaderData();

  return <HistoryPage notesHistoryRequest={notesHistoryRequest} />;
}
