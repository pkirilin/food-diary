import { Container, styled } from '@mui/material';

export const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),

  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));
