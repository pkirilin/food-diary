import { Container, styled } from '@mui/material';

interface Props {
  disablePaddingTop?: boolean;
}

export const PageContainer = styled(Container)<Props>(({ theme, disablePaddingTop }) => ({
  padding: `${disablePaddingTop ? 0 : theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)}`,

  [theme.breakpoints.up('sm')]: {
    padding: `${disablePaddingTop ? 0 : theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)}`,
  },
}));
