import { Box, Container, Paper, Stack } from '@mui/material';
import { type FC } from 'react';
import { McpConsent } from '@/features/mcpConsent';
import { AppName } from '@/shared/ui';

interface Props {
  consentRequest: string;
  redirect: (url: string) => void;
}

export const McpConsentPage: FC<Props> = ({ consentRequest, redirect }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      p: 3,
      bgcolor: theme => theme.palette.grey[100],
    }}
  >
    <Container maxWidth="sm" disableGutters>
      <Paper
        component={Stack}
        spacing={3}
        sx={{
          p: { xs: 3, sm: 4 },
          alignItems: 'center',
        }}
      >
        <AppName />
        <McpConsent consentRequest={consentRequest} redirect={redirect} />
      </Paper>
    </Container>
  </Box>
);
