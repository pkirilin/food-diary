import { api } from '@/shared/api';
import {
  type GetMcpConsentResponse,
  type SubmitMcpConsentRequest,
  type SubmitMcpConsentResponse,
} from './contracts';

export const mcpConsentApi = api.injectEndpoints({
  endpoints: builder => ({
    getConsent: builder.query<GetMcpConsentResponse, string>({
      query: consentRequest => ({ url: '/authorize/consent', params: { consentRequest } }),
    }),

    submitConsent: builder.mutation<SubmitMcpConsentResponse, SubmitMcpConsentRequest>({
      query: body => ({ method: 'POST', url: '/authorize/consent', body }),
    }),
  }),
});
