import { api } from '@/shared/api';

export interface GetWeightLogsResponse {
  weightLogs: WeightLogItem[];
}

export interface WeightLogItem {
  date: string;
  value: number;
}

export const weightLogsApi = api.injectEndpoints({
  endpoints: create => ({
    weightLogs: create.query<GetWeightLogsResponse, null>({
      query: () => ({
        method: 'GET',
        url: '/api/weight-logs',
      }),
    }),
  }),
});
