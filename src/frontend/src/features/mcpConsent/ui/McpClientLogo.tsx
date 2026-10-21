import { Avatar, Box } from '@mui/material';
import { type FC, useState } from 'react';

const LOGO_SIZE = 64;

interface Props {
  clientName: string;
  logoUri: string | null;
}

export const McpClientLogo: FC<Props> = ({ clientName, logoUri }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const alt = `${clientName} logo`;

  if (logoUri === null || logoFailed) {
    return (
      <Avatar
        role="img"
        aria-label={alt}
        sx={{ width: LOGO_SIZE, height: LOGO_SIZE, fontSize: LOGO_SIZE / 2 }}
      >
        {Array.from(clientName).at(0)?.toUpperCase()}
      </Avatar>
    );
  }

  return (
    <Box
      component="img"
      src={logoUri}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        setLogoFailed(true);
      }}
      sx={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain' }}
    />
  );
};
