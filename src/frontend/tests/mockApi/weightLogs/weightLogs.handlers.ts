import { type PathParams, http, type HttpHandler } from 'msw';
import { type WeightLogBody, type GetWeightLogsResponse } from '@/entities/weightLog';
import { API_URL } from '@/shared/config';
import { db } from '../db';
import { DelayedHttpResponse } from '../DelayedHttpResponse';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/api/weight-logs`, ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (!from || !to) {
      return DelayedHttpResponse.badRequest();
    }

    return DelayedHttpResponse.json<GetWeightLogsResponse>({
      weightLogs: db.weightLog
        .findMany({
          where: {
            date: {
              gte: from,
              lte: to,
            },
          },
          orderBy: { date: 'desc' },
        })
        .map(({ date, value }) => ({ date, value })),
    });
  }),

  http.post<PathParams, WeightLogBody>(`${API_URL}/api/weight-logs`, async ({ request }) => {
    const { date, value } = await request.json();

    db.weightLog.create({
      date,
      value,
    });

    return await DelayedHttpResponse.ok();
  }),
];
