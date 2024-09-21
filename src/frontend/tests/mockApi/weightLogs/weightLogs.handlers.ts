import { http } from 'msw';
import { type GetWeightLogsResponse } from '@/entities/weightLog';
import { API_URL } from '@/shared/config';
import { db } from '../db';
import { DelayedHttpResponse } from '../DelayedHttpResponse';

export const handlers = [
  http.get(`${API_URL}/api/weight-logs`, () =>
    DelayedHttpResponse.json<GetWeightLogsResponse>({
      weightLogs: db.weightLog.getAll(),
    }),
  ),
];
