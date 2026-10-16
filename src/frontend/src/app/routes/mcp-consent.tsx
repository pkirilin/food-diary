import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { McpConsentPage } from '@/pages/ui/McpConsentPage';

export const Route = createFileRoute('/mcp-consent')({
  validateSearch: z.object({ consentRequest: z.string().catch('') }),
  staticData: { appBar: null },
  component: McpConsentRoute,
});

function McpConsentRoute() {
  const { consentRequest } = Route.useSearch();

  return (
    <McpConsentPage
      consentRequest={consentRequest}
      redirect={url => {
        window.location.assign(url);
      }}
    />
  );
}
