import { api } from '@/shared/api';
import { createUrl } from '@/shared/lib';

export interface GetWeightLogsResponse {
  weightLogs: WeightLogItem[];
}

export interface GetWeightLogsRequest {
  from: string;
  to: string;
}

export interface WeightLogItem {
  date: string;
  value: number;
}

export interface WeightLogBody {
  date: string;
  value: number;
}

export const weightLogsApi = api.injectEndpoints({
  endpoints: create => ({
    weightLogs: create.query<GetWeightLogsResponse, GetWeightLogsRequest>({
      query: request => ({
        method: 'GET',
        url: createUrl('/api/weight-logs', { ...request }),
      }),
      providesTags: ['weightLog'],
    }),

    add: create.mutation<void, WeightLogBody>({
      query: body => ({
        method: 'POST',
        url: '/api/weight-logs',
        body,
      }),
      invalidatesTags: ['weightLog'],
    }),
  }),
});
