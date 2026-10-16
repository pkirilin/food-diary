export interface GetMcpConsentResponse {
  clientName: string;
  logoUri: string | null;
  clientIdHost: string;
  redirectUriHost: string;
  isLocalhostOnly: boolean;
}

export interface SubmitMcpConsentRequest {
  consentRequest: string;
  approved: boolean;
}

export interface SubmitMcpConsentResponse {
  redirectUrl: string;
}
