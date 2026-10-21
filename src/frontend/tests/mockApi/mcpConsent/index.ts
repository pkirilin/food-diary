import { db } from '../db';
import data from './mcpConsent.data.json';

export { handlers as mcpConsentHandlers } from './mcpConsent.handlers';
export * as mcpConsentService from './mcpConsent.service';

export const fillMcpConsentRequests = (): void => {
  data.forEach(consentRequest => {
    db.mcpConsentRequest.create(consentRequest);
  });
};
