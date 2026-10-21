import { http, type HttpHandler, type PathParams } from 'msw';
import {
  type GetMcpConsentResponse,
  type SubmitMcpConsentRequest,
  type SubmitMcpConsentResponse,
} from '@/features/mcpConsent';
import { API_URL } from '@/shared/config';
import { DelayedHttpResponse } from '../DelayedHttpResponse';
import * as mcpConsentService from './mcpConsent.service';

export const handlers: HttpHandler[] = [
  http.get(`${API_URL}/authorize/consent`, ({ request }) => {
    const id = new URL(request.url).searchParams.get('consentRequest') ?? '';
    const consentRequest = mcpConsentService.find(id);

    if (!consentRequest) {
      return DelayedHttpResponse.badRequest();
    }

    return DelayedHttpResponse.json<GetMcpConsentResponse>({
      clientName: consentRequest.clientName,
      logoUri: consentRequest.logoUri,
      clientIdHost: new URL(consentRequest.clientId).hostname,
      redirectUriHost: new URL(consentRequest.redirectUri).hostname,
      isLocalhostOnly: consentRequest.isLocalhostOnly,
    });
  }),

  http.post<PathParams, SubmitMcpConsentRequest>(
    `${API_URL}/authorize/consent`,
    async ({ request }) => {
      const { consentRequest: id, approved } = await request.json();
      const consentRequest = mcpConsentService.redeem(id);

      if (!consentRequest) {
        return DelayedHttpResponse.badRequest();
      }

      const decision = new URLSearchParams(
        approved ? { code: 'fake-authorization-code' } : { error: 'access_denied' },
      );

      return DelayedHttpResponse.json<SubmitMcpConsentResponse>({
        redirectUrl: `${consentRequest.redirectUri}?${decision}`,
      });
    },
  ),
];
