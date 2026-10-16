import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { Button } from '@/shared/ui';
import { mcpConsentApi } from '../api';
import { McpClientLogo } from './McpClientLogo';

interface Props {
  consentRequest: string;
  redirect: (url: string) => void;
}

export const McpConsent: FC<Props> = ({ consentRequest, redirect }) => {
  const consentQuery = mcpConsentApi.useGetConsentQuery(consentRequest);
  const [submitConsent, submitResult] = mcpConsentApi.useSubmitConsentMutation();

  if (consentQuery.isError || submitResult.isError) {
    return (
      <Alert severity="error" sx={{ width: '100%' }}>
        This request has expired; start again from your MCP Client.
      </Alert>
    );
  }

  if (!consentQuery.data) {
    return <CircularProgress />;
  }

  const { clientName, logoUri, clientIdHost, redirectUriHost, isLocalhostOnly } = consentQuery.data;

  const decisionSent = submitResult.isLoading || submitResult.isSuccess;

  const decide = async (approved: boolean): Promise<void> => {
    const { data } = await submitConsent({ consentRequest, approved });

    if (data) {
      redirect(data.redirectUrl);
    }
  };

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', width: '100%' }}>
      <McpClientLogo clientName={clientName} logoUri={logoUri} />
      <Typography variant="h5" component="h2">
        {clientName}
      </Typography>
      <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Identified by <strong>{clientIdHost}</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Receives access on <strong>{redirectUriHost}</strong>
        </Typography>
      </Stack>
      <Typography sx={{ textAlign: 'center' }}>
        <strong>{clientName}</strong> will be able to view your food logs and products, but not
        change them.
      </Typography>
      {isLocalhostOnly && (
        <Alert severity="warning" sx={{ width: '100%' }}>
          This app receives access on this computer. Approve only if you started this sign-in.
        </Alert>
      )}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', width: '100%' }}>
        <Button
          disabled={decisionSent}
          onClick={() => {
            void decide(false);
          }}
        >
          Deny
        </Button>
        <Button
          variant="contained"
          disabled={decisionSent}
          onClick={() => {
            void decide(true);
          }}
        >
          Approve
        </Button>
      </Stack>
    </Stack>
  );
};
