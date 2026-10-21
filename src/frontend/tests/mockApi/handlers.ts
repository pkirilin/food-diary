import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';
import { mcpConsentHandlers } from './mcpConsent';
import { notesHandlers } from './notes';
import { productsHandlers } from './products';
import { weightLogsHandlers } from './weightLogs';

export const handlers = [
  ...authHandlers,
  ...notesHandlers,
  ...productsHandlers,
  ...categoriesHandlers,
  ...weightLogsHandlers,
  ...mcpConsentHandlers,
];
